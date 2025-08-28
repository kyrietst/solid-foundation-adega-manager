/**
 * Hook para gerenciar categorias de despesas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/core/api/supabase/types';

type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];
type CategoryInsert = Database['public']['Tables']['expense_categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['expense_categories']['Update'];

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias de despesas:', error);
        throw error;
      }

      return data || [];
    }
  });
};

export const useExpenseCategory = (id: string) => {
  return useQuery({
    queryKey: ['expense-category', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar categoria de despesa:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id
  });
};

export const useCategoryExpenseSummary = (categoryId: string, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['category-expense-summary', categoryId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operational_expenses')
        .select('amount, expense_date')
        .eq('category_id', categoryId)
        .gte('expense_date', startDate)
        .lte('expense_date', endDate);

      if (error) {
        console.error('Erro ao buscar resumo da categoria:', error);
        throw error;
      }

      const expenses = data || [];
      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const count = expenses.length;
      const average = count > 0 ? total / count : 0;

      return {
        total,
        count,
        average,
        expenses
      };
    },
    enabled: !!categoryId
  });
};

export const useCreateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: CategoryInsert) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useUpdateExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CategoryUpdate }) => {
      const { data, error } = await supabase
        .from('expense_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar categoria:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      queryClient.invalidateQueries({ queryKey: ['expense-category', data.id] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useDeleteExpenseCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar se há despesas associadas
      const { data: expenses, error: checkError } = await supabase
        .from('operational_expenses')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (expenses && expenses.length > 0) {
        throw new Error('Não é possível excluir categoria com despesas associadas');
      }

      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir categoria:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria: ' + (error.message || 'Erro desconhecido'));
    }
  });
};