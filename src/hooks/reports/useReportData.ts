import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';

interface ReportFilters {
  dateRange: DateRange | undefined;
  periodType: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  categoryId?: string;
  sellerId?: string;
  paymentMethodId?: string;
  customerId?: string;
}

// Tipos para os dados dos relatórios
export interface SalesTrendData {
  period_start: string;
  period_label: string;
  total_sales: number;
  total_orders: number;
  total_customers: number;
  average_ticket: number;
}

export interface TopProductData {
  product_id: string;
  product_name: string;
  category: string;
  quantity_sold: number;
  total_revenue: number;
  average_price: number;
}

export interface CustomerMetricsData {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  average_purchase_frequency: number;
  average_order_value: number;
  customer_retention_rate: number;
}

export interface InventoryMetricsData {
  total_products: number;
  out_of_stock: number;
  low_stock: number;
  total_inventory_value: number;
  average_stock_quantity: number;
}

// --- tipos auxiliares
export interface CustomerSummaryItem {
  period_start: string;
  period_label: string;
  new_customers: number;
  returning_customers: number;
  total_customers: number;
  average_order_value: number;
}

export interface InventorySummaryItem {
  period_start: string;
  period_label: string;
  products_sold: number;
  products_added: number;
  out_of_stock: number;
  low_stock: number;
}

// Métrica de retenção (30/60/90 dias)
export interface CustomerRetentionMetric {
  days_interval: string;
  returning_customers: number;
}

// Funções para buscar dados do Supabase
const fetchSalesTrends = async (
  startDate: string,
  endDate: string,
  periodType: string = 'day'
) => {
  const { data, error } = await supabase.rpc('get_sales_trends', {
    start_date: startDate,
    end_date: endDate,
    period_type: periodType,
  });
  if (error) {
    console.error('Error fetching sales trends:', error);
    throw new Error(error.message);
  }
  return data;
};

const fetchTopProducts = async (
  startDate: string,
  endDate: string,
  limit = 10
) => {
  const { data, error } = await supabase.rpc('get_top_products', {
    start_date: startDate,
    end_date: endDate,
    limit_count: limit,
  });
  if (error) throw new Error(error.message);
  return data;
};

const fetchCustomerMetrics = async (
  startDate: string,
  endDate: string
) => {
  const { data, error } = await supabase.rpc('get_customer_metrics', {
    start_date: startDate,
    end_date: endDate,
  });
  if (error) throw new Error(error.message);
  return data ? data[0] : {
    total_customers: 0,
    new_customers: 0,
    returning_customers: 0,
    average_purchase_frequency: 0,
    average_order_value: 0,
    customer_retention_rate: 0
  };
};

const fetchCustomerSummary = async (
  startDate: string,
  endDate: string,
  periodType: string
) => {
  const { data, error } = await supabase.rpc('get_customer_summary', {
    start_date: startDate,
    end_date: endDate,
    period_type: periodType,
  });
  if (error) throw new Error(error.message);
  return data;
};

const fetchInventorySummary = async (
  startDate: string,
  endDate: string,
  periodType: string
) => {
  const { data, error } = await supabase.rpc('get_inventory_summary', {
    start_date: startDate,
    end_date: endDate,
    period_type: periodType,
  });
  if (error) throw new Error(error.message);
  return data;
};

const fetchInventoryMetrics = async () => {
  const { data, error } = await supabase.rpc('get_inventory_metrics');
  if (error) throw new Error(error.message);
  return data ? data[0] : {
    total_products: 0,
    out_of_stock: 0,
    low_stock_items: 0,
    total_inventory_value: 0,
    average_stock_quantity: 0
  };
};

