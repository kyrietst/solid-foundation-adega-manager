import { ExpensesTab } from './ExpensesTab';

/**
 * ExpensesPage.tsx - Wrapper para a Tab de Despesas
 * Refatorado para delegar todo o layout para ExpensesTab.tsx
 * para manter consistência visual (PremiumBackground, Headers, etc)
 */
export const ExpensesPage = () => {
  return <ExpensesTab />;
};

export default ExpensesPage;