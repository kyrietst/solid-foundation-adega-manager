import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import type { Product, BarcodeValidation } from '@/types/inventory.types';

export const useBarcode = () => {
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Busca inteligente de produto por código de barras (principal ou pacote)
  const searchByBarcode = useCallback(async (barcode: string): Promise<{ product: Product; type: 'main' | 'package' } | null> => {
    if (!barcode || barcode.length < 8) {
      toast({
        title: "Código inválido",
        description: "O código de barras deve ter pelo menos 8 dígitos",
        variant: "destructive"
      });
      return null;
    }

    console.log('[DEBUG] useBarcode - Iniciando busca por código:', barcode);

    try {
      // Buscar por código principal primeiro
      const { data: mainProducts, error: mainError } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode);
      
      const mainProduct = mainProducts?.[0] || null;

      console.log('[DEBUG] useBarcode - Busca por barcode principal:', {
        found: !!mainProduct,
        error: mainError,
        productName: mainProduct?.name,
        stockQuantity: mainProduct?.stock_quantity
      });

      if (mainProduct && !mainError) {
        setLastScannedCode(barcode);
        
        const hasPackage = !!mainProduct.package_barcode;
        const typeLabel = hasPackage 
          ? 'código da unidade' 
          : 'código principal';
        
        console.log('[DEBUG] useBarcode - Produto encontrado por barcode principal, retornando:', {
          productId: mainProduct.id,
          productName: mainProduct.name,
          stockQuantity: mainProduct.stock_quantity,
          hasPackage: hasPackage,
          type: 'main'
        });
        
        toast({
          title: "✅ Produto encontrado",
          description: `${mainProduct.name} - ${typeLabel}`,
          variant: "default"
        });

        return { product: mainProduct, type: 'main' };
      }

      // Se não encontrou por código principal, buscar por código de pacote
      const { data: packageProducts, error: packageError } = await supabase
        .from('products')
        .select('*')
        .eq('package_barcode', barcode);
      
      const packageProduct = packageProducts?.[0] || null;

      console.log('[DEBUG] useBarcode - Busca por package_barcode:', {
        found: !!packageProduct,
        error: packageError,
        productName: packageProduct?.name,
        stockQuantity: packageProduct?.stock_quantity
      });

      if (packageProduct && !packageError) {
        setLastScannedCode(barcode);
        
        console.log('[DEBUG] useBarcode - Produto encontrado por package_barcode, retornando:', {
          productId: packageProduct.id,
          productName: packageProduct.name,
          stockQuantity: packageProduct.stock_quantity,
          packageUnits: packageProduct.package_units,
          type: 'package'
        });
        
        toast({
          title: "📦 Produto encontrado",
          description: `${packageProduct.name} - código do fardo (${packageProduct.package_units || 1} unidades)`,
          variant: "default"
        });

        return { product: packageProduct, type: 'package' };
      }

      // Não encontrado
      console.log('[DEBUG] useBarcode - Nenhum produto encontrado com código:', barcode);
      toast({
        title: "Produto não encontrado",
        description: `Nenhum produto encontrado com o código ${barcode}`,
        variant: "destructive"
      });
      return null;

    } catch (error) {
      console.error('[DEBUG] useBarcode - Erro ao buscar produto por código de barras:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar o produto. Tente novamente.",
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
      console.log('[DEBUG] useBarcode - Cache invalidado após atualizar código do produto:', data.name);
      
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