/**
 * Hook para gerenciar despesas operacionais
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';
// ------------------------------------------------------------------
// MANUAL TYPES TO FIX "EXCESSIVELY DEEP INSTANTIATION" ERROR
// Cortamos a dependência direta do Database['public']... para evitar loop do TS
// ------------------------------------------------------------------
interface OperationalExpense {
  id: string;
  user_id: string; // Adicionado para segurança
  category_id: string | null;
  description: string;
  amount: number;
  date: string;
  paid: boolean;
  // Campos opcionais/legados que podem ou não existir, tipados como opcionais
  payment_method?: string | null;
  supplier_vendor?: string | null;
  receipt_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Para Insert/Update, usamos utilitários do TS baseados na interface acima
type ExpenseInsert = Partial<OperationalExpense>;
type ExpenseUpdate = Partial<OperationalExpense>;
// ------------------------------------------------------------------

export interface OperationalExpenseWithCategory extends OperationalExpense {
  expense_categories: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

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
      let query = (supabase as any)
        .from('expenses' as any)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .order('date', { ascending: false });

      // Filtros
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.start_date) {
        query = query.gte('date', filters.start_date);
      }

      if (filters?.end_date) {
        query = query.lte('date', filters.end_date);
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
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
        expenses: (data as any) as OperationalExpenseWithCategory[],
        total: count || 0
      };
    }
  });
};

export const useExpense = (id: string) => {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('expenses' as any)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .eq('id' as any, id as any)
        .eq('id' as any, id as any)
        .single().then(res => ({ data: res.data as unknown as OperationalExpenseWithCategory, error: res.error }));

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
      // Query direta na tabela expenses com JOIN para categorias
      const { data: expenses, error } = await (supabase as any)
        .from('expenses' as any)
        .select(`
          amount,
          category_id,
          expense_categories(name)
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) {
        console.error('Erro ao buscar resumo de despesas:', error);
        throw error;
      }

      // Retornar valores padrão se não houver despesas
      if (!expenses || expenses.length === 0) {
        return {
          total_expenses: 0,
          total_transactions: 0,
          avg_expense: 0,
          top_category: 'N/A',
          top_category_amount: 0
        } as ExpenseSummary;
      }

      // Calcular totais no frontend
      const total_expenses = expenses.reduce((acc, e: any) => acc + Number(e.amount), 0);
      const total_transactions = expenses.length;
      const avg_expense = total_expenses / total_transactions;

      // Encontrar categoria com maior gasto
      const categoryTotals = expenses.reduce((acc, e: any) => {
        const catName = e.expense_categories?.name || 'Sem Categoria';
        acc[catName] = (acc[catName] || 0) + Number(e.amount);
        return acc;
      }, {} as Record<string, number>);

      const topCategoryEntry = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => Number(b) - Number(a))[0] || ['N/A', 0];

      return {
        total_expenses,
        total_transactions,
        avg_expense,
        top_category: topCategoryEntry[0],
        top_category_amount: topCategoryEntry[1]
      } as ExpenseSummary;
    }
  });
};

export const useMonthlyExpenses = (month: number, year: number, categoryId?: string) => {
  return useQuery({
    queryKey: ['monthly-expenses', month, year, categoryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_monthly_expenses' as any, {
          target_month: month,
          target_year: year,
          category_filter: categoryId || null
        });

      if (error) {
        console.error('Erro ao buscar despesas mensais:', error);
        throw error;
      }

      return (data || []) as unknown as MonthlyExpense[];
    }
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: ExpenseInsert) => {
      const { data, error } = await (supabase as any)
        .from('expenses' as any)
        .insert([expense] as any)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single().then(res => ({ data: res.data as unknown as OperationalExpenseWithCategory, error: res.error }));

      if (error) {
        console.error('Erro ao criar despesa:', error);
        throw error;
      }

      if (!data) throw new Error('No data returned');
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
      const { data, error } = await (supabase as any)
        .from('expenses' as any)
        .update(updates as any)
        .eq('id' as any, id as any)
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .single().then(res => ({ data: res.data as unknown as OperationalExpenseWithCategory, error: res.error }));

      if (error) {
        console.error('Erro ao atualizar despesa:', error);
        throw error;
      }

      if (!data) throw new Error('No data returned');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', (data as any).id] });
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
      const { error } = await (supabase as any)
        .from('expenses' as any)
        .delete()
        .eq('id' as any, id as any);

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
    onError: (error: unknown) => {
      console.error('Erro ao excluir despesa:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao excluir despesa: ' + message);
    }
  });
};