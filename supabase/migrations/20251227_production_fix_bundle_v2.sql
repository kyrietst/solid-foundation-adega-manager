-- FINAL PRODUCTION BUNDLE V2 (Nuclear Strategy + Splitted Policies + Advisor Tuning)
-- Run this script in Supabase Production SQL Editor.
-- Strategy:
-- 1. NUKE: Dynamically DROP ALL policies on target tables.
-- 2. REBUILD: Recreate Optimized policies with NO "FOR ALL" overlaps.
-- 3. HARDEN: Fix View security.
-- 4. TUNE: Apply Supabase Advisor Index suggestions (Add FK Indexes, Drop Unused).

BEGIN;

--------------------------------------------------------------------------------
-- PART 1: NUCLEAR DROP
--------------------------------------------------------------------------------
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN (
            'batch_units', 'delivery_tracking', 'delivery_zones', 'expense_budgets', 
            'expense_categories', 'product_batches', 'customer_insights', 'customers', 
            'sale_items', 'users', 'expiry_alerts', 'operational_expenses', 
            'nps_surveys', 'profiles', 'products', 'sales', 'suppliers', 'product_cost_history'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

--------------------------------------------------------------------------------
-- PART 2: REBUILD OPTIMIZED POLICIES (No Overlaps)
--------------------------------------------------------------------------------

-- A. CORE INVENTORY & SALES

-- sales
CREATE POLICY "Unified insert for sales" ON public.sales FOR INSERT TO authenticated
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Unified select for sales" ON public.sales FOR SELECT TO authenticated
USING ( true );

CREATE POLICY "Unified update for sales" ON public.sales FOR UPDATE TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified delete for sales" ON public.sales FOR DELETE TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- sale_items
CREATE POLICY "Unified select for sale_items" ON public.sale_items FOR SELECT TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
  OR
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = sale_items.sale_id
    AND sales.delivery_user_id = (select auth.uid())
  )
);
CREATE POLICY "Unified insert for sale_items" ON public.sale_items FOR INSERT TO authenticated
WITH CHECK ( (select auth.role()) = 'authenticated' );

-- products
CREATE POLICY "Unified select for products" ON public.products FOR SELECT
USING (
  (deleted_at IS NULL)
  OR
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'::user_role
  )
);
-- Split modify into insert/update/delete to avoid warnings
CREATE POLICY "Unified insert for products" ON public.products FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for products" ON public.products FOR UPDATE TO authenticated
USING (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
) WITH CHECK (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified delete for products" ON public.products FOR DELETE TO authenticated
USING (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- product_batches
CREATE POLICY "Unified select for product_batches" ON public.product_batches FOR SELECT TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);
CREATE POLICY "Unified insert for product_batches" ON public.product_batches FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for product_batches" ON public.product_batches FOR UPDATE TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
) WITH CHECK (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified delete for product_batches" ON public.product_batches FOR DELETE TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- B. LOGISTICS

-- delivery_tracking
CREATE POLICY "Unified insert for delivery_tracking" ON public.delivery_tracking FOR INSERT TO authenticated
WITH CHECK (
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'delivery'::user_role
    ) AND created_by = (select auth.uid()) 
  )
  OR
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified select for delivery_tracking" ON public.delivery_tracking FOR SELECT TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
  OR
  EXISTS (
    SELECT 1 FROM sales
    WHERE sales.id = delivery_tracking.sale_id
    AND sales.delivery_user_id = (select auth.uid())
  )
);

-- delivery_zones
CREATE POLICY "Unified all for delivery_zones" ON public.delivery_zones FOR ALL TO authenticated
USING (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- batch_units
CREATE POLICY "Unified select for batch_units" ON public.batch_units FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);
CREATE POLICY "Unified insert for batch_units" ON public.batch_units FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for batch_units" ON public.batch_units FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified delete for batch_units" ON public.batch_units FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- C. USERS & BACKOFFICE

-- profiles
CREATE POLICY "Unified select for profiles" ON public.profiles FOR SELECT
USING (
  (id = (select auth.uid())) 
  OR 
  EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = (select auth.uid())
       AND p.role IN ('admin'::user_role, 'employee'::user_role)
  )
);
CREATE POLICY "Unified update for profiles" ON public.profiles FOR UPDATE
USING ( id = (select auth.uid()) )
WITH CHECK ( id = (select auth.uid()) );
CREATE POLICY "Unified insert for profiles" ON public.profiles FOR INSERT
WITH CHECK ( id = (select auth.uid()) );

-- users
CREATE POLICY "Unified all for users" ON public.users FOR ALL TO authenticated
USING (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- customers
CREATE POLICY "Unified all for customers" ON public.customers FOR ALL TO authenticated
USING (
  EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
  OR
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'delivery'::user_role
    )
  )
);

-- suppliers
CREATE POLICY "Unified all for suppliers" ON public.suppliers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);


