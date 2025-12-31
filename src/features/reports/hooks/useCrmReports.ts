import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { DateRange } from 'react-day-picker';

export interface CustomerSummary {
    total_customers: number;
    new_customers: number;
    active_customers: number;
}

export interface RetentionData {
    period: string;
    retained: number;
    lost: number;
}

export interface CustomerSegment {
    segment: string;
    count: number;
    total_ltv: number;
    recent_active: number;
    avg_ltv: number;
    retention_rate: number;
}

export function useCrmReports(dateRange: DateRange | undefined) {
    // 1. Customer Summary
    const summaryQuery = useQuery({
        queryKey: ['crm-summary', dateRange],
        queryFn: async () => {
            // Retornar valores zerados se não houver range válido, para evitar "loading" infinito ou erro
            if (!dateRange?.from || !dateRange?.to) return { total_customers: 0, new_customers: 0, active_customers: 0 };

            const { data, error } = await supabase.rpc('get_customer_summary', {
                start_date: dateRange.from.toISOString(),
                end_date: dateRange.to.toISOString()
            });
            if (error) throw error;
            return data?.[0] || { total_customers: 0, new_customers: 0, active_customers: 0 };
        },
        enabled: !!dateRange?.from,
    });

    // 2. Retention
    const retentionQuery = useQuery({
        queryKey: ['crm-retention', dateRange],
        queryFn: async () => {
            if (!dateRange?.from || !dateRange?.to) return [];
            const { data, error } = await supabase.rpc('get_customer_retention', {
                start_date: dateRange.from.toISOString(),
                end_date: dateRange.to.toISOString()
            });
            if (error) throw error;
            return data || [];
        },
        enabled: !!dateRange?.from,
    });

    // 3. Top Customers
    const topCustomersQuery = useQuery({
        queryKey: ['crm-top-customers', dateRange],
        queryFn: async () => {
            if (!dateRange?.from || !dateRange?.to) return [];
            const { data, error } = await supabase.rpc('get_top_customers', {
                start_date: dateRange.from.toISOString(),
                end_date: dateRange.to.toISOString(),
                limit_count: 20
            });
            if (error) throw error;
            return data || [];
        },
        enabled: !!dateRange?.from,
    });

    // 4. Segments (All Time)
    const segmentsQuery = useQuery({
        queryKey: ['crm-segments'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('customers')
                .select('segment, lifetime_value, last_purchase_date')
                .not('segment', 'is', null);

            if (error) throw error;

            const segmentAnalysis = (data as any[] || []).reduce((acc: any, customer) => {
                const segment = customer.segment || 'Indefinido';
                if (!acc[segment]) {
                    acc[segment] = { segment, count: 0, total_ltv: 0, recent_active: 0 };
                }
                acc[segment].count += 1;
                acc[segment].total_ltv += Number(customer.lifetime_value || 0);

                if (customer.last_purchase_date) {
                    const daysSince = Math.floor((new Date().getTime() - new Date(customer.last_purchase_date).getTime()) / (86400000));
                    if (daysSince <= 30) acc[segment].recent_active += 1;
                }
                return acc;
            }, {});

            return Object.values(segmentAnalysis).map((seg: any) => ({
                ...seg,
                avg_ltv: seg.count > 0 ? seg.total_ltv / seg.count : 0,
                retention_rate: seg.count > 0 ? (seg.recent_active / seg.count) * 100 : 0
            }));
        },
    });

    // 5. Birthdays
    const birthdaysQuery = useQuery({
        queryKey: ['crm-birthdays'],
        queryFn: async () => {
            const { data } = await supabase.from('customers').select('birthday').not('birthday', 'is', null);
            return data || [];
        }
    });

    return {
        summary: { data: summaryQuery.data, isLoading: summaryQuery.isLoading },
        retention: { data: retentionQuery.data, isLoading: retentionQuery.isLoading },
        topCustomers: { data: topCustomersQuery.data, isLoading: topCustomersQuery.isLoading },
        segments: { data: segmentsQuery.data, isLoading: segmentsQuery.isLoading },
        birthdays: { data: birthdaysQuery.data, isLoading: birthdaysQuery.isLoading }
    };
}
