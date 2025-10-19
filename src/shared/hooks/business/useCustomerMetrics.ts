/**
 * useCustomerMetrics.ts - Hook SSoT Centralizado de Métricas do Cliente
 *
 * @description
 * SINGLE SOURCE OF TRUTH para todas as métricas calculadas do cliente.
 * Elimina duplicação de código e queries SQL, centraliza cálculos em um único lugar.
 *
 * @features
 * - Único hook que busca e calcula métricas do cliente
 * - Query key unificada para cache compartilhado
 * - Todos os outros hooks consomem deste hook
 * - Performance otimizada (1 query SQL em vez de 4+)
 * - Cache inteligente (5min stale time)
 *
 * @usage
 * ```typescript
 * const { data: metrics, isLoading } = useCustomerMetrics(customerId);
 * const totalPurchases = metrics?.total_purchases || 0;
 * ```
 *
 * @author Adega Manager Team
 * @version 1.0.0 - SSoT Metrics Centralization
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerMetrics {
  // Métricas de compras
  total_purchases: number;
  total_spent: number;
  lifetime_value_calculated: number;

  // Métricas de ticket
  avg_purchase_value: number;
  avg_items_per_purchase: number;
  total_products_bought: number;

  // Métricas de recência
  last_purchase_real?: string;
  days_since_last_purchase?: number;

  // Métricas de frequência
  purchase_frequency: number;

  // Scores
  loyalty_score: number;

  // Status de sincronização
  data_sync_status: {
    ltv_synced: boolean;
    dates_synced: boolean;
    preferences_synced: boolean;
  };
}

// ============================================================================
// HOOK PRINCIPAL - SINGLE SOURCE OF TRUTH
// ============================================================================

/**
 * Hook centralizado que calcula TODAS as métricas do cliente
 *
 * ✅ USE ESTE HOOK em vez de calcular métricas manualmente
 * ✅ Todos os componentes/hooks devem consumir daqui
 * ❌ NÃO crie queries duplicadas de sales para calcular métricas
 */
export const useCustomerMetrics = (customerId: string) => {
  return useQuery<CustomerMetrics | null>({
    queryKey: ['customer-metrics', customerId],
    queryFn: async (): Promise<CustomerMetrics | null> => {
      if (!customerId) return null;

      try {
        // ✅ ÚNICA query SQL que busca todas as vendas do cliente
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            created_at,
            sale_items (
              quantity,
              unit_price
            )
          `)
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('❌ Erro ao buscar vendas para métricas:', salesError);
          throw salesError;
        }

        if (!sales || sales.length === 0) {
          // Cliente sem compras - retornar métricas zeradas
          return {
            total_purchases: 0,
            total_spent: 0,
            lifetime_value_calculated: 0,
            avg_purchase_value: 0,
            avg_items_per_purchase: 0,
            total_products_bought: 0,
            last_purchase_real: undefined,
            days_since_last_purchase: undefined,
            purchase_frequency: 0,
            loyalty_score: 0,
            data_sync_status: {
              ltv_synced: true,
              dates_synced: true,
              preferences_synced: true,
            },
          };
        }

        // ============================================================================
        // CÁLCULOS CENTRALIZADOS - SINGLE SOURCE OF TRUTH
        // ============================================================================

        // 1. Total de compras
        const totalPurchases = sales.length;

        // 2. Total gasto (lifetime value)
        const totalSpent = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);

        // 3. Ticket médio
        const avgPurchaseValue = totalSpent / totalPurchases;

        // 4. Última compra (data mais recente)
        const lastPurchaseReal = sales[0]?.created_at;

        // 5. Dias desde última compra
        let daysSinceLastPurchase: number | undefined = undefined;
        if (lastPurchaseReal) {
          const lastPurchaseDate = new Date(lastPurchaseReal);
          const now = new Date();
          const diffMs = now.getTime() - lastPurchaseDate.getTime();
          daysSinceLastPurchase = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }

        // 6. Total de itens comprados (soma de quantities)
        let totalProductsBought = 0;
        let totalItemsCount = 0;

        sales.forEach(sale => {
          if (sale.sale_items && Array.isArray(sale.sale_items)) {
            sale.sale_items.forEach((item: any) => {
              totalProductsBought += item.quantity || 0;
              totalItemsCount += 1;
            });
          }
        });

        // 7. Média de itens por compra
        const avgItemsPerPurchase = totalItemsCount / totalPurchases;

        // 8. Frequência de compra (compras por mês)
        let purchaseFrequency = 0;
        if (sales.length >= 2) {
          const firstPurchaseDate = new Date(sales[sales.length - 1].created_at);
          const lastPurchaseDate = new Date(sales[0].created_at);
          const daysBetween = (lastPurchaseDate.getTime() - firstPurchaseDate.getTime()) / (1000 * 60 * 60 * 24);
          const monthsBetween = daysBetween / 30;
          if (monthsBetween > 0) {
            purchaseFrequency = totalPurchases / monthsBetween;
          }
        }

        // 9. Loyalty Score (0-100)
        // Baseado em: frequência de compra, valor gasto, recência
        let loyaltyScore = 0;

        // Componente 1: Recência (max 40 pontos)
        if (daysSinceLastPurchase !== undefined) {
          if (daysSinceLastPurchase <= 7) loyaltyScore += 40;
          else if (daysSinceLastPurchase <= 30) loyaltyScore += 30;
          else if (daysSinceLastPurchase <= 90) loyaltyScore += 20;
          else loyaltyScore += 10;
        }

        // Componente 2: Frequência (max 30 pontos)
        if (purchaseFrequency >= 4) loyaltyScore += 30; // 4+ compras/mês
        else if (purchaseFrequency >= 2) loyaltyScore += 20; // 2-3 compras/mês
        else if (purchaseFrequency >= 1) loyaltyScore += 10; // 1 compra/mês
        else loyaltyScore += 5;

        // Componente 3: Valor (max 30 pontos)
        if (totalSpent >= 1000) loyaltyScore += 30;
        else if (totalSpent >= 500) loyaltyScore += 20;
        else if (totalSpent >= 200) loyaltyScore += 10;
        else loyaltyScore += 5;

        // ============================================================================
        // RETORNAR MÉTRICAS CALCULADAS
        // ============================================================================

        return {
          total_purchases: totalPurchases,
          total_spent: totalSpent,
          lifetime_value_calculated: totalSpent,
          avg_purchase_value: avgPurchaseValue,
          avg_items_per_purchase: avgItemsPerPurchase,
          total_products_bought: totalProductsBought,
          last_purchase_real: lastPurchaseReal,
          days_since_last_purchase: daysSinceLastPurchase,
          purchase_frequency: purchaseFrequency,
          loyalty_score: loyaltyScore,
          data_sync_status: {
            ltv_synced: true,
            dates_synced: true,
            preferences_synced: true,
          },
        };

      } catch (error) {
        console.error('❌ Erro crítico ao calcular métricas do cliente:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5min - Métricas são relativamente estáveis
    refetchOnWindowFocus: false, // Não refetch ao focar janela
    refetchOnMount: false, // Usar cache se disponível
  });
};

// ============================================================================
// EXPORTS
// ============================================================================

export type { CustomerMetrics };
