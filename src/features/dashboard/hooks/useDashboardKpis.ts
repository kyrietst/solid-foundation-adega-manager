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
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('📊 Sales KPIs - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Dados simulados de vendas
      const revenue = 28450.75;
      const orders = 47;
      const avgTicket = revenue / orders;
      
      // Dados do período anterior (simulando crescimento)
      const revenuePrev = 24300.50;
      const ordersPrev = 39;
      const avgTicketPrev = revenuePrev / ordersPrev;
      
      // Calcular deltas
      const revenueDelta = ((revenue - revenuePrev) / revenuePrev) * 100;
      const ordersDelta = ((orders - ordersPrev) / ordersPrev) * 100;
      const avgTicketDelta = ((avgTicket - avgTicketPrev) / avgTicketPrev) * 100;

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
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('👥 Customer KPIs - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        totalCustomers: 247,
        newCustomers: 18,
        activeCustomers: 89
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
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('📦 Inventory KPIs - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 250));
      
      return {
        totalProducts: 156,
        totalValue: 87450.30,
        lowStockCount: 7 // Alguns produtos com estoque baixo para mostrar alerta
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
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('⚠️ Low Stock Products - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Produtos com estoque baixo simulados
      const mockLowStockProducts = [
        { id: 1, name: 'Vinho Tinto Reserva 2019', current_stock: 2, min_stock: 10, price: 89.90 },
        { id: 2, name: 'Champagne Brut Premium', current_stock: 1, min_stock: 5, price: 159.90 },
        { id: 3, name: 'Whisky Single Malt 18 Anos', current_stock: 3, min_stock: 8, price: 299.90 },
        { id: 4, name: 'Vodka Premium Import', current_stock: 4, min_stock: 12, price: 79.90 },
        { id: 5, name: 'Gin Artesanal 750ml', current_stock: 1, min_stock: 6, price: 119.90 },
        { id: 6, name: 'Cerveja Artesanal IPA', current_stock: 5, min_stock: 20, price: 12.90 },
        { id: 7, name: 'Rum Envelhecido 12 Anos', current_stock: 2, min_stock: 8, price: 189.90 }
      ];
      
      return mockLowStockProducts.slice(0, limit);
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

