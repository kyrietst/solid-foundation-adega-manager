# System Overview & Architecture

**Project:** Adega Manager ERP (v3.0 - Professional Standard) **Stack:** React
19, TypeScript, Supabase (Postgres + Edge Functions), TanStack Query.

## 1. Vision & Philosophy

We are building a **Professional ERP**, interacting with SEFAZ and Nuvem Fiscal.

- **Single Source of Truth:** The Database (Supabase) is the authority. Frontend
  is just a view.
- **Zero Trust:** Backend (RPCs/Edge Functions) validates everything. Frontend
  validation is for UX only.
- **Fiscal First:** Sales are designed to be fiscal-compliant from day one.
- **Integrated Logistics:** Delivery and "Fiado" (Credit) are core operational
  flows, not plugins.

## 2. Technical Stack

| Layer          | Technology           | Usage                                  |
| :------------- | :------------------- | :------------------------------------- |
| **Frontend**   | React 19 + Vite      | UI Components, State Management.       |
| **Styling**    | Tailwind + Shadcn UI | Design System, Consistency.            |
| **State**      | TanStack Query       | Server State (Caching, Invalidations). |
| **Backend**    | Supabase Postgres    | RLS, Triggers, RPCs (Business Logic).  |
| **Serverless** | Deno Edge Functions  | Fiscal Integration, Heavy Validations. |

## 3. Core Architecture

### A. RPC-Centric Write Operations

### A. RPC-Centric Write Operations

We **DO NOT** use `supabase.from('table').insert()` in the frontend for complex
operations (Sales, Inventory). Instead, we call PostgreSQL Functions (RPCs):

- `process_sale(...)`: **The Master Function**. Handles Presential, Delivery,
  Fiado, and Fiscal triggers.
- `create_inventory_movement(...)`: Centralizes stock logic.
- `settle_payment(...)`: Handles debt settlement (Fiado -> Paid) with financial
  atomicity.

### B. Read-Only Audit Logs

Critical modules like **Inventory Movements** are designed as **Read-Only Audit
Logs** on the main screen.

- Manual adjustments are forced into specific contexts (e.g., "Product Card" >
  "Adjustment") to ensure intent capture.

### C. Fiscal Integration

- **Vendor:** Nuvem Fiscal (API).
- **Security:** Credentials stored in Supabase Secrets.
- **Flow:** Frontend -> RPC (Sale) -> Edge Function (Fiscal Emission) -> API.

## 4. Directory Structure

- `src/features/`: Domain-driven modules (Sales, Inventory, CRM, Reports,
  Fiscal).
- `src/core/`: Singleton services (Supabase Client, Types).
- `src/shared/`: Reusable primitives (Buttons, Inputs, Dialogs).
