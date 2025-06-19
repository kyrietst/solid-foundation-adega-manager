import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string | null;
}

/**
 * Carrega um produto por ID.
 * Se o ID for indefinido, a query fica desabilitada.
 */
export function useProduct(productId?: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
