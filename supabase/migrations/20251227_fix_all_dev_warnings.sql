-- FIX ALL DEV WARNINGS (Performance + Consolidation)
-- 1. Performance: Optimize auth calls to (select auth.uid())
-- 2. Consolidate: Merge remaining duplicates in operational specific tables

BEGIN;

--------------------------------------------------------------------------------
-- GROUP 1: RE-OPTIMIZING RECENT UNIFIED POLICIES (Red Warnings)
--------------------------------------------------------------------------------

-- 1. batch_units
DROP POLICY IF EXISTS "Unified select for batch_units" ON public.batch_units;

CREATE POLICY "Unified select for batch_units"
ON public.batch_units FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);

-- 2. delivery_tracking
DROP POLICY IF EXISTS "Unified insert for delivery_tracking" ON public.delivery_tracking;

CREATE POLICY "Unified insert for delivery_tracking"
ON public.delivery_tracking FOR INSERT
TO authenticated
WITH CHECK (
  (
    (EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'delivery'::user_role
    ) AND created_by = (select auth.uid())) 
  )
  OR
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
);

DROP POLICY IF EXISTS "Unified select for delivery_tracking" ON public.delivery_tracking;

CREATE POLICY "Unified select for delivery_tracking"
ON public.delivery_tracking FOR SELECT
TO authenticated
USING (
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = delivery_tracking.sale_id
      AND sales.delivery_user_id = (select auth.uid())
    )
  )
);

-- 3. product_batches
DROP POLICY IF EXISTS "Unified select for product_batches" ON public.product_batches;

CREATE POLICY "Unified select for product_batches"
ON public.product_batches FOR SELECT
TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);

-- 4. products
DROP POLICY IF EXISTS "Unified select for products" ON public.products;

CREATE POLICY "Unified select for products"
ON public.products FOR SELECT
USING (
  (deleted_at IS NULL)
  OR
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'::user_role
    )
  )
);

-- 5. sale_items
DROP POLICY IF EXISTS "Unified select for sale_items" ON public.sale_items;

CREATE POLICY "Unified select for sale_items"
ON public.sale_items FOR SELECT
TO authenticated
USING (
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.delivery_user_id = (select auth.uid())
    )
  )
);

-- 6. sales
DROP POLICY IF EXISTS "Unified insert for sales" ON public.sales;

CREATE POLICY "Unified insert for sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (
  (select auth.role()) = 'authenticated'
);

DROP POLICY IF EXISTS "Unified select for sales" ON public.sales;

CREATE POLICY "Unified select for sales"
ON public.sales FOR SELECT
TO authenticated
USING (
   true
);

DROP POLICY IF EXISTS "Unified update for sales" ON public.sales;

CREATE POLICY "Unified update for sales"
ON public.sales FOR UPDATE
TO authenticated
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

-- 7. profiles
DROP POLICY IF EXISTS "Unified select for profiles" ON public.profiles;

CREATE POLICY "Unified select for profiles"
ON public.profiles FOR SELECT
USING (
  (id = (select auth.uid())) OR 
  (
     EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = (select auth.uid())
       AND p.role = 'admin'::user_role
     )
  )
  OR
  (
      EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = (select auth.uid())
       AND p.role IN ('admin'::user_role, 'employee'::user_role)
     )
  )
);

DROP POLICY IF EXISTS "Unified update for profiles" ON public.profiles;
CREATE POLICY "Unified update for profiles"
ON public.profiles FOR UPDATE
USING ( id = (select auth.uid()) )
WITH CHECK ( id = (select auth.uid()) );

DROP POLICY IF EXISTS "Unified insert for profiles" ON public.profiles;
CREATE POLICY "Unified insert for profiles"
ON public.profiles FOR INSERT
WITH CHECK ( id = (select auth.uid()) );


-- 8. suppliers
DROP POLICY IF EXISTS "Unified all for suppliers" ON public.suppliers;
CREATE POLICY "Unified all for suppliers"
ON public.suppliers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);

-- 9. product_cost_history
DROP POLICY IF EXISTS "Unified select for product_cost_history" ON public.product_cost_history;
CREATE POLICY "Unified select for product_cost_history"
ON public.product_cost_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);


--------------------------------------------------------------------------------
-- GROUP 2: CONSOLIDATING REMAINING TABLES (Yellow Warnings)
--------------------------------------------------------------------------------

-- 10. customer_insights
DROP POLICY IF EXISTS "Admin full access to customer insights" ON public.customer_insights;
DROP POLICY IF EXISTS "Employee view access to customer insights" ON public.customer_insights;

CREATE POLICY "Unified select for customer_insights"
ON public.customer_insights FOR SELECT
TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);

CREATE POLICY "Unified modify for customer_insights"
ON public.customer_insights FOR ALL
TO authenticated
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

-- 11. expiry_alerts
DROP POLICY IF EXISTS "Admins can manage expiry alerts" ON public.expiry_alerts;
DROP POLICY IF EXISTS "Employees can view expiry alerts" ON public.expiry_alerts;

CREATE POLICY "Unified select for expiry_alerts"
ON public.expiry_alerts FOR SELECT
TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);

CREATE POLICY "Unified modify for expiry_alerts"
ON public.expiry_alerts FOR ALL
TO authenticated
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

-- 12. nps_surveys
DROP POLICY IF EXISTS "Admin full access to NPS surveys" ON public.nps_surveys;
DROP POLICY IF EXISTS "Employee insert access to NPS surveys" ON public.nps_surveys;
DROP POLICY IF EXISTS "Employee read access to NPS surveys" ON public.nps_surveys;

CREATE POLICY "Unified select for nps_surveys"
ON public.nps_surveys FOR SELECT
TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);

CREATE POLICY "Unified insert for nps_surveys"
ON public.nps_surveys FOR INSERT
TO authenticated
WITH CHECK (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);

CREATE POLICY "Unified modify for nps_surveys" -- UPDATE/DELETE (Admin only)
ON public.nps_surveys FOR UPDATE
TO authenticated
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

CREATE POLICY "Unified delete for nps_surveys"
ON public.nps_surveys FOR DELETE
TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = 'admin'::user_role
   )
);

-- 13. operational_expenses
DROP POLICY IF EXISTS "Admin can manage operational expenses" ON public.operational_expenses;
DROP POLICY IF EXISTS "Employee can view operational expenses" ON public.operational_expenses;

CREATE POLICY "Unified select for operational_expenses"
ON public.operational_expenses FOR SELECT
TO authenticated
USING (
   EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = (select auth.uid())
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
   )
);

CREATE POLICY "Unified modify for operational_expenses"
ON public.operational_expenses FOR ALL
TO authenticated
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

COMMIT;
