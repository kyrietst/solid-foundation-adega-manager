# 01. Database Schema & Integrity

This document is the **Source of Truth** for the AdegaManager database
(Supabase/PostgreSQL).

## 1. Core Transactional Tables

### `sales`

The central transaction record.

- `id` (uuid, PK)
- `order_number` (serial, unique): Human-readable sequence (Order #1, Order #2).
- `status_enum` (sales_status_enum): `pending`, `completed`, `cancelled`.
- `payment_method_enum` (payment_method_enum): `credit`, `debit`, `cash`, `pix`.
- `payment_method_id` (uuid): Link to `payment_methods` (Preferred over enum for
  flexibility).
- `total_amount` (numeric): Gross total.
- `discount_amount` (numeric).
- `final_amount` (numeric): Net total.
- `payment_status` (text): `paid` (Standard) or `pending` (Fiado).
- `paid_at` (timestamptz): When settlement occurred.
- `delivery_type` (text): `presencial` or `delivery`.
- `delivery_fee` (numeric): Added to final amount.
- `delivery_address` (text): Json or Text.
- `created_at` (timestamptz).

### `sale_items`

Immutable line items.

- `id` (uuid, PK)
- `sale_id` (uuid, FK).
- `product_id` (uuid, FK).
- `quantity` (integer).
- `unit_price` (numeric): Price **at the moment of sale**.
- `total_price` (numeric).
- `fiscal_snapshot` (jsonb): **CRITICAL**. Stores tax rules (NCM, CFOP, Origin)
  at the time of sale.

### `inventory_movements`

The immutable ledger of stock changes.

- `id` (uuid, PK)
- `product_id` (uuid, FK).
- `quantity_change` (integer): Negative for sales, Positive for restock.
- `type` (movement_type): `sale`, `adjustment`, `restock`, `loss`.
- `reason` (text).

### `v_sales_with_profit` (View)

Optimization for Dashboard Performance. Pre-calculates financial metrics per
sale.

- `id`, `created_at`, `final_amount`: From `sales`.
- `total_cost`: Sum of (Item Quantity * Product Cost Price).
- `total_profit`: `final_amount` - `total_cost`.
- `status`: Filtered to exclude cancelled/returned in queries.

---

## 2. Fiscal Tables

### `invoice_logs` (The Fiscal Black Box)

Stores the entire lifecycle of an NFC-e emission. Any interaction with the
government API is logged here.

| Column          | Type          | Description                                                          |
| :-------------- | :------------ | :------------------------------------------------------------------- |
| `sale_id`       | `uuid`        | PK/FK (One invoice per sale).                                        |
| `status`        | `text`        | `authorized`, `rejected`, `processing`.                              |
| `external_id`   | `text`        | The `nfc_...` ID from Nuvem Fiscal.                                  |
| `pdf_url`       | `text`        | **Supabase Storage URL** (Permanent link to the PDF).                |
| `xml_url`       | `text`        | Link to XML (External or Internal).                                  |
| `error_message` | `text`        | Stack trace or rejection reason. Contains `[DEBUG RECOVERY]` traces. |
| `payload`       | `jsonb`       | The exact JSON payload sent to the API.                              |
| `created_at`    | `timestamptz` |                                                                      |
| `updated_at`    | `timestamptz` |                                                                      |

---

## 3. Product & Catalog

### `products`

- `id` (uuid, PK)
- `name` (text)
- `barcode` (text, unique)
- `price` (numeric): Selling price.
- `cost_price` (numeric): Cost.
- `stock` (integer): **computed/view** (Do not trust physical columns, trust
  movements).
- `stock_packages` (int) / `stock_units_loose` (int): Physical inventory
  tracking.
- `ncm`, `cest`, `cfop`, `origin`: Fiscal classification.

---

## 2. Finance Tables (Expenses)

### `expenses`

Operational costs (Cash Flow).

- `id` (uuid, PK).
- `date` (date): Competency date.
- `description` (text).
- `amount` (numeric).
- `category_id` (uuid, FK): `expense_categories`.
- `payment_status` (text): `paid` / `pending`.
- `payment_method` (text).
- `supplier_vendor` (text).
- `receipt_url` (text).
- `is_recurring` (boolean).
- `budget_category` (text).
- `user_id` (uuid).

### `expense_categories`

- `id` (uuid, PK).
- `name` (text).
- `is_active` (boolean).

---

## 4. Enums & Types

- **`sales_status_enum`**: `pending`, `completed`, `cancelled`.
- **`payment_method_enum`**: `credit`, `debit`, `cash`, `pix`, `multiple`.
- **`movement_type`**: `sale`, `restock`, `adjustment`, `loss`.

## 5. Security (RLS) policies

- **`invoices` Bucket**:
  - `SELECT`: Public.
  - `INSERT`: Authenticated Users (Edge Functions).
  - `UPDATE`: Authenticated Users.
- **Tables**:
  - Standard RLS: Authenticated users can CRUD.
  - **Edge Function Service Role**: Bypasses RLS for `fiscal-handler`.
