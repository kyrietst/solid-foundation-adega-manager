-- Migration: Enable Row Level Security (RLS) - 2025-12-26
-- Description: Enables RLS on all public tables that have policies but RLS disabled.
-- Security: High Criticality. Prevents unauthorized access to full table data.

-- 1. Enable RLS on Core Business Tables
ALTER TABLE IF EXISTS public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customers ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on Financial Tables
ALTER TABLE IF EXISTS public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expense_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operational_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on User/System Tables
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_logs ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on Delivery & Operations Tables
ALTER TABLE IF EXISTS public.delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.batch_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_batches ENABLE ROW LEVEL SECURITY;

-- 5. Enable RLS on Analytics & Feedback Tables
ALTER TABLE IF EXISTS public.customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.product_cost_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
