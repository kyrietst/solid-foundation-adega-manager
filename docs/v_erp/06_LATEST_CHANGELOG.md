# 06. Latest Changelog (January 2026)

**Milestone:** "Stitch" UI Refactor & Core Stabilization

## 1. Major Features & Visuals

### A. The "Stitch" Design System

- **Philosophy:** High-density, professional glassmorphism with neon operational
  cues.
- **Components Refactored:**
  - **Product Grid:** 3/4 aspect ratio, gold pricing, floating actions.
  - **Modals:** Single-layer glass, removed "double-card" borders, custom close
    buttons.
  - **Sidebar:** Standardized icons and collapse behavior.
- **Scroll Behavior:** Enforced `overflow-x-auto` with generic
  `scrollbar-hide` + **Manual Wheel Event** listeners for desktop horizontal
  scrolling.

### B. Sales & Checkout

- **Pré-venda:** New flow allowing stock reservation without immediate payment.
- **Fiado/Pending:** Hardened validation (Customer Mandatory) and clear UI
  badging (Red/Yellow).
- **Delivery:** Integrated address type flow (Presencial vs Delivery toggle).

### C. Performance (Virtualization)

- **Problem:** Grids with 500+ items caused DOM lag.
- **Solution:** Implemented `@tanstack/react-virtual` in `ProductsGrid.tsx`.
- **Result:** Constant frame rate regardless of catalog size.

---

## 2. Critical Fixes (The "War Code")

### A. Horizontal Scroll (Category Tabs)

- **Issue:** Desktop users couldn't horizontally scroll tabs with the mouse
  wheel.
- **Fix:** Removed browser default smooth scrolling (`behavior: smooth`) which
  caused fighting with high-frequency wheel events. Implemented direct
  `scrollLeft` mutation with `{ passive: false }` event listeners.

### B. SEFAZ Error 391

- **Issue:** PIX payments rejected as "Missing Card Data".
- **Fix:** Explicitly mapped PIX to code `17` (or safe fallback) in the
  `fiscal-handler` Edge Function to bypass card validation groups.

### C. Database Parity

- **Action:** Synchronized `adega_dev` and `adega_prod` schemas.
- **Security:** Enabled RLS on all sensitive tables and fixed Foreign Key
  constraints on `sale_items`.

---

### D. Sidebar Polish & Hotfixes (Jan 8, 2026)

- **Complete Stitch Redesign:**
  - **Opaque Background:** Enforced `!bg-[#09090b]` to eliminate "dirty" color
    bleeding from legacy gradients.
  - **Neon Aesthetics:** Replaced all hover/active states with Neon Yellow
    (`#f9cb15`) glowing effects.
  - **Dynamic Padding:** Smart padding (`px-3` vs `px-2`) to prevent icon
    clipping in collapsed mode.
- **Collapsible UX:**
  - **Squared Icons:** Collapsed icons now force a `w-10 h-10 rounded-xl` shape
    for perfect alignment.
  - **Floating User Card:** Footer adapts from full card (Expanded) to centered
    Avatar-only (Collapsed).
  - **Store Icon:** "Cazinha" icon for Sidebar toggle when collapsed.

### E. Delivery 2.0: Interactive Kanban (Jan 8, 2026)

- **Realtime Engine:** Removed polling (2s) in favor of **Supabase Realtime**
  Subscriptions. Updates are now instant across all devices.
- **Drag-and-Drop:** Implemented full interactive board using `@dnd-kit`.
  - **Draggable Cards:** Fluid movement with visual feedback using
    `PointerSensor`.
  - **Droppable Columns:** "Magnetic" drop zones that trigger optimized status
    updates.
- **Type Hygiene:** Centralized all Delivery types in
  `src/features/delivery/types/index.ts` to prevent circular dependencies.
- **Zero Errors:** Eliminated all IDE errors by strictly typing RPC responses
  (e.g. `get_delivery_metrics`).

### F. Delivery Refinements & KPI Hygiene (Jan 8, 2026)

- **Visual Standardization:**
  - **Premium Background:** Applied `<PremiumBackground />` to Delivery screen
    (`z-10` relative stack).
  - **Kanban Visibility:** Updated columns to `bg-[#121214]/40 backdrop-blur-md`
    to fix contrast against dark texture.
  - **Header Polish:** Removed search bar, translated "System Online".
- **Data Hygiene (Zero Fake Data):**
  - **Neutralization:** Hardcoded KPI metrics (Growth %, Courier Counts,
    "Atrasados") were set to "0%" or removed.
  - **Reality Check:** Only real values (Total Orders, Revenue) are now
    displayed.

### G. Dashboard & Stock Health Audit (Jan 8, 2026)

