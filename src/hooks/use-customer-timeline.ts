import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerEvent {
  id: string;
  customer_id: string;
  source: 'sale' | 'movement';
  source_id: string;
  payload: any;
  created_at: string;
}

export function useCustomerTimeline(customerId?: string) {
  return useQuery<CustomerEvent[]>({
    queryKey: ['customer-timeline', customerId],
    enabled: !!customerId,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_customer_timeline')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomerEvent[];
    },
  });
}
