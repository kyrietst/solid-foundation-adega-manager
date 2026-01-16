# Nuvem Fiscal: Environment & Credentials Guide

**Version:** 1.0\
**Last Updated:** 2025-01-16\
**Module:** Fiscal (NFC-e)

---

## 1. Overview

This document defines how the system switches between **Homologation (Sandbox)**
and **Production** environments for fiscal emission (NFC-e / Nuvem Fiscal).

**CRITICAL:** The environment is **NOT** determined by the codebase build (e.g.,
`npm run build`), but by a **Database Configuration** and **Edge Function
Secrets**.

---

## 2. Architecture: "The Switch"

The logic resides in `supabase/functions/fiscal-handler/index.ts`. It reads the
`environment` column from the database and selects the target API URL.

| Component         | Responsible For    | Key                          | Value (Production)  | Value (Homologation) |
| :---------------- | :----------------- | :--------------------------- | :------------------ | :------------------- |
| **Database**      | Environment Switch | `store_settings.environment` | `'production'`      | `'homologation'`     |
| **Edge Function** | Auth Credentials   | `NUVEM_FISCAL_CLIENT_ID`     | Produção Client ID  | Sandbox Client ID    |
| **Edge Function** | Auth Credentials   | `NUVEM_FISCAL_CLIENT_SECRET` | Produção Secret     | Sandbox Secret       |
| **Database**      | CSC (Token)        | `store_settings.csc_id`      | Prod CSC ID (ex: 1) | Sandbox CSC ID       |
| **Database**      | CSC (Token)        | `store_settings.csc_token`   | Prod CSC Token      | Sandbox Token        |

---

## 3. Configuration Steps

### A. Database (The Trigger)

To switch environments, you must run a SQL update on the `store_settings` table.

**SQL for PRODUCTION:**

```sql
UPDATE store_settings
SET
  environment = 'production',
  csc_id = '1', -- Check your Nuvem Fiscal Panel
  csc_token = 'YOUR-PRODUCTION-CSC-TOKEN';
```

**SQL for HOMOLOGATION:**

```sql
UPDATE store_settings
SET
  environment = 'homologation',
  csc_id = 'YOUR-SANDBOX-CSC-ID', 
  csc_token = 'YOUR-SANDBOX-CSC-TOKEN';
```

### B. Supabase Secrets (The Keys)

The Edge Function (`fiscal-handler`) uses Environment Variables to authenticate.
These **MUST MATCH** the environment set in the Database.

> **WARNING:** If you set DB to 'production' but keep Sandbox Credentials in
> Secrets, the API will reject the token (Status 401 or Invalid Client).

To update secrets via CLI:

```bash
npx supabase secrets set NUVEM_FISCAL_CLIENT_ID="prod_id_..." --project-ref your_project_ref
npx supabase secrets set NUVEM_FISCAL_CLIENT_SECRET="prod_secret_..." --project-ref your_project_ref
```

_Or update via Supabase Dashboard > Edge Functions > Secrets._

---

## 4. API URLs (Internal Reference)

The system automatically maps the `environment` setting to the following
endpoints:

- **Production:** `https://api.nuvemfiscal.com.br`
- **Homologation:** `https://api.sandbox.nuvemfiscal.com.br`

**Auth URL:** Always `https://auth.nuvemfiscal.com.br/oauth/token` (Global).

---

## 5. Troubleshooting / Common Errors

### Error: "Unauthorized" or "Invalid Grant"

- **Cause:** You are using Sandbox Credentials while pointing to Production API
  (or vice-versa).
- **Fix:** Check if `store_settings.environment` matches the Secrets loaded in
  the Function.

### Error: "CSC Inválido" (Rejeição SEFAZ)

- **Cause:** The `csc_token` in `store_settings` does not match the environment.
- **Fix:** Production uses a generated CSC from the Sefaz portal (via Nuvem
  Fiscal). Sandbox uses a test CSC. Update the DB.

### Error: "Rejeição 391: Dados do cartão..."

- **Cause:** Sending Card payment info for PIX or Cash.
- **Fix:** Ensure frontend sends `payment_method: 'pix'` (Code 17) or `'money'`
  (Code 01). The system auto-maps PIX to generic payment type if needed to avoid
  this SEFAZ validation in older environments.