- **Mock Data Elimination:**
  - Removed all hardcoded values ("Vinhos Tintos", "Excelente") from Dashboard.
  - Implemented **Real Stock Health Logic**:
    - **Top Category:** Auto-calculates category with highest invested capital
      (e.g., "Descartáveis" with 35%).
    - **Rupture Score:** Auto-calculates percentage of zero-stock items (Score <
      5% = Excellent, > 20% = Critical).
- **Smart Restock Alerts:**
  - Logic upgraded to respect **Category Rules** (e.g. Beer > 20 boxes) AND
    **Product Overrides**.
  - Dynamic UI: Card changes color (Green/Yellow/Red) based on severity.
- **RPC Upgrades:**
  - `get_inventory_financials`: Now returns granular Health/Category data.
  - `get_low_stock_count`: Optimized for real-time counting respecting legacy
    overrides.

---

### H. Checkout & Printing Flow Audit (Jan 8, 2026)

- **Audit Completed:** Mapped the entire checkout -> printing pipeline to
  prepare for "Hybrid Mode" (Fiscal/Non-Fiscal).
- **Findings:**
  - **Trigger:** `CheckoutDrawer` -> `processSale`.
  - **Printing Engine:** Currently relies on `window.print()` with strict CSS
    (`thermal-print.css`) that hides everything except `.print-area`.
  - **NFC-e Gap:** current implementation opens a PDF link in a new tab. **Next
    Step:** We must implement an HTML-based NFC-e renderer (DANFE Simplified) to
    use the existing thermal printer CSS, bypassing the browser's PDF viewer for
    seamless printing.

### I. Typography Standardization (Jan 8, 2026)

- **Font Unification:** Enforced **Inter** as the single source of truth for
  typography.
- **Cleanup:**
  - Purged conflicting `font-display` and `font-mono` usages in Customer
    modules.
  - Updated `tailwind.config.ts` to ensure `font-sans` maps strictly to Inter.
  - Result: Consistent, premium readability across all dashboard KPIs and
    tables.

---

### J. Split Payment Implementation (Jan 12, 2026)

- **Feature:** Enabled multi-method payments (e.g., Cash + Credit) in a single
  sale.
- **Frontend:**
  - Added "Dividir Pagamento" switch in `CheckoutDrawer`.
  - Implemented dynamic payment list with `SUM` validation vs Total.
- **Backend:**
  - Created `sale_payments` table (1:N).
  - Updated `process_sale` RPC to accept `jsonb` array.
  - **Robustness:** Fixed critical "Null Enum" bug (P0001) by implementing
    `COALESCE` fallbacks for legacy `payment_method` (text) and
    `payment_method_enum` columns.
- **Fiscal:** `fiscal-handler` updated to map multiple payments to NFC-e
  `detPag` array (e.g. `tPag: 01` + `tPag: 03`).

---

### K. Fiscal Authorization & MEI Strategy (Jan 13, 2026)

- **Authorization Success:** First real NFC-e authorized (Green status) via
  Nuvem Fiscal.
- **MEI Simplification Protocol:**
  - **Issue:** SEFAZ rejected standard ST codes (CFOP 5405 / CSOSN 500) for MEI
    issuers with "CRT=4".
  - **Solution:** Implemented a backend translation layer that forces **CFOP
    5102** and **CSOSN 102** for all items in the XML payload.
  - **Benefit:** Ensures 100% approval rate without corrupting the internal
    database (which maintains 5405 for inventory/cost control).
- **Data Integrity (Hard Reset):**
  - Audited 583 products.
  - Mass-updated NCM/CEST codes for 22 categories using a SQL strategy to fix
    NULL values.
  - Corrected outliers (Non-Alcoholic Beer, Tonic Water).

---

### L. Sales Cancellation & Stock Restoration (Jan 13, 2026)

- **RPC Implementation:** `cancel_sale` function created to handle atomic
  cancellations.
- **Stock Restoration:**
  - **Guaranteed Return:** Cancellation now iterates through all items and
    triggers `create_inventory_movement` with type `'return'` and **positive**
    quantity.
  - **Traceability:** Logs the movement as a correction linked to the sale.
- **Frontend Sync:** UI now disables "Delete" (Hard Delete) and uses "Cancel"
  (Soft Delete) with visual integrity (Strikethrough + Badge).
- **Fiscal Safoguard:** RPC checks `invoice_logs` and prevents cancellation if a
  valid NFC-e exists (Optional/Configurable).

---

### M. Customer Metrics Automation (Jan 13, 2026)

- **Problem:** Customer "Total Spent" and "Last Purchase" were obsolete (zeroed)
  because the legacy View `v_customer_stats` was missing and the column
  `lifetime_value` had no updater.
