import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

import {
    Truck, Store, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, DollarSign, ShoppingCart, Activity
} from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { cn } from '@/core/config/utils';
import { chartColors } from '@/shared/ui/composite/ChartTheme'; // Importando tema

import { DateRange } from 'react-day-picker';

// --- Types (Preserved) ---
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

interface TrendData {
    date: string;
    delivery_orders: number;
    delivery_revenue: number;
    instore_orders: number;
    instore_revenue: number;
}

// --- Hook Reutilizado (Otimizado com RPC) ---
function useDeliveryComparison(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['delivery-vs-instore-complete', dateRange],
        queryFn: async (): Promise<ComparisonData> => {
            if (!dateRange?.from || !dateRange?.to) {
                return {
                    delivery_orders: 0,
                    delivery_revenue: 0,
                    delivery_avg_ticket: 0,
                    instore_orders: 0,
                    instore_revenue: 0,
                    instore_avg_ticket: 0,
                    delivery_growth_rate: 0,
                    instore_growth_rate: 0
                };
            }

            const { data, error } = await supabase.rpc('get_delivery_performance_stats', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString()
            });

            if (error) throw error;

            return (data as unknown as ComparisonData) || {
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
        enabled: !!dateRange?.from && !!dateRange?.to,
        staleTime: 5 * 60 * 1000,
    });
}

// --- Hook de Tendências ---
function useDeliveryTrends(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['delivery-vs-instore-trends', dateRange],
        queryFn: async (): Promise<TrendData[]> => {
            if (!dateRange?.from || !dateRange?.to) {
                return [];
            }

            const { data, error } = await supabase.rpc('get_delivery_trends', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString()
            });

            if (error) throw error;

            return (data as unknown as any[]) || [];
        },
        enabled: !!dateRange?.from && !!dateRange?.to,
        staleTime: 5 * 60 * 1000,
    });
}

interface DeliveryPerformanceDashboardProps {
    dateRange?: DateRange;
}

