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
      try {
        // Buscar contadores reais do banco
        const [customersResult, vipCustomersResult, productsResult, deliveriesResult] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('segment', 'High Value'),
          supabase.from('products').select('id', { count: 'exact', head: true }).gt('stock_quantity', 0),
          supabase.from('sales').select('id', { count: 'exact', head: true }).eq('status', 'pending').eq('delivery', true)
        ]);

        return {
          totalCustomers: customersResult.count || 0,
          vipCustomers: vipCustomersResult.count || 0,
          productsInStock: productsResult.count || 0,
          pendingDeliveries: deliveriesResult.count || 0,
        };
      } catch (error) {
        console.error('Erro ao buscar contadores:', error);
        throw error;
      }
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

  // Query para atividades recentes - Vendas, Clientes e Produtos
  const { data: recentActivities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      try {
        // 1. Buscar vendas recentes
        const { data: recentSales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            created_at,
            customers (name)
          `)
          .order('created_at', { ascending: false })
          .limit(3);

        if (!salesError && recentSales) {
          recentSales.forEach(sale => {
            activities.push({
              id: `sale-${sale.id}`,
              type: 'sale',
              description: 'Nova venda realizada',
              details: `${sale.customers?.name || 'Cliente'} - ${new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(sale.total_amount)}`,
              timestamp: sale.created_at,
              icon: 'ShoppingCart'
            });
          });
        }

        // 2. Buscar clientes recém-cadastrados
        const { data: recentCustomers, error: customersError } = await supabase
          .from('customers')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!customersError && recentCustomers) {
          recentCustomers.forEach(customer => {
            activities.push({
              id: `customer-${customer.id}`,
              type: 'customer',
              description: 'Novo cliente cadastrado',
              details: `${customer.name}`,
              timestamp: customer.created_at,
              icon: 'Users'
            });
          });
        }

        // 3. Buscar produtos recém-cadastrados
        const { data: recentProducts, error: productsError } = await supabase
          .from('products')
          .select('id, name, created_at')
          .order('created_at', { ascending: false })
          .limit(3);

        if (!productsError && recentProducts) {
          recentProducts.forEach(product => {
            activities.push({
              id: `product-${product.id}`,
              type: 'stock',
              description: 'Produto adicionado ao estoque',
              details: `${product.name}`,
              timestamp: product.created_at,
              icon: 'Package'
            });
          });
        }

        // 4. Buscar movimentações de estoque recentes (entradas)
        const { data: recentMovements, error: movementsError } = await supabase
          .from('inventory_movements')
          .select(`
            id,
            type,
            quantity,
            date,
            products (name)
          `)
          .eq('type', 'entrada')
          .order('date', { ascending: false })
          .limit(2);

        if (!movementsError && recentMovements) {
          recentMovements.forEach(movement => {
            activities.push({
              id: `movement-${movement.id}`,
              type: 'stock',
              description: 'Estoque atualizado',
              details: `${movement.products?.name || 'Produto'} - ${movement.quantity > 0 ? '+' : ''}${movement.quantity} unidades`,
              timestamp: movement.date,
              icon: 'Package'
            });
          });
        }

      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error);
      }

      // Ordenar por timestamp e limitar a 5 atividades mais recentes
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
    },
    staleTime: 1 * 60 * 1000, // 1 minuto para atividades mais atualizadas
    refetchInterval: 2 * 60 * 1000, // Atualiza automaticamente a cada 2 minutos
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