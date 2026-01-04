-- REMOÇÃO DE ARTEFATOS DE DEBUG (PRÉ-PRODUÇÃO)

-- 1. Remover tabela de log de debug de estoque (Risco: Baixo - Dados efêmeros)
DROP TABLE IF EXISTS "public"."debug_stock_calls_log";

-- 2. Remover função de importação legada não utilizada (Risco: Baixo - Dead Code)
DROP FUNCTION IF EXISTS "public"."import_delivery_csv_row";

-- 3. Limpar logs de sistema para início limpo (Manter estrutura, limpar dados)
-- audit_logs pode não existir em dev, então usamos IF EXISTS logic se fosse tabela, mas truncate não tem isso.
-- Assumindo que a tabela existe pois foi listada na auditoria.
TRUNCATE TABLE "public"."audit_logs";
