# API Reference & RPC Protocols

> [!NOTE]
> **Architecture:** This system uses a **Backend-as-a-Service (BaaS)** model via
> Supabase. Most business logic resides in **PostgreSQL RPCs** (Stored
> Procedures) or **Edge Functions** (Deno). The Frontend should **NEVER** write
> directly to tables like `sales` or `stock_movements`.

---

## 1. RPCs (Remote Procedure Calls)

These functions are called via `supabase.rpc('function_name', { params })`.

### A. Customer Management

#### `create_quick_customer`

**Purpose:** Finds or creates a customer by phone number ("Smart Link").
**Prevent Duplication:** If the phone exists, it returns the _existing_
customer's ID instead of creating a new one.

- **Parameters:**
  - `p_name` (text): Customer name.
  - `p_phone` (text): Phone number (e.g., "11999999999").
- **Returns:** `uuid` (Customer ID).

```sql
-- Logic Summary
IF EXISTS(phone) THEN RETURN existing_id;
ELSE INSERT AND RETURN new_id;
```

---

### B. Sales Transactions

#### `process_sale`

**Purpose:** Atomic creation of a sale, including items, financial totals, and
stock deduction. **Critical:** This is the ONLY allow way to create a sale.
Direct inserts are blocked.

- **Parameters:**
  - `p_customer_id` (uuid | null)
  - `p_user_id` (uuid)
  - `p_items` (jsonb array): `[{ product_id, quantity, unit_price, sale_type }]`
  - `p_payment_methods` (jsonb array): `[{ method: 'pix', amount: 50.00 }, ...]`
  - `p_discount_amount`, `p_final_amount` (numeric)
  - `p_is_delivery` (boolean)
- **Side Effects:**
  - Inserts into `sales`, `sale_items`, `sale_payments`.
  - Triggers `create_inventory_movement` for each item (Type: 'sale').

#### `cancel_sale`

**Purpose:** Soft-deletes a sale and restores stock.

- **Parameters:**
  - `p_sale_id` (uuid)
  - `p_reason` (text)
- **Logic:**
  - Marks sale as `cancelled`.
  - Iterates items and calls `create_inventory_movement` (Type: 'return').

---

### C. Inventory Control

#### `create_inventory_movement`

**Purpose:** Centralized ledger for stock changes.

- **Parameters:**
  - `p_product_id` (uuid)
  - `p_quantity` (numeric): Positive or negative change.
  - `p_type` (enum): 'sale', 'restock', 'breakage', 'return', 'adjustment'.
  - `p_user_id` (uuid)

---

## 2. Edge Functions (Serverless)

Hosted on Supabase Edge Network. Used for external integrations.

### `fiscal-handler`

**Purpose:** Gateway to Nuvem Fiscal API (NFC-e Emission). **Security:** Uses
`store_settings` to switch between Sandbox/Production.

- **Actions:**
  - `emit`: Generates XML, signs, transmits to SEFAZ.
  - `cancel`: Cancels an authorized note.
- **Auto-Recovery:** Detects SEFAZ timeouts (Error 539) and fetches the existing
  XML automatically.

**Environment Variables (Secrets):**

- `NUVEM_FISCAL_CLIENT_ID`
- `NUVEM_FISCAL_CLIENT_SECRET`

---

## 3. Database Triggers (Automations)

- **`trg_update_customer_metrics`**:
  - **On:** `sales` (Insert/Update/Delete).
  - **Action:** Recalculates `lifetime_value` and `last_purchase_date` for the
    customer.
  - **Goal:** Real-time CRM stats without expensive aggregation queries.

- **`trg_validate_stock_update`**:
  - **On:** `products` (Update).
  - **Action:** BLOCKS direct updates to `stock_quantity`.
  - **Goal:** Forces usage of `create_inventory_movement` for auditability.
