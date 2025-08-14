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
import { PageContainer } from '@/shared/ui/layout/PageContainer';
import { SectionHeader } from '@/shared/ui/layout/SectionHeader';
import { text, shadows } from '@/core/config/theme';
import { KpiCards } from './KpiCards';
import { AlertsPanel } from './AlertsPanel';
import { SalesChartSection } from './SalesChartSection';
import { useSalesKpis, useCustomerKpis, useInventoryKpis } from '../hooks/useDashboardKpis';
import { SalesInsightsTabs } from './SalesInsightsTabs';

export interface DashboardPresentationProps {
  // Dados processados
  publicMetrics: MetricCard[];
  salesData: SalesDataPoint[];
  recentActivities: RecentActivity[];
  
  // Estados de loading
  isLoading: boolean;
  isLoadingCounts: boolean;
  isLoadingSales: boolean;
  isLoadingActivities: boolean;
  
  // Configuração de apresentação
  userRole: string;
  showEmployeeNote: boolean;
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  publicMetrics,
  salesData,
  recentActivities,
  isLoading,
  isLoadingCounts,
  isLoadingSales,
  isLoadingActivities,
  userRole,
  showEmployeeNote,
}) => {
  return (
    <PageContainer padding="lg" spacing="lg" maxWidth="full">
      <div className="py-6">
        <h1 className={`${text.h1} ${shadows.strong} text-2xl`}>
          DASHBOARD
        </h1>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* KPIs no topo, largura total */}
          <div className="lg:col-span-12">
            <KpiSection />
          </div>


          {/* Linha: Tendência de Vendas (8) + Alertas (4) como antes */}
          <div className="lg:col-span-8">
            <SalesChartSection className="h-full" contentHeight={400} cardHeight={460} />
          </div>
          <div className="lg:col-span-4">
            <AlertsPanel maxItems={6} previewActivities={recentActivities} cardHeight={460} />
          </div>

          {/* Insights em abas ocupando largura total */}
          <div className="lg:col-span-12">
            <SalesInsightsTabs />
          </div>

          {/* Nota para funcionários, quando aplicável */}
          {showEmployeeNote && (
            <div className="lg:col-span-12">
              <div className="p-4 bg-yellow-900/40 border border-yellow-500/60 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-yellow-100">
                  Nota: Algumas métricas financeiras e estratégicas estão disponíveis apenas para administradores.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

function KpiSection() {
  const { data: s, isLoading: l1 } = useSalesKpis(30);
  const { data: c, isLoading: l2 } = useCustomerKpis(30);
  const { data: i, isLoading: l3 } = useInventoryKpis();
  const loading = l1 || l2 || l3;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const items = [
    { 
      id: 'revenue', 
      label: 'Receita (30d)', 
      value: formatCurrency(s?.revenue || 0),
      delta: s?.revenueDelta,
      accent: 'amber' as const,
      isLoading: l1,
      href: '/reports?tab=sales&period=30d'
    },
    { 
      id: 'orders', 
      label: 'Vendas (30d)', 
      value: s?.orders || 0,
      delta: s?.ordersDelta,
      accent: 'blue' as const,
      isLoading: l1,
      href: '/sales'
    },
    { 
      id: 'avg', 
      label: 'Ticket Médio', 
      value: formatCurrency(s?.avgTicket || 0),
      delta: s?.avgTicketDelta,
      accent: 'green' as const,
      isLoading: l1,
      href: '/reports?tab=sales&metric=avg-ticket'
    },
    {
      id: 'customers',
      label: 'Clientes Ativos (30d)',
      value: c?.activeCustomers || 0,
      accent: 'purple' as const,
      isLoading: l2,
      href: '/customers?filter=active-30d'
    }
  ];

  // Add inventory alert as 5th KPI if there are low stock items
  if (i && i.lowStockCount > 0) {
    items.push({
      id: 'low-stock',
      label: 'Estoque Crítico',
      value: i.lowStockCount,
      accent: 'red' as const,
      isLoading: l3,
      href: '/inventory?filter=low-stock'
    });
  }

  return (
    <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
      <CardContent className="pt-6">
        <KpiCards items={items} showAnimation={true} />
      </CardContent>
    </Card>
  );
}

