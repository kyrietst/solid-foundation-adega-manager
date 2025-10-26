/**
 * Hook para gerenciar estoque por loja
 * v3.4.0 - Sistema Multi-Store
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { Product, StoreLocation } from '@/core/types/inventory.types';

interface UseStoreInventoryOptions {
  store: StoreLocation;
  enabled?: boolean;
}

/**
 * Hook para buscar produtos com estoque em uma loja específica
 *
 * @param store - 'store1' ou 'store2'
 * @param enabled - Se a query deve ser executada (padrão: true)
 *
 * @example
 * const { data: productsStore1, isLoading } = useStoreInventory({ store: 'store1' });
 */
export const useStoreInventory = ({ store, enabled = true }: UseStoreInventoryOptions) => {
  return useQuery<Product[]>({
    queryKey: ['products', 'store', store],
    queryFn: async () => {
      const packagesField = `${store}_stock_packages`;
      const unitsField = `${store}_stock_units_loose`;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .or(`${packagesField}.gt.0,${unitsField}.gt.0`);

      if (error) {
        console.error(`Erro ao buscar produtos da ${store}:`, error);
        throw error;
      }

      return (data as Product[]) || [];
    },
    enabled,
  });
};

/**
 * Hook para buscar contagem de produtos por loja
 *
 * @example
 * const { data: counts } = useStoreProductCounts();
 * console.log(counts.store1); // 150
 * console.log(counts.store2); // 25
 */
export const useStoreProductCounts = () => {
  return useQuery<{ store1: number; store2: number }>({
    queryKey: ['products', 'store-counts'],
    queryFn: async () => {
      // Contar produtos com estoque na Loja 1
      const { count: store1Count, error: error1 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');

      // Contar produtos com estoque na Loja 2
      const { count: store2Count, error: error2 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');

      if (error1 || error2) {
        console.error('Erro ao contar produtos por loja:', error1 || error2);
        throw error1 || error2;
      }

      return {
        store1: store1Count || 0,
        store2: store2Count || 0,
      };
    },
  });
};

/**
 * Helper para calcular estoque total de um produto somando ambas as lojas
 */
export const getTotalStock = (product: Product) => {
  return {
    packages: (product.store1_stock_packages || 0) + (product.store2_stock_packages || 0),
    units: (product.store1_stock_units_loose || 0) + (product.store2_stock_units_loose || 0),
  };
};

/**
 * Helper para obter estoque de uma loja específica
 */
export const getStoreStock = (product: Product, store: StoreLocation) => {
  if (store === 'store1') {
    return {
      packages: product.store1_stock_packages || 0,
      units: product.store1_stock_units_loose || 0,
    };
  } else {
    return {
      packages: product.store2_stock_packages || 0,
      units: product.store2_stock_units_loose || 0,
    };
  }
};
