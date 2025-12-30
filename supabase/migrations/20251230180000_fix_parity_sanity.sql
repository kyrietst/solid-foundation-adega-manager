-- Migration to align PROD with DEV (Source of Truth)
-- Removes ghost tables and columns, adds missing view and columns

-- 1. Remove Ghost Tables (Legacy/Unused)
DROP TABLE IF EXISTS "public"."inventory";
DROP TABLE IF EXISTS "public"."inventory_conversion_log";

-- 2. Remove Ghost Views
DROP VIEW IF EXISTS "public"."v_customer_timeline";

-- 3. Sanitize 'sale_items' (Remove legacy columns)
ALTER TABLE "public"."sale_items" 
  DROP COLUMN IF EXISTS "variant_id",
  DROP COLUMN IF EXISTS "product_description_legacy";

-- 4. Add missing columns to 'customer_insights' (Parity with DEV)
ALTER TABLE "public"."customer_insights"
  ADD COLUMN IF NOT EXISTS "last_purchase_date" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS "total_spent" numeric,
  ADD COLUMN IF NOT EXISTS "frequency_score" integer,
  ADD COLUMN IF NOT EXISTS "monetary_score" integer,
  ADD COLUMN IF NOT EXISTS "recency_score" integer,
  ADD COLUMN IF NOT EXISTS "churn_risk" text,
  ADD COLUMN IF NOT EXISTS "custom_segment" text,
  ADD COLUMN IF NOT EXISTS "calculated_at" timestamp with time zone DEFAULT now();

-- 5. Create missing View 'vw_kyrie_intelligence_margins'
CREATE OR REPLACE VIEW "public"."vw_kyrie_intelligence_margins" AS
SELECT 
    p.name AS product_name,
    p.category AS category_name,
    count(si.id) AS times_sold,
    sum(si.quantity) AS total_units_sold,
    sum(si.quantity::numeric * si.unit_price) AS total_revenue,
    sum(si.quantity::numeric * COALESCE(p.cost_price, 0::numeric)) AS total_cost,
    sum(si.quantity::numeric * si.unit_price) - sum(si.quantity::numeric * COALESCE(p.cost_price, 0::numeric)) AS gross_profit,
    CASE
        WHEN sum(si.quantity::numeric * si.unit_price) > 0::numeric THEN round((sum(si.quantity::numeric * si.unit_price) - sum(si.quantity::numeric * COALESCE(p.cost_price, 0::numeric))) / sum(si.quantity::numeric * si.unit_price) * 100::numeric, 2)
        ELSE 0::numeric
    END AS margin_percent
FROM sale_items si
JOIN products p ON si.product_id = p.id
JOIN sales s ON si.sale_id = s.id
WHERE s.status_enum = 'completed'::sales_status_enum AND s.created_at >= (CURRENT_DATE - '60 days'::interval)
GROUP BY p.id, p.name, p.category
ORDER BY (sum(si.quantity::numeric * si.unit_price) - sum(si.quantity::numeric * COALESCE(p.cost_price, 0::numeric))) DESC;
