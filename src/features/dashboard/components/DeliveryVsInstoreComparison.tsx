/**
 * @fileoverview Comparativo entre vendas delivery e presenciais no dashboard
 * Métricas comparativas e insights de performance entre canais
 * 
 * @author Adega Manager Team
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { 
  Truck, Store, TrendingUp, DollarSign
} from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { KpiCards } from './KpiCards';

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
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;

  // Query para dados comparativos básicos para dashboard
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['delivery-vs-instore-dashboard', selectedPeriod],
    queryFn: async (): Promise<ComparisonData> => {
      console.log('📊 Carregando comparativo básico para dashboard...');
      
      const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
        p_days: days
      });

      if (error) {
        console.error('❌ Erro ao carregar comparativo:', error);
        throw error;
      }

      return data[0] || {
        delivery_orders: 0,
        delivery_revenue: 0,
        delivery_avg_ticket: 0,
        instore_orders: 0,
        instore_revenue: 0,
        instore_avg_ticket: 0,
        delivery_growth_rate: 0,
        instore_growth_rate: 0
      };
    },
    staleTime: 5 * 60 * 1000,
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

  // Calcular totais
  const totalOrders = comparison.delivery_orders + comparison.instore_orders;
  const totalRevenue = comparison.delivery_revenue + comparison.instore_revenue;
  
  // Percentuais e formatação
  const deliveryOrdersPercent = totalOrders > 0 ? (comparison.delivery_orders / totalOrders) * 100 : 0;
  const instoreOrdersPercent = 100 - deliveryOrdersPercent;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Estrutura de dados idêntica aos KPIs originais
  const kpiItems = [
    {
      id: 'delivery',
      label: 'Delivery',
      value: comparison.delivery_orders,
      delta: undefined,
      icon: Truck,
      valueType: 'positive' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=delivery-overview',
      subLabel: `${deliveryOrdersPercent.toFixed(1)}%`
    },
    {
      id: 'presencial',
      label: 'Presencial', 
      value: comparison.instore_orders,
      delta: undefined,
      icon: Store,
      valueType: 'positive' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=instore-overview',
      subLabel: `${instoreOrdersPercent.toFixed(1)}%`
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
      subLabel: `${selectedPeriod === '7d' ? '7 dias' : selectedPeriod === '30d' ? '30 dias' : '90 dias'}`
    },
    {
      id: 'melhor-ticket',
      label: 'Melhor Ticket',
      value: comparison.delivery_avg_ticket > comparison.instore_avg_ticket ? 'Delivery' : 'Presencial',
      delta: undefined,
      icon: TrendingUp,
      valueType: 'neutral' as const,
      isLoading: false,
      href: '/reports?tab=delivery&section=ticket-analysis',
      subLabel: formatCurrency(Math.max(comparison.delivery_avg_ticket, comparison.instore_avg_ticket))
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
      
      {/* Header com seletor de período */}
      <div className="flex items-center justify-between p-6 pb-3 relative z-10">
        <h3 className="text-white flex items-center gap-2 text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-400" />
            <span className="text-gray-400">vs</span>
            <Store className="h-5 w-5 text-green-400" />
          </div>
        </h3>
        
        <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-32 bg-black/40 border-white/30 text-white hover:bg-black/60 hover:border-purple-400/50 transition-all duration-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
            <SelectItem value="7d" className="text-white hover:bg-white/10">7 dias</SelectItem>
            <SelectItem value="30d" className="text-white hover:bg-white/10">30 dias</SelectItem>
            <SelectItem value="90d" className="text-white hover:bg-white/10">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* KPIs usando exatamente o mesmo padrão dos KPIs originais */}
      <div className="px-6 pb-6 relative z-10">
        <KpiCards items={kpiItems} showAnimation={true} />
      </div>
    </div>
  );
};

export default DeliveryVsInstoreComparison;