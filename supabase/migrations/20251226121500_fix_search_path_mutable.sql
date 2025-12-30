-- Migration: Fix Function Search Path Mutable - 2025-12-26
-- Description: Iterates through all functions in the public schema and sets explicit search_path to 'public'.
-- Remediation for: function_search_path_mutable security warming.

DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN
        SELECT 
            n.nspname AS schema_name,
            p.proname AS function_name,
            pg_get_function_identity_arguments(p.oid) AS args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
          AND p.prokind = 'f' -- Only functions (not procedures/aggregates)
          AND p.proowner IN (SELECT oid FROM pg_roles WHERE rolname = 'postgres' OR rolname = 'service_role' OR rolname = 'authenticated' OR rolname = 'anon' OR rolname = current_user) -- Filter to owned functions if needed, but public schema usually implies user functions
    LOOP
        BEGIN
            EXECUTE format(
                'ALTER FUNCTION %I.%I(%s) SET search_path = public, pg_temp',
                func_record.schema_name,
                func_record.function_name,
                func_record.args
            );
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to alter function %.%(%): %', func_record.schema_name, func_record.function_name, func_record.args, SQLERRM;
        END;
    END LOOP;
END $$;
