# 01. UI/UX Guidelines & Component Standards

This document defines the visual language and interaction patterns for Adega
Manager (Premium ERP), strictly following the **"Stitch" Design System**.

## 1. The "Stitch" Design System (Glass & Neon)

The "Stitch" aesthetic is defined by deep dark backgrounds, high-quality
glassmorphism, and sharp neon accents (Green/Blue/Yellow) to guide user focus.

### A. Typography (Inter)

- **Font Family:** `Inter` (Google Fonts).
- **Weights:**
  - `Regular (400)`: Body text.
  - `Medium (500)`: Table headers, Labels.
  - `Bold (700)`: Value Displays (R$), Headings.
- **Rules:**
  - **No Monospace:** Avoid `font-mono` unless strictly needing alignment for
    hashed codes.
  - **No Display Fonts:** Avoid decorative fonts. `Inter` handles all display
    needs cleanly.

### B. Core Materials

- **Background (Base):** `bg-zinc-950` or `bg-slate-950`.
- **Surface (Glass):** `bg-[#121214]/60 backdrop-blur-xl`.
- **Border (Subtle):** `border border-white/5` (or `white/10` for higher
  contrast).
- **Shadow:** `shadow-2xl` (Logic: Deep depth).

### C. Neon Accents (Action Guidance)

We use specific colors to denote operational meaning:

- **🟡 Brand/Primary:** `bg-[#FACC15]` (Text: `zinc-950`). Used for "Select",
  "Pay", "Active Tab".
- **🟢 Emerald (Units):** `text-emerald-500` or `bg-emerald-500`. Used strictly
  for "Soltos", "Single Units".
- **🔵 Blue (Packages):** `text-blue-500` or `bg-blue-500`. Used strictly for
  "Caixas", "Bulk Packs".
- **🔴 Red (Debt/Fiado):** `text-red-500`. Used for "Fiado Pendente" or
  "Delete".

### D. Scroll Behavior (Technical Mandate)

For "Pill" lists or horizontal scroll containers (e.g., Category Tabs):

1. **NO Scrollbars:** Use utility `scrollbar-hide`.
2. **Desktop Responsiveness:** You **MUST** implement a custom Wheel Event
   listener to translate vertical scroll to horizontal.
   - **Crucial:** Use `{ passive: false }` to allow `e.preventDefault()`.
   - **Logic:** `el.scrollLeft += e.deltaY` (Direct assignment, NO
     `behavior: 'smooth'` to avoid input lag).

### E. Layout Patterns (New Standard)

1. **Premium Background (Mandatory):**
   - **Structure:** 3-Layer Stack (`bg-[#050505]` base + Texture opacity-25 +
     Vignette Gradient).
   - **Component:** Use `<PremiumBackground />` as the first child of the main
     page wrapper.
   - **Constraint:** Page wrapper must use `relative z-10` to layer content
     above the background.
   - **Reference:** `src/shared/ui/composite/PremiumBackground.tsx`.

2. **Fixed Dock Pagination:**
   - **Problem:** Pagination getting lost in long scrollable lists.
   - **Solution:** Isolate pagination from the scroll view.
   - **Implementation:**
     - Wrapper: `h-[100dvh] overflow-hidden`.
     - Dock: `absolute bottom-0 z-50` with `bg-gradient-to-t`.
     - Content: `pb-40` to ensure visibility behind the dock.

## 2. Navigation Patterns (Sidebar)

The Sidebar represents the primary "Stitch" navigation anchor.

- **Visuals:**
  - **Background:** Opaque Black (`!bg-[#09090b]`) to prevent underlying color
    bleed.
  - **Spotlight:** Subtle Yellow (`rgba(250, 204, 21, 0.12)`) radial tracking
    mouse movement.
  - **Active State:** Neon Yellow background (`bg-[#f9cb15]/10`) + Border +
    Shadow.

- **Structure & Behavior:**
  - **Expanded Mode (300px):**
    - Full padding (`px-3`).
    - Collapsible Groups (Accordion).
    - Floating User Card at the bottom.
  - **Collapsed Mode (60px):**
    - Reduced padding (`px-2`) to maximize space.
    - **Header:** "Store" Icon (`w-10 h-10 rounded-xl`).
    - **Links:** Forced `w-10 h-10` squared icons, perfectly centered.
    - **Footer:** Avatar-only view (User Card collapses).

---

## 3. Product Cards (Sales Grid)

For the POS/Shopping screen, we strictly follow the "Stitch" high-density
layout.

- **Grid Layout:**
  - **Gap:** `gap-3` (Tight).
  - **Cols:** `grid-cols-2` (Mobile) -> `xl:grid-cols-5` (Wide Screens).
  - **Padding:** `p-3` (Inside Cards) to avoid "fluff".

- **Card Styles:**
  - **Aspect Ratio:** `aspect-[3/4]` (Vertical Portrait).
  - **Interaction:** Zoom effect on image, floating "Add" button on hover.
  - **Badges:** Absolute positioning for "Stock" and "Price".

- **Virtualization (Performance):**
  - **Mandatory:** For lists > 50 items.
  - **Estimate:** `500px`.
  - **Measure:** Attach `measureElement` ref to row.

---

## 4. Modals & Overlays

**Rule of Thumb:** Never nest "Cards" inside "Modals" blindly.

- **BaseModal:** Should provide a `transparent` shell
  (`!bg-transparent !border-0`).
- **Inner Content:** The child component defines the `bg-zinc-950`, border, and
  rounded corners.
- **Close Button:** Hide the default Radix button (`[&>button]:hidden`) and
  implement a custom, absolutely positioned button inside the Inner Content for
  perfect alignment.

---

## 5. Feedback (`Sonner`)

- **Success:** `toast.success('Salvo com sucesso')` (Verde).
- **Error:** `toast.error('Erro ao conectar')` (Vermelho).
- **Posição:** Top Right.

---

## 6. Glossary

| Termo Proibido ❌ | Termo Correto ✅         | Contexto                             |
| :---------------- | :----------------------- | :----------------------------------- |
| Criar             | Lançar / Registrar       | Ações financeiras                    |
| Apagar            | Arquivar / Estornar      | Dados sensíveis (Soft Delete)        |
| Motoqueiro        | Entregador / Logística   | App de Entregas                      |
| Lucro             | Margem                   | Relatórios                           |
| Fiado / Pendura   | Conta Assinada / Crédito | Frente de Caixa (Interno vs Cliente) |
