/**
 * Painel administrativo do dashboard
 * Sub-componente especializado para métricas sensíveis
 */

import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { MetricCard } from '@/features/dashboard/hooks/useDashboardMetrics';
import { Shield, TrendingUp } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface AdminPanelProps {
  metrics: MetricCard[];
  isLoading?: boolean;
  variant?: 'default' | 'premium' | 'success' | 'warning' | 'error';
  glassEffect?: boolean;
  showFinancialIcon?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  metrics,
  isLoading = false,
  variant = 'premium',
  glassEffect = true,
  showFinancialIcon = true,
}) => {
  return (
    <section 
      className="space-y-6" 
      role="region" 
      aria-labelledby="admin-panel-title"
    >
      <div className="flex items-center gap-3 mt-8">
        {showFinancialIcon && (
          <div className="p-2 rounded-lg bg-primary-yellow/10 border border-primary-yellow/30">
            <Shield className="h-5 w-5 text-primary-yellow" aria-hidden="true" />
          </div>
        )}
        <h3 
          id="admin-panel-title" 
          className="text-xl font-semibold text-gray-100 flex items-center gap-2"
        >
          Métricas Financeiras
          <TrendingUp className="h-5 w-5 text-primary-yellow" aria-hidden="true" />
        </h3>
      </div>
      
      <div className={cn(
        'p-6 rounded-xl backdrop-blur-sm border transition-all duration-300',
        glassEffect ? 'bg-gray-900/30 border-primary-yellow/20' : 'bg-gray-800/50 border-gray-600/30',
        'hover:border-primary-yellow/40 hover:bg-gray-900/40'
      )}>
        <MetricsGrid 
          metrics={metrics}
          isLoading={isLoading}
          variant={variant}
          glassEffect={glassEffect}
          title={undefined} // Remove duplicate title
        />
      </div>
    </section>
  );
};