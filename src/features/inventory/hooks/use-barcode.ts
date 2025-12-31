import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Removed useQuery (not used?)
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { transformToStockData } from '@/shared/hooks/business/useStockData'; // Only util import
import type { Product, BarcodeValidation } from '@/core/types/inventory.types';

export const useBarcode = () => {
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Busca inteligente de produto por código de barras via DB diretamente
  // Refatorado para não depender de useStockData (performance)

  const searchByBarcode = useCallback(async (barcode: string): Promise<{ product: Product; type: 'main' | 'package' } | null> => {
    if (!barcode || barcode.length < 8) {
      toast({
        title: "Código inválido",
        description: "O código de barras deve ter pelo menos 8 dígitos",
        variant: "destructive"
      });
      return null;
    }

    try {
      // 1. Busca Direta no Banco (Unitário)
      const { data: mainProducts } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .limit(1);

      if (mainProducts && mainProducts.length > 0) {
        // Encontrou no banco (unitário)
        const prod = transformToStockData(mainProducts[0]);
        setLastScannedCode(barcode);

        toast({ title: "✅ Produto encontrado", description: `${prod.name}`, variant: "default" });
        return { product: prod, type: 'main' };
      }

      // 2. Busca Direta no Banco (Pacote)
      const { data: pkgProducts } = await supabase
        .from('products')
        .select('*')
        .eq('package_barcode', barcode)
        .limit(1);

      if (pkgProducts && pkgProducts.length > 0) {
        // Encontrou no banco (pacote)
        const prod = transformToStockData(pkgProducts[0]);
        setLastScannedCode(barcode);

        toast({ title: "📦 Produto encontrado", description: `${prod.name}`, variant: "default" });
        return { product: prod, type: 'package' };
      }

      // Não encontrado
      toast({
        title: "Produto não encontrado",
        description: `Nenhum produto encontrado com o código ${barcode}`,
        variant: "destructive"
      });
      return null;

    } catch (error) {
      console.error('[DEBUG] useBarcode - Erro ao buscar produto:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar o produto.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Validação de código de barras
  const validateBarcode = useCallback((barcode: string): BarcodeValidation => {
    // Remove espaços e caracteres não numéricos
    const cleanCode = barcode.replace(/\D/g, '');

    // Valida comprimento (8-14 dígitos conforme constraint do banco)
    if (cleanCode.length < 8 || cleanCode.length > 14) {
      return {
        isValid: false,
        error: 'Código deve ter entre 8 e 14 dígitos numéricos'
      };
    }

    let format: BarcodeValidation['format'] = 'UNKNOWN';

    // Determina o formato baseado no comprimento
    switch (cleanCode.length) {
      case 8:
        format = 'EAN-8';
        break;
      case 9:
      case 10:
      case 11:
        format = 'CUSTOM';
        break;
      case 12:
        format = 'UPC-A';
        break;
      case 13:
        format = 'EAN-13';
        break;
      case 14:
        format = 'CODE-128';
        break;
      default:
        format = 'CUSTOM';
        break;
    }

    // Validação básica do dígito verificador para EAN-13
    if (cleanCode.length === 13) {
      let sum = 0;
      for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCode[i]) * (i % 2 === 0 ? 1 : 3);
      }
      const checkDigit = (10 - (sum % 10)) % 10;
      if (checkDigit !== parseInt(cleanCode[12])) {
        return {
          isValid: false,
          format,
          error: 'Dígito verificador inválido para EAN-13'
        };
      }
    }

    return {
      isValid: true,
      format
    };
  }, []);

  // Mutation para atualizar código de barras de um produto
  const updateProductBarcode = useMutation({
    mutationFn: async ({ productId, barcode }: { productId: string; barcode: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ barcode })
        .eq('id', productId)
        .select();

      if (error) throw error;
      return data?.[0];
    },
    onSuccess: (data) => {
      // Invalidar múltiplas query keys para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });

      toast({
        title: "Código atualizado",
        description: `Código de barras do produto ${data.name} atualizado com sucesso`,
      });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { code?: string; message?: string }).code === '23505'
        ? 'Este código de barras já está em uso por outro produto'
        : (error as { message?: string }).message || "Erro ao atualizar código de barras";

      toast({
        title: "Erro ao atualizar",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  return {
    searchByBarcode,
    validateBarcode,
    updateProductBarcode: updateProductBarcode.mutate,
    isUpdating: updateProductBarcode.isPending,
    lastScannedCode,
    clearLastScanned: () => setLastScannedCode(null)
  };
};

export default useBarcode;