/**
 * Hook para gerenciar orçamentos de despesas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/core/api/supabase/types';

type ExpenseBudget = Database['public']['Tables']['expense_budgets']['Row'];
type BudgetInsert = Database['public']['Tables']['expense_budgets']['Insert'];
type BudgetUpdate = Database['public']['Tables']['expense_budgets']['Update'];

export interface BudgetVariance {
  category_id: string;
  category_name: string;
  budgeted_amount: number;
  actual_amount: number;
  variance: number;
  variance_percent: number;
  status: 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET';
}

export const useExpenseBudgets = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['expense-budgets', month, year],
    queryFn: async () => {
      let query = supabase
        .from('expense_budgets')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .order('month_year', { ascending: false });

      if (month && year) {
        const monthYear = `${year}-${month.toString().padStart(2, '0')}-01`;
        query = query.eq('month_year', monthYear);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        throw error;
      }

      return data || [];
    }
  });
};

export const useExpenseBudget = (id: string) => {
  return useQuery({
    queryKey: ['expense-budget', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_budgets')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar orçamento:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id
  });
};

export const useBudgetVariance = (month: number, year: number) => {
  return useQuery({
    queryKey: ['budget-variance', month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('calculate_budget_variance', {
          target_month: month,
          target_year: year
        });

      if (error) {
        console.error('Erro ao calcular variação orçamentária:', error);
        throw error;
      }

      return (data || []) as BudgetVariance[];
    }
  });
};

export const useBudgetSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: ['budget-summary', month, year],
    queryFn: async () => {
      const budgetVariance = await supabase
        .rpc('calculate_budget_variance', {
          target_month: month,
          target_year: year
        });

      if (budgetVariance.error) {
        throw budgetVariance.error;
      }

      const variances = budgetVariance.data as BudgetVariance[];
      
      const totalBudgeted = variances.reduce((sum, item) => sum + Number(item.budgeted_amount), 0);
      const totalActual = variances.reduce((sum, item) => sum + Number(item.actual_amount), 0);
      const totalVariance = totalActual - totalBudgeted;
      const variancePercent = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;
      
      const onTrackCount = variances.filter(v => v.status === 'ON_TRACK').length;
      const warningCount = variances.filter(v => v.status === 'WARNING').length;
      const overBudgetCount = variances.filter(v => v.status === 'OVER_BUDGET').length;

      return {
        totalBudgeted,
        totalActual,
        totalVariance,
        variancePercent,
        categoriesOnTrack: onTrackCount,
        categoriesWarning: warningCount,
        categoriesOverBudget: overBudgetCount,
        totalCategories: variances.length
      };
    }
  });
};

export const useCreateExpenseBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const { data, error } = await supabase
        .from('expense_budgets')
        .insert([budget])
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar orçamento:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success('Orçamento criado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar orçamento:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('Já existe um orçamento para esta categoria neste mês');
      } else {
        toast.error('Erro ao criar orçamento: ' + (error.message || 'Erro desconhecido'));
      }
    }
  });
};

export const useUpdateExpenseBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: BudgetUpdate }) => {
      const { data, error } = await supabase
        .from('expense_budgets')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar orçamento:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expense-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['expense-budget', data.id] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar orçamento:', error);
      toast.error('Erro ao atualizar orçamento: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useDeleteExpenseBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('expense_budgets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir orçamento:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success('Orçamento excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir orçamento:', error);
      toast.error('Erro ao excluir orçamento: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useBulkCreateBudgets = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budgets: BudgetInsert[]) => {
      const { data, error } = await supabase
        .from('expense_budgets')
        .insert(budgets)
        .select(`
          *,
          expense_categories(name, color, icon)
        `);

      if (error) {
        console.error('Erro ao criar orçamentos em lote:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expense-budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      queryClient.invalidateQueries({ queryKey: ['budget-summary'] });
      toast.success(`${data.length} orçamentos criados com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao criar orçamentos em lote:', error);
      toast.error('Erro ao criar orçamentos: ' + (error.message || 'Erro desconhecido'));
    }
  });
};