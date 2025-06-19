import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  minimum_stock: number | null;
}

/**
 * Retorna a lista de produtos com estoque abaixo do mínimo.
 * Caso minimum_stock seja nulo, assume 5 como padrão.
 */
export const useLowStock = () => {
  return useQuery<LowStockProduct[]>({
    queryKey: ['products', 'lowStock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,stock_quantity,minimum_stock');
      if (error) throw error;
      const safeData = (data ?? []) as LowStockProduct[];
      return safeData.filter(
        (p) => p.stock_quantity <= (p.minimum_stock ?? 5)
      );
    },
    staleTime: 1000 * 60, // 1 min
  });
};
