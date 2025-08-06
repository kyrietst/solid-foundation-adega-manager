/**
 * Grade de métricas reutilizável
 * Sub-componente puro para exibição de métricas em cards
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { MetricCard } from '../hooks/useDashboardMetrics';

interface MetricsGridProps {
  metrics: MetricCard[];
  isLoading?: boolean;
  title?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  isLoading = false,
  title,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <section className="space-y-4" role="region" aria-labelledby={title ? 'metrics-title' : undefined}>
      {title && (
        <h3 id="metrics-title" className="text-xl font-semibold text-white">{title}</h3>
      )}
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" 
        role="group" 
        aria-label="Métricas do dashboard"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          // Cores baseadas na variante
          const iconColorClass = {
            default: 'text-adega-gold',
            success: 'text-green-400',
            warning: 'text-yellow-400',
            error: 'text-red-400',
          }[metric.variant || 'default'];

          const borderColorClass = {
            default: 'border-white/10',
            success: 'border-green-400/20',
            warning: 'border-yellow-400/20',
            error: 'border-red-400/20',
          }[metric.variant || 'default'];

          return (
            <Card 
              key={index} 
              className={`bg-adega-charcoal/20 ${borderColorClass} backdrop-blur-xl shadow-xl hover:bg-adega-charcoal/30 transition-all duration-300`}
              role="article"
              aria-labelledby={`metric-title-${index}`}
              aria-describedby={`metric-desc-${index}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle id={`metric-title-${index}`} className="text-sm font-medium text-adega-platinum">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColorClass}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white" aria-label={`Valor: ${metric.value}`}>
                  {metric.value}
                </div>
                <p id={`metric-desc-${index}`} className="text-xs text-adega-silver mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};