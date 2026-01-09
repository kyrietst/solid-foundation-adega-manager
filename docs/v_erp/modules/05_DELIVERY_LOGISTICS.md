# Module: Delivery Logistics (v2.1)

> [!IMPORTANT]
> This module has been refactored to **v2.1** (Jan 08, 2026), standardizing the
> "Stitch" UI (Premium Background) and enforcing Data Hygiene on KPIs.

## 1. Overview

The Delivery module allows the operational team to manage orders from "Pending"
to "Delivered" using an interactive Kanban board. It is designed for
high-concurrency environments using **Supabase Realtime**.

### Key Features

- **Kanban Board:** 4 Columns (Pending, Preparing, Out for Delivery, Delivered).
- **Drag-and-Drop:** Powered by `@dnd-kit` for intuitive status updates.
- **Realtime:** Instant updates across all connected clients via Postgres
  Changes.
- **Optimistic UI:** Immediate visual feedback during drag operations before
  server confirmation.
- **Visual Hygiene:**
  - Removed persistent "Search Bar" (Redundant space).
  - Translated headers to PT-BR ("Sistema Online").
  - Enforced `PremiumBackground` for deep immersion.

## 2. Architecture

### A. Component Structure

- **`Delivery.tsx`**: Main entry point. Wraps the Kanban board in
  `<DndContext>`.
- **`DeliveryStatsGrid.tsx`**: KPI Header.
  - **Zero Trust:** All "Fake" metrics (Atrasados, Growths) were neutralized to
    "0%" or removed until Backend implementation.
- **`KanbanColumn.tsx`**: Droppable container using "Glassmorphism V2"
  (`bg-[#121214]/40`).
- **`DeliveryOrderCard.tsx`**: Draggable item. Contains all order details,
  actions, and sub-modals (Timeline, Assignment).

### B. State Management

We use a hybrid approach:

1. **Server State:** `useDeliveryOrders` (TanStack Query) fetches initial data.
2. **Realtime:** A `useEffect` subscription listens to `INSERT/UPDATE/DELETE` on
   the `sales` table (`delivery_type='delivery'`) and invalidates the query
   cache.
3. **Local/Optimistic:** `@dnd-kit` manages the temporary state of the dragged
   card.

### C. Type Definitions

Types are centralized in `src/features/delivery/types/index.ts` to prevent
circular dependencies and ensure strict type safety across components.

## 3. Implementation Details

### Drag-and-Drop (`@dnd-kit`)

- **Sensors:** `PointerSensor` with `activationConstraint: { distance: 8 }` to
  prevent accidental drags when clicking buttons.
- **Collision:** Default collision detection.
- **Updates:** `onDragEnd` triggers `handleUpdateStatus`.

### Address Automation (Checkout)

- **CEP-First Workflow:** User enters CEP -> API fills `logradouro`, `bairro`,
  `city`.
- **Read-Only Fields:** To prevent typo-errors that reject NF-es, strict address
  fields are **Read-Only**.
- **Manual Input:** Only `numero` and `complemento` are editable by default.
- **Persistence:** Full address object is saved to `sales.delivery_address`
  (JSONB) for immutable fiscal history.

### Realtime Subscription

```typescript
// useDeliveryOrders.ts
supabase.channel("delivery-orders-realtime")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "sales",
    filter: "delivery_type=eq.delivery",
  }, () => queryClient.invalidateQueries({ queryKey: ["delivery-orders"] }));
```

### RPC Integration

- **Reads:** `get_delivery_metrics` (Optimized SQL function for dashboard
  stats).
- **Writes:** `update_delivery_status` (Handles status change + history
  logging).
- **Deletes:** `delete_sale_cascade` (Safe deletion with inventory rollback).

## 4. UI/UX Standards ("Stitch" v2)

- **Premium Background:** Utilizes `<PremiumBackground />` shared component
  (Dark Base + Texture + Vignette).
- **Glassmorphism:** `bg-[#121214]/40 backdrop-blur-md` on columns to ensure
  visibility against the dark texture.
- **Color Coding:**
  - 🟡 **Pending:** Yellow
  - 🟠 **Preparing:** Orange
  - 🔵 **Out for Delivery:** Blue
  - 🟢 **Delivered:** Green
- **Feedback:** Visual rings appear on columns when an item is accepted
  (Droppable `isOver`).
