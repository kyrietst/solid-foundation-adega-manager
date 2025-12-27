-- FINAL PERFORMANCE FIX: 6 Remaining Unindexed FKs
-- Applying strictly verifying column names.

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_batch_id ON public.expiry_alerts(batch_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_product_id ON public.expiry_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_product_cost_history_product_id ON public.product_cost_history(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
