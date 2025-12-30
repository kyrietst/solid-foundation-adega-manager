-- Migration: Optimize RLS V2 (Targeted) - 2025-12-26
-- Description: Targeted optimization for 'auth_rls_initplan' warnings on specific tables.
-- Forces wrapping of auth.uid() and auth.jwt() with (select ...) subqueries.

DO $$
DECLARE
    pol record;
    new_qual text;
    new_check text;
    qual_changed boolean;
    check_changed boolean;
    target_tables text[] := ARRAY['audit_logs', 'batch_units', 'customer_insights', 'delivery_tracking', 'delivery_zones', 'expense_budgets', 'expense_categories', 'expenses', 'nps_surveys', 'operational_expenses', 'product_batches', 'products', 'sale_items', 'users'];
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = ANY(target_tables)
    LOOP
        qual_changed := false;
        check_changed := false;
        new_qual := pol.qual;
        new_check := pol.with_check;

        -- Heuristic: If it contains auth.uid() but not the specific normalized form '( SELECT auth.uid() AS uid)', try to replace.
        -- However, we will trust the replace to be safe.
        -- We will replace 'auth.uid()' with '(select auth.uid())'
        -- To avoid double wrapping, we can check.
        
        -- Logic: 
        -- 1. If it has 'auth.uid()' AND NOT '(select auth.uid())' (approx), wrap it.
        --    Note: Postgres normalizes '(select auth.uid())' to '( SELECT auth.uid() AS uid)' usually.
        
        IF pol.qual IS NOT NULL THEN
             -- Check for auth.uid()
             IF pol.qual LIKE '%auth.uid()%' AND pol.qual NOT ILIKE '%( select auth.uid() as uid)%' AND pol.qual NOT ILIKE '%(select auth.uid())%' THEN
                 new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
                 qual_changed := true;
             END IF;
             -- Check for auth.jwt()
             IF pol.qual LIKE '%auth.jwt()%' AND pol.qual NOT ILIKE '%( select auth.jwt() as jwt)%' AND pol.qual NOT ILIKE '%(select auth.jwt())%' THEN
                 new_qual := replace(new_qual, 'auth.jwt()', '(select auth.jwt())');
                 qual_changed := true;
             END IF;
        END IF;

        IF pol.with_check IS NOT NULL THEN
             -- Check for auth.uid()
             IF pol.with_check LIKE '%auth.uid()%' AND pol.with_check NOT ILIKE '%( select auth.uid() as uid)%' AND pol.with_check NOT ILIKE '%(select auth.uid())%' THEN
                 new_check := replace(new_check, 'auth.uid()', '(select auth.uid())');
                 check_changed := true;
             END IF;
             -- Check for auth.jwt()
             IF pol.with_check LIKE '%auth.jwt()%' AND pol.with_check NOT ILIKE '%( select auth.jwt() as jwt)%' AND pol.with_check NOT ILIKE '%(select auth.jwt())%' THEN
                 new_check := replace(new_check, 'auth.jwt()', '(select auth.jwt())');
                 check_changed := true;
             END IF;
        END IF;

        IF qual_changed OR check_changed THEN
            -- Re-apply policy
            IF new_qual IS NOT NULL AND new_check IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual, new_check);
            ELSIF new_qual IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual);
            ELSIF new_check IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)', pol.policyname, pol.schemaname, pol.tablename, new_check);
            END IF;
            RAISE NOTICE 'Optimized Policy (V2): % on %', pol.policyname, pol.tablename;
        ELSE
            -- RAISE NOTICE 'Policy already optimized/skipped: % on %', pol.policyname, pol.tablename;
        END IF;
    END LOOP;
END $$;
