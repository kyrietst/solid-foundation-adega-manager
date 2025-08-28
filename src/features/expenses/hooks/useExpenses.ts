/**
 * Hook para gerenciar despesas operacionais
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/core/api/supabase/types';

type OperationalExpense = Database['public']['Tables']['operational_expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['operational_expenses']['Insert'];
type ExpenseUpdate = Database['public']['Tables']['operational_expenses']['Update'];

export interface ExpenseFilters {
  category_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_transactions: number;
  avg_expense: number;
  top_category: string;
  top_category_amount: number;
}

export interface MonthlyExpense {
  category_id: string;
  category_name: string;
  total_amount: number;
  expense_count: number;
  avg_amount: number;
}

export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = supabase
        .from('operational_expenses')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .order('expense_date', { ascending: false });

      // Filtros
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.start_date) {
        query = query.gte('expense_date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('expense_date', filters.end_date);
      }

      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,supplier_vendor.ilike.%${filters.search}%`);
      }

      // Paginação
      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }

      return {
        expenses: data || [],
        total: count || 0
      };
    }
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operational_expenses')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar despesa:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id
  });
};

export const useExpenseSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['expense-summary', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_expense_summary', {
          start_date: startDate,
          end_date: endDate
        });

      if (error) {
        console.error('Erro ao buscar resumo de despesas:', error);
        throw error;
      }

      return data?.[0] as ExpenseSummary || {
        total_expenses: 0,
        total_transactions: 0,
        avg_expense: 0,
        top_category: 'N/A',
        top_category_amount: 0
      };
    }
  });
};

export const useMonthlyExpenses = (month: number, year: number, categoryId?: string) => {
  return useQuery({
    queryKey: ['monthly-expenses', month, year, categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_monthly_expenses', {
          target_month: month,
          target_year: year,
          category_filter: categoryId || null
        });

      if (error) {
        console.error('Erro ao buscar despesas mensais:', error);
        throw error;
      }

      return (data || []) as MonthlyExpense[];
    }
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await supabase
        .from('operational_expenses')
        .insert([expense])
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single();

      if (error) {
        console.error('Erro ao criar despesa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      toast.success('Despesa criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar despesa:', error);
      toast.error('Erro ao criar despesa: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ExpenseUpdate }) => {
      const { data, error } = await supabase
        .from('operational_expenses')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar despesa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', data.id] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      toast.success('Despesa atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar despesa:', error);
      toast.error('Erro ao atualizar despesa: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('operational_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir despesa:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['budget-variance'] });
      toast.success('Despesa excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa: ' + (error.message || 'Erro desconhecido'));
    }
  });
};