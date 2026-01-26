import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CustomerDashboardStatsProps {
  totalCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
  averageTicket: number; // Not used in design but kept for compatibility
  activeCustomers: number;
  newCustomersCount: number;
  retentionRate: number;
}

export const CustomerDashboardStats: React.FC<CustomerDashboardStatsProps> = ({
  totalCustomers,
  vipCustomers,
  totalRevenue,
  activeCustomers,
  newCustomersCount,
  retentionRate
}) => {

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8 mb-8">

        {/* Metric 1: Total Customers */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Total de Clientes</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {totalCustomers}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              +{newCustomersCount} <TrendingUp className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 2: Ativos */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Clientes Ativos</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {activeCustomers}
            </span>
            <span className="text-sm text-zinc-600">
               ({((activeCustomers / (totalCustomers || 1)) * 100).toFixed(0)}%)
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 3: VIPs */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Clientes VIP</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-adega-gold tracking-tight">
              {vipCustomers}
            </span>
            <span className="text-sm text-adega-gold/60">Premium</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 4: Taxa de Retenção */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Retenção</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {retentionRate.toFixed(1)}%
            </span>
            <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden">
               {/* Visual bar for retention */}
               <div 
                 className={`h-full rounded-full bg-indigo-500`} 
                 style={{ width: `${Math.min(retentionRate, 100)}%` }}
               ></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
