-- FIX FINAL 8 WARNINGS: SPLIT "FOR ALL" POLICIES
-- Problem: "FOR ALL" overlaps with "FOR SELECT", causing "Multiple Permissive Policies" warning.
-- Solution: Split "modify" policies into active INSERT, UPDATE, DELETE policies.

BEGIN;

--------------------------------------------------------------------------------
-- 1. PRODUCTS (Admin + Employee)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for products" ON public.products;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 2. PRODUCT_BATCHES (Admin + Employee)
-- Note: Delivery role was in SELECT, but Modify is usually Admin/Employee. 
-- Checking Nuke script: Modify was Admin, Employee. Delivery only for SELECT.
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for product_batches" ON public.product_batches;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 3. BATCH_UNITS (Admin + Employee)
-- Note: Delivery role was in SELECT. Modify is Admin/Employee.
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for batch_units" ON public.batch_units;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 4. OPERATIONAL_EXPENSES (Admin ONLY)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for operational_expenses" ON public.operational_expenses;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 5. EXPENSE_BUDGETS (Admin ONLY)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for expense_budgets" ON public.expense_budgets;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 6. EXPENSE_CATEGORIES (Admin ONLY)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for expense_categories" ON public.expense_categories;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 7. CUSTOMER_INSIGHTS (Admin ONLY)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for customer_insights" ON public.customer_insights;

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
)
WITH CHECK (
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

--------------------------------------------------------------------------------
-- 8. EXPIRY_ALERTS (Admin ONLY)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Unified modify for expiry_alerts" ON public.expiry_alerts;

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
)
WITH CHECK (
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

COMMIT;
