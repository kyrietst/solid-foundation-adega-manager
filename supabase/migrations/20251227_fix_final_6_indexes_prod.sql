-- FIX FINAL 6 UNINDEXED FOREIGN KEYS (Dev/Prod Parity)
-- Addresses final critical performance suggestions.

CREATE INDEX IF NOT EXISTS idx_batch_units_created_by ON public.batch_units(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_history_customer_id ON public.customer_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_debug_stock_calls_log_user_id ON public.debug_stock_calls_log(user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_acknowledged_by ON public.expiry_alerts(acknowledged_by);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_resolved_by ON public.expiry_alerts(resolved_by);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_created_by ON public.nps_surveys(created_by);
