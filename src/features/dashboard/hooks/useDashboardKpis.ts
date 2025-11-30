import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardExpenses, useDashboardBudgetVariance } from './useDashboardExpenses';
import { safeNumber, safePercentage, safeDelta, debugNaN } from '@/shared/utils/number-utils';
import { getSaoPauloTimestamp } from '@/shared/hooks/common/use-brasil-timezone';

// Função auxiliar para criar ranges de data em horário de São Paulo
function getSaoPauloDateRange(windowDays: number) {
  // Obter data atual em São Paulo
  const nowSP = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

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

      // 1. Buscar dados financeiros atuais (RPC nova: get_daily_cash_flow)
      const { data: currentFinancials, error: currentError } = await supabase
        .rpc('get_daily_cash_flow', {
          p_start_date: dateRange.current.start,
          p_end_date: dateRange.current.end
        });

      if (currentError) {
        console.error('❌ Erro ao buscar KPIs atuais:', currentError);
        throw currentError;
      }

      // 2. Buscar contagem de vendas atuais
      const { count: currentOrders, error: currentCountError } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', dateRange.current.start)
        .lte('created_at', dateRange.current.end);

      if (currentCountError) {
        console.error('❌ Erro ao buscar contagem de vendas atuais:', currentCountError);
        throw currentCountError;
      }

      // 3. Buscar dados financeiros anteriores
      const { data: prevFinancials, error: prevError } = await supabase
        .rpc('get_daily_cash_flow', {
          p_start_date: dateRange.previous.start,
          p_end_date: dateRange.previous.end
        });

      if (prevError) {
        console.error('❌ Erro ao buscar KPIs anteriores:', prevError);
      }

      // 4. Buscar contagem de vendas anteriores
      const { count: prevOrders, error: prevCountError } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', dateRange.previous.start)
        .lt('created_at', dateRange.previous.end); // Use lt to avoid overlap

      // Calcular totais agregando os dados diários
      const revenue = (currentFinancials || []).reduce((sum, day) => sum + (day.income || 0), 0);
      const orders = currentOrders || 0;
      const avgTicket = orders > 0 ? revenue / orders : 0;

      const revenuePrev = (prevFinancials || []).reduce((sum, day) => sum + (day.income || 0), 0);
      const ordersPrev = prevOrders || 0;
      const avgTicketPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0;

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

      // 1. Buscar valuation do estoque (RPC nova: get_inventory_financials)
      const { data: financials, error: valuationError } = await supabase
        .rpc('get_inventory_financials');

      if (valuationError) {
        console.error('❌ Erro ao buscar inventory financials:', valuationError);
        throw valuationError;
      }

      // 2. Buscar contagem total de produtos
      const { count: totalProducts, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (countError) {
        console.error('❌ Erro ao buscar total de produtos:', countError);
        throw countError;
      }

      // 3. Buscar produtos com estoque baixo (Low Stock) usando lógica unificada
      // Regra: COALESCE(p.minimum_stock, c.default_min_stock, 10)
      const { data: lowStockCountData, error: lowStockError } = await supabase
        .rpc('get_low_stock_count');

      if (lowStockError) {
        console.error('❌ Erro ao buscar contagem de estoque baixo:', lowStockError);
      }

      const lowStockCount = (lowStockCountData as unknown as number) || 0;

      // Parse JSON result from RPC
      const totalCostValue = safeNumber((financials as any)?.total_cost || 0);
      const potentialRevenue = safeNumber((financials as any)?.potential_revenue || 0);

      return {
        totalProducts: totalProducts || 0,
        totalCostValue,
        potentialRevenue,
        lowStockCount: lowStockCount || 0
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

