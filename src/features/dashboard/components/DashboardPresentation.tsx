/**
 * Apresentação pura do Dashboard - Centro de Comando Operacional
 * Layout Bento Grid com KPIs unificados e hierarquia visual clara
 *
 * @version 2.0.0 - Refatoração UX/UI
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { TopProductsCard } from './TopProductsCard';
import { MetricCard } from '@/features/dashboard/hooks/useDashboardMetrics';
import { SalesDataPoint } from '@/features/dashboard/hooks/useDashboardData';
import { SalesChartSection } from './SalesChartSection';
import { useInventoryKpis } from '../hooks/useDashboardKpis';
import { useDashboardData } from '../hooks/useDashboardData';
import { LowStockAlertCard } from './LowStockAlertCard';
import { InventoryInsightCard } from './InventoryInsightCard';
import { DollarSign, TrendingUp, Truck, Store, Users, CreditCard } from 'lucide-react';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { getDataPeriodLabel, getMonthStartDate, getNowSaoPaulo } from '../utils/dateHelpers';
import { cn } from '@/core/config/utils';

export interface DashboardPresentationProps {
  publicMetrics: MetricCard[];
  salesData: SalesDataPoint[];
  isLoading: boolean;
  isLoadingCounts: boolean;
  isLoadingSales: boolean;
  userRole: string;
  showEmployeeNote: boolean;
}

// Hook para buscar dados de canais (Delivery vs Presencial) + contagem de vendas
function useChannelData() {
  return useQuery({
    queryKey: ['channel-breakdown', 'mtd'],
    queryFn: async () => {
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      try {
        const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
          p_days: daysDiff
        });

        if (error) throw error;
        const rpcData = data?.[0];
        return {
          delivery_revenue: rpcData?.delivery_revenue || 0,
          instore_revenue: rpcData?.instore_revenue || 0,
          delivery_orders: rpcData?.delivery_orders || 0,
          instore_orders: rpcData?.instore_orders || 0,
          total_orders: (rpcData?.delivery_orders || 0) + (rpcData?.instore_orders || 0)
        };
      } catch {
        // Fallback: cálculo manual
        const { data: sales } = await supabase
          .from('sales')
          .select('delivery_type, final_amount')
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .not('final_amount', 'is', null);

        const deliverySales = (sales || []).filter(s => s.delivery_type === 'delivery');
        const instoreSales = (sales || []).filter(s => s.delivery_type === 'presencial');

        return {
          delivery_revenue: deliverySales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0),
          instore_revenue: instoreSales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0),
          delivery_orders: deliverySales.length,
          instore_orders: instoreSales.length,
          total_orders: (sales || []).length
        };
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export const DashboardPresentation: React.FC<DashboardPresentationProps> = ({
  showEmployeeNote,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* Header com indicador de período */}
      <PageHeader
        title="CENTRO DE COMANDO"
        description={`Dados: ${getDataPeriodLabel()}`}
      />

      {/* Container principal - glassmorphism mais leve */}
      <div className="flex-1 min-h-0 bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-4 flex flex-col">

        {/* Seção de KPIs - altura uniforme */}
        <div className="mb-6">
          <UnifiedKpiSection />
        </div>

        {/* Layout Bento Grid: 2/3 + 1/3 */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          {/* Coluna Principal (2/3) - Gráfico de Vendas */}
          <div className="lg:col-span-2 min-h-[400px]">
            <SalesChartSection className="h-full" />
          </div>

          {/* Coluna Lateral (1/3) - Top Produtos + Alertas */}
          <div className="flex flex-col gap-4 min-h-[400px]">
            <div className="flex-1 min-h-0">
              <TopProductsCard limit={4} className="h-full" />
            </div>
            <div className="flex-1 min-h-0">
              <LowStockAlertCard limit={5} className="h-full" />
            </div>
          </div>
        </div>

        {/* Nota para funcionários */}
        {showEmployeeNote && (
          <div className="mt-4">
            <div className="p-3 bg-yellow-900/30 border border-yellow-500/40 rounded-lg">
              <p className="text-xs font-medium text-yellow-200">
                Algumas métricas financeiras estão disponíveis apenas para administradores.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Seção de KPIs Unificada
 * 6 cards com altura uniforme, dados de canais integrados no card de Faturamento
 */
function UnifiedKpiSection() {
  const navigate = useNavigate();
  const { data: i, isLoading: l3 } = useInventoryKpis();
  const { counts, financials, isLoadingCounts, isLoadingFinancials } = useDashboardData(30);
  const { data: channelData, isLoading: loadingChannels } = useChannelData();

  // Helper para valores seguros
  const safeValue = (value: unknown, fallback: number = 0): number => {
    if (value === null || value === undefined || isNaN(Number(value)) || !isFinite(Number(value))) {
      return fallback;
    }
    return Number(value);
  };

  // Calcular percentuais de canais
  const deliveryRevenue = safeValue(channelData?.delivery_revenue);
  const instoreRevenue = safeValue(channelData?.instore_revenue);
  const totalChannelRevenue = deliveryRevenue + instoreRevenue;
  const deliveryPercent = totalChannelRevenue > 0 ? (deliveryRevenue / totalChannelRevenue) * 100 : 0;
  const instorePercent = totalChannelRevenue > 0 ? (instoreRevenue / totalChannelRevenue) * 100 : 0;

  // Calcular Ticket Médio Global e por Canal
  const totalOrders = safeValue(channelData?.total_orders, 1);
  const deliveryOrders = safeValue(channelData?.delivery_orders, 0);
  const instoreOrders = safeValue(channelData?.instore_orders, 0);
  const ticketMedio = totalOrders > 0 ? safeValue(financials?.totalRevenue, 0) / totalOrders : 0;
  const ticketDelivery = deliveryOrders > 0 ? deliveryRevenue / deliveryOrders : 0;
  const ticketStore = instoreOrders > 0 ? instoreRevenue / instoreOrders : 0;

  // Calcular Previsão de Fechamento do Mês
  const now = getNowSaoPaulo();
  const diaAtual = now.getDate();
  const diasNoMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const faturamentoAtual = safeValue(financials?.totalRevenue, 0);
  const previsaoFechamento = diaAtual > 0 ? (faturamentoAtual / diaAtual) * diasNoMes : 0;

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Formatar moeda compacta (para previsão)
  const formatCompact = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  return (
    <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
      <CardContent className="pt-4 pb-4">
        {/* Grid responsivo: 2 colunas mobile, 3 tablet, 6 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">

          {/* 1. Entregas Pendentes */}
          <div className="h-full">
            <StatCard
              title="Entregas Pendentes"
              value={safeValue(counts?.pendingDeliveries, 0)}
              description="aguardando despacho"
              icon={Truck}
              variant={(counts?.pendingDeliveries || 0) === 0 ? 'success' :
                       (counts?.pendingDeliveries || 0) < 5 ? 'warning' : 'error'}
              layout="crm"
              className={cn("h-full", isLoadingCounts && 'animate-pulse')}
              onClick={() => navigate('/sales?tab=deliveries')}
              formatType="number"
            />
          </div>

          {/* 2. Base de Clientes */}
          <div className="h-full">
            <StatCard
              title="Base de Clientes"
              value={safeValue(counts?.totalCustomers, 0)}
              description={`${safeValue(counts?.vipCustomers, 0)} VIPs`}
              icon={Users}
              variant="purple"
              layout="crm"
              className={cn("h-full", isLoadingCounts && 'animate-pulse')}
              onClick={() => navigate('/customers')}
              formatType="number"
            />
          </div>

          {/* 3. Faturamento Total - com breakdown de canais + previsão */}
          <div className="h-full">
            <StatCard
              title="Faturamento"
              value={safeValue(financials?.totalRevenue, 0)}
              description={
                <span className="flex flex-col gap-0.5 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3 w-3 text-blue-400" />
                    <span className="text-blue-300">{deliveryPercent.toFixed(0)}%</span>
                    <span className="text-gray-600">|</span>
                    <Store className="h-3 w-3 text-green-400" />
                    <span className="text-green-300">{instorePercent.toFixed(0)}%</span>
                  </span>
                  <span className="text-amber-400/80 text-[10px]">
                    → Prev. mês: {formatCompact(previsaoFechamento)}
                  </span>
                </span>
              }
              icon={DollarSign}
              variant="success"
              layout="crm"
              className={cn("h-full", isLoadingFinancials && 'animate-pulse')}
              onClick={() => navigate('/reports?tab=financial')}
              formatType="currency"
            />
          </div>

          {/* 4. Ticket Médio - com breakdown por canal */}
          <div className="h-full">
            <StatCard
              title="Ticket Médio"
              value={ticketMedio}
              description={
                <span className="flex flex-col gap-0.5 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Truck className="h-3 w-3 text-blue-400" />
                    <span className={ticketDelivery >= ticketStore ? 'text-emerald-400 font-medium' : 'text-gray-400'}>
                      {formatCurrency(ticketDelivery)}
                    </span>
                    <span className="text-gray-600">|</span>
                    <Store className="h-3 w-3 text-green-400" />
                    <span className={ticketStore > ticketDelivery ? 'text-emerald-400 font-medium' : 'text-gray-400'}>
                      {formatCurrency(ticketStore)}
                    </span>
                  </span>
                  <span className="text-gray-500 text-[10px]">
                    {totalOrders} pedidos no mês
                  </span>
                </span>
              }
              icon={CreditCard}
              variant="default"
              layout="crm"
              className={cn("h-full", loadingChannels && 'animate-pulse')}
              onClick={() => navigate('/reports?tab=sales')}
              formatType="currency"
            />
          </div>

          {/* 5. Lucro Estimado */}
          <div className="h-full">
            <StatCard
              title="Lucro Estimado"
              value={safeValue(financials?.netProfit, 0)}
              description={`Margem ${safeValue(financials?.netMargin, 0).toFixed(1)}%`}
              icon={TrendingUp}
              variant={safeValue(financials?.netProfit, 0) > 0 ? 'success' : 'error'}
              layout="crm"
              className={cn("h-full", isLoadingFinancials && 'animate-pulse')}
              onClick={() => navigate('/reports?tab=financial')}
              formatType="currency"
            />
          </div>

          {/* 6. Estoque Atual - Custo → Potencial */}
          <div className="h-full">
            <InventoryInsightCard
              totalCost={safeValue(i?.totalCostValue, 0)}
              potentialRevenue={safeValue(i?.potentialRevenue, 0)}
              productCount={safeValue(i?.totalProducts, 0)}
              isLoading={l3}
              onClick={() => navigate('/inventory')}
              className="h-full"
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
