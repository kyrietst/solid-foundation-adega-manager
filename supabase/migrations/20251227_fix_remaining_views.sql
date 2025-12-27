-- Fix Remaining Security Definer Views
ALTER VIEW public.activity_logs_view SET (security_invoker = true);
ALTER VIEW public.v_customer_purchases SET (security_invoker = true);
ALTER VIEW public.v_customer_stats SET (security_invoker = true);
