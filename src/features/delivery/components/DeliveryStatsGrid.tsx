/**
 * @fileoverview Grid de KPIs Operacionais para Delivery - REFATORADO com StatCard SSoT
 * Exibe 3 cards premium com métricas do dia: Entregas, Faturamento e Ticket Médio
 *
 * @author Adega Manager Team
 * @version 3.1.0 - Cálculo Local Otimizado (Performance)
 */

import React from 'react';
import { ShoppingBag, Bike, DollarSign, ClockAlert } from 'lucide-react';
import type { DeliveryMetrics } from '@/features/delivery/types';

interface DeliveryStatsGridProps {
  metrics: DeliveryMetrics;
  isLoading?: boolean;
}

export const DeliveryStatsGrid: React.FC<DeliveryStatsGridProps> = ({
  metrics,
  isLoading = false
}) => {
  if (isLoading) {
    return <div className="animate-pulse bg-zinc-900/50 h-32 rounded-xl w-full" />;
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-4 rounded-xl">
      {/* 1. Pedidos Hoje */}
      <div className="flex items-center gap-4 border-r border-white/5 pr-4 last:border-0 border-b md:border-b-0 pb-4 md:pb-0">
        <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center aspect-square h-12 w-12">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Pedidos Hoje</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white leading-none">{metrics.totalOrders}</p>
            <span className="text-zinc-500 text-xs font-medium mb-0.5">0%</span>
          </div>
        </div>
      </div>

      {/* 2. Entregadores */}
      <div className="flex items-center gap-4 border-r border-white/5 pr-4 last:border-0 border-b md:border-b-0 pb-4 md:pb-0">
        <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center aspect-square h-12 w-12">
          <Bike className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Entregadores</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white leading-none">0</p>
            <span className="text-zinc-500 text-xs font-medium mb-0.5">/ 0</span>
          </div>
        </div>
      </div>

      {/* 3. Faturamento */}
      <div className="flex items-center gap-4 last:border-0">
        <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center aspect-square h-12 w-12">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Faturamento</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-white leading-none">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRevenue)}
            </p>
            <span className="text-zinc-500 text-xs font-medium mb-0.5">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStatsGrid;
