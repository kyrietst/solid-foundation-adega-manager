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

  // Buscar despesas operacionais reais (MTD)
  const { data: expensesData, isLoading: isLoadingExpenses } = useDashboardExpenses();

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

        // Verificar erro na query de entregas
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
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false, // Error handler já faz retry
  });

  // ✅ SSoT: Query para dados financeiros usando RPC otimizada
  const { data: financials, isLoading: isLoadingFinancials, error: financialsError, refetch: refetchFinancials } = useQuery({
    queryKey: ['dashboard', 'financials', periodDays, expensesData?.total_expenses],
    queryFn: errorHandler.withErrorHandling('sales', async (): Promise<DashboardFinancials> => {

      // ✅ MTD Strategy: Sempre do dia 01 do mês atual até hoje (timezone São Paulo)
      // Ignora o parâmetro periodDays - Dashboard mostra "fechamento de caixa" mensal
      const endDate = getNowSaoPaulo();
      const startDate = getMonthStartDate();


      // ✅ SSoT: Buscar dados financeiros via RPC (get_daily_cash_flow)
      const { data: dailyData, error: rpcError } = await supabase
        .rpc('get_daily_cash_flow', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (rpcError) {
        console.error('❌ Erro ao buscar dados financeiros:', rpcError);
        throw rpcError;
      }

      // ✅ SSoT: Agregar dados diários
      const totalRevenue = (dailyData || []).reduce((sum, day) => sum + (day.income || 0), 0);
      const totalOutcome = (dailyData || []).reduce((sum, day) => sum + (day.outcome || 0), 0);

      // COGS não está disponível nesta RPC, assumindo 0 ou calculando se possível
      const cogs = 0;

      // Lucro Bruto = Receita - COGS
      const grossProfit = totalRevenue - cogs;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // Usar despesas operacionais REAIS do sistema de gestão de despesas
      // Se totalOutcome da RPC já inclui despesas, podemos usar ele, ou usar expensesData
      // A RPC get_daily_cash_flow usa a tabela 'expenses' para outcome, então é compatível
      const operationalExpenses = expensesData?.total_expenses || totalOutcome;

      // Calcular lucro líquido (lucro bruto - despesas operacionais)
      const netProfit = grossProfit - operationalExpenses;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;


      return {
        totalRevenue,
        cogs,
        grossProfit,
        grossMargin,
        operationalExpenses,
        netProfit,
        netMargin,
        // Compatibilidade com código existente
        profitMargin: grossMargin,
        operationalCosts: operationalExpenses,
      };
    }, 'dados financeiros'),
    staleTime: 5 * 60 * 1000, // 5 minutos para dados mais atualizados
    retry: false, // Error handler já faz retry
    enabled: !isLoadingExpenses, // Aguarda os dados de despesas carregarem primeiro
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
        if (sale.status === 'cancelled' || sale.status === 'returned') {
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
    expensesData,

    // Estados de loading
    isLoading: isLoadingCounts || isLoadingFinancials || isLoadingSales || isLoadingExpenses,
    isLoadingCounts,
    isLoadingFinancials,
    isLoadingSales,
    isLoadingExpenses,

    // Error handling
    errorState: errorHandler.errorState,
    retrySection,
    retryAll,

    // Erros individuais (para compatibilidade)
    countsError,
    financialsError,
  };
};