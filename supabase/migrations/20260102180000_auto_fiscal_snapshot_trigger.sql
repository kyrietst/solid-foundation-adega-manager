-- Migration: Auto Fiscal Snapshot Trigger
-- Created: 2026-01-02 18:00:00
-- Description: Automatically populates fiscal_snapshot when a new sale item is inserted.

-- 1. Create Function
CREATE OR REPLACE FUNCTION trigger_set_fiscal_snapshot()
RETURNS TRIGGER AS $$
BEGIN
    -- Only auto-fill if snapshot is missing or empty
    IF NEW.fiscal_snapshot IS NULL OR NEW.fiscal_snapshot = '{}'::jsonb THEN
        SELECT jsonb_build_object(
            'ncm', p.ncm,
            'cfop', p.cfop,
            'uCom', COALESCE(p.ucom, 'UN'),
            'cest', p.cest,
            'xProd', p.name
        )
        INTO NEW.fiscal_snapshot
        FROM products p
        WHERE p.id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS trg_set_fiscal_snapshot ON sale_items;

CREATE TRIGGER trg_set_fiscal_snapshot
BEFORE INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION trigger_set_fiscal_snapshot();
