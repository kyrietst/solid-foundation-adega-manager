/**
 * @fileoverview Hook para buscar vendas com delivery_type='delivery'
 * Integra dados de vendas, clientes e rastreamento de entrega
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface DeliveryOrder {
  id: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
  } | null;
  total_amount: number;
  delivery_fee: number;
  final_amount: number;
  delivery_status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  delivery_address: any;
  delivery_instructions?: string;
  estimated_delivery_time?: string;
  delivery_started_at?: string;
  delivery_completed_at?: string;
  delivery_person?: {
    id: string;
    name: string;
  } | null;
  delivery_zone?: {
    id: string;
    name: string;
  } | null;
  items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  tracking: Array<{
    id: string;
    status: string;
    notes: string;
    created_at: string;
    created_by_name?: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface DeliveryMetrics {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalDeliveryFees: number;
  avgDeliveryTime: number;
  onTimeRate: number;
  // Novas métricas financeiras
  avgOrderValue: number;
  avgTicketWithDelivery: number;
  deliveryFeeRevenue: number;
  revenueGrowthRate: number;
  topZoneRevenue: {
    zoneName: string;
    revenue: number;
    orderCount: number;
  } | null;
}

/**
 * Hook para buscar pedidos de delivery com filtros
 */
export const useDeliveryOrders = (params?: {
  status?: string;
  date?: Date;
  limit?: number;
  deliveryPersonId?: string;
}) => {
  return useQuery({
    queryKey: ['delivery-orders', params],
    queryFn: async (): Promise<DeliveryOrder[]> => {
      console.log('📦 Buscando pedidos de delivery...');

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
            delivery_zone:delivery_zones!delivery_zone_id (
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
          .eq('delivery_type', 'delivery')
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

        const { data: salesData, error } = await query;

        if (error) {
          console.error('❌ Erro ao buscar pedidos de delivery:', error);
          throw error;
        }

        if (!salesData || salesData.length === 0) {
          console.log('📦 Nenhum pedido de delivery encontrado');
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

        console.log(`✅ ${deliveryOrders.length} pedidos de delivery carregados`);
        return deliveryOrders;

      } catch (error) {
        console.error('❌ Erro crítico ao buscar pedidos de delivery:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 2 * 60 * 1000, // Refetch a cada 2 minutos
  });
};

/**
 * Hook para buscar métricas de delivery
 */
export const useDeliveryMetrics = (period: number = 7) => {
  return useQuery({
    queryKey: ['delivery-metrics', period],
    queryFn: async (): Promise<DeliveryMetrics> => {
      console.log(`📊 Calculando métricas de delivery (${period} dias)...`);

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        console.log(`📅 Período de análise: ${startDate.toISOString()} até ${new Date().toISOString()}`);

        // FORÇAR fallback manual para garantir que funcione
        console.log('📊 Usando cálculo manual das métricas...');
        
        // Query manual com métricas avançadas
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            delivery_zone:delivery_zones!delivery_zone_id (
              name
            )
          `)
          .eq('delivery_type', 'delivery')
          .gte('created_at', startDate.toISOString());

        if (salesError) {
          console.error('❌ Erro na query de sales:', salesError);
          throw salesError;
        }

        const orders = salesData || [];
        console.log(`📊 Encontradas ${orders.length} entregas no período`);
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.delivery_status === 'pending').length;
        const inTransitOrders = orders.filter(o => o.delivery_status === 'out_for_delivery').length;
        const deliveredOrders = orders.filter(o => o.delivery_status === 'delivered').length;
        const cancelledOrders = orders.filter(o => o.delivery_status === 'cancelled').length;
        
        console.log(`📊 Status breakdown: Pending: ${pendingOrders}, In Transit: ${inTransitOrders}, Delivered: ${deliveredOrders}, Cancelled: ${cancelledOrders}`);
        
        // Métricas financeiras básicas
        const totalRevenue = orders.reduce((sum, o) => {
          const amount = parseFloat(o.final_amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        const totalDeliveryFees = orders.reduce((sum, o) => {
          const fee = parseFloat(o.delivery_fee || 0);
          return sum + (isNaN(fee) ? 0 : fee);
        }, 0);
        
        console.log(`💰 Financial metrics: Total Revenue: R$ ${totalRevenue.toFixed(2)}, Delivery Fees: R$ ${totalDeliveryFees.toFixed(2)}`);
        
        // Novas métricas financeiras avançadas
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const avgTicketWithDelivery = totalOrders > 0 ? (totalRevenue + totalDeliveryFees) / totalOrders : 0;
        const deliveryFeeRevenue = totalDeliveryFees;
        
        // Growth rate - compara com período anterior
        const previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - period);
        
        const { data: previousSalesData } = await supabase
          .from('sales')
          .select('final_amount')
          .eq('delivery_type', 'delivery')
          .gte('created_at', previousStartDate.toISOString())
          .lt('created_at', startDate.toISOString());
        
        const previousRevenue = (previousSalesData || []).reduce((sum, o) => {
          const amount = parseFloat(o.final_amount || 0);
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const revenueGrowthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        
        // Top zona por receita
        const zoneRevenues = new Map();
        orders.forEach(order => {
          const zoneName = order.delivery_zone?.name || 'Zona não identificada';
          const current = zoneRevenues.get(zoneName) || { revenue: 0, orderCount: 0 };
          const orderRevenue = parseFloat(order.final_amount || 0);
          zoneRevenues.set(zoneName, {
            revenue: current.revenue + (isNaN(orderRevenue) ? 0 : orderRevenue),
            orderCount: current.orderCount + 1
          });
        });
        
        let topZoneRevenue = null;
        if (zoneRevenues.size > 0) {
          const topZone = Array.from(zoneRevenues.entries())
            .sort((a, b) => b[1].revenue - a[1].revenue)[0];
          topZoneRevenue = {
            zoneName: topZone[0],
            revenue: topZone[1].revenue,
            orderCount: topZone[1].orderCount
          };
        }

        console.log(`✅ Métricas calculadas com sucesso:`, {
          totalOrders,
          totalRevenue,
          avgOrderValue,
          deliveryFeeRevenue,
          revenueGrowthRate,
          topZoneRevenue
        });

        return {
          totalOrders,
          pendingOrders,
          inTransitOrders,
          deliveredOrders,
          cancelledOrders,
          totalRevenue,
          totalDeliveryFees,
          avgDeliveryTime: 0, // Pode ser calculado depois se necessário
          onTimeRate: 0, // Pode ser calculado depois se necessário
          // Novas métricas
          avgOrderValue,
          avgTicketWithDelivery,
          deliveryFeeRevenue,
          revenueGrowthRate,
          topZoneRevenue
        };

      } catch (error) {
        console.error('❌ Erro ao calcular métricas de delivery:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
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
      console.log(`🚚 Atualizando status de delivery: ${saleId} → ${newStatus}`);

      // Usar stored procedure para atualização com tracking
      const { data, error } = await supabase.rpc('update_delivery_status', {
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

      // Snapshot do estado anterior
      const previousDeliveries = queryClient.getQueryData(['delivery-orders']);

      // Atualização otimista
      queryClient.setQueryData(['delivery-orders'], (old: any) => {
        if (!old) return old;
        
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
      console.log(`✅ Status atualizado com sucesso: ${variables.saleId} → ${variables.newStatus}`);
      
      // Invalidação específica para garantir dados frescos
      queryClient.invalidateQueries({ 
        queryKey: ['delivery-orders'], 
        exact: false 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['delivery-metrics'], 
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
        queryClient.setQueryData(['delivery-orders'], context.previousDeliveries);
      }
      
      toast({
        title: "Erro ao atualizar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Sempre refetch após mutação (success ou error)
      queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
    },
  });
};

export default useDeliveryOrders;