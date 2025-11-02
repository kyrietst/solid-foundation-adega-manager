/**
 * useProductDelete Hook
 *
 * Custom hook for soft deleting products with validation
 * Follows the pattern established in useCustomerDelete
 *
 * @author Adega Manager Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';

export interface ProductDeleteInfo {
  id: string;
  name: string;
  barcode: string | null;
  category: string;
  stockPackages: number;
  stockUnitsLoose: number;
  salesCount: number;
  movementsCount: number;
  price: number;
}

export interface UseProductDeleteReturn {
  softDelete: (params: { productId: string; productName: string }) => Promise<void>;
  restore: (params: { productId: string; productName: string }) => Promise<void>;
  isDeleting: boolean;
  isRestoring: boolean;
}

const useProductDelete = (): UseProductDeleteReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ❌ REMOVIDO: getProductInfo
  // NUNCA fazer fetch de dados que acabamos de deletar!
  // Os dados necessários devem ser passados como argumentos

  /**
   * Mutation para soft delete de produto
   * ✅ REFATORADO: Recebe productName como argumento (não faz fetch!)
   */
  const softDeleteMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string; productName: string }) => {
      // Buscar usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Executar soft delete
      const { error } = await supabase
        .from('products')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user.id,
        })
        .eq('id', productId)
        .is('deleted_at', null);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        throw error;
      }

      return productId;
    },
    onSuccess: (productId, { productName }) => {
      // ✅ Remover query do cache (evita PGRST116)
      queryClient.removeQueries({ queryKey: ['product', productId] });

      // Invalidar listas para atualizar abas "Ativos" e "Deletados"
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      // ✅ Usar productName que foi passado como argumento
      toast({
        title: 'Produto excluído',
        description: `"${productName}" foi excluído com sucesso.`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message || 'Ocorreu um erro ao tentar excluir o produto.',
        variant: 'destructive',
      });
    },
  });

  /**
   * Mutation para restaurar produto deletado
   * ✅ REFATORADO: Recebe productName como argumento
   */
  const restoreMutation = useMutation({
    mutationFn: async ({ productId }: { productId: string; productName: string }) => {
      const { error } = await supabase
        .from('products')
        .update({
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', productId);

      if (error) {
        console.error('Erro ao restaurar produto:', error);
        throw error;
      }

      return productId;
    },
    onSuccess: (productId, { productName }) => {
      // ✅ Remover query do cache para forçar refetch com dados atualizados
      queryClient.removeQueries({ queryKey: ['product', productId] });

      // Invalidar listas para atualizar abas "Ativos" e "Deletados"
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      // ✅ Usar productName que foi passado como argumento
      toast({
        title: 'Produto restaurado',
        description: `"${productName}" foi restaurado com sucesso.`,
        variant: 'success',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao restaurar produto',
        description: error.message || 'Ocorreu um erro ao tentar restaurar o produto.',
        variant: 'destructive',
      });
    },
  });

  /**
   * Função pública para soft delete
   * ✅ REFATORADO: Recebe objeto com productId e productName
   */
  const softDelete = async (params: { productId: string; productName: string }): Promise<void> => {
    setIsDeleting(true);
    try {
      await softDeleteMutation.mutateAsync(params);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Função pública para restaurar produto
   * ✅ REFATORADO: Recebe objeto com productId e productName
   */
  const restore = async (params: { productId: string; productName: string }): Promise<void> => {
    setIsRestoring(true);
    try {
      await restoreMutation.mutateAsync(params);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    softDelete,
    restore,
    isDeleting,
    isRestoring,
  };
};

export default useProductDelete;
