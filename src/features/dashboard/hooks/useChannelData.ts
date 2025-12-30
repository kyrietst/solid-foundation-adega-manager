import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { getMonthStartDate, getNowSaoPaulo } from '../utils/dateHelpers';

export function useChannelData() {
    return useQuery({
        queryKey: ['channel-breakdown', 'mtd'],
        queryFn: async () => {
            const startDate = getMonthStartDate();
            const endDate = getNowSaoPaulo();

            const { data: sales } = await supabase
                .from('sales')
                .select('delivery_type, final_amount')
                .eq('status', 'completed')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .not('final_amount', 'is', null);

            const deliverySales = (sales || []).filter(s => s.delivery_type === 'delivery');
            const instoreSales = (sales || []).filter(s => s.delivery_type === 'presencial');

            return {
                delivery_revenue: deliverySales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0),
                instore_revenue: instoreSales.reduce((sum, s) => sum + Number(s.final_amount || 0), 0),
                delivery_orders: deliverySales.length,
                instore_orders: instoreSales.length,
                total_orders: (sales || []).length
            };
        },
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: true,
    });
}
