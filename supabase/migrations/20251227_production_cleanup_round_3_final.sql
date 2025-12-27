-- PRODUCTION CLEANUP ROUND 3 (Final Surgical Fix)
-- Problem: 'FOR ALL' policies include SELECT, causing overlap with specific SELECT policies.
-- Solution: Split 'FOR ALL' into INSERT, UPDATE, DELETE for the 4 affected tables.

BEGIN;

-- 1. accounts_receivable
DROP POLICY IF EXISTS "Unified modify for accounts_receivable" ON public.accounts_receivable;

CREATE POLICY "Unified insert for accounts_receivable" ON public.accounts_receivable FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'::user_role
  )
);
CREATE POLICY "Unified update for accounts_receivable" ON public.accounts_receivable FOR UPDATE TO authenticated
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
CREATE POLICY "Unified delete for accounts_receivable" ON public.accounts_receivable FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'::user_role
  )
);

-- 2. categories
DROP POLICY IF EXISTS "Unified modify for categories" ON public.categories;

CREATE POLICY "Unified insert for categories" ON public.categories FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for categories" ON public.categories FOR UPDATE TO authenticated
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
CREATE POLICY "Unified delete for categories" ON public.categories FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- 3. inventory
-- (Assuming table exists, similar to round 2)
DROP POLICY IF EXISTS "Unified modify for inventory" ON public.inventory;

CREATE POLICY "Unified insert for inventory" ON public.inventory FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for inventory" ON public.inventory FOR UPDATE TO authenticated
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
CREATE POLICY "Unified delete for inventory" ON public.inventory FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- 4. inventory_movements
DROP POLICY IF EXISTS "Unified modify for inventory_movements" ON public.inventory_movements;

CREATE POLICY "Unified insert for inventory_movements" ON public.inventory_movements FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified update for inventory_movements" ON public.inventory_movements FOR UPDATE TO authenticated
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
CREATE POLICY "Unified delete for inventory_movements" ON public.inventory_movements FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

COMMIT;
