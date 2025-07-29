import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerStats {
  customer_id: string;
  total_spent: number;
  last_purchase: string | null;
}

export function useCustomerStats(customerId?: string) {
  return useQuery<CustomerStats | null>({
    queryKey: ['customer-stats', customerId],
    enabled: !!customerId,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_customer_stats')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      if (error) throw error;
      return data as CustomerStats;
    },
  });
}
