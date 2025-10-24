import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/core/api/supabase/client';
import type { Product } from '@/types/inventory.types';

/**
 * Carrega um produto por ID.
 * Se o ID for indefinido, a query fica desabilitada.
 * Otimizado com Context7 best practices
 */
export function useProduct(productId?: string | null) {
  // Memoize query function for stable reference (Context7 best practice)
  const queryFn = useCallback(async () => {
    if (!productId) return null;
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .is('deleted_at', null)
      .single();
    if (error) throw error;
    return data;
  }, [productId]);

  // Memoize query key for performance (Context7 best practice)
  const queryKey = useMemo(() => ['product', productId], [productId]);

  return useQuery<Product | null>({
    queryKey,
    queryFn,
    enabled: !!productId,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 10, // Context7: Better cache management
    retry: (failureCount, error) => {
      // Context7: Smart retry logic
      if (failureCount < 3 && error.message && !error.message.includes('not found')) {
        return true;
      }
      return false;
    },
    // Context7: Optimize for stable data
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}

/**
 * Busca um produto por código de barras.
 * Se o código for indefinido, a query fica desabilitada.
 * Otimizado com Context7 best practices
 */
export function useProductByBarcode(barcode?: string | null) {
  // Memoize query function for stable reference (Context7 best practice)
  const queryFn = useCallback(async () => {
    if (!barcode) return null;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Produto não encontrado
        return null;
      }
      throw error;
    }

    return data;
  }, [barcode]);

  // Memoize query key for performance (Context7 best practice)
  const queryKey = useMemo(() => ['product', 'barcode', barcode], [barcode]);

  return useQuery<Product | null>({
    queryKey,
    queryFn,
    enabled: !!barcode,
    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 10, // Context7: Better cache management
    retry: (failureCount, error) => {
      // Context7: Smart retry for network issues, not for missing products
      if (failureCount < 3 && error.code !== 'PGRST116' && !error.message.includes('not found')) {
        return true;
      }
      return false;
    },
    // Context7: Barcode lookups are often one-time, optimize accordingly
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
