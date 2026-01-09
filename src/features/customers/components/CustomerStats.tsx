import React from 'react';
import { Users, UserPlus, Diamond, Wallet, TrendingUp, TrendingDown, Activity, PieChart } from 'lucide-react';
import { cn, formatCurrency } from '@/core/config/utils';
import { CustomerStatsProps } from '@/features/customers/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  delay?: number;
}

const StatCard = ({ title, value, icon: Icon, trend, delay = 0 }: StatCardProps) => (
  <div 
    className={cn(
      "glass-panel border border-white/5 rounded-xl p-5",
      "hover:border-[#f9cb15]/30 transition-all duration-300 group"
    )}
  >
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">
        {title}
      </span>
      <Icon className="w-5 h-5 text-[#f9cb15] opacity-70 group-hover:opacity-100 transition-opacity" />
    </div>
    <div className="text-2xl font-bold text-white tracking-tight">
      {value}
    </div>
    {trend && (
      <div className={cn(
        "flex items-center gap-1 mt-2 text-xs font-medium",
        trend.isPositive ? "text-[#4ade80]" : "text-[#f87171]"
      )}>
        {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{trend.value}</span>
        <span className="text-zinc-600 ml-1 font-normal">{trend.label}</span>
      </div>
    )}
  </div>
);

export const CustomerStats: React.FC<CustomerStatsProps> = ({
  totalCustomers,
  vipCustomers,
  newCustomersCount,
  retentionRate,
  totalRevenue,
  averageTicket,
  activeCustomers,
}) => {
  // Placeholder trends since we don't have real historical data yet
  // In a real scenario, these would come from the API/Hook
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Clientes"
        value={totalCustomers}
        icon={Users}
        trend={{ value: "+12%", isPositive: true, label: "vs mês anterior" }}
        delay={0}
      />
      
      <StatCard
        title="Novos (Mês)"
        value={newCustomersCount}
        icon={UserPlus}
        trend={{ value: "+5%", isPositive: true, label: "vs mês anterior" }}
        delay={100}
      />
      
      <StatCard
        title="Clientes VIP"
        value={vipCustomers}
        icon={Diamond}
        trend={{ value: "-2%", isPositive: false, label: "vs mês anterior" }}
        delay={200}
      />
      
      <StatCard
        title="Receita Média"
        value={formatCurrency(averageTicket)}
        icon={Wallet}
        trend={{ value: "+8%", isPositive: true, label: "vs mês anterior" }}
        delay={300}
      />
      
      <StatCard
        title="Retenção"
        value={`${retentionRate.toFixed(1)}%`}
        icon={PieChart}
        trend={{ value: "+1%", isPositive: true, label: "vs mês anterior" }}
        delay={400}
      />
    </div>
  );
};