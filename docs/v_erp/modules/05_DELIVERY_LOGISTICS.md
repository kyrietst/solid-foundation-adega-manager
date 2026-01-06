# Module: Delivery Logistics

This module handles the operational flow of deliveries, including address
management, fees, and driver assignment.

## 1. Overview

Delivery is treated as a **Sales Mode**, not just a boolean flag. It implies:

- **customer_id**: Required for address history.
- **Address**: Must be captured or selected.
- **Logistics Fee**: Optional addition to the price.

## 2. Integration with "Fiado"

A delivery _can_ be a "Fiado" sale (Credit).

- If `isDelivery=true` AND `paymentMethod=Fiado`:
  - `delivery_type` = 'delivery'
  - `payment_status` = 'pending'
  - `delivery_status` = 'pending' (Needs dispatch)

## 3. Data Flow

1. **Cart**: User toggles "É para entrega?".
2. **Form**: Address fields appear (using `CustomerAddressSelector` if
   available).
3. **RPC (`process_sale`)**:
   - Validates if address is present.
   - Saves `delivery: true`.
   - Saves `delivery_fee`.

## 4. Delivery Dashboard (Future)

_Planned Feature:_ A Kanban view for delivery status (`pending` -> `dispatched`
-> `delivered`).