-- D. FINANCIALS, ALERTS & SURVEYS

-- operational_expenses
CREATE POLICY "Unified select for operational_expenses" ON public.operational_expenses FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for operational_expenses" ON public.operational_expenses FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified update for operational_expenses" ON public.operational_expenses FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
) WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for operational_expenses" ON public.operational_expenses FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- expense_budgets
CREATE POLICY "Unified select for expense_budgets" ON public.expense_budgets FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for expense_budgets" ON public.expense_budgets FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified update for expense_budgets" ON public.expense_budgets FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
) WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for expense_budgets" ON public.expense_budgets FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- expense_categories
CREATE POLICY "Unified select for expense_categories" ON public.expense_categories FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for expense_categories" ON public.expense_categories FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified update for expense_categories" ON public.expense_categories FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
) WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for expense_categories" ON public.expense_categories FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- product_cost_history
CREATE POLICY "Unified select for product_cost_history" ON public.product_cost_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);

-- customer_insights
CREATE POLICY "Unified select for customer_insights" ON public.customer_insights FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for customer_insights" ON public.customer_insights FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified update for customer_insights" ON public.customer_insights FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
) WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for customer_insights" ON public.customer_insights FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- expiry_alerts
CREATE POLICY "Unified select for expiry_alerts" ON public.expiry_alerts FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for expiry_alerts" ON public.expiry_alerts FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified update for expiry_alerts" ON public.expiry_alerts FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
) WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for expiry_alerts" ON public.expiry_alerts FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- nps_surveys
CREATE POLICY "Unified select for nps_surveys" ON public.nps_surveys FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified insert for nps_surveys" ON public.nps_surveys FOR INSERT TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified modify for nps_surveys" ON public.nps_surveys FOR UPDATE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);
CREATE POLICY "Unified delete for nps_surveys" ON public.nps_surveys FOR DELETE TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

--------------------------------------------------------------------------------
-- PART 3: SECURITY DEFINER VIEWS (Hardening)
--------------------------------------------------------------------------------

ALTER VIEW public.product_movement_history SET (security_invoker = true);
ALTER VIEW public.vw_kyrie_intelligence_margins SET (security_invoker = true);
ALTER VIEW public.dual_stock_summary SET (security_invoker = true);
ALTER VIEW public.activity_logs_view SET (security_invoker = true);
ALTER VIEW public.v_customer_purchases SET (security_invoker = true);
ALTER VIEW public.v_customer_stats SET (security_invoker = true);

--------------------------------------------------------------------------------
-- PART 4: MATERIALIZED VIEW PERMISSIONS
--------------------------------------------------------------------------------

REVOKE SELECT ON TABLE public.mv_financial_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_customer_segmentation_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_daily_sales_kpis FROM anon;

GRANT SELECT ON TABLE public.mv_financial_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_customer_segmentation_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_daily_sales_kpis TO authenticated;

