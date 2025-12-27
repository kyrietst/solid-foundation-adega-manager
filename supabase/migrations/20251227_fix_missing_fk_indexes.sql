-- FIX: UNINDEXED FOREIGN KEYS (Supabase Advisor)
-- Creates missing indexes for foreign key columns to optimize JOIN performance.

BEGIN;

-- 1. CONTAS E LOGS
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer_id ON public.accounts_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_sale_id ON public.accounts_receivable(sale_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_customer_id ON public.automation_logs(customer_id);
-- audit_logs: generic check, if auth.uid exists usually logged in 'user_id' or similar, but sticking to request list.

-- 2. ESTOQUE E PRODUTOS
CREATE INDEX IF NOT EXISTS idx_batch_units_batch_id ON public.batch_units(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_units_product_id ON public.batch_units(product_id);

CREATE INDEX IF NOT EXISTS idx_categories_created_by ON public.categories(created_by);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_customer_id ON public.inventory_movements(customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_related_sale_id ON public.inventory_movements(related_sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_sale_id ON public.inventory_movements(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_user_id ON public.inventory_movements(user_id);

CREATE INDEX IF NOT EXISTS idx_product_batches_created_by ON public.product_batches(created_by);

CREATE INDEX IF NOT EXISTS idx_product_cost_history_created_by ON public.product_cost_history(created_by);

CREATE INDEX IF NOT EXISTS idx_products_deleted_by ON public.products(deleted_by);

-- 3. VENDAS E CLIENTES
CREATE INDEX IF NOT EXISTS idx_customer_events_customer_id ON public.customer_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_insights_customer_id ON public.customer_insights(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_associated_sale_id ON public.customer_interactions(associated_sale_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_by ON public.customer_interactions(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON public.customer_interactions(customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_deleted_by ON public.customers(deleted_by);
CREATE INDEX IF NOT EXISTS idx_customers_favorite_product ON public.customers(favorite_product);

CREATE INDEX IF NOT EXISTS idx_nps_surveys_customer_id ON public.nps_surveys(customer_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_sale_id ON public.nps_surveys(sale_id);

-- Sales
CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON public.sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_person_id ON public.sales(delivery_person_id);
-- Extra safety for common delivery column
CREATE INDEX IF NOT EXISTS idx_sales_delivery_user_id ON public.sales(delivery_user_id);

-- 4. FINANCEIRO E CONFIG
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_created_by ON public.delivery_tracking(created_by);

CREATE INDEX IF NOT EXISTS idx_expense_budgets_created_by ON public.expense_budgets(created_by);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_operational_expenses_category_id ON public.operational_expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON public.suppliers(created_by);

COMMIT;
