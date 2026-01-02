-- Migration: Normalize Payment Methods and Link Sales
-- Created: 2026-01-02 16:14:00
-- Description: Adds code/is_active to payment_methods, seeds SEFAZ codes, and links sales.

-- 1. Ensure payment_methods has required columns
ALTER TABLE IF EXISTS payment_methods 
ADD COLUMN IF NOT EXISTS code text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- 2. Add constraint for code (must be unique)
-- First, clean up or prepare existing data if it conflicts (though code is likely null for existing)
-- We will try to map existing types to codes first to preserve IDs if possible
UPDATE payment_methods SET code = '17' WHERE type = 'pix' AND code IS NULL;
UPDATE payment_methods SET code = '03' WHERE type = 'credit' AND code IS NULL;
UPDATE payment_methods SET code = '04' WHERE type = 'debit' AND code IS NULL;
UPDATE payment_methods SET code = '01' WHERE type = 'cash' AND code IS NULL;

-- Now add unique constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_methods_code_key') THEN
        ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_code_key UNIQUE (code);
    END IF;
END $$;

-- 3. Upsert Standard SEFAZ Payment Methods
INSERT INTO payment_methods (id, name, description, type, code, is_active)
VALUES 
    (gen_random_uuid(), 'Dinheiro', 'Pagamento em espécie', 'cash', '01', true),
    (gen_random_uuid(), 'Cartão de Crédito', 'Pagamento via cartão de crédito', 'credit', '03', true),
    (gen_random_uuid(), 'Cartão de Débito', 'Pagamento via cartão de débito', 'debit', '04', true),
    (gen_random_uuid(), 'PIX', 'Pagamento instantâneo', 'pix', '17', true),
    (gen_random_uuid(), 'Outros', 'Outros métodos de pagamento', 'other', '99', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    is_active = EXCLUDED.is_active;

-- 4. Add payment_method_id to sales
ALTER TABLE IF EXISTS sales 
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES payment_methods(id);

-- 5. Data Migration (Smart Update)
DO $$
DECLARE
    row_count integer;
BEGIN
    -- 01: Dinheiro
    UPDATE sales 
    SET payment_method_id = (SELECT id FROM payment_methods WHERE code = '01')
    WHERE payment_method_id IS NULL 
    AND (payment_method ILIKE '%dinheiro%' OR payment_method ILIKE '%espécie%' OR payment_method ILIKE '%cash%');
    
    -- 03: Crédito
    UPDATE sales 
    SET payment_method_id = (SELECT id FROM payment_methods WHERE code = '03')
    WHERE payment_method_id IS NULL 
    AND (payment_method ILIKE '%crédito%' OR payment_method ILIKE '%credito%' OR payment_method ILIKE '%credit%');
    
    -- 04: Débito
    UPDATE sales 
    SET payment_method_id = (SELECT id FROM payment_methods WHERE code = '04')
    WHERE payment_method_id IS NULL 
    AND (payment_method ILIKE '%débito%' OR payment_method ILIKE '%debito%' OR payment_method ILIKE '%debit%');
    
    -- 17: PIX
    UPDATE sales 
    SET payment_method_id = (SELECT id FROM payment_methods WHERE code = '17')
    WHERE payment_method_id IS NULL 
    AND (payment_method ILIKE '%pix%');
    
    -- 99: Outros (optional fallback for non-empty but unmatched)
    -- Uncomment if we want to force everything else to 99
    -- UPDATE sales 
    -- SET payment_method_id = (SELECT id FROM payment_methods WHERE code = '99')
    -- WHERE payment_method_id IS NULL AND payment_method IS NOT NULL;
    
END $$;
