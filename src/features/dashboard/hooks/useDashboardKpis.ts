import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardExpenses, useDashboardBudgetVariance } from './useDashboardExpenses';
import { safeNumber, safePercentage, safeDelta, debugNaN } from '@/shared/utils/number-utils';
import { getSaoPauloTimestamp } from '@/shared/hooks/common/use-brasil-timezone';

// Função auxiliar para criar ranges de data em horário de São Paulo
function getSaoPauloDateRange(windowDays: number) {
  // Obter data atual em São Paulo
  const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

  const endDate = new Date(nowSP);
  const startDate = new Date(nowSP);
  startDate.setDate(endDate.getDate() - windowDays);

  // Período anterior para comparação
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(startDate.getDate() - windowDays);

  return {
    current: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    previous: {
      start: prevStartDate.toISOString(),
      end: startDate.toISOString()
    }
  };
}

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
  totalCostValue: number; // Renamed for clarity: capital investido
  potentialRevenue: number; // NEW: receita potencial se todo estoque for vendido
  lowStockCount: number; // Ultra-simplificação: representa produtos SEM estoque (stock = 0)
}

export interface ExpenseKpis {
  totalExpenses: number;
  expensesDelta?: number; // Variação percentual vs período anterior
  avgExpense: number;
  budgetVariance: number; // Variação orçamentária em %
  budgetStatus: 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET';
  topCategory: string;
  topCategoryAmount: number;
  categoriesOverBudget: number;
  netMargin: number; // Margem líquida
}

