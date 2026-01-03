-- ============================================================================
-- Migration: FIX - Process Sale RPC Sync
-- Data: 2026-01-02
-- Descrição: 
-- 1. Remove versões antigas/sobrecarregadas de process_sale.
-- 2. Recria process_sale usando a assinatura correta de create_inventory_movement.
-- ============================================================================

-- 1. Dropar versões anteriores para evitar ambiguidade
DROP FUNCTION IF EXISTS public.process_sale(uuid, uuid, numeric, numeric, numeric, text, boolean, text, jsonb, numeric, jsonb, uuid, uuid);
DROP FUNCTION IF EXISTS public.process_sale(uuid, uuid, jsonb[], numeric, numeric, uuid, numeric, text, boolean, numeric, text, uuid, text);

-- 2. Criar a versão definitiva e limpa
CREATE OR REPLACE FUNCTION public.process_sale(
    p_customer_id uuid,
    p_user_id uuid,
    p_items jsonb, -- Array de itens [{product_id, quantity, unit_price, sale_type}, ...]
    p_total_amount numeric,
    p_final_amount numeric,
    p_payment_method_id uuid DEFAULT NULL,
    p_discount_amount numeric DEFAULT 0,
    p_payment_method text DEFAULT NULL, -- Deprecated (legacy fallback)
    p_is_delivery boolean DEFAULT false,
    p_notes text DEFAULT NULL,
    p_delivery_fee numeric DEFAULT 0,
    p_delivery_address text DEFAULT NULL, -- Simplificado para text, front manda string
    p_delivery_person_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sale_id uuid;
    v_item jsonb;
    v_product_id uuid;
    v_quantity numeric;
    v_unit_price numeric;
    v_sale_type text;
    v_payment_method_id_final uuid;
BEGIN
    -- 1. Resolver Payment Method ID
    IF p_payment_method_id IS NOT NULL THEN
        v_payment_method_id_final := p_payment_method_id;
    ELSE
        -- Fallback: Tentar achar pelo texto legado
        SELECT id INTO v_payment_method_id_final
        FROM payment_methods
        WHERE code = p_payment_method OR name ILIKE p_payment_method
        LIMIT 1;
    END IF;

    -- 2. Inserir Venda (Header)
    INSERT INTO sales (
        customer_id,
        user_id,
        total_amount,
        final_amount,
        discount_amount,
        payment_method_id,
        payment_method, -- Legacy
        is_delivery,
        notes,
        status,
        created_at,
        delivery_fee,
        delivery_address, -- Ajustado para coluna correta
        delivery_person_id
    ) VALUES (
        p_customer_id,
        p_user_id,
        p_total_amount,
        p_final_amount,
        p_discount_amount,
        v_payment_method_id_final,
        p_payment_method,
        p_is_delivery,
        p_notes,
        'completed', -- Venda direta já nasce completada? Geralmente sim no PDV.
        NOW(),
        p_delivery_fee,
        p_delivery_address,
        p_delivery_person_id
    )
    RETURNING id INTO v_sale_id;

    -- 3. Processar Itens
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity := (v_item->>'quantity')::numeric;
        v_unit_price := (v_item->>'unit_price')::numeric;
        v_sale_type := COALESCE(v_item->>'sale_type', 'unit');

        -- A. Movimentar Estoque (RPC Call)
        -- OBS: Quantidade negativa para saída (Venda)
        PERFORM create_inventory_movement(
            v_product_id,
            -(v_quantity::integer), -- Cast para int, garantindo negativo
            'sale', -- Type (Text) - CORREÇÃO DA ASSINATURA CHEGANDO AQUI
            'Venda #' || v_sale_id::text,
            jsonb_build_object(
                'sale_id', v_sale_id,
                'sale_type', v_sale_type
            ),
            v_sale_type -- Movement Type (unit/package)
        );

        -- B. Inserir Item da Venda
        INSERT INTO sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            sale_type
            -- fiscal_snapshot é preenchido via trigger trg_set_fiscal_snapshot
        ) VALUES (
            v_sale_id,
            v_product_id,
            v_quantity,
            v_unit_price,
            (v_quantity * v_unit_price),
            v_sale_type
        );

    END LOOP;

    RETURN jsonb_build_object(
        'sale_id', v_sale_id,
        'status', 'success',
        'message', 'Venda realizada com sucesso'
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro em process_sale: %', SQLERRM;
END;
$$;
