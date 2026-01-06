import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';

export function useFinancialCharts(
    period: 'daily' | 'weekly' | 'monthly', 
    dateRange?: DateRange // Add dateRange support
) {
    const dailyCashFlowQuery = useQuery({
        // Add dateRange to queryKey to invalidate when it changes
        queryKey: ['financial-metrics', 'daily-cash-flow', period, dateRange?.from, dateRange?.to],
        queryFn: async () => {
            const now = new Date();
            let startDate: Date;
            let endDate: Date = endOfDay(now);

            // Priority: Global DateRange > Local Period
            if (dateRange?.from) {
                startDate = startOfDay(dateRange.from);
                if (dateRange.to) {
                    endDate = endOfDay(dateRange.to);
                }
            } else {
                // Fallback to Period Logic
                startDate = startOfDay(subDays(now, 30));
                if (period === 'daily') startDate = startOfDay(subDays(now, 30)); 
                if (period === 'weekly') startDate = startOfDay(subDays(now, 90));
                if (period === 'monthly') startDate = startOfDay(subDays(now, 365));
            }

            const { data, error } = await supabase.rpc('get_real_cash_flow' as any, {
                p_start_date: startDate.toISOString(),
                p_end_date: endDate.toISOString()
            });

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000,
    });

    const debtorsQuery = useQuery({
        queryKey: ['financial-metrics', 'debtors'],
        queryFn: async () => {
            // Unificação com Dashboard: Buscar da tabela sales com status pending
            const { data } = await supabase
                .from('sales')
                .select(`
                  id,
                  final_amount,
                  created_at,
                  customer:customers(id, name, phone)
                `)
                .eq('payment_status', 'pending')
                .neq('status', 'cancelled')
                .order('created_at', { ascending: false });

            // Agrupar por cliente no frontend (já que sales é granular por venda)
            const customersMap = new Map();

            (data || []).forEach((sale: any) => {
                if (!sale.customer) return; // Venda sem cliente identificado (não deveria ocorrer em fiado, mas validamos)
                
                const customerId = sale.customer.id;
                const current = customersMap.get(customerId) || {
                    customer_name: sale.customer.name,
                    phone: sale.customer.phone,
                    amount: 0,
                    oldest_debt: sale.created_at
                };

                current.amount += sale.final_amount;
                // Manter a data mais antiga para calcular dias de atraso
                if (new Date(sale.created_at) < new Date(current.oldest_debt)) {
                    current.oldest_debt = sale.created_at;
                }

                customersMap.set(customerId, current);
            });

            return Array.from(customersMap.values()).map((item: any) => ({
                customer_name: item.customer_name,
                phone: item.phone,
                amount: item.amount,
                days_overdue: Math.floor((new Date().getTime() - new Date(item.oldest_debt).getTime()) / (1000 * 60 * 60 * 24))
            }));
        }
    });

    const topExpensesQuery = useQuery({
        queryKey: ['financial-metrics', 'top-expenses', period, dateRange?.from],
        queryFn: async () => {
            const now = new Date();
            let fromDate: Date;

            if (dateRange?.from) {
                fromDate = startOfDay(dateRange.from);
            } else {
                fromDate = subDays(now, period === 'daily' ? 30 : period === 'weekly' ? 90 : 365);
            }

            const { data } = await supabase
                .from('expenses' as any)
                .select('amount, category:expense_categories(name)')
                .eq('payment_status', 'paid')
                .gte('paid_at', fromDate.toISOString());

            // Client side aggregation needed if RPC not available
            return data || [];
        }
    });

    return {
        dailyCashFlow: dailyCashFlowQuery,
        debtors: debtorsQuery,
        topExpenses: topExpensesQuery,
    };
}
