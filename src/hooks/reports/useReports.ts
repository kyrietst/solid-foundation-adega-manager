import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { DateRange } from 'react-day-picker';

export interface ReportFilter {
  dateRange: DateRange | undefined;
  categoryId?: string;
  sellerId?: string;
  paymentMethodId?: string;
}

export interface SalesByCategory {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface SalesTrend {
  period: string;
  sales: number;
  customers: number;
  average_ticket: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  purchases: number;
  total_spent: number;
}

const fetchSalesByCategory = async (filter: ReportFilter): Promise<SalesByCategory[]> => {
  let query = supabase
    .from('sale_items')
    .select(`
      id,
      quantity,
      subtotal,
      product:products(name, category)
    `)
    .gte('created_at', filter.dateRange?.from?.toISOString())
    .lte('created_at', filter.dateRange?.to?.toISOString() || filter.dateRange?.from?.toISOString());

  if (filter.categoryId) {
    query = query.eq('product_id', filter.categoryId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Processar dados para agrupar por categoria
  const categories = new Map<string, { total: number; count: number }>();
  
  data?.forEach(item => {
    const category = item.product?.category || 'Sem Categoria';
    const current = categories.get(category) || { total: 0, count: 0 };
    
    categories.set(category, {
      total: current.total + (item.subtotal || 0),
      count: current.count + (item.quantity || 0)
    });
  });

  // Calcular o total para porcentagens
  const total = Array.from(categories.values()).reduce((sum, { total }) => sum + total, 0);

  // Converter para array e adicionar porcentagens
  return Array.from(categories.entries()).map(([category, { total: catTotal, count }]) => ({
    category,
    total: catTotal,
    count,
    percentage: total > 0 ? (catTotal / total) * 100 : 0
  }));
};

const fetchSalesTrends = async (filter: ReportFilter): Promise<SalesTrend[]> => {
  const { data, error } = await supabase
    .rpc('get_sales_trends', {
      start_date: filter.dateRange?.from?.toISOString(),
      end_date: filter.dateRange?.to?.toISOString() || filter.dateRange?.from?.toISOString(),
      period: 'month' // Pode ser 'day', 'week', 'month', 'quarter', 'year'
    });

  if (error) throw error;
  return data || [];
};

const fetchTopProducts = async (filter: ReportFilter, limit = 10): Promise<TopProduct[]> => {
  const { data, error } = await supabase
    .rpc('get_top_products', {
      start_date: filter.dateRange?.from?.toISOString(),
      end_date: filter.dateRange?.to?.toISOString() || filter.dateRange?.from?.toISOString(),
      limit_count: limit
    });

  if (error) throw error;
  return data || [];
};

export const useReports = (filter: ReportFilter) => {
  const salesByCategory = useQuery({
    queryKey: ['reports', 'sales-by-category', filter],
    queryFn: () => fetchSalesByCategory(filter)
  });

  const salesTrends = useQuery({
    queryKey: ['reports', 'sales-trends', filter],
    queryFn: () => fetchSalesTrends(filter)
  });

  const topProducts = useQuery({
    queryKey: ['reports', 'top-products', filter],
    queryFn: () => fetchTopProducts(filter, 5)
  });

  const isLoading = salesByCategory.isLoading || salesTrends.isLoading || topProducts.isLoading;
  const error = salesByCategory.error || salesTrends.error || topProducts.error;

  return {
    salesByCategory: salesByCategory.data || [],
    salesTrends: salesTrends.data || [],
    topProducts: topProducts.data || [],
    isLoading,
    error
  };
};
