import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerPurchase {
  purchase_id: string;
  customer_id: string;
  source: 'sale' | 'fiado';
  total: number;
  created_at: string;
  items: any | null;
}

export function useCustomerPurchases(customerId?: string) {
  return useQuery<CustomerPurchase[]>({
    queryKey: ['customer-purchases', customerId],
    enabled: !!customerId,
    staleTime: 1000 * 60,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_customer_purchases')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomerPurchase[];
    },
  });
}
