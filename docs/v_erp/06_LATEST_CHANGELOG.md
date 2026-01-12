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

## 3. Next Steps (Roadmap)

1. **Dashboard Refinement:** Apply virtualization to the "Recent Sales" list if
   it grows too large.
2. **Mobile Optimization:** Further refine touch targets for the "Stitch" grid
   on small phones (<375px).
3. **Fiscal Automation:** Enable auto-emission background jobs for authorized
   clients.
