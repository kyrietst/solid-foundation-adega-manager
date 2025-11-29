import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
function useDailyCashFlow(days: number) {
    return useQuery({
        queryKey: ['daily-cash-flow', days],
        queryFn: async (): Promise<DailyFlow[]> => {
            const endDate = new Date();
            const startDate = subDays(endDate, days);

            // Buscar Vendas (Entradas)
            const { data: salesData, error: salesError } = await supabase
                .from('sales')
                .select('final_amount, created_at, status, delivery_type, delivery_status, delivery')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .not('final_amount', 'is', null);

            if (salesError) throw salesError;
            const sales = salesData as any[];

            // Buscar Despesas (Saídas)
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('amount, date')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString());

            if (expensesError) {
                console.warn("Erro ao buscar despesas diárias, assumindo zero para gráfico", expensesError);
            }
            const expenses = expensesData as any[];

            // Processar e Agrupar por Dia
            const dailyMap = new Map<string, { income: number; outcome: number }>();

            // Inicializar mapa com todos os dias
            for (let i = 0; i <= days; i++) {
                const d = subDays(endDate, days - i);
                const key = format(d, 'yyyy-MM-dd');
                dailyMap.set(key, { income: 0, outcome: 0 });
            }

            // Somar Entradas
            (sales || []).forEach(sale => {
                // Filtro de Status (Híbrido - mesmo do dashboard)
                const isPresencialCompleted = (sale.status === 'completed') && (sale.delivery_type === 'presencial' || sale.delivery === false);
                const isDeliveryDelivered = (sale.delivery_type === 'delivery') && (sale.delivery_status === 'delivered');

                if (isPresencialCompleted || isDeliveryDelivered) {
                    const key = format(parseISO(sale.created_at), 'yyyy-MM-dd');
                    if (dailyMap.has(key)) {
                        const current = dailyMap.get(key)!;
                        current.income += Number(sale.final_amount);
                    }
                }
            });

            // Somar Saídas
            (expenses || []).forEach(expense => {
                const key = format(parseISO(expense.date), 'yyyy-MM-dd');
                if (dailyMap.has(key)) {
                    const current = dailyMap.get(key)!;
                    current.outcome += Number(expense.amount);
                }
            });

            // Converter para Array
            return Array.from(dailyMap.entries()).map(([dateStr, val]) => ({
                date: format(parseISO(dateStr), 'dd/MM'),
                income: val.income,
                outcome: val.outcome,
                balance: val.income - val.outcome
            }));
        },
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
function useTopExpenses(days: number) {
    return useQuery({
        queryKey: ['top-expenses-breakdown', days],
        queryFn: async (): Promise<ExpenseCategory[]> => {
            const endDate = new Date();
            const startDate = subDays(endDate, days);

            const { data, error } = await supabase
                .from('expenses')
                .select('amount, category:expense_categories(name)')
                .gte('date', startDate.toISOString())
                .lte('date', endDate.toISOString());

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
        staleTime: 5 * 60 * 1000
    });
}

// 4. Hook de KPIs Financeiros (Agregado)
function useFinancialKPIs(days: number) {
    // Reutilizando lógica dos hooks anteriores para consistência
    const { data: flow } = useDailyCashFlow(days);
    const { data: debtors } = useDebtors();

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

export const FinancialCashFlowDashboard: React.FC = () => {
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    const { data: dailyFlow, isLoading: loadingFlow } = useDailyCashFlow(days);
    const { data: debtors, isLoading: loadingDebtors } = useDebtors();
    const { data: topExpenses, isLoading: loadingExpenses } = useTopExpenses(days);
    const kpis = useFinancialKPIs(days);

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
            {/* 1. Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Fluxo de Caixa & Liquidez"
                    description="Visão simplificada da saúde financeira da adega."
                />

                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-lg border border-white/5">
                    <Calendar className="w-4 h-4 text-gray-400 ml-2" />
                    <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                        <SelectTrigger className="w-32 border-0 bg-transparent text-white focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="90d">Últimos 90 dias</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

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
            <GlassCard className="p-6">
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
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `R$${val / 1000}k`}
                            />
                            <Tooltip
                                cursor={{ fill: '#ffffff10' }}
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    borderColor: '#1e293b',
                                    borderRadius: '8px',
                                    color: '#fff'
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <ReferenceLine y={0} stroke="#6b7280" />
                            <Bar dataKey="income" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="outcome" name="Saídas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 4. Quem me deve? (Tabela de Cobrança) */}
                <GlassCard className="p-6 flex flex-col">
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
                            <thead className="text-xs text-gray-400 uppercase bg-black/20">
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
                                            Nenhum cliente em atraso crítico.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

                {/* 5. Para onde foi o dinheiro? (Top Despesas) */}
                <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-yellow-400" />
                            Principais Despesas
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {topExpenses?.map((expense, idx) => (
                            <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">{expense.name}</span>
                                    <span className="text-white font-medium">{formatCurrency(expense.amount)}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500/80 rounded-full"
                                        style={{ width: `${expense.percentage}%` }}
                                    />
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    {expense.percentage.toFixed(1)}% do total
                                </div>
                            </div>
                        ))}
                        {(!topExpenses || topExpenses.length === 0) && (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma despesa registrada no período.
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
