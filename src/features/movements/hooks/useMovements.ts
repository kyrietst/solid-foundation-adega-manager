/**
 * useMovements.ts - Hook Principal para Movimentações (Context7 Pattern)
 * Refatorado de 695 linhas para hook especializado
 * Responsabilidade: Query principal de movimentações de estoque
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { InventoryMovement } from '@/core/types/database';

/**
 * Hook principal para buscar movimentações de estoque
 * Implementa Context7 pattern para queries especializadas
 */
export const useMovements = () => {
  const {
    data: movements = [],
    isLoading: isLoadingMovements,
    error: movementsError,
    refetch: refetchMovements
  } = useQuery({
    queryKey: ['inventory_movements'],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products:product_id (
            id,
            name,
            price
          ),
          customers:customer_id (
            id,
            name
          ),
          sales:sale_id (
            id,
            created_at
          ),
          profiles:user_id (
            id,
            name
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching movements:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    movements,
    isLoadingMovements,
    movementsError,
    refetchMovements,
  };
};

/**
 * Hook para buscar movimentação específica
 */
export const useMovement = (id: string) => {
  return useQuery({
    queryKey: ['inventory_movement', id],
    queryFn: async (): Promise<InventoryMovement | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products:product_id (
            id,
            name,
            price
          ),
          customers:customer_id (
            id,
            name
          ),
          sales:sale_id (
            id,
            created_at
          ),
          profiles:user_id (
            id,
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export default useMovements;