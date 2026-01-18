
-- Migration: Fix process_sale to correctly persist delivery_fee and enforce is_delivery consistency
-- Date: 2026-01-18

CREATE OR REPLACE FUNCTION public.process_sale(
    p_customer_id uuid,
    p_user_id uuid,
    p_items jsonb,
    p_total_amount numeric,
    p_final_amount numeric,
    p_payments jsonb, -- Array of { method_id, amount, installments }
    p_discount_amount numeric DEFAULT 0,
    p_is_delivery boolean DEFAULT false,
    p_notes text DEFAULT NULL::text,
    p_delivery_fee numeric DEFAULT 0,
    p_delivery_address text DEFAULT NULL::text,
    p_delivery_person_id uuid DEFAULT NULL::uuid,
    p_delivery_instructions text DEFAULT NULL::text,
    p_payment_status text DEFAULT 'paid'
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_sale_id uuid;
    v_item jsonb;
    v_payment jsonb;
    v_product_id uuid;
    v_quantity numeric;
    v_unit_price numeric;
    v_sale_type text;
    v_final_notes text;
    v_delivery_address_json jsonb;
    v_total_payments numeric := 0;
    v_legacy_payment_method_id uuid;
    v_legacy_payment_method_type text;
    v_legacy_payment_method_name text;
    v_is_delivery boolean;
BEGIN
    -- 1. Validation: Check if payments match total
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        v_total_payments := v_total_payments + (v_payment->>'amount')::numeric;
    END LOOP;

    -- Allow small float diff (0.05)
    IF ABS(v_total_payments - p_final_amount) > 0.05 THEN
        RAISE EXCEPTION 'Erro de Integridade: Soma dos pagamentos (%s) difere do valor final da venda (%s)', v_total_payments, p_final_amount;
    END IF;

    -- Resolve Legacy Payment Method (Use the first one as "Main" for compatibility)
    v_item := p_payments->0; 
    IF v_item IS NOT NULL THEN
        v_legacy_payment_method_id := (v_item->>'method_id')::uuid;
        
        SELECT type, name INTO v_legacy_payment_method_type, v_legacy_payment_method_name
        FROM payment_methods 
        WHERE id = v_legacy_payment_method_id;
    END IF;

    -- Fallback for legacy (Default to 'other')
    v_legacy_payment_method_type := COALESCE(v_legacy_payment_method_type, 'other');
    v_legacy_payment_method_name := COALESCE(v_legacy_payment_method_name, 'Outros');

    -- Concatenar notas
    v_final_notes := p_notes;
    IF p_delivery_instructions IS NOT NULL AND p_delivery_instructions <> '' AND p_delivery_instructions <> COALESCE(p_notes, '') THEN
        v_final_notes := COALESCE(v_final_notes, '') || ' | Entregar: ' || p_delivery_instructions;
    END IF;

    -- Converter endereço
    BEGIN
        v_delivery_address_json := p_delivery_address::jsonb;
    EXCEPTION WHEN OTHERS THEN
        v_delivery_address_json := NULL;
    END;

    -- LOGIC FIX: Enforce is_delivery if delivery_fee > 0
    -- This ensures that even if frontend sends is_delivery=false but sends a fee (e.g. Fiado Delivery),
    -- the sale is treated as a delivery sale in the database context.
    v_is_delivery := p_is_delivery;
    IF p_delivery_fee > 0 THEN
        v_is_delivery := true;
    END IF;

    -- 2. CREATE SALES HEADER
    INSERT INTO sales (
        customer_id,
        user_id,
        total_amount,
        final_amount,
        discount_amount,
        payment_method_id, -- Legacy
        payment_method_enum, -- Legacy (Enum)
        payment_method, -- Legacy (Text) NOT NULL
        payment_status, 
        delivery, -- Corrected flag
        notes,
        status,
        created_at,
        delivery_fee, -- Explicitly inserting the fee
        delivery_address,
        delivery_person_id
    ) VALUES (
        p_customer_id,
        p_user_id,
        p_total_amount,
        p_final_amount,
        p_discount_amount,
        v_legacy_payment_method_id,
        v_legacy_payment_method_type::payment_method_enum,
        v_legacy_payment_method_name,
        p_payment_status,
        v_is_delivery, -- Using the computed flag
        v_final_notes,
        'completed',
        NOW(),
        p_delivery_fee, -- Persisting the fee
        v_delivery_address_json,
        p_delivery_person_id
    )
    RETURNING id INTO v_sale_id;

    -- 3. INSERT PAYMENTS (SPLIT)
    FOR v_payment IN SELECT * FROM jsonb_array_elements(p_payments)
    LOOP
        INSERT INTO sale_payments (
            sale_id,
            payment_method_id,
            amount,
            installments
        ) VALUES (
            v_sale_id,
            (v_payment->>'method_id')::uuid,
            (v_payment->>'amount')::numeric,
            COALESCE((v_payment->>'installments')::int, 1)
        );
    END LOOP;

    -- 4. PROCESS ITEMS & INVENTORY
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
            sale_type
        ) VALUES (
            v_sale_id,
            v_product_id,
            v_quantity,
            v_unit_price,
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
$function$;
