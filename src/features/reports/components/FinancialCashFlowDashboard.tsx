import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

import {
    DollarSign, TrendingUp, TrendingDown, AlertCircle,
    Calendar, ArrowUpRight, ArrowDownRight, Users, Wallet
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { DateRange } from 'react-day-picker';

// --- Types ---
interface DailyFlow {
    date: string;
    income: number;
    outcome: number;
    balance: number;
}

interface Debtor {
    customer_name: string;
    amount: number;
    days_overdue: number;
    phone?: string;
}

interface ExpenseCategory {
    name: string;
    amount: number;
    percentage: number;
}

// --- Hooks ---

// 1. Hook de Fluxo Diário (Entradas vs Saídas)
function useDailyCashFlow(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['daily-cash-flow', dateRange],
        queryFn: async (): Promise<DailyFlow[]> => {
            if (!dateRange?.from || !dateRange?.to) return [];

            const { data, error } = await supabase.rpc('get_daily_cash_flow', {
                p_start_date: dateRange.from.toISOString(),
                p_end_date: dateRange.to.toISOString()
            });

            if (error) throw error;

            return (data as any[]).map(item => ({
                date: item.date,
                income: Number(item.income),
                outcome: Number(item.outcome),
                balance: Number(item.balance)
            }));
        },
        enabled: !!dateRange?.from,
        staleTime: 5 * 60 * 1000
    });
}

// 2. Hook de Devedores (Top Debtors)
function useDebtors() {
    return useQuery({
        queryKey: ['top-debtors'],
        queryFn: async (): Promise<Debtor[]> => {
            const { data, error } = await supabase
                .from('accounts_receivable')
                .select(`
                    amount,
                    due_date,
                    customers!inner(name, phone)
                `)
                .eq('status', 'open' as any)
                .lt('due_date', new Date().toISOString()) // Apenas vencidos
                .order('amount', { ascending: false })
                .limit(10); // Top 10

            if (error) throw error;

            return (data || []).map((item: any) => ({
                customer_name: item.customers?.name || 'Cliente Desconhecido',
                amount: item.amount,
                days_overdue: Math.max(0, Math.floor(
                    (new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24)
                )),
                phone: item.customers?.phone
            }));
        },
        staleTime: 5 * 60 * 1000
    });
}

// 3. Hook de Top Despesas
function useTopExpenses(dateRange: DateRange | undefined) {
    return useQuery({
        queryKey: ['top-expenses-breakdown', dateRange],
        queryFn: async (): Promise<ExpenseCategory[]> => {
            if (!dateRange?.from || !dateRange?.to) return [];

            const startDate = dateRange.from.toISOString();
            const endDate = dateRange.to.toISOString();

            const { data, error } = await supabase
                .from('expenses')
                .select('amount, category:expense_categories(name)')
                .gte('date', startDate)
                .lte('date', endDate);

            if (error) throw error;

            const categoryMap = new Map<string, number>();
            let total = 0;

            (data || []).forEach((item: any) => {
                const catName = item.category?.name || 'Outros';
                const amount = Number(item.amount);
                categoryMap.set(catName, (categoryMap.get(catName) || 0) + amount);
                total += amount;
            });

            return Array.from(categoryMap.entries())
                .map(([name, amount]) => ({
                    name,
                    amount,
                    percentage: total > 0 ? (amount / total) * 100 : 0
                }))
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 5);
        },
        enabled: !!dateRange?.from,
        staleTime: 5 * 60 * 1000
    });
}

// 4. Hook de KPIs Financeiros (Agregado)
function useFinancialKPIs(dateRange: DateRange | undefined) {
    // Reutilizando lógica dos hooks anteriores para consistência
    const { data: flow } = useDailyCashFlow(dateRange);

    const totalRevenue = flow?.reduce((acc, curr) => acc + curr.income, 0) || 0;
    const totalExpenses = flow?.reduce((acc, curr) => acc + curr.outcome, 0) || 0;
    const operationalProfit = totalRevenue - totalExpenses;

    // Total a Receber (Geral, não apenas vencidos, para o KPI)
    // Precisamos de uma query separada rápida para o total geral em aberto
    const { data: totalReceivable } = useQuery({
        queryKey: ['total-receivable-kpi'],
        queryFn: async () => {
            const { data } = await supabase
                .from('accounts_receivable')
                .select('amount')
                .eq('status', 'open' as any);
            return ((data as any[]) || []).reduce((acc, curr) => acc + curr.amount, 0);
        }
    });

    return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: operationalProfit,
        receivables: totalReceivable || 0
    };
}

