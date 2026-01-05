# Module: Finance (Expenses)

This module tracks operational costs to provide a true Net Profit view.

## 1. Structure

- **Table:** `expenses`
  - **Core:** `id`, `date`, `amount`, `description`.
  - **Classification:** `category_id`, `subcategory`, `budget_category`.
  - **Payment:** `payment_status` (paid/pending), `payment_method`,
    `supplier_vendor`.
  - **Files:** `receipt_url`.
  - **Recurrence:** `is_recurring`, `recurring_frequency`.
- **Categories:** `expense_categories` (e.g., Aluguel, Prolabore, Fornecedores).

## 2. Type Safety Strategy

To prevent "Type instantiation is excessively deep" errors in TypeScript (due to
complex Supabase joins):

- **Isolation:** We cast `supabase` to `any` inside hooks (`useExpenses.ts`).
- **Explicit Return:** We cast the _result_ to a strict Interface (e.g.,
  `OperationalExpenseWithCategory`). This keeps the IDE fast and clean.

## 3. Features

- **Pagination:** Server-side via `useExpensesList` hook.
- **Filtering:** Date Range and Category.
- **Dashboard:** Tracks "Product Margin" (Revenue - COGS).
- **Expenses Module:** Tracks "Operational Cash Flow" (Bill Payments).
- **Full P&L:** The combination of both gives the true Net Business Profit
  (available in advanced reports).

## 4. Business Logic

- **Payment Status:** `paid` vs `pending`.
- **Date:** `date` column is the reference for Cash Flow (Competência/Caixa).
