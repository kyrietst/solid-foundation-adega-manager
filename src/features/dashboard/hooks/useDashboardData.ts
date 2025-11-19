/**
 * Hook para buscar dados reais do dashboard
 * Substitui dados hardcoded por queries reais do Supabase
 * Implementa error handling granular
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardErrorHandling } from './useDashboardErrorHandling';
import { useDashboardExpenses } from './useDashboardExpenses';

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

  // Buscar despesas operacionais reais
  const { data: expensesData, isLoading: isLoadingExpenses } = useDashboardExpenses(periodDays);

  // Query para contadores públicos com dados reais
  const { data: counts, isLoading: isLoadingCounts, error: countsError, refetch: refetchCounts } = useQuery({
    queryKey: ['dashboard', 'counts'],
    queryFn: errorHandler.withErrorHandling('counts', async (): Promise<DashboardCounts> => {
      try {
        // ✅ HOTFIX: Usar RPC para entregas pendentes (evita erro CORS/500 por RLS recursion)
        const [customersResult, vipCustomersResult, productsResult, deliveriesRpcResult] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('segment', 'High Value'),
          supabase.from('products').select('id', { count: 'exact', head: true }).gt('stock_quantity', 0),
          supabase.rpc('get_pending_deliveries_count')
        ]);

        // Verificar erro na RPC de entregas
        if (deliveriesRpcResult.error) {
          console.error('❌ Erro ao buscar entregas pendentes via RPC:', deliveriesRpcResult.error);
          throw deliveriesRpcResult.error;
        }

        return {
          totalCustomers: customersResult.count || 0,
          vipCustomers: vipCustomersResult.count || 0,
          productsInStock: productsResult.count || 0,
          pendingDeliveries: deliveriesRpcResult.data || 0,
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
      console.log(`💰 Dashboard - Usando RPC otimizada para ${periodDays} dias (timezone São Paulo)`);

      // Calcular date range em horário de São Paulo (consistente com outras telas)
      const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
      const endDate = new Date(nowSP);
      const startDate = new Date(nowSP);
      startDate.setDate(endDate.getDate() - periodDays);

      // ✅ SSoT: Buscar dados financeiros via RPC (receita, COGS, lucro bruto já calculados)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_dashboard_financials', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        })
        .single();

      if (rpcError) {
        console.error('❌ Erro ao buscar dados financeiros:', rpcError);
        throw rpcError;
      }

      // ✅ SSoT: Dados já vêm calculados do banco
      const totalRevenue = Number(rpcData?.total_revenue || 0);
      const cogs = Number(rpcData?.cogs || 0);
      const grossProfit = Number(rpcData?.gross_profit || 0);
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      // Usar despesas operacionais REAIS do sistema de gestão de despesas
      const operationalExpenses = expensesData?.total_expenses || 0;

      // Calcular lucro líquido (lucro bruto - despesas operacionais)
      const netProfit = Math.max(0, grossProfit - operationalExpenses);
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      console.log(`📊 Métricas financeiras (RPC + Despesas REAIS):`);
      console.log(`💰 Receita: R$ ${totalRevenue.toFixed(2)}`);
      console.log(`📦 COGS: R$ ${cogs.toFixed(2)}`);
      console.log(`📈 Lucro Bruto: R$ ${grossProfit.toFixed(2)} (${grossMargin.toFixed(1)}%)`);
      console.log(`💸 Despesas OpEx REAIS: R$ ${operationalExpenses.toFixed(2)} (${expensesData?.total_transactions || 0} transações)`);
      console.log(`💎 Lucro Líquido: R$ ${netProfit.toFixed(2)} (${netMargin.toFixed(1)}%)`);

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