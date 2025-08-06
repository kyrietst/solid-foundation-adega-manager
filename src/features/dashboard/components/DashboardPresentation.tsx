/**
 * Apresentação pura do Dashboard
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MetricsGrid } from './MetricsGrid';
import { ChartsSection } from './ChartsSection';
import { AdminPanel } from './AdminPanel';
import { RecentActivities } from './RecentActivities';
import { MetricCard } from '@/features/dashboard/hooks/useDashboardMetrics';
import { SalesDataPoint, RecentActivity } from '@/features/dashboard/hooks/useDashboardData';

export interface DashboardPresentationProps {
  // Dados processados
  publicMetrics: MetricCard[];
  sensitiveMetrics?: MetricCard[];
  salesData: SalesDataPoint[];
  recentActivities: RecentActivity[];
  
  // Estados de loading
  isLoading: boolean;
  isLoadingCounts: boolean;
  isLoadingFinancials: boolean;
  isLoadingSales: boolean;
  isLoadingActivities: boolean;
  
  // Configuração de apresentação
  userRole: string;
  showFinancialMetrics: boolean;
  showEmployeeNote: boolean;
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  publicMetrics,
  sensitiveMetrics,
  salesData,
  recentActivities,
  isLoading,
  isLoadingCounts,
  isLoadingFinancials,
  isLoadingSales,
  isLoadingActivities,
  userRole,
  showFinancialMetrics,
  showEmployeeNote,
}) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      
      {/* Métricas públicas */}
      <MetricsGrid 
        metrics={publicMetrics} 
        isLoading={isLoadingCounts}
        title="Métricas Gerais"
      />

      {/* Métricas sensíveis - apenas para admin */}
      {showFinancialMetrics && sensitiveMetrics && (
        <AdminPanel 
          metrics={sensitiveMetrics}
          isLoading={isLoadingFinancials}
        />
      )}

      {/* Nota para funcionários */}
      {showEmployeeNote && (
        <div className="mt-8 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg backdrop-blur-sm">
          <p className="text-sm text-yellow-300">
            Nota: Algumas métricas financeiras e estratégicas estão disponíveis apenas para administradores.
          </p>
        </div>
      )}

      {/* Gráficos */}
      <ChartsSection 
        salesData={salesData}
        isLoading={isLoadingSales}
      />

      {/* Atividades Recentes */}
      <RecentActivities 
        activities={recentActivities}
        isLoading={isLoadingActivities}
      />
    </div>
  );
};