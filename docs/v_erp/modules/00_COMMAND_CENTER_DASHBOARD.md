# Module: Command Center (Dashboard)

The **Command Center** is the heart of Adega Manager, providing real-time
visibility into the store's performance. It is designed to be the first screen
the manager sees, offering immediate insights into sales, stock alerts, and
financial health.

## 1. Philosophy: "Sales & Profit" vs "Cash Flow"

Historically, systems mixed "Sales Profit" with "Operational Expenses" (Rent,
Light, Salaries) in the same view. This led to confusion, where a good sales day
could look like a loss just because a bill was paid.

**Adega Manager v2.0 separates these concerns:**

### The Command Center Logic (Sales Focus)

The Dashboard answers: _"How much did we sell today, and how much margin did
those products generate?"_

- **Financials (Use `v_sales_with_profit`)**:
  - **Revenue (Faturamento):** Sum of `final_amount` from non-cancelled sales.
  - **COGS (Custo Mercadoria):** Sum of `total_cost` (Quantity * Product Cost
    Price) for those sales.
  - **Gross Profit (Margem de Contribuição):** Revenue - COGS.
  - **Net Margin (%)**: `(Gross Profit / Revenue) * 100`.

> **Important:** Operational Expenses (Rent, Salary) are **NOT** subtracted
> here. They are tracked in the **Financial Module** (Expenses).

## 2. Architecture & Data Sources

### A. The View: `v_sales_with_profit`

Instead of complex joins in the frontend, we created a dedicated Database View
to serve the dashboard efficiently.

```sql
CREATE VIEW v_sales_with_profit AS
SELECT 
    s.id,
    s.created_at,
    s.final_amount,
    -- ... other fields
    (COALESCE(s.final_amount, 0) - (SELECT SUM(si.quantity * p.cost_price)...)) as total_profit
FROM sales s;
```

### B. The RPC: `get_daily_cash_flow`

This legacy function was repurposed to align with the new logic. Despite the
name "Cash Flow", in the Dashboard context, it returns:

- `income`: Daily Revenue.
- `outcome`: Daily COGS (Cost of sold goods).
- `balance`: Daily Profit (Margin).

## 3. Key Components

- **`useDashboardData.ts`**: The main hook. Orchestrates data fetching.
- **`DashboardContainer.tsx`**: Responsible for layout and passing data to
  presentation components.
- **KPI Cards**:
  - **Faturamento:** Total sales amount.
  - **Lucro Estimado:** Total Margin (Revenue - Product Costs).
  - **Ticket Médio:** Average value per sale.
  - **Vendas do Dia:** Count of completed sales.

## 4. Error Handling

The dashboard uses a granular error handling strategy
(`useDashboardErrorHandling.ts`). If the Financial chart fails, the Stock Alerts
might still load. We avoid a "White Screen of Death" by compartmentalizing
sections.
