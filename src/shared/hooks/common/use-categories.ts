/**
 * Hook para gerenciar categorias dinâmicas do banco de dados
 * Substitui o enum fixo por categorias gerenciáveis pelo usuário
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from './use-toast';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  /** Estoque mínimo padrão para produtos desta categoria */
  default_min_stock?: number;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  /** Estoque mínimo padrão para produtos desta categoria */
  default_min_stock?: number;
}

/**
 * Hook para buscar categorias ativas
 */
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos - categorias mudam pouco
  });
};

/**
 * Hook para buscar todas as categorias (incluindo inativas) - apenas para admins
 */
export const useAllCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erro ao buscar todas as categorias:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos para dados administrativos
  });
};

/**
 * Hook para buscar uma categoria específica
 */
export const useCategory = (categoryId?: string) => {
  return useQuery<Category | null>({
    queryKey: ['categories', categoryId],
    queryFn: async () => {
      if (!categoryId) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }

      return data;
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook para criar nova categoria
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      // Verificar se o usuário é admin
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem criar categorias');
      }

      // Buscar o próximo display_order se não fornecido
      let displayOrder = categoryData.display_order;
      if (displayOrder === undefined) {
        const { data: maxOrderData } = await supabase
          .from('categories')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        displayOrder = (maxOrderData?.[0]?.display_order || 0) + 1;
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: categoryData.name.trim(),
          description: categoryData.description?.trim() || null,
          color: categoryData.color || '#6B7280',
          icon: categoryData.icon || 'Package',
          display_order: displayOrder,
          created_by: user.id,
          default_min_stock: categoryData.default_min_stock ?? 10
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe uma categoria com este nome');
        }
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache de categorias e todos os relatórios que dependem delas
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-reports-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['category-mix'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-by-category'] });
      // Invalidar alertas de estoque baixo (usa default_min_stock)
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });

      toast({
        title: 'Categoria criada',
        description: `A categoria "${data.name}" foi criada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para atualizar categoria
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data: categoryData }: { id: string; data: Partial<CategoryFormData> }) => {
      // Verificar permissões
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem editar categorias');
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (categoryData.name) updateData.name = categoryData.name.trim();
      if (categoryData.description !== undefined) updateData.description = categoryData.description?.trim() || null;
      if (categoryData.color) updateData.color = categoryData.color;
      if (categoryData.icon) updateData.icon = categoryData.icon;
      if (categoryData.display_order !== undefined) updateData.display_order = categoryData.display_order;
      // Campo de estoque mínimo padrão para alertas
      if (categoryData.default_min_stock !== undefined) updateData.default_min_stock = categoryData.default_min_stock;

      const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Já existe uma categoria com este nome');
        }
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache de categorias e todos os relatórios que dependem delas
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-reports-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['category-mix'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-by-category'] });
      // Invalidar alertas de estoque baixo (usa default_min_stock)
      queryClient.invalidateQueries({ queryKey: ['low-stock-products'] });

      toast({
        title: 'Categoria atualizada',
        description: `A categoria "${data.name}" foi atualizada com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar categoria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para ativar/desativar categoria
 */
export const useToggleCategoryStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      // Verificar permissões
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem ativar/desativar categorias');
      }

      const { data, error } = await supabase
        .from('categories')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidar cache de categorias e todos os relatórios que dependem delas
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-reports-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['category-mix'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-by-category'] });
      
      toast({
        title: data.is_active ? 'Categoria ativada' : 'Categoria desativada',
        description: `A categoria "${data.name}" foi ${data.is_active ? 'ativada' : 'desativada'} com sucesso.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook para reordenar categorias
 */
export const useReorderCategories = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (categories: { id: string; display_order: number }[]) => {
      // Verificar permissões
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        throw new Error('Apenas administradores podem reordenar categorias');
      }

      // Atualizar ordem de cada categoria
      const updates = categories.map(category => 
        supabase
          .from('categories')
          .update({ 
            display_order: category.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', category.id)
      );

      const results = await Promise.all(updates);
      
      // Verificar se alguma atualização falhou
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Erro ao reordenar algumas categorias');
      }

      return true;
    },
    onSuccess: () => {
      // Invalidar cache de categorias e todos os relatórios que dependem delas
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['stock-reports-by-category'] });
      queryClient.invalidateQueries({ queryKey: ['category-mix'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['products-by-category'] });
      
      toast({
        title: 'Ordem atualizada',
        description: 'A ordem das categorias foi atualizada com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao reordenar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Utility functions
 */

/**
 * Converte lista de categorias para options para select/dropdown
 */
export const categoriesToOptions = (categories: Category[]) => {
  return categories.map(category => ({
    value: category.name,
    label: category.name,
    color: category.color,
    icon: category.icon
  }));
};

/**
 * Busca categoria por nome
 */
export const findCategoryByName = (categories: Category[], name: string) => {
  return categories.find(category => category.name === name);
};

/**
 * Validação de nome de categoria
 */
export const validateCategoryName = (name: string, existingCategories: Category[], excludeId?: string) => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, error: 'Nome da categoria é obrigatório' };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: 'Nome deve ter no máximo 50 caracteres' };
  }

  // Verificar duplicatas
  const duplicate = existingCategories.find(cat => 
    cat.name.toLowerCase() === trimmedName.toLowerCase() && 
    cat.id !== excludeId
  );

  if (duplicate) {
    return { isValid: false, error: 'Já existe uma categoria com este nome' };
  }

  return { isValid: true };
};