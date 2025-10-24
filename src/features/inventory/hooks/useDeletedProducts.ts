/**
 * useDeletedProducts Hook
 *
 * Hook para buscar produtos deletados (soft delete)
 * Disponível apenas para usuários admin
 *
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { Product } from '@/core/types/inventory.types';

export interface DeletedProduct extends Product {
  deleted_at: string;
  deleted_by: string;
}

export const useDeletedProducts = () => {
  return useQuery<DeletedProduct[]>({
    queryKey: ['products', 'deleted'],
    queryFn: async (): Promise<DeletedProduct[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar produtos deletados:', error);
        throw error;
      }

      return (data as DeletedProduct[]) || [];
    },
    // Atualizar a cada 30 segundos
    staleTime: 30000,
    // Manter cache por 5 minutos
    gcTime: 1000 * 60 * 5,
  });
};

export default useDeletedProducts;
