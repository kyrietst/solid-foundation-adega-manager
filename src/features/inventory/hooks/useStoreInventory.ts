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
 * v3.4.3 - FILTRO INTELIGENTE LOJA 2:
 * - Loja 1: Mostra TODOS os produtos cadastrados
 * - Loja 2: Mostra APENAS produtos que foram transferidos para lá
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
      if (store === 'store2') {
        // LOJA 2: Mostrar APENAS produtos transferidos
        // v3.4.3 - Usa histórico de transferências para determinar visibilidade

        // Passo 1: Buscar IDs de produtos transferidos para store2
        const { data: transfers, error: transferError } = await supabase
          .from('store_transfers')
          .select('product_id')
          .eq('to_store', 2);

        if (transferError) {
          console.error('Erro ao buscar transferências:', transferError);
          throw transferError;
        }

        // Passo 2: Extrair IDs únicos
        const productIds = [...new Set(transfers?.map(t => t.product_id) || [])];

        // Se não houver transferências, retornar array vazio
        if (productIds.length === 0) {
          return [];
        }

        // Passo 3: Buscar produtos transferidos
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .in('id', productIds);  // ← FILTRO: Apenas produtos transferidos

        if (error) {
          console.error(`Erro ao buscar produtos da ${store}:`, error);
          throw error;
        }

        return (data as Product[]) || [];

      } else {
        // LOJA 1: Mostrar TODOS os produtos (comportamento atual)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .is('deleted_at', null);

        if (error) {
          console.error(`Erro ao buscar produtos da ${store}:`, error);
          throw error;
        }

        return (data as Product[]) || [];
      }
    },
    enabled,
  });
};

/**
 * Hook para buscar contagem de produtos por loja
 *
 * v3.4.3 - FILTRO INTELIGENTE LOJA 2:
 * - Loja 1: Conta TODOS os produtos cadastrados
 * - Loja 2: Conta APENAS produtos que foram transferidos
 *
 * @example
 * const { data: counts } = useStoreProductCounts();
 */
export const useStoreProductCounts = () => {
  return useQuery<{ store1: number; store2: number }>({
    queryKey: ['products', 'store-counts'],
    queryFn: async () => {
      // LOJA 1: Contar TODOS os produtos
      const { count: store1Count, error: error1 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null);

      if (error1) {
        console.error('Erro ao contar produtos da Loja 1:', error1);
        throw error1;
      }

      // LOJA 2: Contar APENAS produtos transferidos
      // v3.4.3 - Usa histórico de transferências

      // Passo 1: Buscar IDs únicos de produtos transferidos para store2
      const { data: transfers, error: transferError } = await supabase
        .from('store_transfers')
        .select('product_id')
        .eq('to_store', 2);

      if (transferError) {
        console.error('Erro ao buscar transferências para contagem:', transferError);
        throw transferError;
      }

      // Passo 2: Extrair IDs únicos
      const productIds = [...new Set(transfers?.map(t => t.product_id) || [])];

      // Se não houver transferências, contagem é 0
      if (productIds.length === 0) {
        return {
          store1: store1Count || 0,
          store2: 0,
        };
      }

      // Passo 3: Contar produtos transferidos
      const { count: store2Count, error: error2 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .in('id', productIds);

      if (error2) {
        console.error('Erro ao contar produtos da Loja 2:', error2);
        throw error2;
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