// --- hook principal
export const useReportData = (filters: ReportFilters) => {
  const startDate = filters.dateRange?.from?.toISOString();
  const endDate = (filters.dateRange?.to ?? filters.dateRange?.from)?.toISOString();
  const periodType = filters.periodType === 'custom' ? 'day' : filters.periodType;

  const isEnabled = !!startDate && !!endDate;

  const queryOptions = {
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // auto-refresh a cada 30s
  };

  const salesTrendsQuery = useQuery({
    queryKey: ['reports', 'sales-trends', startDate, endDate, periodType],
    queryFn: () => fetchSalesTrends(startDate!, endDate!, periodType),
    ...queryOptions,
  });

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products', startDate, endDate],
    queryFn: () => fetchTopProducts(startDate!, endDate!),
    ...queryOptions,
  });

  const customerSummaryQuery = useQuery({
    queryKey: ['reports', 'customer-summary', startDate, endDate, periodType],
    queryFn: () => fetchCustomerSummary(startDate!, endDate!, periodType),
    ...queryOptions,
  });

  const customerMetricsQuery = useQuery<CustomerMetricsData>({
    queryKey: ['reports', 'customer-metrics', startDate, endDate],
    queryFn: () => fetchCustomerMetrics(startDate!, endDate!),
    ...queryOptions,
  });

  const inventorySummaryQuery = useQuery<InventorySummaryItem[]>({
    queryKey: ['reports', 'inventory-summary', startDate, endDate, periodType],
    queryFn: () => fetchInventorySummary(startDate!, endDate!, periodType),
    ...queryOptions,
  });

  const inventoryMetricsQuery = useQuery<InventoryMetricsData>({
    queryKey: ['reports', 'inventory-metrics'],
    queryFn: fetchInventoryMetrics,
    ...queryOptions,
  });

  const isLoading =
    salesTrendsQuery.isLoading ||
    topProductsQuery.isLoading ||
    customerMetricsQuery.isLoading ||
    customerSummaryQuery.isLoading ||
    inventorySummaryQuery.isLoading ||
    inventoryMetricsQuery.isLoading;

  const error =
    salesTrendsQuery.error ||
    topProductsQuery.error ||
    customerMetricsQuery.error ||
    customerSummaryQuery.error ||
    inventorySummaryQuery.error ||
    inventoryMetricsQuery.error;

  const refetch = () => {
    salesTrendsQuery.refetch();
    topProductsQuery.refetch();
    customerMetricsQuery.refetch();
    customerSummaryQuery.refetch();
    inventorySummaryQuery.refetch();
    inventoryMetricsQuery.refetch();
  };

  // Mapeia os dados para o formato esperado pelos componentes de UI
  // Calcula métricas agregadas de vendas
  const aggregatedSales = (salesTrendsQuery.data || []) as any[];
  const totalSalesAmount = aggregatedSales.reduce((sum, row) => sum + Number(row.total_sales || 0), 0);
  const totalOrders = aggregatedSales.reduce((sum, row) => sum + Number(row.total_orders || 0), 0);
  const avgTicket = totalOrders > 0 ? totalSalesAmount / totalOrders : 0;

  const salesMetrics = {
    total_sales: totalSalesAmount,
    total_orders: totalOrders,
    average_ticket: avgTicket,
    items_sold: 0,
    refunds_amount: 0,
    refunds_count: 0,
    sales_growth: 0,
    avg_items_per_order: 0,
  };

  const salesData = {
    salesMetrics,
    sales_trend: salesTrendsQuery.data || [],
    top_products: topProductsQuery.data || [],
    // Estas propriedades ainda não são buscadas, portanto fornecemos arrays vazios por padrão
    sales_by_category: [],
    payment_methods: [],
  };

  // --- normaliza métricas de inventário ---
  const rawInv = inventoryMetricsQuery.data || {} as any;
  const normalizedInventoryMetrics = {
    total_products: rawInv.total_products ?? 0,
    out_of_stock: rawInv.out_of_stock ?? 0,
    low_stock: rawInv.low_stock_items ?? rawInv.low_stock ?? 0,
    total_inventory_value: rawInv.total_stock_value ?? rawInv.total_inventory_value ?? 0,
    average_stock_quantity: rawInv.average_stock_quantity ?? (
      rawInv.total_stock_quantity && rawInv.total_products
        ? rawInv.total_stock_quantity / rawInv.total_products
        : 0
    ),
  };

  const inventoryData = {
    // Métricas agregadas padronizadas
    ...normalizedInventoryMetrics,
    // Resumo por período ou movimentos recentes
    recent_movements: inventorySummaryQuery.data || [],
    low_stock_products: [],
  };

  // --- normaliza métricas de cliente ---
  const rawCust = customerMetricsQuery.data || {} as any;
  const normalizedCustomerMetrics = {
    total_customers: rawCust.total_customers ?? 0,
    new_customers: rawCust.new_customers ?? 0,
    returning_customers: rawCust.returning_customers ?? 0,
    average_purchase_frequency: rawCust.average_purchase_frequency ?? 0,
    average_order_value: rawCust.average_order_value ?? 0,
    customer_retention_rate: rawCust.customer_retention_rate ?? 0,
  };

  const customerData = {
    ...normalizedCustomerMetrics,
    acquisition: customerSummaryQuery.data || [],
    top_customers: [],
    segments: [],
  };

  const financialData = null; // Ainda não implementado

  return {
    // Dados agregados prontos para os componentes de relatório
    salesData,
    inventoryData,
    customerData,
    financialData,

    // Status
    isLoading,
    error,
    refetch,
  };
};

// Hook utilitário para invalidar todas as queries de relatórios
import { useQueryClient } from '@tanstack/react-query';
export const useInvalidateReports = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['reports'] });
};
