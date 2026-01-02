-- ============================================================================
-- Migration: FIX - Resolver Ambiguidade de RPC e Permissões
-- Data: 2026-01-02
-- Descrição: 
-- 1. Remove a versão antiga da função (que aceitava Enum e tinha o bug da coluna 'date').
-- 2. Garante permissões de execução para a nova função (que aceita Text).
-- 3. Recarrega o cache do schema (necessário para PostgREST).
-- ============================================================================

-- 1. Dropar explicitamente a função com a assinatura antiga (Enum)
DROP FUNCTION IF EXISTS create_inventory_movement(uuid, integer, movement_type, text, jsonb, text);

-- 2. Garantir permissões na nova função (assinatura Text)
GRANT EXECUTE ON FUNCTION create_inventory_movement(uuid, integer, text, text, jsonb, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_inventory_movement(uuid, integer, text, text, jsonb, text) TO service_role;
GRANT EXECUTE ON FUNCTION create_inventory_movement(uuid, integer, text, text, jsonb, text) TO anon; -- Se necessário, mas geralmente authenticated basta

-- 3. Notificar o PostgREST para recarregar o schema
NOTIFY pgrst, 'reload schema';
