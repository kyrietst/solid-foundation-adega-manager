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
import { MagicBento as BentoGrid, MagicBentoItem as BentoItem } from '@/shared/ui/layout/MagicBento';
import { PageContainer } from '@/shared/ui/layout/PageContainer';
import { SectionHeader } from '@/shared/ui/layout/SectionHeader';
import { KpiCards } from './KpiCards';
import { AlertsPanel } from './AlertsPanel';
import { SalesChartSection } from './SalesChartSection';
import { useSalesKpis, useCustomerKpis, useInventoryKpis } from '../hooks/useDashboardKpis';
import { TopProductsCard } from './TopProductsCard';
import { CategoryMixDonut } from './CategoryMixDonut';

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
    <PageContainer padding="lg" spacing="lg" maxWidth="2xl">
      <SectionHeader
        title="Dashboard"
        description="Visão geral do negócio, atividades recentes e indicadores de vendas"
        variant="prominent"
      />

      {/* Bento grid layout: KPIs + gráficos + listas, com espaçamento consistente */}
      <BentoGrid className="mt-4">
        {/* KPIs compactos */}
        <BentoItem className="col-span-1 md:col-span-4 row-span-2">
          <KpiSection />
        </BentoItem>

        {/* Gráfico principal */}
        <BentoItem className="col-span-1 md:col-span-4 lg:col-span-4 row-span-3">
          <SalesChartSection />
        </BentoItem>

        {/* Atividades recentes */}
        <BentoItem className="col-span-1 md:col-span-4 lg:col-span-2 row-span-3">
          <RecentActivities activities={recentActivities} isLoading={isLoadingActivities} />
        </BentoItem>

        {/* Painel financeiro (somente admin) */}
        {showFinancialMetrics && sensitiveMetrics && (
          <BentoItem className="col-span-1 md:col-span-4 lg:col-span-3 row-span-2">
            <AdminPanel metrics={sensitiveMetrics} isLoading={isLoadingFinancials} />
          </BentoItem>
        )}

        {/* Alertas */}
        <BentoItem className="col-span-1 md:col-span-4 lg:col-span-3 row-span-2">
          <AlertsPanel maxItems={8} />
        </BentoItem>

        {/* Top 5 Produtos */}
        <BentoItem className="col-span-1 md:col-span-4 lg:col-span-3 row-span-2">
          <TopProductsCard />
        </BentoItem>

        {/* Mix por Categoria */}
        <BentoItem className="col-span-1 md:col-span-4 lg:col-span-3 row-span-2">
          <CategoryMixDonut />
        </BentoItem>

        {/* Nota para funcionários, quando aplicável */}
        {showEmployeeNote && (
          <BentoItem className="col-span-1 md:col-span-4 row-span-1">
            <div className="p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg backdrop-blur-sm">
              <p className="text-sm text-yellow-300">
                Nota: Algumas métricas financeiras e estratégicas estão disponíveis apenas para administradores.
              </p>
            </div>
          </BentoItem>
        )}
      </BentoGrid>
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

  return <KpiCards items={items} showAnimation={true} />;
}

