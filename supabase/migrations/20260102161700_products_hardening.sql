-- Migration: Products Hardening (Fiscal Constraints)
-- Created: 2026-01-02 16:17:00
-- Description: Enforces fiscal integrity on products (NCM 8 digits, CFOP 4 digits, UCOM whitelist).

-- 1. Add ucom column
ALTER TABLE IF EXISTS products 
ADD COLUMN IF NOT EXISTS ucom text DEFAULT 'UN';

-- 2. Add Constraints
-- Ensure ucom is in whitelist
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_ucom_check;

ALTER TABLE products 
ADD CONSTRAINT products_ucom_check 
CHECK (ucom IN ('UN', 'KG', 'L', 'M', 'CX', 'DZ', 'GT'));

-- Ensure NCM is exactly 8 digits or NULL
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_ncm_check;

ALTER TABLE products 
ADD CONSTRAINT products_ncm_check 
CHECK (ncm IS NULL OR ncm ~ '^\d{8}$');

-- Ensure CFOP is exactly 4 digits or NULL
ALTER TABLE products 
DROP CONSTRAINT IF EXISTS products_cfop_check;

ALTER TABLE products 
ADD CONSTRAINT products_cfop_check 
CHECK (cfop IS NULL OR cfop ~ '^\d{4}$');
