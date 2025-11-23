/**
 * Apresentação pura do Dashboard
 * Componente sem lógica de negócio, apenas renderização
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TopProductsCard } from './TopProductsCard';
import { MetricCard } from '@/features/dashboard/hooks/useDashboardMetrics';
import { SalesDataPoint } from '@/features/dashboard/hooks/useDashboardData';
import { PageContainer } from '@/shared/ui/layout/PageContainer';
import { SectionHeader } from '@/shared/ui/layout/SectionHeader';
import { text, shadows } from '@/core/config/theme';
import { KpiCards } from './KpiCards';
import { InventoryInsightCard } from './InventoryInsightCard';
import { SalesChartSection } from './SalesChartSection';
import { useSalesKpis, useInventoryKpis, useExpenseKpis } from '../hooks/useDashboardKpis';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardHeader } from './DashboardHeader';
import { DeliveryVsInstoreComparison } from './DeliveryVsInstoreComparison';
import { LowStockAlertCard } from './LowStockAlertCard';
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, CreditCard, Target, Calculator, Truck } from 'lucide-react';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { getCurrentMonthLabel } from '../utils/dateHelpers';

export interface DashboardPresentationProps {
  // Dados processados
  publicMetrics: MetricCard[];
  salesData: SalesDataPoint[];

  // Estados de loading
  isLoading: boolean;
  isLoadingCounts: boolean;
  isLoadingSales: boolean;

  // Configuração de apresentação
  userRole: string;
  showEmployeeNote: boolean;
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  publicMetrics,
  salesData,
  isLoading,
  isLoadingCounts,
  isLoadingSales,
  userRole,
  showEmployeeNote,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header padronizado */}
      <PageHeader title="CENTRO DE COMANDO" />

      {/* Container principal com glassmorphism - ocupa altura restante */}
      <div className="flex-1 min-h-0 bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Canais de Venda no topo */}
          <div className="lg:col-span-12">
            <DeliveryVsInstoreComparison />
          </div>

          {/* KPIs após canais de venda */}
          <div className="lg:col-span-12">
            <KpiSection />
          </div>

          {/* Linha: Gráfico de Vendas (66%) + Top Produtos + Alertas (33%) */}
          <div className="lg:col-span-8">
            <SalesChartSection className="h-full" contentHeight={380} cardHeight={460} />
          </div>
          <div className="lg:col-span-4 space-y-4">
            <TopProductsCard
              limit={3}
              cardHeight={220}
            />
            {/* Card de Alerta de Estoque Baixo */}
            <LowStockAlertCard limit={3} />
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
    </div>
  );
};

function KpiSection() {
  const navigate = useNavigate();
  const { data: s, isLoading: l1 } = useSalesKpis(30);
  const { data: i, isLoading: l3 } = useInventoryKpis();
  const { data: e, isLoading: l4 } = useExpenseKpis(30);
  const { counts, financials, isLoadingCounts, isLoadingFinancials } = useDashboardData(30);
  const loading = l1 || l3 || l4 || isLoadingCounts || isLoadingFinancials;

  // Helper para garantir valores numéricos válidos
  const safeValue = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  // ✅ Dashboard de Guerra: 4 KPIs Operacionais Focados
  const items = [
    // 1. Entregas Pendentes - Prioridade operacional
    {
      id: 'pending-deliveries',
      label: 'Entregas Pendentes',
      value: safeValue(counts?.pendingDeliveries, 0),
      icon: Truck,
      valueType: (counts?.pendingDeliveries || 0) === 0 ? 'positive' as const :
                 (counts?.pendingDeliveries || 0) < 5 ? 'warning' as const : 'negative' as const,
      isLoading: isLoadingCounts,
      href: '/sales?tab=deliveries',
      subLabel: 'aguardando retirada',
      formatType: 'number' as const
    },
    // 2. Faturamento Total - Métrica principal de vendas (MTD)
    {
      id: 'revenue',
      label: 'Faturamento Total',
      value: safeValue(financials?.totalRevenue, 0),
      delta: safeValue(s?.revenueDelta),
      icon: DollarSign,
      valueType: 'positive' as const,
      isLoading: isLoadingFinancials,
      href: '/reports?tab=financial&period=30d',
      subLabel: getCurrentMonthLabel(),
      formatType: 'currency' as const
    },
    // 3. Lucro Estimado - Valor monetário real (R$) com margem no subtítulo
    {
      id: 'net-profit',
      label: 'Lucro Estimado',
      value: safeValue(financials?.netProfit, 0),
      icon: TrendingUp,
      valueType: (safeValue(financials?.netProfit, 0)) > 0 ? 'positive' as const : 'negative' as const,
      isLoading: isLoadingFinancials,
      href: '/reports?tab=financial&period=30d',
      subLabel: `Margem de ${safeValue(financials?.netMargin, 0).toFixed(1)}%`,
      formatType: 'currency' as const
    }
  ];

  // KPI "Em Risco" removido conforme solicitado

  return (
    <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 3 KPI cards: Entregas, Faturamento, Lucro */}
          <KpiCards items={items} showAnimation={true} />

          {/* NEW: Inventory Insight Card - Shows cost vs potential revenue */}
          <InventoryInsightCard
            totalCost={i?.totalCostValue || 0}
            potentialRevenue={i?.potentialRevenue || 0}
            productCount={i?.totalProducts || 0}
            outOfStockCount={i?.lowStockCount || 0}
            isLoading={l3}
            onClick={() => navigate('/inventory')}
          />
        </div>
      </CardContent>
    </Card>
  );
}

