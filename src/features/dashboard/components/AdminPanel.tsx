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
  showHeader?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  metrics,
  isLoading = false,
  variant = 'premium',
  glassEffect = true,
  showFinancialIcon = true,
  showHeader = true,
}) => {
  return (
    <section
      className="space-y-6"
      aria-labelledby="admin-panel-title"
    >
      {showHeader && (
        <div className="flex items-center gap-3 mt-2">
          {showFinancialIcon && (
            <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-400/40">
              <Shield className="h-5 w-5 text-amber-300" aria-hidden="true" />
            </div>
          )}
          <h3 
            id="admin-panel-title" 
            className="text-xl font-bold text-white flex items-center gap-2"
          >
            Métricas Financeiras
            <TrendingUp className="h-5 w-5 text-amber-300" aria-hidden="true" />
          </h3>
        </div>
      )}
      
      <div className={cn(
        'p-6 rounded-xl backdrop-blur-xl border transition-all duration-300 shadow-lg',
        glassEffect ? 'bg-black/80 border-amber-400/40' : 'bg-black/80 border-white/30',
        'hover:border-amber-300/60 hover:bg-black/85'
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