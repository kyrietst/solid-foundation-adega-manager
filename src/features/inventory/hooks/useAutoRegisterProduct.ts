/**
 * Hook para Auto-Registro de Produtos por Código de Barras
 * Detecta códigos não encontrados e facilita cadastro automático
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useBarcode } from './use-barcode';
import type { Product } from '@/types/inventory.types';

export interface AutoRegisterData {
  scannedBarcode: string;
  barcodeType: 'main' | 'package';
  suggestedName?: string;
  suggestedCategory?: string;
  confidence: number;
  source: 'manual' | 'api_lookup';
}

export interface ProductRegistrationData {
  name: string;
  category: string;
  barcode?: string;
  package_barcode?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  minimum_stock: number;
  supplier?: string;
  has_package_tracking?: boolean;
  has_unit_tracking?: boolean;
  package_units?: number;
}

export const useAutoRegisterProduct = () => {
  const [autoRegisterData, setAutoRegisterData] = useState<AutoRegisterData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { searchByBarcode, validateBarcode } = useBarcode();

  // Busca inteligente de código não encontrado
  const analyzeUnknownBarcode = useCallback(async (scannedCode: string): Promise<AutoRegisterData> => {
    const validation = validateBarcode(scannedCode);
    
    if (!validation.isValid) {
      throw new Error('Código de barras inválido');
    }

    // Tentar buscar o produto primeiro
    const existingProductResult = await searchByBarcode(scannedCode);
    if (existingProductResult) {
      throw new Error('Produto já existe no sistema');
    }

    // Determinar tipo de código baseado no padrão
    const barcodeType: 'main' | 'package' = 'main'; // Por padrão, assumir código principal
    
    // TODO: Futuramente integrar com API externa para sugerir dados
    const autoRegisterData: AutoRegisterData = {
      scannedBarcode: scannedCode,
      barcodeType,
      confidence: 50, // Baixa confiança sem API externa
      source: 'manual'
    };

    return autoRegisterData;
  }, [validateBarcode, searchByBarcode]);

  // Mutation para registrar novo produto
  const registerProduct = useMutation({
    mutationFn: async (productData: ProductRegistrationData): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          category: productData.category,
          barcode: productData.barcode || null,
          package_barcode: productData.package_barcode || null,
          price: productData.price,
          cost_price: productData.cost_price || null,
          stock_quantity: productData.stock_quantity,
          minimum_stock: productData.minimum_stock,
          supplier: productData.supplier || null,
          has_package_tracking: productData.has_package_tracking || false,
          has_unit_tracking: productData.has_unit_tracking || true,
          package_units: productData.package_units || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar produto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      toast({
        title: "🎉 Produto cadastrado com sucesso!",
        description: `${newProduct.name} foi adicionado ao sistema com código ${autoRegisterData?.scannedBarcode}`,
        variant: "default"
      });

      // Limpar estado
      setAutoRegisterData(null);
      setIsModalOpen(false);
    },
    onError: (error: unknown) => {
      console.error('Erro na mutação:', error);
      
      let errorMessage = "Erro desconhecido ao cadastrar produto";
      
      if (error && typeof error === 'object' && 'code' in error) {
        const supabaseError = error as { code?: string; message?: string };
        
        switch (supabaseError.code) {
          case '23505': // Unique violation
            if (supabaseError.message?.includes('barcode')) {
              errorMessage = 'Este código de barras já está em uso por outro produto';
            } else {
              errorMessage = 'Já existe um produto com estes dados';
            }
            break;
          case '23502': // Not null violation
            errorMessage = 'Alguns campos obrigatórios não foram preenchidos';
            break;
          case '23514': // Check violation
            errorMessage = 'Dados inválidos. Verifique preços e quantidades';
            break;
          default:
            errorMessage = supabaseError.message || errorMessage;
        }
      }

      toast({
        title: "❌ Erro ao cadastrar produto",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Função principal para iniciar processo de auto-registro
  const initiateAutoRegister = useCallback(async (scannedCode: string) => {
    try {
      const autoData = await analyzeUnknownBarcode(scannedCode);
      setAutoRegisterData(autoData);
      setIsModalOpen(true);

      toast({
        title: "📝 Produto não encontrado",
        description: "Deseja cadastrar este produto no sistema?",
        variant: "default"
      });

    } catch (error) {
      const errorMessage = (error as Error).message || "Erro ao analisar código de barras";
      
      // Se produto já existe, não é um erro crítico
      if (errorMessage.includes('já existe')) {
        toast({
          title: "✅ Produto encontrado",
          description: "Este produto já está cadastrado no sistema",
          variant: "default"
        });
      } else {
        toast({
          title: "❌ Erro na análise",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  }, [analyzeUnknownBarcode, toast]);

  // Preparar dados do formulário baseado no código escaneado
  const prepareFormData = useCallback((): Partial<ProductRegistrationData> => {
    if (!autoRegisterData) return {};

    const formData: Partial<ProductRegistrationData> = {
      stock_quantity: 0,
      minimum_stock: 1,
      price: 0,
      has_unit_tracking: true,
      has_package_tracking: false
    };

    // Definir qual campo de barcode preencher
    switch (autoRegisterData.barcodeType) {
      case 'main':
        formData.barcode = autoRegisterData.scannedBarcode;
        break;
      case 'package':
        formData.package_barcode = autoRegisterData.scannedBarcode;
        formData.has_package_tracking = true;
        break;
    }

    // Adicionar dados sugeridos se disponíveis
    if (autoRegisterData.suggestedName) {
      formData.name = autoRegisterData.suggestedName;
    }
    if (autoRegisterData.suggestedCategory) {
      formData.category = autoRegisterData.suggestedCategory;
    }

    return formData;
  }, [autoRegisterData]);

  // Cancelar processo de auto-registro
  const cancelAutoRegister = useCallback(() => {
    setAutoRegisterData(null);
    setIsModalOpen(false);
    
    toast({
      title: "🔄 Cadastro cancelado",
      description: "O produto não foi cadastrado no sistema",
      variant: "default"
    });
  }, [toast]);

  return {
    // Estado
    autoRegisterData,
    isModalOpen,
    isRegistering: registerProduct.isPending,
    
    // Ações
    initiateAutoRegister,
    registerProduct: registerProduct.mutate,
    cancelAutoRegister,
    prepareFormData,
    
    // Controle do modal
    setIsModalOpen,
    
    // Utilitários
    canRegister: !!autoRegisterData && !registerProduct.isPending,
    
    // Estatísticas
    getRegistrationStats: () => ({
      hasBarcode: !!autoRegisterData?.scannedBarcode,
      barcodeType: autoRegisterData?.barcodeType,
      confidence: autoRegisterData?.confidence || 0,
      hasExternalData: autoRegisterData?.source === 'api_lookup'
    })
  };
};

export default useAutoRegisterProduct;