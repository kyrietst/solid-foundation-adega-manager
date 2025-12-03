/**
 * Hook para buscar despesas operacionais no dashboard
 * Integra o sistema de gestão de despesas com os KPIs do dashboard
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { safeNumber, safePercentage, debugNaN } from '@/shared/utils/number-utils';
import { getMonthStartDate, getNowSaoPaulo } from '../utils/dateHelpers';

export interface DashboardExpense {
  category_id: string;
  category_name: string;
  total_amount: number;
  expense_count: number;
  avg_amount: number;
}

export interface ExpenseSummary {
  total_expenses: number;
  total_transactions: number;
  avg_expense: number;
  top_category: string;
  top_category_amount: number;
  categories_breakdown: DashboardExpense[];
}

/**
 * Buscar despesas operacionais reais para o mês atual (MTD - Month-to-Date)
 * Dashboard sempre mostra mês atual. Para períodos customizados, use a página de Reports.
 */
export const useDashboardExpenses = () => {
  return useQuery({
    queryKey: ['dashboard', 'expenses', 'mtd'],
    queryFn: async (): Promise<ExpenseSummary> => {
      // ✅ MTD Strategy: Sempre do dia 01 do mês atual até hoje (timezone São Paulo)
      const startDate = getMonthStartDate();
      const endDate = getNowSaoPaulo();


      // ✅ REFATORADO: Query direta em expenses (RPCs foram dropadas)
      // Agregação feita em TypeScript ao invés de RPC

      // Buscar todas as despesas do período
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select(`
          id,
          amount,
          date,
          description,
          category_id,
          expense_categories (
            id,
            name
          )
        `)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (expensesError) {
        console.error('❌ Erro ao buscar despesas:', expensesError);
        throw expensesError;
      }

      // Agregação manual em TypeScript
      const expensesList = expenses || [];

      // Totais
      const total_expenses = expensesList.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
      const total_transactions = expensesList.length;
      const avg_expense = total_transactions > 0 ? total_expenses / total_transactions : 0;

      // Agrupamento por categoria
      const categoryMap = new Map<string, {
        category_id: string;
        category_name: string;
        total_amount: number;
        expense_count: number;
      }>();

      expensesList.forEach(exp => {
        const categoryId = exp.category_id || 'uncategorized';
        const categoryName = (exp.expense_categories as any)?.name || 'Sem Categoria';
        const amount = Number(exp.amount || 0);

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            category_id: categoryId,
            category_name: categoryName,
            total_amount: 0,
            expense_count: 0
          });
        }

        const category = categoryMap.get(categoryId)!;
        category.total_amount += amount;
        category.expense_count += 1;
      });

      // Converter map para array e calcular médias
      const categories_breakdown: DashboardExpense[] = Array.from(categoryMap.values())
        .map(cat => ({
          category_id: cat.category_id,
          category_name: cat.category_name,
          total_amount: cat.total_amount,
          expense_count: cat.expense_count,
          avg_amount: cat.expense_count > 0 ? cat.total_amount / cat.expense_count : 0
        }))
        .sort((a, b) => b.total_amount - a.total_amount); // Ordenar por maior gasto

      // Top categoria
      const topCategory = categories_breakdown[0];
      const top_category = topCategory?.category_name || 'N/A';
      const top_category_amount = topCategory?.total_amount || 0;

      return {
        total_expenses: Number(total_expenses),
        total_transactions,
        avg_expense: Number(avg_expense),
        top_category,
        top_category_amount: Number(top_category_amount),
        categories_breakdown
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - mesma duração dos dados financeiros
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para buscar variação orçamentária do mês atual
 */
export const useDashboardBudgetVariance = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return useQuery({
    queryKey: ['dashboard', 'budget-variance', currentMonth, currentYear],
    queryFn: async () => {

      const { data, error } = await supabase
        .rpc('calculate_budget_variance', {
          target_month: currentMonth,
          target_year: currentYear
        });

      if (error) {
        console.error('❌ Erro ao buscar variação orçamentária:', error);
        throw error;
      }

      const variances = (data || []).map(item => ({
        category_id: item.category_id,
        category_name: item.category_name,
        budgeted_amount: safeNumber(item.budgeted_amount),
        actual_amount: safeNumber(item.actual_amount),
        variance: safeNumber(item.variance),
        variance_percent: safeNumber(item.variance_percent),
        status: item.status as 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET'
      }));

      // Calcular totais com proteção anti-NaN
      const totalBudgeted = safeNumber(variances.reduce((sum, v) => sum + v.budgeted_amount, 0));
      const totalActual = safeNumber(variances.reduce((sum, v) => sum + v.actual_amount, 0));
      const totalVariance = safeNumber(totalActual - totalBudgeted);
      const totalVariancePercent = debugNaN(safePercentage(totalVariance, totalBudgeted), 'totalVariancePercent');

      const onTrackCount = variances.filter(v => v.status === 'ON_TRACK').length;
      const warningCount = variances.filter(v => v.status === 'WARNING').length;
      const overBudgetCount = variances.filter(v => v.status === 'OVER_BUDGET').length;


      return {
        variances,
        totalBudgeted,
        totalActual,
        totalVariance,
        totalVariancePercent,
        variance_percentage: totalVariancePercent, // Alias para compatibilidade
        status: overBudgetCount > 0 ? 'OVER_BUDGET' : (warningCount > 0 ? 'WARNING' : 'ON_TRACK'),
        categoriesOnTrack: onTrackCount,
        categoriesWarning: warningCount,
        categoriesOverBudget: overBudgetCount,
        categories_over_budget: overBudgetCount, // Alias para compatibilidade
        totalCategories: variances.length
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};