import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/types/inventory.types';

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
        .select('*')
        .eq('id', productId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

/**
 * Busca um produto por código de barras.
 * Se o código for indefinido, a query fica desabilitada.
 */
export function useProductByBarcode(barcode?: string | null) {
  return useQuery<Product | null>({
    queryKey: ['product', 'barcode', barcode],
    queryFn: async () => {
      if (!barcode) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Produto não encontrado
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!barcode,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
