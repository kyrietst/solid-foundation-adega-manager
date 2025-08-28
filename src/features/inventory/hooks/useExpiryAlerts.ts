/**
 * Hook para gerenciar alertas de produtos próximos ao vencimento
 * Identifica produtos que estão vencendo em diferentes períodos
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface ExpiryAlert {
  id: string;
  name: string;
  category: string;
  expiry_date: string;
  days_until_expiry: number;
  stock_quantity: number;
  urgency: 'critical' | 'warning' | 'info';
}

interface UseExpiryAlertsOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useExpiryAlerts = (options: UseExpiryAlertsOptions = {}) => {
  const { enabled = true, refetchInterval = 60000 } = options; // Refetch a cada minuto

  const { data: expiryAlerts, isLoading, error } = useQuery({
    queryKey: ['expiry-alerts'],
    queryFn: async (): Promise<ExpiryAlert[]> => {
      console.log('🔍 Verificando produtos próximos ao vencimento...');

      // Buscar produtos com controle de validade ativo
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, category, expiry_date, stock_quantity')
        .eq('has_expiry_tracking', true)
        .not('expiry_date', 'is', null)
        .gt('stock_quantity', 0); // Apenas produtos em estoque

      if (error) {
        console.error('❌ Erro ao buscar produtos com validade:', error);
        throw error;
      }

      if (!products || products.length === 0) {
        console.log('ℹ️ Nenhum produto com controle de validade encontrado');
        return [];
      }

      // Calcular dias até vencimento e classificar por urgência
      const today = new Date();
      const alerts: ExpiryAlert[] = [];

      products.forEach((product) => {
        if (!product.expiry_date) return;

        const expiryDate = new Date(product.expiry_date);
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Só alertar para produtos que vencem em até 30 dias
        if (daysUntilExpiry <= 30) {
          let urgency: 'critical' | 'warning' | 'info' = 'info';

          if (daysUntilExpiry <= 3) {
            urgency = 'critical'; // Vence em 3 dias ou menos
          } else if (daysUntilExpiry <= 7) {
            urgency = 'warning'; // Vence em até 1 semana
          } else if (daysUntilExpiry <= 30) {
            urgency = 'info'; // Vence em até 1 mês
          }

          alerts.push({
            id: product.id,
            name: product.name,
            category: product.category,
            expiry_date: product.expiry_date,
            days_until_expiry: daysUntilExpiry,
            stock_quantity: product.stock_quantity,
            urgency,
          });
        }
      });

      // Ordenar por urgência e proximidade do vencimento
      const sortedAlerts = alerts.sort((a, b) => {
        // Primeiro por urgência
        const urgencyOrder = { critical: 0, warning: 1, info: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        // Depois por dias até vencimento (menor primeiro)
        return a.days_until_expiry - b.days_until_expiry;
      });

      console.log(`📅 ${sortedAlerts.length} produtos próximos ao vencimento encontrados`);
      return sortedAlerts;
    },
    enabled,
    staleTime: 30000, // 30 segundos
    refetchInterval,
    retry: 2,
  });

  // Estatísticas dos alertas
  const alertStats = {
    total: expiryAlerts?.length || 0,
    critical: expiryAlerts?.filter(alert => alert.urgency === 'critical').length || 0,
    warning: expiryAlerts?.filter(alert => alert.urgency === 'warning').length || 0,
    info: expiryAlerts?.filter(alert => alert.urgency === 'info').length || 0,
  };

  // Função para formatar texto de alerta
  const getAlertText = (alert: ExpiryAlert): string => {
    if (alert.days_until_expiry <= 0) {
      return `Venceu há ${Math.abs(alert.days_until_expiry)} dia(s)`;
    } else if (alert.days_until_expiry === 1) {
      return 'Vence amanhã';
    } else {
      return `Vence em ${alert.days_until_expiry} dia(s)`;
    }
  };

  // Função para obter cor do alerta
  const getAlertColor = (urgency: ExpiryAlert['urgency']): string => {
    switch (urgency) {
      case 'critical': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return {
    expiryAlerts: expiryAlerts || [],
    alertStats,
    isLoading,
    error,
    getAlertText,
    getAlertColor,
  };
};

export type { UseExpiryAlertsOptions };