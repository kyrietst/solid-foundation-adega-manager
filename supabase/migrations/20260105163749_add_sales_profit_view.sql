CREATE OR REPLACE VIEW v_sales_with_profit AS
SELECT 
    s.id,
    s.created_at,
    s.customer_id,
    s.user_id,
    s.status,
    s.payment_method,
    s.payment_status,
    s.delivery,
    s.delivery_fee,
    s.discount_amount,
    s.final_amount,
    s.notes,
    -- Total Amount calculated from items (if needed as fallback)
    (
        SELECT COALESCE(SUM(si.quantity * si.unit_price), 0)
        FROM sale_items si
        WHERE si.sale_id = s.id
    ) as total_amount,
    -- Total Cost calculated from current product cost
    (
        SELECT COALESCE(SUM(si.quantity * p.cost_price), 0)
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = s.id
    ) as total_cost,
    -- Total Profit = Final Amount - Total Cost
    (
       COALESCE(s.final_amount, 0) - 
       (
            SELECT COALESCE(SUM(si.quantity * p.cost_price), 0)
            FROM sale_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.sale_id = s.id
       )
    ) as total_profit
FROM sales s;

GRANT SELECT ON v_sales_with_profit TO authenticated;
GRANT SELECT ON v_sales_with_profit TO service_role;
