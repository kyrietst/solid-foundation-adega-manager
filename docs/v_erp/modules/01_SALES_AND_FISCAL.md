# Module: Sales & Fiscal (PDV)

This module handles the core revenue generation and legal compliance of the ERP.

## 1. Sales Flow (PDV)

The Point of Sale (PDV) is designed for speed and reliability.

### Key Components (V4.0 Stitch Redesign)

- **Sales Page (Container):**
  - **Custom Header:** "iPad App" style with integrated Global Search.
  - **Modes:** `POS` (New Sale), `Recent` (History), `Charges` (Fiado
    Management).
  - **Products Grid:**
    - **Virtualization:** Uses `@tanstack/react-virtual` to handle 500+ items
      without lag.
    - **Stitch Cards:** High-density glass cards (3/4 ratio).
    - **Inventory Badges:** Color-coded (Emerald=Units, Blue=Packages).
- **Cart (Sidebar):** Simplified "Read-Only" view with quantity controls. No
  forms.
- **Checkout Drawer (Overlay):**
  - **Flat Structure:** Sale Type -> Delivery Info (if needed) -> Customer ->
    Payment.
  - **Isolation:** Encapsulates all finalization logic.
  - **Validation:** Enforces "Customer Required" for Fiado/Delivery before
    allowing payment.

### Sales Types & Logic mapping

| UI Mode         | Backend Channel | Status    | Payment Method | Note                                                            |
| :-------------- | :-------------- | :-------- | :------------- | :-------------------------------------------------------------- |
| **Presencial**  | `presencial`    | `paid`    | (Selected)     | Standard flow.                                                  |
| **Delivery**    | `delivery`      | `paid`    | (Selected)     | Requires Address + Fee.                                         |
| **Pré-venda**   | `presencial`    | `pending` | `Outros` (Tag) | **Uses "Pré-venda" Tag**. Reserves stock but waits for payment. |
| **Fiado (Tab)** | `presencial`    | `pending` | `Fiado` (UUID) | **CRITICAL:** Requires Customer. Records as debt.               |

### Critical Rules

1. **Atomic Transactions:** Never save a sale header without items. The RPC
   handles this.
2. **Stock Validation:** The RPC prevents negative stock (unless overridden by
   Admin).
3. **Fiscal Trigger:** The Frontend detects the sale completion and immediately
   triggers the `fiscal-handler` if `is_fiscal=true`.
4. **Search State:** The `ProductsGrid` MUST accept `controlledSearchTerm` to
   allow the Header Search Bar to filter it.

## 2. Fiscal Implementation (NFC-e)

Integrated with **Nuvem Fiscal** via Supabase Edge Function.

### Architecture

- **Edge Function:** `fiscal-handler` (Deno).
- **Trigger:** Manual (Button) or Auto (Post-Sale Hook).
- **Credentials:** `NUVEM_FISCAL_CLIENT_ID` / `SECRET` (Env Variables).

### Specific Logic

### Specific Logic

- **PIX Payments:** Mapped to code `17` (PIX).
- **Credit Card:** Mapped to code `03`. Supports `installments` (1-12).
- **Err 391 Fix:** If card data is missing, fallback to generic types if
  applicable.
- **Timezone:** Strict `America/Sao_Paulo` enforcement for all timestamps.

### Fiscal Address Structure (v2.1)

To comply with **Nuvem Fiscal / SEFAZ**, we utilize a strict JSONB structure in
`sales.delivery_address`:

```typescript
type FiscalAddress = {
  logradouro: string; // Rua João XXIII
  numero: string; // 39
  complemento?: string; // Apto 101
  bairro: string; // Montanhão
  nome_municipio: string; // São Bernardo do Campo
  uf: string; // SP
  cep: string; // 09784-410
  codigo_pais: "1058"; // Brasil
};
```

> [!NOTE]
> This structure is auto-hydrated from `customers.address` JSONB or manually
> input via CEP Search during checkout.

### Printing Architecture (Hybrid Mode) - _Planned Impl._

To support both **Simple Receipt** (Non-Fiscal) and **NFC-e** (Fiscal) printing
on thermal printers (58mm/80mm), we use a hybrid approach:

1. **Non-Fiscal (Receipt):**
   - **Method:** `window.print()`.
   - **Styling:** CSS `@media print` isolation (`thermal-print.css`).
   - **Content:** The existing Visible Modal Content is printed.

2. **Fiscal (NFC-e):**
   - **Constraint:** Nuvem Fiscal returns a PDF URL. Browsers cannot "silently"
     print cross-origin PDFs without opening new tabs.
   - **Solution:** We will implement an **HTML Renderer (DANFE View)** inside
     the app.
   - **Flow:**
     1. Fetch XML/JSON from Nuvem Fiscal.
     2. Render a "Secret" hidden component (HTML) that mimics the standard DANFE
        Simplified layout.
     3. Use the _same_ `window.print()` mechanism to target this specific fiscal
        component.
     4. **Benefit:** Eliminates the need for external PDF viewers and allows
        generic thermal printing.

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
