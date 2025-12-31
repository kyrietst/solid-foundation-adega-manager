/**
 * Hook para operações CRUD de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { CustomerOperations } from '@/features/customers/types/types';
import { getSaoPauloTimestamp } from '@/shared/utils/timezone-saopaulo';

export const useCustomerOperations = (): CustomerOperations => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutation para criar cliente
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customerData,
          created_at: getSaoPauloTimestamp(),
          updated_at: getSaoPauloTimestamp(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente criado!",
        description: `${data.name} foi adicionado com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar cliente
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const { id, ...updateData } = customerData;
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...updateData,
          updated_at: getSaoPauloTimestamp(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente atualizado!",
        description: `${data.name} foi atualizado com sucesso`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para deletar cliente
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('customers').delete().eq('id', id as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Cliente removido",
        description: "O cliente foi removido com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  // Mutation para criação rápida de cliente (modal de venda)
  const createQuickCustomerMutation = useMutation({
    mutationFn: async ({ name, phone }: { name: string; phone?: string | null }) => {
      const { data, error } = await supabase.rpc('create_quick_customer' as any, {
        p_name: name,
        p_phone: phone || null
      });

      if (error) throw error;
      return (data as unknown as string) || ''; // Returns uuid
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      // Toast handled by component for specific feedback or here if generic
    },
  });

  return {
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    createQuickCustomer: createQuickCustomerMutation.mutate,
    createQuickCustomerAsync: createQuickCustomerMutation.mutateAsync,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
    isCreatingQuick: createQuickCustomerMutation.isPending,
  };
};