-- Fix RLS Policy Names and Logic (Cleanup Phase)

--------------------------------------------------------------------------------
-- 1. delivery_tracking
--------------------------------------------------------------------------------
-- INSERT
DROP POLICY IF EXISTS "Employee can insert delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Delivery can insert own delivery_tracking" ON public.delivery_tracking; 
-- (Unified policy already exists)

-- SELECT
DROP POLICY IF EXISTS "Employee can view delivery_tracking" ON public.delivery_tracking;
DROP POLICY IF EXISTS "Delivery can view own delivery_tracking" ON public.delivery_tracking;
-- (Unified policy already exists)

--------------------------------------------------------------------------------
-- 2. product_batches
--------------------------------------------------------------------------------
-- SELECT
DROP POLICY IF EXISTS "Employees can view and create batches" ON public.product_batches;
DROP POLICY IF EXISTS "Delivery can view batches" ON public.product_batches;
-- (Unified policy already exists)

--------------------------------------------------------------------------------
-- 3. products
--------------------------------------------------------------------------------
-- SELECT
-- Check logic: "Enable read access for active products" likely had "deleted_at IS NULL".
-- "Admins can view deleted products" likely looked at role.
-- We must combine them.

DROP POLICY IF EXISTS "Enable read access for active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view deleted products" ON public.products;
DROP POLICY IF EXISTS "Unified select for products" ON public.products; -- Re-creating with safer logic

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

--------------------------------------------------------------------------------
-- 4. sale_items
--------------------------------------------------------------------------------
-- SELECT
DROP POLICY IF EXISTS "Employees and admins can view all sale items" ON public.sale_items;
-- (Unified policy already exists)

--------------------------------------------------------------------------------
-- 5. sales
--------------------------------------------------------------------------------
-- INSERT
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.sales;
-- (Unified policy already exists)

--------------------------------------------------------------------------------
-- 6. profiles (Fix "No Policy" validation warning)
--------------------------------------------------------------------------------
-- Advisors said profiles has RLS but no policies.
-- We need to ensure users can read their own profile and Admins can read all.
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
  -- Allow employees to view basic profiles? Often needed for UI.
  -- Let's stick to safe defaults. Admin + Self is safe.
  -- Wait, for "Delivery User" assignment, managers need to see list of delivery users.
  (
      EXISTS (
       SELECT 1 FROM profiles p
       WHERE p.id = auth.uid()
       AND p.role IN ('admin'::user_role, 'employee'::user_role)
     )
  )
);

-- Also need UPDATE for self?
CREATE POLICY "Unified update for profiles"
ON public.profiles FOR UPDATE
USING ( id = auth.uid() )
WITH CHECK ( id = auth.uid() );

-- INSERT is usually handled by triggers on auth.users, but if explicit insert:
CREATE POLICY "Unified insert for profiles"
ON public.profiles FOR INSERT
WITH CHECK ( id = auth.uid() );

--------------------------------------------------------------------------------
-- 7. suppliers (Fix "No Policy" validation warning)
--------------------------------------------------------------------------------
-- Authenticated users (employees) need to manage suppliers.
CREATE POLICY "Unified all for suppliers"
ON public.suppliers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);

--------------------------------------------------------------------------------
-- 8. product_cost_history (Fix "No Policy" validation warning)
--------------------------------------------------------------------------------
CREATE POLICY "Unified select for product_cost_history"
ON public.product_cost_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin'::user_role, 'employee'::user_role)
  )
);
