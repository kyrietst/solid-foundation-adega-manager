import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';

export interface DeliveryPerson {
    id: string;
    name: string;
}

export function useDeliveryPersons(isEnabled: boolean) {
    return useQuery({
        queryKey: ['profiles', 'entregador'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name') // Correct column name is 'name'
                .eq('role', 'delivery' as any)
                .order('name');

            if (error) throw error;
            return data as DeliveryPerson[];
        },
        enabled: isEnabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}
