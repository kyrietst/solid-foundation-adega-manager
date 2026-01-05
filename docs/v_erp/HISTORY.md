# Project History & Changelog

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
