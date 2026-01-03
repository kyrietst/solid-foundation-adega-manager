-- Add Fiscal Columns to Customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS cpf_cnpj text,
ADD COLUMN IF NOT EXISTS ie text,
ADD COLUMN IF NOT EXISTS indicador_ie integer DEFAULT 9;

-- Add usage comment
COMMENT ON COLUMN customers.cpf_cnpj IS 'CPF (11) or CNPJ (14) - Unique identifier';
COMMENT ON COLUMN customers.ie IS 'Inscricao Estadual';
COMMENT ON COLUMN customers.indicador_ie IS '1=Contribuinte, 2=Isento, 9=Nao Contribuinte';

-- Add constraint for unique CPF/CNPJ if not null/empty
-- We use a partial index or just a unique constraint that ignores nulls (standard in Postgres)
-- But let's check if we strictly want unique. Yes.
ALTER TABLE customers
DROP CONSTRAINT IF EXISTS customers_cpf_cnpj_key;

ALTER TABLE customers
ADD CONSTRAINT customers_cpf_cnpj_key UNIQUE (cpf_cnpj);
