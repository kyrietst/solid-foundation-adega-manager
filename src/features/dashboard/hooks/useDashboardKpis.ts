import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

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
  lowStockCount: number;
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

      // Calcular KPIs atuais
      const revenue = (currentSales || []).reduce((sum, sale) => sum + (Number(sale.final_amount) || 0), 0);
      const orders = (currentSales || []).length;
      const avgTicket = orders > 0 ? revenue / orders : 0;

      // Calcular KPIs anteriores
      const revenuePrev = (prevSales || []).reduce((sum, sale) => sum + (Number(sale.final_amount) || 0), 0);
      const ordersPrev = (prevSales || []).length;
      const avgTicketPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0;

      // Calcular deltas
      const revenueDelta = revenuePrev > 0 ? ((revenue - revenuePrev) / revenuePrev) * 100 : 0;
      const ordersDelta = ordersPrev > 0 ? ((orders - ordersPrev) / ordersPrev) * 100 : 0;
      const avgTicketDelta = avgTicketPrev > 0 ? ((avgTicket - avgTicketPrev) / avgTicketPrev) * 100 : 0;

      console.log(`📊 Sales KPIs calculados - Receita: R$ ${revenue.toFixed(2)}, Pedidos: ${orders}, Ticket Médio: R$ ${avgTicket.toFixed(2)}`);

      return { 
        revenue, 
        orders, 
        avgTicket, 
        revenuePrev,
        revenueDelta: Math.round(revenueDelta * 100) / 100,
        ordersDelta: Math.round(ordersDelta * 100) / 100,
        avgTicketDelta: Math.round(avgTicketDelta * 100) / 100
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
      console.log('📦 Inventory KPIs - Calculando dados reais do estoque');
      
      // Buscar produtos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, price, minimum_stock');

      if (productsError) {
        console.error('❌ Erro ao buscar produtos:', productsError);
        throw productsError;
      }

      const totalProducts = (products || []).length;
      
      // Calcular valor total do estoque
      const totalValue = (products || []).reduce((sum, product) => {
        const stock = Number(product.stock_quantity) || 0;
        const price = Number(product.price) || 0;
        return sum + (stock * price);
      }, 0);

      // Contar produtos com estoque baixo
      const lowStockCount = (products || []).filter(product => {
        const currentStock = Number(product.stock_quantity) || 0;
        const minStock = Number(product.minimum_stock) || 0;
        return currentStock <= minStock && minStock > 0;
      }).length;

      console.log(`📦 Inventory KPIs calculados - Produtos: ${totalProducts}, Valor: R$ ${totalValue.toFixed(2)}, Estoque Baixo: ${lowStockCount}`);

      return {
        totalProducts,
        totalValue,
        lowStockCount
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useLowStockProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async () => {
      console.log(`⚠️ Low Stock Products - Buscando ${limit} produtos com estoque baixo`);
      
      // Buscar produtos com estoque baixo
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, minimum_stock, price')
        .gt('minimum_stock', 0)
        .order('stock_quantity', { ascending: true });

      if (error) {
        console.error('❌ Erro ao buscar produtos com estoque baixo:', error);
        throw error;
      }

      // Filtrar produtos onde estoque atual <= estoque mínimo
      const lowStockProducts = (products || [])
        .filter(product => {
          const currentStock = Number(product.stock_quantity) || 0;
          const minStock = Number(product.minimum_stock) || 0;
          return currentStock <= minStock;
        })
        .map(product => ({
          id: product.id,
          name: product.name,
          current_stock: Number(product.stock_quantity) || 0,
          min_stock: Number(product.minimum_stock) || 0,
          price: Number(product.price) || 0
        }))
        .slice(0, limit);

      console.log(`⚠️ Encontrados ${lowStockProducts.length} produtos com estoque baixo`);

      return lowStockProducts;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Legacy exports for backward compatibility
export interface LowStockKpi { count: number }
export interface ActiveCustomersKpi { count: number }

export function useLowStockKpi() {
  const { data, isLoading, error } = useInventoryKpis();
  return {
    data: data ? { count: data.lowStockCount } : undefined,
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

