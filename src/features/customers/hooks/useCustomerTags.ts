import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/shared/components/use-toast';

export interface CustomerTagsData {
  customerId: string;
  tags: string[];
}

export const useCustomerTags = () => {
  const queryClient = useQueryClient();

  const updateCustomerTags = useMutation({
    mutationFn: async ({ customerId, tags }: CustomerTagsData) => {
      const { data, error } = await supabase
        .from('customers')
        .update({ tags: JSON.stringify(tags) })
        .eq('id', customerId)
        .select('id, name, tags')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas para atualizar cache
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      
      const tagCount = Array.isArray(data.tags) ? data.tags.length : JSON.parse(data.tags || '[]').length;
      
      toast({
        title: 'Tags atualizadas',
        description: `Cliente ${data.name} agora tem ${tagCount} tag(s)`,
        variant: 'success'
      });
    },
    onError: (error) => {
      console.error('Erro ao atualizar tags:', error);
      toast({
        title: 'Erro ao atualizar tags',
        description: 'Não foi possível salvar as tags. Tente novamente.',
        variant: 'destructive'
      });
    }
  });

  const addTagToCustomer = useMutation({
    mutationFn: async ({ customerId, newTag }: { customerId: string; newTag: string }) => {
      // Primeiro buscar as tags atuais
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('tags')
        .eq('id', customerId)
        .single();

      if (fetchError) throw fetchError;

      // Processar tags existentes
      const currentTags = customer.tags ? 
        (Array.isArray(customer.tags) ? customer.tags : JSON.parse(customer.tags)) 
        : [];

      // Verificar se a tag já existe
      if (currentTags.includes(newTag)) {
        throw new Error('Tag já existe');
      }

      // Adicionar nova tag
      const updatedTags = [...currentTags, newTag];

      // Atualizar no banco
      const { data, error } = await supabase
        .from('customers')
        .update({ tags: JSON.stringify(updatedTags) })
        .eq('id', customerId)
        .select('id, name, tags')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      
      toast({
        title: 'Tag adicionada',
        description: `Tag "${variables.newTag}" adicionada com sucesso`,
        variant: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao adicionar tag',
        description: error.message || 'Não foi possível adicionar a tag',
        variant: 'destructive'
      });
    }
  });

  const removeTagFromCustomer = useMutation({
    mutationFn: async ({ customerId, tagToRemove }: { customerId: string; tagToRemove: string }) => {
      // Buscar tags atuais
      const { data: customer, error: fetchError } = await supabase
        .from('customers')
        .select('tags')
        .eq('id', customerId)
        .single();

      if (fetchError) throw fetchError;

      // Processar tags existentes
      const currentTags = customer.tags ? 
        (Array.isArray(customer.tags) ? customer.tags : JSON.parse(customer.tags)) 
        : [];

      // Remover tag
      const updatedTags = currentTags.filter((tag: string) => tag !== tagToRemove);

      // Atualizar no banco
      const { data, error } = await supabase
        .from('customers')
        .update({ tags: JSON.stringify(updatedTags) })
        .eq('id', customerId)
        .select('id, name, tags')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] });
      
      toast({
        title: 'Tag removida',
        description: `Tag "${variables.tagToRemove}" removida com sucesso`,
        variant: 'warning'
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover tag',
        description: error.message || 'Não foi possível remover a tag',
        variant: 'destructive'
      });
    }
  });

  // Hook para buscar todas as tags únicas usadas no sistema
  const getAllUniqueTags = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('tags')
        .not('tags', 'is', null);

      if (error) throw error;

      // Extrair todas as tags únicas
      const allTags = new Set<string>();
      data.forEach(customer => {
        if (customer.tags) {
          const tags = Array.isArray(customer.tags) ? 
            customer.tags : 
            JSON.parse(customer.tags);
          tags.forEach((tag: string) => allTags.add(tag));
        }
      });

      return Array.from(allTags).sort();
    }
  });

  // Função utilitária para processar tags vindas do banco
  const processTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      return JSON.parse(tags);
    } catch {
      return [];
    }
  };

  return {
    updateCustomerTags,
    addTagToCustomer,
    removeTagFromCustomer,
    getAllUniqueTags,
    processTags,
    
    // Estados dos mutations
    isUpdating: updateCustomerTags.isPending || addTagToCustomer.isPending || removeTagFromCustomer.isPending
  };
};