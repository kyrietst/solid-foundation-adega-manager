-- Migration: Optimize RLS V3 (Expenses auth.role) - 2025-12-26
-- Description: Specific fix for 'auth_rls_initplan' warning on 'expenses' table by wrapping auth.role().

DO $$
DECLARE
    pol record;
    new_qual text;
    new_check text;
    qual_changed boolean;
    check_changed boolean;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname, qual, with_check
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'expenses'
          AND policyname = 'Enable all access for authenticated users'
    LOOP
        qual_changed := false;
        check_changed := false;
        new_qual := pol.qual;
        new_check := pol.with_check;

        -- Wrap auth.role() check
        IF pol.qual IS NOT NULL AND pol.qual LIKE '%auth.role()%' AND pol.qual NOT LIKE '%(select auth.role())%' THEN
            new_qual := replace(new_qual, 'auth.role()', '(select auth.role())');
            qual_changed := true;
        END IF;

        IF qual_changed THEN
            EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual);
            RAISE NOTICE 'Optimized Policy (V3): % on %', pol.policyname, pol.tablename;
        ELSE
             RAISE NOTICE 'Policy already optimized: % on %', pol.policyname, pol.tablename;
        END IF;
    END LOOP;
END $$;
