/**
 * useCategoryMixData.ts - Hook especializado para Category Mix (REFATORADO)
 * Context7 Pattern: Separação de lógica de negócio do componente de apresentação
 * Extrai duplo useQuery + fallback strategy + cálculos do CategoryMixDonut
 *
 * REFATORAÇÃO APLICADA:
 * - Business logic isolada em hook
 * - Duplo useQuery com fallback strategy
 * - Cálculos de receita por categoria
 * - Lógica de fallback para estoque
 * - Estados computados derivados
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface CategoryMix {
  category: string;
  revenue: number;
}

export interface UseCategoryMixDataOptions {
  period?: number;
}

export interface UseCategoryMixDataReturn {
  data: CategoryMix[];
  isLoading: boolean;
  error: Error | null;
  // Computed values for presentation
  totalRevenue: number;
  hasRealSalesData: boolean;
  hasData: boolean;
}

/**
 * Hook especializado para buscar mix de categorias com fallback strategy
 * Primeiro tenta dados de vendas, depois fallback para estoque
 */
export const useCategoryMixData = (options: UseCategoryMixDataOptions = {}): UseCategoryMixDataReturn => {
  const { period = 30 } = options;

  // Primary query: sales data
  const salesQuery = useQuery({
    queryKey: ['category-mix-sales', period],
    queryFn: () => calculateCategoryMixFromSales(period),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fallback query: stock data (only runs if no sales data)
  const stockQuery = useQuery({
    queryKey: ['category-mix-stock'],
    queryFn: calculateCategoryMixFromStock,
    enabled: !salesQuery.data || salesQuery.data.length === 0,
    staleTime: 10 * 60 * 1000,
  });

  // Determine which data to use
  const data = salesQuery.data && salesQuery.data.length > 0
    ? salesQuery.data
    : stockQuery.data || [];

  const hasRealSalesData = salesQuery.data && salesQuery.data.length > 0;
  const isLoading = salesQuery.isLoading || (stockQuery.enabled && stockQuery.isLoading);
  const error = salesQuery.error || stockQuery.error;

  // Computed values
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const hasData = data.length > 0;

  return {
    data,
    isLoading,
    error,
    totalRevenue,
    hasRealSalesData,
    hasData,
  };
};

/**
 * Calcula mix de categorias baseado em vendas reais
 */
export const calculateCategoryMixFromSales = async (period: number): Promise<CategoryMix[]> => {
  try {
    console.log(`📊 Category Mix - Calculando receita por categoria dos últimos ${period} dias`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select(`
        sale_items(
          quantity,
          unit_price,
          products(category)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (salesError) throw salesError;

    // Process sales data
    const categoryRevenue = processSalesDataByCategory(salesData || []);

    const result = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    console.log(`📊 ${result.length} categorias calculadas - Total: R$ ${result.reduce((sum, c) => sum + c.revenue, 0).toFixed(2)}`);
    return result;
  } catch (error) {
    console.error('Erro ao buscar mix de categorias:', error);
    return [];
  }
};

/**
 * Calcula mix de categorias baseado no valor do estoque (fallback)
 */
export const calculateCategoryMixFromStock = async (): Promise<CategoryMix[]> => {
  console.log('📦 Category Mix - Fallback para dados de estoque');

  const { data, error } = await supabase
    .from('products')
    .select('category, price, stock_quantity')
    .gt('stock_quantity', 0);

  if (error) throw error;

  const categoryTotals = processStockDataByCategory(data || []);

  const result = Object.entries(categoryTotals).map(([category, revenue]) => ({
    category,
    revenue: revenue as number
  }));

  console.log(`📦 ${result.length} categorias do estoque calculadas`);
  return result;
};

/**
 * Processa dados de vendas agrupando por categoria
 */
const processSalesDataByCategory = (salesData: any[]): { [key: string]: number } => {
  const categoryRevenue: { [key: string]: number } = {};

  salesData.forEach(sale => {
    sale.sale_items?.forEach((item: any) => {
      const category = item.products?.category || 'Sem Categoria';
      const revenue = (item.quantity || 0) * (item.unit_price || 0);
      categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
    });
  });

  return categoryRevenue;
};

/**
 * Processa dados de estoque agrupando por categoria
 */
const processStockDataByCategory = (stockData: any[]): { [key: string]: number } => {
  return stockData.reduce((acc: any, product: any) => {
    const category = product.category || 'Sem Categoria';
    const value = Number(product.price || 0) * Number(product.stock_quantity || 0);
    acc[category] = (acc[category] || 0) + value;
    return acc;
  }, {});
};