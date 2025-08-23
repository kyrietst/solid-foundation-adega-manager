/**
 * Hook para métricas de qualidade de dados e completude de perfis
 */

import { useMemo } from 'react';
import { 
  calculateCompleteness,
  calculateDataQualityMetrics,
  generatePersonalizedSuggestions,
  type CustomerData,
  type CompletenessResult,
  type DataQualityMetrics
} from '../utils/completeness-calculator';

/**
 * Hook para calcular completude de um cliente específico
 */
export const useProfileCompleteness = (customer: CustomerData | null): CompletenessResult | null => {
  return useMemo(() => {
    if (!customer) return null;
    return calculateCompleteness(customer);
  }, [customer]);
};

/**
 * Hook para calcular métricas de qualidade geral da base de clientes
 */
export const useDataQualityMetrics = (customers: CustomerData[]): DataQualityMetrics => {
  return useMemo(() => {
    return calculateDataQualityMetrics(customers);
  }, [customers]);
};

/**
 * Hook para sugestões personalizadas de um cliente
 */
export const usePersonalizedSuggestions = (customer: CustomerData | null): string[] => {
  return useMemo(() => {
    if (!customer) return [];
    return generatePersonalizedSuggestions(customer);
  }, [customer]);
};

/**
 * Hook para estatísticas de completude de múltiplos clientes
 */
export const useCompletenessStats = (customers: CustomerData[]) => {
  return useMemo(() => {
    if (customers.length === 0) {
      return {
        totalCustomers: 0,
        averageCompleteness: 0,
        completenessDistribution: [],
        topIncompleteCustomers: [],
        improvementOpportunities: []
      };
    }

    const completenessResults = customers.map(customer => ({
      customer,
      completeness: calculateCompleteness(customer)
    }));

    // Completude média
    const averageCompleteness = Math.round(
      completenessResults.reduce((sum, result) => sum + result.completeness.percentage, 0) / customers.length
    );

    // Distribuição por faixas de completude
    const completenessDistribution = [
      { 
        range: '90-100%', 
        count: completenessResults.filter(r => r.completeness.percentage >= 90).length,
        color: 'green',
        label: 'Excelente'
      },
      { 
        range: '70-89%', 
        count: completenessResults.filter(r => r.completeness.percentage >= 70 && r.completeness.percentage < 90).length,
        color: 'yellow',
        label: 'Bom'
      },
      { 
        range: '50-69%', 
        count: completenessResults.filter(r => r.completeness.percentage >= 50 && r.completeness.percentage < 70).length,
        color: 'orange',
        label: 'Razoável'
      },
      { 
        range: '0-49%', 
        count: completenessResults.filter(r => r.completeness.percentage < 50).length,
        color: 'red',
        label: 'Ruim'
      }
    ];

    // Top clientes com perfis mais incompletos (para priorizar)
    const topIncompleteCustomers = completenessResults
      .filter(result => result.completeness.percentage < 80)
      .sort((a, b) => a.completeness.percentage - b.completeness.percentage)
      .slice(0, 10)
      .map(result => ({
        customer: result.customer,
        completeness: result.completeness,
        priority: result.completeness.criticalMissing.length > 0 ? 'high' : 'medium'
      }));

    // Oportunidades de melhoria (campos mais ausentes)
    const fieldMissingCount: { [key: string]: number } = {};
    completenessResults.forEach(result => {
      result.completeness.missingFields.forEach(field => {
        fieldMissingCount[field.key] = (fieldMissingCount[field.key] || 0) + 1;
      });
    });

    const improvementOpportunities = Object.entries(fieldMissingCount)
      .map(([fieldKey, count]) => ({
        fieldKey,
        missingCount: count,
        percentage: Math.round((count / customers.length) * 100),
        potentialImpact: count * 5 // Estimativa simplificada de impacto
      }))
      .sort((a, b) => b.potentialImpact - a.potentialImpact)
      .slice(0, 5);

    return {
      totalCustomers: customers.length,
      averageCompleteness,
      completenessDistribution,
      topIncompleteCustomers,
      improvementOpportunities
    };
  }, [customers]);
};

/**
 * Hook para alertas de qualidade de dados
 */
export const useDataQualityAlerts = (customers: CustomerData[]) => {
  return useMemo(() => {
    if (customers.length === 0) return [];

    const metrics = calculateDataQualityMetrics(customers);
    const alerts: Array<{
      type: 'critical' | 'warning' | 'info';
      title: string;
      description: string;
      action?: string;
      count?: number;
    }> = [];

    // Alertas críticos
    if (metrics.poorQualityProfiles > metrics.totalCustomers * 0.3) {
      alerts.push({
        type: 'critical',
        title: 'Muitos perfis com baixa qualidade',
        description: `${metrics.poorQualityProfiles} clientes (${Math.round((metrics.poorQualityProfiles / metrics.totalCustomers) * 100)}%) têm menos de 50% de dados preenchidos`,
        action: 'Revisar e completar perfis prioritários',
        count: metrics.poorQualityProfiles
      });
    }

    // Alertas de campos críticos ausentes
    metrics.topMissingFields.forEach(field => {
      if (field.field.priority === 'critical' && field.missingPercentage > 50) {
        alerts.push({
          type: 'critical',
          title: `Campo crítico ausente: ${field.field.label}`,
          description: `${field.missingPercentage}% dos clientes não possuem ${field.field.label.toLowerCase()}`,
          action: 'Priorizar coleta deste dado',
          count: field.missingCount
        });
      }
    });

    // Alertas de aviso
    if (metrics.averageCompleteness < 70) {
      alerts.push({
        type: 'warning',
        title: 'Completude média baixa',
        description: `A completude média da base é de ${metrics.averageCompleteness}%, abaixo do recomendado (70%)`,
        action: 'Implementar campanha de atualização de dados'
      });
    }

    // Alertas informativos
    if (metrics.completeProfiles > 0) {
      alerts.push({
        type: 'info',
        title: 'Perfis completos identificados',
        description: `${metrics.completeProfiles} clientes possuem perfis completos (>90%)`,
        action: 'Usar como referência para campanhas personalizadas',
        count: metrics.completeProfiles
      });
    }

    return alerts.slice(0, 5); // Limitar a 5 alertas mais importantes
  }, [customers]);
};

/**
 * Hook para tracking de melhorias na qualidade dos dados
 */
export const useQualityTrend = (customers: CustomerData[]) => {
  return useMemo(() => {
    // Para este exemplo, vamos simular uma tendência baseada em datas de criação
    // Em produção, isso viria de dados históricos armazenados
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentCustomers = customers.filter(c => new Date(c.created_at) >= thirtyDaysAgo);
    const olderCustomers = customers.filter(c => new Date(c.created_at) < thirtyDaysAgo);
    
    const recentMetrics = calculateDataQualityMetrics(recentCustomers);
    const olderMetrics = calculateDataQualityMetrics(olderCustomers);
    
    const trend = recentMetrics.averageCompleteness - olderMetrics.averageCompleteness;
    
    return {
      current: recentMetrics.averageCompleteness,
      previous: olderMetrics.averageCompleteness,
      trend, // Positivo = melhorando, Negativo = piorando
      trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      period: '30 dias',
      improvement: trend > 0 ? `+${trend.toFixed(1)}%` : `${trend.toFixed(1)}%`
    };
  }, [customers]);
};