-- Migration: Add 'fiscal_snapshot' to sale_items and backfill
-- Date: 2026-01-03
-- Purpose: Store frozen fiscal data (NCM, CEST, Origin) at the time of sale.

-- 1. Add Column
ALTER TABLE sale_items
ADD COLUMN IF NOT EXISTS fiscal_snapshot jsonb;

-- 2. Backfill existing items from current product data
-- This is a "best effort" backfill for history. Future sales will have this set by RPC or Logic.
UPDATE sale_items si
SET fiscal_snapshot = jsonb_build_object(
    'ncm', p.ncm,
    'cest', p.cest,
    'origin', p.origin,
    'cfop', p.cfop, -- standard fallback
    'xProd', p.name, -- snapshot name to match NFe logic
    'uCom', 'UN' -- Default unit
)
FROM products p
WHERE si.product_id = p.id
AND si.fiscal_snapshot IS NULL;

-- 3. Comment
COMMENT ON COLUMN sale_items.fiscal_snapshot IS 'Frozen fiscal data (NCM, CEST, CFOP) at moment of sale';
