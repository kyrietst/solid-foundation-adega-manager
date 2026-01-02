-- Migration: Add Sales Snapshot (Fiscal Immutability)
-- Created: 2026-01-02 16:45:00
-- Description: Adds fiscal_snapshot to sale_items and backfills from current product data.

-- 1. Add fiscal_snapshot column
ALTER TABLE IF EXISTS sale_items 
ADD COLUMN IF NOT EXISTS fiscal_snapshot jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN sale_items.fiscal_snapshot IS 'Snapshot dos dados fiscais (ncm, cest, cfop, ucom, valores) no momento da venda.';

-- 2. Backfill existing items
-- We copy the current state of products into the snapshot for historical items.
-- This effectively "freezes" the current product definition for past sales.
UPDATE sale_items si
SET fiscal_snapshot = jsonb_build_object(
    'ncm', p.ncm,
    'cfop', p.cfop,
    'ucom', COALESCE(p.ucom, 'UN'),
    'cest', p.cest,
    'original_price_from_product', p.price
)
FROM products p
WHERE si.product_id = p.id
AND (si.fiscal_snapshot IS NULL OR si.fiscal_snapshot = '{}'::jsonb);
