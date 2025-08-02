/**
 * Grade de métricas reutilizável
 * Sub-componente puro para exibição de métricas em cards
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MetricCard } from '@/hooks/dashboard/useDashboardMetrics';

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
    <div className="space-y-4">
      {title && (
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-adega-platinum">
                  {metric.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${iconColorClass}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{metric.value}</div>
                <p className="text-xs text-adega-silver mt-1">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};