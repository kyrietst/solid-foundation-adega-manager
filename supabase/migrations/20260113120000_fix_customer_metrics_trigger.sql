-- Migration: Fix Customer Metrics (Trigger + Backfill)
-- Description: Adds automation to keep 'lifetime_value' and 'last_purchase_date' updated.
--             Also performs a one-time backfill to fix inconsistent state from missing views/triggers.

-- 1. Create Function to Calculate and Update Metrics
CREATE OR REPLACE FUNCTION public.fn_update_customer_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
    v_customer_id UUID;
    v_customer_ids UUID[];
    i INTEGER;
BEGIN
    -- Collect affected customer_ids (Handle INSERT, UPDATE, DELETE)
    v_customer_ids := ARRAY[]::UUID[];

    IF (TG_OP = 'DELETE') THEN
        IF OLD.customer_id IS NOT NULL THEN
            v_customer_ids := array_append(v_customer_ids, OLD.customer_id);
        END IF;
    ELSIF (TG_OP = 'INSERT') THEN
        IF NEW.customer_id IS NOT NULL THEN
            v_customer_ids := array_append(v_customer_ids, NEW.customer_id);
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.customer_id IS NOT NULL THEN
            v_customer_ids := array_append(v_customer_ids, OLD.customer_id);
        END IF;
        IF NEW.customer_id IS NOT NULL AND (OLD.customer_id IS NULL OR NEW.customer_id <> OLD.customer_id) THEN
            v_customer_ids := array_append(v_customer_ids, NEW.customer_id);
        END IF;
    END IF;

    -- Remove duplicates (simple approach using loop or distinct query if needed, but array is small)
    -- Iterate and Update
    FOREACH v_customer_id IN ARRAY v_customer_ids
    LOOP
        UPDATE public.customers
        SET
            lifetime_value = (
                SELECT COALESCE(SUM(s.final_amount), 0)
                FROM public.sales s
                WHERE s.customer_id = v_customer_id
                AND s.status NOT IN ('cancelled', 'refunded') 
                -- Assuming 'refunded' also shouldn't count towards LTV, or maybe it should? 
                -- Standard LTV usually excludes refunds. Keeping it safe.
            ),
            last_purchase_date = (
                SELECT MAX(s.created_at)
                FROM public.sales s
                WHERE s.customer_id = v_customer_id
                AND s.status NOT IN ('cancelled', 'refunded')
            ),
            updated_at = NOW()
        WHERE id = v_customer_id;
    END LOOP;

    RETURN NULL; -- Trigger is AFTER, return value ignored
END;
$$;

-- 2. Create Trigger
DROP TRIGGER IF EXISTS trg_update_customer_metrics ON public.sales;

CREATE TRIGGER trg_update_customer_metrics
AFTER INSERT OR UPDATE OR DELETE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.fn_update_customer_metrics();

-- 3. BACKFILL (One-time correction)
DO $$
BEGIN
    RAISE NOTICE 'Starting Customer Metrics Backfill...';
    
    WITH calculated_metrics AS (
        SELECT 
            customer_id,
            COALESCE(SUM(final_amount), 0) as calc_ltv,
            MAX(created_at) as calc_last_purchase
        FROM public.sales
        WHERE customer_id IS NOT NULL
          AND status NOT IN ('cancelled', 'refunded')
        GROUP BY customer_id
    )
    UPDATE public.customers c
    SET 
        lifetime_value = cm.calc_ltv,
        last_purchase_date = cm.calc_last_purchase
    FROM calculated_metrics cm
    WHERE c.id = cm.customer_id;

    -- Also set 0/Null for customers with no sales (optional but good for consistency)
    UPDATE public.customers
    SET lifetime_value = 0, last_purchase_date = NULL
    WHERE id NOT IN (SELECT DISTINCT customer_id FROM public.sales WHERE customer_id IS NOT NULL AND status NOT IN ('cancelled', 'refunded'));

    RAISE NOTICE 'Backfill Completed.';
END $$;
