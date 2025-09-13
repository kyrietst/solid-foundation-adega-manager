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

  // Query para dados comparativos básicos para dashboard com fallback
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['delivery-vs-instore-dashboard', selectedPeriod],
    queryFn: async (): Promise<ComparisonData> => {
      console.log('📊 Carregando comparativo básico para dashboard...');
      
      try {
        // Tentar usar RPC primeiro
        const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
          p_days: days
        });

        if (error) {
          console.warn('⚠️ RPC falhou, usando fallback manual:', error);
          throw error;
        }

        console.log('✅ RPC funcionou, usando dados:', data[0]);
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
      } catch (rpcError) {
        // Fallback: cálculo manual direto
        console.log('🔄 Executando fallback manual para comparativo delivery vs presencial...');
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Período anterior para crescimento
        const prevStartDate = new Date();
        prevStartDate.setDate(startDate.getDate() - days);
        
        // Buscar vendas atuais
        const { data: currentSales, error: currentError } = await supabase
          .from('sales')
          .select('delivery_type, final_amount')
          .eq('status', 'completed')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .not('final_amount', 'is', null);

        if (currentError) {
          console.error('❌ Erro no fallback - vendas atuais:', currentError);
          throw currentError;
        }

        // Buscar vendas anteriores
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
        
        // Calcular crescimento (período anterior)
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

        console.log('✅ Fallback concluído:', { deliveryOrders, instoreOrders, instoreRevenue });

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
      }
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

  // Calcular totais com proteção contra NaN
  const deliveryOrders = Number(comparison.delivery_orders) || 0;
  const instoreOrders = Number(comparison.instore_orders) || 0;
  const deliveryRevenue = Number(comparison.delivery_revenue) || 0;
  const instoreRevenue = Number(comparison.instore_revenue) || 0;
  
  const totalOrders = deliveryOrders + instoreOrders;
  const totalRevenue = deliveryRevenue + instoreRevenue;
  
  // Percentuais com validação de NaN
  const deliveryOrdersPercent = totalOrders > 0 && !isNaN(deliveryOrders) ? (deliveryOrders / totalOrders) * 100 : 0;
  const instoreOrdersPercent = totalOrders > 0 && !isNaN(instoreOrders) ? (instoreOrders / totalOrders) * 100 : 0;
  
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
      subLabel: `${!isNaN(deliveryOrdersPercent) ? deliveryOrdersPercent.toFixed(1) : '0.0'}%`
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
      subLabel: `${!isNaN(instoreOrdersPercent) ? instoreOrdersPercent.toFixed(1) : '0.0'}%`
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