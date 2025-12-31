import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface DeliveryTimelineEvent {
    tracking_id: string;
    status: string;
    notes: string;
    location_lat?: number;
    location_lng?: number;
    created_by_id?: string;
    created_by_name: string;
    created_at: string;
    time_diff_minutes?: number;
    is_current_status: boolean;
}

export function useDeliveryTimeline(saleId: string) {
    return useQuery({
        queryKey: ['delivery-timeline', saleId],
        queryFn: async (): Promise<DeliveryTimelineEvent[]> => {
            const { data, error } = await supabase.rpc('get_delivery_timeline', {
                p_sale_id: saleId
            });

            if (error) {
                console.error('❌ Erro ao buscar timeline:', error);
                throw error;
            }

            return (data as unknown as DeliveryTimelineEvent[]) || [];
        },
        staleTime: 30 * 1000, // 30 segundos
        refetchInterval: 60 * 1000, // Refetch a cada minuto
        enabled: !!saleId
    });
}
