# API Reference & Implementation Guide

> [!IMPORTANT]
> **Architecture Principle:** The Frontend (React) should **NEVER** write
> directly to core tables (`sales`, `stock_movements`, `customer_interactions`).
> All critical business logic MUST use **PostgreSQL RPCs** or **Edge
> Functions**.

---

## 1. Remote Procedure Calls (RPCs)

Execute via `supabase.rpc('function_name', { params })`.

### Sales & Financial

#### `process_sale`

**Critical:** The ONLY authorized method to create sales. Guarantees atomic
updates for financial records and inventory deduction.

- **Parameters:**
  - `p_customer_id` (uuid | null): Optional customer linkage.
  - `p_user_id` (uuid): Staff member performing the sale.
  - `p_items` (jsonb[]): Array of sale items.
    ```json
    [{
      "product_id": "uuid",
      "quantity": 1,
      "unit_price": 10.50,
      "sale_type": "unit"
    }]
    ```
  - `p_payment_methods` (jsonb[]): Payment breakdown.
    ```json
    [{ "method": "pix", "amount": 50.00 }]
    ```
  - `p_total_amount`, `p_final_amount`, `p_discount_amount`, `p_is_delivery`.

#### `cancel_sale`

**Purpose:** Soft-deletes a sale, restocks items, and logs the cancellation.

- **Requires:** `p_sale_id` (uuid), `p_reason` (text, min 15 chars).
- **Flow:** If an NFC-e was authorized, it MUST be cancelled via
  `fiscal-handler` BEFORE calling this RPC.

### Customer Management

#### `create_quick_customer`

**Feature:** "Smart Link" / Find-or-Create.

- **Logic:** Checks if a customer with the given phone exists.
  - If **YES**: Returns the existing `id`.
  - If **NO**: Creates a new record and returns the new `id`.
- **Usage:** Essential for the POS "Quick Add" modal to prevent duplicates.

### Inventory

#### `create_inventory_movement`

**Purpose:** Centralized ledger for all stock changes.

- **Types:** `sale`, `restock`, `breakage`, `return`, `adjustment`.
- **Trigger:** Automatically called by `process_sale` and `cancel_sale`. Use
  manually for stock adjustments.

---

## 2. Edge Functions

Hosted on Supabase Edge Network.

#### `fiscal-handler`

**Endoint:** `/functions/v1/fiscal-handler` **Purpose:** Gateway to Nuvem Fiscal
for NFC-e emission and cancellation.

- **Security:** Dynamic environment switching based on `store_settings`.
- **Actions:**
  - `emit`: Generates and signs XML, transmits to SEFAZ.
  - `cancel`: Cancels an authorized note (Requires justification).
- **Auto-Recovery:** Handles SEFAZ timeouts (Error 539) by fetching existing
  XMLs.

---

## 3. Database Triggers

- **`trg_update_customer_metrics`**: auto-recalculates `lifetime_value` and
  `last_purchase_date` on `sales` changes.
- **`trg_validate_stock_update`**: BLOCKS direct updates to `stock_quantity` on
  `products` table. Forces usage of `create_inventory_movement`.
