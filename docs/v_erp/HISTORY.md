# Project History & Changelog

## v2.0 GOLD: Production Ready - _Jan 08, 2026_

**Status:** STABLE RELEASE **Focus:** Reliability, Consistency, and Operational
Flow.

### 🚀 Major Deliverables

- **Financeiro 100% Cash Basis (Regime de Caixa):**
  - Alinhamento total entre gráficos de fluxo de caixa e listagens de despesas.
  - Implementação de filtro rígido `payment_status = 'paid'` e data `paid_at`
    para visualização real de saídas.
- **Expenses 2.0:**
  - Introdução de **Templates Recorrentes** (`ExpenseTemplatesModal`) para
    agilizar lançamentos frequentes.
  - Fluxo de **Quick Pay** para quitação rápida de despesas pendentes.
- **Fiscal Hardening:**
  - Integração robusta com Nuvem Fiscal via RPCs seguros.
  - Snapshot de dados fiscais (Endereço/Cliente) no momento da venda (`sales`
    table snapshot).

### 🛠 Technical Debts Eliminated

- **Paridade de Banco de Dados:** Sync total entre DEV e PROD.
- **Type Safety:** TypeScript Strict Mode ativado e validado.
- **Cleanup:** Remoção de código morto (`useExpenseKpis`, componentes fantasmas)
  e artefatos de documentação temporária.

---

## v2.2: Real Financials & Fiado Logic - _Jan 2026_

**Goal:** Integrity of Financial Data (Cash Flow vs. Accrual) and "Fiado" (Store
Credit) Refinement.

- **Financial Engine (Real Cash Flow):**
  - **RPC `get_real_cash_flow`:** Implemented a dedicated database function to
    calculate Cash Flow based on _Payment Date_ (`paid_at`), not _Sale Date_
    (`created_at`).
  - **Expenses Integration:** Cash outflows now strictly follow the expense
    `date`.
  - **UI/Charts:** Dashboard graphs updated to reflect the new "Real" engine,
    correcting timezone offsets and ensuring visual accuracy.
- **Fiado (Store Credit) Refinement:**
  - **Fixed Status Logic:** Fiado sales now correctly stay as `pending`
    indefinitely until settled.
  - **UI Clarity:** "Concluído" badge removed for Fiado. "Tipo" line now
    explicitly shows "Presencial Fiado" or "Delivery Fiado" in **Red** to
    indicate pending debt.
  - **Settlement RPC:** Deployed `settle_payment` to allow converting a pending
    Fiado sale into a paid sale.
- **Bug Fixes:**
  - **Error 400 on Fiado:** Fixed invalid UUID payload when selecting Fiado.
  - **Chart Divergence:** Fixed timezone issue where daily bars appeared shifted
    by one day.

## v2.1: Professional ERP (Phase 4.1 "Realism") - _Jan 2026_

**Goal:** Elimination of all "Mock Data" and "Legacy Logic". Alignment of
Dashboard Math.

- **Database:**
  - Created `v_sales_with_profit` view to act as the single source of truth for
    margin calculations.
  - Synced Development and Production schemas.
- **Dashboard:**
  - **Unified Math:** Dashboard now explicitly shows "Product Margin" (Revenue -
    COGS) instead of "Cash Flow" (Revenue - Operational Expenses). This solved
    the "Negative Profit" confusion.
  - **Dead Code:** Removed `useExpenseKpis` and "Ghost Cards".
- **Cleanup:**
  - Strict TypeScript enforcement.
  - Removed unused API hooks.

## v2.0: Solid Foundation - _Dec 2025_

**Goal:** Establish clean architecture and fiscal integration.

- **Architecture:** Feature-based folder structure.
- **Fiscal:** Integration with Nuvem Fiscal (NFC-e).
- **Security:** RLS (Row Level Security) enabled on all tables.
