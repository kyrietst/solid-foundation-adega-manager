/**
 * useMovements.ts - Hook Principal para Movimentações (Context7 Pattern)
 * Refatorado com PAGINAÇÃO para evitar travamento do navegador
 * Responsabilidade: Query principal de movimentações de estoque
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import type { InventoryMovement } from '@/core/types/inventory.types';

// Re-export types para compatibilidade
export interface Product {
  id: string;
  name: string;
  price?: number;
}

export interface Customer {
  id: string;
  name: string;
}

export interface Sale {
  id: string;
  created_at: string;
  delivery_type?: string;
}

interface UseMovementsOptions {
  initialPage?: number;
  initialPageSize?: number;
}

interface UseMovementsReturn {
  // Dados
  movements: InventoryMovement[];

  // Paginação
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;

  // Estados
  isLoadingMovements: boolean;
  movementsError: Error | null;

  // Ações
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  refetchMovements: () => void;
}

/**
 * Hook principal para buscar movimentações de estoque COM PAGINAÇÃO
 * Implementa Context7 pattern para queries especializadas
 */
export const useMovements = (options: UseMovementsOptions = {}): UseMovementsReturn => {
  const { initialPage = 1, initialPageSize = 50 } = options;

  // Estado de paginação
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Query paginada
  const {
    data,
    isLoading: isLoadingMovements,
    error: movementsError,
    refetch: refetchMovements
  } = useQuery({
    queryKey: ['inventory_movements', page, pageSize],
    queryFn: async () => {
      // Calcular range para paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Query com count total
      const { data, error, count } = await supabase
        .from('inventory_movements')
        .select(`
          *,
          products:products (
            id,
            name,
            price
          ),
          customers:customers (
            id,
            name
          ),
          sales:sales!inventory_movements_sale_id_fkey (
            id,
            created_at,
            delivery_type,
            payment_method,
            payment_status,
            status,
            final_amount,
            sale_items (
              id,
              product_id,
              quantity,
              unit_price,
              products (
                name,
                barcode
              )
            )
          ),
          users:users (
            id,
            full_name
          )
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching movements:', error);
        throw error;
      }

      // 🔍 DEBUG: Log para investigar estrutura dos dados
      console.group('🔍 MOVEMENTS DEBUG');
      console.log('Total movements:', data?.length);

      if (data && data.length > 0) {
        const firstMovement = data[0] as any; // Type assertion for debug purposes
        console.log('First movement:', firstMovement);
        console.log('Has sale?', !!firstMovement.sales);
        console.log('Sale data:', firstMovement.sales);
        console.log('Sale items:', firstMovement.sales?.sale_items);
        console.log('Sale items count:', firstMovement.sales?.sale_items?.length || 0);
      }
      console.groupEnd();

      return {
        movements: (data || []) as unknown as InventoryMovement[],
        totalCount: count || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos (reduzido para dados mais frescos)
    refetchOnWindowFocus: false,
  });

  // Handlers de paginação
  const setPage = useCallback((newPage: number) => {
    setPageState(Math.max(1, newPage));
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset para primeira página ao mudar tamanho
  }, []);

  // Calcular total de páginas
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    // Dados
    movements: data?.movements || [],

    // Paginação
    page,
    pageSize,
    totalCount,
    totalPages,

    // Estados
    isLoadingMovements,
    movementsError: movementsError as Error | null,

    // Ações
    setPage,
    setPageSize,
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
          products:products (
            id,
            name,
            price
          ),
          customers:customers (
            id,
            name
          ),
          sales:sales!inventory_movements_sale_id_fkey (
            id,
            created_at,
            delivery_type
          ),
          users:users (
            id,
            full_name
          )
        `)
        .eq('id', id as any)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data as unknown as InventoryMovement;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export default useMovements;
