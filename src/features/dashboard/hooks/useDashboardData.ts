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

export const useDashboardData = (periodDays: number = 30) => {
  const errorHandler = useDashboardErrorHandling({
    showToastOnError: true,
    retryAttempts: 2,
    retryDelay: 1000
  });

  // Query para contadores públicos com dados reais
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

  // Query para dados financeiros REAIS baseados nas vendas
  const { data: financials, isLoading: isLoadingFinancials, error: financialsError, refetch: refetchFinancials } = useQuery({
    queryKey: ['dashboard', 'financials', periodDays],
    queryFn: errorHandler.withErrorHandling('sales', async (): Promise<DashboardFinancials> => {
      console.log(`💰 Dashboard - Calculando métricas financeiras reais para ${periodDays} dias`);
      
      // Calcular data de início baseada no período
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - periodDays);
      
      // Buscar vendas completadas no período especificado
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('final_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (salesError) {
        console.error('❌ Erro ao buscar vendas:', salesError);
        throw salesError;
      }

      // Buscar dados de produtos para calcular custos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('cost_price, price, stock_quantity');

      if (productsError) {
        console.error('❌ Erro ao buscar produtos:', productsError);
        throw productsError;
      }

      // Calcular receita total real
      const totalRevenue = (sales || []).reduce((sum, sale) => {
        return sum + (Number(sale.final_amount) || 0);
      }, 0);

      // Calcular custos operacionais estimados baseados nos produtos
      const totalProductValue = (products || []).reduce((sum, product) => {
        const costPrice = Number(product.cost_price) || 0;
        const stockQty = Number(product.stock_quantity) || 0;
        return sum + (costPrice * stockQty);
      }, 0);

      // Estimar custos operacionais (30% da receita + valor do estoque)
      const operationalCosts = (totalRevenue * 0.30) + totalProductValue;
      
      // Calcular lucro líquido
      const netProfit = Math.max(0, totalRevenue - operationalCosts);
      
      // Calcular margem de lucro
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      console.log(`📊 Métricas calculadas - Receita: R$ ${totalRevenue.toFixed(2)}, Lucro: R$ ${netProfit.toFixed(2)}, Margem: ${profitMargin.toFixed(1)}%`);

      return {
        totalRevenue,
        netProfit,
        profitMargin,
        operationalCosts,
      };
    }, 'dados financeiros'),
    staleTime: 5 * 60 * 1000, // 5 minutos para dados mais atualizados
    retry: false, // Error handler já faz retry
  });

  // Query para dados de vendas por mês REAIS
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['dashboard', 'sales-data', periodDays],
    queryFn: async (): Promise<SalesDataPoint[]> => {
      console.log(`📊 Dashboard - Calculando vendas por período de ${periodDays} dias`);
      
      // Buscar vendas no período especificado
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - periodDays);
      
      const { data: sales, error } = await supabase
        .from('sales')
        .select('final_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar vendas mensais:', error);
        throw error;
      }

      // Agrupar vendas por mês
      const monthlyData = new Map<string, number>();
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Inicializar todos os meses com 0
      for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (11 - i));
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, 0);
      }

      // Somar vendas por mês
      (sales || []).forEach(sale => {
        const saleDate = new Date(sale.created_at);
        const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        const currentValue = monthlyData.get(monthKey) || 0;
        monthlyData.set(monthKey, currentValue + (Number(sale.final_amount) || 0));
      });

      // Converter para formato esperado
      const result: SalesDataPoint[] = [];
      const sortedEntries = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      
      sortedEntries.forEach(([monthKey, value]) => {
        const [year, month] = monthKey.split('-');
        const monthIndex = parseInt(month) - 1;
        const monthName = months[monthIndex];
        
        result.push({
          month: monthName,
          vendas: value,
          formatted: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(value)
        });
      });

      console.log(`📊 Vendas mensais calculadas: ${result.length} meses`);
      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
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