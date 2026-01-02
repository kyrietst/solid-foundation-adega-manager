-- Migration: Refine Sales Snapshot (SEFAZ Requirements)
-- Created: 2026-01-02 17:06:00
-- Description: Updates fiscal_snapshot keys to match NuvemFiscal/SEFAZ standards (xProd, uCom).

-- 1. Update Comment to be explicit
COMMENT ON COLUMN sale_items.fiscal_snapshot IS 'Snapshot imutável dos dados fiscais (ncm, cest, cfop, ucom) exigido pela SEFAZ/NuvemFiscal.';

-- 2. Re-Backfill with correct keys
-- We overwrite the previous snapshot to ensure all keys are correct (xProd, uCom)
UPDATE sale_items si
SET fiscal_snapshot = jsonb_build_object(
    'ncm', p.ncm,
    'cfop', p.cfop,
    'uCom', COALESCE(p.ucom, 'UN'),
    'cest', p.cest,
    'xProd', p.name
)
FROM products p
WHERE si.product_id = p.id;
