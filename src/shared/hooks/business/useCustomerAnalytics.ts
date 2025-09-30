/**
 * useCustomerAnalytics.ts - Hook para analytics e insights do cliente
 *
 * @description
 * Hook SSoT v3.0.0 que centraliza todos os cálculos de analytics,
 * gráficos e insights de IA para clientes.
 *
 * @features
 * - Dados para gráfico de vendas por mês
 * - Top produtos mais comprados
 * - Análise de frequência de compras
 * - Insights de IA integrados
 * - Métricas estatísticas avançadas
 * - Formatação para charts Recharts
 *
 * @author Adega Manager Team
 * @version 3.0.0 - Business Logic Centralization
 */

import { useMemo } from 'react';
import { type Purchase } from './useCustomerPurchaseHistory';

// ============================================================================
// TYPES E INTERFACES
// ============================================================================

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

export interface CustomerAnalyticsOperations {
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
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
];

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useCustomerAnalytics = (
  purchases: Purchase[] = [],
  customerData?: {
    segmento?: string;
    totalCompras?: number;
    valorTotalCompras?: number;
    ultimaCompra?: string;
  }
): CustomerAnalyticsOperations => {

  // ============================================================================
  // DADOS PARA GRÁFICO DE VENDAS POR MÊS
  // ============================================================================

  const salesChartData = useMemo((): SalesChartData[] => {
    if (!purchases || purchases.length === 0) return [];

    const monthlyData = purchases.reduce((acc, purchase) => {
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
  }, [purchases]);

  // ============================================================================
  // DADOS PARA GRÁFICO DE PRODUTOS MAIS COMPRADOS
  // ============================================================================

  const productsChartData = useMemo((): ProductChartData[] => {
    if (!purchases || purchases.length === 0) return [];

    const productCount = purchases.reduce((acc, purchase) => {
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
  }, [purchases]);

  // ============================================================================
  // DADOS PARA GRÁFICO DE FREQUÊNCIA DE COMPRAS
  // ============================================================================

  const frequencyChartData = useMemo((): FrequencyChartData[] => {
    if (!purchases || purchases.length <= 1) return [];

    const intervals = purchases.slice(1).map((purchase, index) => {
      const currentDate = new Date(purchase.date);
      const previousDate = new Date(purchases[index].date);
      const diffTime = Math.abs(currentDate.getTime() - previousDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        purchase: `Compra ${index + 2}`,
        days: diffDays,
        date: currentDate.toLocaleDateString('pt-BR')
      };
    });

    return intervals;
  }, [purchases]);

  // ============================================================================
  // INSIGHTS DE IA E NEGÓCIO
  // ============================================================================

  const insights = useMemo((): CustomerAIInsights => {
    const totalSpent = purchases.reduce((sum, p) => sum + p.total, 0);
    const averageTicket = purchases.length > 0 ? totalSpent / purchases.length : 0;
    const daysSinceLastPurchase = customerData?.ultimaCompra
      ? Math.floor((new Date().getTime() - new Date(customerData.ultimaCompra).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Segment Recommendation
    let segmentRecommendation = 'Cliente Novo';
    if (totalSpent >= 1000 && purchases.length >= 10) {
      segmentRecommendation = 'Cliente VIP - Manter programa de fidelidade';
    } else if (totalSpent >= 500 && purchases.length >= 5) {
      segmentRecommendation = 'Cliente Regular - Oportunidade de upgrade';
    } else if (purchases.length > 0) {
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
    } else if (purchases.length >= 5) {
      nextBestAction = 'Programa de fidelidade';
    }

    // Preferred Products
    const preferredProducts = productsChartData.slice(0, 3).map(p => p.name);

    // Opportunity Score (0-100)
    let opportunityScore = 0;
    if (purchases.length > 0) {
      opportunityScore = Math.min(100,
        (purchases.length * 10) + // Engagement
        (averageTicket > 100 ? 20 : 10) + // Spending level
        (daysSinceLastPurchase < 30 ? 30 : 0) + // Recency
        (preferredProducts.length * 10) // Product diversity
      );
    }

    // Growth Potential
    let growthPotential: 'low' | 'medium' | 'high' = 'low';
    if (averageTicket > 100 && purchases.length >= 3) {
      growthPotential = 'high';
    } else if (purchases.length >= 2) {
      growthPotential = 'medium';
    }

    // Engagement Level
    let engagementLevel: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastPurchase <= 30 && purchases.length >= 3) {
      engagementLevel = 'high';
    } else if (daysSinceLastPurchase <= 90 && purchases.length >= 1) {
      engagementLevel = 'medium';
    }

    return {
      segmentRecommendation,
      nextBestAction,
      riskLevel,
      opportunityScore: Math.round(opportunityScore),
      preferredProducts,
      seasonalTrends: 'Análise sazonal em desenvolvimento',
      loyaltyIndicators: [
        purchases.length >= 5 ? 'Comprador recorrente' : 'Comprador esporádico',
        averageTicket > 100 ? 'Alto ticket médio' : 'Ticket médio padrão',
        daysSinceLastPurchase <= 30 ? 'Recentemente ativo' : 'Inativo há mais de 30 dias'
      ],
      revenueContribution: Math.round((totalSpent / Math.max(totalSpent, 1000)) * 100), // % da base
      growthPotential,
      engagementLevel
    };
  }, [purchases, productsChartData, customerData]);

  // ============================================================================
  // ESTADO DERIVADO
  // ============================================================================

  const hasAnalyticsData = purchases && purchases.length > 0;
  const hasFrequencyData = frequencyChartData.length > 0;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Chart data
    salesChartData,
    productsChartData,
    frequencyChartData,

    // AI Insights
    insights,

    // Utility
    hasAnalyticsData,
    hasFrequencyData,
    chartColors: CHART_COLORS
  };
};

export default useCustomerAnalytics;