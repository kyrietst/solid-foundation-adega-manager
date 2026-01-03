-- ============================================================================
-- Migration: FIX - Process Sale RPC Sync (v4)
-- Data: 2026-01-02
-- Descrição: 
-- 1. Corrige tipo de dado: 'delivery_address' é JSONB, mas parametro é TEXT.
-- 2. Faz o CAST explícito p_delivery_address::jsonb.
-- ============================================================================

-- Dropar signature exata criada na v1 (para substituir)
DROP FUNCTION IF EXISTS public.process_sale(uuid, uuid, jsonb, numeric, numeric, uuid, numeric, text, boolean, text, numeric, text, uuid, text);

CREATE OR REPLACE FUNCTION public.process_sale(
    p_customer_id uuid,
    p_user_id uuid,
    p_items jsonb,
    p_total_amount numeric,
    p_final_amount numeric,
    p_payment_method_id uuid DEFAULT NULL,
    p_discount_amount numeric DEFAULT 0,
    p_payment_method text DEFAULT NULL,
    p_is_delivery boolean DEFAULT false,
    p_notes text DEFAULT NULL,
    p_delivery_fee numeric DEFAULT 0,
    p_delivery_address text DEFAULT NULL,
    p_delivery_person_id uuid DEFAULT NULL,
    p_delivery_instructions text DEFAULT NULL
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
    v_final_notes text;
    v_delivery_address_json jsonb;
BEGIN
    -- 1. Resolver Payment Method ID
    IF p_payment_method_id IS NOT NULL THEN
        v_payment_method_id_final := p_payment_method_id;
    ELSE
        SELECT id INTO v_payment_method_id_final
        FROM payment_methods
        WHERE code = p_payment_method OR name ILIKE p_payment_method
        LIMIT 1;
    END IF;

    -- Concatenar notas se instrucoes existirem e forem diferentes
    v_final_notes := p_notes;
    IF p_delivery_instructions IS NOT NULL AND p_delivery_instructions <> '' AND p_delivery_instructions <> COALESCE(p_notes, '') THEN
        v_final_notes := COALESCE(v_final_notes, '') || ' | Entregar: ' || p_delivery_instructions;
    END IF;

    -- Tentar converter endereço para JSONB de forma segura
    BEGIN
        v_delivery_address_json := p_delivery_address::jsonb;
    EXCEPTION WHEN OTHERS THEN
        -- Se falhar (ex: texto plano não formatado), converte para string JSON básica
        v_delivery_address_json := to_jsonb(p_delivery_address);
    END;

    -- 2. Inserir Venda (Header)
    INSERT INTO sales (
        customer_id,
        user_id,
        total_amount,
        final_amount,
        discount_amount,
        payment_method_id,
        payment_method,
        delivery, 
        notes,
        status,
        created_at,
        delivery_fee,
        delivery_address, -- JSONB
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
        v_final_notes,
        'completed',
        NOW(),
        p_delivery_fee,
        v_delivery_address_json, -- Usar variavel convertida
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

        PERFORM create_inventory_movement(
            v_product_id,
            -(v_quantity::integer),
            'sale',
            'Venda #' || v_sale_id::text,
            jsonb_build_object(
                'sale_id', v_sale_id,
                'sale_type', v_sale_type
            ),
            v_sale_type
        );

        INSERT INTO sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            sale_type
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

NOTIFY pgrst, 'reload schema';
