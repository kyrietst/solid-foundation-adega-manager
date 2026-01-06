/**
 * Hook para gerenciar despesas operacionais
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { toast } from 'sonner';

// ------------------------------------------------------------------
// MANUAL TYPES TO FIX "EXCESSIVELY DEEP INSTANTIATION" ERROR
// ------------------------------------------------------------------

export interface OperationalExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  date: string; // The "Competence/Cash" date
  payment_status: 'paid' | 'pending';
  paid: boolean; // Legacy compat
  paid_at?: string | null; // Real Cash Flow date
  
  // Optional fields
  payment_method?: string | null;
  supplier_vendor?: string | null;
  receipt_url?: string | null;
  subcategory?: string | null;
  budget_category?: string | null;
  is_recurring?: boolean; // Legacy/Audit only now
  created_at: string;
  updated_at: string;
}

export interface ExpenseTemplate {
  id: string;
  description: string;
  amount: number;
  category_id: string | null;
  day_of_month: number;
  active: boolean;
  destination_user_id?: string | null;
  created_at: string;
}

export interface OperationalExpenseWithCategory extends OperationalExpense {
  expense_categories: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}

export interface ExpenseTemplateWithCategory extends ExpenseTemplate {
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

// ============================================================================
// EXPENSES (INSTANCES) HOOKS
// ============================================================================

export const useExpenses = (filters?: ExpenseFilters) => {
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      let query = (supabase as any)
        .from('expenses')
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
        .from('expenses')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .eq('id', id)
        .single(); // Removed double .single() chaining weirdness

      if (error) {
        console.error('Erro ao buscar despesa:', error);
        throw error;
      }

      return data as OperationalExpenseWithCategory;
    },
    enabled: !!id
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Partial<OperationalExpense>) => {
      // Remove campos que não devem ser enviados na criação manual
      const { id, created_at, updated_at, ...cleanPayload } = expense as any;

      const { data, error } = await (supabase as any)
        .from('expenses')
        .insert([cleanPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
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
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<OperationalExpense> }) => {
      // SANITIZATION: Remove metadata columns that trigger 403/400 errors or shouldn't be touched
      const { 
        id: _id, 
        created_at, 
        updated_at, 
        user_id, 
        expense_categories, // Remove joined relation data if present
        ...cleanUpdates 
      } = updates as any;

      const { data, error } = await (supabase as any)
        .from('expenses')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', (data as any).id] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      toast.success('Despesa atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar despesa:', error);
      toast.error('Erro ao atualizar: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      toast.success('Despesa excluída com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

// ============================================================================
// TEMPLATE HOOKS (RECURRENCE ENGINE)
// ============================================================================

export const useExpenseTemplates = () => {
  return useQuery<ExpenseTemplateWithCategory[]>({
    queryKey: ['expense-templates'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('expense_templates')
        .select(`
          *,
          expense_categories(name, color, icon)
        `)
        .order('day_of_month', { ascending: true });

      if (error) {
        console.error('Erro ao buscar templates:', error);
        throw error;
      }

      return (data || []) as unknown as ExpenseTemplateWithCategory[];
    }
  });
};

export const useCreateExpenseTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: Partial<ExpenseTemplate>) => {
      const { data, error } = await (supabase as any)
        .from('expense_templates')
        .insert([template])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-templates'] });
      toast.success('Recorrência salva com sucesso!');
    },
    onError: (error: any) => toast.error('Erro: ' + error.message)
  });
};

export const useUpdateExpenseTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ExpenseTemplate> }) => {
      const { data, error } = await (supabase as any)
        .from('expense_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-templates'] });
      toast.success('Recorrência atualizada!');
    },
    onError: (error: any) => toast.error('Erro: ' + error.message)
  });
};

export const useToggleExpenseTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { data, error } = await (supabase as any)
        .from('expense_templates')
        .update({ active })
        .eq('id', id);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-templates'] });
    },
    onError: (e: any) => toast.error(e.message)
  });
};

export const useGenerateMonthlyExpenses = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      const { data, error } = await (supabase as any)
        .rpc('generate_monthly_expenses', {
          target_month: month,
          target_year: year
        });

      if (error) throw error;
      return data as number; // Returns count of created expenses
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-summary'] });
      if (count > 0) {
        toast.success(`${count} despesas fixas geradas para o mês!`);
      } else {
        toast.info('Nenhuma despesa nova para gerar neste mês.');
      }
    },
    onError: (error: any) => {
      console.error('Erro ao gerar despesas:', error);
      toast.error('Erro ao gerar despesas: ' + (error.message || 'Erro desconhecido'));
    }
  });
};

export const useExpenseSummary = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['expense-summary', startDate, endDate],
    queryFn: async () => {
      const { data: expenses, error } = await (supabase as any)
        .from('expenses')
        .select(`
          amount,
          category_id,
          expense_categories(name)
        `)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      if (!expenses || expenses.length === 0) {
        return {
          total_expenses: 0,
          total_transactions: 0,
          avg_expense: 0,
          top_category: 'N/A',
          top_category_amount: 0
        } as ExpenseSummary;
      }

      const total_expenses = expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);
      const total_transactions = expenses.length;
      const avg_expense = total_expenses / total_transactions;

      const categoryTotals = expenses.reduce((acc: any, e: any) => {
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
        top_category_amount: topCategoryEntry[1] as number
      } as ExpenseSummary;
    }
  });
};

export const useMonthlyExpenses = (month: number, year: number, categoryId?: string) => {
    // Keep this for legacy reports or refactor later
    // Just a placeholder to strictly type the query if needed
  return useQuery({
    queryKey: ['monthly-expenses', month, year, categoryId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_monthly_expenses', {
          target_month: month,
          target_year: year,
          category_filter: categoryId || null
        });

      if (error) throw error;
      return (data || []) as unknown as MonthlyExpense[];
    }
  });
};

export const useToggleExpenseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: 'paid' | 'pending' }) => {
      const updatePayload = {
        payment_status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null
      };

      const { data, error } = await (supabase as any)
        .from('expenses')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Status da despesa atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da despesa');
    }
  });
};
