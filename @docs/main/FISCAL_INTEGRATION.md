# Fiscal Integration Guide (Nuvem Fiscal & SEFAZ-SP)

> [!WARNING]
> **CRITICAL:** This system handles real fiscal documents. Errors can lead to
> financial loss and legal issues. Treat every request as a critical financial
> transaction.

---

## 1. Environment Architecture

The system uses a **Logical Switching** mechanism to toggle between Sandbox
(Homologation) and Production.

### The `store_settings` Table

This table is the **Source of Truth** for the active environment.

- **`environment`**:
  - `'homologation'`: Points to `api.sandbox.nuvemfiscal.com.br` (`tpAmb=2`).
  - `'production'`: Points to `api.nuvemfiscal.com.br` (`tpAmb=1`).
- **`csc_id` & `csc_token`**: Must match the selected environment (Development
  vs Production CSC).

---

## 2. Fiscal Handler API (`fiscal-handler`)

**Endpoint:** `/functions/v1/fiscal-handler`

### Key Workflows

#### Emission (`action: 'emit'`)

- Backend fetches sale data.
- Generates NFC-e XML.
- Transmits to Nuvem Fiscal -> SEFAZ.
- On 539 Error (Duplication/Timeout): Performs **Auto-Recovery** to fetch the
  existing note.

#### Hybrid Cancellation Flow

**Rule:** If a Note is Authorized, it MUST be cancelled fiscally BEFORE voiding
the sale in the database.

1. **Frontend:** Checks `invoice_logs` for authorization.
2. **If Authorized:**
   - User inputs justification (>15 chars).
   - Calls `fiscal-handler` with `action: 'cancel'`.
   - **If Success:** Proceed to `rpc/cancel_sale`.
   - **If Fail:** Abort. Do not revert stock.

### QR Code Strategy

If the API response is missing the QR Code URL, the system uses a fallback
strategy (Regex over XML) to extract it.

---

## 3. Production Go-Live Protocol

### Phase A: Credentials (Secrets)

Update Supabase Edge Function Secrets with Production keys from Nuvem Fiscal:

- `NUVEM_FISCAL_CLIENT_ID`
- `NUVEM_FISCAL_CLIENT_SECRET`

### Phase B: Logical Switch

1. Open Supabase Table Editor: `store_settings`.
2. Change `environment` from `'homologation'` to **`'production'`**.
3. Verify `csc_id` and `csc_token` correspond to the Production CSC.

### Phase C: Validation

1. Perform a test sale ($ low value).
2. Verify authorization in Nuvem Fiscal dashboard.
3. **Rollback Plan:** Revert `environment` to `'homologation'` immediately if
   errors occur.

---

## 4. Troubleshooting

- **Error 539:** Automatic recovery is handled by the backend. Use `fetch_xml`
  if needed manually.
- **Rejection (Justification):** Ensure cancellation reason is >15 chars.
- **Auth Error (401):** Check if Secrets match the environment URL (Sandbox
  Creds don't work on Prod URL).
