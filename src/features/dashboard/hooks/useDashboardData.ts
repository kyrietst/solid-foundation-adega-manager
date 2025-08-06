/**
 * Hook para buscar dados reais do dashboard
 * Substitui dados hardcoded por queries reais do Supabase
 * Implementa error handling granular
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardErrorHandling } from './useDashboardErrorHandling';

export interface DashboardCounts {
  totalCustomers: number;
  vipCustomers: number;
  productsInStock: number;
  pendingDeliveries: number;
}

export interface DashboardFinancials {
  totalRevenue: number;
  netProfit: number;
  profitMargin: number;
  operationalCosts: number;
}

export interface SalesDataPoint {
  month: string;
  vendas: number;
  formatted: string;
}

export interface RecentActivity {
  id: string;
  type: 'sale' | 'stock' | 'customer' | 'delivery';
  description: string;
  details: string;
  timestamp: string;
  icon: string;
}

export const useDashboardData = () => {
  const errorHandler = useDashboardErrorHandling({
    showToastOnError: true,
    retryAttempts: 2,
    retryDelay: 1000
  });

  // Query para contadores públicos com error handling granular
  const { data: counts, isLoading: isLoadingCounts, error: countsError, refetch: refetchCounts } = useQuery({
    queryKey: ['dashboard', 'counts'],
    queryFn: errorHandler.withErrorHandling('counts', async (): Promise<DashboardCounts> => {
      // Usar Promise.allSettled para capturar falhas parciais
      const [customersResult, productsResult, deliveriesResult] = await Promise.allSettled([
        supabase.from('customers').select('id, segment'),
        supabase.from('products').select('id, stock_quantity').filter('stock_quantity', 'gt', 0),
        supabase.from('sales').select('id, status').eq('status', 'delivering')
      ]);

      // Processar resultados individualmente
      let totalCustomers = 0;
      let vipCustomers = 0;
      let productsInStock = 0;
      let pendingDeliveries = 0;

      if (customersResult.status === 'fulfilled' && !customersResult.value.error) {
        const customers = customersResult.value.data || [];
        totalCustomers = customers.length;
        vipCustomers = customers.filter(c => c.segment === 'VIP').length;
      } else {
        console.warn('Falha ao buscar clientes:', customersResult);
      }

      if (productsResult.status === 'fulfilled' && !productsResult.value.error) {
        productsInStock = productsResult.value.data?.length || 0;
      } else {
        console.warn('Falha ao buscar produtos:', productsResult);
      }

      if (deliveriesResult.status === 'fulfilled' && !deliveriesResult.value.error) {
        pendingDeliveries = deliveriesResult.value.data?.length || 0;
      } else {
        console.warn('Falha ao buscar entregas:', deliveriesResult);
      }

      return {
        totalCustomers,
        vipCustomers,
        productsInStock,
        pendingDeliveries,
      };
    }, 'contadores do dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // Error handler já faz retry
  });

  // Query para dados financeiros (apenas admin) com error handling
  const { data: financials, isLoading: isLoadingFinancials, error: financialsError, refetch: refetchFinancials } = useQuery({
    queryKey: ['dashboard', 'financials'],
    queryFn: errorHandler.withErrorHandling('sales', async (): Promise<DashboardFinancials> => {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      if (error) throw error;

      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
      
      // Cálculos simplificados - em produção viria de stored procedures
      const operationalCosts = totalRevenue * 0.35; // 35% dos custos
      const netProfit = totalRevenue - operationalCosts;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      return {
        totalRevenue,
        netProfit,
        profitMargin,
        operationalCosts,
      };
    }, 'dados financeiros'),
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: false, // Error handler já faz retry
  });

  // Query para dados de vendas por mês
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['dashboard', 'sales-data'],
    queryFn: async (): Promise<SalesDataPoint[]> => {
      const { data, error } = await supabase
        .from('sales')
        .select('total_amount, created_at')
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Agrupar por mês
      const monthlyData: Record<string, number> = {};
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Inicializar todos os meses com 0
      months.forEach((month, index) => {
        monthlyData[month] = 0;
      });

      // Somar vendas por mês
      data?.forEach(sale => {
        const date = new Date(sale.created_at);
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        monthlyData[monthName] += sale.total_amount || 0;
      });

      return months.map(month => ({
        month,
        vendas: monthlyData[month],
        formatted: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(monthlyData[month])
      }));
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Query para atividades recentes
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async (): Promise<RecentActivity[]> => {
      // Buscar vendas recentes
      const { data: recentSales, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total_amount,
          created_at,
          customers (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (salesError) throw salesError;

      const activities: RecentActivity[] = [];

      // Converter vendas em atividades
      recentSales?.forEach(sale => {
        const timeDiff = new Date().getTime() - new Date(sale.created_at).getTime();
        const timeAgo = timeDiff < 60000 ? 'Há poucos minutos' :
                       timeDiff < 3600000 ? `Há ${Math.floor(timeDiff / 60000)} min` :
                       `Há ${Math.floor(timeDiff / 3600000)} hora(s)`;

        activities.push({
          id: sale.id,
          type: 'sale',
          description: 'Nova venda realizada',
          details: `${sale.customers?.name || 'Cliente'} - ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(sale.total_amount)} - ${timeAgo}`,
          timestamp: sale.created_at,
          icon: 'ShoppingCart'
        });
      });

      return activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ).slice(0, 4);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Função para retry de seções individuais  
  const retrySection = (section: 'counts' | 'sales' | 'lowStock' | 'deliveries') => {
    switch (section) {
      case 'counts':
        refetchCounts();
        break;
      case 'sales':
        refetchFinancials();
        break;
      default:
        console.warn(`Retry não implementado para seção: ${section}`);
    }
  };

  const retryAll = () => {
    refetchCounts();
    refetchFinancials();
    // refetchSalesData();
    // refetchActivities();
  };

  return {
    // Dados
    counts,
    financials,
    salesData,
    recentActivities,

    // Estados de loading
    isLoading: isLoadingCounts || isLoadingFinancials || isLoadingSales || isLoadingActivities,
    isLoadingCounts,
    isLoadingFinancials,
    isLoadingSales,
    isLoadingActivities,

    // Error handling
    errorState: errorHandler.errorState,
    retrySection,
    retryAll,
    
    // Erros individuais (para compatibilidade)
    countsError,
    financialsError,
  };
};