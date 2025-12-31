-- Migration: get_inventory_health_metrics
-- Purpose: Calculate inventory health metrics server-side to improve performance.

CREATE OR REPLACE FUNCTION get_inventory_health_metrics(
    start_date timestamptz,
    end_date timestamptz,
    min_stock_default int DEFAULT 5
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    replenishment_list json;
    dead_stock_list json;
    top_movers_list json;
    total_stock_value numeric;
    critical_count int;
    dead_stock_count int;
BEGIN
    -- 1. Create a temporary summary of sales per product in the period
    CREATE TEMP TABLE IF NOT EXISTS temp_product_sales AS
    SELECT 
        si.product_id,
        SUM(si.quantity) as units_sold,
        COUNT(si.id) as sales_count
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE s.created_at >= start_date 
      AND s.created_at <= end_date
    GROUP BY si.product_id;

    -- 2. Calculate Total Stock Value (using cost_price)
    SELECT 
        COALESCE(SUM(
            (COALESCE(stock_packages, 0) * COALESCE(units_per_package, 1) + COALESCE(stock_units_loose, 0)) 
            * COALESCE(cost_price, 0)
        ), 0)
    INTO total_stock_value
    FROM products
    WHERE deleted_at IS NULL;

    -- 3. Prepare Replenishment List (Health: Low or Critical)
    -- Logic: Total Units <= Minimum Stock
    SELECT json_agg(t) INTO replenishment_list FROM (
        SELECT 
            p.id,
            p.name,
            p.stock_packages,
            p.stock_units_loose,
            p.units_per_package,
            COALESCE(p.minimum_stock, min_stock_default) as minimum_stock,
            p.cost_price,
            p.image_url,
            (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) as total_units,
            CASE 
                WHEN (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) = 0 THEN 'critical'
                ELSE 'low'
            END as status,
            COALESCE(ts.units_sold, 0) as units_sold_30d
        FROM products p
        LEFT JOIN temp_product_sales ts ON p.id = ts.product_id
        WHERE p.deleted_at IS NULL
          AND (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) <= COALESCE(p.minimum_stock, min_stock_default)
        ORDER BY COALESCE(ts.units_sold, 0) DESC -- Prioritize high turnaround items
    ) t;

    -- 4. Prepare Dead Stock List
    -- Logic: Total Units > 0 AND No Sales in period
    SELECT json_agg(t) INTO dead_stock_list FROM (
        SELECT 
            p.id,
            p.name,
            p.stock_packages,
            p.stock_units_loose,
            p.units_per_package,
            COALESCE(p.minimum_stock, min_stock_default) as minimum_stock,
            p.cost_price,
            p.image_url,
            (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) as total_units,
            'ok' as status,
            30 as days_without_sale, -- Placeholder
            ((COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) * COALESCE(p.cost_price, 0)) as stuck_value
        FROM products p
        LEFT JOIN temp_product_sales ts ON p.id = ts.product_id
        WHERE p.deleted_at IS NULL
          AND (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) > 0
          AND ts.product_id IS NULL
        ORDER BY stuck_value DESC -- Prioritize highest value stuck
    ) t;

    -- 5. Prepare Top Movers
    SELECT json_agg(t) INTO top_movers_list FROM (
        SELECT 
            p.id,
            p.name,
            p.stock_packages,
            p.stock_units_loose,
            p.units_per_package,
            COALESCE(p.minimum_stock, min_stock_default) as minimum_stock,
            (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) as total_units,
            COALESCE(ts.units_sold, 0) as units_sold_30d
        FROM products p
        JOIN temp_product_sales ts ON p.id = ts.product_id
        WHERE p.deleted_at IS NULL
        ORDER BY ts.units_sold DESC
        LIMIT 5
    ) t;

    -- Cleanup
    DROP TABLE temp_product_sales;

    -- Construct Final JSON
    result := json_build_object(
        'replenishment', COALESCE(replenishment_list, '[]'::json),
        'deadStock', COALESCE(dead_stock_list, '[]'::json),
        'topMovers', COALESCE(top_movers_list, '[]'::json),
        'totalStockValue', total_stock_value,
        'totalProducts', (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL)
    );

    RETURN result;
END;
$$;
