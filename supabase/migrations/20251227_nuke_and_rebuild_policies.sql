-- ATOMIC NUKE & REBUILD: FIX ALL WARNINGS
-- Strategy: Drop ALL policies for target tables and recreate them with strict optimizations.
-- Optimization: Using "(select auth.uid())" to prevent initplan errors.

BEGIN;

--------------------------------------------------------------------------------
-- 1. NUCLEAR DROP: Clear the board
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
-- 2. REBUILD: Optimized & Unified Policies
--------------------------------------------------------------------------------

-- A. CORE INVENTORY & SALES
--------------------------------------------------------------------------------

-- sales
CREATE POLICY "Unified insert for sales" ON public.sales FOR INSERT TO authenticated
WITH CHECK ( (select auth.role()) = 'authenticated' );

CREATE POLICY "Unified select for sales" ON public.sales FOR SELECT TO authenticated
USING ( true ); -- Open read for auth users (dashboard needs it)

CREATE POLICY "Unified update for sales" ON public.sales FOR UPDATE TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = (select auth.uid())
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
-- Note: Delete is handled by 'Admin and Employee can delete sales' if we check schema, 
-- but we just dropped ALL policies. We need to restore DELETE!
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
-- Need insert for checkout flow

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
CREATE POLICY "Unified modify for products" ON public.products FOR ALL TO authenticated
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
CREATE POLICY "Unified modify for product_batches" ON public.product_batches FOR ALL TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);


-- B. LOGISTICS
--------------------------------------------------------------------------------

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


-- C. BACKOFFICE & USERS
--------------------------------------------------------------------------------

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

-- users (public.users - likely legacy or minimal profile)
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
  -- Delivery needs to read customer info? Usually yes.
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

-- D. FINANCIALS & ALERTS
--------------------------------------------------------------------------------

-- operational_expenses
CREATE POLICY "Unified select for operational_expenses" ON public.operational_expenses FOR SELECT TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);
CREATE POLICY "Unified modify for operational_expenses" ON public.operational_expenses FOR ALL TO authenticated
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
CREATE POLICY "Unified modify for expense_budgets" ON public.expense_budgets FOR ALL TO authenticated
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
CREATE POLICY "Unified modify for expense_categories" ON public.expense_categories FOR ALL TO authenticated
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
CREATE POLICY "Unified modify for customer_insights" ON public.customer_insights FOR ALL TO authenticated
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
CREATE POLICY "Unified modify for expiry_alerts" ON public.expiry_alerts FOR ALL TO authenticated
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

-- batch_units
CREATE POLICY "Unified select for batch_units" ON public.batch_units FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);
CREATE POLICY "Unified modify for batch_units" ON public.batch_units FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

COMMIT;
