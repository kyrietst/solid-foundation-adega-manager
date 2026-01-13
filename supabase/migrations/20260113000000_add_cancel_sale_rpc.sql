-- Migration: Add cancel_sale RPC
-- Description: Adds a function to safely cancel a sale and return items to stock.

CREATE OR REPLACE FUNCTION "public"."cancel_sale"("p_sale_id" "uuid", "p_reason" "text" DEFAULT 'Cancelamento manual'::"text") 
RETURNS "jsonb"
LANGUAGE "plpgsql" 
SECURITY DEFINER
AS $$
DECLARE
    v_sale_status "sales_status_enum";
    v_item RECORD;
    v_invoice_exists boolean;
BEGIN
    -- 1. Get current status
    SELECT "status_enum" INTO v_sale_status
    FROM "sales" 
    WHERE "id" = p_sale_id;
    
    -- Check if found
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Venda não encontrada.');
    END IF;

    -- Check if already cancelled
    IF v_sale_status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Venda já está cancelada.');
    END IF;

    -- Check for authorized invoice directly in invoice_logs
    SELECT EXISTS (
        SELECT 1 FROM "invoice_logs" 
        WHERE "sale_id" = p_sale_id 
        AND "status" = 'authorized'
    ) INTO v_invoice_exists;

    -- Optional: Block cancellation if invoice exists (Uncomment to enforce)
    -- IF v_invoice_exists THEN
    --     RETURN jsonb_build_object('success', false, 'message', 'Venda possui Nota Fiscal autorizada. Cancele a nota primeiro.');
    -- END IF;

    -- 2. Loop items and restore stock
    FOR v_item IN SELECT * FROM "sale_items" WHERE "sale_id" = p_sale_id LOOP
        -- Call create_inventory_movement to RESTORE stock
        -- Using 'return' as movement_type (verified enum)
        -- passing quantity (positive) to add back to stock
        PERFORM "public"."create_inventory_movement"(
            v_item.product_id,
            (v_item.quantity)::integer, -- Quantity to add back (positive)
            'return', -- movement_type enum value cast to text for the function
            p_reason,
            jsonb_build_object('sale_id', p_sale_id, 'action', 'cancel_sale'),
            v_item.sale_type -- 'unit' or 'package'
        );
    END LOOP;

    -- 3. Update sale status (Soft Delete)
    UPDATE "sales" 
    SET "status" = 'cancelled',
        "status_enum" = 'cancelled',
        "updated_at" = now()
    WHERE "id" = p_sale_id;

    RETURN jsonb_build_object('success', true, 'message', 'Venda cancelada e estoque estornado com sucesso.');
END;
$$;

ALTER FUNCTION "public"."cancel_sale"("p_sale_id" "uuid", "p_reason" "text") OWNER TO "postgres";
