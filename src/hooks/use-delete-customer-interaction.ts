import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useDeleteCustomerInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interactionId: string) => {
      const uuid = interactionId.length > 36 ? interactionId.slice(-36) : interactionId;
      const { error } = await supabase
        .from('customer_interactions')
        .delete()
        .eq('id', uuid);
      if (error) throw error;
      return interactionId;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['customer-interactions'] });
      toast({
        title: 'Interação excluída',
        description: 'A interação foi removida com sucesso.'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: `Não foi possível excluir: ${error.message}`,
        variant: 'destructive'
      });
    }
  });
};
