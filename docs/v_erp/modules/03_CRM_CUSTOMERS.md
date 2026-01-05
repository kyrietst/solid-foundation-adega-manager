# Module: Customers (CRM)

This module manages customer data, purchase history, and fiscal addressing.

## 1. Overview

The CRM is the foundation for:

- **Sales:** Identifying the purchaser.
- **Fiscal (NFC-e):** Providing valid CPF/CNPJ and Addresses (IBGE).
- **Loyalty:** Tracking purchase habits.

## 2. Architecture

- **Unified Form:** `CustomerForm.tsx` handles both Create and Edit.
- **Hook:** `use-crm.ts` manages API calls and sanitation.
- **Types:** Strict interface `CustomerProfile`.

## 3. Fiscal Requirements

To emit an NFC-e (Nota Fiscal), the customer record must have:

- **Tax ID:** CPF (11 digits) or CNPJ (14 digits).
- **Address:** Complete `FiscalAddress` object, especially `codigo_municipio`
  (IBGE 7-digit code).

### Address Schema (JSONB)

Stored in `customers.address` column, but enforced via Zod in frontend:

```typescript
interface FiscalAddress {
  cep: string;
  logradouro: string;
  numero: string; // Mandatory for NFe
  bairro: string;
  codigo_municipio: string; // Critical
  uf: string;
}
```

## 4. UI/UX

- **Profile:** `/customers/:id` shows "Overview" (Stats) and "Purchases"
  (History Sales).
- **Simplified Tabs:** We removed complex tabs (Insights, AI) to focus on speed
  and clarity.
