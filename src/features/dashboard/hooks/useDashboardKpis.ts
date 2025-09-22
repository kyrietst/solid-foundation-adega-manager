import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useDashboardExpenses, useDashboardBudgetVariance } from './useDashboardExpenses';
import { safeNumber, safePercentage, safeDelta, debugNaN } from '@/shared/utils/number-utils';

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
      console.log(`📊 Sales KPIs - Calculando dados reais para ${windowDays} dias`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);
      
      // Período anterior para comparação
      const prevStartDate = new Date();
      prevStartDate.setDate(startDate.getDate() - windowDays);
      
      // Buscar vendas do período atual
      const { data: currentSales, error: currentError } = await supabase
        .from('sales')
        .select('final_amount')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (currentError) {
        console.error('❌ Erro ao buscar vendas atuais:', currentError);
        throw currentError;
      }

      // Buscar vendas do período anterior
      const { data: prevSales, error: prevError } = await supabase
        .from('sales')
        .select('final_amount')
        .eq('status', 'completed')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .not('final_amount', 'is', null);

      if (prevError) {
        console.error('❌ Erro ao buscar vendas anteriores:', prevError);
        // Não falhar se não houver dados anteriores
      }

      // Calcular KPIs atuais com proteção anti-NaN
      const revenue = safeNumber((currentSales || []).reduce((sum, sale) => sum + safeNumber(sale.final_amount), 0));
      const orders = safeNumber((currentSales || []).length);
      // ✅ Correção: avgTicket é divisão simples, não percentual
      const avgTicket = orders > 0 ? safeNumber(revenue / orders) : 0;

      // Calcular KPIs anteriores com proteção anti-NaN
      const revenuePrev = safeNumber((prevSales || []).reduce((sum, sale) => sum + safeNumber(sale.final_amount), 0));
      const ordersPrev = safeNumber((prevSales || []).length);
      // ✅ Correção: avgTicketPrev é divisão simples, não percentual
      const avgTicketPrev = ordersPrev > 0 ? safeNumber(revenuePrev / ordersPrev) : 0;

      // Calcular deltas com proteção anti-NaN
      const revenueDelta = debugNaN(safeDelta(revenue, revenuePrev), 'revenueDelta');
      const ordersDelta = debugNaN(safeDelta(orders, ordersPrev), 'ordersDelta');
      const avgTicketDelta = debugNaN(safeDelta(avgTicket, avgTicketPrev), 'avgTicketDelta');

      console.log(`📊 Sales KPIs calculados - Receita: R$ ${revenue.toFixed(2)}, Pedidos: ${orders}, Ticket Médio: R$ ${avgTicket.toFixed(2)}`);

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
      console.log(`👥 Customer KPIs - Calculando dados reais para ${windowDays} dias`);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - windowDays);
      
      // Buscar total de clientes
      const { data: allCustomers, error: totalError } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true });

      if (totalError) {
        console.error('❌ Erro ao buscar total de clientes:', totalError);
        throw totalError;
      }

      // Buscar novos clientes no período
      const { data: newCustomersData, error: newError } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (newError) {
        console.error('❌ Erro ao buscar novos clientes:', newError);
        throw newError;
      }

      // Buscar clientes ativos (que fizeram compras no período)
      const { data: activeCustomersData, error: activeError } = await supabase
        .from('sales')
        .select('customer_id', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('customer_id', 'is', null);

      if (activeError) {
        console.error('❌ Erro ao buscar clientes ativos:', activeError);
        // Não falhar se não conseguir buscar clientes ativos
      }

      const totalCustomers = allCustomers?.count || 0;
      const newCustomers = newCustomersData?.count || 0;
      const activeCustomers = activeCustomersData?.count || 0;

      console.log(`👥 Customer KPIs calculados - Total: ${totalCustomers}, Novos: ${newCustomers}, Ativos: ${activeCustomers}`);

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
      console.log('📦 Inventory KPIs - Calculando dados ultra-simplificados do estoque');

      // Buscar produtos com campos ultra-simplificados
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_packages, stock_units_loose, price');

      if (productsError) {
        console.error('❌ Erro ao buscar produtos:', productsError);
        throw productsError;
      }

      const totalProducts = (products || []).length;

      // Calcular valor total do estoque com proteção anti-NaN
      const totalValue = safeNumber((products || []).reduce((sum, product) => {
        const stockPackages = safeNumber(product.stock_packages);
        const stockUnitsLoose = safeNumber(product.stock_units_loose);
        const totalStock = stockPackages + stockUnitsLoose;
        const price = safeNumber(product.price);
        return sum + (totalStock * price);
      }, 0));

      // Ultra-simplificação: Contar apenas produtos SEM ESTOQUE (packages = 0 E units = 0)
      const lowStockCount = (products || []).filter(product => {
        const stockPackages = safeNumber(product.stock_packages);
        const stockUnitsLoose = safeNumber(product.stock_units_loose);
        return stockPackages === 0 && stockUnitsLoose === 0;
      }).length;

      console.log(`📦 Inventory KPIs ultra-simplificados - Produtos: ${totalProducts}, Valor: R$ ${totalValue.toFixed(2)}, Sem Estoque: ${lowStockCount}`);

      return {
        totalProducts,
        totalValue,
        lowStockCount // Agora representa produtos sem estoque
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
      console.log(`⚠️ Out of Stock Products - Buscando ${limit} produtos sem estoque`);

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

      console.log(`⚠️ Encontrados ${outOfStockProducts.length} produtos sem estoque`);

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
      console.log(`💸 Expense KPIs - Calculando dados para ${windowDays} dias`);
      
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
      
      console.log(`💸 Expense KPIs calculados - Total: R$ ${totalExpenses.toFixed(2)}, Categoria Top: ${topCategory}, Margem Líquida: ${netMargin.toFixed(1)}%`);
      
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

