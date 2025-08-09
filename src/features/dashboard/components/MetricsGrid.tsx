/**
 * Grade de métricas reutilizável
 * Sub-componente puro para exibição de métricas em cards
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { MetricCard } from '../hooks/useDashboardMetrics';
import { cn } from '@/core/config/utils';
import { getGlassCardClasses } from '@/core/config/theme-utils';

interface MetricsGridProps {
  metrics: MetricCard[];
  isLoading?: boolean;
  title?: string;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  isLoading = false,
  title,
  variant = 'premium',
  glassEffect = true,
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
        <h3 id="metrics-title" className="text-xl font-semibold text-gray-100">{title}</h3>
      )}
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" 
        role="group" 
        aria-label="Métricas do dashboard"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          // Cores baseadas na variante modernizada
          const iconColorClass = {
            default: 'text-primary-yellow',
            success: 'text-accent-green',
            warning: 'text-primary-yellow',
            error: 'text-accent-red',
          }[metric.variant || 'default'];

          const borderColorClass = {
            default: 'border-primary-yellow/30',
            success: 'border-accent-green/30',
            warning: 'border-primary-yellow/30',
            error: 'border-accent-red/30',
          }[metric.variant || 'default'];

          const glassClasses = glassEffect ? getGlassCardClasses(metric.variant || variant) : '';

          return (
            <Card 
              key={index} 
              className={cn(
                glassClasses,
                borderColorClass,
                'shadow-xl hover:border-primary-yellow/60 hover:scale-[1.02] transition-all duration-300'
              )}
              role="article"
              aria-labelledby={`metric-title-${index}`}
              aria-describedby={`metric-desc-${index}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle id={`metric-title-${index}`} className="text-sm font-medium text-gray-200">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColorClass}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-100" aria-label={`Valor: ${metric.value}`}>
                  {metric.value}
                </div>
                <p id={`metric-desc-${index}`} className="text-xs text-gray-400 mt-1">
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