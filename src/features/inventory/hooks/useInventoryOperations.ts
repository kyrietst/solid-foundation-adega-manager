/**
 * Hook para operações CRUD de inventory
 * Refatorado para usar Single Source of Truth (create_inventory_movement RPC)
 * Otimizado com Context7 TanStack Query best practices
 */

import { useMutation, useQueryClient, MutationFunction } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { ProductFormData } from '@/types/inventory.types';
import { InventoryOperations } from '@/components/inventory/types';

export const useInventoryOperations = (): InventoryOperations => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Memoize mutation functions for stable references (Context7 best practice)
  const createProductFn: MutationFunction<any, ProductFormData> = useCallback(
    async (productData: ProductFormData) => {
      // Extract stock_quantity to handle separately via RPC
      const { stock_quantity, ...productDataWithoutStock } = productData;

      // Create product with zero stock initially
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          ...productDataWithoutStock,
          stock_quantity: 0, // Always start with 0, then use RPC for initial stock
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // If initial stock > 0, create initial stock movement via RPC
      if (stock_quantity > 0) {
        const { data: movementResult, error: rpcError } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: product.id,
            p_quantity_change: stock_quantity,
            p_type: 'initial_stock',
            p_reason: `Estoque inicial: ${productData.name}`,
            p_metadata: {
              operation: 'product_creation',
              initial_stock: stock_quantity,
              product_name: productData.name
            }
          });

        if (rpcError) throw rpcError;

        // Update product object with final stock
        product.stock_quantity = movementResult.new_stock;
      }

      return product;
    },
    []
  );

  // Optimized cache invalidation (Context7 best practice)
  const invalidateProductsCache = useCallback(() => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['products', 'available'] }),
      queryClient.invalidateQueries({ queryKey: ['product'] }),
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] }),
      queryClient.invalidateQueries({ queryKey: ['movements'] }),
    ]);
  }, [queryClient]);

  const createProductMutation = useMutation({
    mutationFn: createProductFn,
    onSuccess: (data) => {
      invalidateProductsCache();
      console.log('[DEBUG] useInventoryOperations - Cache invalidado após criar produto:', data.name);

      toast({
        title: "Produto criado!",
        description: `${data.name} foi adicionado ao estoque`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    },
    // Context7 best practice: retry failed mutations
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('duplicate key')) {
        return true;
      }
      return false;
    },
  });

  const updateProductFn: MutationFunction<any, ProductFormData & { id: string }> = useCallback(
    async (productData: ProductFormData & { id: string }) => {
      const { id, stock_quantity, ...updateDataWithoutStock } = productData;

      // Get current product to check stock change
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity, name')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update product data (excluding stock_quantity)
      const { data: updatedProduct, error } = await supabase
        .from('products')
        .update({
          ...updateDataWithoutStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Handle stock change via RPC if different
      if (stock_quantity !== currentProduct.stock_quantity) {
        const stockChange = stock_quantity - currentProduct.stock_quantity;

        const { data: movementResult, error: rpcError } = await supabase
          .rpc('create_inventory_movement', {
            p_product_id: id,
            p_quantity_change: stockChange,
            p_type: 'inventory_adjustment',
            p_reason: `Ajuste de estoque: ${currentProduct.name}`,
            p_metadata: {
              operation: 'product_update',
              previous_stock: currentProduct.stock_quantity,
              new_stock: stock_quantity,
              product_name: currentProduct.name
            }
          });

        if (rpcError) throw rpcError;

        // Update product object with final stock
        updatedProduct.stock_quantity = movementResult.new_stock;
      }

      return updatedProduct;
    },
    []
  );

  const updateProductMutation = useMutation({
    mutationFn: updateProductFn,
    onSuccess: (data) => {
      invalidateProductsCache();
      console.log('[DEBUG] useInventoryOperations - Cache invalidado após atualizar produto:', data.name);

      toast({
        title: "Produto atualizado!",
        description: `${data.name} foi atualizado com sucesso`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar produto",
        description: error.message,
        variant: "destructive",
      });
    },
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('duplicate key')) {
        return true;
      }
      return false;
    },
  });

  const deleteProductFn: MutationFunction<void, string> = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    []
  );

  const deleteProductMutation = useMutation({
    mutationFn: deleteProductFn,
    onSuccess: () => {
      invalidateProductsCache();
      toast({
        title: "Produto removido",
        description: "O produto foi removido do estoque",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao remover produto",
        description: error.message,
        variant: "destructive",
      });
    },
    retry: (failureCount, error) => {
      if (failureCount < 2 && !error.message.includes('foreign key')) {
        return true;
      }
      return false;
    },
  });

  // Memoize operation functions for stable references (Context7 best practice)
  const createProduct = useCallback(
    (data: ProductFormData) => {
      createProductMutation.mutate(data);
    },
    [createProductMutation]
  );

  const updateProduct = useCallback(
    (data: ProductFormData & { id: string }) => {
      updateProductMutation.mutate(data);
    },
    [updateProductMutation]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      if (confirm('Tem certeza que deseja remover este produto?')) {
        deleteProductMutation.mutate(id);
      }
    },
    [deleteProductMutation]
  );

  // Memoize return object to prevent unnecessary re-renders (Context7 best practice)
  return useMemo(
    () => ({
      createProduct,
      updateProduct,
      deleteProduct,
      isCreating: createProductMutation.isPending,
      isUpdating: updateProductMutation.isPending,
      isDeleting: deleteProductMutation.isPending,
    }),
    [
      createProduct,
      updateProduct,
      deleteProduct,
      createProductMutation.isPending,
      updateProductMutation.isPending,
      deleteProductMutation.isPending,
    ]
  );
};