/**
 * Hook para operações CRUD de inventory
 * Extraído do InventoryNew.tsx para separar mutations
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
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    []
  );

  // Optimized cache invalidation (Context7 best practice)
  const invalidateProductsCache = useCallback(() => {
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['products'] }),
      queryClient.invalidateQueries({ queryKey: ['products', 'available'] }),
      queryClient.invalidateQueries({ queryKey: ['product'] }),
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
      const { id, ...updateData } = productData;
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
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