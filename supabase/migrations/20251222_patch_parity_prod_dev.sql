-- MIGRATION: 20251222_patch_parity_prod_dev.sql
-- DESCRIPTION: Applies critical patches to Dev environment to match Prod (RLS, Triggers, Functions, Storage).

-- -----------------------------------------------------------------------------
-- 1. SECURITY: ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE expiry_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_expenses ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. SECURITY: APPLY RLS POLICIES
-- -----------------------------------------------------------------------------

-- automation_logs
DROP POLICY IF EXISTS "Allow authenticated read access on automation_logs" ON automation_logs;
CREATE POLICY "Allow authenticated read access on automation_logs" ON automation_logs FOR SELECT TO authenticated USING (true);

-- batch_units
DROP POLICY IF EXISTS "Admins can manage all batch units" ON batch_units;
CREATE POLICY "Admins can manage all batch units" ON batch_units FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Delivery can view assigned batch units" ON batch_units;
CREATE POLICY "Delivery can view assigned batch units" ON batch_units FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role, 'delivery'::user_role]))))));

DROP POLICY IF EXISTS "Employees can insert batch units" ON batch_units;
CREATE POLICY "Employees can insert batch units" ON batch_units FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

DROP POLICY IF EXISTS "Employees can update batch units" ON batch_units;
CREATE POLICY "Employees can update batch units" ON batch_units FOR UPDATE TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

DROP POLICY IF EXISTS "Employees can view batch units" ON batch_units;
CREATE POLICY "Employees can view batch units" ON batch_units FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

-- customer_insights
DROP POLICY IF EXISTS "Admin full access to customer insights" ON customer_insights;
CREATE POLICY "Admin full access to customer insights" ON customer_insights FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Employee view access to customer insights" ON customer_insights;
CREATE POLICY "Employee view access to customer insights" ON customer_insights FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

-- delivery_zones
DROP POLICY IF EXISTS "Admin full access to delivery zones" ON delivery_zones;
CREATE POLICY "Admin full access to delivery zones" ON delivery_zones FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Everyone can view delivery zones" ON delivery_zones;
CREATE POLICY "Everyone can view delivery zones" ON delivery_zones FOR SELECT TO public USING (true);

-- expiry_alerts
DROP POLICY IF EXISTS "Admins can manage expiry alerts" ON expiry_alerts;
CREATE POLICY "Admins can manage expiry alerts" ON expiry_alerts FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Employees can view expiry alerts" ON expiry_alerts;
CREATE POLICY "Employees can view expiry alerts" ON expiry_alerts FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

-- nps_surveys
DROP POLICY IF EXISTS "Admin full access to NPS surveys" ON nps_surveys;
CREATE POLICY "Admin full access to NPS surveys" ON nps_surveys FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Employee insert access to NPS surveys" ON nps_surveys;
CREATE POLICY "Employee insert access to NPS surveys" ON nps_surveys FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

DROP POLICY IF EXISTS "Employee read access to NPS surveys" ON nps_surveys;
CREATE POLICY "Employee read access to NPS surveys" ON nps_surveys FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));

-- operational_expenses
DROP POLICY IF EXISTS "Admin can manage operational expenses" ON operational_expenses;
CREATE POLICY "Admin can manage operational expenses" ON operational_expenses FOR ALL TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role)))));

DROP POLICY IF EXISTS "Employee can view operational expenses" ON operational_expenses;
CREATE POLICY "Employee can view operational expenses" ON operational_expenses FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['admin'::user_role, 'employee'::user_role]))))));


-- -----------------------------------------------------------------------------
-- 3. LOGIC: CREATE MISSING FUNCTIONS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fn_log_sale_event()
 RETURNS trigger
 LANGUAGE plpgsql
 AS $function$
BEGIN
  INSERT INTO public.customer_events (customer_id, source, source_id, payload)
  VALUES (NEW.customer_id, 'sale', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END$function$;


CREATE OR REPLACE FUNCTION public.sync_delivery_status_to_sale_status()
 RETURNS trigger
 LANGUAGE plpgsql
 AS $function$
BEGIN
  -- Quando delivery_status muda para 'delivered', atualizar status da venda
  IF NEW.delivery_status = 'delivered' AND OLD.delivery_status != 'delivered' THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;$function$;


CREATE OR REPLACE FUNCTION public.sync_sales_enum_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 AS $function$
BEGIN
    -- Sync status
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IS NOT NULL THEN
        NEW.status_enum := CASE 
            WHEN NEW.status = 'completed' THEN 'completed'::sales_status_enum
            WHEN NEW.status = 'pending' THEN 'pending'::sales_status_enum
            WHEN NEW.status = 'cancelled' THEN 'cancelled'::sales_status_enum
            WHEN NEW.status = 'processing' THEN 'processing'::sales_status_enum
            WHEN NEW.status = 'refunded' THEN 'refunded'::sales_status_enum
            ELSE 'pending'::sales_status_enum
        END;
    END IF;
    
    -- Sync payment_method
    IF NEW.payment_method IS DISTINCT FROM OLD.payment_method AND NEW.payment_method IS NOT NULL THEN
        NEW.payment_method_enum := CASE 
            WHEN LOWER(NEW.payment_method) = 'cash' THEN 'cash'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'credit' THEN 'credit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'debit' THEN 'debit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'card' THEN 'credit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'pix' THEN 'pix'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'bank_transfer' THEN 'bank_transfer'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'check' THEN 'check'::payment_method_enum
            ELSE 'other'::payment_method_enum
        END;
    END IF;
    
    RETURN NEW;
END;$function$;


-- -----------------------------------------------------------------------------
-- 4. LOGIC: CREATE MISSING TRIGGERS
-- -----------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_log_sale_event ON sales;
CREATE TRIGGER trg_log_sale_event AFTER INSERT ON sales FOR EACH ROW EXECUTE FUNCTION fn_log_sale_event();

DROP TRIGGER IF EXISTS trg_sync_delivery_status ON sales;
CREATE TRIGGER trg_sync_delivery_status BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION sync_delivery_status_to_sale_status();

DROP TRIGGER IF EXISTS sync_sales_enum_trigger ON sales;
CREATE TRIGGER sync_sales_enum_trigger BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION sync_sales_enum_columns();


-- -----------------------------------------------------------------------------
-- 5. INFRASTRUCTURE: STORAGE BUCKETS
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('adega_storage', 'adega_storage', true) ON CONFLICT (id) DO NOTHING;
