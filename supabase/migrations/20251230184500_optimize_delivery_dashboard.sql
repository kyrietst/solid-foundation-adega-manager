CREATE OR REPLACE FUNCTION get_delivery_performance_stats(p_start_date timestamptz, p_end_date timestamptz)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result json;
    v_delivery_sales numeric;
    v_delivery_count integer;
    v_instore_sales numeric;
    v_instore_count integer;
BEGIN
    -- Calculate Delivery Stats
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO v_delivery_sales, v_delivery_count
    FROM sales
    WHERE created_at >= p_start_date 
    AND created_at <= p_end_date
    AND delivery_type = 'delivery';

    -- Calculate In-Store Stats
    SELECT 
        COALESCE(SUM(total_amount), 0),
        COUNT(*)
    INTO v_instore_sales, v_instore_count
    FROM sales
    WHERE created_at >= p_start_date 
    AND created_at <= p_end_date
    AND (delivery_type != 'delivery' OR delivery_type IS NULL);

    -- Build JSON Result
    SELECT json_build_object(
        'delivery_orders', v_delivery_count,
        'delivery_revenue', v_delivery_sales,
        'delivery_avg_ticket', CASE WHEN v_delivery_count > 0 THEN v_delivery_sales / v_delivery_count ELSE 0 END,
        'instore_orders', v_instore_count,
        'instore_revenue', v_instore_sales,
        'instore_avg_ticket', CASE WHEN v_instore_count > 0 THEN v_instore_sales / v_instore_count ELSE 0 END,
        'delivery_growth_rate', 0,
        'instore_growth_rate', 0
    ) INTO v_result;

    RETURN v_result;
END;
$$;
