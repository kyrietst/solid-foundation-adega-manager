import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast, toast } from '@/shared/hooks/common/use-toast';

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
        .update({ tags: JSON.stringify(tags) } as any)
        .eq('id' as any, customerId as any)
        .select('id, name, tags')
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data: any) => {
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

  // New mutation to get all unique tags from the `customer_tags` table
  const getAllUniqueTags = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('customer_tags')
        .select('tag')
        .order('tag');

      if (error) throw error;

      // Filter unique tags in JS to avoid 'distinct' type error
      const uniqueTags = [...new Set((data || []).map((item: any) => item.tag))];
      return uniqueTags;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
    }
  });

  // New mutation to add a tag to a customer in the `customer_tags` table
  const addTag = useMutation({
    mutationFn: async ({ customerId, tag }: { customerId: string, tag: string }) => {
      // First check if tag already exists for this customer
      const { data: existing } = await supabase
        .from('customer_tags')
        .select('id')
        .eq('customer_id' as any, customerId as any)
        .eq('tag' as any, tag as any)
        .maybeSingle();

      if (existing) {
        throw new Error('Tag já existe para este cliente');
      }

      const { data, error } = await supabase
        .from('customer_tags')
        .insert([{ customer_id: customerId, tag }] as any)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
      // Invalidation of specific customer query is handled by the component if needed

      toast({
        title: 'Tag adicionada',
        description: `Tag "${variables.tag}" adicionada com sucesso`,
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
      // Remover tag da tabela customer_tags
      const { error } = await supabase
        .from('customer_tags')
        .delete()
        .eq('customer_id' as any, customerId as any)
        .eq('tag' as any, tagToRemove as any);

      if (error) throw error;
      return { id: customerId, tagToRemove };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tags'] });
      // Também invalidar customers para garantir consistência se houver fallback
      queryClient.invalidateQueries({ queryKey: ['customers'] });

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
    addTag,
    removeTag: removeTagFromCustomer,
    addTagToCustomer: addTag,
    removeTagFromCustomer,
    getAllUniqueTags,
    processTags,
    isUpdating: updateCustomerTags.isPending || addTag.isPending || removeTagFromCustomer.isPending
  };
};