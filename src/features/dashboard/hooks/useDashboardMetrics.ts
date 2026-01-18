import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { getMonthStartDate, getNowSaoPaulo } from '@/features/dashboard/utils/dateHelpers';

// Types
export interface LowStockProduct {
  id: string;
  name: string;
  current_stock: number;
  minimum_stock: number;
  stock_packages: number;
  stock_units_loose: number;
  price: number;
  category: string;
  limit_packages: number;
  limit_units: number;
  is_legacy_override: boolean;
}

export interface SalesChartData {
  period: string;
  period_label: string;
  revenue: number;
  orders: number;
  delivery_revenue?: number;
  presencial_revenue?: number;
}

export interface TopProduct {
  product_id: string;
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

export interface ComparisonData {
  delivery_orders: number;
  delivery_revenue: number;
  delivery_avg_ticket: number;
  instore_orders: number;
  instore_revenue: number;
  instore_avg_ticket: number;
  delivery_growth_rate: number;
  instore_growth_rate: number;
}

// 1. Low Stock Alerts Hook
export function useLowStockAlerts(limit: number = 5) {
  return useQuery({
    queryKey: ['low-stock-products', limit],
    queryFn: async (): Promise<LowStockProduct[]> => {
      const { data, error } = await supabase
        .rpc('get_low_stock_products', { p_limit: limit });

      if (error) {
        console.error('❌ Erro ao buscar produtos com estoque baixo:', error);
        throw error;
      }
      return (data as unknown as LowStockProduct[]) || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// 2. Sales Chart Hook
export function useSalesChart() {
  return useQuery({
    queryKey: ['sales-chart-data', 'mtd'],
    queryFn: async (): Promise<SalesChartData[]> => {
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();

      const { data: rpcData, error } = await supabase
        .rpc('get_sales_chart_data', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString()
        });

      if (error) {
        console.error('❌ Erro ao buscar dados do gráfico via RPC:', error);
        throw error;
      }

      const dailyData = new Map<string, SalesChartData>();
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        const [y, m, d] = dateKey.split('-').map(Number);
        const displayDate = new Date(y, m - 1, d);

        dailyData.set(dateKey, {
          period: dateKey,
          period_label: displayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          revenue: 0,
          orders: 0,
          delivery_revenue: 0,
          presencial_revenue: 0
        });
      }

      ((rpcData as unknown as any[]) || []).forEach((row: any) => {
        const dateKey = row.sale_date;
        if (dailyData.has(dateKey)) {
          dailyData.set(dateKey, {
            period: dateKey,
            period_label: row.period_label,
            revenue: Math.round(Number(row.total_revenue) * 100) / 100,
            orders: Number(row.total_orders),
            delivery_revenue: Math.round(Number(row.delivery_revenue) * 100) / 100,
            presencial_revenue: Math.round(Number(row.presencial_revenue) * 100) / 100
          });
        }
      });

      return Array.from(dailyData.values());
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

// 3. Top Products Hook
export function useTopProducts(limit: number = 5) {
  return useQuery({
    queryKey: ['top-products', 'mtd', limit],
    queryFn: async (): Promise<TopProduct[]> => {
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();

      const { data: salesData, error: salesError } = await supabase
        .from('sale_items')
        .select(`
          product_id,
          quantity,
          unit_price,
          products!inner(name, category)
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (salesError) {
        console.error('❌ Erro ao buscar vendas para top produtos:', salesError);
        throw salesError;
      }

      const productMap = new Map<string, TopProduct>();

      ((salesData as unknown as any[]) || []).forEach((item: any) => {
        const productId = item.product_id;
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        const revenue = quantity * price;

        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.qty += quantity;
          existing.revenue += revenue;
        } else {
          productMap.set(productId, {
            product_id: productId,
            name: (item.products as any)?.name || 'Produto sem nome',
            category: (item.products as any)?.category || 'Sem categoria',
            qty: quantity,
            revenue: revenue
          });
        }
      });

      return Array.from(productMap.values())
        .sort((a, b) => b.qty - a.qty)
        .slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// 4. Delivery vs Instore Comparison Hook
export function useDeliveryVsInstore() {
  return useQuery({
    queryKey: ['delivery-vs-instore-dashboard', 'mtd'],
    queryFn: async (): Promise<ComparisonData> => {
      const endDate = getNowSaoPaulo();
      const startDate = getMonthStartDate();

      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1);
      const prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), 1);

      // Current Sales
      const { data: currentSales, error: currentError } = await supabase
        .from('sales')
        .select('delivery_type, final_amount, delivery, delivery_fee')
        .eq('status', 'completed' as any)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (currentError) throw currentError;

      // Previous Sales
      const { data: prevSales } = await supabase
        .from('sales')
        .select('delivery_type, final_amount, delivery, delivery_fee')
        .eq('status', 'completed' as any)
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .not('final_amount', 'is', null);

      // Calculations
      const isDeliveryCheck = (s: any) => s.delivery === true || (s.delivery_fee || 0) > 0;

      const deliverySales = ((currentSales as unknown as any[]) || []).filter((s: any) => isDeliveryCheck(s));
      const presencialSales = ((currentSales as unknown as any[]) || []).filter((s: any) => !isDeliveryCheck(s));

      const deliveryOrders = deliverySales.length;
      const deliveryRevenue = deliverySales.reduce((sum: number, s: any) => sum + Number(s.final_amount || 0), 0);
      const deliveryAvgTicket = deliveryOrders > 0 ? deliveryRevenue / deliveryOrders : 0;

      const instoreOrders = presencialSales.length;
      const instoreRevenue = presencialSales.reduce((sum: number, s: any) => sum + Number(s.final_amount || 0), 0);
      const instoreAvgTicket = instoreOrders > 0 ? instoreRevenue / instoreOrders : 0;

      const prevDeliveryRevenue = ((prevSales as unknown as any[]) || [])
        .filter((s: any) => isDeliveryCheck(s))
        .reduce((sum: number, s: any) => sum + Number(s.final_amount || 0), 0);
      const prevInstoreRevenue = ((prevSales as unknown as any[]) || [])
        .filter((s: any) => !isDeliveryCheck(s))
        .reduce((sum: number, s: any) => sum + Number(s.final_amount || 0), 0);

      const deliveryGrowthRate = prevDeliveryRevenue > 0 ?
        ((deliveryRevenue - prevDeliveryRevenue) / prevDeliveryRevenue) * 100 : 0;
      const instoreGrowthRate = prevInstoreRevenue > 0 ?
        ((instoreRevenue - prevInstoreRevenue) / prevInstoreRevenue) * 100 : 0;

      return {
        delivery_orders: deliveryOrders,
        delivery_revenue: deliveryRevenue,
        delivery_avg_ticket: deliveryAvgTicket,
        instore_orders: instoreOrders,
        instore_revenue: instoreRevenue,
        instore_avg_ticket: instoreAvgTicket,
        delivery_growth_rate: deliveryGrowthRate,
        instore_growth_rate: instoreGrowthRate
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}