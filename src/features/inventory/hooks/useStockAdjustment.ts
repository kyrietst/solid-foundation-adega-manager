/**
 * useStockAdjustment.ts - Hook para ajustes de estoque usando Single Source of Truth
 * Integra com a função adjust_variant_stock corrigida e usa invalidação de cache
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

interface StockAdjustmentData {
  variantId: string;
  variantType: 'unit' | 'package';
  adjustmentType: 'entrada' | 'saida' | 'ajuste';
  quantity?: number;
  newStock?: number;
  reason: string;
}

interface UseStockAdjustmentOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useStockAdjustment = (options?: UseStockAdjustmentOptions) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (adjustmentData: StockAdjustmentData) => {
      console.log('Iniciando ajuste de estoque:', adjustmentData);

      // Verificar autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Preparar parâmetros para a função adjust_variant_stock
      const params = {
        p_variant_id: adjustmentData.variantId,
        p_adjustment_type: adjustmentData.adjustmentType,
        p_reason: adjustmentData.reason,
        p_user_id: user.id
      };

      // Adicionar parâmetros específicos baseados no tipo de ajuste
      if (adjustmentData.adjustmentType === 'ajuste') {
        // Para ajuste direto, usar p_new_stock
        Object.assign(params, {
          p_new_stock: adjustmentData.newStock
        });
      } else {
        // Para entrada/saída, usar p_quantity
        Object.assign(params, {
          p_quantity: adjustmentData.quantity
        });
      }

      console.log('Parâmetros da função:', params);

      // Chamar função corrigida adjust_variant_stock
      const { data: result, error } = await supabase
        .rpc('adjust_variant_stock', params);

      if (error) {
        console.error('Erro na função adjust_variant_stock:', error);
        throw new Error(`Erro no ajuste de estoque: ${error.message}`);
      }

      console.log('Resultado do ajuste:', result);
      return result;
    },

    onSuccess: (data, variables) => {
      console.log('Ajuste realizado com sucesso:', data);

      // CORREÇÃO: Invalidar caches mais específicos
      queryClient.invalidateQueries({ queryKey: ['product-variants'] }); // Geral
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });

      // IMPORTANTE: Invalidar produto específico se soubermos o ID
      if (data?.product_id) {
        queryClient.invalidateQueries({
          queryKey: ['product-variants', data.product_id],
          exact: false
        });

        // Forçar refetch imediato do produto específico
        queryClient.refetchQueries({
          queryKey: ['product-variants', data.product_id],
          exact: false
        });
      }

      // Toast de sucesso
      toast({
        title: 'Estoque ajustado com sucesso!',
        description: `${data?.quantity_change > 0 ? 'Entrada' : 'Saída'} de ${Math.abs(data?.quantity_change || 0)} itens registrada.`,
      });

      // Callback personalizado
      options?.onSuccess?.(data);
    },

    onError: (error: Error) => {
      console.error('Erro no ajuste de estoque:', error);

      // Toast de erro
      toast({
        title: 'Erro ao ajustar estoque',
        description: error.message,
        variant: 'destructive',
      });

      // Callback personalizado
      options?.onError?.(error);
    },
  });
};

export default useStockAdjustment;