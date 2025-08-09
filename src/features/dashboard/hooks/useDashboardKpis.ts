import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface SalesKpis {
  revenue: number;
  orders: number;
  avgTicket: number;
  revenuePrev?: number;
  revenueDelta?: number;
  ordersDelta?: number;
  avgTicketDelta?: number;
}

export interface CustomerKpis {
  totalCustomers: number;
  newCustomers: number;
  activeCustomers?: number;
}

export interface InventoryKpis {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
}

export function useSalesKpis(windowDays: number = 30) {
  return useQuery({
    queryKey: ['kpis-sales', windowDays],
    queryFn: async (): Promise<SalesKpis> => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);

      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date();
      prevStartDate.setDate(prevEndDate.getDate() - windowDays);

      // Current period
      const { data: currentData, error: currentError } = await supabase
        .rpc('get_sales_metrics', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });
      
      if (currentError) throw currentError;

      // Previous period for comparison
      const { data: prevData, error: prevError } = await supabase
        .rpc('get_sales_metrics', {
          start_date: prevStartDate.toISOString(),
          end_date: prevEndDate.toISOString()
        });

      if (prevError) throw prevError;

      const current = currentData?.[0] || { total_revenue: 0, total_orders: 0 };
      const prev = prevData?.[0] || { total_revenue: 0, total_orders: 0 };

      const revenue = Number(current.total_revenue || 0);
      const orders = Number(current.total_orders || 0);
      const avgTicket = orders ? revenue / orders : 0;

      const revenuePrev = Number(prev.total_revenue || 0);
      const ordersPrev = Number(prev.total_orders || 0);
      const avgTicketPrev = ordersPrev ? revenuePrev / ordersPrev : 0;

      const revenueDelta = revenuePrev ? ((revenue - revenuePrev) / revenuePrev) * 100 : 0;
      const ordersDelta = ordersPrev ? ((orders - ordersPrev) / ordersPrev) * 100 : 0;
      const avgTicketDelta = avgTicketPrev ? ((avgTicket - avgTicketPrev) / avgTicketPrev) * 100 : 0;

      return { 
        revenue, 
        orders, 
        avgTicket, 
        revenuePrev,
        revenueDelta: Math.round(revenueDelta * 100) / 100,
        ordersDelta: Math.round(ordersDelta * 100) / 100,
        avgTicketDelta: Math.round(avgTicketDelta * 100) / 100
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
  });
}

export function useCustomerKpis(windowDays: number = 30) {
  return useQuery({
    queryKey: ['kpis-customers', windowDays],
    queryFn: async (): Promise<CustomerKpis> => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);

      const { data, error } = await supabase
        .rpc('get_customer_metrics', {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        });
      
      if (error) throw error;
      
      const result = data?.[0] || { total_customers: 0, new_customers: 0 };
      
      return {
        totalCustomers: Number(result.total_customers || 0),
        newCustomers: Number(result.new_customers || 0),
        activeCustomers: Number(result.active_customers || 0)
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useInventoryKpis() {
  return useQuery({
    queryKey: ['kpis-inventory'],
    queryFn: async (): Promise<InventoryKpis> => {
      const { data, error } = await supabase
        .rpc('get_inventory_metrics');
      
      if (error) throw error;
      
      const result = data?.[0] || { count: 0, sum: 0, sum_1: 0 };
      
      return {
        totalProducts: Number(result.count || 0),
        totalValue: Number(result.sum || 0),
        lowStockCount: Number(result.sum_1 || 0) // This maps to the low stock count from the procedure
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLowStockProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_low_stock_products', { limit_count: limit });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Legacy exports for backward compatibility
export interface LowStockKpi { count: number }
export interface ActiveCustomersKpi { count: number }

export function useLowStockKpi() {
  const { data, isLoading, error } = useInventoryKpis();
  return {
    data: data ? { count: data.lowStockCount } : undefined,
    isLoading,
    error
  };
}

export function useActiveCustomersKpi(windowDays: number = 30) {
  const { data, isLoading, error } = useCustomerKpis(windowDays);
  return {
    data: data ? { count: data.newCustomers } : undefined, // Using new customers as active proxy
    isLoading,
    error
  };
}

