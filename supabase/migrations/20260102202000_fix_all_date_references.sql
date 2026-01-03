-- ============================================================================
-- Migration: FIX - Remover TODAS referências à coluna 'date'
-- Data: 2026-01-02
-- Descrição: 
-- 1. Corrige set_product_stock_absolute (usada no Modal de Ajuste).
-- 2. Corrige View product_movement_history (usada no Histórico de Ajustes).
-- 3. Corrige get_inventory_summary (usada no Dashboard).
-- ============================================================================

-- 1. FIX set_product_stock_absolute
CREATE OR REPLACE FUNCTION public.set_product_stock_absolute(p_product_id uuid, p_new_packages integer, p_new_units_loose integer, p_reason text, p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_old_packages INTEGER;
    v_old_units_loose INTEGER;
    v_units_per_package INTEGER;
    v_package_change INTEGER;
    v_units_change INTEGER;
    v_total_unit_change INTEGER;
    v_product_name TEXT;
    v_movement_type movement_type;
    v_result JSON;
BEGIN
    PERFORM set_config('app.called_from_rpc', 'true', true);
    
    SELECT stock_packages, stock_units_loose, units_per_package, name
    INTO v_old_packages, v_old_units_loose, v_units_per_package, v_product_name
    FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto com ID % não encontrado', p_product_id; END IF;
    IF p_new_packages < 0 OR p_new_units_loose < 0 THEN RAISE EXCEPTION 'Valores de estoque não podem ser negativos.'; END IF;
    
    v_package_change := p_new_packages - COALESCE(v_old_packages, 0);
    v_units_change := p_new_units_loose - COALESCE(v_old_units_loose, 0);
    v_total_unit_change := (v_package_change * COALESCE(v_units_per_package, 1)) + v_units_change;
    
    IF v_package_change != 0 OR v_units_change != 0 THEN
        v_movement_type := 'inventory_adjustment'::movement_type;
        -- CORRECAO: Usar created_at em vez de date
        INSERT INTO inventory_movements (
            product_id, type_enum, quantity_change, reason, user_id, created_at
        ) VALUES (
            p_product_id, 
            v_movement_type,        -- type_enum (enum)
            v_total_unit_change,    -- quantity_change (integer)
            p_reason, p_user_id, NOW()
        );
    END IF;
    
    UPDATE products SET stock_packages = p_new_packages, stock_units_loose = p_new_units_loose, updated_at = NOW() WHERE id = p_product_id;
    
    v_result := jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'audit_recorded', (v_package_change != 0 OR v_units_change != 0),
        'timestamp', NOW()
    );
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro em set_product_stock_absolute: % - %', SQLERRM, SQLSTATE;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$;

-- 2. FIX View product_movement_history
DROP VIEW IF EXISTS public.product_movement_history;
CREATE OR REPLACE VIEW public.product_movement_history AS
 SELECT im.id,
    im.created_at AS date, -- Alias para manter compatibilidade com frontend
    (im.type_enum)::text AS type,
    abs(im.quantity_change) AS quantity,
    im.reason,
    'system'::text AS source,
    im.previous_stock,
    im.new_stock_quantity AS new_stock,
    im.reason AS notes,
    p.name AS product_name,
    p.category AS product_category,
    u.name AS user_name,
    u.role AS user_role,
    im.quantity_change AS stock_change,
        CASE
            WHEN (im.type_enum = 'stock_transfer_in'::public.movement_type) THEN 'Entrada'::text
            WHEN (im.type_enum = 'initial_stock'::public.movement_type) THEN 'Estoque Inicial'::text
            WHEN (im.type_enum = 'stock_transfer_out'::public.movement_type) THEN 'Saída'::text
            WHEN (im.type_enum = 'sale'::public.movement_type) THEN 'Venda'::text
            WHEN (im.type_enum = 'inventory_adjustment'::public.movement_type) THEN 'Ajuste'::text
            WHEN (im.type_enum = 'return'::public.movement_type) THEN 'Devolução'::text
            WHEN (im.type_enum = 'personal_consumption'::public.movement_type) THEN 'Consumo Pessoal'::text
            ELSE (im.type_enum)::text
        END AS type_display,
        CASE
            WHEN (im.quantity_change > 0) THEN 'success'::text
            WHEN (im.quantity_change < 0) THEN 'error'::text
            ELSE 'default'::text
        END AS type_variant
   FROM ((public.inventory_movements im
     LEFT JOIN public.products p ON ((im.product_id = p.id)))
     LEFT JOIN public.profiles u ON ((im.user_id = u.id)))
  ORDER BY im.created_at DESC; -- Ordenar por created_at

-- 3. FIX get_inventory_summary
CREATE OR REPLACE FUNCTION public.get_inventory_summary(start_date timestamp with time zone, end_date timestamp with time zone, period_type text DEFAULT 'day'::text)
 RETURNS TABLE(period_start text, period_label text, products_sold bigint, products_added bigint, out_of_stock bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    WITH periods AS (
        SELECT date_trunc(period_type, dd AT TIME ZONE 'America/Sao_Paulo')::date as period_start
        FROM generate_series(start_date, end_date, '1 day'::interval) dd
        GROUP BY 1
    ),
    inventory_data AS (
        SELECT
            date_trunc(period_type, created_at AT TIME ZONE 'America/Sao_Paulo')::date as period_start, -- FIX: created_at
            SUM(CASE WHEN type_enum = 'sale'::movement_type THEN ABS(quantity_change) ELSE 0 END) as products_sold, -- FIX: Logica melhorada
            SUM(CASE WHEN type_enum IN ('stock_transfer_in', 'initial_stock') THEN quantity_change ELSE 0 END) as products_added
        FROM inventory_movements
        WHERE created_at BETWEEN start_date AND end_date -- FIX: created_at
        GROUP BY 1
    ),
    stock_status AS (
        SELECT
            date_trunc(period_type, created_at AT TIME ZONE 'America/Sao_Paulo')::date as period_start,
            COUNT(*) as out_of_stock
        FROM products
        WHERE (stock_packages * units_per_package + stock_units_loose) = 0
        GROUP BY 1
    )
    SELECT
        to_char(p.period_start, 'YYYY-MM-DD') as period_start,
        CASE 
            WHEN period_type = 'day' THEN to_char(p.period_start, 'DD/MM/YYYY')
            WHEN period_type = 'week' THEN 'Semana ' || to_char(p.period_start, 'IYYY-W"IW"')
            WHEN period_type = 'month' THEN to_char(p.period_start, 'MM/YYYY')
            WHEN period_type = 'quarter' THEN 'T' || to_char(p.period_start, 'Q/YYYY')
            ELSE to_char(p.period_start, 'DD/MM/YYYY')
        END AS period_label,
        COALESCE(id.products_sold, 0)::bigint as products_sold,
        COALESCE(id.products_added, 0)::bigint as products_added,
        COALESCE(ss.out_of_stock, 0)::bigint as out_of_stock
    FROM periods p
    LEFT JOIN inventory_data id ON p.period_start = id.period_start
    LEFT JOIN stock_status ss ON p.period_start = ss.period_start
    ORDER BY p.period_start;
$function$;

-- Notificar reload
NOTIFY pgrst, 'reload schema';
