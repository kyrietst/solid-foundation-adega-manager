-- BUNDLE: Fix 113 Supabase Warnings (Production)
-- Run this entire script in the Supabase SQL Editor for the Production Project.

BEGIN;

--------------------------------------------------------------------------------
-- PART 1: UNIFY RLS POLICIES (Consolidation)
--------------------------------------------------------------------------------

-- 1. batch_units
DROP POLICY IF EXISTS "Delivery can view assigned batch units" ON public.batch_units;
DROP POLICY IF EXISTS "Employees can view batch units" ON public.batch_units;
DROP POLICY IF EXISTS "Admins can manage all batch units" ON public.batch_units; -- Extra cleanup

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

-- 2. delivery_tracking
DROP POLICY IF EXISTS "Delivery can insert checkpoint" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Employees can insert tracking" ON public.delivery_tracking;

CREATE POLICY "Unified insert for delivery_tracking"
ON public.delivery_tracking FOR INSERT
TO authenticated
WITH CHECK (
  (
    (EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = 'delivery'::user_role
    ) AND created_by = auth.uid()) 
  )
  OR
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
);

DROP POLICY IF EXISTS "Delivery can view assigned tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Employees can view tracking" ON public.delivery_tracking;

CREATE POLICY "Unified select for delivery_tracking"
ON public.delivery_tracking FOR SELECT
TO authenticated
USING (
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = delivery_tracking.sale_id
      AND sales.delivery_user_id = auth.uid()
    )
  )
);

-- 3. product_batches
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

-- 4. products
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Public read access" ON public.products;

CREATE POLICY "Unified select for products"
ON public.products FOR SELECT
USING (true);

-- 5. sale_items
DROP POLICY IF EXISTS "Employees can view sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Delivery can view assigned sale items" ON public.sale_items;

CREATE POLICY "Unified select for sale_items"
ON public.sale_items FOR SELECT
TO authenticated
USING (
  (
    EXISTS (
       SELECT 1 FROM profiles
       WHERE profiles.id = auth.uid()
       AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
    )
  )
  OR
  (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.delivery_user_id = auth.uid()
    )
  )
);

-- 6. sales
DROP POLICY IF EXISTS "Employees can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.sales;

CREATE POLICY "Unified insert for sales"
ON public.sales FOR INSERT
TO authenticated
WITH CHECK (
  auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Employees can view sales" ON public.sales;
DROP POLICY IF EXISTS "Allow select for all" ON public.sales;
DROP POLICY IF EXISTS "Delivery can view assigned sales" ON public.sales;

CREATE POLICY "Unified select for sales"
ON public.sales FOR SELECT
TO authenticated
USING (
   true
);

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

--------------------------------------------------------------------------------
-- PART 2: FIX NAMES (The "Cleanup" phase for mismatched names)
--------------------------------------------------------------------------------

-- delivery_tracking
DROP POLICY IF EXISTS "Employee can insert delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Delivery can insert own delivery_tracking" ON public.delivery_tracking; 
DROP POLICY IF EXISTS "Employee can view delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Delivery can view own delivery_tracking" ON public.delivery_tracking; 

-- product_batches
DROP POLICY IF EXISTS "Employees can view and create batches" ON public.product_batches;
DROP POLICY IF EXISTS "Delivery can view batches" ON public.product_batches;

-- products
DROP POLICY IF EXISTS "Enable read access for active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view deleted products" ON public.products;
DROP POLICY IF EXISTS "Unified select for products" ON public.products; -- Re-create logic

CREATE POLICY "Unified select for products"
ON public.products FOR SELECT
USING (
  (deleted_at IS NULL)
  OR
  (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'::user_role
    )
  )
);

-- sale_items
DROP POLICY IF EXISTS "Employees and admins can view all sale items" ON public.sale_items;

-- sales
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.sales;

--------------------------------------------------------------------------------
-- PART 3: PROFILES & SUPPLIERS (Fix "No Policy" warnings)
--------------------------------------------------------------------------------

-- profiles
CREATE POLICY "Unified select for profiles"
ON public.profiles FOR SELECT
USING (
  (id = auth.uid()) OR 
  (
     EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
       AND p.role = 'admin'::user_role
     )
  )
  OR
  (
      EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
       AND p.role IN ('admin'::user_role, 'employee'::user_role)
     )
  )
);

CREATE POLICY "Unified update for profiles"
ON public.profiles FOR UPDATE
USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() );

CREATE POLICY "Unified insert for profiles"
ON public.profiles FOR INSERT
WITH CHECK ( id = auth.uid() );

-- suppliers
CREATE POLICY "Unified all for suppliers"
ON public.suppliers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);

-- product_cost_history
CREATE POLICY "Unified select for product_cost_history"
ON public.product_cost_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);

--------------------------------------------------------------------------------
-- PART 4: SECURITY DEFINER VIEWS & PERMISSIONS
--------------------------------------------------------------------------------

-- Views
ALTER VIEW public.product_movement_history SET (security_invoker = true);
ALTER VIEW public.vw_kyrie_intelligence_margins SET (security_invoker = true);
ALTER VIEW public.dual_stock_summary SET (security_invoker = true);
ALTER VIEW public.activity_logs_view SET (security_invoker = true);
ALTER VIEW public.v_customer_purchases SET (security_invoker = true);
ALTER VIEW public.v_customer_stats SET (security_invoker = true);

-- Mat Views
REVOKE SELECT ON TABLE public.mv_financial_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_customer_segmentation_kpis FROM anon;
REVOKE SELECT ON TABLE public.mv_daily_sales_kpis FROM anon;

GRANT SELECT ON TABLE public.mv_financial_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_customer_segmentation_kpis TO authenticated;
GRANT SELECT ON TABLE public.mv_daily_sales_kpis TO authenticated;

COMMIT;
