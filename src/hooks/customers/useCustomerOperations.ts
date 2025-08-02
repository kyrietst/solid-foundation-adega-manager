/**
 * Hook para operações CRUD de clientes
 * Extraído do CustomersNew.tsx para separar responsabilidades
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CustomerOperations } from '@/components/customers/types';

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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
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
      const { error } = await supabase.from('customers').delete().eq('id', id);
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

  return {
    createCustomer: createCustomerMutation.mutate,
    updateCustomer: updateCustomerMutation.mutate,
    deleteCustomer: deleteCustomerMutation.mutate,
    isCreating: createCustomerMutation.isPending,
    isUpdating: updateCustomerMutation.isPending,
    isDeleting: deleteCustomerMutation.isPending,
  };
};