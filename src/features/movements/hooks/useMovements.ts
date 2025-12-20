/**
 * useMovements.ts - Hook Principal para Movimentações (Context7 Pattern)
 * Refatorado com PAGINAÇÃO para evitar travamento do navegador
 * Responsabilidade: Query principal de movimentações de estoque
 */

import { useState, useCallback, useMemo } from 'react';
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

import { DateRange } from "react-day-picker";
import { format, endOfDay, startOfDay } from "date-fns";

interface UseMovementsOptions {
  initialPage?: number;
  initialPageSize?: number;
  dateRange?: DateRange;
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
 * Hook principal para buscar movimentações de estoque COM PAGINAÇÃO e FILTRO DE DATA
 * Implementa Context7 pattern para queries especializadas
 */
export const useMovements = (options: UseMovementsOptions = {}): UseMovementsReturn => {
  const { initialPage = 1, initialPageSize = 50, dateRange } = options;

  // Estado de paginação
  const [page, setPageState] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Query paginada e filtrada
  const {
    data,
    isLoading: isLoadingMovements,
    error: movementsError,
    refetch: refetchMovements
  } = useQuery({
    queryKey: ['inventory_movements', page, pageSize, dateRange],
    queryFn: async () => {
      // Calcular range para paginação
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Iniciar query
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          quantity:quantity_change,
          type:type_enum,
          products:products (
            id,
            name,
            price,
            unit_type
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
            delivery_fee,
            discount_amount,
            delivery_address,
            delivery_person:profiles!sales_delivery_person_id_fkey (
              full_name:name
            ),
            customer:customers (
              name
            ),
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
        `, { count: 'exact' });

      // Aplicar filtros de data se existirem
      if (dateRange?.from) {
        const startDate = startOfDay(dateRange.from).toISOString();
        query = query.gte('date', startDate);

        if (dateRange.to) {
          const endDate = endOfDay(dateRange.to).toISOString();
          query = query.lte('date', endDate);
        } else {
          // Se só tem data inicial, filtrar apenas aquele dia (Start -> End of same day)
          const endDate = endOfDay(dateRange.from).toISOString();
          query = query.lte('date', endDate);
        }
      }

      // Finalizar query com order e range
      const { data, error, count } = await query
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching movements:', error);
        throw error;
      }

      // 🔍 DEBUG: Log para investigar estrutura dos dados
      // console.group('🔍 MOVEMENTS DEBUG');
      // console.log('Total movements:', data?.length);
      // console.groupEnd();

      return {
        movements: (data || []) as unknown as InventoryMovement[],
        totalCount: count || 0
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
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

  // Deduplicate movements by sale_id to avoid showing multiple rows for the same sale
  const uniqueMovements = useMemo(() => {
    if (!data?.movements) return [];
    const seenSales = new Set<string>();
    return data.movements.filter(m => {
      // Se tem venda associada
      if (m.sales?.id) {
        // Se já vimos essa venda, filtrar (remover da lista)
        if (seenSales.has(m.sales.id)) {
          return false;
        }
        // Marcar como vista
        seenSales.add(m.sales.id);
      }
      // Manter movimento (é o primeiro deste venda ou é um movimento sem venda)
      return true;
    });
  }, [data?.movements]);

  // Calcular total de páginas
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    // Dados
    movements: uniqueMovements,

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
