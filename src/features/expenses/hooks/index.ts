// Expenses Feature Hooks Barrel Export

// Expense Management
export {
  useExpenses,
  useExpense,
  useExpenseSummary,
  useMonthlyExpenses,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  useToggleExpenseStatus,
  useGenerateMonthlyExpenses
} from './useExpenses';

// Category Management
export {
  useExpenseCategories,
  useExpenseCategory,
  useCategoryExpenseSummary,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory
} from './useExpenseCategories';

// Budget Management
export {
  useExpenseBudgets,
  useExpenseBudget,
  useBudgetVariance,
  useBudgetSummary,
  useCreateExpenseBudget,
  useUpdateExpenseBudget,
  useDeleteExpenseBudget,
  useBulkCreateBudgets
} from './useExpenseBudgets';

// Type exports
export type { ExpenseFilters, ExpenseSummary, MonthlyExpense, OperationalExpense } from './useExpenses';
export type { BudgetVariance } from './useExpenseBudgets';