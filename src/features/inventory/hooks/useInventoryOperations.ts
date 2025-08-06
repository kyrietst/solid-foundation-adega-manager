/**
 * Hook para operações CRUD de inventory
 * Extraído do InventoryNew.tsx para separar mutations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { ProductFormData } from '@/types/inventory.types';
import { InventoryOperations } from '@/components/inventory/types';

export const useInventoryOperations = (): InventoryOperations => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData & { id: string }) => {
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
  });

  const createProduct = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const updateProduct = (data: ProductFormData & { id: string }) => {
    updateProductMutation.mutate(data);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      deleteProductMutation.mutate(id);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
  };
};