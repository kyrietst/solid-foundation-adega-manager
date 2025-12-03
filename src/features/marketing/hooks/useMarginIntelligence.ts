import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface MarginIntelligenceItem {
    product_name: string;
    category_name: string;
    times_sold: number;
    total_units_sold: number;
    total_revenue: number;
    total_cost: number;
    gross_profit: number;
    margin_percent: number;
}

interface UseMarginIntelligenceOptions {
    limit?: number;
    sortBy?: 'profit' | 'margin';
    enabled?: boolean;
}

export function useMarginIntelligence(options: UseMarginIntelligenceOptions = {}) {
    const { limit = 10, sortBy = 'profit', enabled = true } = options;

    return useQuery({
        queryKey: ['margin-intelligence', limit, sortBy],
        queryFn: async (): Promise<MarginIntelligenceItem[]> => {
            // Query the view we created
            const { data, error } = await supabase
                .from('vw_kyrie_intelligence_margins')
                .select('*')
                .limit(limit);

            if (error) {
                console.error('❌ Erro ao buscar inteligência de margem:', error);
                throw error;
            }

            // Sort based on preference
            const sorted = (data || []).sort((a, b) => {
                if (sortBy === 'profit') {
                    return (b.gross_profit || 0) - (a.gross_profit || 0);
                } else {
                    return (b.margin_percent || 0) - (a.margin_percent || 0);
                }
            });

            return sorted;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000,
        enabled,
    });
}
