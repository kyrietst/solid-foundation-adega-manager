/**
 * Hook para lógica de insights de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 * Complementa o useCustomerInsights do use-crm.ts com lógica específica de UI
 */

import { useMemo } from 'react';
import { CustomerInsight } from '@/features/customers/hooks/use-crm';

export const useCustomerInsightsLogic = (insights: CustomerInsight[] = []) => {
  // Insights agrupados por tipo
  const insightsByType = useMemo(() => {
    return insights.reduce((acc, insight) => {
      if (!acc[insight.insight_type]) {
        acc[insight.insight_type] = [];
      }
      acc[insight.insight_type].push(insight);
      return acc;
    }, {} as Record<string, CustomerInsight[]>);
  }, [insights]);

  // Insights de alta confiança (>= 0.8)
  const highConfidenceInsights = useMemo(() => {
    return insights.filter(insight => insight.confidence >= 0.8 && insight.is_active);
  }, [insights]);

  // Função para obter cor do tipo de insight
  const getInsightTypeColor = (type: string): string => {
    switch (type) {
      case 'preference':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pattern':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'opportunity':
        return 'bg-adega-gold/20 text-adega-gold border-adega-gold/30';
      case 'risk':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Função para obter ícone do tipo de insight
  const getInsightTypeIcon = (type: string): string => {
    switch (type) {
      case 'preference':
        return '💡';
      case 'pattern':
        return '📊';
      case 'opportunity':
        return '🎯';
      case 'risk':
        return '⚠️';
      default:
        return '📋';
    }
  };

  // Função para formatar nível de confiança
  const formatConfidence = (confidence: number): string => {
    if (confidence >= 0.9) return 'Muito Alta';
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Média';
    if (confidence >= 0.4) return 'Baixa';
    return 'Muito Baixa';
  };

  return {
    insightsByType,
    highConfidenceInsights,
    getInsightTypeColor,
    getInsightTypeIcon,
    formatConfidence,
    totalInsights: insights.length,
    activeInsights: insights.filter(i => i.is_active).length
  };
};