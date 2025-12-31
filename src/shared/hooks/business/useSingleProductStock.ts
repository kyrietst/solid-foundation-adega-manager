import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { transformToStockData, type ProductStockData } from '@/shared/hooks/business/useStockData';

export const useSingleProductStock = (productId: string | undefined) => {
    return useQuery({
        queryKey: ['products', 'single', productId],
        queryFn: async () => {
            if (!productId) return null;

            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) throw error;

            return transformToStockData(data);
        },
        enabled: !!productId,
        staleTime: 0, // Always fetch fresh data for stock checks
    });
};
