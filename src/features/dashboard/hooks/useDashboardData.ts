/**
 * Hook para buscar dados reais do dashboard
 * Substitui dados hardcoded por queries reais do Supabase
 * Implementa error handling granular
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardErrorHandling } from './useDashboardErrorHandling';
import { useDashboardExpenses } from './useDashboardExpenses';
import { getMonthStartDate, getNowSaoPaulo } from '../utils/dateHelpers';

export interface DashboardCounts {
  totalCustomers: number;
  vipCustomers: number;
  productsInStock: number;
  pendingDeliveries: number;
}

export interface DashboardFinancials {
  totalRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operationalExpenses: number;
  netProfit: number;
  netMargin: number;
  // Manter compatibilidade com código existente
  profitMargin: number; // = grossMargin para compatibilidade
  operationalCosts: number; // = operationalExpenses para compatibilidade
}

export interface SalesDataPoint {
  month: string;
  vendas: number;
  formatted: string;
}

// ✅ SSoT: COGS agora é calculado via RPC get_dashboard_financials
// Removido calculateRealCOGS - lógica movida para o banco de dados

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
        // ✅ HOTFIX: Usar Query direta para entregas pendentes (substitui RPC deletada)
        const [customersResult, vipCustomersResult, productsResult, deliveriesResult] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('segment', 'High Value'),
          supabase.from('products').select('id', { count: 'exact', head: true }).gt('stock_quantity', 0),
          supabase
            .from('sales')
            .select('id', { count: 'exact', head: true })
            .eq('delivery_type', 'delivery')
            .eq('delivery_status', 'pending')
        ]);

        if (deliveriesResult.error) {
          console.error('❌ Erro ao buscar entregas pendentes:', deliveriesResult.error);
          throw deliveriesResult.error;
        }

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
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // ✅ SSoT: Query para dados financeiros usando v_sales_with_profit (Lucro Real)
  const { data: financials, isLoading: isLoadingFinancials, error: financialsError, refetch: refetchFinancials } = useQuery({
    queryKey: ['dashboard', 'financials', periodDays],
    queryFn: errorHandler.withErrorHandling('sales', async (): Promise<DashboardFinancials> => {

      // ✅ MTD Strategy: Sempre do dia 01 do mês atual até hoje (timezone São Paulo)
      const endDate = getNowSaoPaulo();
      const startDate = getMonthStartDate();

      // ✅ Buscar dados financeiros via view otimizada (v_sales_with_profit)
      const { data: salesData, error } = await supabase
        .from('v_sales_with_profit')
        .select('total_amount, total_cost, total_profit, final_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('status', 'in', '("cancelled","returned")'); // Ignorar canceladas/devolvidas

      if (error) {
        console.error('❌ Erro ao buscar dados financeiros:', error);
        throw error;
      }

      // ✅ SSoT: Agregar dados
      // Se final_amount existir, use-o (considerando descontos), senão total_amount
      const totalRevenue = (salesData || []).reduce((sum, sale) => sum + (sale.final_amount || sale.total_amount || 0), 0);
      const cogs = (salesData || []).reduce((sum, sale) => sum + (sale.total_cost || 0), 0);
      
      // Lucro Bruto Real (Receita - Custo)
      // Se total_profit vier nulo (vendas antigas), tentar calcular
      const grossProfit = (salesData || []).reduce((sum, sale) => {
        if (sale.total_profit != null) return sum + sale.total_profit;
        return sum + ((sale.final_amount || sale.total_amount || 0) - (sale.total_cost || 0));
      }, 0);

      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // Por decisão de design (Phase 4.1), ignoramos despesas operacionais no KPI de Lucro
      // para focar no resultado operacional de vendas (Margem de Contribuição)
      const operationalExpenses = 0;
      const netProfit = grossProfit; // = Margem de Contribuição
      const netMargin = grossMargin;

      return {
        totalRevenue,
        cogs,
        grossProfit,
        grossMargin,
        operationalExpenses,
        netProfit,
        netMargin,
        // Compatibilidade
        profitMargin: grossMargin,
        operationalCosts: operationalExpenses,
      };
    }, 'dados financeiros'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Query para dados de vendas por mês REAIS
  const { data: salesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['dashboard', 'sales-data', periodDays],
    queryFn: async (): Promise<SalesDataPoint[]> => {

      // Buscar vendas no período especificado
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - periodDays);

      // ✅ FIX: Buscar TODAS as vendas do período (incluir delivery_type e delivery_status)
      const { data: allSales, error } = await supabase
        .from('sales')
        .select('final_amount, created_at, status, delivery_type, delivery_status, delivery')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar vendas mensais:', error);
        throw error;
      }

      // ✅ FIX: Aplicar lógica híbrida de status (mesma de get_dashboard_financials)
      const sales = (allSales || []).filter(sale => {
        // Excluir vendas canceladas ou devolvidas
        if (sale.status === 'cancelled' || sale.status === 'refunded') {
          return false;
        }

        // Lógica Híbrida:
        // - Presencial: status = 'completed' (venda paga)
        const isPresencialCompleted =
          (sale.status === 'completed') &&
          (sale.delivery_type === 'presencial' || sale.delivery === false);

        // - Delivery: delivery_status = 'delivered' (entrega concluída)
        const isDeliveryDelivered =
          (sale.delivery_type === 'delivery') &&
          (sale.delivery_status === 'delivered');

        return isPresencialCompleted || isDeliveryDelivered;
      });


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

      // Somar vendas por mês (agora com filtro híbrido aplicado)
      sales.forEach(sale => {
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

      return result;
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
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
    expensesData: undefined, // Removido: undefined para compatibilidade

    // Estados de loading
    isLoading: isLoadingCounts || isLoadingFinancials || isLoadingSales,
    isLoadingCounts,
    isLoadingFinancials,
    isLoadingSales,
    isLoadingExpenses: false, // Removido: false para compatibilidade

    // Error handling
    errorState: errorHandler.errorState,
    retrySection,
    retryAll,

    // Erros individuais (para compatibilidade)
    countsError,
    financialsError,
  };
};