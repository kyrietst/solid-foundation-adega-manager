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
  softDelete: (productId: string) => Promise<void>;
  restore: (productId: string) => Promise<void>;
  getProductInfo: (productId: string) => Promise<ProductDeleteInfo | null>;
  isDeleting: boolean;
  isRestoring: boolean;
}

const useProductDelete = (): UseProductDeleteReturn => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * Busca informações detalhadas do produto para exibir no modal de confirmação
   */
  const getProductInfo = async (productId: string): Promise<ProductDeleteInfo | null> => {
    try {
      // Buscar dados do produto
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, barcode, category, store1_stock_packages, store1_stock_units_loose, store2_stock_packages, store2_stock_units_loose, price')
        .eq('id', productId)
        .is('deleted_at', null)
        .single();

      if (productError || !product) {
        console.error('Erro ao buscar produto:', productError);
        return null;
      }

      // Contar vendas relacionadas (sale_items)
      const { count: salesCount, error: salesError } = await supabase
        .from('sale_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (salesError) {
        console.error('Erro ao contar vendas:', salesError);
      }

      // Contar movimentos de estoque
      const { count: movementsCount, error: movementsError } = await supabase
        .from('inventory_movements')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (movementsError) {
        console.error('Erro ao contar movimentos:', movementsError);
      }

      return {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        stockPackages: (product.store1_stock_packages || 0) + (product.store2_stock_packages || 0),
        stockUnitsLoose: (product.store1_stock_units_loose || 0) + (product.store2_stock_units_loose || 0),
        salesCount: salesCount || 0,
        movementsCount: movementsCount || 0,
        price: product.price || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar informações do produto:', error);
      return null;
    }
  };

  /**
   * Mutation para soft delete de produto
   */
  const softDeleteMutation = useMutation({
    mutationFn: async (productId: string) => {
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
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      toast({
        title: 'Produto excluído',
        description: 'O produto foi excluído com sucesso.',
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
   */
  const restoreMutation = useMutation({
    mutationFn: async (productId: string) => {
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
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });

      toast({
        title: 'Produto restaurado',
        description: 'O produto foi restaurado com sucesso.',
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
   */
  const softDelete = async (productId: string): Promise<void> => {
    setIsDeleting(true);
    try {
      await softDeleteMutation.mutateAsync(productId);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Função pública para restaurar produto
   */
  const restore = async (productId: string): Promise<void> => {
    setIsRestoring(true);
    try {
      await restoreMutation.mutateAsync(productId);
    } finally {
      setIsRestoring(false);
    }
  };

  return {
    softDelete,
    restore,
    getProductInfo,
    isDeleting,
    isRestoring,
  };
};

export default useProductDelete;