--------------------------------------------------------------------------------
-- PART 5: PERFORMANCE TUNING (Supabase Advisor)
--------------------------------------------------------------------------------
-- A. CREATE MISSING FK INDEXES
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_customer_id ON public.accounts_receivable(customer_id);
CREATE INDEX IF NOT EXISTS idx_accounts_receivable_sale_id ON public.accounts_receivable(sale_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_customer_id ON public.automation_logs(customer_id);

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

CREATE INDEX IF NOT EXISTS idx_customer_events_customer_id ON public.customer_events(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_insights_customer_id ON public.customer_insights(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_interactions_associated_sale_id ON public.customer_interactions(associated_sale_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_created_by ON public.customer_interactions(created_by);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON public.customer_interactions(customer_id);

CREATE INDEX IF NOT EXISTS idx_customers_deleted_by ON public.customers(deleted_by);
CREATE INDEX IF NOT EXISTS idx_customers_favorite_product ON public.customers(favorite_product);

CREATE INDEX IF NOT EXISTS idx_nps_surveys_customer_id ON public.nps_surveys(customer_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_sale_id ON public.nps_surveys(sale_id);

CREATE INDEX IF NOT EXISTS idx_sales_seller_id ON public.sales(seller_id);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_person_id ON public.sales(delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_user_id ON public.sales(delivery_user_id);

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_created_by ON public.delivery_tracking(created_by);

CREATE INDEX IF NOT EXISTS idx_expense_budgets_created_by ON public.expense_budgets(created_by);

CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_operational_expenses_category_id ON public.operational_expenses(category_id);

CREATE INDEX IF NOT EXISTS idx_suppliers_created_by ON public.suppliers(created_by);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_batch_id ON public.expiry_alerts(batch_id);
CREATE INDEX IF NOT EXISTS idx_expiry_alerts_product_id ON public.expiry_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_product_cost_history_product_id ON public.product_cost_history(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);


-- B. CLEANUP UNUSED INDEXES (Non-FK)
DROP INDEX IF EXISTS public.customers_email_idx;
DROP INDEX IF EXISTS public.customers_name_idx;
DROP INDEX IF EXISTS public.idx_customers_active;
DROP INDEX IF EXISTS public.idx_customers_created_at;
DROP INDEX IF EXISTS public.idx_customers_deleted;

DROP INDEX IF EXISTS public.idx_accounts_receivable_due_date;
DROP INDEX IF EXISTS public.idx_accounts_receivable_due_status;
DROP INDEX IF EXISTS public.idx_accounts_receivable_status;

DROP INDEX IF EXISTS public.idx_activity_logs_action;
DROP INDEX IF EXISTS public.idx_activity_logs_created_at;
DROP INDEX IF EXISTS public.idx_activity_logs_role;
DROP INDEX IF EXISTS public.idx_audit_logs_action;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_audit_logs_record_id;
DROP INDEX IF EXISTS public.idx_audit_logs_table_name;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;

DROP INDEX IF EXISTS public.idx_categories_active;

DROP INDEX IF EXISTS public.idx_delivery_tracking_created_at;
DROP INDEX IF EXISTS public.idx_delivery_tracking_status;

DROP INDEX IF EXISTS public.idx_expense_budgets_category;
DROP INDEX IF EXISTS public.idx_expense_budgets_month_year;

DROP INDEX IF EXISTS public.idx_expiry_alerts_batch;
DROP INDEX IF EXISTS public.idx_expiry_alerts_product;
DROP INDEX IF EXISTS public.idx_expiry_alerts_status;

DROP INDEX IF EXISTS public.idx_inventory_movements_date;
DROP INDEX IF EXISTS public.idx_inventory_movements_date_product;
DROP INDEX IF EXISTS public.idx_inventory_movements_product_date;

DROP INDEX IF EXISTS public.idx_mv_customer_segmentation_activity;
DROP INDEX IF EXISTS public.idx_mv_customer_segmentation_segment;

DROP INDEX IF EXISTS public.idx_notifications_category;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_notifications_read_at;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_user_id;

DROP INDEX IF EXISTS public.idx_payment_methods_type;

DROP INDEX IF EXISTS public.idx_product_batches_batch_code;
DROP INDEX IF EXISTS public.idx_product_batches_expiry_date;
DROP INDEX IF EXISTS public.idx_product_batches_status;
DROP INDEX IF EXISTS public.idx_product_batches_supplier;

DROP INDEX IF EXISTS public.idx_product_cost_history_current;
DROP INDEX IF EXISTS public.idx_product_cost_history_period;
DROP INDEX IF EXISTS public.idx_product_cost_history_product_valid;

DROP INDEX IF EXISTS public.idx_products_available_by_last_sale;
DROP INDEX IF EXISTS public.idx_products_barcode;
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.idx_products_category_stock;
DROP INDEX IF EXISTS public.idx_products_deleted_at;
DROP INDEX IF EXISTS public.idx_products_expiry;
DROP INDEX IF EXISTS public.idx_products_last_sale_date;
DROP INDEX IF EXISTS public.idx_products_low_stock_alert;
DROP INDEX IF EXISTS public.idx_products_package_barcode;
DROP INDEX IF EXISTS public.idx_products_packaging_type;
DROP INDEX IF EXISTS public.idx_products_stock_category_optimized;
DROP INDEX IF EXISTS public.idx_products_stock_packages;
DROP INDEX IF EXISTS public.idx_products_stock_units_loose;
DROP INDEX IF EXISTS public.idx_products_turnover_rate;
DROP INDEX IF EXISTS public.idx_products_unit_barcode;
DROP INDEX IF EXISTS public.idx_products_unit_type;
DROP INDEX IF EXISTS public.products_name_idx;

DROP INDEX IF EXISTS public.idx_profiles_email_role;
DROP INDEX IF EXISTS public.idx_profiles_temp_password;

DROP INDEX IF EXISTS public.idx_sale_items_conversion_required;
DROP INDEX IF EXISTS public.idx_sale_items_sale_product;

DROP INDEX IF EXISTS public.idx_sales_customer_created;
DROP INDEX IF EXISTS public.idx_sales_customer_created_at;
DROP INDEX IF EXISTS public.idx_sales_order_number;
DROP INDEX IF EXISTS public.idx_sales_payment_method_enum;
DROP INDEX IF EXISTS public.idx_sales_status_created;
DROP INDEX IF EXISTS public.idx_sales_status_enum;
DROP INDEX IF EXISTS public.sales_delivery_user_id_idx;
DROP INDEX IF EXISTS public.sales_user_id_idx;

DROP INDEX IF EXISTS public.suppliers_company_name_idx;
DROP INDEX IF EXISTS public.suppliers_is_active_idx;
DROP INDEX IF EXISTS public.suppliers_products_supplied_idx;

COMMIT;
