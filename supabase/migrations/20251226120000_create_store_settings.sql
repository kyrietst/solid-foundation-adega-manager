-- Migration: Create Store Settings Table - 2025-12-26
-- Description: Stores fiscal and environment configuration (CNPJ, CSC, IE).
-- Security: RLS Enabled. Authenticated Read, Admin Update.

CREATE TABLE IF NOT EXISTS public.store_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    cnpj text,
    ie text,
    csc_token text,
    csc_id text,
    environment text,
    CONSTRAINT store_settings_pkey PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Creating Policies
-- 1. READ: All authenticated users (cashiers need to read CSC to emit invoices)
CREATE POLICY "Allow read for authenticated users" 
ON public.store_settings
FOR SELECT 
TO authenticated 
USING (true);

-- 2. UPDATE: Admins only (sensitive fiscal data)
CREATE POLICY "Allow update for Admins only" 
ON public.store_settings
FOR UPDATE
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. INSERT: Admins only (usually seeded, but good to have)
CREATE POLICY "Allow insert for Admins only" 
ON public.store_settings
FOR INSERT
TO authenticated 
WITH CHECK (public.is_admin());

-- Comments
COMMENT ON TABLE public.store_settings IS 'Stores fiscal configuration (CNPJ, CSC) and environment settings.';
COMMENT ON COLUMN public.store_settings.csc_token IS 'SENSITIVE: CSC Token for NFC-e emission.';
