/**
 * useTopProductsData.ts - Hook com Error Handling robusto (REFATORADO)
 * Context7 Pattern: Elimina falha silenciosa identificada na análise
 * Substitui try/catch que retorna [] por error handling adequado
 *
 * REFATORAÇÃO BASEADA NA ANÁLISE:
 * - Remove falha silenciosa (return [] no catch)
 * - Adiciona onError com feedback ao usuário
 * - Logging estruturado com context
 * - Toast notifications para retry
 * - Error states claros na UI
 *
 * @version 2.0.0 - Error Handling Implementation (Context7)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useErrorHandler } from '@/core/error-handling/useErrorHandler';
import { toast } from 'sonner';

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
  // Error handling
  errorState: any;
  retry: () => void;
}

/**
 * Hook especializado para buscar e calcular dados dos top produtos
 * REFATORADO: Remove falha silenciosa e adiciona error handling robusto
 */
export const useTopProductsData = (options: UseTopProductsDataOptions = {}): UseTopProductsDataReturn => {
  const { period = 30, limit = 5, useCurrentMonth = true } = options;
  const queryClient = useQueryClient();
  const { errorState, handleError } = useErrorHandler();

  const queryResult = useQuery({
    queryKey: ['top-products', period, limit, useCurrentMonth],
    queryFn: () => calculateTopProducts({ period, limit, useCurrentMonth }),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    // NOVO: Error handling adequado (substitui try/catch com return [])
    onError: (error: Error) => {
      // Logging estruturado (substitui console.error simples)
      handleError(error, {
        feature: 'dashboard',
        operation: 'fetchTopProducts',
        metadata: {
          period,
          limit,
          useCurrentMonth,
          queryKey: ['top-products', period, limit, useCurrentMonth],
        }
      });

      // Feedback ao usuário (elimina falha silenciosa)
      toast.error(`Falha ao carregar top produtos: ${error.message}`, {
        description: 'Clique para tentar novamente',
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            queryClient.invalidateQueries(['top-products']);
          }
        },
        duration: 8000,
      });
    },
    // Retry automático para erros de rede
    retry: (failureCount, error) => {
      // Não fazer retry em erros de autenticação ou validação
      if (error.name === 'AuthError' || error.name === 'ValidationError') {
        return false;
      }
      // Máximo 3 tentativas para outros erros
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Manual retry function
  const retry = () => {
    queryClient.invalidateQueries(['top-products']);
  };

  // Computed values
  const totalRevenue = queryResult.data?.reduce((sum, p) => sum + p.revenue, 0) || 0;
  const totalQuantity = queryResult.data?.reduce((sum, p) => sum + p.qty, 0) || 0;
  const hasData = queryResult.data && queryResult.data.length > 0;

  return {
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    totalRevenue,
    totalQuantity,
    hasData: !!hasData,
    errorState,
    retry,
  };
};

/**
 * Função pura para calcular top produtos
 * REFATORADO: Remove try/catch com falha silenciosa, permite error propagation
 */
export const calculateTopProducts = async ({
  period,
  limit,
  useCurrentMonth,
}: UseTopProductsDataOptions): Promise<TopProduct[]> => {
  console.log(`🏆 [TopProducts] Calculating top ${limit} products for ${useCurrentMonth ? 'current month' : period + ' days'}`);

  // Calculate date range
  const { startDate, endDate } = calculateDateRange(useCurrentMonth, period);

  // REFATORADO: Remove try/catch que fazia falha silenciosa
  // Agora erros são propagados corretamente para useQuery.onError
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
    // Error específico com context
    throw new Error(`Failed to fetch sales data: ${salesError.message}`);
  }

  if (!salesData || salesData.length === 0) {
    console.log('🏆 [TopProducts] No sales data found for the period');
    return [];
  }

  // Process and aggregate data
  const topProducts = processProductSalesData(salesData, limit);

  console.log(`🏆 [TopProducts] Successfully calculated ${topProducts.length} products - Total revenue: R$ ${topProducts.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}`);

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

    // Validação de dados
    if (!productId) {
      console.warn('[TopProducts] Item without product_id found, skipping');
      return;
    }

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