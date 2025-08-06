/**
 * Painel administrativo do dashboard
 * Sub-componente especializado para métricas sensíveis
 */

import React from 'react';
import { MetricsGrid } from './MetricsGrid';
import { MetricCard } from '@/features/dashboard/hooks/useDashboardMetrics';

interface AdminPanelProps {
  metrics: MetricCard[];
  isLoading?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  metrics,
  isLoading = false,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mt-8 text-white">Métricas Financeiras</h3>
      <MetricsGrid 
        metrics={metrics}
        isLoading={isLoading}
      />
    </div>
  );
};