# 06. Inventory Station Interface Standards

This document defines the interface standards for the "Inventory Stations"
(Simple View, Calibration, Transfer), creating a "Pro" and "Tactical"
environment for high-frequency stock operations.

## 1. The "Station" Concept

Inventory modals are not just "forms"; they are **Work Stations**. They must
convey authority, precision, and system connectivity.

### A. Station Header (Unified)

All inventory modals must follow the **Station Header** pattern:

1. **Title:**
   - **Font:** `text-xl` or `text-2xl`.
   - **Weight:** `font-bold` or `font-semibold`.
   - **Case:** `UPPERCASE` (e.g., "ESTAÇÃO DE AJUSTE DE ESTOQUE").
   - **Icon:** Left-aligned, matching the semantic color (Emerald for Stocks,
     Cyan for Transfer).

2. **Subtitle (Context):**
   - **Style:** `text-zinc-400 font-medium text-sm`.
   - **Dynamic Data:** The target product/entity name must be highlighted in
     `text-zinc-200` or `text-white`.
   - **Example:** "Gerenciamento tático de inventário para: **Coca-Cola 2L**".

3. **System Status Badge (Chip):**
   - **Purpose:** Replaces old "SYS_ONLINE" text badges.
   - **Style:** `rounded-full bg-emerald-500/10 border border-emerald-500/20`.
   - **Indicator:** `w-2 h-2 bg-emerald-500 animate-pulse`.
   - **Text:** `text-[10px] font-bold tracking-wide text-emerald-500`.
   - **Content:** "SISTEMA ONLINE".

### B. Typography & Data Display

- **No "Digital Clock" Aesthetics:** Do **NOT** use `font-mono` for quantities,
  prices, or labels.
  - Use `Inter` (sans-serif) with high weight (`font-bold`, `font-black`) for
    big numbers (e.g., Stock Counters).
- **Code Exceptions:** `font-mono` is PERMITTED ONLY for:
  - Barcodes / EANs.
  - SKUs / Hash IDs.
  - Fiscal Codes (NCM, CFOP).

### C. Actions & Feedback (The "Glow")

Primary constructive actions must feel "energized".

- **Primary Button:**
  - **Bg:** `bg-emerald-600 hover:bg-emerald-500`.
  - **Shadow:** `shadow-[0_0_20px_rgba(16,185,129,0.3)]` (The Glow).
  - **Hover:** Increases shadow spread and brightness.
  - **Animation:** Internal "Shimmer" effect on hover
    (`animate-[shimmer_1.5s_infinite]`).
  - **Text:** `UPPERCASE`, `font-bold`, `tracking-wide`.

## 2. Localization (Strict PT-BR)

All visible UI elements must be in **Brazilian Portuguese**.

- **Banned Terms (English):**
  - `Packages` ❌ -> `Pacotes` ✅
  - `Units` ❌ -> `Unidades Soltas` ✅
  - `Pks` ❌ -> `Pcts.` ✅
  - `Capacity` ❌ -> `Capacidade` ✅
  - `Overview` ❌ -> `Visão Geral` ✅
  - `Specs` ❌ -> `Especificações` ✅
  - `Identity` ❌ -> `Identidade` ✅

## 3. Specific Modal Configurations

### A. SimpleProductViewModal

- **Goal:** Quick tactical overview.
- **Structure:** 3-Column Grid (Identity, Specs, Intelligence).
- **Header:** Standard Station Header.
- **Footer:** "Edit" button with Emerald Glow.

### B. StockAdjustmentModal (Calibration Station)

- **Goal:** Precise stock correction.
- **Inputs:** Dual inputs (Packages / Loose) with `+/ -` controls.
- **Analysis:** "Divergence Analysis" column showing live Delta.
- **Action:** "CONFIRMAR AJUSTE" (Emerald Glow).

### C. TransferToHoldingModal (Transfer Station)

- **Goal:** Moving stock between sectors (Store -> Holding).
- **Metaphor:** "Bridge" layout (Origin -> Bridge Inputs -> Destination).
- **Theme:** Cyan/Violet accents (Logistical movement).
- **Badge:** "Logística Online".
- **Action:** "REALIZAR TRANSFERÊNCIA" (Emerald/Cyan Glow).
