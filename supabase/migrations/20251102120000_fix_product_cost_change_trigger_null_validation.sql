-- Migration: Fix product_cost_change trigger to prevent NULL insertion
-- Date: 2025-11-02
-- Issue: Edição de produtos falha com erro 23502 "null value in column cost_price violates not-null constraint"
-- Root Cause: Trigger tenta inserir NULL em product_cost_history.cost_price quando frontend envia cost_price=null
--
-- Context:
--   - Frontend linha 347 (InventoryManagement.tsx) força cost_price: null quando não fornecido
--   - Trigger usa "IS DISTINCT FROM" que retorna TRUE quando compara valor com NULL
--   - Exemplo: "0 IS DISTINCT FROM NULL" → TRUE → Tenta INSERT com NULL → Erro 23502
--
-- Fix:
--   - Adicionar validação "AND NEW.cost_price IS NOT NULL" na condição do trigger
--   - Só registra histórico quando cost_price tem valor real (não NULL)
--
-- Impact: CRÍTICO (P0) - Sem esta correção, edição de produtos está bloqueada em PROD

-- =====================================================
-- 1. FIX: handle_product_cost_change()
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_product_cost_change()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    -- ✅ CORREÇÃO: Adicionar validação "AND NEW.cost_price IS NOT NULL"
    -- Previne tentativa de INSERT com NULL em coluna NOT NULL
    IF OLD.cost_price IS DISTINCT FROM NEW.cost_price
       AND NEW.cost_price IS NOT NULL THEN

        -- Close the previous cost record by setting valid_to
        UPDATE product_cost_history
        SET valid_to = NOW() - INTERVAL '1 second'
        WHERE product_id = OLD.id
        AND valid_to IS NULL;

        -- Insert new cost record (garantido que cost_price não é NULL)
        INSERT INTO product_cost_history (
            product_id,
            cost_price,
            valid_from,
            valid_to,
            created_by,
            reason
        ) VALUES (
            NEW.id,
            NEW.cost_price,  -- ✅ Garantido NOT NULL pela condição acima
            NOW(),
            NULL,
            auth.uid(),
            'Product cost updated via trigger'
        );

        -- Log the change in audit_logs
        INSERT INTO audit_logs (
            table_name,
            action,
            old_data,
            new_data,
            user_id,
            ip_address
        ) VALUES (
            'products',
            'UPDATE_COST',
            jsonb_build_object('cost_price', OLD.cost_price),
            jsonb_build_object('cost_price', NEW.cost_price),
            auth.uid(),
            inet_client_addr()
        );
    END IF;

    RETURN NEW;
END;
$$;

-- =====================================================
-- 2. Atualizar comentário da function
-- =====================================================
COMMENT ON FUNCTION public.handle_product_cost_change() IS
'v2.0.0 - Registra histórico de alterações de custo do produto. Atualizado em 02/11/2025 para prevenir INSERT com cost_price NULL (erro 23502). Só registra quando cost_price tem valor real.';

-- =====================================================
-- 3. Validação pós-aplicação (comentado, apenas documentação)
-- =====================================================
/*
-- Para verificar se a migration foi aplicada corretamente:

-- 1. Verificar se function tem validação de NULL
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_product_cost_change'
  AND pg_get_functiondef(oid) LIKE '%AND NEW.cost_price IS NOT NULL%';
-- Deve retornar 1 linha (function encontrada)

-- 2. Teste funcional: Simular UPDATE com cost_price NULL
-- Este UPDATE não deve mais causar erro 23502
UPDATE products
SET price = 4.00,
    cost_price = NULL
WHERE name ILIKE '%Amstel%'
  AND deleted_at IS NULL
LIMIT 1;
-- Deve executar SEM ERRO (trigger não dispara pois cost_price é NULL)

-- 3. Teste funcional: UPDATE com cost_price válido
UPDATE products
SET cost_price = 1.50
WHERE name ILIKE '%Amstel%'
  AND deleted_at IS NULL
LIMIT 1;
-- Deve criar registro em product_cost_history

-- 4. Verificar se registro foi criado
SELECT *
FROM product_cost_history
WHERE product_id = (SELECT id FROM products WHERE name ILIKE '%Amstel%' LIMIT 1)
ORDER BY valid_from DESC
LIMIT 1;
-- Deve retornar registro com cost_price = 1.50
*/
