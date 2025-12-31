import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { transformToStockData, type ProductStockData } from '@/shared/hooks/business/useStockData';

interface UseProductListOptions {
    search?: string;
    category?: string;
    stockFilter?: string;
    storeFilter?: string;
    pageSize?: number;
    enabled?: boolean;
}

export const useProductList = ({
    search = '',
    category = 'all',
    stockFilter = 'all',
    storeFilter = 'all', // Novo filtro de loja
    pageSize = 20,
    enabled = true
}: UseProductListOptions = {}) => {
    return useInfiniteQuery({
        queryKey: ['products', 'list', { search, category, stockFilter, storeFilter, pageSize }],
        queryFn: async ({ pageParam = 0 }) => {
            const from = pageParam * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from('products')
                .select('*', { count: 'exact' });

            // Apply Search Filter (Name or Barcode)
            if (search.trim()) {
                const searchTerm = search.trim();
                query = query.or(`name.ilike.%${searchTerm}%,barcode.eq.${searchTerm},package_barcode.eq.${searchTerm}`);
            }

            // Apply Category Filter
            if (category && category !== 'all') {
                query = query.eq('category', category);
            }

            // Apply Stock Filter (Server-side)
            // if (stockFilter === 'low-stock') { ... }

            // Apply Store Filter (Server-side)
            if (storeFilter === 'store2') {
                // Query para itens com estoque na Loja 2
                query = query.or('store2_holding_packages.gt.0,store2_holding_units_loose.gt.0');
            }

            // Apply Pagination
            const { data, error, count } = await query
                .range(from, to)
                .order('name');

            if (error) throw error;

            return {
                products: (data || []).map(transformToStockData),
                count: count || 0,
                nextPage: (data?.length === pageSize) ? pageParam + 1 : undefined
            };
        },
        initialPageParam: 0,
        getNextPageParam: (lastPage) => lastPage.nextPage,
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
