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


      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Buscar resumo geral usando stored procedure
      const { data: summaryData, error: summaryError } = await supabase
        .rpc('get_expense_summary', {
          start_date: startDateStr,
          end_date: endDateStr
        });

      if (summaryError) {
        console.error('❌ Erro ao buscar resumo de despesas:', summaryError);
        throw summaryError;
      }

      const summary = summaryData?.[0] || {
        total_expenses: 0,
        total_transactions: 0,
        avg_expense: 0,
        top_category: 'N/A',
        top_category_amount: 0
      };

      // Buscar breakdown por categoria usando stored procedure mensal
      const currentMonth = endDate.getMonth() + 1;
      const currentYear = endDate.getFullYear();
      
      const { data: monthlyData, error: monthlyError } = await supabase
        .rpc('get_monthly_expenses', {
          target_month: currentMonth,
          target_year: currentYear
        });

      if (monthlyError) {
        console.error('❌ Erro ao buscar despesas mensais:', monthlyError);
      }

      const categories_breakdown: DashboardExpense[] = (monthlyData || []).map(expense => ({
        category_id: expense.category_id,
        category_name: expense.category_name,
        total_amount: Number(expense.total_amount),
        expense_count: expense.expense_count,
        avg_amount: Number(expense.avg_amount)
      }));


      return {
        total_expenses: Number(summary.total_expenses),
        total_transactions: summary.total_transactions,
        avg_expense: Number(summary.avg_expense),
        top_category: summary.top_category,
        top_category_amount: Number(summary.top_category_amount),
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