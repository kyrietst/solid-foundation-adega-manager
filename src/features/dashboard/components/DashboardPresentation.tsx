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
import { SalesChartSection } from './SalesChartSection';
import { useSalesKpis, useCustomerKpis, useInventoryKpis, useExpenseKpis } from '../hooks/useDashboardKpis';
import { SalesInsightsTabs } from './SalesInsightsTabs';
import { DashboardHeader } from './DashboardHeader';
import { DeliveryVsInstoreComparison } from './DeliveryVsInstoreComparison';
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertTriangle, CreditCard, Target, Calculator } from 'lucide-react';
import { PageHeader } from '@/shared/ui/composite/PageHeader';

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

          {/* Linha: Gráfico de Vendas + Atividades Recentes */}
          <div className="lg:col-span-6">
            <SalesChartSection className="h-full" contentHeight={450} cardHeight={530} />
          </div>
          <div className="lg:col-span-6">
            <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg h-[530px]">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[450px] overflow-y-auto">
                <RecentActivities
                  activities={recentActivities}
                  isLoading={isLoadingActivities}
                />
              </CardContent>
            </Card>
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
    </div>
  );
};

function KpiSection() {
  const { data: s, isLoading: l1 } = useSalesKpis(30);
  const { data: c, isLoading: l2 } = useCustomerKpis(30);
  const { data: i, isLoading: l3 } = useInventoryKpis();
  const { data: e, isLoading: l4 } = useExpenseKpis(30);
  const loading = l1 || l2 || l3 || l4;

  // Helper para garantir valores numéricos válidos
  const safeValue = (value: any, fallback: number = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  const items = [
    { 
      id: 'revenue', 
      label: 'Receita Total', 
      value: safeValue(s?.revenue, 0), // ✅ Valor bruto, FormatDisplay formata
      delta: safeValue(s?.revenueDelta),
      icon: DollarSign,
      valueType: 'positive' as const,
      isLoading: l1,
      href: '/reports?tab=financial&period=30d',
      subLabel: 'Últimos 30 dias',
      formatType: 'currency' as const // ✅ FormatDisplay cuida da formatação
    },
    { 
      id: 'orders', 
      label: 'Total de Vendas', 
      value: safeValue(s?.orders, 0),
      delta: safeValue(s?.ordersDelta),
      icon: ShoppingCart,
      valueType: 'positive' as const,
      isLoading: l1,
      href: '/reports?tab=sales&period=30d',
      subLabel: 'Últimos 30 dias',
      formatType: 'number' as const
    },
    { 
      id: 'avg', 
      label: 'Ticket Médio', 
      value: safeValue(s?.avgTicket, 0), // ✅ Valor bruto, FormatDisplay formata
      delta: safeValue(s?.avgTicketDelta),
      icon: TrendingUp,
      valueType: 'neutral' as const,
      isLoading: l1,
      href: '/reports?tab=sales&period=30d',
      subLabel: 'Por venda',
      formatType: 'currency' as const // ✅ FormatDisplay cuida da formatação
    },
    {
      id: 'customers',
      label: 'Clientes Ativos',
      value: safeValue(c?.activeCustomers, 0),
      icon: Users,
      valueType: 'positive' as const,
      isLoading: l2,
      href: '/reports?tab=crm&period=30d',
      subLabel: 'Últimos 30 dias',
      formatType: 'number' as const
    },
    {
      id: 'expenses',
      label: 'Despesas OpEx',
      value: safeValue(e?.totalExpenses, 0), // ✅ Valor bruto, FormatDisplay formata
      delta: safeValue(e?.expensesDelta),
      icon: CreditCard,
      valueType: 'negative' as const,
      isLoading: l4,
      href: '/expenses',
      subLabel: 'Últimos 30 dias',
      formatType: 'currency' as const // ✅ FormatDisplay cuida da formatação
    },
    {
      id: 'budget-variance',
      label: 'Variação Orçamentária',
      value: safeValue(e?.budgetVariance, 0), // ✅ Valor bruto percentual
      icon: Target,
      valueType: e?.budgetStatus === 'OVER_BUDGET' ? 'negative' as const : 
                 e?.budgetStatus === 'WARNING' ? 'warning' as const : 'positive' as const,
      isLoading: l4,
      href: '/expenses?tab=budget',
      subLabel: e?.budgetStatus === 'OVER_BUDGET' ? 'Acima do orçamento' :
                e?.budgetStatus === 'WARNING' ? 'Próximo do limite' : 'Dentro do orçamento',
      formatType: 'percentage' as const // ✅ FormatDisplay cuida da formatação
    },
    {
      id: 'net-margin',
      label: 'Margem Líquida',
      value: safeValue(e?.netMargin, 0), // ✅ Valor bruto percentual
      icon: Calculator,
      valueType: (safeValue(e?.netMargin, 0)) > 10 ? 'positive' as const : 
                 (safeValue(e?.netMargin, 0)) > 5 ? 'neutral' as const : 'negative' as const,
      isLoading: l4,
      href: '/reports?tab=financial&period=30d',
      subLabel: 'Após despesas OpEx',
      formatType: 'percentage' as const // ✅ FormatDisplay cuida da formatação
    }
  ];

  // KPI "Em Risco" removido conforme solicitado

  return (
    <Card className="border-white/20 bg-black/80 backdrop-blur-xl shadow-lg">
      <CardContent className="pt-6">
        <KpiCards items={items} showAnimation={true} />
      </CardContent>
    </Card>
  );
}

