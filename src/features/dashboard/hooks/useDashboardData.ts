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

  // Query para contadores públicos com dados mockados para teste
  const { data: counts, isLoading: isLoadingCounts, error: countsError, refetch: refetchCounts } = useQuery({
    queryKey: ['dashboard', 'counts'],
    queryFn: errorHandler.withErrorHandling('counts', async (): Promise<DashboardCounts> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('🧪 Dashboard - Usando dados mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        totalCustomers: 247,
        vipCustomers: 18,
        productsInStock: 156,
        pendingDeliveries: 12,
      };
    }, 'contadores do dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // Error handler já faz retry
  });

  // Query para dados financeiros com dados mockados para teste
  const { data: financials, isLoading: isLoadingFinancials, error: financialsError, refetch: refetchFinancials } = useQuery({
    queryKey: ['dashboard', 'financials'],
    queryFn: errorHandler.withErrorHandling('sales', async (): Promise<DashboardFinancials> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('💰 Dashboard - Usando dados financeiros mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const totalRevenue = 45780.50;
      const operationalCosts = totalRevenue * 0.38; // 38% dos custos
      const netProfit = totalRevenue - operationalCosts;
      const profitMargin = (netProfit / totalRevenue) * 100;

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

  // Query para dados de vendas por mês com dados mockados para teste
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['dashboard', 'sales-data'],
    queryFn: async (): Promise<SalesDataPoint[]> => {
      // MOCK DATA para teste - substituir por dados reais depois
      console.log('📊 Dashboard - Usando dados de vendas mockados para teste');
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Dados de vendas simulados com tendência crescente
      const salesValues = [
        12450.30, 15600.80, 18200.50, 22100.75, 19800.40,
        24300.90, 27650.25, 31200.60, 28900.15, 26700.85,
        29400.70, 33150.45
      ];

      return months.map((month, index) => ({
        month,
        vendas: salesValues[index],
        formatted: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(salesValues[index])
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