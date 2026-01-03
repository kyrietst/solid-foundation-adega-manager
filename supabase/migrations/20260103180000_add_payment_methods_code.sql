-- Migration: Add 'code' column to payment_methods and populate default fiscal codes
-- Date: 2026-01-03
-- Author: AdegaManager System

-- 1. Add Code Column
ALTER TABLE payment_methods
ADD COLUMN IF NOT EXISTS code text;

-- 2. Populate Codes based on Type/Name
-- SEFAZ Standard:
-- 01: Dinheiro
-- 03: Cartão de Crédito
-- 04: Cartão de Débito
-- 17: PIX
-- 99: Outros

UPDATE payment_methods
SET code = CASE 
    WHEN type = 'cash' OR name ILIKE '%Dinheiro%' THEN '01'
    WHEN type = 'credit' OR name ILIKE '%Crédito%' THEN '03'
    WHEN type = 'debit' OR name ILIKE '%Débito%' THEN '04'
    WHEN type = 'pix' OR name ILIKE '%PIX%' THEN '17'
    ELSE '99'
END
WHERE code IS NULL;

-- 3. Add Unique Constraint (Optional but Recommended for consistency)
-- Not strict unique because distinct methods might map to '99', but good for 01, 03, 04, 17 uniqueness per active method usually.
-- Skipping strict unique constraint to allow multiple '99' (Outros).

-- 4. Not Null Constraint (After population)
ALTER TABLE payment_methods
ALTER COLUMN code SET NOT NULL;

-- 5. Comments
COMMENT ON COLUMN payment_methods.code IS 'SEFAZ Payment Code (01=Cash, 03=Credit, 04=Debit, 17=PIX, 99=Other)';
