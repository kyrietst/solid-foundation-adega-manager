# Audit Report: Customer Module & Address Standardization

## Executive Summary

The customer module is currently in a functional but fragmented state regarding
address management. While the database schema (`jsonb`) is ready for modern
structures, the application layer suffers from significant technical debt:
inconsistent UI components, loose typing in hooks, and redundant code paths.
This prevents compliance with the strict fiscal requirements (SEFAZ/Nuvem
Fiscal).

---

## 1. The Good (Assets)

- **Database Schema:** The `customers` table already uses a `jsonb` column for
  `address`. This is excellent and requires **zero migration** to support the
  new `FiscalAddress` structure.
- **Modern Stack:** The codebase uses `react-hook-form`, `zod`, and
  `tanstack-query`, providing a solid foundation for refactoring.
- **New Infrastructure:** We have already built strict strictures
  (`FiscalAddress`), a robust validation form (`FiscalAddressForm`), and a
  redundant lookup utility (`address-lookup.ts`). These are ready to be plugged
  in.

## 2. The Bad (Inconsistencies)

- **UI Fragmentation (3 Ways to do 1 Thing):**
  1. `CustomerForm.tsx` (Main): Has its own address inputs and schema.
  2. `NewCustomerModal.tsx`: Uses an inline, simplified form and schema.
  3. `EditCustomerModal.tsx`: Uses a _separate_ internal component
     (`forms/CustomerForm.tsx`) which is effectively a duplicate.
- **Type Mismatch:** `database.types.ts` defines `address` as `string | null`,
  while the database and application logic treat it as `json/any`. This
  effectively disables TypeScript's ability to catch errors.

## 3. The Ugly (Risks)

- **Type Safety Void:** The `useUpsertCustomer` hook accepts `address: any`.
  This allows _any_ shape of data to be written to the database. Currently, we
  have a mix of unstructured strings, partial objects, and nulls.
- **Fiscal Compliance Gap:** None of the existing forms enforce the `ibge` (City
  Code) field, which is **mandatory** for NFe/NFCe emission. Without addressing
  this, fiscal emission will fail for any new customer.
- **Dead Code:** `src/features/customers/components/forms/CustomerForm.tsx`
  appears to be an unnecessary duplicate of
  `src/features/customers/components/CustomerForm.tsx`.

---

## Action Plan (Refactoring)

1. **Unify UI:** Deprecate the fragmented address inputs and replace them
   universally with the new `<FiscalAddressForm />`.
2. **Enforce Logic:** Update `useUpsertCustomer` to strictly require
   `FiscalAddress` type for the address field.
3. **Clean Code:** Delete the duplicate `forms/CustomerForm.tsx` and refactor
   `EditCustomerModal` and `NewCustomerModal` to share a single, robust form
   component.
4. **Fix Types:** Update `database.types.ts` to `Json | null` (or stricter) for
   `customers.address`.
