/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Hook para operações de movimentação de estoque
 * Usa o Single Source of Truth (create_inventory_movement RPC)
 * Criado para SPRINT 2: Frontend Core
 */

import { useMutation, useQuery, useQueryClient, MutationFunction } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { Database, Json } from '@/core/types/supabase';

// Types for inventory movements
export interface InventoryMovementParams {
  productId: string;
  quantityChange: number;
  type: 'sale' | 'initial_stock' | 'inventory_adjustment' | 'return' | 'stock_transfer_out' | 'stock_transfer_in' | 'personal_consumption';
  reason?: string;
  metadata?: Record<string, any>;
}

export interface InventoryMovementResult {
  movement_id: string;
  previous_stock: number;
  new_stock: number;
  quantity_change: number;
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  quantity_change: number;
  new_stock_quantity: number;
  type_enum: string;
  // Fallback for when type is returned as string in some contexts
  type: string;
  reason: string | null;
  metadata: Json;
  created_at: string;
  customer_id?: string | null;
  sale_id?: string | null;
  user_id?: string | null;
  product: {
    name: string;
    unit_type: string;
    price: number;
    units_per_package?: number;
  };
  customer: {
    name: string;
    phone: string | null;
  } | null;
  user: {
    name: string | null;
  } | null;
}

export const useInventoryMovementsList = (filters?: {
  productId?: string;
  userId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['inventory_movements', filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          product:products!inner (
            name,
            unit_type,
            price,
            units_per_package
          ),
          customer:customers (
            name,
            phone
          ),
          user:profiles (
            name
          )
        `);

      if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
      }

      if (filters?.userId && filters.userId !== 'all') {
        query = query.eq('user_id', filters.userId);
      }

      // Handle 'all' type filter or specific type
      if (filters?.type && filters.type !== 'all') {
        // Checking if it matches the enum column or the type column (sometimes one is used over the other)
        // Schema usually has type or type_enum. The code below used type_enum previously.
        // We will assume type_enum is the correct column for the enum value based on previous code.
        query = query.eq('type_enum', filters.type as any);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 100);

      if (error) throw error;
      return data as unknown as InventoryMovement[];
    },
  });
};

export const useInventoryMovements = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create inventory movement using RPC
  const createMovementFn: MutationFunction<InventoryMovementResult, InventoryMovementParams> = useCallback(
    async ({ productId, quantityChange, type, reason, metadata = {} }) => {
      const { data, error } = await supabase
        .rpc('create_inventory_movement', {
          p_product_id: productId,
          p_quantity_change: quantityChange,
          p_type: type,
          p_reason: reason || null,
          p_metadata: (metadata as Record<string, any>) || {},
        });

      if (error) throw error;
      return data as unknown as InventoryMovementResult;
    },
    []
  );

  // Optimized cache invalidation
  const invalidateMovementsCache = useCallback(() => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] }),
      queryClient.invalidateQueries({ queryKey: ['movements'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['product'] }),
    ]);
  }, [queryClient]);

  const createMovementMutation = useMutation({
    mutationFn: createMovementFn,
    onSuccess: (data, variables) => {
      invalidateMovementsCache();

      let message = '';
      if (variables.quantityChange > 0) {
        message = `Entrada de ${variables.quantityChange} unidades registrada`;
      } else {
        message = `Saída de ${Math.abs(variables.quantityChange)} unidades registrada`;
      }

      toast({
        title: "Movimento registrado!",
        description: message,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao registrar movimento",
        description: error.message,
        variant: "destructive",
      });
    },
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('insufficient stock')) {
        return true;
      }
      return false;
    },
  });

  // Convenience functions for common operations
  const createStockAdjustment = useCallback(
    (productId: string, quantityChange: number, reason: string, metadata: Record<string, unknown> = {}) => {
      createMovementMutation.mutate({
        productId,
        quantityChange,
        type: 'inventory_adjustment',
        reason,
        metadata: {
          ...metadata,
          operation: 'stock_adjustment'
        }
      });
    },
    [createMovementMutation]
  );

  const createSaleMovement = useCallback(
    (productId: string, quantity: number, reason: string, saleId?: string, customerId?: string, metadata: Record<string, unknown> = {}) => {
      createMovementMutation.mutate({
        productId,
        quantityChange: -Math.abs(quantity), // Sales are always negative
        type: 'sale',
        reason,
        metadata: {
          ...metadata,
          sale_id: saleId,
          customer_id: customerId,
          operation: 'sale'
        }
      });
    },
    [createMovementMutation]
  );

  const createReturnMovement = useCallback(
    (productId: string, quantity: number, reason: string, saleId?: string, metadata: Record<string, unknown> = {}) => {
      createMovementMutation.mutate({
        productId,
        quantityChange: Math.abs(quantity), // Returns are always positive
        type: 'return',
        reason,
        metadata: {
          ...metadata,
          original_sale_id: saleId,
          operation: 'return'
        }
      });
    },
    [createMovementMutation]
  );

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      // Raw mutation
      createMovement: (params: InventoryMovementParams) => createMovementMutation.mutate(params),

      // Convenience functions
      createStockAdjustment,
      createSaleMovement,
      createReturnMovement,

      // Query hook (now stable)
      useMovements: useInventoryMovementsList,

      // Status
      isCreating: createMovementMutation.isPending,

      // Cache utilities
      invalidateCache: invalidateMovementsCache,
    }),
    [
      createMovementMutation,
      createStockAdjustment,
      createSaleMovement,
      createReturnMovement,
      // useInventoryMovementsList is a stable import, no need to add to deps or it stays stable
      invalidateMovementsCache,
    ]
  );
};