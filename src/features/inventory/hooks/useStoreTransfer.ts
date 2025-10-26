/**
 * Hook para transferências de produtos entre lojas
 * v3.4.0 - Sistema Multi-Store
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import type { StoreTransfer, StoreTransferInput } from '@/core/types/inventory.types';

/**
 * Hook para executar transferências entre lojas
 *
 * @example
 * const { executeTransfer, isTransferring } = useStoreTransfer();
 *
 * await executeTransfer({
 *   product_id: 'uuid',
 *   from_store: 1,
 *   to_store: 2,
 *   packages: 5,
 *   units_loose: 10,
 *   notes: 'Reposição Loja 2'
 * });
 */
export const useStoreTransfer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const executeTransferMutation = useMutation({
    mutationFn: async (transfer: StoreTransferInput) => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar a função do banco de dados
      const { data, error } = await supabase.rpc('execute_store_transfer', {
        p_product_id: transfer.product_id,
        p_from_store: transfer.from_store,
        p_to_store: transfer.to_store,
        p_packages: transfer.packages,
        p_units_loose: transfer.units_loose,
        p_user_id: user.id,
        p_notes: transfer.notes || null,
      });

      if (error) {
        console.error('Erro ao executar transferência:', error);
        throw error;
      }

      return data as string; // UUID da transferência criada
    },
    onSuccess: (transferId, variables) => {
      // Invalidar cache de produtos
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'store'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'store-counts'] });
      queryClient.invalidateQueries({ queryKey: ['store-transfers'] });

      const storeNames = { 1: 'Loja 1', 2: 'Loja 2' };

      toast({
        title: 'Transferência realizada',
        description: `Produto transferido de ${storeNames[variables.from_store]} para ${storeNames[variables.to_store]} com sucesso!`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      console.error('Erro na transferência:', error);
      toast({
        title: 'Erro na transferência',
        description: error.message || 'Não foi possível executar a transferência',
        variant: 'destructive',
      });
    },
  });

  return {
    executeTransfer: executeTransferMutation.mutateAsync,
    isTransferring: executeTransferMutation.isPending,
  };
};

/**
 * Hook para buscar histórico de transferências de um produto
 *
 * @param productId - ID do produto
 *
 * @example
 * const { data: transfers, isLoading } = useTransferHistory('product-uuid');
 */
export const useTransferHistory = (productId: string | null) => {
  return useQuery<StoreTransfer[]>({
    queryKey: ['store-transfers', productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from('store_transfers')
        .select(
          `
          *,
          product:products(name, category, unit_type),
          user:profiles(name, email)
        `
        )
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico de transferências:', error);
        throw error;
      }

      return (data as StoreTransfer[]) || [];
    },
    enabled: !!productId,
  });
};

/**
 * Hook para buscar todas as transferências recentes (últimas 50)
 *
 * @example
 * const { data: recentTransfers } = useRecentTransfers();
 */
export const useRecentTransfers = () => {
  return useQuery<StoreTransfer[]>({
    queryKey: ['store-transfers', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_transfers')
        .select(
          `
          *,
          product:products(name, category, unit_type),
          user:profiles(name, email)
        `
        )
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar transferências recentes:', error);
        throw error;
      }

      return (data as StoreTransfer[]) || [];
    },
  });
};

/**
 * Helper para validar se tem estoque suficiente para transferência
 */
export const validateTransferStock = (
  product: any,
  fromStore: 1 | 2,
  packages: number,
  unitsLoose: number
): { valid: boolean; error?: string } => {
  const availablePackages =
    fromStore === 1 ? product.store1_stock_packages : product.store2_stock_packages;
  const availableUnits =
    fromStore === 1 ? product.store1_stock_units_loose : product.store2_stock_units_loose;

  if (packages > availablePackages) {
    return {
      valid: false,
      error: `Estoque insuficiente de pacotes. Disponível: ${availablePackages}, Solicitado: ${packages}`,
    };
  }

  if (unitsLoose > availableUnits) {
    return {
      valid: false,
      error: `Estoque insuficiente de unidades soltas. Disponível: ${availableUnits}, Solicitado: ${unitsLoose}`,
    };
  }

  if (packages <= 0 && unitsLoose <= 0) {
    return {
      valid: false,
      error: 'Deve transferir pelo menos um pacote ou unidade solta',
    };
  }

  return { valid: true };
};
