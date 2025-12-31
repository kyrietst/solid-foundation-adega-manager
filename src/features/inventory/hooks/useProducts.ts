import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { Product } from '@/core/types/inventory.types';

export function useProducts(isEnabled: boolean = true) {
    return useQuery({
        queryKey: ['products', 'list'],
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        queryFn: async (): Promise<Product[]> => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .is('deleted_at', null)
                .order('name', { ascending: true });

            if (error) throw error;
            return (data || []) as unknown as Product[];
        },
        enabled: isEnabled,
    });
}
