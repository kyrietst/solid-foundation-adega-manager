ALTER TABLE public.invoice_logs 
DROP INDEX IF EXISTS idx_invoice_logs_sale_id;

ALTER TABLE public.invoice_logs 
ADD CONSTRAINT invoice_logs_sale_id_key UNIQUE (sale_id);
