# Module: Finance & Expenses

> **Technical Owner:** `features/reports` & `features/expenses` **Database
> Tables:** `expenses`, `expense_categories`, `sales` (for Income)

## 1. Overview

The Finance module has been upgraded (v2.2 / v2.0 Gold) to operate on a **Real
Cash Flow (Regime de Caixa)** basis. This means financial reports reflect when
money actually moves, not just when a commitment is made.

## 2. Cash Flow Engine (The "Real" Logic)

We strictly separate **Competence (Competência)** from **Cash (Caixa)**.

### A. Income (Entradas)

- **Source:** `sales` table.
- **Criteria:** `payment_status = 'paid'`.
- **Date Used:** `paid_at` (Timestamp of actual payment).
  - _Fallback:_ If `paid_at` is null (legacy data), falls back to `created_at`.
- **RPC:** `get_real_cash_flow(p_start_date, p_end_date)`
  - Aggregates daily sums of `final_amount`.

### B. Outcome (Saídas)

- **Source:** `expenses` table.
- **Criteria:** `payment_status = 'paid'` (Crucial for Cash Flow Dashboard).
- **Date Used:** `paid_at` (Date the expense was actually paid).
  - _Previous Logic (Accrual):_ Used `date` (Issue Date). This was changed in
    v2.0 Gold to eliminate "0 value" glitches in charts.
- **RPC:** `get_real_cash_flow` handles this aggregation automatically.

### C. Receivables (Contas a Receber / Fiado)

- **Source:** `sales` table.
- **Criteria:** `payment_status = 'pending'` AND `status != 'cancelled'`.
- **KPI:** Displayed separately as "A Receber". It does **NOT** count towards
  the "Saldo Líquido" (Net Balance) until it is settled.

## 3. Database Functions (RPCs)

| Function             | Purpose                                     | Inputs                             |
| :------------------- | :------------------------------------------ | :--------------------------------- |
| `get_real_cash_flow` | Returns daily Income, Outcome, and Balance. | `p_start_date`, `p_end_date`       |
| `settle_payment`     | Marks a Fiado sale as PAID.                 | `p_sale_id`, `p_payment_method_id` |

## 4. Frontend & Charts

- **Hook:** `useFinancialCharts.ts`
- **Logic:**
  - Respects Global Date Filter (DateRange).
  - **Timezone Safety:** Charts render dates string-for-string (`YYYY-MM-DD`)
    from the DB to avoid "Off-by-One" errors caused by UTC-to-Local conversion.
- **Dashboard:** `FinancialCashFlowDashboard.tsx`
  - **"Principais Despesas" List:** Now filtered by `paid_at` to match the chart
    logic.

## 5. Expenses Management (Experiments 2.0)

### Feature: Recurring Templates

- **Component:** `ExpenseTemplatesModal.tsx`
- **Usage:** Allows users to save frequent expenses (e.g., "Aluguel", "Luz") as
  templates.
- **Benefit:** Reduces erroneous entries and speeds up the monthly process.

### Feature: Quick Pay (Listing)

- **Component:** `ExpensesPage.tsx`
- **Visuals:** Expenses listed with status badges (Pending/Paid).
- **Action:** Allows quick identification of unpaid bills.

## 6. Type Safety

- **Strict Typing:** No `any` casting allowed for critical mutations.
- **Categories:** Managed via `expense_categories`.

---

**Status:** ✅ Stable (Production) **Last Audit:** Jan 08 2026 (v2.0 Gold
Release).
