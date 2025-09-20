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
    <section className="space-y-4" aria-labelledby={title ? 'metrics-title' : undefined}>
      {title && (
        <h3 id="metrics-title" className="text-xl font-bold text-white">{title}</h3>
      )}
      
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" 
        role="group" 
        aria-label="Métricas do dashboard"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          
          // Cores baseadas no accent (se disponível) ou na variante
          const accentColorMap = {
            amber: { icon: 'text-amber-300', border: 'border-amber-400/50' },
            blue: { icon: 'text-blue-300', border: 'border-blue-400/50' },
            green: { icon: 'text-emerald-300', border: 'border-emerald-400/50' },
            purple: { icon: 'text-purple-300', border: 'border-purple-400/50' },
            red: { icon: 'text-red-300', border: 'border-red-400/50' },
          };

          const variantColorMap = {
            default: { icon: 'text-amber-300', border: 'border-amber-400/50' },
            success: { icon: 'text-emerald-300', border: 'border-emerald-400/50' },
            warning: { icon: 'text-amber-300', border: 'border-amber-400/50' },
            error: { icon: 'text-red-300', border: 'border-red-400/50' },
          };

          const colors = metric.accent 
            ? accentColorMap[metric.accent] 
            : variantColorMap[metric.variant || 'default'];

          const iconColorClass = colors.icon;
          const borderColorClass = colors.border;

          const glassClasses = glassEffect ? getGlassCardClasses(metric.variant || variant) : '';

          return (
            <Card 
              key={index} 
              className={cn(
                "bg-black/70 backdrop-blur-xl border-white/20 shadow-lg",
                borderColorClass,
                'hover:border-white/40 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:bg-black/80'
              )}
              role="article"
              aria-labelledby={`metric-title-${index}`}
              aria-describedby={`metric-desc-${index}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle id={`metric-title-${index}`} className="text-sm font-semibold text-gray-100">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColorClass}`} aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold text-white tracking-tight" aria-label={`Valor: ${metric.value}`}>
                  {metric.value}
                </div>
                <p id={`metric-desc-${index}`} className="text-xs text-gray-300 mt-1 font-medium">
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