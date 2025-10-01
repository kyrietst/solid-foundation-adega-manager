/**
 * useCustomerTimeline.ts - Hook dedicado para Timeline de Atividades do Cliente
 *
 * @description
 * Hook SSoT v3.0.0 que centraliza TODAS as atividades do cliente:
 * - Vendas (sales)
 * - Interações manuais (customer_interactions)
 * - Eventos do sistema (customer_events)
 *
 * @features
 * - Consolidação de múltiplas fontes de dados
 * - Ordenação cronológica reversa (mais recente primeiro)
 * - Formatação padronizada para timeline
 * - Cache inteligente e invalidação automática
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Timeline Completa
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface TimelineActivity {
  id: string;
  type: 'sale' | 'interaction' | 'event';
  title: string;
  description: string;
  amount?: number;
  created_at: string;
  metadata?: {
    sale_id?: string;
    interaction_type?: string;
    event_source?: string;
  };
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useCustomerTimeline = (customerId: string) => {
  return useQuery({
    queryKey: ['customer-timeline', customerId],
    queryFn: async (): Promise<TimelineActivity[]> => {
      if (!customerId) return [];

      try {
        // Consolidar todas as atividades do cliente em paralelo
        const [salesResult, interactionsResult, eventsResult] = await Promise.allSettled([
          // 1. VENDAS
          supabase
            .from('sales')
            .select('id, total_amount, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }),

          // 2. INTERAÇÕES MANUAIS
          supabase
            .from('customer_interactions')
            .select('id, interaction_type, description, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false }),

          // 3. EVENTOS DO SISTEMA
          supabase
            .from('customer_events')
            .select('id, source, payload, created_at')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
        ]);

        const activities: TimelineActivity[] = [];

        // Processar VENDAS
        if (salesResult.status === 'fulfilled' && salesResult.value.data) {
          const sales = salesResult.value.data;
          sales.forEach((sale: any) => {
            activities.push({
              id: `sale-${sale.id}`,
              type: 'sale',
              title: 'Compra Realizada',
              description: `Compra realizada - R$ ${Number(sale.total_amount).toFixed(2)}`,
              amount: Number(sale.total_amount),
              created_at: sale.created_at,
              metadata: {
                sale_id: sale.id
              }
            });
          });
        }

        // Processar INTERAÇÕES
        if (interactionsResult.status === 'fulfilled' && interactionsResult.value.data) {
          const interactions = interactionsResult.value.data;
          interactions.forEach((interaction: any) => {
            activities.push({
              id: `interaction-${interaction.id}`,
              type: 'interaction',
              title: interaction.interaction_type,
              description: interaction.description,
              created_at: interaction.created_at,
              metadata: {
                interaction_type: interaction.interaction_type
              }
            });
          });
        }

        // Processar EVENTOS
        if (eventsResult.status === 'fulfilled' && eventsResult.value.data) {
          const events = eventsResult.value.data;
          events.forEach((event: any) => {
            const payload = event.payload || {};
            const description = payload.description || 'Evento registrado';

            activities.push({
              id: `event-${event.id}`,
              type: 'event',
              title: 'Evento do Sistema',
              description: description,
              created_at: event.created_at,
              metadata: {
                event_source: event.source
              }
            });
          });
        }

        // Ordenar todas as atividades por data (mais recente primeiro)
        const sortedActivities = activities.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Limitar a 20 atividades mais recentes para performance
        return sortedActivities.slice(0, 20);

      } catch (error) {
        console.error('❌ Erro ao buscar timeline do cliente:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
};

export default useCustomerTimeline;