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
## 2. Technical Architecture

The Dashboard is **100% Data-Driven**. No mock data is allowed.

### A. Data Fetching (Hooks & RPCs)

We use `TanStack Query` to manage server state with aggressive caching (5min) to prevent database overload.

| Hook | RPC / Source | Purpose |
| :--- | :--- | :--- |
| `useSalesKpis` | `get_daily_cash_flow` | Revenue, Orders, Average Ticket (Current vs Previous). |
| `useInventoryKpis` | `get_inventory_financials` | **Stock Health Engine**: Valuation, Top Category, Rupture %. |
| `useLowStockAlerts` | `get_low_stock_products` | **Restock Logic**: Items below min stock (Category-based). |
| `useSalesChart` | `get_sales_chart_data` | Daily revenue/orders breakdown (MTD). |

### B. Logic: "Restock Alerts"

The system uses a **Hybrid Rule Engine** to decide if a product needs restocking:

1.  **Product Override:** Does the product have a specific `minimum_stock` set?
    - **YES:** Use that number.
    - **NO:** Fallback to **Category Defaults** (e.g., "Beer" requires 20 packages).
2.  **Severity Calculation:**
    - **Critical (Red):** Zero stock (Rupture).
    - **Warning (Yellow):** Stock > 0 but below minimum.
    - **Healthy (Green):** Stock above minimum.

*(Logic Source: Postgres Function `get_low_stock_count` & `get_low_stock_products`)*

### C. Logic: "Stock Health"

Evaluates the quality of the inventory investment.

1.  **Top Category:** Identifies the category with the highest capital tied up (`SUM(stock * cost)`).
2.  **Health Score (Rupture Logic):**
    - Calculated as: `(Items with Zero Stock / Total Active Items) * 100`
    - **< 5%:** Excellent (Green)
    - **< 10%:** Good (Blue)
    - **< 20%:** Warning (Yellow)
    - **>= 20%:** Critical (Red)

*(Logic Source: Postgres Function `get_inventory_financials`)*

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
```
