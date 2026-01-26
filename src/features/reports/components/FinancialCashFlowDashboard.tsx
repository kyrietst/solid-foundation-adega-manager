import React, { useState, useMemo } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, AlertCircle,
    Calendar, ArrowDownRight, Users, Wallet
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';

import { GlassCard } from '@/shared/ui/composite/GlassCard';
import { StatCard } from '@/shared/ui/composite/stat-card';
import { PageHeader } from '@/shared/ui/composite/PageHeader';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { DateRange } from 'react-day-picker';
import { useFinancialCharts } from '@/features/reports/hooks/useFinancialCharts';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';

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

interface FinancialCashFlowDashboardProps {
    dateRange?: DateRange;
}

export const FinancialCashFlowDashboard: React.FC<FinancialCashFlowDashboardProps> = ({ dateRange }) => {
    // State
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

    // Data Fetching
    // Data Fetching
    const { dailyCashFlow, debtors, topExpenses } = useFinancialCharts(period, dateRange); // 🚀 Passed dateRange prop
    const { financials } = useDashboardData(); // 🚀 SSoT: Reutilizando lógica do Dashboard para KPIs globais (DRY)

    // Safety check for hook results in case they are undefined during initial render/mocking
    const cashFlowData = dailyCashFlow?.data || [];
    const isLoadingCashFlow = dailyCashFlow?.isLoading || false;

    const debtorsList = debtors?.data || [];
    const isLoadingDebtors = debtors?.isLoading || false;

    const topExpensesList = topExpenses?.data || [];
    const isLoadingExpenses = topExpenses?.isLoading || false;

    const isLoading = isLoadingCashFlow || isLoadingDebtors || isLoadingExpenses;

    // Derived Metrics
    const totalRevenue = useMemo(() => {
        // Now using 'income' from the RPC result
        return cashFlowData.reduce((acc: number, curr: any) => acc + (curr.income || 0), 0);
    }, [cashFlowData]);

    const totalExpenses = useMemo(() => {
        // Now using 'outcome' from the RPC result directly (or fallback to topExpensesList if not using RPC for total)
        // But since we have the flow, let's use the flow data for consistency in "Paid Expenses" within the period
        return cashFlowData.reduce((acc: number, curr: any) => acc + (curr.outcome || 0), 0);
    }, [cashFlowData]);

    const netProfit = useMemo(() => {
        return totalRevenue - totalExpenses;
    }, [totalRevenue, totalExpenses]);

    // KPI logic
    const kpis = useMemo(() => ({
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: netProfit,
        receivables: financials?.accountsReceivable || 0
    }), [totalRevenue, totalExpenses, netProfit, financials?.accountsReceivable]);

    // Handlers
    const handlePeriodChange = (value: string) => {
        if (value === 'daily' || value === 'weekly' || value === 'monthly') {
            setPeriod(value);
        }
    };

    // Formatação
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const safeFormatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Split YYYY-MM-DD manually to create local date at 00:00:00 without UTC shift
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        }
        return '';
    };

    const safeFormatFullDate = (dateStr: string) => {
         if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
             const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
             return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
        }
        return dateStr;
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header & Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" />
                        Fluxo de Caixa (Real)
                    </h2>
                    <p className="text-sm text-gray-400">
                        Visão consolidada de Entradas (Recebimentos) vs Saídas (Pagamentos).
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-700 text-white">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Últimos 30 Dias</SelectItem>
                            <SelectItem value="weekly">Últimos 90 Dias</SelectItem>
                            <SelectItem value="monthly">Último Ano</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="border-gray-700 bg-gray-900/30 text-gray-300">
                        <Calendar className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            {/* 2. KPIs Principais - Standardized Metrics Strip */}
            <section className="w-full mb-8">
                <div className="flex flex-wrap items-center justify-between gap-6 px-4 py-2 border-b border-white/5 pb-8">
                    
                    {/* Entradas */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-sm font-medium text-zinc-500">Entradas de Caixa</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {formatCurrency(kpis.revenue)}
                            </span>
                             <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Recebido
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                    {/* Saídas */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-sm font-medium text-zinc-500">Saídas de Caixa</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {formatCurrency(kpis.expenses)}
                            </span>
                             <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                                <Wallet className="h-3 w-3 mr-1" />
                                Pago
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                    {/* Saldo Líquido */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-sm font-medium text-zinc-500">Saldo Líquido</span>
                        <div className="flex items-baseline gap-2">
                            <span className={cn("text-3xl font-bold tracking-tight", kpis.profit >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {formatCurrency(kpis.profit)}
                            </span>
                            {kpis.profit >= 0 ? (
                                <span className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Lucro
                                </span>
                            ) : (
                                <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                    Déficit
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                     {/* A Receber */}
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-sm font-medium text-zinc-500">A Receber (Fiado)</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {formatCurrency(kpis.receivables)}
                            </span>
                             <span className="flex items-center text-xs font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md">
                                <Users className="h-3 w-3 mr-1" />
                                Pendente
                            </span>
                        </div>
                    </div>

                </div>
            </section>

            {/* 3. Fluxo do Mês (Gráfico) */}
            <GlassCard className="p-6 border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Dinâmica de Caixa (Entradas vs Saídas)
                    </h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} strokeOpacity={0.3} />
                            <XAxis
                                dataKey="day"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={safeFormatDate}
                                dy={10}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `R$ ${val}`}
                                dx={-10}
                            />
                             <Tooltip
                                cursor={{ fill: 'white', opacity: 0.05 }}
                                contentStyle={{ 
                                    backgroundColor: '#09090b', 
                                    borderColor: 'rgba(255,255,255,0.1)', 
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    padding: '12px'
                                }}
                                itemStyle={{ padding: '2px 0' }}
                                labelStyle={{ color: '#A1A1AA', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                formatter={(val: number, name: string) => [
                                    <span key="val" className="font-bold text-white">{formatCurrency(val)}</span>,
                                    name === 'income' ? 'Entradas' : name === 'outcome' ? 'Saídas' : name
                                ]}
                                labelFormatter={safeFormatFullDate}
                            />
                            <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="outcome" name="outcome" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* 4. Grid de Detalhes (Devedores vs Despesas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Devedores */}
                <GlassCard className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                         <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Top Devedores
                        </h3>
                         <Button variant="ghost" size="sm" className="text-xs text-zinc-500 hover:text-white h-auto p-0 hover:bg-transparent">Ver Todos</Button>
                    </div>

                    <div className="p-2 space-y-1">
                        {debtorsList.length === 0 ? (
                            <div className="text-center py-8 text-zinc-500 text-sm">Nenhum débito em atraso</div>
                        ) : (
                            debtorsList.map((debtor: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/20">
                                            {debtor.customer_name?.substring(0, 2).toUpperCase() || 'CL'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">{debtor.customer_name || 'Desconhecido'}</p>
                                            <p className="text-xs text-amber-500/80">Venceu há {debtor.days_overdue} dias</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">{formatCurrency(debtor.amount)}</p>
                                        <Button 
                                            variant="ghost" 
                                            className="h-auto p-0 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-transparent"
                                        >
                                            Cobrar
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Top Despesas */}
                <GlassCard className="p-0 overflow-hidden border-white/5 bg-white/[0.02]">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                            Principais Despesas
                        </h3>
                    </div>

                    <div className="p-5 space-y-5">
                        {topExpensesList.length === 0 ? (
                             <div className="text-center py-8 text-zinc-500 text-sm">Nenhuma despesa registrada</div>
                        ) : (
                            topExpensesList.map((expense: any, i: number) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">{expense.category?.name || 'Geral'}</span>
                                        <span className="text-white font-medium">{formatCurrency(expense.amount)}</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] rounded-full"
                                            style={{ width: `${Math.min(100, (expense.amount / totalExpenses) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
