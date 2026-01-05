# Engineering Guidelines

> [!IMPORTANT]
> The "AdegaManager ERP" is an Enterprise-Grade system. We value **Reliability**
> over speed of delivery.

## 1. Zero Trust Architecture

The Frontend is "Insecure". Never trust data coming from it.

- **Validation:** All critical logic (Sales, Stock, Money) resides in **Postgres
  RPCs** or **Edge Functions**.
- **Frontend Role:** Only displays data and captures intent.

## 2. Database Integrity

- **SSOT:** The Database is the Single Source of Truth.
- **Parity:** `adega-dev` MUST match `adega` (prod) schema exactly.
- **Migrations:** All DB changes must go through `.sql` migration files.

## 3. coding Standards

### A. No Logic in UI

- **Bad:** `if (product.stock < 0) alert('Error')` inside a generic Button.
- **Good:** `const { sellProduct } = useSales()` where the hook handles
  validation logic.

### B. Supabase Client Isolation

- To avoid TypeScript "Deep Instantiation" errors, cast `supabase as any` inside
  Hooks, then explicity cast the return.
- **File:** `src/core/api/supabase/client.ts` is the only initialized client.

### C. Folder Structure

- `src/features/[feature_name]/components`: Dumb UI.
- `src/features/[feature_name]/hooks`: Smart Logic.

## 4. UI/UX "Premium"

- **Feedback:** Every action needs a Toast (Success/Error).
- **Loading:** Use Skeleton loaders, never blank screens.
- **Motion:** Use Framer Motion for smooth transitions (entering/leaving).
