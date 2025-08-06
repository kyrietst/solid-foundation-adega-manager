/**
 * Hook para mutação de movimentações
 * Centraliza lógica de criação de movimentações
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { MovementFormData } from './useMovementForm';
import { useMovementValidation } from './useMovementValidation';

export const useMovementMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { validateForm, hasErrors, getFirstError } = useMovementValidation();

  const movementMutation = useMutation({
    mutationFn: async (form: MovementFormData) => {
      // Validar formulário
      const errors = validateForm(form);
      if (hasErrors(errors)) {
        throw new Error(getFirstError(errors));
      }

      const qty = parseInt(form.quantity);
      
      // Inserir movimentação
      const { error } = await supabase.from('inventory_movements').insert({
        type: form.type,
        product_id: form.product_id!,
        quantity: qty,
        customer_id: form.customer_id || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        due_date: form.due_date || null,
        sale_id: form.sale_id || null,
        reason: form.reason || null,
        user_id: user?.id || null
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['inventory_movements'] });
      queryClient.invalidateQueries({ queryKey: ['customer-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['customer-interactions', ''] });
      
      // Invalida interações do cliente específico se houver
      if (variables.customer_id) {
        queryClient.invalidateQueries({ queryKey: ['customer-interactions', variables.customer_id] });
      }

      toast({ 
        title: 'Movimentação registrada!',
        description: 'A movimentação foi salva com sucesso.'
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erro ao salvar', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  return {
    movementMutation,
    isCreating: movementMutation.isPending,
    createMovement: movementMutation.mutate,
  };
};