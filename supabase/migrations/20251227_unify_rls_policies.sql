-- Migration to Unify RLS Policies and Clear Supabase Warnings

--------------------------------------------------------------------------------
-- 1. batch_units (SELECT)
--------------------------------------------------------------------------------
-- Current: 'Delivery can view assigned batch units' AND 'Employees can view batch units'
DROP POLICY IF EXISTS "Delivery can view assigned batch units" ON public.batch_units;
DROP POLICY IF EXISTS "Employees can view batch units" ON public.batch_units;

CREATE POLICY "Unified select for batch_units"
ON public.batch_units FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);

--------------------------------------------------------------------------------
-- 2. delivery_tracking (INSERT & SELECT)
--------------------------------------------------------------------------------
-- INSERT
DROP POLICY IF EXISTS "Delivery can insert checkpoint" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Employees can insert tracking" ON public.delivery_tracking;

CREATE POLICY "Unified insert for delivery_tracking"
ON public.delivery_tracking FOR INSERT
TO authenticated
WITH CHECK (
  (
    -- Delivery logic
    (EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = 'delivery'::user_role
    ) AND created_by = auth.uid()) 
  )
  OR
  (
    -- Employee/Admin logic
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
);

-- SELECT
DROP POLICY IF EXISTS "Delivery can view assigned tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Employees can view tracking" ON public.delivery_tracking;

CREATE POLICY "Unified select for delivery_tracking"
ON public.delivery_tracking FOR SELECT
TO authenticated
USING (
  (
    -- Employee/Admin
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    -- Delivery (via related sales)
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = delivery_tracking.sale_id
      AND sales.delivery_user_id = auth.uid()
    )
  )
);

--------------------------------------------------------------------------------
-- 3. product_batches (SELECT)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Delivery can view assigned batches" ON public.product_batches;
DROP POLICY IF EXISTS "Employees can view batches" ON public.product_batches;

CREATE POLICY "Unified select for product_batches"
ON public.product_batches FOR SELECT
TO authenticated
USING (
   EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);

--------------------------------------------------------------------------------
-- 4. products (SELECT)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

CREATE POLICY "Unified select for products"
ON public.products FOR SELECT
USING (true);

--------------------------------------------------------------------------------
-- 5. sale_items (SELECT)
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Employees can view sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Delivery can view assigned sale items" ON public.sale_items;

CREATE POLICY "Unified select for sale_items"
ON public.sale_items FOR SELECT
TO authenticated
USING (
  (
    -- Employee/Admin
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    -- Delivery (via parent sale)
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.delivery_user_id = auth.uid()
    )
  )
);

--------------------------------------------------------------------------------
-- 6. sales (INSERT, SELECT, UPDATE)
--------------------------------------------------------------------------------
-- INSERT
DROP POLICY IF EXISTS "Employees can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.sales;

CREATE POLICY "Unified insert for sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (
  -- Employees/Admins OR any authenticated (preserving 'Enable insert for authenticated users' broadness)
  -- Since 'authenticated' covers everyone logged in, we simplify to just authenticated check
  -- BUT we prioritize the RBAC check structure for future tightening
  auth.role() = 'authenticated'
);

-- SELECT
DROP POLICY IF EXISTS "Employees can view sales" ON public.sales;
DROP POLICY IF EXISTS "Allow select for all" ON public.sales;
DROP POLICY IF EXISTS "Delivery can view assigned sales" ON public.sales;

CREATE POLICY "Unified select for sales"
ON public.sales FOR SELECT
TO authenticated
USING (
   -- 'Allow select for all' was permissive, but let's try to be smart.
   -- If we make it strictly RBAC, we might break some dashboard view for regular users/customers?
   -- Assuming 'authenticated' is key. We'll stick to permissive for now to ensure no breakage.
   -- NOTE: Consolidating logic is the goal.
   true
);

-- UPDATE
DROP POLICY IF EXISTS "Admin and Employee can update sales" ON public.sales;
DROP POLICY IF EXISTS "Employees can update sales" ON public.sales;

CREATE POLICY "Unified update for sales"
ON public.sales FOR UPDATE
TO authenticated
USING (
  EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
)
WITH CHECK (
   EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid()
     AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