export const DeliveryPerformanceDashboard: React.FC<DeliveryPerformanceDashboardProps> = ({ dateRange }) => {
    const { data: comparison, isLoading: loadingComparison } = useDeliveryComparison(dateRange);
    const { data: trends, isLoading: loadingTrends } = useDeliveryTrends(dateRange);

    // Dados seguros com fallback (memoização implícita do React Query)
    const safeComparison = comparison || {
        delivery_orders: 0,
        delivery_revenue: 0,
        delivery_avg_ticket: 0,
        instore_orders: 0,
        instore_revenue: 0,
        instore_avg_ticket: 0,
        delivery_growth_rate: 0,
        instore_growth_rate: 0
    };

    // Cálculos Simples (Apenas display)
    const totalRevenue = (safeComparison.delivery_revenue || 0) + (safeComparison.instore_revenue || 0);
    const totalOrders = (safeComparison.delivery_orders || 0) + (safeComparison.instore_orders || 0);
    const generalAvgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveryShare = totalRevenue > 0 ? ((safeComparison.delivery_revenue || 0) / totalRevenue) * 100 : 0;
    const instoreShare = 100 - deliveryShare;

    // Formatação
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loadingComparison || loadingTrends) return <LoadingSpinner />;

    return (
        <div className="space-y-8 pb-10">

            {/* 1. Placar do Jogo (KPIs) - Stitch Design Standardized */}
            <section className="w-full mb-8">
              <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8">

                {/* Metric 1: Receita Total */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Receita Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {formatCurrency(totalRevenue)}
                    </span>
                    <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Faturamento
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 2: Total Pedidos */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Total de Pedidos</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {totalOrders}
                    </span>
                    <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Volume
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 3: Ticket Médio */}
                <div className="flex flex-col gap-1 min-w-[140px]">
                  <span className="text-sm font-medium text-zinc-500">Ticket Médio Geral</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white tracking-tight">
                      {formatCurrency(generalAvgTicket)}
                    </span>
                     <span className="flex items-center text-xs font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Médio
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Metric 4: Delivery Share */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <span className="text-sm font-medium text-zinc-500">Share Delivery</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-bold text-cyan-400 tracking-tight">
                      {deliveryShare.toFixed(0)}%
                    </span>
                    <div className="h-2 w-16 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-cyan-500 transition-all duration-500" 
                        style={{ width: `${deliveryShare}%` }} 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* 2. Barra de Domínio - Estilo Neon */}
            <GlassCard className="p-6 border-white/5 bg-black/40">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Domínio de Receita</span>
                    </h3>
                    <span className="text-xs font-mono text-primary/70 bg-primary/10 px-2 py-1 rounded border border-primary/20">DISTRIBUIÇÃO</span>
                </div>

                <div className="relative h-12 w-full bg-black/50 rounded-lg overflow-hidden flex border border-white/5 shadow-inner">
                    {/* Delivery Segment */}
                    <div
                        style={{ width: `${deliveryShare}%` }}
                        className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 flex items-center justify-center transition-all duration-1000 relative group"
                    >
                         <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px] opacity-20" />
                        {deliveryShare > 10 && (
                            <span className="text-sm font-bold text-white drop-shadow-md z-10">
                                {deliveryShare.toFixed(1)}%
                            </span>
                        )}
                    </div>

                    {/* Instore Segment */}
                    <div
                        style={{ width: `${instoreShare}%` }}
                        className="h-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center transition-all duration-1000 relative"
                    >
                        {instoreShare > 10 && (
                            <span className="text-sm font-bold text-white drop-shadow-md z-10">
                                {instoreShare.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-4 text-sm">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                        <span className="text-gray-300">Delivery <span className="text-white font-medium ml-1">({formatCurrency(safeComparison.delivery_revenue || 0)})</span></span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
                        <span className="text-gray-300">Loja Física <span className="text-white font-medium ml-1">({formatCurrency(safeComparison.instore_revenue || 0)})</span></span>
                    </div>
                </div>
            </GlassCard>

            {/* 3. Gráfico de Tendência Neon */}
            <GlassCard className="p-6 border-white/5 bg-black/40">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                         <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Evolução Diária (Receita)</span>
                    </h3>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.cyan} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={chartColors.cyan} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInstore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.4} />
                                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `R$${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: '#F3F4F6',
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ color: '#E5E7EB', padding: '2px 0' }}
                                labelStyle={{ color: '#E5E7EB', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="delivery_revenue"
                                stroke={chartColors.cyan}
                                fillOpacity={1}
                                fill="url(#colorDelivery)"
                                name="Delivery"
                                strokeWidth={3}
                            />
                            <Area
                                type="monotone"
                                dataKey="instore_revenue"
                                stroke={chartColors.primary}
                                fillOpacity={1}
                                fill="url(#colorInstore)"
                                name="Loja Física"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* 4. Insights Rápidos (Alertas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Insight 1: Dominância */}
                <GlassCard className={cn(
                    "flex flex-col gap-3 p-5 transition-all duration-300 hover:scale-[1.02]",
                    deliveryShare > 50
                        ? "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50"
                        : "border-primary/30 bg-primary/5 hover:border-primary/50"
                )}>
                    <div className="flex items-center gap-2">
                        {deliveryShare > 50
                            ? <Truck className="w-5 h-5 text-cyan-400" />
                            : <Store className="w-5 h-5 text-primary" />
                        }
                         <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", 
                             deliveryShare > 50 ? "bg-cyan-500/20 text-cyan-400" : "bg-primary/20 text-primary"
                         )}>LIDERANÇA</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white">
                            {deliveryShare > 50 ? "Delivery Liderando" : "Loja Física Liderando"}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {deliveryShare > 50
                                ? `O canal delivery domina com ${deliveryShare.toFixed(0)}% da receita.`
                                : `A loja física mantém a liderança com ${instoreShare.toFixed(0)}% da receita.`
                            }
                        </p>
                    </div>
                </GlassCard>

                {/* Insight 2: Oportunidade de Ticket */}
                <GlassCard className={cn(
                    "flex flex-col gap-3 p-5 transition-all duration-300 hover:scale-[1.02]",
                    (safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                        ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                        : "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                )}>
                    <div className="flex items-center gap-2">
                        {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                            ? <AlertTriangle className="w-5 h-5 text-amber-400" />
                            : <CheckCircle className="w-5 h-5 text-emerald-400" />
                        }
                         <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                             (safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0) ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                         )}>TICKET MÉDIO</span>
                    </div>
                    <div>
                         <h4 className="font-bold text-lg text-white">
                            {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                                ? "Oportunidade: Ticket"
                                : "Ticket Delivery Forte"
                            }
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                                ? `Ticket do delivery é R$ ${((safeComparison.instore_avg_ticket || 0) - (safeComparison.delivery_avg_ticket || 0)).toFixed(2)} menor.`
                                : `O ticket médio do delivery supera a loja em R$ ${((safeComparison.delivery_avg_ticket || 0) - (safeComparison.instore_avg_ticket || 0)).toFixed(2)}.`
                            }
                        </p>
                    </div>
                </GlassCard>

                {/* Insight 3: Volume */}
                <GlassCard className={cn(
                    "flex flex-col gap-3 p-5 transition-all duration-300 hover:scale-[1.02]",
                    (safeComparison.delivery_growth_rate || 0) < 0
                        ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
                        : "border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50"
                )}>
                     <div className="flex items-center gap-2">
                        {(safeComparison.delivery_growth_rate || 0) < 0
                            ? <TrendingDown className="w-5 h-5 text-rose-400" />
                            : <TrendingUp className="w-5 h-5 text-cyan-400" />
                        }
                         <span className={cn("text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                             (safeComparison.delivery_growth_rate || 0) < 0 ? "bg-rose-500/20 text-rose-400" : "bg-cyan-500/20 text-cyan-400"
                         )}>TRAÇÃO</span>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white">
                            {(safeComparison.delivery_growth_rate || 0) < 0 ? "Atenção ao Volume" : "Volume em Alta"}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {(safeComparison.delivery_growth_rate || 0) < 0
                                ? `Queda de ${Math.abs(safeComparison.delivery_growth_rate || 0).toFixed(1)}% nas vendas delivery.`
                                : `Crescimento de ${(safeComparison.delivery_growth_rate || 0).toFixed(1)}% no período.`
                            }
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