- **Solution (Performance):**
  - **Database Trigger:** Implemented `trg_update_customer_metrics` on `sales`
    table. It recalculates metrics only for the affected customer on every
    Insert/Update/Delete.
  - **Backfill:** Executed a one-time script into `adega_prod` and `adega_dev`
    to regenerate historical data.
- **Result:** Dashboard now reads directly from `customers` table (O(1)) instead
  of calculating aggregates on the fly.

---

### N. Database Parity & Security Synchronization (Jan 13, 2026)

- **Audit Scale:** Strict comparison between `adega` (Prod) and `adega-dev`
  (Test).
- **Synchronization Executed:**
  - **Schema:** Added missing columns to `batch_units` (Traceability) and
    `store_settings` (Fiscal) in Dev to match Prod.
  - **Security (Promoted to Prod):** Promoted `validate_stock_update` trigger
    from Dev to Prod.
    - **Impact:** Prevents ANY manual update to `stock_quantity`. Stock can ONLY
      be changed via `create_inventory_movement` RPC (Audit Trail).
- **Standard:** "Zero Trust" policy now enforced identically in both
  environments.

### O. Critical Hotfixes & Stability (Jan 13, 2026)

- **RPC Overloading Resolution (Error PGRST203):**
  - **Issue:** Database contained 4 conflicting versions of `process_sale` due
    to split-payment migrations.
  - **Fix:** Dropped all versions and re-applied the single authoritative RPC.
- **Missing Table Restoration (Error P0001):**
  - **Issue:** `sale_payments` table was missing in Production despite being
    referenced by the RPC.
  - **Fix:** Created table with strict RLS policies and FK constraints to
    `sales` and `payment_methods`.
  - **Result:** Split Payment flow now fully operational in Production.

---
### P. Receipt Printing Intelligence (Jan 13, 2026)
- **Dynamic Data Injection:**
  - **Issue:** Receipt header had hardcoded placeholders (e.g. "Av do Taboão").
  - **Fix:** Implemented `fetchStoreSettings` in `useReceiptData`. Now printing
    pulls real-time Business Name, CNPJ, and Address from the database.
- **Visual Compliance:**
  - Restored "ADEGA ANITA'S LTDA" header for formal presentation.
  - Implemented `formatCnpj` utility for correct masking (`XX.XXX.XXX/0001-XX`).
### Q. Global "Mock Data" Extermination (Jan 13, 2026)
- **Audit Scope:** Full `src/` scan for "Lorem", "9999-9999", "admin@teste".
- **Result:**
  - Confirmed 100% of production UI is data-driven.
  - Login screen (`Auth.tsx`) confirmed clean of debug credentials.
  - No residual hardcoded phone numbers or generic addresses in user-facing code.
---

### R. Customer Intelligence & Receipt Layout (Jan 16-17, 2026)

- **Smart Link (Anti-Duplication):**
  - **Problem:** "Quick Customer" allowed multiple customers with the same
    phone, fragmenting history.
  - **Solution:** `create_quick_customer` RPC updated with "Find or Create"
    logic. Frontend `QuickCustomerCreateModal` detects existing phones on blur
    and BLOCKS duplicates.
  - **Result:** Zero duplicate phones allowed. Users are forced to link to the
    existing profile.

- **Status Report (Receipts):**
  - **Delivery Layout:** Relocated Delivery Info to the **Header** (Fiscal) for
    better courier visibility.
  - **Address Logic:** Updated parser to handle both Portuguese (`logradouro`)
    and English (`street`) keys from CEP API.
  - **Fiscal Footer:** Cleaned up visual clutter (asterisks) and ICMS warnings.

### S. Sales UI Refinement & Standardization (Jan 17, 2026)

- **Layout Unification:**
  - **Full Width:** Removed all `container` constraints from History/Charges
    tabs to match POS layout.
  - **Standardized Backgrounds:** Removed solid black overlays to expose shared
    `PremiumBackground`.
  - **Header Cleanup:** Removed redundant page titles ("Histórico de Vendas")
    for a streamlined dashboard feel.
- **Recent Sales "Smart Row":**
  - **Fiado Alert:** Implemented high-priority **Rose/Red** styling for
    'Pending' sales, ensuring debts are visually distinct from active
    delivery/store operations.
  - **Semantic Coloring:** Implemented Ember (Delivery) vs Emerald (Store) vs
    Red (Cancel) color coding for instant recognition.
  - **Delivery Visibility:** Added explicit Delivery Fee and Neighborhood
    display in the row.
  - **Glassmorphism:** Adjusted row transparency to `bg-zinc-900/40` for better
    contrast.
- **Documentation:** Created `docs/v_erp/07_SALES_UX_REFINEMENT.md` as the guide
  for these changes.
