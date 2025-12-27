-- Migration: Optimize RLS and Remove Duplicate Indexes - 2025-12-26
-- Description: Fixes Performance Advisor warnings by removing redundant indexes and optimizing RLS policies.

-- 1. Remove Duplicate Indexes
DROP INDEX IF EXISTS public.sale_items_sale_id_idx; -- Redundant with idx_sale_items_sale_id
DROP INDEX IF EXISTS public.sales_customer_id_idx; -- Redundant with idx_sales_customer_id

-- 2. Optimize RLS Policies (Wrap auth.uid() and auth.jwt() with SELECT)
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
    LOOP
        qual_changed := false;
        check_changed := false;
        new_qual := pol.qual;
        new_check := pol.with_check;

        -- Check and replace in USING clause
        IF pol.qual IS NOT NULL AND (pol.qual LIKE '%auth.uid()%' OR pol.qual LIKE '%auth.jwt()%') THEN
            -- Use regex to replace only if not already wrapped (simple check for now, mostly robust enough for this context)
            -- We want to avoid double wrapping if re-run, but standard pattern doesn't have (select (select...
            -- A safer way is to replace 'auth.uid()' with '(select auth.uid())' but only where it isn't preceded by '(select ' which is hard in regex.
            -- However, assuming this is a one-time fix or we rely on idempotency of the logic (if we grep for '(select auth.uid())' we skip).
            
            IF pol.qual LIKE '%auth.uid()%' AND pol.qual NOT LIKE '%(select auth.uid())%' THEN
                 new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
                 qual_changed := true;
            END IF;
            
            IF pol.qual LIKE '%auth.jwt()%' AND pol.qual NOT LIKE '%(select auth.jwt())%' THEN
                 new_qual := replace(new_qual, 'auth.jwt()', '(select auth.jwt())');
                 qual_changed := true;
            END IF;
        END IF;

        -- Check and replace in WITH CHECK clause
        IF pol.with_check IS NOT NULL AND (pol.with_check LIKE '%auth.uid()%' OR pol.with_check LIKE '%auth.jwt()%') THEN
            IF pol.with_check LIKE '%auth.uid()%' AND pol.with_check NOT LIKE '%(select auth.uid())%' THEN
                 new_check := replace(new_check, 'auth.uid()', '(select auth.uid())');
                 check_changed := true;
            END IF;
            
             IF pol.with_check LIKE '%auth.jwt()%' AND pol.with_check NOT LIKE '%(select auth.jwt())%' THEN
                 new_check := replace(new_check, 'auth.jwt()', '(select auth.jwt())');
                 check_changed := true;
            END IF;
        END IF;

        -- Apply changes
        IF qual_changed OR check_changed THEN
            -- Construct command. Note: CASE WHERE both change vs one.
            -- Actually, to be safe, if we change one, we should re-state the other if required or use split commands?
            -- ALTER POLICY allows setting both.
            
            -- If originally it was NULL, it remains NULL unless we changed it (we only change if NOT NULL).
            -- But we must pass NULL explicitly if we don't want to change it? No, ALTER POLICY syntax:
            -- ALTER POLICY name ON table USING (expression) WITH CHECK (expression)
            -- If we omit one, does it keep existing?
            -- Documentation says: "The new usage expression for the policy."
            
            -- We should supply both if we are using the 'USING (...) WITH CHECK (...)' syntax to be safe or fully redefine it.
            -- Or execute two separate commands if possible? No, standard SQL usually replaces definitions.
            
            -- Let's just run definition for both fields.
            IF new_qual IS NOT NULL AND new_check IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s) WITH CHECK (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual, new_check);
            ELSIF new_qual IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I USING (%s)', pol.policyname, pol.schemaname, pol.tablename, new_qual);
            ELSIF new_check IS NOT NULL THEN
                 EXECUTE format('ALTER POLICY %I ON %I.%I WITH CHECK (%s)', pol.policyname, pol.schemaname, pol.tablename, new_check);
            END IF;
            
            RAISE NOTICE 'Optimized Policy: % on %.%', pol.policyname, pol.schemaname, pol.tablename;
        END IF;

    END LOOP;
END $$;
