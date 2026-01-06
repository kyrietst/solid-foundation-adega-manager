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

            {/* 2. KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Entradas de Caixa"
                    value={kpis.revenue}
                    description="Recebimentos confirmados"
                    icon={DollarSign}
                    variant="success"
                    formatType="currency"
                />

                <StatCard
                    title="Saídas de Caixa"
                    value={kpis.expenses}
                    description="Pagamentos realizados"
                    icon={Wallet}
                    variant="warning"
                    formatType="currency"
                />

                <StatCard
                    title="Saldo Líquido"
                    value={kpis.profit}
                    description={kpis.profit >= 0 ? "Superávit no período" : "Déficit no período"}
                    icon={kpis.profit >= 0 ? TrendingUp : TrendingDown}
                    variant={kpis.profit >= 0 ? "success" : "error"}
                    formatType="currency"
                />

                <StatCard
                    title="A Receber (Fiado)"
                    value={kpis.receivables}
                    description="Vendas pendentes (Futuro)"
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
                        Dinâmica de Caixa (Entradas vs Saídas)
                    </h3>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cashFlowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis
                                dataKey="day" // Updated to use 'day' from RPC
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={safeFormatDate}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `R$ ${val}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#F3F4F6' }}
                                formatter={(val: number, name: string) => [
                                    formatCurrency(val), 
                                    name === 'income' ? 'Entradas' : name === 'outcome' ? 'Saídas' : name
                                ]}
                                labelFormatter={safeFormatFullDate}
                            />
                            <Bar dataKey="income" name="income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey="outcome" name="outcome" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 4. Grid de Detalhes (Devedores vs Despesas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Devedores */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Top Devedores
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs text-gray-400">Ver Todos</Button>
                    </div>

                    <div className="space-y-4">
                        {debtorsList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">Nenhum débito em atraso</div>
                        ) : (
                            debtorsList.map((debtor: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-900/40 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs">
                                            {debtor.customer_name?.substring(0, 2).toUpperCase() || 'CL'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{debtor.customer_name || 'Desconhecido'}</p>
                                            <p className="text-xs text-amber-400">Venceu há {debtor.days_overdue} dias</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-white">{formatCurrency(debtor.amount)}</p>
                                        <Button variant="link" className="h-auto p-0 text-xs text-blue-400">Cobrar</Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </GlassCard>

                {/* Top Despesas */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ArrowDownRight className="w-5 h-5 text-red-500" />
                            Principais Despesas
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Mock data visualization as we don't have full expenses yet */}
                        {topExpensesList.map((expense: any, i: number) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">{expense.category?.name}</span>
                                    <span className="text-white font-medium">{formatCurrency(expense.amount)}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500/80 rounded-full"
                                        style={{ width: `${(expense.amount / totalExpenses) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
