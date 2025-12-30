-- Migration: Add Fiscal Columns to Products - 2025-12-26
-- Description: Adds NCM, CEST, CFOP, and Origin columns to support NF-e/NFC-e emission.
-- Security: Standard columns, inherits existing RLS.

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS ncm text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cest text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cfop text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS origin text DEFAULT NULL;

-- Add comments for documentation and linter compliance
COMMENT ON COLUMN public.products.ncm IS 'Nomenclatura Comum do Mercosul (8 digits)';
COMMENT ON COLUMN public.products.cest IS 'Código Especificador da Substituição Tributária (7 digits)';
COMMENT ON COLUMN public.products.cfop IS 'Código Fiscal de Operações e Prestações (4 digits)';
COMMENT ON COLUMN public.products.origin IS 'Origem da Mercadoria (0-8 codes)';