interface FinancialCashFlowDashboardProps {
    dateRange?: DateRange;
}

export const FinancialCashFlowDashboard: React.FC<FinancialCashFlowDashboardProps> = ({ dateRange }) => {
    const { data: dailyFlow, isLoading: loadingFlow } = useDailyCashFlow(dateRange);
    const { data: debtors, isLoading: loadingDebtors } = useDebtors();
    const { data: topExpenses, isLoading: loadingExpenses } = useTopExpenses(dateRange);
    const kpis = useFinancialKPIs(dateRange);

    const isLoading = loadingFlow || loadingDebtors || loadingExpenses;

    // Formatação
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">

            {/* 2. A Saúde do Caixa (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Faturamento Total"
                    value={kpis.revenue}
                    description="Vendas confirmadas (Caixa)"
                    icon={DollarSign}
                    variant="default"
                    formatType="currency"
                />

                <StatCard
                    title="Despesas Pagas"
                    value={kpis.expenses}
                    description="Saídas do período"
                    icon={Wallet}
                    variant="warning"
                    formatType="currency"
                />

                <StatCard
                    title="Lucro Operacional"
                    value={kpis.profit}
                    description={kpis.profit >= 0 ? "Saldo positivo" : "Saldo negativo"}
                    icon={kpis.profit >= 0 ? TrendingUp : TrendingDown}
                    variant={kpis.profit >= 0 ? "success" : "error"}
                    formatType="currency"
                />

                <StatCard
                    title="A Receber (Fiado)"
                    value={kpis.receivables}
                    description="Total em aberto com clientes"
                    icon={Users}
                    variant="premium"
                    formatType="currency"
                />
            </div>

            {/* 3. Fluxo do Mês (Gráfico) */}
            <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Fluxo Diário (Entradas vs Saídas)
                    </h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyFlow || []}>
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
                                cursor={{ fill: '#ffffff10' }}
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    borderColor: '#374151',
                                    borderRadius: '8px',
                                    color: '#F3F4F6'
                                }}
                                itemStyle={{ color: '#E5E7EB' }}
                                labelStyle={{ color: '#E5E7EB', fontWeight: '600' }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <ReferenceLine y={0} stroke="#6b7280" />
                            <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="outcome" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 4. Quem me deve? (Tabela de Cobrança) */}
                <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            Top Devedores (Ação Necessária)
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
                            Ver Todos
                        </Button>
                    </div>

                    <div className="overflow-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 sticky top-0 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Cliente</th>
                                    <th className="px-4 py-3">Valor</th>
                                    <th className="px-4 py-3">Atraso</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {debtors?.map((debtor, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-medium text-white">
                                            {debtor.customer_name}
                                        </td>
                                        <td className="px-4 py-3 text-red-300 font-bold">
                                            {formatCurrency(debtor.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                debtor.days_overdue > 30 ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"
                                            )}>
                                                {debtor.days_overdue} dias
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs border-green-500/30 text-green-400 hover:bg-green-500/20"
                                                onClick={() => window.open(`https://wa.me/55${debtor.phone?.replace(/\D/g, '')}?text=Olá ${debtor.customer_name}, notamos uma pendência de ${formatCurrency(debtor.amount)}. Podemos ajudar?`, '_blank')}
                                                disabled={!debtor.phone}
                                            >
                                                Cobrar
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {(!debtors || debtors.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            Nenhum devedor encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Para onde foi o dinheiro? (Top Despesas) */}
                <div className="bg-gray-800/30 border border-gray-700/40 backdrop-blur-sm shadow-lg rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-yellow-400" />
                            Top Despesas
                        </h3>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={topExpenses || []} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#6B7280"
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: '#ffffff10' }}
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        borderColor: '#374151',
                                        borderRadius: '8px',
                                        color: '#F3F4F6'
                                    }}
                                    itemStyle={{ color: '#E5E7EB' }}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Bar dataKey="amount" name="Valor" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topExpenses?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
