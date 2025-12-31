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
import { KpiCards } from './KpiCards';
import { getCurrentMonthLabel } from '../utils/dateHelpers';
import { useDeliveryVsInstore } from '@/features/dashboard/hooks/useDashboardMetrics';

// ✅ MTD Strategy: Dashboard sempre mostra mês atual (dia 01 até hoje)
// Para análise com períodos customizados, use a página de Reports

interface DeliveryVsInstoreComparisonProps {
  className?: string;
}

export const DeliveryVsInstoreComparison = ({ className }: DeliveryVsInstoreComparisonProps) => {

  // Query para dados comparativos básicos para dashboard com fallback (MTD)
  const { data: comparison, isLoading } = useDeliveryVsInstore();

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
      formatType: 'none' as const // Já formatado manualmente
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
      formatType: 'none' as const // Já formatado manualmente
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
      formatType: 'none' as const
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
      formatType: 'none' as const
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