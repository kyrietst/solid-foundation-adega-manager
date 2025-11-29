import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    Truck, Store, TrendingUp, TrendingDown,
    AlertTriangle, CheckCircle, Calendar,
    DollarSign, ShoppingCart, Activity
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { cn } from '@/core/config/utils';

// --- Types ---
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

import { DateRange } from 'react-day-picker';

// ... imports ...

// --- Hook Reutilizado ---
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

            const { data, error } = await supabase.rpc('get_delivery_vs_instore_comparison', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString()
            });

            if (error) throw error;

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

            return (data as any[]) || [];
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

    // Dados seguros com fallback
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

    // Cálculos
    const totalRevenue = (safeComparison.delivery_revenue || 0) + (safeComparison.instore_revenue || 0);
    const totalOrders = (safeComparison.delivery_orders || 0) + (safeComparison.instore_orders || 0);
    const generalAvgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const deliveryShare = totalRevenue > 0 ? ((safeComparison.delivery_revenue || 0) / totalRevenue) * 100 : 0;
    const instoreShare = 100 - deliveryShare;

    // Formatação
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    return (
        <div className="space-y-8 pb-10">

            {/* 2. Placar do Jogo (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Receita Total"
                    value={totalRevenue}
                    description={
                        <span className="flex items-center gap-2">
                            <span className="text-blue-300">🛵 {deliveryShare.toFixed(0)}%</span>
                            <span className="text-gray-600">|</span>
                            <span className="text-emerald-300">🏪 {instoreShare.toFixed(0)}%</span>
                        </span>
                    }
                    icon={DollarSign}
                    variant="premium"
                    formatType="currency"
                />

                <StatCard
                    title="Total Pedidos"
                    value={totalOrders}
                    description={`${safeComparison.delivery_orders || 0} via Delivery`}
                    icon={ShoppingCart}
                    variant="default"
                    formatType="number"
                />

                <StatCard
                    title="Ticket Médio (Geral)"
                    value={generalAvgTicket}
                    description="Média global por pedido"
                    icon={DollarSign}
                    variant="default"
                    formatType="currency"
                />

                <StatCard
                    title="Ticket Médio (Delivery)"
                    value={safeComparison.delivery_avg_ticket || 0}
                    description={
                        <span className={(safeComparison.delivery_avg_ticket || 0) > (safeComparison.instore_avg_ticket || 0) ? "text-green-400" : "text-yellow-400"}>
                            vs {formatCurrency(safeComparison.instore_avg_ticket || 0)} (Loja)
                        </span>
                    }
                    icon={Truck}
                    variant={(safeComparison.delivery_avg_ticket || 0) > (safeComparison.instore_avg_ticket || 0) ? "success" : "warning"}
                    formatType="currency"
                />
            </div>

            {/* 3. Barra de Domínio */}
            <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        Domínio de Receita
                    </h3>
                    <span className="text-sm text-gray-400">Distribuição percentual</span>
                </div>

                <div className="relative h-8 w-full bg-gray-800 rounded-full overflow-hidden flex">
                    {/* Delivery Segment */}
                    <div
                        style={{ width: `${deliveryShare}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center transition-all duration-1000"
                    >
                        {deliveryShare > 10 && (
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                {deliveryShare.toFixed(1)}%
                            </span>
                        )}
                    </div>

                    {/* Instore Segment */}
                    <div
                        style={{ width: `${instoreShare}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 flex items-center justify-center transition-all duration-1000"
                    >
                        {instoreShare > 10 && (
                            <span className="text-xs font-bold text-white drop-shadow-md">
                                {instoreShare.toFixed(1)}%
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-gray-300">Delivery ({formatCurrency(safeComparison.delivery_revenue || 0)})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-gray-300">Loja Física ({formatCurrency(safeComparison.instore_revenue || 0)})</span>
                    </div>
                </div>
            </div>

            {/* 4. Gráfico de Tendência Simplificado */}
            <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Evolução Diária (Receita)
                    </h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends || []}>
                            <defs>
                                <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorInstore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#6B7280"
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `R$${val / 1000}k`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    borderColor: '#374151',
                                    borderRadius: '8px',
                                    color: '#F3F4F6'
                                }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ color: '#E5E7EB', fontWeight: '600' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="delivery_revenue"
                                stroke="#3b82f6"
                                fillOpacity={1}
                                fill="url(#colorDelivery)"
                                name="Delivery"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="instore_revenue"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorInstore)"
                                name="Loja Física"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 5. Insights Rápidos (Alertas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Insight 1: Dominância (Quem Lidera?) */}
                <div className={cn(
                    "p-4 rounded-xl border backdrop-blur-sm flex items-start gap-3",
                    deliveryShare > 50
                        ? "bg-blue-500/10 border-blue-500/20"
                        : "bg-emerald-500/10 border-emerald-500/20"
                )}>
                    {deliveryShare > 50
                        ? <Truck className="w-5 h-5 text-blue-400 mt-0.5" />
                        : <Store className="w-5 h-5 text-emerald-400 mt-0.5" />
                    }
                    <div>
                        <h4 className={cn("font-semibold",
                            deliveryShare > 50 ? "text-blue-400" : "text-emerald-400"
                        )}>
                            {deliveryShare > 50 ? "Delivery Liderando" : "Loja Física Liderando"}
                        </h4>
                        <p className="text-sm text-gray-300 mt-1">
                            {deliveryShare > 50
                                ? `O canal delivery representa ${deliveryShare.toFixed(0)}% da receita total.`
                                : `A loja física mantém a liderança com ${instoreShare.toFixed(0)}% da receita.`
                            }
                        </p>
                    </div>
                </div>

                {/* Insight 2: Oportunidade de Ticket */}
                <div className={cn(
                    "p-4 rounded-xl border backdrop-blur-sm flex items-start gap-3",
                    (safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                        ? "bg-yellow-500/10 border-yellow-500/20"
                        : "bg-green-500/10 border-green-500/20"
                )}>
                    {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                        ? <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                        : <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    }
                    <div>
                        <h4 className={cn("font-semibold",
                            (safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0) ? "text-yellow-400" : "text-green-400"
                        )}>
                            {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                                ? "Oportunidade: Ticket"
                                : "Ticket Delivery Forte"
                            }
                        </h4>
                        <p className="text-sm text-gray-300 mt-1">
                            {(safeComparison.delivery_avg_ticket || 0) < (safeComparison.instore_avg_ticket || 0)
                                ? `Ticket do delivery é R$ ${((safeComparison.instore_avg_ticket || 0) - (safeComparison.delivery_avg_ticket || 0)).toFixed(2)} menor que na loja.`
                                : `O ticket médio do delivery supera a loja em R$ ${((safeComparison.delivery_avg_ticket || 0) - (safeComparison.instore_avg_ticket || 0)).toFixed(2)}.`
                            }
                        </p>
                    </div>
                </div>

                {/* Insight 3: Atenção ao Volume (Crescimento) */}
                <div className={cn(
                    "p-4 rounded-xl border backdrop-blur-sm flex items-start gap-3",
                    (safeComparison.delivery_growth_rate || 0) < 0
                        ? "bg-red-500/10 border-red-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                )}>
                    {(safeComparison.delivery_growth_rate || 0) < 0
                        ? <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                        : <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5" />
                    }
                    <div>
                        <h4 className={cn("font-semibold",
                            (safeComparison.delivery_growth_rate || 0) < 0 ? "text-red-400" : "text-blue-400"
                        )}>
                            {(safeComparison.delivery_growth_rate || 0) < 0 ? "Atenção ao Volume" : "Volume em Alta"}
                        </h4>
                        <p className="text-sm text-gray-300 mt-1">
                            {(safeComparison.delivery_growth_rate || 0) < 0
                                ? `Queda de ${Math.abs(safeComparison.delivery_growth_rate || 0).toFixed(1)}% nas vendas delivery.`
                                : `Crescimento de ${(safeComparison.delivery_growth_rate || 0).toFixed(1)}% no período.`
                            }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