export function useSalesKpis(windowDays: number = 30) {
  return useQuery({
    queryKey: ['kpis-sales', windowDays],
    queryFn: async (): Promise<SalesKpis> => {

      // Usar ranges de data em horário de São Paulo (consistente com tela de Vendas)
      const dateRange = getSaoPauloDateRange(windowDays);

      // ✅ SSoT: Buscar dados do período atual usando RPC
      const { data: currentData, error: currentError } = await supabase
        .rpc('get_dashboard_financials', {
          p_start_date: dateRange.current.start,
          p_end_date: dateRange.current.end
        })
        .single();

      if (currentError) {
        console.error('❌ Erro ao buscar KPIs atuais:', currentError);
        throw currentError;
      }

      // ✅ SSoT: Buscar dados do período anterior usando RPC
      const { data: prevData, error: prevError } = await supabase
        .rpc('get_dashboard_financials', {
          p_start_date: dateRange.previous.start,
          p_end_date: dateRange.previous.end
        })
        .single();

      if (prevError) {
        console.error('❌ Erro ao buscar KPIs anteriores:', prevError);
        // Não falhar se não houver dados anteriores
      }

      // ✅ SSoT: Dados já vêm calculados do banco
      const revenue = safeNumber(currentData?.total_revenue || 0);
      const orders = safeNumber(currentData?.sales_count || 0);
      const avgTicket = safeNumber(currentData?.average_ticket || 0);

      const revenuePrev = safeNumber(prevData?.total_revenue || 0);
      const ordersPrev = safeNumber(prevData?.sales_count || 0);
      const avgTicketPrev = safeNumber(prevData?.average_ticket || 0);

      // Calcular deltas com proteção anti-NaN
      const revenueDelta = debugNaN(safeDelta(revenue, revenuePrev), 'revenueDelta');
      const ordersDelta = debugNaN(safeDelta(orders, ordersPrev), 'ordersDelta');
      const avgTicketDelta = debugNaN(safeDelta(avgTicket, avgTicketPrev), 'avgTicketDelta');


      return {
        revenue,
        orders,
        avgTicket,
        revenuePrev,
        revenueDelta: safeNumber(Math.round(revenueDelta * 100) / 100),
        ordersDelta: safeNumber(Math.round(ordersDelta * 100) / 100),
        avgTicketDelta: safeNumber(Math.round(avgTicketDelta * 100) / 100)
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

      // Usar ranges de data em horário de São Paulo
      const dateRange = getSaoPauloDateRange(windowDays);

      // Buscar total de clientes
      const { data: allCustomers, error: totalError } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });

      if (totalError) {
        console.error('❌ Erro ao buscar total de clientes:', totalError);
        throw totalError;
      }

      // Buscar novos clientes no período (usando horário de São Paulo)
      const { data: newCustomersData, error: newError } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', dateRange.current.start)
        .lte('created_at', dateRange.current.end);

      if (newError) {
        console.error('❌ Erro ao buscar novos clientes:', newError);
        throw newError;
      }

      // Buscar clientes ativos (que fizeram compras no período)
      const { data: activeCustomersData, error: activeError } = await supabase
        .from('sales')
        .select('customer_id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', dateRange.current.start)
        .lte('created_at', dateRange.current.end)
        .not('customer_id', 'is', null);

      if (activeError) {
        console.error('❌ Erro ao buscar clientes ativos:', activeError);
        // Não falhar se não conseguir buscar clientes ativos
      }

      const totalCustomers = allCustomers?.count || 0;
      const newCustomers = newCustomersData?.count || 0;
      const activeCustomers = activeCustomersData?.count || 0;


      return {
        totalCustomers,
        newCustomers,
        activeCustomers
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

      // ✅ SSoT: Buscar valuation do estoque usando RPC
      const { data, error } = await supabase
        .rpc('get_inventory_valuation')
        .single();

      if (error) {
        console.error('❌ Erro ao buscar inventory valuation:', error);
        throw error;
      }

      // ✅ SSoT: Dados já vêm calculados do banco
      // CRÍTICO: totalCostValue usa cost_price (patrimônio investido real)
      const totalProducts = safeNumber(data?.total_products || 0);
      const totalCostValue = safeNumber(data?.total_cost_value || 0);
      const potentialRevenue = safeNumber(data?.potential_revenue_value || 0);
      const lowStockCount = safeNumber(data?.out_of_stock_count || 0);

      // Calcular margem potencial
      const marginPercent = totalCostValue > 0
        ? ((potentialRevenue - totalCostValue) / totalCostValue) * 100
        : 0;


      return {
        totalProducts,
        totalCostValue, // Capital investido (cost_price)
        potentialRevenue, // ✅ NOVO: Receita potencial (price)
        lowStockCount
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useOutOfStockProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['out-of-stock-products', limit],
    queryFn: async () => {

      // Ultra-simplificação: Apenas produtos com estoque zero
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock_packages, stock_units_loose, price')
        .eq('stock_packages', 0)
        .eq('stock_units_loose', 0)
        .limit(limit);

      if (error) {
        console.error('❌ Erro ao buscar produtos sem estoque:', error);
        throw error;
      }

      // Mapear produtos sem estoque
      const outOfStockProducts = (products || [])
        .map(product => ({
          id: product.id,
          name: product.name,
          current_stock: 0, // Sempre 0 por definição
          stock_packages: product.stock_packages,
          stock_units_loose: product.stock_units_loose,
          price: safeNumber(product.price)
        }));


      return outOfStockProducts;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Legacy exports for backward compatibility
export interface LowStockKpi { count: number }
export interface ActiveCustomersKpi { count: number }

export function useExpenseKpis(windowDays: number = 30) {
  const { data: expenses, isLoading: isLoadingExpenses } = useDashboardExpenses(windowDays);
  const { data: budgetVariance, isLoading: isLoadingBudget } = useDashboardBudgetVariance();
  const { data: salesData, isLoading: isLoadingSales } = useSalesKpis(windowDays);
  
  return useQuery({
    queryKey: ['kpis-expenses', windowDays],
    queryFn: async (): Promise<ExpenseKpis> => {
      
      const totalExpenses = safeNumber(expenses?.total_expenses);
      const avgExpense = safeNumber(expenses?.avg_expense);
      const topCategory = expenses?.top_category || 'N/A';
      const topCategoryAmount = safeNumber(expenses?.top_category_amount);
      const categoriesOverBudget = safeNumber(budgetVariance?.categories_over_budget);
      const budgetStatus = budgetVariance?.status || 'ON_TRACK';
      const budgetVariancePercent = safeNumber(budgetVariance?.variance_percentage);
      
      // Calcular margem líquida com proteção anti-NaN
      const revenue = safeNumber(salesData?.revenue);
      // ✅ Correção: Cálculo direto da margem líquida
      const netMargin = revenue > 0 ? safeNumber(((revenue - totalExpenses) / revenue) * 100) : 0;
      
      // Calcular variação de despesas (para implementar depois com dados históricos)
      const expensesDelta = 0; // Placeholder por enquanto
      
      
      return {
        totalExpenses: safeNumber(totalExpenses),
        expensesDelta: safeNumber(expensesDelta),
        avgExpense: safeNumber(avgExpense),
        budgetVariance: safeNumber(budgetVariancePercent),
        budgetStatus: budgetStatus as 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET',
        topCategory,
        topCategoryAmount: safeNumber(topCategoryAmount),
        categoriesOverBudget: safeNumber(categoriesOverBudget),
        netMargin: safeNumber(netMargin)
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !isLoadingExpenses && !isLoadingBudget && !isLoadingSales,
  });
}

export function useOutOfStockKpi() {
  const { data, isLoading, error } = useInventoryKpis();
  return {
    data: data ? { count: data.lowStockCount } : undefined, // lowStockCount agora representa outOfStock
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

