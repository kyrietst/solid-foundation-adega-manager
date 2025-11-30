/**
 * Hook especializado para produtos com estoque baixo
 * Usa useInfiniteQuery para carregamento progressivo (Load More pattern)
 *
 * @version 3.5.5
 * @date 2025-11-25
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { Product } from '@/types/inventory.types';

const ITEMS_PER_PAGE = 50;

interface LowStockProductsResult {
  products: Product[];
  totalLoaded: number;
  loadMore: () => void;
  hasMore: boolean | undefined;
  isLoadingMore: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook para buscar produtos com estoque baixo usando paginação server-side
 *
 * @returns Objeto com produtos, estados de loading e função loadMore
 *
 * @example
 * ```typescript
 * const { products, totalLoaded, loadMore, hasMore, isLoadingMore } = useLowStockProducts();
 *
 * // Renderizar produtos
 * products.map(product => <ProductCard key={product.id} product={product} />)
 *
 * // Botão "Carregar Mais"
 * {hasMore && (
 *   <Button onClick={loadMore} disabled={isLoadingMore}>
 *     Carregar Mais ({totalLoaded} carregados)
 *   </Button>
 * )}
 * ```
 */
export const useLowStockProducts = (): LowStockProductsResult => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['low-stock-products-infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .rpc('get_low_stock_products', {
          p_limit: ITEMS_PER_PAGE,
          p_offset: pageParam
        });

      if (error) {
        console.error('❌ Erro ao buscar produtos com estoque baixo:', error);
        throw error;
      }

      return {
        products: (data || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          stock_packages: item.stock_packages,
          stock_units_loose: item.stock_units_loose,
          stock_quantity: item.current_stock,
          minimum_stock: item.minimum_stock,
          limit_packages: item.limit_packages,
          limit_units: item.limit_units,
          is_legacy_override: item.is_legacy_override,
          // Defaults para campos não retornados pela RPC
          image_url: null,
          barcode: null,
          unit_barcode: null,
          package_barcode: null,
          package_units: null,
          package_price: null,
          has_package_tracking: false,
          units_per_package: 1,
          expiry_date: null,
          has_expiry_tracking: false,
        })) as Product[],
        nextOffset: pageParam + ITEMS_PER_PAGE
      };
    },
    getNextPageParam: (lastPage) => {
      // Se a última página retornou menos que ITEMS_PER_PAGE, não há mais páginas
      if (lastPage.products.length < ITEMS_PER_PAGE) {
        return undefined;
      }
      return lastPage.nextOffset;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutos (consistente com Dashboard)
    refetchOnWindowFocus: true,
  });

  // Flatten all pages into single array
  const allProducts = data?.pages.flatMap(page => page.products) || [];
  const totalLoaded = allProducts.length;

  return {
    products: allProducts,
    totalLoaded,
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoading,
    error: error as Error | null
  };
};
