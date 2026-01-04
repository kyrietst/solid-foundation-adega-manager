# 07. ERP Transition Manifesto: From "Notebook" to Enterprise

**Data:** 2026-01-03 **Status:** Implemented & Verified **Subject:** System
Maturity Analysis & Architectural Guarantees

---

## 1. Introduction

This document certifies the transition of the **AdegaManager** project from a
simple management tool (often serving as a "digital notebook") to a
**Professional Cloud ERP**.

This transition is defined not just by features, but by **guarantees**. In a
notebook, if you write a sale and forget to subtract stock, it's a human error.
In an ERP, the system guarantees that **Inventory Movement and Financial Records
are Atomic**.

## 2. The Three Pillars of the New Architecture

We have enforced a **Zero Trust** architecture across the critical paths (Sales,
Inventory, Fiscal).

### I. Data Integrity (Zero Trust)

_Old Way:_ Frontend would calculate new stock and update the database. _ERP Way
(`process_sale` RPC):_

- The Frontend sends an **Intent** ("I want to sell X units of Product Y").
- The **Database (RPC)** calculates the total, checks stock availability,
  creates the sale record, creates the sale items, and generates inventory
  movements **in a single ACID transaction**.
- **Guarantee:** It is mathematically impossible to have a Sale without a
  corresponding Inventory deduction.

### II. Fiscal Reliability (Anti-Fragile)

_Old Way:_ If the Fiscal API failed or timed out, the User lost the invoice
link. If they clicked twice, they got a "Duplicate" error and no PDF. _ERP Way
(`fiscal-handler`):_

- **Idempotency:** The system handles duplicate requests gracefully.
- **Auto-Recovery:** If the API returns "Duplicated", the system
  **automatically** fetches the existing invoice using its Access Key.
- **Persistent Storage (Proxy):** usage of **Supabase Storage** as an immutable
  archive. We no longer rely on external temporary links. We download the
  binary, upload it to our cloud, and generate a permanent link.

### III. Traceability (The "Black Box")

_Old Way:_ "It stopped working." _ERP Way (`invoice_logs` & Snapshots):_

- **Fiscal Snapshots:** Every sale item freezes the tax data (NCM, CFOP) at the
  moment of sale. If the product tax rules change later, historical sales remain
  compliant.
- **Deep Tracing:** The `invoice_logs` table captures the full JSON payload sent
  and received. Even "Recovery" attempts log their specific debug traces
  (`[DEBUG RECOVERY]`), allowing post-mortem analysis of external API failures.

---

## 3. Technical Implementation Details

### A. The "Storage Proxy" Pattern

To solve the volatility of external fiscal APIs, we implemented a proxy pattern
in the Edge Function:

1. **Fetch:** `GET /nfce/{id}/pdf` (Binary ArrayBuffer).
2. **Store:** Upload to `storage.objects` (Bucket: `invoices`).
3. **Link:** Generate Public URL.
4. **Persist:** Save URL to `invoice_logs.pdf_url`.

### B. MEI Compliance (Microempreendedor Individual)

The fiscal module handles the specific tax regime of MEI:

- **CRT:** 4 (Simples Nacional - MEI).
- **CSOSN:** 102 (Sem crédito).
- **Totals:** ICMS values are forced to 0.00 to prevent calculation errors, as
  MEI pays fixed monthly taxes.

---

## 4. Next Steps & Recommendations

1. **Dashboard Analytics:** Now that we have trusted data, build
   high-performance SQL views for "Real-time Profit" (Sales - Cost of Goods
   Sold).
2. **Backup Strategy:** Implement Point-in-Time Recovery (PITR) in Supabase for
   disaster recovery.
3. **Auditing:** Create a `user_activity_logs` table to track who deleted or
   modified sensitive records (though `deleted_at` soft-deletes are already in
   place).

---

**Conclusion:** The system now operates with the rigor of banking software.
Every transaction is tracked, verifiable, and recoverable.
