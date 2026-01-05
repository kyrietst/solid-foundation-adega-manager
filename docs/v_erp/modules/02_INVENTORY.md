# Module: Inventory (Estoque)

The Inventory module manages physical goods, packaging conversions, and stock
history.

## 1. Mechanics

- **Hybrid Stock:** We track both `units` (loose) and `packages` (cases).
- **Conversion:** `units_per_package` defines how many units are in a case.
- **Valuation:** `cost_price` (Purchase) vs `price` (Sale).

## 2. Inventory Movements (Audit Log)

The `Movements` screen (`/movements`) is a **READ-ONLY Audit Log**.

- **Purpose:** To view history, track shrinkage, and audit employee actions.
- **UI:** No "Create Button". Filters by date, type, and product only.

## 3. Adjustments & Operations

To change stock levels, the user must perform specific actions in context:

| Action                     | Context                          | RPC Used                     |
| :------------------------- | :------------------------------- | :--------------------------- |
| **Sale**                   | PDV (Checkout)                   | `process_sale`               |
| **Purchase (Entry)**       | Purchase Module                  | `process_purchase` (Planned) |
| **Adjustment (Loss/Gain)** | **Product Card** > "Ajuste"      | `create_inventory_movement`  |
| **Package Breaking**       | **Product Card** > "Abrir Fardo" | `break_package` (Logic)      |

## 4. Database Schema

### `inventory_movements`

- `created_at`: Timeline.
- `type_enum`: `sale`, `purchase`, `adjustment`, `loss`.
- `quantity_change`: Signed integer (+/-).
- `related_sale_id`: Link to Sales table (if applicable).
