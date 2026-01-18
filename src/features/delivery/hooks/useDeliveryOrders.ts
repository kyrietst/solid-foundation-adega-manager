/**
 * @fileoverview Hook para buscar vendas com delivery_type='delivery'
 * Integra dados de vendas, clientes e rastreamento de entrega
 * 
 * @author Adega Manager Team
 * @version 1.1.0 - Realtime & Type Hygiene
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { DeliveryOrder, DeliveryMetrics } from '@/features/delivery/types';

/**
 * Hook para buscar pedidos de delivery com filtros
 */
export const useDeliveryOrders = (params?: {
  status?: string;
  date?: Date;
  limit?: number;
  deliveryPersonId?: string;
  createdAfter?: Date;
}) => {
  const queryClient = useQueryClient();

  // ✅ REALTIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase
      .channel('delivery-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'sales',
          // filter: 'delivery=eq.true' // Escuta apenas deliveries (Boolean Check)
          filter: 'delivery=eq.true'
        },
        (payload) => {
          console.log('🔔 Alteração de Delivery detectada:', payload.eventType);

          // Invalida cache para forçar recarregamento imediato
          queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
          queryClient.invalidateQueries({ queryKey: ['delivery-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['delivery-orders', params],
    queryFn: async (): Promise<DeliveryOrder[]> => {

      try {
        // Query base para vendas de delivery
        let query = supabase
          .from('sales')
          .select(`
            id,
            customer_id,
            total_amount,
            delivery_fee,
            final_amount,
            delivery_status,
            delivery_address,
            delivery_instructions,
            estimated_delivery_time,
            delivery_started_at,
            delivery_completed_at,
            delivery_person_id,
            delivery_zone_id,
            created_at,
            updated_at,
            customers (
              id,
              name,
              phone
            ),
            delivery_person:profiles!delivery_person_id (
              id,
              name
            ),
            sale_items (
              id,
              product_id,
              quantity,
              unit_price,
              products (
                name
              )
            ),
            delivery_tracking (
              id,
              status,
              notes,
              created_at,
              created_by,
              profiles:created_by (
                name
              )
            )
          `)
          // .eq('delivery_type', 'delivery') // LEGACY: Removido em favor da flag booleana
          .eq('delivery', true)
          .order('created_at', { ascending: false });

        // Aplicar filtros
        if (params?.status) {
          query = query.eq('delivery_status', params.status);
        }

        if (params?.deliveryPersonId) {
          query = query.eq('delivery_person_id', params.deliveryPersonId);
        }

        if (params?.date) {
          const startDate = new Date(params.date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(params.date);
          endDate.setHours(23, 59, 59, 999);

          query = query
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString());
        }

        if (params?.limit) {
          query = query.limit(params.limit);
        }

        if (params?.createdAfter) {
          query = query.gte('created_at', params.createdAfter.toISOString());
        }

        const { data: salesData, error } = await query;

        if (error) {
          console.error('❌ Erro ao buscar pedidos de delivery:', error);
          throw error;
        }

        if (!salesData || salesData.length === 0) {
          return [];
        }

        // Mapear dados para o formato esperado
        const deliveryOrders: DeliveryOrder[] = salesData.map((sale: any) => ({
          id: sale.id,
          customer: sale.customers ? {
            id: sale.customers.id,
            name: sale.customers.name,
            phone: sale.customers.phone
          } : null,
          total_amount: parseFloat(sale.total_amount) || 0,
          delivery_fee: parseFloat(sale.delivery_fee) || 0,
          discount_amount: parseFloat(sale.discount_amount) || 0,
          final_amount: parseFloat(sale.final_amount) || 0,
          delivery_status: sale.delivery_status || 'pending',
          delivery_address: sale.delivery_address,
          delivery_instructions: sale.delivery_instructions,
          estimated_delivery_time: sale.estimated_delivery_time,
          delivery_started_at: sale.delivery_started_at,
          delivery_completed_at: sale.delivery_completed_at,
          delivery_person: sale.delivery_person ? {
            id: sale.delivery_person.id,
            name: sale.delivery_person.name
          } : null,
          delivery_zone: sale.delivery_zone ? {
            id: sale.delivery_zone.id,
            name: sale.delivery_zone.name
          } : null,
          items: (sale.sale_items || []).map((item: any) => ({
            id: item.id,
            product_name: item.products?.name || 'Produto não encontrado',
            quantity: item.quantity,
            unit_price: parseFloat(item.unit_price),
            subtotal: item.quantity * parseFloat(item.unit_price)
          })),
          tracking: (sale.delivery_tracking || [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((track: any) => ({
              id: track.id,
              status: track.status,
              notes: track.notes || '',
              created_at: track.created_at,
              created_by_name: track.profiles?.name || 'Sistema'
            })),
          created_at: sale.created_at,
          updated_at: sale.updated_at
        }));

        return deliveryOrders;

      } catch (error) {
        console.error('❌ Erro crítico ao buscar pedidos de delivery:', error);
        throw error;
      }
    },
    // Removendo polling agressivo em favor do Realtime, mantendo staleTime curto para navegação
    staleTime: 1000 * 30,
  });
};

// Interface para o retorno raw da RPC (snake_case do banco)
interface DeliveryMetricsRaw {
  total_deliveries: number;
  total_delivery_revenue: number;
  total_delivery_fees: number;
  avg_delivery_time_minutes: number;
  on_time_rate: number;
  avg_delivery_ticket: number;
}

/**
 * Hook para buscar métricas de delivery
 * Usa RPC otimizada do banco para cálculos (SSoT)
 */
export const useDeliveryMetrics = (period: number = 7) => {
  return useQuery({
    queryKey: ['delivery-metrics', period],
    queryFn: async (): Promise<DeliveryMetrics> => {

      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - period);

        // Usar RPC otimizada para métricas (SSoT)
        const { data: rpcResponse, error: rpcError } = await supabase
          .rpc('get_delivery_metrics' as any, {
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString()
          })
          .single();

        if (rpcError) {
          console.error('❌ Erro ao buscar métricas via RPC:', rpcError);
          throw rpcError;
        }

        // Cast seguro para a interface definida
        const rpcData = rpcResponse as unknown as DeliveryMetricsRaw;

        // Buscar contagens por status (RPC não retorna isso)
        const { data: statusCounts } = await supabase
          .from('sales')
          .select('delivery_status')
          // .eq('delivery_type', 'delivery')
          .eq('delivery', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString());

        const counts = (statusCounts || []).reduce((acc, sale) => {
          const status = sale.delivery_status || 'pending';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);


        return {
          totalOrders: Number(rpcData?.total_deliveries || 0),
          pendingOrders: counts.pending || 0,
          inTransitOrders: counts.out_for_delivery || 0,
          deliveredOrders: counts.delivered || 0,
          cancelledOrders: counts.cancelled || 0,
          totalRevenue: Number(rpcData?.total_delivery_revenue || 0),
          totalDeliveryFees: Number(rpcData?.total_delivery_fees || 0),
          avgDeliveryTime: Number(rpcData?.avg_delivery_time_minutes || 0),
          onTimeRate: Number(rpcData?.on_time_rate || 0),
          avgOrderValue: Number(rpcData?.avg_delivery_ticket || 0),
          avgTicketWithDelivery: Number(rpcData?.avg_delivery_ticket || 0),
          deliveryFeeRevenue: Number(rpcData?.total_delivery_fees || 0),
          revenueGrowthRate: 0, // Calculado separadamente se necessário
          topZoneRevenue: null // Calculado separadamente se necessário
        };

      } catch (error) {
        console.error('❌ Erro ao buscar métricas de delivery:', error);
        throw error;
      }
    },
    // Metrics também atualizam via invalidação do Realtime acima
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para atualizar status de delivery
 */
export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      saleId,
      newStatus,
      notes,
      deliveryPersonId
    }: {
      saleId: string;
      newStatus: string;
      notes?: string;
      deliveryPersonId?: string;
    }) => {

      // Usar stored procedure para atualização com tracking
      const { data, error } = await supabase.rpc('update_delivery_status' as any, {
        p_sale_id: saleId,
        p_new_status: newStatus,
        p_notes: notes || `Status alterado para ${newStatus}`
      });

      if (error) {
        console.error('❌ Erro ao atualizar status de delivery:', error);
        throw error;
      }

      // Atualizar entregador se fornecido
      if (deliveryPersonId) {
        await supabase
          .from('sales')
          .update({ delivery_person_id: deliveryPersonId })
          .eq('id', saleId);
      }

      return { saleId, newStatus, data };
    },
    onMutate: async ({ saleId, newStatus }) => {
      // Cancelar queries pendentes para evitar conflitos
      await queryClient.cancelQueries({ queryKey: ['delivery-orders'] });

      // Snapshot do estado anterior (precisamos pegar de todas as queries ativas)
      // Simplificação: vamos snapshotar apenas a query principal sem filtros ou tentar pegar todas
      const previousDeliveries = queryClient.getQueriesData({ queryKey: ['delivery-orders'] });

      // Atualização otimista em TODAS as queries de delivery que contêm este pedido
      queryClient.setQueriesData({ queryKey: ['delivery-orders'] }, (old: any) => {
        if (!old || !Array.isArray(old)) return old;

        return old.map((delivery: any) =>
          delivery.id === saleId
            ? {
              ...delivery,
              delivery_status: newStatus,
              updated_at: new Date().toISOString()
            }
            : delivery
        );
      });

      // Retornar snapshot para rollback
      return { previousDeliveries };
    },
    onSuccess: (data, variables) => {

      // Invalidação específica para garantir dados frescos
      queryClient.invalidateQueries({
        queryKey: ['delivery-orders'],
        exact: false
      });

      queryClient.invalidateQueries({
        queryKey: ['delivery-metrics'],
        exact: false
      });

      // ✅ Invalidar dashboard para sincronização imediata após conclusão de delivery
      queryClient.invalidateQueries({
        queryKey: ['dashboard'],
        exact: false
      });

      queryClient.invalidateQueries({
        queryKey: ['delivery-vs-instore-dashboard'],
        exact: false
      });

      // Invalidar queries relacionadas apenas após 500ms para permitir UI atualizar
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        queryClient.invalidateQueries({ queryKey: ['delivery-analytics-kpis'] });
      }, 500);

      toast({
        title: "Status atualizado!",
        description: `Status alterado para ${variables.newStatus} com sucesso.`,
      });
    },
    onError: (error: any, variables, context) => {
      console.error('❌ Erro ao atualizar status:', error);

      // Rollback em caso de erro
      if (context?.previousDeliveries) {
        context.previousDeliveries.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }

      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
        duration: 5000 // Toasts de erro devem durar mais
      });
    },
    onSettled: () => {
      // Sempre refetch após mutação (success ou error)
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });
};

export default useDeliveryOrders;