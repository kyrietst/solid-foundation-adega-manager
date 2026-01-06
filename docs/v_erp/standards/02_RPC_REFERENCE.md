# RPC Reference (Business Logic)

These Database Functions act as our API Layer.

## Core: Sales & Fiscal

### `process_sale`

Atomic transaction for Sales.

```sql
FUNCTION process_sale(
    p_user_id uuid,
    p_items jsonb,                 -- Array: [{ product_id, quantity, unit_price, sale_type, ... }]
    p_payment_method_id uuid,
    p_discount_amount numeric,
    p_final_amount numeric,
    p_is_delivery boolean,
    p_payment_status text DEFAULT 'paid', -- 'paid' or 'pending' (Fiado)
    p_customer_id uuid DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_delivery_fee numeric DEFAULT 0,
    p_delivery_address text DEFAULT NULL,
    p_delivery_person_id uuid DEFAULT NULL
) RETURNS jsonb
```

**Triggers:**

- Lowers Stock (via `create_inventory_movement`).
- Creates `sale_header` with correct `delivery_type` and `payment_status`.
- Creates `sale_items` (Snapshot of price).

### `settle_payment`

Updates a pending sale ("Fiado") to paid.

```sql
FUNCTION settle_payment(
    p_sale_id uuid,
    p_payment_method text
)
```

- Logic: Updates `payment_status` -> `paid`, `paid_at` -> `NOW()`,
  `payment_method` -> `p_payment_method`.

## Core: Inventory

### `create_inventory_movement`

Central stock controller.

```sql
FUNCTION create_inventory_movement(
    p_product_id uuid,
    p_quantity_change integer,   -- Negative for Out, Positive for In
    p_type text,                 -- 'sale', 'adjustment', 'purchase'
    p_metadata jsonb DEFAULT '{}'::jsonb, -- Context (e.g., sale_id)
    p_movement_type text DEFAULT 'unit' -- 'unit' or 'package'
)
```

## Analytics

### `get_monthly_expenses`

Aggregates expenses within DB to avoid fetching thousands of rows.

### `get_daily_cash_flow`

Returns daily financial performance for the dashboard. **Logic Update (v2.1):**

- `income`: Total Sales Revenue (`final_amount`).
- `outcome`: Total Cost of Goods Sold (`total_cost` from `v_sales_with_profit`).
- `balance`: Gross Margin (`total_profit`).

_Note: Does NOT include Operational Expenses (Rent, etc.) to ensure positive
visibility of sales performance._
