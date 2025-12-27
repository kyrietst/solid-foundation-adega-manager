-- Fix Security Definer Views (Switch to Invoker for RLS safety)
ALTER VIEW public.product_movement_history SET (security_invoker = true);
ALTER VIEW public.vw_kyrie_intelligence_margins SET (security_invoker = true);
ALTER VIEW public.dual_stock_summary SET (security_invoker = true);

-- Fix Materialized View Permissions (Revoke Public/Anon Access)
-- These are sensitive internal KPIs, should not be public.
REVOKE SELECT ON TABLE public.mv_financial_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_customer_segmentation_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_daily_sales_kpis FROM anon;

-- Grant access only to Authenticated (Admins/Employees) if not already
GRANT SELECT ON TABLE public.mv_financial_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_customer_segmentation_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_daily_sales_kpis TO authenticated;
