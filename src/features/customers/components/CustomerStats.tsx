import React from 'react';
import { Card, CardContent } from '@/shared/ui/primitives/card';
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Activity } from 'lucide-react';
import { formatCurrency } from '@/core/config/utils';

interface CustomerStatsProps {
  metrics: {
    lifetime_value_calculated: number;
    total_purchases: number;
    days_since_last_purchase?: number;
    // Add other metrics as needed from the hook
    avg_ticket?: number;
  } | undefined;
  customerStatus: string; // e.g., 'active', 'inactive', 'risk'
  isLoading: boolean;
}

export const CustomerStats: React.FC<CustomerStatsProps> = ({
  metrics,
  customerStatus,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-24 bg-gray-800/50 rounded-xl animate-pulse" />
    );
  }

  // Fallback values
  const ltv = metrics?.lifetime_value_calculated || 0;
  const purchases = metrics?.total_purchases || 0;
  const daysSince = metrics?.days_since_last_purchase || 0;

  // Risk Score Logic (Simplified for UI visualization)
  const getRiskScore = () => {
    if (daysSince > 90) return { label: 'High', color: 'text-red-500', barColor: 'bg-red-500', width: 'w-[80%]' };
    if (daysSince > 30) return { label: 'Medium', color: 'text-yellow-500', barColor: 'bg-yellow-500', width: 'w-[50%]' };
    return { label: 'Low', color: 'text-emerald-500', barColor: 'bg-emerald-500', width: 'w-[20%]' };
  };

  const risk = getRiskScore();

  return (
    <section className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2">

        {/* Metric 1: LTV */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Lifetime Value</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {formatCurrency(ltv)}
            </span>
            <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
              +12% <TrendingUp className="h-3 w-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 2: Total Orders */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Total Orders</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {purchases}
            </span>
            <span className="text-sm text-zinc-600">orders</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 3: Recency replaces NPS (Business Rule) */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Última Compra</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">
              {daysSince}
            </span>
            <span className="text-sm text-emerald-500/60">dias atrás</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

        {/* Metric 4: Risk Score */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <span className="text-sm font-medium text-zinc-500">Risk Score</span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {risk.label}
            </span>
            <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${risk.barColor} ${risk.width}`}></div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};