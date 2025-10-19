/**
 * use-historical-sales.ts - Hook para Vendas Históricas SSoT v1.0.0
 *
 * @description
 * Hook React Query para criar vendas históricas sem afetar estoque.
 * Usa stored procedure create_historical_sale() via Supabase RPC.
 *
 * @features
 * - Criação de vendas com data customizada (backdating)
 * - NÃO afeta estoque de produtos
 * - Atualiza métricas do cliente automaticamente
 * - Validação completa com Zod schemas
 * - Cache invalidation automático
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Historical Sales Implementation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

/**
 * Schema de validação para item de venda histórica
 */
export const HistoricalSaleItemSchema = z.object({
  product_id: z.string().uuid('ID do produto inválido'),
  quantity: z.number().int().positive('Quantidade deve ser maior que zero'),
  unit_price: z.number().positive('Preço unitário deve ser maior que zero'),
  sale_type: z.enum(['unit', 'package']).default('unit'),
});

/**
 * Schema de validação para venda histórica
 */
export const HistoricalSaleSchema = z.object({
  customer_id: z.string().uuid('ID do cliente inválido'),
  user_id: z.string().uuid('ID do usuário inválido'),
  items: z.array(HistoricalSaleItemSchema).min(1, 'A venda deve ter pelo menos 1 item'),
  total_amount: z.number().positive('Valor total deve ser maior que zero'),
  payment_method: z.string().min(1, 'Forma de pagamento é obrigatória'),
  sale_date: z.string().datetime('Data da venda inválida'),
  notes: z.string().optional(),
  delivery: z.boolean().default(false),
  delivery_fee: z.number().nonnegative().default(0),
});

export type HistoricalSaleItem = z.infer<typeof HistoricalSaleItemSchema>;
export type HistoricalSaleInput = z.infer<typeof HistoricalSaleSchema>;

/**
 * Resposta da stored procedure
 */
export interface HistoricalSaleResult {
  success: boolean;
  sale_id?: string;
  customer_name?: string;
  items_count?: number;
  total_amount?: number;
  sale_date?: string;
  message?: string;
  warning?: string;
  error?: string;
  error_code?: string;
}

// ============================================================================
// HOOK: useCreateHistoricalSale
// ============================================================================

/**
 * Hook para criar vendas históricas sem afetar estoque
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateHistoricalSale();
 *
 * mutate({
 *   customer_id: '...',
 *   user_id: '...',
 *   items: [{ product_id: '...', quantity: 2, unit_price: 10.50 }],
 *   total_amount: 21.00,
 *   payment_method: 'Dinheiro',
 *   sale_date: '2025-08-13T18:47:00Z',
 *   delivery: true,
 *   delivery_fee: 7.00
 * });
 * ```
 */
export const useCreateHistoricalSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: HistoricalSaleInput): Promise<HistoricalSaleResult> => {
      // Validar input com Zod
      const validated = HistoricalSaleSchema.parse(input);

      // Chamar stored procedure via RPC
      const { data, error } = await supabase.rpc('create_historical_sale', {
        p_customer_id: validated.customer_id,
        p_user_id: validated.user_id,
        p_items: validated.items,
        p_total_amount: validated.total_amount,
        p_payment_method: validated.payment_method,
        p_sale_date: validated.sale_date,
        p_notes: validated.notes || null,
        p_delivery: validated.delivery,
        p_delivery_fee: validated.delivery_fee,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Verificar se a resposta indica sucesso
      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro ao criar venda histórica');
      }

      return data as HistoricalSaleResult;
    },

    onSuccess: (data, variables) => {
      // ✅ INVALIDAR CACHES - SSoT Simplificado
      // Apenas 1 linha necessária para métricas! (useCustomerMetrics = SSoT)
      queryClient.invalidateQueries({ queryKey: ['customer-metrics', variables.customer_id] });

      // Invalidar caches específicos que ainda não migraram para SSoT
      queryClient.invalidateQueries({ queryKey: ['customer', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer-purchases', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile-header-data', variables.customer_id] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });

      // Toast de sucesso
      toast.success('Venda histórica criada com sucesso!', {
        description: `${data.items_count} ${data.items_count === 1 ? 'item' : 'itens'} - R$ ${data.total_amount?.toFixed(2)}`,
        duration: 5000,
      });

      // Warning se existir
      if (data.warning) {
        toast.info(data.warning, { duration: 3000 });
      }
    },

    onError: (error: Error) => {
      console.error('Erro ao criar venda histórica:', error);

      toast.error('Erro ao criar venda histórica', {
        description: error.message,
        duration: 6000,
      });
    },
  });
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcula o total da venda baseado nos itens
 */
export const calculateTotalAmount = (items: HistoricalSaleItem[]): number => {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price);
  }, 0);
};

/**
 * Formata data para o formato esperado pela stored procedure
 */
export const formatSaleDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Valida se uma data é no passado (para vendas históricas)
 */
export const isHistoricalDate = (date: Date): boolean => {
  return date < new Date();
};
