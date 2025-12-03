/**
 * @fileoverview Comparativo entre vendas delivery e presenciais no dashboard
 * Métricas comparativas e insights de performance entre canais
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import {
  Truck, Store, TrendingUp, DollarSign
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { KpiCards } from './KpiCards';
import { getCurrentMonthLabel, getMonthStartDate, getNowSaoPaulo } from '../utils/dateHelpers';

// ✅ MTD Strategy: Dashboard sempre mostra mês atual (dia 01 até hoje)
// Para análise com períodos customizados, use a página de Reports

interface DeliveryVsInstoreComparisonProps {
  className?: string;
}

interface ComparisonData {
  delivery_orders: number;
  delivery_revenue: number;
  delivery_avg_ticket: number;
  instore_orders: number;
  instore_revenue: number;
  instore_avg_ticket: number;
  delivery_growth_rate: number;
  instore_growth_rate: number;
}

export const DeliveryVsInstoreComparison = ({ className }: DeliveryVsInstoreComparisonProps) => {

  // Query para dados comparativos básicos para dashboard com fallback (MTD)
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['delivery-vs-instore-dashboard', 'mtd'],
    queryFn: async (): Promise<ComparisonData> => {

      // ✅ MTD: Calcular período do mês atual
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // ✅ REFATORADO: Query direta (RPC foi dropada)
      // Cálculo manual de métricas delivery vs presencial (MTD)

      const endDate = getNowSaoPaulo();
      const startDate = getMonthStartDate();

      // Período anterior para crescimento (mês anterior completo)
      const prevEndDate = new Date(startDate);
      prevEndDate.setDate(prevEndDate.getDate() - 1); // Último dia do mês anterior
      const prevStartDate = new Date(prevEndDate.getFullYear(), prevEndDate.getMonth(), 1);

      // Buscar vendas atuais
      const { data: currentSales, error: currentError } = await supabase
        .from('sales')
        .select('delivery_type, final_amount')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('final_amount', 'is', null);

      if (currentError) {
        console.error('❌ Erro ao buscar vendas atuais:', currentError);
        throw currentError;
      }

      // Buscar vendas anteriores para cálculo de crescimento
      const { data: prevSales } = await supabase
        .from('sales')
        .select('delivery_type, final_amount')
        .eq('status', 'completed')
        .gte('created_at', prevStartDate.toISOString())
        .lt('created_at', startDate.toISOString())
        .not('final_amount', 'is', null);

      // Calcular métricas atuais
      const deliverySales = (currentSales || []).filter(s => s.delivery_type === 'delivery');
      const presencialSales = (currentSales || []).filter(s => s.delivery_type === 'presencial');

      const deliveryOrders = deliverySales.length;
      const deliveryRevenue = deliverySales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0);
      const deliveryAvgTicket = deliveryOrders > 0 ? deliveryRevenue / deliveryOrders : 0;

      const instoreOrders = presencialSales.length;
      const instoreRevenue = presencialSales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0);
      const instoreAvgTicket = instoreOrders > 0 ? instoreRevenue / instoreOrders : 0;

      // Calcular crescimento (comparação com período anterior)
      const prevDeliveryRevenue = (prevSales || [])
        .filter(s => s.delivery_type === 'delivery')
        .reduce((sum, s) => sum + Number(s.final_amount || 0), 0);
      const prevInstoreRevenue = (prevSales || [])
        .filter(s => s.delivery_type === 'presencial')
        .reduce((sum, s) => sum + Number(s.final_amount || 0), 0);

      const deliveryGrowthRate = prevDeliveryRevenue > 0 ?
        ((deliveryRevenue - prevDeliveryRevenue) / prevDeliveryRevenue) * 100 : 0;
      const instoreGrowthRate = prevInstoreRevenue > 0 ?
        ((instoreRevenue - prevInstoreRevenue) / prevInstoreRevenue) * 100 : 0;

      return {
        delivery_orders: deliveryOrders,
        delivery_revenue: deliveryRevenue,
        delivery_avg_ticket: deliveryAvgTicket,
        instore_orders: instoreOrders,
        instore_revenue: instoreRevenue,
        instore_avg_ticket: instoreAvgTicket,
        delivery_growth_rate: deliveryGrowthRate,
        instore_growth_rate: instoreGrowthRate
      };
    },
    staleTime: 2 * 60 * 1000, // ✅ SSoT: 2 minutos (sincronizado com SalesChartSection)
    refetchOnWindowFocus: true, // ✅ SSoT: Atualiza ao voltar para a aba
  });

  if (isLoading || !comparison) {
    return (
      <div className={cn("bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg", className)}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-600/30 rounded-lg w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-[120px] bg-gray-600/30 rounded-lg"></div>
              <div className="h-[120px] bg-gray-600/30 rounded-lg"></div>
              <div className="h-[120px] bg-gray-600/30 rounded-lg"></div>
              <div className="h-[120px] bg-gray-600/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular totais com proteção contra NaN
  const deliveryOrders = Number(comparison.delivery_orders) || 0;
  const instoreOrders = Number(comparison.instore_orders) || 0;
  const deliveryRevenue = Number(comparison.delivery_revenue) || 0;
  const instoreRevenue = Number(comparison.instore_revenue) || 0;

  const totalOrders = deliveryOrders + instoreOrders;
  const totalRevenue = deliveryRevenue + instoreRevenue;

  // ✅ FIX: Percentuais baseados em RECEITA (não em contagem de pedidos)
  const deliveryRevenuePercent = totalRevenue > 0 && !isNaN(deliveryRevenue) ? (deliveryRevenue / totalRevenue) * 100 : 0;
  const instoreRevenuePercent = totalRevenue > 0 && !isNaN(instoreRevenue) ? (instoreRevenue / totalRevenue) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // ✅ FIX: Cards mostram RECEITA (R$) e % de receita, não contagem de pedidos
  const kpiItems = [
    {
      id: 'delivery',
      label: 'Delivery',
      value: formatCurrency(deliveryRevenue),
      delta: undefined,
      icon: Truck,
      valueType: 'positive' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=delivery-overview',
      subLabel: `${!isNaN(deliveryRevenuePercent) ? deliveryRevenuePercent.toFixed(1) : '0.0'}%`,
      formatType: 'text' as const // Já formatado manualmente
    },
    {
      id: 'presencial',
      label: 'Presencial',
      value: formatCurrency(instoreRevenue),
      delta: undefined,
      icon: Store,
      valueType: 'positive' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=instore-overview',
      subLabel: `${!isNaN(instoreRevenuePercent) ? instoreRevenuePercent.toFixed(1) : '0.0'}%`,
      formatType: 'text' as const // Já formatado manualmente
    },
    {
      id: 'receita-total',
      label: 'Receita Total',
      value: formatCurrency(totalRevenue),
      delta: undefined,
      icon: DollarSign,
      valueType: 'positive' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=revenue-analysis',
      subLabel: getCurrentMonthLabel(),
      formatType: 'text' as const
    },
    {
      id: 'ticket-medio',
      label: 'Ticket Médio',
      value: comparison.delivery_avg_ticket > comparison.instore_avg_ticket ? 'Delivery' : 'Presencial',
      delta: undefined,
      icon: TrendingUp,
      valueType: 'neutral' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=ticket-analysis',
      subLabel: `${formatCurrency(Math.max(comparison.delivery_avg_ticket, comparison.instore_avg_ticket))} vs ${formatCurrency(Math.min(comparison.delivery_avg_ticket, comparison.instore_avg_ticket))}`,
      formatType: 'text' as const
    }
  ];

  return (
    <div
      className={cn(
        "bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 relative overflow-hidden group",
        className
      )}
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
        (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
      }}
    >
      {/* Purple glow effect */}
      <div
        className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(147, 51, 234, 0.15), transparent 40%)`
        }}
      />

      {/* Header - Período MTD (mês atual) */}
      <div className="flex items-center justify-between p-6 pb-3 relative z-10">
        <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-400" />
            <span className="text-gray-400">vs</span>
            <Store className="h-5 w-5 text-green-400" />
          </div>
        </h3>

        <span className="text-gray-400 text-sm font-medium">{getCurrentMonthLabel()}</span>
      </div>

      {/* KPIs usando exatamente o mesmo padrão dos KPIs originais */}
      <div className="px-6 pb-6 relative z-10">
        <KpiCards items={kpiItems} showAnimation={true} />
      </div>
    </div>
  );
};

export default DeliveryVsInstoreComparison;