-- PRODUCTION CLEANUP ROUND 2 (Final Polish)
-- Strategy:
-- 1. NUKE: Dynamically DROP ALL policies on remaining target tables.
-- 2. REBUILD: Recreate Unified Optimized policies using (select auth.uid()).
-- 3. DEDUP: Remove duplicate indexes identified by Advisor.

BEGIN;

--------------------------------------------------------------------------------
-- PART 1: NUCLEAR DROP (Remaining Tables)
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
            'audit_logs', 
            'inventory_conversion_log', 
            'accounts_receivable', 
            'activity_logs', 
            'categories', 
            'customer_events', 
            'inventory', 
            'inventory_movements'
        )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

--------------------------------------------------------------------------------
-- PART 2: REBUILD UNIFIED POLICIES
--------------------------------------------------------------------------------

-- 1. accounts_receivable
CREATE POLICY "Unified select for accounts_receivable" ON public.accounts_receivable FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified modify for accounts_receivable" ON public.accounts_receivable FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'::user_role
  )
);

-- 2. activity_logs
CREATE POLICY "Unified select for activity_logs" ON public.activity_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified insert for activity_logs" ON public.activity_logs FOR INSERT TO authenticated
WITH CHECK ( (select auth.role()) = 'authenticated' );

-- 3. audit_logs
CREATE POLICY "Unified select for audit_logs" ON public.audit_logs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'::user_role
  )
);
CREATE POLICY "Unified insert for audit_logs" ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK ( (select auth.role()) = 'authenticated' );

-- 4. categories
CREATE POLICY "Unified select for categories" ON public.categories FOR SELECT TO authenticated
USING ( true );

CREATE POLICY "Unified modify for categories" ON public.categories FOR ALL TO authenticated
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

-- 5. customer_events
CREATE POLICY "Unified select for customer_events" ON public.customer_events FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified insert for customer_events" ON public.customer_events FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- 6. inventory
-- Note: Assuming table exists. If dropped in previous migrations, this block might be skipped or error.
-- We'll add IF EXISTS logic or just standard creation which assumes existence (standard for migrations).
CREATE POLICY "Unified select for inventory" ON public.inventory FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);
CREATE POLICY "Unified modify for inventory" ON public.inventory FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

-- 7. inventory_conversion_log
CREATE POLICY "Unified select for conversion_log" ON public.inventory_conversion_log FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified insert for conversion_log" ON public.inventory_conversion_log FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);
CREATE POLICY "Unified delete for conversion_log" ON public.inventory_conversion_log FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'::user_role
  )
);

-- 8. inventory_movements
CREATE POLICY "Unified select for inventory_movements" ON public.inventory_movements FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee', 'delivery']::user_role[])
  )
);
CREATE POLICY "Unified modify for inventory_movements" ON public.inventory_movements FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = ANY (ARRAY['admin', 'employee']::user_role[])
  )
);

--------------------------------------------------------------------------------
-- PART 3: REMOVE DUPLICATE INDEXES
--------------------------------------------------------------------------------
-- Dropping the NEW ones we likely created, keeping the OLD ones that Advisor prefers.

DROP INDEX IF EXISTS public.idx_operational_expenses_category_id; -- Keep idx_operational_expenses_category
DROP INDEX IF EXISTS public.idx_sales_delivery_user_id;           -- Keep sales_delivery_user_id_idx
DROP INDEX IF EXISTS public.idx_sales_user_id;                    -- Keep sales_user_id_idx

COMMIT;
