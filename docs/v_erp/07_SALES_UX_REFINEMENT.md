# 07. Sales Module UX/UI Refinement (Jan 17, 2026)

> [!NOTE]
> **Context:** This refactor focuses on the "Recent Sales" (`RecentSales.tsx`)
> and "Sales Page" (`SalesPage.tsx`) components to unify the visual experience
> between the Point of Sale (POS) and the Management views.

## 1. Visual Consistency & Layout

### A. Full-Width Standardization

- **Goal:** Remove the visual disconnect between the POS (Full Width) and the
  History/Charges tabs (Fixed Width).
- **Action:** Removed `max-w-7xl`, `mx-auto`, and `container` constraints from
  `SalesPage.tsx` wrappers for `appMode === 'recent'` and
  `appMode === 'charges'`.
- **Result:** The data tables now stretch to the edges of the screen, utilizing
  100% of the available real estate, matching the immersive POS experience.

### B. Header Simplification

- **Goal:** Eliminate redundant noise. The Tab switcher itself acts as the "Page
  Title".
- **Action:** Removed the explicit `<h2>Histórico de Vendas</h2>` and Back
  Buttons from the top of the History/Charges views.
- **Benefit:** Cleaner interface, more vertical space for data, and reduced
  cognitive load.

### C. Background Unification

- **Goal:** Fix the jarring transition from "POS Gray" to "History Black".
- **Action:** Removed specific `bg-background-dark` overlays from the History
  tabs.
- **Result:** The system-wide `<PremiumBackground />` now shines through all
  tabs consistent branding.

## 2. "Smart Row" Component (`RecentSales.tsx`)

The list of sales was refactored from a generic card list to a partial "Glass"
table row with high data density.

### A. Semantic Styling

- **Store/Pickup Sales:**
  - **Color:** Emerald (Green).
  - **Icon:** `Store` with Emerald Glow.
  - **Logic:** Indicates "Money In / Done".
- **Delivery Sales:**
  - **Color:** Amber (Yellow/Orange).
  - **Icon:** `Truck` with Amber Glow.
  - **Logic:** Indicates "Pending Logistics / Service".
  - **New Data Points:** Now explicitly displays **Delivery Fee** (`+ R$ 5,00`)
    and **Neighborhood** in the row metadata.
- **Cancelled Sales:**
  - **Color:** Red/Destructive.
  - **Icon:** `Ban`.
  - **Visuals:** Strikethrough text + Red background wash.

### B. Glassmorphism Architecture

- **Row Container:** `bg-zinc-900/40` (40% Opacity) + `border-white/5` (Subtle
  stroke).
- **Hover State:** `bg-zinc-900/60` (Darkens on interaction).
- **Typography:** Enforced `Inter` with strict hierarchy (Primary White,
  Secondary Zinc-500).

## 3. Maintenance Guidelines

### Do's

- **Keep it Full Width:** Do not re-introduce `container` classes to
  `RecentSales`.
- **Use Semantic Colors:** If adding a new sale type (e.g., "Food App"), define
  a distinct color palette (e.g., Purple/Pink) consistent with the Icon Box and
  Text.
- **Preserve Transparency:** Always use `bg-zinc-900/XX` opacity. Never use
  solid `bg-zinc-900`.

### Don'ts

- **No Page Titles:** Do not add `<h1>` headers back to these views.
- **No Direct Queries:** Fetch data via `useSales` hook only. No
  `supabase.from()` in UI.
