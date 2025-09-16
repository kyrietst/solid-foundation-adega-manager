/**
 * useTopProductsData.ts - Hook especializado para Top Products (REFATORADO)
 * Context7 Pattern: Separação de lógica de negócio do componente de apresentação
 * Extrai toda a lógica de cálculo e API calls do TopProductsCard
 *
 * REFATORAÇÃO APLICADA:
 * - Business logic isolada em hook
 * - Cálculos de receita separados
 * - QueryFn extraída para função pura
 * - Formatação movida para utilities
 * - Tipos específicos definidos
 *
 * @version 2.0.0 - Container/Presentational (Context7)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface TopProduct {
  product_id: string;
  name: string;
  category: string;
  qty: number;
  revenue: number;
}

export interface UseTopProductsDataOptions {
  period?: number;
  limit?: number;
  useCurrentMonth?: boolean;
}

export interface UseTopProductsDataReturn {
  data: TopProduct[] | undefined;
  isLoading: boolean;
  error: Error | null;
  // Computed values for presentation
  totalRevenue: number;
  totalQuantity: number;
  hasData: boolean;
}

/**
 * Hook especializado para buscar e calcular dados dos top produtos
 * Separado da apresentação seguindo Context7 Container/Presentational pattern
 */
export const useTopProductsData = (options: UseTopProductsDataOptions = {}): UseTopProductsDataReturn => {
  const { period = 30, limit = 5, useCurrentMonth = true } = options;

  const { data: topProducts, isLoading, error } = useQuery({
    queryKey: ['top-products', period, limit, useCurrentMonth],
    queryFn: () => calculateTopProducts({ period, limit, useCurrentMonth }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Computed values for presentation
  const totalRevenue = topProducts?.reduce((sum, p) => sum + p.revenue, 0) || 0;
  const totalQuantity = topProducts?.reduce((sum, p) => sum + p.qty, 0) || 0;
  const hasData = topProducts && topProducts.length > 0;

  return {
    data: topProducts,
    isLoading,
    error,
    totalRevenue,
    totalQuantity,
    hasData: !!hasData,
  };
};

/**
 * Função pura para calcular top produtos
 * Isolada da lógica de React para melhor testabilidade
 */
export const calculateTopProducts = async ({
  period,
  limit,
  useCurrentMonth,
}: UseTopProductsDataOptions): Promise<TopProduct[]> => {
  console.log(`🏆 Top Products - Calculando top ${limit} produtos reais para ${useCurrentMonth ? 'mês atual' : period + ' dias'}`);

  // Calculate date range
  const { startDate, endDate } = calculateDateRange(useCurrentMonth, period);

  // Fetch sales data
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

  // Process and aggregate data
  const topProducts = processProductSalesData(salesData || [], limit);

  console.log(`🏆 Top ${topProducts.length} produtos calculados - Total receita: R$ ${topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}`);

  return topProducts;
};

/**
 * Calcula o range de datas baseado no período
 */
const calculateDateRange = (useCurrentMonth?: boolean, period?: number) => {
  const endDate = new Date();
  let startDate: Date;

  if (useCurrentMonth) {
    // Primeiro dia do mês atual
    startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  } else {
    // Últimos N dias
    startDate = new Date();
    startDate.setDate(endDate.getDate() - (period || 30));
  }

  return { startDate, endDate };
};

/**
 * Processa e agrega dados de vendas por produto
 */
const processProductSalesData = (salesData: any[], limit: number): TopProduct[] => {
  // Agrupar por produto e calcular totais
  const productMap = new Map<string, {
    product_id: string;
    name: string;
    category: string;
    qty: number;
    revenue: number;
  }>();

  salesData.forEach(item => {
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

  // Converter para array e ordenar por receita
  return Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};