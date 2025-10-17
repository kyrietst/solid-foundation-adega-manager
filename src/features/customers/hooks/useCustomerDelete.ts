/**
 * useCustomerDelete Hook
 *
 * Hook para gerenciar exclusão lógica (soft delete) de clientes
 * Implementa as 3 operações:
 * - Soft Delete: Exclusão lógica preservando histórico
 * - Restore: Restauração de cliente excluído
 * - Hard Delete: Exclusão permanente (admin apenas)
 */

import { useState } from 'react';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface CustomerDeleteInfo {
  id: string;
  name: string;
  email: string | null;
  salesCount: number;
  lifetimeValue: number;
  lastPurchaseDate: Date | null;
}

export interface DeleteResult {
  success: boolean;
  message: string;
  customer_id?: string;
  customer_name?: string;
  deleted_at?: string;
}

export const useCustomerDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Soft Delete - Exclusão lógica do cliente
   * Preserva histórico e permite restauração
   */
  const softDelete = async (customerId: string): Promise<DeleteResult> => {
    setIsDeleting(true);

    try {
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar stored procedure
      const { data, error } = await supabase.rpc('soft_delete_customer', {
        p_customer_id: customerId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        throw error;
      }

      // Remover TODAS as queries relacionadas ao cliente deletado do cache
      queryClient.removeQueries({ queryKey: ['customer', customerId] });
      queryClient.removeQueries({
        predicate: (query) => {
          // Remove queries que possam conter referência ao cliente deletado
          const key = query.queryKey;
          return Array.isArray(key) && (
            key.includes(customerId) ||
            (key[0] === 'customers' && key.length > 1)
          );
        }
      });

      // Invalidar queries das listas SEM refetch automático (evita 406)
      await queryClient.invalidateQueries({
        queryKey: ['customer-table-data'],
        refetchType: 'none' // Apenas marca como stale, não faz refetch
      });
      await queryClient.invalidateQueries({
        queryKey: ['customers'],
        refetchType: 'none' // Apenas marca como stale, não faz refetch
      });

      // Aguardar limpeza de queries individuais antes do refetch (evita 404)
      // Delay permite que React Query limpe queries do cliente deletado antes de refetch da lista
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fazer refetch manual apenas da query principal da tabela
      await queryClient.refetchQueries({
        queryKey: ['customer-table-data'],
        type: 'active'
      });

      toast({
        title: '✅ Cliente excluído',
        description: `${data.customer_name} foi excluído com sucesso. ${data.sales_count} vendas preservadas.`,
        variant: 'default',
      });

      return data as DeleteResult;
    } catch (error: any) {
      console.error('Erro no soft delete:', error);

      toast({
        title: '❌ Erro ao excluir',
        description: error.message || 'Não foi possível excluir o cliente',
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Restore - Restaurar cliente excluído
   */
  const restore = async (customerId: string): Promise<DeleteResult> => {
    setIsRestoring(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('restore_customer', {
        p_customer_id: customerId,
        p_user_id: user.id
      });

      if (error) {
        console.error('Erro ao restaurar cliente:', error);
        throw error;
      }

      // Invalidar queries
      await queryClient.invalidateQueries({ queryKey: ['customer-table-data'] });
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['deleted-customers'] });

      toast({
        title: '✅ Cliente restaurado',
        description: `${data.customer_name} foi restaurado com sucesso`,
        variant: 'default',
      });

      return data as DeleteResult;
    } catch (error: any) {
      console.error('Erro ao restaurar:', error);

      toast({
        title: '❌ Erro ao restaurar',
        description: error.message || 'Não foi possível restaurar o cliente',
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsRestoring(false);
    }
  };

  /**
   * Hard Delete - Exclusão permanente (ADMIN APENAS)
   * ATENÇÃO: Esta operação é irreversível
   */
  const hardDelete = async (
    customerId: string,
    confirmationText: string
  ): Promise<DeleteResult> => {
    setIsDeleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem realizar exclusão permanente');
      }

      const { data, error } = await supabase.rpc('hard_delete_customer', {
        p_customer_id: customerId,
        p_user_id: user.id,
        p_confirmation_text: confirmationText
      });

      if (error) {
        console.error('Erro ao excluir permanentemente:', error);
        throw error;
      }

      // Remover TODAS as queries relacionadas ao cliente deletado do cache
      queryClient.removeQueries({ queryKey: ['customer', customerId] });
      queryClient.removeQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && (
            key.includes(customerId) ||
            (key[0] === 'customers' && key.length > 1)
          );
        }
      });

      // Invalidar queries das listas SEM refetch automático
      await queryClient.invalidateQueries({
        queryKey: ['customer-table-data'],
        refetchType: 'none'
      });
      await queryClient.invalidateQueries({
        queryKey: ['customers'],
        refetchType: 'none'
      });
      await queryClient.invalidateQueries({
        queryKey: ['deleted-customers'],
        refetchType: 'none'
      });

      // Aguardar limpeza de queries individuais antes do refetch (evita 404)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fazer refetch manual apenas da query principal da tabela
      await queryClient.refetchQueries({
        queryKey: ['customer-table-data'],
        type: 'active'
      });

      toast({
        title: '⚠️ Cliente excluído permanentemente',
        description: `${data.customer_name} foi removido permanentemente. ${data.sales_count} vendas preservadas para fins fiscais.`,
        variant: 'destructive',
      });

      return data as DeleteResult;
    } catch (error: any) {
      console.error('Erro no hard delete:', error);

      toast({
        title: '❌ Erro na exclusão permanente',
        description: error.message || 'Não foi possível excluir permanentemente',
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Buscar informações do cliente antes de excluir
   */
  const getCustomerInfo = async (customerId: string): Promise<CustomerDeleteInfo | null> => {
    try {
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, name, email, lifetime_value, last_purchase_date')
        .eq('id', customerId)
        .single();

      if (customerError || !customer) {
        throw new Error('Cliente não encontrado');
      }

      const { count: salesCount } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId);

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        salesCount: salesCount || 0,
        lifetimeValue: customer.lifetime_value || 0,
        lastPurchaseDate: customer.last_purchase_date ? new Date(customer.last_purchase_date) : null,
      };
    } catch (error) {
      console.error('Erro ao buscar informações do cliente:', error);
      return null;
    }
  };

  return {
    softDelete,
    restore,
    hardDelete,
    getCustomerInfo,
    isDeleting,
    isRestoring,
  };
};

export default useCustomerDelete;
