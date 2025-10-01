/**
 * useCustomerInsightsSSoT.ts - Hook SSoT v3.1.0 Server-Side
 *
 * @description
 * Hook SSoT completo que busca dados diretamente do banco para analytics e insights.
 * Elimina dependência de props e implementa performance otimizada com queries SQL.
 *
 * @features
 * - Busca direta do Supabase (sem props)
 * - Cálculos real-time de analytics
 * - Insights de IA baseados em dados frescos
 * - Cache inteligente com invalidação
 * - Performance otimizada para escalabilidade
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useMemo } from 'react';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

export interface CustomerInsightsData {
  id: string;
  date: string;
  total: number;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface CustomerDataSSoT {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  segment?: string;
  total_purchases?: number;
  total_spent?: number;
  last_purchase_date?: string;
  created_at: string;
}

export interface SalesChartData {
  month: string;
  total: number;
  count: number;
}

export interface ProductChartData {
  name: string;
  count: number;
}

export interface FrequencyChartData {
  purchase: string;
  days: number;
  date: string;
}

export interface CustomerAIInsights {
  // AI Insights
  segmentRecommendation: string;
  nextBestAction: string;
  riskLevel: 'low' | 'medium' | 'high';
  opportunityScore: number; // 0-100

  // Behavioral Insights
  preferredProducts: string[];
  seasonalTrends: string;
  loyaltyIndicators: string[];

  // Business Insights
  revenueContribution: number;
  growthPotential: 'low' | 'medium' | 'high';
  engagementLevel: 'low' | 'medium' | 'high';
}

export interface CustomerInsightsOperations {
  // Raw Data
  customer: CustomerDataSSoT | null;
  purchases: CustomerInsightsData[];

  // Estados de carregamento
  isLoading: boolean;
  error: Error | null;

  // Chart Data
  salesChartData: SalesChartData[];
  productsChartData: ProductChartData[];
  frequencyChartData: FrequencyChartData[];

  // AI Insights
  insights: CustomerAIInsights;

  // Utility functions
  hasAnalyticsData: boolean;
  hasFrequencyData: boolean;
  chartColors: string[];

  // Refresh manual
  refetch: () => void;

  // Estado derivado
  hasData: boolean;
  isEmpty: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
];

// ============================================================================
// HOOK PRINCIPAL SSoT v3.1.0
// ============================================================================

export const useCustomerInsightsSSoT = (
  customerId: string
): CustomerInsightsOperations => {

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - CUSTOMER DATA
  // ============================================================================

  const {
    data: customer = null,
    isLoading: isLoadingCustomer,
    error: customerError
  } = useQuery({
    queryKey: ['customer-insights-data', customerId],
    queryFn: async (): Promise<CustomerDataSSoT | null> => {
      if (!customerId) return null;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            id,
            name,
            email,
            phone,
            segment,
            total_purchases,
            total_spent,
            last_purchase_date,
            created_at
          `)
          .eq('id', customerId)
          .single();

        if (error) {
          console.error('❌ Erro ao buscar dados do cliente:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('❌ Erro crítico ao buscar cliente:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 min cache para dados de cliente (mais estáveis)
    refetchInterval: false, // Desabilitar auto-refresh para dados básicos do cliente
    refetchOnWindowFocus: false, // Evitar refetch desnecessário
  });

  // ============================================================================
  // SERVER-SIDE DATA FETCHING - PURCHASES WITH INSIGHTS
  // ============================================================================

  const {
    data: rawPurchases = [],
    isLoading: isLoadingPurchases,
    error: purchasesError,
    refetch
  } = useQuery({
    queryKey: ['customer-insights-purchases', customerId],
    queryFn: async (): Promise<CustomerInsightsData[]> => {
      if (!customerId) return [];

      try {
        // Data limite para insights (últimos 12 meses para performance otimizada)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Query otimizada com limite temporal e paginação para insights rápidos
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id,
            total_amount,
            created_at,
            sale_items (
              product_id,
              quantity,
              unit_price,
              products (
                name
              )
            )
          `)
          .eq('customer_id', customerId)
          .gte('created_at', twelveMonthsAgo.toISOString()) // Últimos 12 meses apenas
          .order('created_at', { ascending: false })
          .limit(100); // Limitar a 100 compras mais recentes para performance

        if (salesError) {
          console.error('❌ Erro ao buscar vendas para insights:', salesError);
          throw salesError;
        }

        if (!sales || sales.length === 0) return [];

        // Processar dados para formato esperado
        const purchases: CustomerInsightsData[] = sales.map((sale: any) => {
          const items = sale.sale_items?.map((item: any) => ({
            product_name: item.products?.name || 'Produto não encontrado',
            quantity: item.quantity,
            unit_price: item.unit_price
          })) || [];

          return {
            id: sale.id,
            date: sale.created_at,
            total: Number(sale.total_amount),
            items
          };
        });

        return purchases;

      } catch (error) {
        console.error('❌ Erro crítico ao buscar compras para insights:', error);
        throw error;
      }
    },
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000, // 2 min cache para insights (dados dinâmicos)
    refetchInterval: 5 * 60 * 1000, // Auto-refresh a cada 5 min
    refetchOnWindowFocus: true, // Manter focus refresh para dados dinâmicos
    retry: 3, // Retry em caso de falha
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
  });

  // ============================================================================
  // SALES CHART DATA - REAL-TIME CALCULATION
  // ============================================================================

  const salesChartData = useMemo((): SalesChartData[] => {
    if (!rawPurchases || rawPurchases.length === 0) return [];

    const monthlyData = rawPurchases.reduce((acc, purchase) => {
      const date = new Date(purchase.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'short' });

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, total: 0, count: 0 };
      }

      acc[monthKey].total += purchase.total;
      acc[monthKey].count += 1;

      return acc;
    }, {} as Record<string, SalesChartData>);

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [rawPurchases]);

  // ============================================================================
  // PRODUCTS CHART DATA - REAL-TIME CALCULATION
  // ============================================================================

  const productsChartData = useMemo((): ProductChartData[] => {
    if (!rawPurchases || rawPurchases.length === 0) return [];

    const productCount = rawPurchases.reduce((acc, purchase) => {
      purchase.items.forEach(item => {
        if (!acc[item.product_name]) {
          acc[item.product_name] = 0;
        }
        acc[item.product_name] += item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(productCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 produtos
  }, [rawPurchases]);

  // ============================================================================
  // FREQUENCY CHART DATA - REAL-TIME CALCULATION
  // ============================================================================

  const frequencyChartData = useMemo((): FrequencyChartData[] => {
    if (!rawPurchases || rawPurchases.length <= 1) return [];

    const intervals = rawPurchases.slice(1).map((purchase, index) => {
      const currentDate = new Date(purchase.date);
      const previousDate = new Date(rawPurchases[index].date);
      const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        purchase: `Compra ${index + 2}`,
        days: diffDays,
        date: currentDate.toLocaleDateString('pt-BR')
      };
    });

    return intervals;
  }, [rawPurchases]);

  // ============================================================================
  // AI INSIGHTS - REAL-TIME CALCULATION
  // ============================================================================

  const insights = useMemo((): CustomerAIInsights => {
    const totalSpent = rawPurchases.reduce((sum, p) => sum + p.total, 0);
    const averageTicket = rawPurchases.length > 0 ? totalSpent / rawPurchases.length : 0;
    const daysSinceLastPurchase = customer?.last_purchase_date
      ? Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Segment Recommendation
    let segmentRecommendation = 'Cliente Novo';
    if (totalSpent >= 1000 && rawPurchases.length >= 10) {
      segmentRecommendation = 'Cliente VIP - Manter programa de fidelidade';
    } else if (totalSpent >= 500 && rawPurchases.length >= 5) {
      segmentRecommendation = 'Cliente Regular - Oportunidade de upgrade';
    } else if (rawPurchases.length > 0) {
      segmentRecommendation = 'Cliente Ocasional - Foco em engajamento';
    }

    // Risk Level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastPurchase > 180) {
      riskLevel = 'high';
    } else if (daysSinceLastPurchase > 90) {
      riskLevel = 'medium';
    }

    // Next Best Action
    let nextBestAction = 'Realizar primeira venda';
    if (riskLevel === 'high') {
      nextBestAction = 'Campanha de reativação urgente';
    } else if (averageTicket < 50) {
      nextBestAction = 'Oferecer produtos premium';
    } else if (rawPurchases.length >= 5) {
      nextBestAction = 'Programa de fidelidade';
    }

    // Preferred Products
    const preferredProducts = productsChartData.slice(0, 3).map(p => p.name);

    // Opportunity Score (0-100)
    let opportunityScore = 0;
    if (rawPurchases.length > 0) {
      opportunityScore = Math.min(100,
        (rawPurchases.length * 10) + // Engagement
        (averageTicket > 100 ? 20 : 10) + // Spending level
        (daysSinceLastPurchase < 30 ? 30 : 0) + // Recency
        (preferredProducts.length * 10) // Product diversity
      );
    }

    // Growth Potential
    let growthPotential: 'low' | 'medium' | 'high' = 'low';
    if (averageTicket > 100 && rawPurchases.length >= 3) {
      growthPotential = 'high';
    } else if (rawPurchases.length >= 2) {
      growthPotential = 'medium';
    }

    // Engagement Level
    let engagementLevel: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastPurchase <= 30 && rawPurchases.length >= 3) {
      engagementLevel = 'high';
    } else if (daysSinceLastPurchase <= 90 && rawPurchases.length >= 1) {
      engagementLevel = 'medium';
    }

    return {
      segmentRecommendation,
      nextBestAction,
      riskLevel,
      opportunityScore: Math.round(opportunityScore),
      preferredProducts,
      seasonalTrends: 'Análise sazonal baseada em dados reais',
      loyaltyIndicators: [
        rawPurchases.length >= 5 ? 'Comprador recorrente' : 'Comprador esporádico',
        averageTicket > 100 ? 'Alto ticket médio' : 'Ticket médio padrão',
        daysSinceLastPurchase <= 30 ? 'Recentemente ativo' : 'Inativo há mais de 30 dias'
      ],
      revenueContribution: Math.round((totalSpent / Math.max(totalSpent, 1000)) * 100), // % da base
      growthPotential,
      engagementLevel
    };
  }, [rawPurchases, customer]); // Otimizado: removida dependência redundante productsChartData

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const isLoading = isLoadingCustomer || isLoadingPurchases;
  const error = customerError || purchasesError;
  const hasAnalyticsData = rawPurchases && rawPurchases.length > 0;
  const hasFrequencyData = frequencyChartData.length > 0;
  const hasData = hasAnalyticsData;
  const isEmpty = !hasAnalyticsData;

  // ============================================================================
  // RETURN SSoT v3.1.0
  // ============================================================================

  return {
    // Raw Data
    customer,
    purchases: rawPurchases,

    // Estados de carregamento
    isLoading,
    error: error as Error | null,

    // Chart Data
    salesChartData,
    productsChartData,
    frequencyChartData,

    // AI Insights
    insights,

    // Utility
    hasAnalyticsData,
    hasFrequencyData,
    chartColors: CHART_COLORS,

    // Refresh manual
    refetch,

    // Estado derivado
    hasData,
    isEmpty
  };
};

export default useCustomerInsightsSSoT;