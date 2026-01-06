# Module: Sales & Fiscal (PDV)

This module handles the core revenue generation and legal compliance of the ERP.

## 1. Sales Flow (PDV)

The Point of Sale (PDV) is designed for speed and reliability.

### Key Components

### Key Components

- **Cart:** Manages items in memory. Handles "Delivery" toggle and "Fiado"
  logic.
- **Checkout:** Selects Payment Method (hidden for Fiado) and Customer.
- **Submission:** Calls `process_sale` RPC.

### Sales Types

1. **Presential (Standard):** Immediate payment (Pix/Cash/Card).
2. **Delivery:** Requires Address + Delivery Fee.
3. **Fiado (Credit):** Payment Status = `pending`. Requires Customer.
4. **Fiado + Delivery:** Hybrid mode. Status `pending`, Type `delivery`.

### Critical Rules

1. **Atomic Transactions:** Never save a sale header without items. The RPC
   handles this.
2. **Stock Validation:** The RPC prevents negative stock (unless overridden by
   Admin).
3. **Fiscal Trigger:** The Frontend detects the sale completion and immediately
   triggers the `fiscal-handler` if `is_fiscal=true`.

## 2. Fiscal Implementation (NFC-e)

Integrated with **Nuvem Fiscal** via Supabase Edge Function.

### Architecture

- **Edge Function:** `fiscal-handler` (Deno).
- **Trigger:** Manual (Button) or Auto (Post-Sale Hook).
- **Credentials:** `NUVEM_FISCAL_CLIENT_ID` / `SECRET` (Env Variables).

### Specific Logic

- **PIX Payments:** Mapped to code `99` (Outros) internally to avoid SEFAZ Error
  391 (Card Data Required).
- **CPF:** Required for values > R$ 10.000 (configurable) or upon customer
  request.

## 2.1 Settlement (Fiado / Cobranças)

The system handles "Accounts Receivable" via the **Settlement Flow**.

## 4. Payment Flows

### A. Immediate Payment (Pix, Card, Cash)

- Status: `paid` (upon creation).
- Cash Flow: Impact immediate (`paid_at` = `created_at`).

### B. Fiado (Store Credit / Pending)

- **Status:** `pending` (FOREVER until paid).
- **UI Representation:**
  - **Badge:** "Pendente" (Yellow).
  - **Type Line:** "Presencial Fiado" or "Delivery Fiado" (Red Text + Icon).
  - **Payment Method:** "Fiado".
- **Settlement:**
  - Action: "Receber Pagamento" (via Modal).
  - RPC: `settle_payment(sale_id, payment_method_id)`.
  - Result: Status updates to `paid`, `paid_at` set to NOW.
- **Financial Impact:**
  - Does NOT appear in "Received" (Income) until settled.
  - Appears in "A Receber" (Receivables).

## 5. Fiscal Integration (Nuvem Fiscal)

- **Trigger:** Automatic upon sale confirmation (if properly configured).
- **Handler:** Edge Function `fiscal-handler`.
- **Status:** `fiscal_issuer_status` (pending, authorized, error).

## 6. Data Structure

### Table: `sales`

- `id`: UUID (Primary Key)
- `fiscal_status`: `pending`, `authorized`, `rejected`, `canceled`.
- `fiscal_key`: The 44-digit NFe key (once authorized).
- `payment_method_code`: The mapped code sent to SEFAZ.

### Table: `sale_items`

- Contains snapshot of `unit_price` and `cost_price` at moment of sale.

## 4. Troubleshooting

- **Error 391 (SEFAZ):** "Dados do cartão...". Fix: Ensure PIX/Cash uses
  `tPag=99` or correct code generally mapping to "Outros" or "Dinheiro", NOT
  Card.
- **Error 400 (Edge Function):** Check if `store_settings` has valid Issuer data
  (CNPJ, Address).
