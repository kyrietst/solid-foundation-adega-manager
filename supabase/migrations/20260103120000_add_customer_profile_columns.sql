-- Migration to add missing Customer Profile columns
-- These columns are required by the CRM module (use-crm.ts) and CustomerForm.tsx

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS birthday date,
ADD COLUMN IF NOT EXISTS contact_preference text,
ADD COLUMN IF NOT EXISTS contact_permission boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS segment text,
ADD COLUMN IF NOT EXISTS first_purchase_date timestamptz,
ADD COLUMN IF NOT EXISTS last_purchase_date timestamptz,
ADD COLUMN IF NOT EXISTS purchase_frequency text,
ADD COLUMN IF NOT EXISTS favorite_category text,
ADD COLUMN IF NOT EXISTS favorite_product text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0;

-- Validate types by creating a comment
COMMENT ON COLUMN customers.contact_preference IS 'whatsapp | sms | email | call';
COMMENT ON COLUMN customers.segment IS 'VIP | Regular | Novo | Inativo | Em risco';
