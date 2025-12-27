-- BACKPORT SCHEMA PROD -> DEV
-- Purpose: Sync missing tables and columns to allow index parity.

BEGIN;

-- 1. Create missing tables
CREATE TABLE IF NOT EXISTS public.customer_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    customer_id uuid, -- Likely FK to customers, but keeping flexible for backport
    type text NOT NULL,
    origin_id uuid,
    value numeric,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.debug_stock_calls_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT now(),
    source_identifier text NOT NULL,
    payload jsonb NOT NULL,
    notes text,
    user_id uuid,
    session_info jsonb DEFAULT '{}'::jsonb,
    stack_trace text
);

-- 2. Add missing columns (Safe adds)
ALTER TABLE public.batch_units 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

ALTER TABLE public.expiry_alerts 
ADD COLUMN IF NOT EXISTS acknowledged_by uuid REFERENCES auth.users(id);

ALTER TABLE public.expiry_alerts 
ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES auth.users(id);

ALTER TABLE public.nps_surveys 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

COMMIT;
