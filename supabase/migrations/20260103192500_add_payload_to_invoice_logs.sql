ALTER TABLE public.invoice_logs 
ADD COLUMN IF NOT EXISTS payload JSONB;
