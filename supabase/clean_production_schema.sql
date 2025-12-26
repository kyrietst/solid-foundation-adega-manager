


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






COMMENT ON SCHEMA "public" IS 'get_low_stock_products function removed in v2.0.0 simplification (2025-09-24) - minimum_stock concept eliminated';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."movement_type" AS ENUM (
    'sale',
    'initial_stock',
    'inventory_adjustment',
    'return',
    'stock_transfer_out',
    'stock_transfer_in',
    'personal_consumption'
);


ALTER TYPE "public"."movement_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_enum" AS ENUM (
    'cash',
    'credit',
    'debit',
    'pix',
    'bank_transfer',
    'check',
    'other'
);


ALTER TYPE "public"."payment_method_enum" OWNER TO "postgres";


CREATE TYPE "public"."report_period_type" AS ENUM (
    'day',
    'week',
    'month',
    'year'
);


ALTER TYPE "public"."report_period_type" OWNER TO "postgres";


CREATE TYPE "public"."sales_status_enum" AS ENUM (
    'pending',
    'processing',
    'completed',
    'cancelled',
    'refunded'
);


ALTER TYPE "public"."sales_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'employee',
    'delivery'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."assign_delivery_person"("p_sale_id" "uuid", "p_delivery_person_id" "uuid" DEFAULT NULL::"uuid", "p_auto_assign" boolean DEFAULT false) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  assigned_delivery_person_id UUID;
  assigned_delivery_person_name TEXT;
  result JSON;
BEGIN
  -- Verificar se a venda existe e é de delivery
  IF NOT EXISTS (
    SELECT 1 FROM sales 
    WHERE id = p_sale_id 
    AND delivery_type = 'delivery'
  ) THEN
    RAISE EXCEPTION 'Venda não encontrada ou não é do tipo delivery';
  END IF;

  -- Se é auto-assign ou não foi fornecido entregador específico
  IF p_auto_assign OR p_delivery_person_id IS NULL THEN
    -- Buscar entregador disponível com menos entregas ativas
    SELECT p.id INTO assigned_delivery_person_id
    FROM profiles p
    LEFT JOIN (
      SELECT 
        delivery_person_id,
        COUNT(*) as active_deliveries
      FROM sales 
      WHERE delivery_person_id IS NOT NULL 
      AND delivery_status IN ('preparing', 'out_for_delivery')
      GROUP BY delivery_person_id
    ) active ON p.id = active.delivery_person_id
    WHERE p.role = 'delivery'
    ORDER BY COALESCE(active.active_deliveries, 0) ASC
    LIMIT 1;
    
    IF assigned_delivery_person_id IS NULL THEN
      RAISE EXCEPTION 'Nenhum entregador disponível encontrado';
    END IF;
  ELSE
    -- Usar entregador específico fornecido
    -- Verificar se o usuário tem role de delivery
    SELECT id INTO assigned_delivery_person_id
    FROM profiles 
    WHERE id = p_delivery_person_id 
    AND role = 'delivery';
    
    IF assigned_delivery_person_id IS NULL THEN
      RAISE EXCEPTION 'Usuário não encontrado ou não é um entregador';
    END IF;
  END IF;

  -- Buscar nome do entregador
  SELECT name INTO assigned_delivery_person_name
  FROM profiles 
  WHERE id = assigned_delivery_person_id;

  -- Atualizar a venda com o entregador atribuído
  UPDATE sales 
  SET 
    delivery_person_id = assigned_delivery_person_id,
    updated_at = NOW()
  WHERE id = p_sale_id;

  -- Adicionar evento de tracking
  INSERT INTO delivery_tracking (
    sale_id,
    status,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    p_sale_id,
    'assigned',
    'Entregador atribuído: ' || assigned_delivery_person_name,
    auth.uid(),
    NOW(),
    NOW()
  );

  -- Retornar resultado
  result := json_build_object(
    'success', true,
    'delivery_person_id', assigned_delivery_person_id,
    'delivery_person_name', assigned_delivery_person_name,
    'assignment_type', CASE WHEN p_auto_assign THEN 'automatic' ELSE 'manual' END
  );

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."assign_delivery_person"("p_sale_id" "uuid", "p_delivery_person_id" "uuid", "p_auto_assign" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_packages INTEGER;
    current_loose INTEGER;
    package_units INTEGER;
    new_packages INTEGER;
    new_loose INTEGER;
    units_added INTEGER;
BEGIN
    -- Buscar dados do produto
    SELECT stock_packages, stock_units_loose, COALESCE(package_units, 1)
    INTO current_packages, current_loose, package_units
    FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Product not found');
    END IF;
    
    IF current_packages < p_packages_to_break THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient packages to break');
    END IF;
    
    -- Calcular quebra
    new_packages := current_packages - p_packages_to_break;
    units_added := p_packages_to_break * package_units;
    new_loose := current_loose + units_added;
    
    -- Aplicar quebra
    UPDATE products 
    SET stock_packages = new_packages,
        stock_units_loose = new_loose,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    RETURN json_build_object(
        'success', true,
        'packages_broken', p_packages_to_break,
        'units_added', units_added,
        'new_packages', new_packages,
        'new_loose', new_loose
    );
END;
$$;


ALTER FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) IS 'Quebra pacotes fechados em unidades soltas';



CREATE OR REPLACE FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric DEFAULT 0) RETURNS TABLE("zone_id" "uuid", "zone_name" character varying, "delivery_fee" numeric, "estimated_time_minutes" integer, "minimum_order_value" numeric, "is_eligible" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Versão simplificada sem PostGIS
  -- Por enquanto, retorna a zona com menor taxa que atende ao valor mínimo
  -- Em produção, implementar lógica geográfica real com PostGIS
  
  RETURN QUERY
  SELECT 
    dz.id as zone_id,
    dz.name as zone_name,
    dz.delivery_fee,
    dz.estimated_time_minutes,
    dz.minimum_order_value,
    (p_order_value >= dz.minimum_order_value) as is_eligible
  FROM delivery_zones dz
  WHERE dz.is_active = true
    AND p_order_value >= dz.minimum_order_value
  ORDER BY dz.delivery_fee ASC, dz.priority DESC
  LIMIT 1;
  
  -- Se não encontrou zona elegível, retorna a zona com menor valor mínimo
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      dz.id as zone_id,
      dz.name as zone_name,
      dz.delivery_fee,
      dz.estimated_time_minutes,
      dz.minimum_order_value,
      FALSE as is_eligible
    FROM delivery_zones dz
    WHERE dz.is_active = true
    ORDER BY dz.minimum_order_value ASC, dz.delivery_fee ASC
    LIMIT 1;
  END IF;
END;
$$;


ALTER FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric) IS 'Calcula taxa de entrega - versão simplificada sem PostGIS';



CREATE OR REPLACE FUNCTION "public"."calculate_turnover_rate"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    product_record RECORD;
    sales_last_30_days INTEGER;
    avg_sales_per_day NUMERIC;
    new_turnover_rate TEXT;
BEGIN
    -- Para cada produto, calcular a taxa de giro
    FOR product_record IN SELECT id FROM products LOOP
        -- Contar vendas dos últimos 30 dias
        SELECT COALESCE(SUM(si.quantity), 0) INTO sales_last_30_days
        FROM sale_items si
        JOIN sales s ON si.sale_id = s.id
        WHERE si.product_id = product_record.id
        AND s.created_at >= NOW() - INTERVAL '30 days';
        
        -- Calcular média de vendas por dia
        avg_sales_per_day := sales_last_30_days / 30.0;
        
        -- Determinar taxa de giro
        IF avg_sales_per_day >= 2 THEN
            new_turnover_rate := 'fast';
        ELSIF avg_sales_per_day >= 0.5 THEN
            new_turnover_rate := 'medium';
        ELSE
            new_turnover_rate := 'slow';
        END IF;
        
        -- Atualizar o produto
        UPDATE products 
        SET turnover_rate = new_turnover_rate
        WHERE id = product_record.id;
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."calculate_turnover_rate"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    current_packages INTEGER;
    current_loose INTEGER;
    package_units INTEGER;
    new_packages INTEGER;
    remaining_loose INTEGER;
    converted_packages INTEGER;
BEGIN
    -- Buscar dados do produto
    SELECT stock_packages, stock_units_loose, COALESCE(package_units, 1)
    INTO current_packages, current_loose, package_units
    FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Product not found');
    END IF;
    
    IF package_units <= 1 THEN
        RETURN json_build_object('success', false, 'error', 'Product does not support packages');
    END IF;
    
    -- Calcular conversão
    converted_packages := FLOOR(current_loose / package_units);
    remaining_loose := MOD(current_loose, package_units);
    new_packages := current_packages + converted_packages;
    
    IF converted_packages = 0 THEN
        RETURN json_build_object('success', false, 'error', 'Not enough loose units to form a package');
    END IF;
    
    -- Aplicar conversão
    UPDATE products 
    SET stock_packages = new_packages,
        stock_units_loose = remaining_loose,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    RETURN json_build_object(
        'success', true,
        'converted_packages', converted_packages,
        'remaining_loose', remaining_loose,
        'total_packages', new_packages
    );
END;
$$;


ALTER FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") IS 'Converte unidades soltas em pacotes quando possível';



CREATE OR REPLACE FUNCTION "public"."create_expiry_alert_if_needed"("p_batch_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_batch RECORD;
    v_product RECORD;
    v_days_until_expiry INTEGER;
    v_alert_type VARCHAR;
    v_alert_level INTEGER;
    v_title VARCHAR;
    v_message TEXT;
    v_suggested_action VARCHAR;
    v_priority INTEGER;
BEGIN
    -- Buscar informações do lote e produto
    SELECT pb.*, p.name as product_name, p.category as product_category
    INTO v_batch
    FROM product_batches pb
    JOIN products p ON pb.product_id = p.id
    WHERE pb.id = p_batch_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Calcular dias até vencimento
    v_days_until_expiry := v_batch.expiry_date - CURRENT_DATE;
    
    -- Determinar tipo de alerta baseado nos dias restantes
    IF v_days_until_expiry < 0 THEN
        v_alert_type := 'expired';
        v_alert_level := 4;
        v_priority := 5;
        v_title := 'PRODUTO VENCIDO: ' || v_batch.product_name;
        v_message := 'O lote ' || v_batch.batch_code || ' venceu há ' || ABS(v_days_until_expiry) || ' dias. Remover do estoque imediatamente.';
        v_suggested_action := 'Remover do estoque, verificar se foi vendido produto vencido, implementar processo de descarte';
    ELSIF v_days_until_expiry = 0 THEN
        v_alert_type := 'critical';
        v_alert_level := 4;
        v_priority := 5;
        v_title := 'VENCE HOJE: ' || v_batch.product_name;
        v_message := 'O lote ' || v_batch.batch_code || ' vence hoje. Priorizar venda imediata ou remover do estoque.';
        v_suggested_action := 'Priorizar venda hoje, aplicar desconto se necessário, ou remover do estoque ao final do dia';
    ELSIF v_days_until_expiry <= 3 THEN
        v_alert_type := 'urgent';
        v_alert_level := 3;
        v_priority := 4;
        v_title := 'VENCIMENTO URGENTE: ' || v_batch.product_name;
        v_message := 'O lote ' || v_batch.batch_code || ' vence em ' || v_days_until_expiry || ' dias. Ação urgente necessária.';
        v_suggested_action := 'Aplicar estratégia FEFO rigorosa, considerar promoção ou desconto';
    ELSIF v_days_until_expiry <= 7 THEN
        v_alert_type := 'warning';
        v_alert_level := 2;
        v_priority := 3;
        v_title := 'Atenção: ' || v_batch.product_name || ' próximo do vencimento';
        v_message := 'O lote ' || v_batch.batch_code || ' vence em ' || v_days_until_expiry || ' dias. Monitorar de perto.';
        v_suggested_action := 'Priorizar nas vendas, verificar rotação do estoque';
    ELSIF v_days_until_expiry <= 30 THEN
        v_alert_type := 'warning';
        v_alert_level := 1;
        v_priority := 2;
        v_title := 'Prazo de validade: ' || v_batch.product_name;
        v_message := 'O lote ' || v_batch.batch_code || ' vence em ' || v_days_until_expiry || ' dias. Acompanhar rotação.';
        v_suggested_action := 'Verificar velocidade de vendas, ajustar posicionamento no estoque';
    ELSE
        -- Não criar alerta para produtos com mais de 30 dias
        RETURN;
    END IF;
    
    -- Verificar se já existe alerta ativo para este lote
    IF EXISTS (
        SELECT 1 FROM expiry_alerts 
        WHERE batch_id = p_batch_id 
        AND status = 'active'
        AND alert_type = v_alert_type
    ) THEN
        RETURN; -- Já existe alerta do mesmo tipo
    END IF;
    
    -- Criar o alerta
    INSERT INTO expiry_alerts (
        batch_id,
        product_id,
        alert_type,
        alert_level,
        expiry_date,
        alert_date,
        days_until_expiry,
        affected_packages,
        affected_units,
        estimated_loss_value,
        title,
        message,
        suggested_action,
        product_name,
        product_category,
        supplier_name,
        priority
    ) VALUES (
        p_batch_id,
        v_batch.product_id,
        v_alert_type,
        v_alert_level,
        v_batch.expiry_date,
        CURRENT_DATE,
        v_days_until_expiry,
        v_batch.available_packages,
        v_batch.available_units,
        v_batch.available_units * COALESCE(v_batch.cost_per_unit, 0),
        v_title,
        v_message,
        v_suggested_action,
        v_batch.product_name,
        v_batch.product_category,
        v_batch.supplier_name,
        v_priority
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the main operation
        RAISE WARNING 'Erro ao criar alerta de vencimento para lote %: %', p_batch_id, SQLERRM;
END;
$$;


ALTER FUNCTION "public"."create_expiry_alert_if_needed"("p_batch_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_historical_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb", "p_total_amount" numeric, "p_payment_method" "text", "p_sale_date" timestamp with time zone, "p_notes" "text" DEFAULT NULL::"text", "p_delivery" boolean DEFAULT false, "p_delivery_fee" numeric DEFAULT 0) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_final_amount NUMERIC;
  v_items_count INTEGER := 0;
  v_customer_name TEXT;
  v_package_units INTEGER;
BEGIN
  -- ================================================================
  -- VALIDAÇÕES INICIAIS
  -- ================================================================
  
  -- Validar que o cliente existe
  SELECT name INTO v_customer_name FROM customers WHERE id = p_customer_id;
  IF v_customer_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cliente não encontrado'
    );
  END IF;
  
  -- Validar que há itens
  IF jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'A venda deve ter pelo menos 1 item'
    );
  END IF;
  
  -- Calcular valor final
  v_final_amount := p_total_amount;
  
  -- ================================================================
  -- INSERIR VENDA PRINCIPAL (SEM process_sale)
  -- ================================================================
  
  INSERT INTO sales (
    customer_id,
    user_id,
    total_amount,
    discount_amount,
    final_amount,
    payment_method,
    payment_status,
    status,
    delivery,
    delivery_fee,
    delivery_type,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_customer_id,
    p_user_id,
    p_total_amount,
    0, -- sem desconto
    v_final_amount,
    p_payment_method,
    'paid', -- sempre paga (histórica)
    'completed', -- sempre completada
    p_delivery,
    p_delivery_fee,
    CASE WHEN p_delivery THEN 'delivery' ELSE 'presencial' END,
    COALESCE(p_notes, 'Venda histórica - importação manual'),
    p_sale_date, -- Data customizada (backdating)
    p_sale_date  -- updated_at também usa data histórica
  ) RETURNING id INTO v_sale_id;
  
  -- ================================================================
  -- INSERIR ITENS DA VENDA (COM package_units)
  -- ================================================================
  
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Validar que o produto existe
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = (v_item->>'product_id')::UUID) THEN
      RAISE EXCEPTION 'Produto não encontrado: %', (v_item->>'product_id');
    END IF;
    
    -- ✅ CORREÇÃO: Buscar package_units do item ou usar 1 como padrão
    v_package_units := COALESCE((v_item->>'package_units')::INTEGER, 1);
    
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      sale_type,
      package_units,  -- ✅ CORREÇÃO: Incluir package_units
      created_at
    ) VALUES (
      v_sale_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      COALESCE(v_item->>'sale_type', 'unit'),
      v_package_units,  -- ✅ CORREÇÃO: Salvar package_units
      p_sale_date -- Mesmo timestamp da venda
    );
    
    v_items_count := v_items_count + 1;
  END LOOP;
  
  -- ================================================================
  -- IMPORTANTE: NÃO CRIAR inventory_movements
  -- Isso garante que o estoque permanece intocado
  -- Os triggers automáticos (update_customer_after_sale, etc) 
  -- vão atualizar as métricas do cliente normalmente
  -- ================================================================
  
  -- Log de sucesso
  RAISE NOTICE 'Venda histórica criada: % (cliente: %, itens: %, data: %)', 
    v_sale_id, v_customer_name, v_items_count, p_sale_date;
  
  -- ================================================================
  -- RETORNAR RESULTADO
  -- ================================================================
  
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'customer_name', v_customer_name,
    'items_count', v_items_count,
    'total_amount', p_total_amount,
    'sale_date', p_sale_date,
    'message', format('Venda histórica criada com sucesso (%s itens)', v_items_count),
    'warning', 'Esta venda NÃO afetou o estoque (como esperado)'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro
    RAISE LOG 'Erro ao criar venda histórica: % - %', SQLERRM, SQLSTATE;
    
    -- Retornar erro estruturado
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;


ALTER FUNCTION "public"."create_historical_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb", "p_total_amount" numeric, "p_payment_method" "text", "p_sale_date" timestamp with time zone, "p_notes" "text", "p_delivery" boolean, "p_delivery_fee" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_inventory_movement"("p_product_id" "uuid", "p_quantity_change" integer, "p_type" "public"."movement_type", "p_reason" "text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_movement_type" "text" DEFAULT 'unit'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_current_stock_units INTEGER;
  v_current_stock_packages INTEGER;
  v_current_stock_quantity INTEGER;
  v_new_stock_units INTEGER;
  v_new_stock_packages INTEGER;
  v_new_stock_quantity INTEGER;
  v_movement_id UUID;
  v_result JSONB;
  v_package_units INTEGER;
  v_sale_id UUID;
  v_related_sale_id UUID;
BEGIN
  -- Definir contexto para permitir atualização via RPC
  PERFORM set_config('app.called_from_rpc', 'true', true);

  -- 1. Obter estoque atual (incluindo units_per_package)
  SELECT stock_units_loose, stock_packages, stock_quantity, COALESCE(units_per_package, package_units, 1)
  INTO v_current_stock_units, v_current_stock_packages, v_current_stock_quantity, v_package_units
  FROM products
  WHERE id = p_product_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado: %', p_product_id;
  END IF;

  -- 2. Calcular novo estoque baseado no tipo de movimento
  IF COALESCE(p_movement_type, 'unit') = 'package' THEN
    -- Movimento de pacotes
    v_new_stock_packages := v_current_stock_packages + p_quantity_change;
    v_new_stock_units := v_current_stock_units;
    
    -- Validar estoque suficiente para pacotes
    IF v_new_stock_packages < 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente de pacotes. Atual: %, Solicitado: %',
        v_current_stock_packages, ABS(p_quantity_change);
    END IF;
  ELSE
    -- Movimento de unidades (padrão)
    v_new_stock_units := v_current_stock_units + p_quantity_change;
    v_new_stock_packages := v_current_stock_packages;

    -- Validar estoque suficiente para unidades
    IF v_new_stock_units < 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente de unidades soltas. Atual: %, Solicitado: %',
        v_current_stock_units, ABS(p_quantity_change);
    END IF;
  END IF;

  -- 3. Atualizar estoque total (legacy/read-only)
  v_new_stock_quantity := (v_new_stock_packages * v_package_units) + v_new_stock_units;

  -- 4. Persistir alterações no produto
  UPDATE products
  SET 
    stock_units_loose = v_new_stock_units,
    stock_packages = v_new_stock_packages,
    stock_quantity = v_new_stock_quantity, -- Mantendo campo legado atualizado
    updated_at = NOW()
  WHERE id = p_product_id;

  -- 5. Extrair IDs de venda do metadata
  v_sale_id := (p_metadata->>'sale_id')::uuid;
  v_related_sale_id := (p_metadata->>'related_sale_id')::uuid;

  -- 6. Inserir registro de movimento (CORRIGIDO: Colunas corretas)
  INSERT INTO inventory_movements (
    product_id,
    quantity_change,
    new_stock_quantity,
    type_enum,      -- Era 'type', mas schema diz 'type_enum'
    reason,
    metadata,
    previous_stock, -- Coluna existente para snapshot do estoque anterior
    sale_id,
    related_sale_id
    -- REMOVIDOS: quantity, direction, amount (não existem na tabela)
  ) VALUES (
    p_product_id,
    p_quantity_change,
    CASE WHEN p_movement_type = 'package' THEN v_new_stock_packages ELSE v_new_stock_units END,
    p_type,
    p_reason,
    p_metadata || jsonb_build_object('movement_type', COALESCE(p_movement_type, 'unit')),
    CASE WHEN p_movement_type = 'package' THEN v_current_stock_packages ELSE v_current_stock_units END,
    v_sale_id,
    v_related_sale_id
  ) RETURNING id INTO v_movement_id;

  -- 7. Limpar contexto
  PERFORM set_config('app.called_from_rpc', '', true);

  -- 8. Retornar resultado
  v_result := jsonb_build_object(
    'movement_id', v_movement_id,
    'previous_stock_units', v_current_stock_units,
    'previous_stock_packages', v_current_stock_packages,
    'new_stock_units', v_new_stock_units,
    'new_stock_packages', v_new_stock_packages,
    'quantity_change', p_quantity_change,
    'movement_type', COALESCE(p_movement_type, 'unit')
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."create_inventory_movement"("p_product_id" "uuid", "p_quantity_change" integer, "p_type" "public"."movement_type", "p_reason" "text", "p_metadata" "jsonb", "p_movement_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" character varying DEFAULT 'info'::character varying, "p_category" character varying DEFAULT 'general'::character varying, "p_data" "jsonb" DEFAULT '{}'::"jsonb", "p_expires_hours" integer DEFAULT NULL::integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  notification_id UUID;
  expires_timestamp TIMESTAMPTZ;
BEGIN
  -- Calcular expiração se fornecida
  IF p_expires_hours IS NOT NULL THEN
    expires_timestamp := NOW() + (p_expires_hours || ' hours')::INTERVAL;
  END IF;

  -- Inserir notificação
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    category,
    data,
    expires_at,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_title,
    p_message,
    p_type,
    p_category,
    p_data,
    expires_timestamp,
    NOW(),
    NOW()
  ) RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" character varying, "p_category" character varying, "p_data" "jsonb", "p_expires_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_product_batch"("p_product_id" "uuid", "p_batch_code" character varying, "p_manufacturing_date" "date", "p_expiry_date" "date", "p_total_packages" integer DEFAULT 1, "p_total_units" integer DEFAULT 1, "p_supplier_name" character varying DEFAULT NULL::character varying, "p_supplier_batch_code" character varying DEFAULT NULL::character varying, "p_cost_per_unit" numeric DEFAULT NULL::numeric, "p_quality_grade" character varying DEFAULT 'A'::character varying, "p_notes" "text" DEFAULT NULL::"text", "p_create_units" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_batch_id UUID;
    v_product RECORD;
    v_total_cost DECIMAL;
    v_package_units INTEGER;
    v_current_package INTEGER;
    v_current_unit INTEGER;
    v_unit_code VARCHAR;
    v_package_code VARCHAR;
    v_response JSON;
BEGIN
    -- Validar se produto existe e buscar informações
    SELECT * INTO v_product 
    FROM products 
    WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Produto não encontrado',
            'code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Validações básicas
    IF p_expiry_date <= p_manufacturing_date THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Data de validade deve ser posterior à data de fabricação',
            'code', 'INVALID_DATES'
        );
    END IF;
    
    IF p_total_units < 1 OR p_total_packages < 1 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantidades devem ser maiores que zero',
            'code', 'INVALID_QUANTITIES'
        );
    END IF;
    
    -- Verificar se já existe lote com mesmo código para este produto
    IF EXISTS (SELECT 1 FROM product_batches WHERE product_id = p_product_id AND batch_code = p_batch_code) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Já existe um lote com este código para este produto',
            'code', 'DUPLICATE_BATCH_CODE'
        );
    END IF;
    
    -- Calcular custo total
    v_total_cost := COALESCE(p_cost_per_unit, v_product.cost_price, 0) * p_total_units;
    
    -- Obter unidades por fardo do produto (usar package_units se disponível, senão package_size)
    v_package_units := COALESCE(v_product.package_units, v_product.package_size, 1);
    
    -- Criar o lote
    INSERT INTO product_batches (
        product_id,
        batch_code,
        supplier_batch_code,
        manufacturing_date,
        expiry_date,
        total_packages,
        total_units,
        available_packages,
        available_units,
        supplier_name,
        quality_grade,
        cost_per_unit,
        total_cost,
        notes,
        created_by
    ) VALUES (
        p_product_id,
        p_batch_code,
        p_supplier_batch_code,
        p_manufacturing_date,
        p_expiry_date,
        p_total_packages,
        p_total_units,
        p_total_packages, -- Inicialmente todos disponíveis
        p_total_units,    -- Inicialmente todas disponíveis
        p_supplier_name,
        p_quality_grade,
        COALESCE(p_cost_per_unit, v_product.cost_price),
        v_total_cost,
        p_notes,
        auth.uid()
    )
    RETURNING id INTO v_batch_id;
    
    -- Criar unidades rastreáveis se solicitado
    IF p_create_units AND (v_product.has_unit_tracking OR v_product.has_package_tracking) THEN
        v_current_package := 1;
        v_current_unit := 1;
        
        -- Loop através de todos os fardos
        WHILE v_current_package <= p_total_packages LOOP
            v_package_code := p_batch_code || '-P' || LPAD(v_current_package::TEXT, 3, '0');
            
            -- Loop através das unidades dentro do fardo atual
            FOR i IN 1..v_package_units LOOP
                EXIT WHEN v_current_unit > p_total_units; -- Não exceder total de unidades
                
                v_unit_code := p_batch_code || '-U' || LPAD(v_current_unit::TEXT, 6, '0');
                
                -- Inserir unidade rastreável
                INSERT INTO batch_units (
                    batch_id,
                    product_id,
                    unit_code,
                    package_code,
                    package_sequence,
                    unit_sequence,
                    unit_barcode,
                    package_barcode,
                    status,
                    created_by
                ) VALUES (
                    v_batch_id,
                    p_product_id,
                    v_unit_code,
                    v_package_code,
                    v_current_package,
                    i, -- Sequência dentro do fardo
                    CASE 
                        WHEN v_product.unit_barcode IS NOT NULL 
                        THEN v_product.unit_barcode || '-' || LPAD(v_current_unit::TEXT, 6, '0')
                        ELSE NULL
                    END,
                    CASE 
                        WHEN v_product.package_barcode IS NOT NULL 
                        THEN v_product.package_barcode || '-' || LPAD(v_current_package::TEXT, 3, '0')
                        ELSE NULL
                    END,
                    'available',
                    auth.uid()
                );
                
                v_current_unit := v_current_unit + 1;
            END LOOP;
            
            v_current_package := v_current_package + 1;
        END LOOP;
    END IF;
    
    -- Atualizar estoque do produto (somar ao estoque atual)
    UPDATE products 
    SET 
        stock_quantity = stock_quantity + p_total_units,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Registrar movimento de estoque
    INSERT INTO inventory_movements (
        type,
        product_id,
        quantity,
        reason,
        user_id,
        date
    ) VALUES (
        'in',
        p_product_id,
        p_total_units,
        'Recebimento de lote: ' || p_batch_code,
        auth.uid(),
        NOW()
    );
    
    -- Verificar se precisa criar alertas de vencimento
    PERFORM create_expiry_alert_if_needed(v_batch_id);
    
    -- Retornar sucesso com detalhes
    v_response := json_build_object(
        'success', true,
        'batch_id', v_batch_id,
        'batch_code', p_batch_code,
        'total_packages', p_total_packages,
        'total_units', p_total_units,
        'units_created', CASE WHEN p_create_units THEN p_total_units ELSE 0 END,
        'expiry_date', p_expiry_date,
        'days_until_expiry', (p_expiry_date - CURRENT_DATE)
    );
    
    RETURN v_response;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM,
            'code', 'INTERNAL_ERROR'
        );
END;
$$;


ALTER FUNCTION "public"."create_product_batch"("p_product_id" "uuid", "p_batch_code" character varying, "p_manufacturing_date" "date", "p_expiry_date" "date", "p_total_packages" integer, "p_total_units" integer, "p_supplier_name" character varying, "p_supplier_batch_code" character varying, "p_cost_per_unit" numeric, "p_quality_grade" character varying, "p_notes" "text", "p_create_units" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_quick_customer"("p_name" "text", "p_phone" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_customer_id uuid;
BEGIN
  INSERT INTO customers (name, phone, created_at, updated_at)
  VALUES (p_name, p_phone, NOW(), NOW())
  RETURNING id INTO v_customer_id;
  
  RETURN v_customer_id;
END;
$$;


ALTER FUNCTION "public"."create_quick_customer"("p_name" "text", "p_phone" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_sale_with_items"("p_customer_id" "uuid", "p_items" "jsonb", "p_payment_method_id" "uuid", "p_total_amount" numeric, "p_notes" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_sale_id uuid;
  v_item record;
begin
  -- Insert the sale record without seller_id
  insert into public.sales (
    customer_id,
    payment_method_id,
    total_amount,
    final_amount,
    payment_status,
    status,
    notes
  ) values (
    p_customer_id,
    p_payment_method_id,
    p_total_amount,
    p_total_amount, -- Assuming no discount for now
    'pending',
    'completed',
    p_notes
  )
  returning id into v_sale_id;

  -- Insert sale items
  for v_item in select * from jsonb_to_recordset(p_items) as x(
    product_id uuid,
    quantity integer,
    unit_price numeric
  )
  loop
    insert into public.sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    ) values (
      v_sale_id,
      v_item.product_id,
      v_item.quantity,
      v_item.unit_price,
      v_item.quantity * v_item.unit_price
    );

    -- Update product stock (if you have a stock column)
    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;
  end loop;

  return v_sale_id;
end;
$$;


ALTER FUNCTION "public"."create_sale_with_items"("p_customer_id" "uuid", "p_items" "jsonb", "p_payment_method_id" "uuid", "p_total_amount" numeric, "p_notes" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_sale_with_items"("p_sale_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_item RECORD;
BEGIN
    -- 1. Restore stock for each sale item
    FOR v_item IN 
        SELECT 
            product_id, 
            quantity, 
            sale_type 
        FROM sale_items 
        WHERE sale_id = p_sale_id
    LOOP
        -- Call create_inventory_movement to put item back into stock
        PERFORM create_inventory_movement(
            v_item.product_id,                          -- p_product_id
            v_item.quantity,                            -- p_quantity_change (positive to restore)
            'return'::movement_type,                    -- p_type
            'Cancelamento de venda ' || p_sale_id::text, -- p_reason
            jsonb_build_object(                         -- p_metadata
                'sale_id', p_sale_id,
                'action', 'delete_sale_restore',
                'fixed_by', 'fix_fk_prod_strict',
                'original_sale_type', COALESCE(v_item.sale_type, 'unit')
            ),
            COALESCE(v_item.sale_type, 'unit')::text    -- p_movement_type
        );
    END LOOP;

    -- 2. Explicitly unlink inventory movements (FIX PROD STRICT FK)
    --    Isso simula o comportamento de ON DELETE SET NULL via código
    UPDATE inventory_movements 
    SET sale_id = NULL, related_sale_id = NULL 
    WHERE sale_id = p_sale_id OR related_sale_id = p_sale_id;

    -- 3. Delete sale items explicitly
    DELETE FROM sale_items WHERE sale_id = p_sale_id;

    -- 4. Delete the sale
    DELETE FROM sales WHERE id = p_sale_id;
END;
$$;


ALTER FUNCTION "public"."delete_sale_with_items"("p_sale_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."fn_log_sale_event"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO public.customer_events (customer_id, source, source_id, payload)
  VALUES (NEW.customer_id, 'sale', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END$$;


ALTER FUNCTION "public"."fn_log_sale_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_mix"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("category" "text", "revenue" numeric)
    LANGUAGE "sql" STABLE
    AS $$
  select
    p.category,
    coalesce(sum(si.quantity * si.unit_price), 0) as revenue
  from sale_items si
  join products p on p.id = si.product_id
  join sales s on s.id = si.sale_id
  where s.created_at >= start_date and s.created_at < end_date
  group by p.category
  order by revenue desc
$$;


ALTER FUNCTION "public"."get_category_mix"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_crm_trends_new_customers"() RETURNS TABLE("month" integer, "year" integer, "new_customers" integer, "active_customers" integer, "avg_ltv" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    -- Dados dos últimos 6 meses
    SELECT 
      DATE_PART('month', generate_series::date) as month_num,
      DATE_PART('year', generate_series::date) as year_num,
      generate_series::date as month_start
    FROM generate_series(
      DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months'),
      DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Sao_Paulo'),
      INTERVAL '1 month'
    )
  ),
  new_customers_per_month AS (
    SELECT 
      DATE_PART('month', created_at AT TIME ZONE 'America/Sao_Paulo') as month_num,
      DATE_PART('year', created_at AT TIME ZONE 'America/Sao_Paulo') as year_num,
      COUNT(*) as new_count
    FROM customers
    WHERE created_at >= DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months')
    GROUP BY 1, 2
  ),
  active_customers_per_month AS (
    SELECT 
      DATE_PART('month', last_purchase_date AT TIME ZONE 'America/Sao_Paulo') as month_num,
      DATE_PART('year', last_purchase_date AT TIME ZONE 'America/Sao_Paulo') as year_num,
      COUNT(*) as active_count,
      AVG(lifetime_value) as avg_ltv_val
    FROM customers
    WHERE last_purchase_date IS NOT NULL
      AND last_purchase_date >= DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months')
    GROUP BY 1, 2
  )
  SELECT 
    md.month_num::INTEGER,
    md.year_num::INTEGER,
    COALESCE(nc.new_count, 0)::INTEGER as new_customers,
    COALESCE(ac.active_count, 0)::INTEGER as active_customers,
    COALESCE(ac.avg_ltv_val, 0)::NUMERIC(10,2) as avg_ltv
  FROM monthly_data md
  LEFT JOIN new_customers_per_month nc ON md.month_num = nc.month_num AND md.year_num = nc.year_num
  LEFT JOIN active_customers_per_month ac ON md.month_num = ac.month_num AND md.year_num = ac.year_num
  ORDER BY md.year_num, md.month_num;
END;
$$;


ALTER FUNCTION "public"."get_crm_trends_new_customers"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_metrics"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("total_customers" bigint, "new_customers" bigint, "active_customers" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  with sales_period as (
    select distinct customer_id
    from sales
    where created_at >= start_date and created_at < end_date
  ),
  first_purchase as (
    select customer_id, min(created_at) as first_order
    from sales
    group by 1
  )
  select
    (select count(*) from customers) as total_customers,
    (select count(*) from first_purchase fp where fp.first_order >= start_date and fp.first_order < end_date) as new_customers,
    (select count(*) from sales_period) as active_customers
$$;


ALTER FUNCTION "public"."get_customer_metrics"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
DECLARE
    customer_data RECORD;
    result JSON;
    total_purchases INTEGER := 0;
    total_spent NUMERIC := 0;
    avg_purchase_value NUMERIC := 0;
    total_products_bought INTEGER := 0;
    avg_items_per_purchase NUMERIC := 0;
    first_purchase_real TIMESTAMPTZ;
    last_purchase_real TIMESTAMPTZ;
    days_since_last_purchase INTEGER := 0;
    insights_count INTEGER := 0;
    insights_confidence NUMERIC := 0;
    calculated_favorite_category TEXT;
    calculated_favorite_product TEXT;
    ltv_difference NUMERIC := 0;
    ltv_synced BOOLEAN := false;
    dates_synced BOOLEAN := false;
    preferences_synced BOOLEAN := false;
    latest_insights_json JSON;
BEGIN
    -- Verificar se o cliente existe
    IF p_customer_id IS NULL THEN
        RAISE EXCEPTION 'Customer ID é obrigatório';
    END IF;

    -- 1. Buscar dados básicos do cliente
    SELECT * INTO customer_data 
    FROM customers 
    WHERE id = p_customer_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Cliente não encontrado';
    END IF;

    -- 2. Calcular métricas de vendas
    SELECT 
        COUNT(*) as purchase_count,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(AVG(total_amount), 0) as avg_amount,
        MIN(created_at) as first_purchase,
        MAX(created_at) as last_purchase
    INTO total_purchases, total_spent, avg_purchase_value, first_purchase_real, last_purchase_real
    FROM sales 
    WHERE customer_id = p_customer_id;

    -- 3. Calcular total de produtos comprados
    SELECT COALESCE(SUM(si.quantity), 0)
    INTO total_products_bought
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    WHERE s.customer_id = p_customer_id;

    -- 4. Calcular categoria favorita
    SELECT category
    INTO calculated_favorite_category
    FROM (
        SELECT 
            p.category,
            SUM(si.quantity) as total_quantity
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN products p ON si.product_id = p.id
        WHERE s.customer_id = p_customer_id AND p.category IS NOT NULL
        GROUP BY p.category
        ORDER BY total_quantity DESC
        LIMIT 1
    ) fav_cat;

    -- 5. Calcular produto favorito
    SELECT product_name
    INTO calculated_favorite_product
    FROM (
        SELECT 
            p.name as product_name,
            SUM(si.quantity) as total_quantity
        FROM sales s
        JOIN sale_items si ON s.id = si.sale_id
        JOIN products p ON si.product_id = p.id
        WHERE s.customer_id = p_customer_id AND p.name IS NOT NULL
        GROUP BY p.name
        ORDER BY total_quantity DESC
        LIMIT 1
    ) fav_prod;

    -- 6. Calcular média de itens por compra
    IF total_purchases > 0 THEN
        avg_items_per_purchase := total_products_bought::NUMERIC / total_purchases;
    END IF;

    -- 7. Calcular dias desde última compra
    IF last_purchase_real IS NOT NULL THEN
        days_since_last_purchase := EXTRACT(days FROM (NOW() - last_purchase_real))::INTEGER;
    END IF;

    -- 8. Buscar insights reais
    SELECT 
        COUNT(*) as count,
        COALESCE(AVG(confidence), 0) as avg_confidence
    INTO insights_count, insights_confidence
    FROM customer_insights 
    WHERE customer_id = p_customer_id AND is_active = true;

    -- 9. Buscar insights mais recentes separadamente
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', id,
            'insight_type', insight_type,
            'insight_value', insight_value,
            'confidence', confidence,
            'created_at', created_at
        )
    ), '[]'::json)
    INTO latest_insights_json
    FROM (
        SELECT id, insight_type, insight_value, confidence, created_at
        FROM customer_insights 
        WHERE customer_id = p_customer_id AND is_active = true
        ORDER BY created_at DESC
        LIMIT 5
    ) recent_insights;

    -- 10. Calcular status de sincronização
    ltv_difference := total_spent - COALESCE(customer_data.lifetime_value, 0);
    ltv_synced := ABS(ltv_difference) < 1; -- Considera sincronizado se diferença < R$ 1
    
    dates_synced := CASE 
        WHEN customer_data.last_purchase_date IS NULL AND last_purchase_real IS NULL THEN true
        WHEN customer_data.last_purchase_date IS NOT NULL AND last_purchase_real IS NOT NULL THEN
            customer_data.last_purchase_date::TIMESTAMPTZ = last_purchase_real
        ELSE false
    END;
    
    preferences_synced := COALESCE(customer_data.favorite_category, '') = COALESCE(calculated_favorite_category, '');

    -- 11. Construir resultado JSON
    result := json_build_object(
        'id', customer_data.id,
        'name', customer_data.name,
        'email', customer_data.email,
        'phone', customer_data.phone,
        'segment', customer_data.segment,
        'favorite_category', customer_data.favorite_category,
        'created_at', customer_data.created_at,
        
        'lifetime_value_stored', COALESCE(customer_data.lifetime_value, 0),
        'lifetime_value_calculated', total_spent,
        'ltv_difference', ltv_difference,
        
        'total_purchases', total_purchases,
        'total_spent', total_spent,
        'avg_purchase_value', avg_purchase_value,
        'total_products_bought', total_products_bought,
        'avg_items_per_purchase', avg_items_per_purchase,
        
        'first_purchase_stored', customer_data.first_purchase_date,
        'last_purchase_stored', customer_data.last_purchase_date,
        'first_purchase_real', first_purchase_real,
        'last_purchase_real', last_purchase_real,
        'days_since_last_purchase', days_since_last_purchase,
        
        'insights_count', insights_count,
        'insights_confidence', insights_confidence,
        'latest_insights', latest_insights_json,
        
        'calculated_favorite_category', calculated_favorite_category,
        'calculated_favorite_product', calculated_favorite_product,
        
        'data_sync_status', json_build_object(
            'ltv_synced', ltv_synced,
            'dates_synced', dates_synced,
            'preferences_synced', preferences_synced
        )
    );

    RETURN result;
END;
$_$;


ALTER FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") IS 'Calcula métricas reais de um cliente específico baseado em vendas e interações reais';



CREATE OR REPLACE FUNCTION "public"."get_customer_retention"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("period" "text", "retained" bigint, "lost" bigint)
    LANGUAGE "sql"
    AS $$
  WITH monthly_activity AS (
    SELECT 
      TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') as period,
      COUNT(DISTINCT s.customer_id) as active_customers,
      COUNT(s.id) as total_sales
    FROM sales s
    WHERE s.created_at BETWEEN start_date AND end_date
      AND s.status = 'completed'
      AND s.final_amount > 0
    GROUP BY TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
  ),
  baseline AS (
    SELECT COUNT(DISTINCT id) as total_customers 
    FROM customers 
    WHERE created_at <= end_date
  )
  SELECT 
    ma.period,
    ma.active_customers as retained,
    (SELECT total_customers FROM baseline) - ma.active_customers as lost
  FROM monthly_activity ma
  
  UNION ALL
  
  -- Add periods with no activity but show progression
  SELECT 
    TO_CHAR(date_series, 'YYYY-MM') as period,
    0 as retained,
    (SELECT total_customers FROM baseline) as lost
  FROM generate_series(
    DATE_TRUNC('month', start_date AT TIME ZONE 'America/Sao_Paulo'),
    DATE_TRUNC('month', end_date AT TIME ZONE 'America/Sao_Paulo'),
    INTERVAL '1 month'
  ) as date_series
  WHERE TO_CHAR(date_series, 'YYYY-MM') NOT IN (
    SELECT TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
    FROM sales s
    WHERE s.created_at BETWEEN start_date AND end_date
      AND s.status = 'completed'
      AND s.final_amount > 0
  )
  
  ORDER BY period;
$$;


ALTER FUNCTION "public"."get_customer_retention"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("total_customers" bigint, "new_customers" bigint, "active_customers" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        -- 1. Total Customers (Base total histórica)
        (SELECT count(*) FROM customers WHERE deleted_at IS NULL)::bigint,
        
        -- 2. New Customers (Cadastrados no período)
        (SELECT count(*) FROM customers WHERE created_at BETWEEN start_date AND end_date AND deleted_at IS NULL)::bigint,
        
        -- 3. Active Customers (Compraram no período)
        (SELECT count(DISTINCT customer_id) FROM sales WHERE created_at BETWEEN start_date AND end_date AND customer_id IS NOT NULL AND status = 'completed')::bigint;
END;
$$;


ALTER FUNCTION "public"."get_customer_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_table_data"() RETURNS TABLE("id" "uuid", "cliente" "text", "categoria_favorita" "text", "segmento" "text", "metodo_preferido" "text", "ultima_compra" timestamp without time zone, "insights_count" bigint, "insights_confidence" numeric, "created_at" timestamp with time zone, "updated_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name as cliente,
    COALESCE(c.favorite_category, 'Não definida') as categoria_favorita,
    COALESCE(c.segment, 'Novo') as segmento,
    -- Método de pagamento mais utilizado por cliente
    (
      SELECT s.payment_method 
      FROM sales s 
      WHERE s.customer_id = c.id 
        AND s.payment_method IS NOT NULL
      GROUP BY s.payment_method 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    ) as metodo_preferido,
    c.last_purchase_date as ultima_compra,
    -- Count de insights ativos
    COALESCE((
      SELECT COUNT(*) 
      FROM customer_insights ci 
      WHERE ci.customer_id = c.id AND ci.is_active = true
    ), 0) as insights_count,
    -- Confiança média dos insights ativos
    COALESCE((
      SELECT AVG(ci.confidence) 
      FROM customer_insights ci 
      WHERE ci.customer_id = c.id AND ci.is_active = true
    ), 0) as insights_confidence,
    c.created_at,
    c.updated_at
  FROM customers c
  WHERE c.lifetime_value >= 0  -- Incluir todos os clientes, mesmo com LTV 0
  ORDER BY c.lifetime_value DESC, c.last_purchase_date DESC NULLS LAST;
END;
$$;


ALTER FUNCTION "public"."get_customer_table_data"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_daily_cash_flow"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) RETURNS TABLE("date" "text", "income" numeric, "outcome" numeric, "balance" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH daily_sales AS (
        SELECT
            to_char(sales.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') as day_str,
            COALESCE(SUM(sales.final_amount), 0) as total_income
        FROM sales
        WHERE sales.created_at >= p_start_date AND sales.created_at <= p_end_date
        AND sales.status = 'completed'
        GROUP BY 1
    ),
    daily_expenses AS (
        SELECT
            to_char(expenses.date AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD') as day_str,
            COALESCE(SUM(expenses.amount), 0) as total_outcome
        FROM expenses
        WHERE expenses.date >= p_start_date AND expenses.date <= p_end_date
        GROUP BY 1
    )
    SELECT
        to_char(to_date(COALESCE(s.day_str, e.day_str), 'YYYY-MM-DD'), 'DD/MM') as date,
        COALESCE(s.total_income, 0) as income,
        COALESCE(e.total_outcome, 0) as outcome,
        (COALESCE(s.total_income, 0) - COALESCE(e.total_outcome, 0)) as balance
    FROM daily_sales s
    FULL OUTER JOIN daily_expenses e ON s.day_str = e.day_str
    ORDER BY COALESCE(s.day_str, e.day_str);
END;
$$;


ALTER FUNCTION "public"."get_daily_cash_flow"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_daily_kpi_summary"("days_back" integer DEFAULT 30) RETURNS TABLE("period_start" "date", "period_end" "date", "total_sales" numeric, "total_revenue" numeric, "avg_order_value" numeric, "unique_customers" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        MIN(sale_date) as period_start,
        MAX(sale_date) as period_end,
        SUM(mv.total_sales)::numeric as total_sales,
        SUM(mv.total_revenue) as total_revenue,
        AVG(mv.avg_order_value) as avg_order_value,
        AVG(mv.unique_customers::numeric) as unique_customers
    FROM mv_daily_sales_kpis mv
    WHERE sale_date >= CURRENT_DATE - INTERVAL '1 day' * days_back;
END;
$$;


ALTER FUNCTION "public"."get_daily_kpi_summary"("days_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone DEFAULT ("now"() - '30 days'::interval), "p_end_date" timestamp with time zone DEFAULT "now"()) RETURNS TABLE("total_deliveries" bigint, "total_delivery_revenue" numeric, "total_delivery_fees" numeric, "avg_delivery_time_minutes" numeric, "avg_delivery_ticket" numeric, "on_time_rate" numeric, "completion_rate" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_deliveries,
    COALESCE(SUM(s.final_amount), 0) as total_delivery_revenue,
    COALESCE(SUM(s.delivery_fee), 0) as total_delivery_fees,
    COALESCE(AVG(
      CASE 
        WHEN s.delivery_completed_at IS NOT NULL AND s.delivery_started_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (s.delivery_completed_at - s.delivery_started_at)) / 60
        ELSE NULL 
      END
    ), 0) as avg_delivery_time_minutes,
    COALESCE(AVG(s.final_amount), 0) as avg_delivery_ticket,
    COALESCE(
      (COUNT(CASE 
        WHEN s.delivery_completed_at IS NOT NULL 
          AND s.estimated_delivery_time IS NOT NULL
          AND s.delivery_completed_at <= s.estimated_delivery_time 
        THEN 1 
      END) * 100.0 / NULLIF(COUNT(CASE WHEN s.delivery_status = 'delivered' THEN 1 END), 0)
      ), 0
    ) as on_time_rate,
    COALESCE(
      (COUNT(CASE WHEN s.delivery_status = 'delivered' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)), 0
    ) as completion_rate
  FROM sales s
  WHERE s.delivery_type = 'delivery'
    AND s.created_at >= p_start_date 
    AND s.created_at <= p_end_date;
END;
$$;


ALTER FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) IS 'Retorna métricas gerais de delivery por período';



CREATE OR REPLACE FUNCTION "public"."get_delivery_timeline"("p_sale_id" "uuid") RETURNS TABLE("tracking_id" "uuid", "status" character varying, "notes" "text", "location_lat" numeric, "location_lng" numeric, "created_by_id" "uuid", "created_by_name" "text", "created_at" timestamp with time zone, "time_diff_minutes" integer, "is_current_status" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  current_sale_status VARCHAR;
BEGIN
  -- Buscar status atual da venda
  SELECT delivery_status INTO current_sale_status 
  FROM sales 
  WHERE id = p_sale_id;

  -- Retornar timeline ordenada cronologicamente
  RETURN QUERY
  SELECT 
    dt.id as tracking_id,
    dt.status,
    dt.notes,
    dt.location_lat,
    dt.location_lng,
    dt.created_by as created_by_id,
    COALESCE(p.name, 'Sistema') as created_by_name,
    dt.created_at,
    -- Calcular diferença de tempo desde o evento anterior
    EXTRACT(EPOCH FROM (dt.created_at - LAG(dt.created_at) OVER (ORDER BY dt.created_at))) / 60 as time_diff_minutes,
    -- Marcar se é o status atual
    (dt.status = current_sale_status AND dt.created_at = (
      SELECT MAX(dt2.created_at) 
      FROM delivery_tracking dt2 
      WHERE dt2.sale_id = p_sale_id AND dt2.status = current_sale_status
    )) as is_current_status
  FROM delivery_tracking dt
  LEFT JOIN profiles p ON dt.created_by = p.id
  WHERE dt.sale_id = p_sale_id
  ORDER BY dt.created_at ASC;
END;
$$;


ALTER FUNCTION "public"."get_delivery_timeline"("p_sale_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_delivery_trends"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) RETURNS TABLE("date" "text", "delivery_orders" bigint, "delivery_revenue" numeric, "instore_orders" bigint, "instore_revenue" numeric, "total_orders" bigint, "total_sales" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS day
    ),
    daily_sales AS (
        SELECT
            -- FIX: Convert to Brazil Time before truncating to day
            date_trunc('day', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS sale_day,
            COUNT(*) FILTER (WHERE delivery_type = 'delivery') AS delivery_count,
            COALESCE(SUM(final_amount) FILTER (WHERE delivery_type = 'delivery'), 0) AS delivery_amount,
            COUNT(*) FILTER (WHERE delivery_type = 'presencial' OR delivery = false) AS instore_count,
            COALESCE(SUM(final_amount) FILTER (WHERE delivery_type = 'presencial' OR delivery = false), 0) AS instore_amount,
            COUNT(*) AS total_count,
            COALESCE(SUM(final_amount), 0) AS total_amount
        FROM sales
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        AND status = 'completed'
        GROUP BY 1
    )
    SELECT
        to_char(ds.day, 'DD/MM') as date,
        COALESCE(s.delivery_count, 0) as delivery_orders,
        COALESCE(s.delivery_amount, 0) as delivery_revenue,
        COALESCE(s.instore_count, 0) as instore_orders,
        COALESCE(s.instore_amount, 0) as instore_revenue,
        COALESCE(s.total_count, 0) as total_orders,
        COALESCE(s.total_amount, 0) as total_sales
    FROM date_series ds
    LEFT JOIN daily_sales s ON ds.day = s.sale_day
    ORDER BY ds.day;
END;
$$;


ALTER FUNCTION "public"."get_delivery_trends"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_delivery_vs_instore_comparison"("p_days" integer) RETURNS TABLE("delivery_orders" integer, "delivery_revenue" numeric, "delivery_avg_ticket" numeric, "instore_orders" integer, "instore_revenue" numeric, "instore_avg_ticket" numeric, "delivery_growth_rate" numeric, "instore_growth_rate" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_end_date timestamp with time zone := now();
  v_start_date timestamp with time zone := now() - (p_days || ' days')::interval;
BEGIN
  RETURN QUERY SELECT * FROM get_delivery_vs_instore_comparison(v_start_date, v_end_date);
END;
$$;


ALTER FUNCTION "public"."get_delivery_vs_instore_comparison"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_dual_stock_report"() RETURNS TABLE("product_id" "uuid", "product_name" "text", "packages" integer, "units_loose" integer, "total_units" integer, "package_units" integer, "estimated_packages_value" numeric, "estimated_loose_value" numeric, "total_value" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.stock_packages,
        p.stock_units_loose,
        p.stock_quantity,
        p.package_units,
        (p.stock_packages * COALESCE(p.package_price, p.price))::NUMERIC,
        (p.stock_units_loose * p.price)::NUMERIC,
        (p.stock_packages * COALESCE(p.package_price, p.price) + p.stock_units_loose * p.price)::NUMERIC
    FROM products p
    WHERE p.stock_quantity > 0
    ORDER BY p.stock_quantity DESC;
END;
$$;


ALTER FUNCTION "public"."get_dual_stock_report"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_dual_stock_report"() IS 'Relatório completo de estoque com valores estimados';



CREATE OR REPLACE FUNCTION "public"."get_expense_summary"("start_date" "date", "end_date" "date") RETURNS TABLE("total_expenses" numeric, "total_transactions" integer, "avg_expense" numeric, "top_category" character varying, "top_category_amount" numeric)
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  top_cat RECORD;
BEGIN
  -- Buscar categoria com maior gasto
  SELECT 
    ec.name,
    SUM(oe.amount) as amount
  INTO top_cat
  FROM operational_expenses oe
  JOIN expense_categories ec ON oe.category_id = ec.id
  WHERE oe.expense_date BETWEEN start_date AND end_date
  GROUP BY ec.name
  ORDER BY amount DESC
  LIMIT 1;
  
  -- Retornar dados resumo
  RETURN QUERY
  SELECT 
    COALESCE(SUM(oe.amount), 0) as total_expenses,
    COUNT(oe.id)::INTEGER as total_transactions,
    COALESCE(ROUND(AVG(oe.amount), 2), 0) as avg_expense,
    COALESCE(top_cat.name, 'N/A') as top_category,
    COALESCE(top_cat.amount, 0) as top_category_amount
  FROM operational_expenses oe
  WHERE oe.expense_date BETWEEN start_date AND end_date;
END;
$$;


ALTER FUNCTION "public"."get_expense_summary"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_expiry_alerts_30_days"("limit_count" integer DEFAULT 50) RETURNS TABLE("batch_id" "uuid", "product_id" "uuid", "product_name" "text", "batch_code" "text", "expiry_date" "date", "days_until_expiry" integer, "affected_units" integer, "estimated_loss_value" numeric, "alert_level" integer, "supplier_name" "text", "category" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pb.id as batch_id,
        pb.product_id,
        p.name as product_name,
        pb.batch_code::TEXT,
        pb.expiry_date,
        (pb.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry,
        pb.available_units as affected_units,
        (pb.available_units * COALESCE(pb.cost_per_unit, 0)) as estimated_loss_value,
        CASE 
            WHEN (pb.expiry_date - CURRENT_DATE) <= 7 THEN 3   -- Crítico: 7 dias ou menos
            WHEN (pb.expiry_date - CURRENT_DATE) <= 15 THEN 2  -- Alto: 15 dias ou menos
            WHEN (pb.expiry_date - CURRENT_DATE) <= 30 THEN 1  -- Médio: 30 dias ou menos
            ELSE 0
        END as alert_level,
        COALESCE(pb.supplier_name, '')::TEXT,
        COALESCE(p.category, '')::TEXT
    FROM product_batches pb
    INNER JOIN products p ON pb.product_id = p.id
    WHERE pb.expiry_date <= (CURRENT_DATE + INTERVAL '30 days')
      AND pb.available_units > 0
      AND pb.status != 'expired'
    ORDER BY pb.expiry_date ASC, pb.available_units DESC
    LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."get_expiry_alerts_30_days"("limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_inventory_financials"() RETURNS json
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_total_cost numeric;
    v_potential_revenue numeric;
BEGIN
    SELECT
        COALESCE(SUM(
            ((stock_packages * COALESCE(units_per_package, 1)) + stock_units_loose) * COALESCE(cost_price, 0)
        ), 0),
        COALESCE(SUM(
            ((stock_packages * COALESCE(units_per_package, 1)) + stock_units_loose) * COALESCE(price, 0)
        ), 0)
    INTO v_total_cost, v_potential_revenue
    FROM products
    WHERE deleted_at IS NULL;

    RETURN json_build_object(
        'total_cost', v_total_cost,
        'potential_revenue', v_potential_revenue
    );
END;
$$;


ALTER FUNCTION "public"."get_inventory_financials"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_inventory_kpis"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) RETURNS TABLE("product_id" "uuid", "name" "text", "category" "text", "stock" numeric, "avg_daily_sales" numeric, "doh" numeric, "turnover" numeric, "is_dead_stock" boolean, "is_critical" boolean)
    LANGUAGE "plpgsql"
    AS $$
declare
  days_diff numeric;
begin
  -- Calculate days difference, ensuring at least 1 to avoid division by zero
  days_diff := GREATEST(EXTRACT(DAY FROM (p_end_date - p_start_date)), 1);

  return query
  with s as (
    select si.product_id, sum(si.quantity)::numeric as qty
    from sale_items si
    join sales sa on sa.id = si.sale_id
    where sa.created_at >= p_start_date
      and sa.created_at <= p_end_date
    group by 1
  )
  select
    p.id as product_id,
    p.name::text, 
    p.category::text, 
    (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0))::numeric as stock,
    (coalesce(s.qty, 0) / days_diff)::numeric as avg_daily_sales,
    case when coalesce(s.qty, 0) > 0
         then ((COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0))::numeric / (coalesce(s.qty, 0) / days_diff))
         else null end::numeric as doh,
    case when (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) > 0 and coalesce(s.qty, 0) > 0
         then (coalesce(s.qty, 0) / nullif((COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0))::numeric, 0)) 
         else null end::numeric as turnover,
    (coalesce(s.qty, 0) = 0) as is_dead_stock,
    ((COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) <= COALESCE(p.minimum_stock, 10)) as is_critical
  from products p
  left join s on s.product_id = p.id
  where p.deleted_at IS NULL;
end;
$$;


ALTER FUNCTION "public"."get_inventory_kpis"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_inventory_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "period_type" "text" DEFAULT 'day'::"text") RETURNS TABLE("period_start" "text", "period_label" "text", "products_sold" bigint, "products_added" bigint, "out_of_stock" bigint)
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
    WITH periods AS (
        SELECT date_trunc(period_type, dd AT TIME ZONE 'America/Sao_Paulo')::date as period_start
        FROM generate_series(start_date, end_date, '1 day'::interval) dd
        GROUP BY 1
    ),
    inventory_data AS (
        SELECT
            date_trunc(period_type, date AT TIME ZONE 'America/Sao_Paulo')::date as period_start,
            SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as products_sold,
            SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as products_added
        FROM inventory_movements
        WHERE date BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    stock_status AS (
        SELECT
            date_trunc(period_type, created_at AT TIME ZONE 'America/Sao_Paulo')::date as period_start,
            COUNT(*) as out_of_stock
        FROM products
        WHERE (stock_packages * units_per_package + stock_units_loose) = 0
        GROUP BY 1
    )
    SELECT
        to_char(p.period_start, 'YYYY-MM-DD') as period_start,
        CASE 
            WHEN period_type = 'day' THEN to_char(p.period_start, 'DD/MM/YYYY')
            WHEN period_type = 'week' THEN 'Semana ' || to_char(p.period_start, 'IYYY-W"IW"')
            WHEN period_type = 'month' THEN to_char(p.period_start, 'MM/YYYY')
            WHEN period_type = 'quarter' THEN 'T' || to_char(p.period_start, 'Q/YYYY')
            ELSE to_char(p.period_start, 'DD/MM/YYYY')
        END AS period_label,
        COALESCE(id.products_sold, 0)::bigint as products_sold,
        COALESCE(id.products_added, 0)::bigint as products_added,
        COALESCE(ss.out_of_stock, 0)::bigint as out_of_stock
    FROM periods p
    LEFT JOIN inventory_data id ON p.period_start = id.period_start
    LEFT JOIN stock_status ss ON p.period_start = ss.period_start
    ORDER BY p.period_start;
$$;


ALTER FUNCTION "public"."get_inventory_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "period_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_inventory_total_value"() RETURNS TABLE("total_value" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(stock_quantity * price), 0)::numeric as total_value
  FROM products
  WHERE stock_quantity > 0;
END;
$$;


ALTER FUNCTION "public"."get_inventory_total_value"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_low_stock_count"() RETURNS integer
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT COUNT(*)::INTEGER
  FROM products p
  LEFT JOIN categories c ON p.category = c.name
  WHERE p.deleted_at IS NULL
    AND (
      -- Case 1: Product has specific override (Legacy/Specific behavior - kept as it is per product level override)
      (p.minimum_stock IS NOT NULL AND p.stock_quantity <= p.minimum_stock)
      OR
      -- Case 2: Product uses category defaults (Split Logic Only)
      (p.minimum_stock IS NULL AND (
          -- Check Packages (if category has a limit > 0)
          (COALESCE(c.default_min_stock_packages, 0) > 0 AND COALESCE(p.stock_packages, 0) <= c.default_min_stock_packages)
          OR
          -- Check Units (if category has a limit > 0)
          (COALESCE(c.default_min_stock_units, 0) > 0 AND COALESCE(p.stock_units_loose, 0) <= c.default_min_stock_units)
      ))
    );
$$;


ALTER FUNCTION "public"."get_low_stock_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_low_stock_products"("p_limit" integer DEFAULT 50, "p_offset" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "name" "text", "current_stock" integer, "minimum_stock" integer, "stock_packages" integer, "stock_units_loose" integer, "price" numeric, "category" "text", "limit_packages" integer, "limit_units" integer, "is_legacy_override" boolean)
    LANGUAGE "sql" STABLE
    AS $$
  SELECT
    p.id,
    p.name,
    (COALESCE(p.stock_packages, 0) + COALESCE(p.stock_units_loose, 0)) as current_stock,
    -- Legacy minimum_stock calculation for backward compatibility
    COALESCE(p.minimum_stock, 
             CASE WHEN COALESCE(c.default_min_stock_packages, 0) > 0 THEN c.default_min_stock_packages ELSE 0 END + 
             CASE WHEN COALESCE(c.default_min_stock_units, 0) > 0 THEN c.default_min_stock_units ELSE 0 END
    )::INTEGER as minimum_stock,
    p.stock_packages,
    p.stock_units_loose,
    p.price,
    p.category,
    -- New columns for detailed UI
    COALESCE(c.default_min_stock_packages, 0) as limit_packages,
    COALESCE(c.default_min_stock_units, 0) as limit_units,
    (p.minimum_stock IS NOT NULL) as is_legacy_override
  FROM products p
  LEFT JOIN categories c ON p.category = c.name
  WHERE p.deleted_at IS NULL
    -- Exclude products from inactive categories
    AND (c.is_active IS TRUE OR c.is_active IS NULL) 
    AND (
      -- Case 1: Product has specific override (Legacy/Specific behavior)
      (p.minimum_stock IS NOT NULL AND (COALESCE(p.stock_packages, 0) + COALESCE(p.stock_units_loose, 0)) <= p.minimum_stock)
      OR
      -- Case 2: Product uses category defaults (Split Logic)
      (p.minimum_stock IS NULL AND (
          -- Check Packages (if category has a limit > 0)
          (COALESCE(c.default_min_stock_packages, 0) > 0 AND COALESCE(p.stock_packages, 0) <= c.default_min_stock_packages)
          OR
          -- Check Units (if category has a limit > 0)
          (COALESCE(c.default_min_stock_units, 0) > 0 AND COALESCE(p.stock_units_loose, 0) <= c.default_min_stock_units)
      ))
    )
  ORDER BY
    -- Order by "severity"
    CASE 
        WHEN p.minimum_stock IS NOT NULL AND p.minimum_stock > 0 THEN 
            (COALESCE(p.stock_packages, 0) + COALESCE(p.stock_units_loose, 0))::DECIMAL / p.minimum_stock
        WHEN p.minimum_stock IS NULL THEN
            LEAST(
                CASE WHEN COALESCE(c.default_min_stock_packages, 0) > 0 THEN COALESCE(p.stock_packages, 0)::DECIMAL / c.default_min_stock_packages ELSE 100 END,
                CASE WHEN COALESCE(c.default_min_stock_units, 0) > 0 THEN COALESCE(p.stock_units_loose, 0)::DECIMAL / c.default_min_stock_units ELSE 100 END
            )
        ELSE 100
    END ASC,
    p.name
  LIMIT p_limit
  OFFSET p_offset;
$$;


ALTER FUNCTION "public"."get_low_stock_products"("p_limit" integer, "p_offset" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_monthly_expenses"("target_month" integer, "target_year" integer, "category_filter" character varying DEFAULT NULL::character varying) RETURNS TABLE("category_id" character varying, "category_name" character varying, "total_amount" numeric, "expense_count" integer, "avg_amount" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oe.category_id,
    ec.name as category_name,
    SUM(oe.amount) as total_amount,
    COUNT(oe.id)::INTEGER as expense_count,
    ROUND(AVG(oe.amount), 2) as avg_amount
  FROM operational_expenses oe
  JOIN expense_categories ec ON oe.category_id = ec.id
  WHERE 
    EXTRACT(MONTH FROM oe.expense_date) = target_month
    AND EXTRACT(YEAR FROM oe.expense_date) = target_year
    AND (category_filter IS NULL OR oe.category_id = category_filter)
  GROUP BY oe.category_id, ec.name
  ORDER BY total_amount DESC;
END;
$$;


ALTER FUNCTION "public"."get_monthly_expenses"("target_month" integer, "target_year" integer, "category_filter" character varying) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_movement_summary_stats"("p_product_id" "uuid") RETURNS TABLE("total_entradas" integer, "total_saidas" integer, "total_ajustes" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type IN ('entrada', 'in') THEN quantity ELSE 0 END)::INTEGER, 0) as total_entradas,
        COALESCE(SUM(CASE WHEN type IN ('saida', 'out', 'venda', 'fiado') THEN quantity ELSE 0 END)::INTEGER, 0) as total_saidas,
        COALESCE(COUNT(CASE WHEN type = 'ajuste' THEN 1 END)::INTEGER, 0) as total_ajustes
    FROM inventory_movements 
    WHERE product_id = p_product_id;
END;
$$;


ALTER FUNCTION "public"."get_movement_summary_stats"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_nps_score"("start_date" "date" DEFAULT NULL::"date", "end_date" "date" DEFAULT NULL::"date", "customer_segment" "text" DEFAULT NULL::"text") RETURNS TABLE("nps_score" integer, "total_responses" integer, "promoters" integer, "passives" integer, "detractors" integer, "promoter_percentage" numeric, "detractor_percentage" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    total_count INTEGER := 0;
    promoter_count INTEGER := 0;
    passive_count INTEGER := 0;
    detractor_count INTEGER := 0;
    final_nps INTEGER := 0;
BEGIN
    -- Construir query dinâmica baseada nos filtros
    SELECT COUNT(*)
    INTO total_count
    FROM nps_surveys ns
    LEFT JOIN customers c ON ns.customer_id = c.id
    WHERE 
        (start_date IS NULL OR ns.response_date::DATE >= start_date) AND
        (end_date IS NULL OR ns.response_date::DATE <= end_date) AND
        (customer_segment IS NULL OR c.segment = customer_segment);
    
    -- Contar promotores (9-10)
    SELECT COUNT(*)
    INTO promoter_count
    FROM nps_surveys ns
    LEFT JOIN customers c ON ns.customer_id = c.id
    WHERE 
        ns.score >= 9 AND
        (start_date IS NULL OR ns.response_date::DATE >= start_date) AND
        (end_date IS NULL OR ns.response_date::DATE <= end_date) AND
        (customer_segment IS NULL OR c.segment = customer_segment);
    
    -- Contar passivos (7-8)
    SELECT COUNT(*)
    INTO passive_count
    FROM nps_surveys ns
    LEFT JOIN customers c ON ns.customer_id = c.id
    WHERE 
        ns.score >= 7 AND ns.score <= 8 AND
        (start_date IS NULL OR ns.response_date::DATE >= start_date) AND
        (end_date IS NULL OR ns.response_date::DATE <= end_date) AND
        (customer_segment IS NULL OR c.segment = customer_segment);
    
    -- Contar detratores (0-6)
    SELECT COUNT(*)
    INTO detractor_count
    FROM nps_surveys ns
    LEFT JOIN customers c ON ns.customer_id = c.id
    WHERE 
        ns.score <= 6 AND
        (start_date IS NULL OR ns.response_date::DATE >= start_date) AND
        (end_date IS NULL OR ns.response_date::DATE <= end_date) AND
        (customer_segment IS NULL OR c.segment = customer_segment);
    
    -- Calcular NPS: % Promotores - % Detratores
    IF total_count > 0 THEN
        final_nps := ROUND(((promoter_count::NUMERIC / total_count::NUMERIC) * 100) - 
                          ((detractor_count::NUMERIC / total_count::NUMERIC) * 100));
    END IF;
    
    RETURN QUERY SELECT 
        final_nps,
        total_count,
        promoter_count,
        passive_count,
        detractor_count,
        CASE WHEN total_count > 0 THEN ROUND((promoter_count::NUMERIC / total_count::NUMERIC) * 100, 1) ELSE 0 END,
        CASE WHEN total_count > 0 THEN ROUND((detractor_count::NUMERIC / total_count::NUMERIC) * 100, 1) ELSE 0 END;
END;
$$;


ALTER FUNCTION "public"."get_nps_score"("start_date" "date", "end_date" "date", "customer_segment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_nps_trend"("months_back" integer DEFAULT 12) RETURNS TABLE("month_year" "text", "nps_score" integer, "responses" integer, "avg_score" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') as month_year,
        -- Calcular NPS para o mês
        (
            SELECT 
                ROUND(
                    ((COUNT(*) FILTER (WHERE score >= 9)::NUMERIC / COUNT(*)::NUMERIC) * 100) -
                    ((COUNT(*) FILTER (WHERE score <= 6)::NUMERIC / COUNT(*)::NUMERIC) * 100)
                )::INTEGER
            FROM nps_surveys ns2 
            WHERE DATE_TRUNC('month', ns2.response_date AT TIME ZONE 'America/Sao_Paulo') = DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo')
        ) as nps_score,
        COUNT(*)::INTEGER as responses,
        ROUND(AVG(ns.score), 1) as avg_score
    FROM nps_surveys ns
    WHERE ns.response_date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '1 month' * months_back)
    GROUP BY DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY month_year DESC;
END;
$$;


ALTER FUNCTION "public"."get_nps_trend"("months_back" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_orphan_sales"() RETURNS TABLE("sale_id" "uuid", "total_amount" numeric, "final_amount" numeric, "created_at" timestamp with time zone, "customer_name" "text", "seller_name" "text", "audit_info" json)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as sale_id,
    s.total_amount,
    s.final_amount,
    s.created_at,
    c.name as customer_name,
    p.name as seller_name,
    json_build_object(
      'has_audit_trail', EXISTS(
        SELECT 1 FROM audit_logs 
        WHERE record_id = s.id AND action = 'delete' AND table_name = 'sale_items'
      ),
      'last_update', s.updated_at,
      'payment_status', s.payment_status
    ) as audit_info
  FROM sales s
  LEFT JOIN sale_items si ON si.sale_id = s.id
  LEFT JOIN customers c ON c.id = s.customer_id
  LEFT JOIN profiles p ON p.id = COALESCE(s.seller_id, s.user_id)
  GROUP BY s.id, s.total_amount, s.final_amount, s.created_at, c.name, p.name, s.updated_at, s.payment_status
  HAVING COUNT(si.id) = 0
  ORDER BY s.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_orphan_sales"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_cost_at_date"("p_product_id" "uuid", "p_date" timestamp with time zone DEFAULT "now"()) RETURNS numeric
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_cost DECIMAL(10,2);
BEGIN
    SELECT cost_price INTO v_cost
    FROM product_cost_history
    WHERE product_id = p_product_id
    AND valid_from <= p_date
    AND (valid_to IS NULL OR valid_to > p_date)
    ORDER BY valid_from DESC
    LIMIT 1;
    
    -- If no history found, get current cost from products table
    IF v_cost IS NULL THEN
        SELECT cost_price INTO v_cost
        FROM products
        WHERE id = p_product_id;
    END IF;
    
    RETURN COALESCE(v_cost, 0);
END;
$$;


ALTER FUNCTION "public"."get_product_cost_at_date"("p_product_id" "uuid", "p_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_cost_history"("p_product_id" "uuid", "p_start_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_end_date" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE("id" "uuid", "cost_price" numeric, "valid_from" timestamp with time zone, "valid_to" timestamp with time zone, "reason" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pch.id,
        pch.cost_price,
        pch.valid_from,
        pch.valid_to,
        pch.reason,
        pch.created_at
    FROM product_cost_history pch
    WHERE pch.product_id = p_product_id
    AND (p_start_date IS NULL OR pch.valid_from >= p_start_date)
    AND (p_end_date IS NULL OR pch.valid_from <= p_end_date)
    ORDER BY pch.valid_from DESC;
END;
$$;


ALTER FUNCTION "public"."get_product_cost_history"("p_product_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_movement_summary"("p_product_id" "uuid") RETURNS TABLE("total_entradas" integer, "total_saidas" integer, "total_ajustes" integer, "current_stock" integer, "product_name" "text", "product_category" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type_enum IN ('initial_stock', 'stock_transfer_in', 'return') THEN ABS(quantity_change) ELSE 0 END)::INTEGER, 0) as total_entradas,
        COALESCE(SUM(CASE WHEN type_enum IN ('sale', 'stock_transfer_out', 'personal_consumption') THEN ABS(quantity_change) ELSE 0 END)::INTEGER, 0) as total_saidas,
        COALESCE(SUM(CASE WHEN type_enum = 'inventory_adjustment' THEN ABS(quantity_change) ELSE 0 END)::INTEGER, 0) as total_ajustes,
        (COALESCE(p.stock_packages, 0) + COALESCE(p.stock_units_loose, 0))::INTEGER as current_stock,
        p.name as product_name,
        p.category as product_category
    FROM inventory_movements im
    RIGHT JOIN products p ON p.id = p_product_id
    WHERE im.product_id = p_product_id OR im.product_id IS NULL
    GROUP BY p.stock_packages, p.stock_units_loose, p.name, p.category;
END;
$$;


ALTER FUNCTION "public"."get_product_movement_summary"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_performance_summary"() RETURNS TABLE("total_products" bigint, "low_stock_count" bigint, "slow_moving_count" bigint, "no_sales_count" bigint, "top_performer" "text", "top_revenue" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE stock_status = 'low_stock') as low_stock_count,
        COUNT(*) FILTER (WHERE stock_status = 'slow_moving') as slow_moving_count,
        COUNT(*) FILTER (WHERE stock_status = 'no_sales') as no_sales_count,
        (SELECT product_name FROM mv_product_performance_kpis ORDER BY total_revenue DESC LIMIT 1) as top_performer,
        (SELECT MAX(total_revenue) FROM mv_product_performance_kpis) as top_revenue
    FROM mv_product_performance_kpis;
END;
$$;


ALTER FUNCTION "public"."get_product_performance_summary"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_product_stock_quantity"("p_product_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    result INTEGER;
BEGIN
    SELECT COALESCE(stock_packages, 0) * COALESCE(NULLIF(package_units, 0), 1) + COALESCE(stock_units_loose, 0)
    INTO result
    FROM products 
    WHERE id = p_product_id;
    
    RETURN COALESCE(result, 0);
END;
$$;


ALTER FUNCTION "public"."get_product_stock_quantity"("p_product_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_products_with_invalid_categories"() RETURNS TABLE("product_id" "uuid", "product_name" "text", "invalid_category" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.category
  FROM products p
  WHERE p.category NOT IN (
    SELECT c.name 
    FROM categories c 
    WHERE c.is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."get_products_with_invalid_categories"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_products_with_invalid_categories"() IS 'Lista produtos com categorias inválidas';



CREATE OR REPLACE FUNCTION "public"."get_sales_by_category"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("category_name" "text", "total_revenue" numeric)
    LANGUAGE "sql"
    AS $$
  -- Retornar vendas por categoria de PRODUTO, não payment_method
  SELECT 
    p.category::text as category_name,
    SUM(si.quantity * si.unit_price)::numeric as total_revenue
  FROM sale_items si
  JOIN products p ON si.product_id = p.id
  JOIN sales s ON si.sale_id = s.id
  WHERE s.created_at BETWEEN start_date AND end_date
    AND s.status = 'completed'
  GROUP BY p.category
  ORDER BY total_revenue DESC;
$$;


ALTER FUNCTION "public"."get_sales_by_category"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_by_payment_method"("start_date" timestamp with time zone, "end_date" timestamp with time zone) RETURNS TABLE("payment_method" "text", "total_sales" bigint, "total_revenue" numeric, "avg_ticket" numeric)
    LANGUAGE "sql"
    AS $$
  SELECT 
    s.payment_method,
    COUNT(s.id) as total_sales,
    SUM(COALESCE(s.final_amount, 0)) as total_revenue,
    AVG(CASE WHEN s.final_amount > 0 THEN s.final_amount END) as avg_ticket
  FROM sales s
  WHERE s.created_at BETWEEN start_date AND end_date
    AND s.status = 'completed'
  GROUP BY s.payment_method 
  ORDER BY total_revenue DESC NULLS LAST, total_sales DESC;
$$;


ALTER FUNCTION "public"."get_sales_by_payment_method"("start_date" timestamp with time zone, "end_date" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) RETURNS TABLE("sale_date" "date", "period_label" "text", "total_revenue" numeric, "total_orders" integer, "delivery_revenue" numeric, "delivery_orders" integer, "presencial_revenue" numeric, "presencial_orders" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  WITH daily_sales AS (
    SELECT
      -- Agrupar por dia em timezone São Paulo
      (s.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE as day_date,
      
      -- Delivery: delivery_status = 'delivered' (entrega concluída)
      CASE 
        WHEN (s.delivery_type = 'delivery' OR s.delivery = true)
             AND s.delivery_status = 'delivered'
        THEN s.final_amount
        ELSE 0
      END as delivery_amount,
      
      CASE 
        WHEN (s.delivery_type = 'delivery' OR s.delivery = true)
             AND s.delivery_status = 'delivered'
        THEN 1
        ELSE 0
      END as delivery_count,
      
      -- Presencial: status = 'completed' (venda paga)
      CASE 
        WHEN (s.delivery_type = 'presencial' OR (s.delivery = false AND s.delivery_type IS NULL))
             AND s.status = 'completed'
        THEN s.final_amount
        ELSE 0
      END as presencial_amount,
      
      CASE 
        WHEN (s.delivery_type = 'presencial' OR (s.delivery = false AND s.delivery_type IS NULL))
             AND s.status = 'completed'
        THEN 1
        ELSE 0
      END as presencial_count
      
    FROM sales s
    WHERE 
      -- Filtro de período
      s.created_at >= p_start_date
      AND s.created_at <= p_end_date
      -- Excluir canceladas e devolvidas
      AND s.status NOT IN ('cancelled', 'returned')
      -- Apenas vendas com valor
      AND s.final_amount IS NOT NULL
      AND s.final_amount > 0
  )
  SELECT
    ds.day_date as sale_date,
    -- Label formatado: DD/MM
    TO_CHAR(ds.day_date, 'DD/MM') as period_label,
    -- Totais por dia
    COALESCE(SUM(ds.delivery_amount + ds.presencial_amount), 0)::NUMERIC as total_revenue,
    COALESCE(SUM(ds.delivery_count + ds.presencial_count), 0)::INTEGER as total_orders,
    -- Breakdown delivery
    COALESCE(SUM(ds.delivery_amount), 0)::NUMERIC as delivery_revenue,
    COALESCE(SUM(ds.delivery_count), 0)::INTEGER as delivery_orders,
    -- Breakdown presencial
    COALESCE(SUM(ds.presencial_amount), 0)::NUMERIC as presencial_revenue,
    COALESCE(SUM(ds.presencial_count), 0)::INTEGER as presencial_orders
  FROM daily_sales ds
  GROUP BY ds.day_date
  ORDER BY ds.day_date ASC;
END;
$$;


ALTER FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) IS 'SSoT: Retorna dados agregados por dia para o gráfico de vendas do Dashboard.
   Usa lógica híbrida: Delivery=delivered, Presencial=completed.
   Timezone: America/Sao_Paulo. Criado em 2025-11-21.';



CREATE OR REPLACE FUNCTION "public"."get_stock_report_by_category"() RETURNS TABLE("category" "text", "total_products" bigint, "total_units" bigint, "total_value" numeric, "avg_price" numeric, "percentage_of_total" numeric)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  total_portfolio_value NUMERIC;
BEGIN
  -- Calcular valor total do portfólio (Custo)
  SELECT SUM(
    (COALESCE(stock_packages, 0) * COALESCE(units_per_package, 1) + COALESCE(stock_units_loose, 0)) * COALESCE(cost_price, 0)
  ) INTO total_portfolio_value
  FROM products 
  WHERE deleted_at IS NULL;

  RETURN QUERY
  WITH base_data AS (
    SELECT 
      p.category::TEXT as cat,
      COUNT(*)::BIGINT as total_prod,
      SUM(COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0))::BIGINT as total_un,
      SUM(
        (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) * COALESCE(p.cost_price, 0)
      ) as total_val,
      AVG(p.price) as avg_pr, -- Mantendo preço de venda médio para referência
      CASE 
        WHEN total_portfolio_value > 0 THEN 
          (SUM(
            (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) * COALESCE(p.cost_price, 0)
          ) / total_portfolio_value * 100)
        ELSE 0
      END as raw_percentage
    FROM products p
    WHERE p.deleted_at IS NULL
    GROUP BY p.category
  ),
  with_adjusted_percentages AS (
    SELECT 
      *,
      CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY total_val DESC) = COUNT(*) OVER () THEN
          100.00 - SUM(ROUND(raw_percentage, 2)) OVER () + ROUND(raw_percentage, 2)
        ELSE
          ROUND(raw_percentage, 2)
      END as adjusted_percentage
    FROM base_data
  )
  SELECT 
    cat,
    total_prod,
    total_un,
    total_val,
    avg_pr,
    adjusted_percentage
  FROM with_adjusted_percentages
  ORDER BY total_val DESC;
END;
$$;


ALTER FUNCTION "public"."get_stock_report_by_category"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_customers"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) RETURNS TABLE("customer_id" "uuid", "customer_name" "text", "total_spent" numeric, "total_orders" bigint, "avg_order_value" numeric)
    LANGUAGE "sql"
    AS $$
  SELECT 
    c.id::uuid as customer_id,
    c.name::text as customer_name,
    COALESCE(sales_data.total_spent, 0)::numeric as total_spent,
    COALESCE(sales_data.total_orders, 0)::bigint as total_orders,
    COALESCE(sales_data.avg_order_value, 0)::numeric as avg_order_value
  FROM customers c
  LEFT JOIN (
    SELECT 
      customer_id,
      SUM(final_amount)::numeric as total_spent,
      COUNT(*)::bigint as total_orders,
      AVG(final_amount)::numeric as avg_order_value
    FROM sales 
    WHERE created_at BETWEEN start_date AND end_date
      AND status = 'completed'
      AND final_amount > 0
    GROUP BY customer_id
  ) sales_data ON c.id = sales_data.customer_id
  ORDER BY COALESCE(sales_data.total_spent, 0) DESC 
  LIMIT limit_count;
$$;


ALTER FUNCTION "public"."get_top_customers"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) RETURNS TABLE("product_name" "text", "total_sold" bigint)
    LANGUAGE "sql"
    AS $$
  SELECT p.name, SUM(si.quantity) FROM sales s
  JOIN sale_items si ON s.id = si.sale_id
  JOIN products p ON si.product_id = p.id
  WHERE s.created_at BETWEEN start_date AND end_date
  GROUP BY p.name ORDER BY 2 DESC LIMIT limit_count;
$$;


ALTER FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "by" "text") RETURNS TABLE("product_id" "uuid", "name" "text", "category" "text", "qty" numeric, "revenue" numeric)
    LANGUAGE "sql"
    AS $$
  -- Retornar produtos REAIS baseado em sale_items
  SELECT 
    p.id as product_id,
    p.name::text as name,
    p.category::text as category,
    SUM(si.quantity)::numeric as qty,
    SUM(si.quantity * si.unit_price)::numeric as revenue
  FROM sale_items si
  JOIN products p ON si.product_id = p.id
  JOIN sales s ON si.sale_id = s.id
  WHERE s.created_at BETWEEN start_date AND end_date
    AND s.status = 'completed'
  GROUP BY p.id, p.name, p.category
  ORDER BY 
    CASE 
      WHEN by = 'revenue' THEN SUM(si.quantity * si.unit_price)
      WHEN by = 'quantity' THEN SUM(si.quantity)
      ELSE SUM(si.quantity * si.unit_price)
    END DESC
  LIMIT limit_count;
$$;


ALTER FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "by" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_id" "uuid") RETURNS "public"."user_role"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN (
        SELECT role
        FROM public.profiles
        WHERE id = user_id
    );
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_simple"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Trigger executado na tabela auth.users durante signup
  -- Criar entrada na tabela users usando dados de auth.users
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),  -- Usar metadata se disponível
    'employee'  -- Role padrão para usuários criados via signup
  )
  ON CONFLICT (id) DO NOTHING;  -- Evitar erro se já existe
  
  -- Criar entrada na tabela profiles COM name e email populados
  INSERT INTO public.profiles (id, name, email, role, is_temporary_password)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),  -- Nome da metadata
    NEW.email,  -- Email do auth.users
    'employee',  -- Role padrão
    false  -- Não é senha temporária para signup normal
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,  -- Atualizar se necessário
    name = EXCLUDED.name,  -- Atualizar nome
    email = EXCLUDED.email,  -- Atualizar email
    is_temporary_password = EXCLUDED.is_temporary_password;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_simple"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_permission_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_permission_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_product_cost_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Only proceed if cost_price actually changed
    IF OLD.cost_price IS DISTINCT FROM NEW.cost_price THEN
        -- Close the previous cost record by setting valid_to to just before now
        UPDATE product_cost_history 
        SET valid_to = NOW() - INTERVAL '1 second'
        WHERE product_id = OLD.id 
        AND valid_to IS NULL;
        
        -- Insert new cost record
        INSERT INTO product_cost_history (
            product_id,
            cost_price,
            valid_from,
            valid_to,
            created_by,
            reason
        ) VALUES (
            NEW.id,
            NEW.cost_price,
            NOW(),
            NULL,
            auth.uid(),
            'Product cost updated via trigger'
        );
        
        -- Log the change in audit_logs (using correct column names)
        INSERT INTO audit_logs (
            table_name,
            action,
            old_data,
            new_data,
            user_id,
            ip_address
        ) VALUES (
            'products',
            'UPDATE_COST',
            jsonb_build_object('cost_price', OLD.cost_price),
            jsonb_build_object('cost_price', NEW.cost_price),
            auth.uid(),
            inet_client_addr()
        );
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_product_cost_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hard_delete_customer"("p_customer_id" "uuid", "p_user_id" "uuid", "p_confirmation_text" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_customer_name TEXT;
  v_sales_count INTEGER;
  v_user_role TEXT;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem realizar exclusão permanente';
  END IF;
  
  -- Validar texto de confirmação
  IF p_confirmation_text != 'EXCLUIR PERMANENTEMENTE' THEN
    RAISE EXCEPTION 'Texto de confirmação inválido';
  END IF;
  
  -- Buscar informações do cliente
  SELECT name INTO v_customer_name
  FROM customers
  WHERE id = p_customer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;
  
  -- Contar vendas (serão preservadas com customer_id NULL)
  SELECT COUNT(*)
  INTO v_sales_count
  FROM sales
  WHERE customer_id = p_customer_id;
  
  -- Registrar no audit log ANTES de deletar usando new_data
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    new_data,
    user_id,
    created_at
  ) VALUES (
    'customers',
    p_customer_id,
    'hard_delete',
    jsonb_build_object(
      'customer_name', v_customer_name,
      'sales_count', v_sales_count,
      'confirmation_text', p_confirmation_text
    ),
    p_user_id,
    NOW()
  );
  
  -- Desvincular vendas (manter vendas para fins fiscais)
  UPDATE sales
  SET customer_id = NULL
  WHERE customer_id = p_customer_id;
  
  -- Deletar permanentemente
  DELETE FROM customers WHERE id = p_customer_id;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'message', 'Cliente excluído permanentemente',
    'customer_name', v_customer_name,
    'sales_count', v_sales_count
  );
END;
$$;


ALTER FUNCTION "public"."hard_delete_customer"("p_customer_id" "uuid", "p_user_id" "uuid", "p_confirmation_text" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_feature_flag"("p_flag_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_flags JSONB;
    flag_value JSONB;
BEGIN
    -- Verificar se o usuário está autenticado
    IF auth.uid() IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Obter feature_flags do usuário atual
    SELECT feature_flags INTO user_flags
    FROM public.profiles
    WHERE id = auth.uid();

    -- Se não encontrou o usuário ou flags é null, retornar false
    IF user_flags IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verificar se a flag existe e obter seu valor
    flag_value := user_flags -> p_flag_name;

    -- Se a flag não existe, retornar false
    IF flag_value IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Verificar se o valor é exatamente true
    IF flag_value = 'true'::jsonb THEN
        RETURN TRUE;
    END IF;

    -- Em todos os outros casos, retornar false
    RETURN FALSE;
END;
$$;


ALTER FUNCTION "public"."has_feature_flag"("p_flag_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_feature_flag"("p_flag_name" "text") IS 'Verifica se o usuário atual tem uma feature flag específica habilitada. Retorna true apenas se a flag existir e tiver valor true.';



CREATE OR REPLACE FUNCTION "public"."import_delivery_csv_row"("p_order_number" "text", "p_datetime" "text", "p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_products" "text", "p_total_value" "text", "p_delivery_fee" "text", "p_payment_method" "text", "p_status" "text" DEFAULT 'Entregue'::"text", "p_delivery_person" "text" DEFAULT 'Victor'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  customer_id UUID;
  sale_id UUID;
  delivery_person_id UUID;
  zone_id UUID;
  admin_id UUID;
  parsed_datetime TIMESTAMP WITH TIME ZONE;
  total_amount NUMERIC;
  delivery_fee NUMERIC;
  final_amount NUMERIC;
  payment_method_mapped TEXT;
  product_id UUID;
BEGIN
  -- Parse da data (formato dd/MM/yyyy HH:mm)
  BEGIN
    parsed_datetime := TO_TIMESTAMP(p_datetime, 'DD/MM/YYYY HH24:MI');
  EXCEPTION WHEN OTHERS THEN
    parsed_datetime := NOW();
  END;
  
  -- Parse dos valores monetários
  total_amount := CAST(REPLACE(REGEXP_REPLACE(p_total_value, '[^0-9,.]', '', 'g'), ',', '.') AS NUMERIC);
  delivery_fee := CAST(REPLACE(REGEXP_REPLACE(p_delivery_fee, '[^0-9,.]', '', 'g'), ',', '.') AS NUMERIC);
  final_amount := total_amount + delivery_fee;
  
  -- Mapear método de pagamento
  payment_method_mapped := CASE LOWER(p_payment_method)
    WHEN 'dinheiro' THEN 'cash'
    WHEN 'cartão' THEN 'credit_card'
    WHEN 'pix' THEN 'pix'
    ELSE 'cash'
  END;
  
  -- Buscar IDs necessários
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO delivery_person_id FROM profiles WHERE name ILIKE '%victor%' LIMIT 1;
  SELECT id INTO zone_id FROM delivery_zones WHERE is_active = true ORDER BY priority LIMIT 1;
  
  -- Criar ou buscar cliente
  customer_id := upsert_customer_from_csv(p_customer_name, p_phone, p_address);
  
  -- Criar venda
  INSERT INTO sales (
    customer_id,
    user_id,
    seller_id,
    total_amount,
    delivery_fee,
    final_amount,
    payment_method,
    status,
    payment_status,
    delivery_type,
    delivery_status,
    delivery_person_id,
    delivery_zone_id,
    delivery_address,
    delivery_started_at,
    delivery_completed_at,
    notes,
    created_at,
    updated_at
  ) VALUES (
    customer_id,
    admin_id,
    admin_id,
    total_amount,
    delivery_fee,
    final_amount,
    payment_method_mapped,
    'completed',
    'paid',
    'delivery',
    'delivered',
    delivery_person_id,
    zone_id,
    jsonb_build_object('full_address', p_address, 'street', p_address),
    parsed_datetime + INTERVAL '5 minutes',
    parsed_datetime + INTERVAL '30 minutes',
    CASE WHEN p_order_number IS NOT NULL AND p_order_number != '' 
         THEN 'Pedido CSV #' || p_order_number 
         ELSE 'Importado do CSV histórico' END,
    parsed_datetime,
    parsed_datetime
  )
  RETURNING id INTO sale_id;
  
  -- Buscar ou criar produto genérico para importação
  SELECT id INTO product_id
  FROM products 
  WHERE name = 'Produtos Importados CSV'
  LIMIT 1;
  
  IF product_id IS NULL THEN
    INSERT INTO products (name, price, cost_price, category, stock_quantity)
    VALUES (
      'Produtos Importados CSV',
      10.00,
      7.00,
      'Importados',
      999
    )
    RETURNING id INTO product_id;
  END IF;
  
  -- Criar item único representando todo o pedido
  INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
  VALUES (sale_id, product_id, 1, total_amount);
  
  -- Criar timeline de tracking
  INSERT INTO delivery_tracking (sale_id, status, notes, created_by, created_at)
  VALUES 
    (sale_id, 'pending', 'Pedido CSV: ' || LEFT(p_products, 100), admin_id, parsed_datetime),
    (sale_id, 'preparing', 'Em preparação', admin_id, parsed_datetime + INTERVAL '2 minutes'),
    (sale_id, 'out_for_delivery', 'Saiu com ' || COALESCE(p_delivery_person, 'Victor'), delivery_person_id, parsed_datetime + INTERVAL '5 minutes'),
    (sale_id, 'delivered', 'Entregue - CSV', delivery_person_id, parsed_datetime + INTERVAL '30 minutes');
  
  RETURN sale_id;
END;
$$;


ALTER FUNCTION "public"."import_delivery_csv_row"("p_order_number" "text", "p_datetime" "text", "p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_products" "text", "p_total_value" "text", "p_delivery_fee" "text", "p_payment_method" "text", "p_status" "text", "p_delivery_person" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se há um usuário autenticado primeiro
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Verificar se é admin supremo primeiro
  IF public.is_supreme_admin() THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se tem role de admin no perfil
  RETURN (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_activity"("p_actor" "text", "p_role" "text", "p_action" "text", "p_entity" "text", "p_entity_id" "text" DEFAULT NULL::"text", "p_details" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO activity_logs (actor, role, action, entity, entity_id, details)
  VALUES (p_actor, p_role, p_action, p_entity, p_entity_id, p_details);
END;
$$;


ALTER FUNCTION "public"."log_activity"("p_actor" "text", "p_role" "text", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_audit_event"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
  v_action TEXT;
  v_old_data JSONB;
  v_new_data JSONB;
  v_record_id UUID;
BEGIN
  -- Determina o ID do usuário atual
  v_user_id := auth.uid();
  
  -- Determina a ação e os dados antigos/novos com base no tipo de trigger
  IF (TG_OP = 'INSERT') THEN
    v_action := 'insert';
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id;
  ELSIF (TG_OP = 'UPDATE') THEN
    v_action := 'update';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id;
  ELSIF (TG_OP = 'DELETE') THEN
    v_action := 'delete';
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_record_id := OLD.id;
  END IF;
  
  -- Insere o registro de auditoria
  INSERT INTO public.audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    v_user_id,
    v_action,
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );
  
  -- Para triggers BEFORE, retorna o registro apropriado
  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


ALTER FUNCTION "public"."log_audit_event"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric DEFAULT 0, "p_notes" "text" DEFAULT ''::"text", "p_is_delivery" boolean DEFAULT false) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_payment_method_name TEXT;
    v_product_id UUID;
    v_quantity_to_subtract INTEGER;
    v_sale_type TEXT;
    v_current_packages INTEGER;
    v_current_units INTEGER;
BEGIN
    -- Definir contexto RPC
    PERFORM set_config('app.called_from_rpc', 'true', true);

    -- 1. Validações e Criação da Venda
    SELECT name INTO v_payment_method_name FROM payment_methods WHERE id = p_payment_method_id LIMIT 1;
    IF v_payment_method_name IS NULL THEN v_payment_method_name := 'Outro'; END IF;

    IF p_final_amount < 0 THEN RAISE EXCEPTION 'Valor final não pode ser negativo'; END IF;

    INSERT INTO sales (customer_id, user_id, total_amount, discount_amount, final_amount, payment_method, payment_status, status, notes, delivery)
    VALUES (p_customer_id, p_user_id, p_total_amount, p_discount_amount, p_final_amount, v_payment_method_name, 'paid', 'completed', p_notes, p_is_delivery)
    RETURNING id INTO v_sale_id;

    -- 2. Processar Itens (LOOP)
    FOREACH v_item IN ARRAY p_items
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity_to_subtract := (v_item->>'quantity')::INTEGER;
        v_sale_type := COALESCE(v_item->>'sale_type', 'unit'); -- Default 'unit'

        -- Registrar Item na Tabela sale_items
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, sale_type)
        VALUES (
            v_sale_id, 
            v_product_id, 
            v_quantity_to_subtract, 
            (v_item->>'unit_price')::numeric,
            v_sale_type
        );

        -- 3. Baixa de Estoque (SMART ROUTING)
        IF v_sale_type = 'package' THEN
            -- [ROTA PACOTE]: Baixa de stock_packages
            PERFORM create_inventory_movement(
                v_product_id,
                -v_quantity_to_subtract, -- Negativo para saída
                'sale'::movement_type,
                'Venda de pacote - Sale #' || v_sale_id,
                jsonb_build_object(
                    'sale_id', v_sale_id,
                    'units_subtracted', v_quantity_to_subtract,
                    'source', 'process_sale',
                    'unit_type', 'package',
                    'payment_method', v_payment_method_name
                ),
                'package' -- <== CRITICAL: Route to package stock
            );
        ELSE
            -- [ROTA UNIDADE]: Baixa de stock_units_loose
            PERFORM create_inventory_movement(
                v_product_id,
                -v_quantity_to_subtract, -- Negativo para saída
                'sale'::movement_type,
                'Venda de unidades - Sale #' || v_sale_id,
                jsonb_build_object(
                    'sale_id', v_sale_id,
                    'units_subtracted', v_quantity_to_subtract,
                    'source', 'process_sale',
                    'unit_type', 'unit',
                    'payment_method', v_payment_method_name
                ),
                'unit' -- <== CRITICAL: Route to unit stock
            );
        END IF;

    END LOOP;

    -- Recalcular insights (Opcional, ignorar erro se func não existir)
    BEGIN PERFORM recalc_customer_insights(p_customer_id); EXCEPTION WHEN OTHERS THEN NULL; END;

    RETURN jsonb_build_object('sale_id', v_sale_id, 'status', 'success');
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao processar venda: %', SQLERRM;
END;
$$;


ALTER FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric, "p_notes" "text", "p_is_delivery" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric, "p_notes" "text", "p_is_delivery" boolean) IS 'Processa vendas com lógica simplificada usando create_inventory_movement. Subtrai pacotes de stock_packages e unidades de stock_units_loose sem conversões. Versão corrigida que respeita as regras de atualização de estoque do sistema.';



CREATE OR REPLACE FUNCTION "public"."sell_from_batch_fifo"("p_product_id" "uuid", "p_quantity" integer, "p_sale_id" "uuid" DEFAULT NULL::"uuid", "p_customer_id" "uuid" DEFAULT NULL::"uuid", "p_allow_partial" boolean DEFAULT true, "p_max_days_until_expiry" integer DEFAULT NULL::integer) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_product RECORD;
    v_batch RECORD;
    v_remaining_quantity INTEGER;
    v_units_to_sell INTEGER;
    v_units_sold INTEGER := 0;
    v_batches_affected JSONB := '[]'::JSONB;
    v_batch_info JSONB;
    v_unit RECORD;
    v_response JSON;
    v_total_available INTEGER;
    v_package_units INTEGER;
BEGIN
    -- Validar entrada
    IF p_quantity <= 0 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Quantidade deve ser maior que zero',
            'code', 'INVALID_QUANTITY'
        );
    END IF;
    
    -- Buscar produto e verificar se existe
    SELECT * INTO v_product FROM products WHERE id = p_product_id;
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Produto não encontrado',
            'code', 'PRODUCT_NOT_FOUND'
        );
    END IF;
    
    -- Obter unidades por pacote
    v_package_units := COALESCE(v_product.package_units, v_product.package_size, 1);
    
    -- Verificar estoque total disponível
    SELECT COALESCE(SUM(available_units), 0) INTO v_total_available
    FROM product_batches 
    WHERE product_id = p_product_id 
    AND status = 'active'
    AND available_units > 0
    AND (p_max_days_until_expiry IS NULL OR (expiry_date - CURRENT_DATE) <= p_max_days_until_expiry);
    
    IF v_total_available < p_quantity THEN
        IF NOT p_allow_partial THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Estoque insuficiente. Disponível: ' || v_total_available || ', Solicitado: ' || p_quantity,
                'code', 'INSUFFICIENT_STOCK',
                'available', v_total_available,
                'requested', p_quantity
            );
        END IF;
        -- Se permite parcial, ajustar quantidade para o disponível
        p_quantity := v_total_available;
    END IF;
    
    v_remaining_quantity := p_quantity;
    
    -- Cursor para lotes ordenados por FEFO
    FOR v_batch IN 
        SELECT * FROM product_batches 
        WHERE product_id = p_product_id 
        AND status = 'active'
        AND available_units > 0
        AND (p_max_days_until_expiry IS NULL OR (expiry_date - CURRENT_DATE) <= p_max_days_until_expiry)
        ORDER BY 
            expiry_date ASC,
            quality_grade ASC,
            created_at ASC
    LOOP
        EXIT WHEN v_remaining_quantity <= 0;
        
        -- Calcular quantas unidades vender deste lote
        v_units_to_sell := LEAST(v_remaining_quantity, v_batch.available_units);
        
        -- Se produto tem rastreamento por unidade, marcar unidades específicas
        IF v_product.has_unit_tracking THEN
            FOR v_unit IN
                SELECT * FROM batch_units
                WHERE batch_id = v_batch.id
                AND status = 'available'
                ORDER BY package_sequence, unit_sequence
                LIMIT v_units_to_sell
            LOOP
                UPDATE batch_units
                SET 
                    status = 'sold',
                    sold_at = NOW(),
                    sale_id = p_sale_id,
                    customer_id = p_customer_id,
                    updated_at = NOW()
                WHERE id = v_unit.id;
            END LOOP;
        END IF;
        
        -- Atualizar apenas available_units, deixar available_packages como está por enquanto
        UPDATE product_batches
        SET 
            available_units = available_units - v_units_to_sell,
            updated_at = NOW()
        WHERE id = v_batch.id;
        
        -- Marcar lote como esgotado se necessário
        IF (v_batch.available_units - v_units_to_sell) = 0 THEN
            UPDATE product_batches
            SET status = 'sold_out'
            WHERE id = v_batch.id;
        END IF;
        
        -- Registrar informações do lote afetado
        v_batch_info := jsonb_build_object(
            'batch_id', v_batch.id,
            'batch_code', v_batch.batch_code,
            'units_sold', v_units_to_sell,
            'expiry_date', v_batch.expiry_date,
            'days_until_expiry', (v_batch.expiry_date - CURRENT_DATE),
            'cost_per_unit', v_batch.cost_per_unit,
            'supplier_name', v_batch.supplier_name
        );
        
        v_batches_affected := v_batches_affected || v_batch_info;
        v_units_sold := v_units_sold + v_units_to_sell;
        v_remaining_quantity := v_remaining_quantity - v_units_to_sell;
    END LOOP;
    
    -- Atualizar estoque total do produto
    UPDATE products
    SET 
        stock_quantity = stock_quantity - v_units_sold,
        updated_at = NOW()
    WHERE id = p_product_id;
    
    -- Registrar movimento de estoque
    INSERT INTO inventory_movements (
        type,
        product_id,
        quantity,
        reason,
        user_id,
        date
    ) VALUES (
        'out',
        p_product_id,
        v_units_sold,
        'Venda FEFO' || CASE WHEN p_sale_id IS NOT NULL THEN ' - Venda ID: ' || p_sale_id ELSE '' END,
        auth.uid(),
        NOW()
    );
    
    -- Montar resposta
    v_response := json_build_object(
        'success', true,
        'units_sold', v_units_sold,
        'units_requested', p_quantity,
        'partial_sale', (v_units_sold < p_quantity),
        'batches_affected', v_batches_affected,
        'fefo_applied', true,
        'sale_id', p_sale_id,
        'customer_id', p_customer_id
    );
    
    RETURN v_response;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Erro interno: ' || SQLERRM,
            'code', 'INTERNAL_ERROR'
        );
END;
$$;


ALTER FUNCTION "public"."sell_from_batch_fifo"("p_product_id" "uuid", "p_quantity" integer, "p_sale_id" "uuid", "p_customer_id" "uuid", "p_allow_partial" boolean, "p_max_days_until_expiry" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_old_packages INTEGER;
    v_old_units_loose INTEGER;
    v_units_per_package INTEGER;
    v_package_change INTEGER;
    v_units_change INTEGER;
    v_total_unit_change INTEGER;
    v_product_name TEXT;
    v_movement_type movement_type;
    v_result JSON;
BEGIN
    PERFORM set_config('app.called_from_rpc', 'true', true);
    
    SELECT stock_packages, stock_units_loose, units_per_package, name
    INTO v_old_packages, v_old_units_loose, v_units_per_package, v_product_name
    FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto com ID % não encontrado', p_product_id; END IF;
    IF p_new_packages < 0 OR p_new_units_loose < 0 THEN RAISE EXCEPTION 'Valores de estoque não podem ser negativos.'; END IF;
    
    v_package_change := p_new_packages - COALESCE(v_old_packages, 0);
    v_units_change := p_new_units_loose - COALESCE(v_old_units_loose, 0);
    v_total_unit_change := (v_package_change * COALESCE(v_units_per_package, 1)) + v_units_change;
    
    IF v_package_change != 0 OR v_units_change != 0 THEN
        v_movement_type := 'inventory_adjustment'::movement_type;
        -- FIX DEV: Only insert into columns that exist in DEV (type_enum, quantity_change)
        INSERT INTO inventory_movements (
            product_id, type_enum, quantity_change, reason, user_id, date
        ) VALUES (
            p_product_id, 
            v_movement_type,        -- type_enum (enum)
            v_total_unit_change,    -- quantity_change (integer)
            p_reason, p_user_id, NOW()
        );
    END IF;
    
    UPDATE products SET stock_packages = p_new_packages, stock_units_loose = p_new_units_loose, updated_at = NOW() WHERE id = p_product_id;
    
    v_result := jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'audit_recorded', (v_package_change != 0 OR v_units_change != 0),
        'timestamp', NOW()
    );
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro em set_product_stock_absolute: % - %', SQLERRM, SQLSTATE;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;


ALTER FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") IS 'ARQUITETURA DE ESTADO ABSOLUTO: Define o estoque final de um produto.
Parâmetros:
- p_product_id: ID do produto
- p_new_packages: Quantidade final de pacotes
- p_new_units_loose: Quantidade final de unidades soltas  
- p_reason: Motivo do ajuste
- p_user_id: ID do usuário responsável

Lógica: 
1. Obtém estoque antigo
2. Calcula diferenças (novo - antigo)
3. Registra apenas as diferenças na auditoria
4. Atualiza com valores absolutos

Esta procedure elimina a complexidade de cálculo de deltas e previne bugs de corrupção de dados.';



CREATE OR REPLACE FUNCTION "public"."sync_delivery_status_to_sale_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Quando delivery_status muda para 'delivered', atualizar status da venda
  IF NEW.delivery_status = 'delivered' AND OLD.delivery_status != 'delivered' THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;$$;


ALTER FUNCTION "public"."sync_delivery_status_to_sale_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_sales_enum_columns"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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
END;$$;


ALTER FUNCTION "public"."sync_sales_enum_columns"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint DEFAULT 0, "p_quantity_units" smallint DEFAULT 0, "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_notes" "text" DEFAULT NULL::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_product RECORD;
  v_result JSON;
BEGIN
  -- Validação de entrada
  IF p_quantity_packages < 0 OR p_quantity_units < 0 THEN
    RAISE EXCEPTION 'Quantidades não podem ser negativas';
  END IF;

  IF p_quantity_packages = 0 AND p_quantity_units = 0 THEN
    RAISE EXCEPTION 'Transfira pelo menos pacotes OU unidades';
  END IF;

  -- Lock do produto (evita race conditions)
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado ou deletado';
  END IF;

  -- Verificar estoque disponível (Loja 1 / Active Stock)
  IF v_product.stock_packages < p_quantity_packages THEN
    RAISE EXCEPTION 'Estoque insuficiente de pacotes. Disponível: %, Solicitado: %',
      v_product.stock_packages, p_quantity_packages;
  END IF;

  IF v_product.stock_units_loose < p_quantity_units THEN
    RAISE EXCEPTION 'Estoque insuficiente de unidades. Disponível: %, Solicitado: %',
      v_product.stock_units_loose, p_quantity_units;
  END IF;

  -- ✅ TRANSFERÊNCIA ATÔMICA: Loja 1 → Loja 2
  UPDATE products
  SET
    stock_packages = stock_packages - p_quantity_packages,
    stock_units_loose = stock_units_loose - p_quantity_units,
    store2_holding_packages = store2_holding_packages + p_quantity_packages,
    store2_holding_units_loose = store2_holding_units_loose + p_quantity_units,
    updated_at = NOW()
  WHERE id = p_product_id;

  -- ✅ FIX: Usar type_enum e quantity_change
  INSERT INTO inventory_movements (
    product_id,
    type_enum,
    quantity_change,
    reason,
    user_id,
    metadata
  )
  VALUES (
    p_product_id,
    'stock_transfer_out'::movement_type,
    -(p_quantity_packages + p_quantity_units),
    COALESCE(p_notes, 'Transferência para Loja 2 (Holding)'),
    p_user_id,
    jsonb_build_object(
      'transfer_type', 'store1_to_store2',
      'packages_moved', p_quantity_packages,
      'units_moved', p_quantity_units
    )
  );

  -- Resultado da operação
  v_result := json_build_object(
    'success', true,
    'product_id', p_product_id,
    'transferred', json_build_object(
      'packages', p_quantity_packages,
      'units', p_quantity_units
    ),
    'new_stock_active', json_build_object(
      'packages', v_product.stock_packages - p_quantity_packages,
      'units', v_product.stock_units_loose - p_quantity_units
    ),
    'new_stock_holding', json_build_object(
      'packages', v_product.store2_holding_packages + p_quantity_packages,
      'units', v_product.store2_holding_units_loose + p_quantity_units
    )
  );

  RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint, "p_quantity_units" smallint, "p_user_id" "uuid", "p_notes" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint, "p_quantity_units" smallint, "p_user_id" "uuid", "p_notes" "text") IS 'Transfere estoque da Loja 1 para Loja 2 de forma atômica - VERSÃO FINAL (quantity positivo + type saida)';



CREATE OR REPLACE FUNCTION "public"."update_delivery_status"("p_sale_id" "uuid", "p_new_status" character varying, "p_notes" "text" DEFAULT NULL::"text", "p_latitude" numeric DEFAULT NULL::numeric, "p_longitude" numeric DEFAULT NULL::numeric) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_old_status VARCHAR(20);
  v_delivery_person_id UUID;
  v_user_id UUID;
  v_last_tracking_status VARCHAR(20);
BEGIN
  -- Obter ID do usuário atual
  v_user_id := auth.uid();
  
  -- Verificar se a venda existe e obter status atual
  SELECT delivery_status, delivery_person_id 
  INTO v_old_status, v_delivery_person_id
  FROM sales 
  WHERE id = p_sale_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Venda não encontrada: %', p_sale_id;
  END IF;
  
  -- Verificar se já existe um registro de tracking recente com o mesmo status
  SELECT status INTO v_last_tracking_status
  FROM delivery_tracking 
  WHERE sale_id = p_sale_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se o status é o mesmo do último tracking E do banco, não fazer nada
  IF v_old_status = p_new_status AND v_last_tracking_status = p_new_status THEN
    RAISE LOG 'Status já está atualizado para %: %', p_new_status, p_sale_id;
    RETURN FALSE; -- Sem mudança necessária
  END IF;
  
  -- Atualizar status na tabela sales apenas se diferente
  IF v_old_status != p_new_status THEN
    UPDATE sales 
    SET 
      delivery_status = p_new_status,
      delivery_started_at = CASE 
        WHEN p_new_status = 'out_for_delivery' AND delivery_started_at IS NULL 
        THEN NOW() 
        ELSE delivery_started_at 
      END,
      delivery_completed_at = CASE 
        WHEN p_new_status IN ('delivered', 'cancelled') 
        THEN NOW() 
        ELSE delivery_completed_at 
      END,
      updated_at = NOW()
    WHERE id = p_sale_id;
  END IF;
  
  -- Registrar no tracking apenas se não existir entry recente com mesmo status
  IF v_last_tracking_status IS NULL OR v_last_tracking_status != p_new_status THEN
    INSERT INTO delivery_tracking (
      sale_id,
      status,
      location_lat,
      location_lng,
      notes,
      created_by,
      created_at
    ) VALUES (
      p_sale_id,
      p_new_status,
      p_latitude,
      p_longitude,
      COALESCE(p_notes, 'Status alterado para ' || p_new_status),
      v_user_id,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."update_delivery_status"("p_sale_id" "uuid", "p_new_status" character varying, "p_notes" "text", "p_latitude" numeric, "p_longitude" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_product_category"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Verificar se a categoria existe e está ativa
  IF NOT EXISTS (
    SELECT 1 FROM categories 
    WHERE name = NEW.category 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Categoria "%" não existe ou está inativa. Use apenas categorias ativas cadastradas no sistema.', NEW.category;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_product_category"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."validate_product_category"() IS 'Valida se a categoria do produto existe e está ativa';



CREATE OR REPLACE FUNCTION "public"."validate_product_stock_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Permitir se foi chamado via RPC (verificando contexto)
  IF current_setting('app.called_from_rpc', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Verificar se stock_quantity foi alterado
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    RAISE EXCEPTION 'Atualizações de estoque devem usar create_inventory_movement(). Use: SELECT create_inventory_movement(product_id, quantity_change, type, reason, metadata)';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_product_stock_update"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."accounts_receivable" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "sale_id" "uuid",
    "amount" numeric(12,2) NOT NULL,
    "due_date" "date" NOT NULL,
    "status" "text" DEFAULT 'open'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."accounts_receivable" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor" "text",
    "role" "text",
    "action" "text" NOT NULL,
    "entity" "text",
    "entity_id" "text",
    "details" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "old_data" "jsonb",
    "new_data" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "name" "text",
    "role" "public"."user_role" DEFAULT 'employee'::"public"."user_role",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_temporary_password" boolean DEFAULT false,
    "feature_flags" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."profiles"."is_temporary_password" IS 'Indica se o usuário está usando uma senha temporária que deve ser alterada no próximo login';



COMMENT ON COLUMN "public"."profiles"."feature_flags" IS 'Configurações de feature flags para controlar acesso aos módulos da aplicação';



CREATE OR REPLACE VIEW "public"."activity_logs_view" AS
 SELECT "al"."id",
    COALESCE("p"."name", 'Sistema'::"text") AS "actor",
    COALESCE(("p"."role")::"text", 'system'::"text") AS "role",
    "al"."action",
    "al"."table_name" AS "entity",
    ("al"."record_id")::"text" AS "entity_id",
        CASE
            WHEN ("al"."action" = 'UPDATE_COST'::"text") THEN "concat"('Preço alterado de R$ ', "round"((("al"."old_data" ->> 'cost_price'::"text"))::numeric, 2), ' para R$ ', "round"((("al"."new_data" ->> 'cost_price'::"text"))::numeric, 2))
            WHEN ("al"."action" = 'REFRESH'::"text") THEN "concat"('Refresh de ', ("al"."new_data" ->> 'views_refreshed'::"text"), ' views em ', ("al"."new_data" ->> 'duration_seconds'::"text"), 's')
            WHEN (("al"."action" = 'update'::"text") AND ("al"."table_name" = 'sales'::"text")) THEN "concat"('Venda atualizada - Status: ', ("al"."new_data" ->> 'status_enum'::"text"))
            WHEN ("al"."action" = 'insert'::"text") THEN 'Registro criado'::"text"
            WHEN ("al"."action" = 'update'::"text") THEN 'Registro atualizado'::"text"
            WHEN ("al"."action" = 'delete'::"text") THEN 'Registro removido'::"text"
            ELSE "al"."action"
        END AS "details",
    "al"."created_at"
   FROM ("public"."audit_logs" "al"
     LEFT JOIN "public"."profiles" "p" ON (("p"."id" = "al"."user_id")))
  ORDER BY "al"."created_at" DESC;


ALTER VIEW "public"."activity_logs_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "workflow_id" "text",
    "workflow_name" "text",
    "trigger_event" "text",
    "result" "text",
    "details" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."automation_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."batch_units" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "batch_id" "uuid",
    "product_id" "uuid",
    "unit_code" character varying NOT NULL,
    "package_code" character varying,
    "status" character varying DEFAULT 'in_stock'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."batch_units" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "color" "text",
    "icon" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid",
    "default_min_stock_packages" integer DEFAULT 0,
    "default_min_stock_units" integer DEFAULT 0,
    CONSTRAINT "categories_display_order_non_negative" CHECK (("display_order" >= 0)),
    CONSTRAINT "categories_name_not_empty" CHECK (("length"(TRIM(BOTH FROM "name")) > 0))
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."categories" IS 'Tabela para gerenciar categorias de produtos dinamicamente';



COMMENT ON COLUMN "public"."categories"."name" IS 'Nome da categoria (único)';



COMMENT ON COLUMN "public"."categories"."description" IS 'Descrição opcional da categoria';



COMMENT ON COLUMN "public"."categories"."color" IS 'Cor em hexadecimal para exibição na UI';



COMMENT ON COLUMN "public"."categories"."icon" IS 'Nome do ícone do Lucide React para exibição';



COMMENT ON COLUMN "public"."categories"."is_active" IS 'Define se a categoria está ativa para uso';



COMMENT ON COLUMN "public"."categories"."display_order" IS 'Ordem de exibição nas listas (0 = primeiro)';



COMMENT ON COLUMN "public"."categories"."created_by" IS 'Usuário que criou a categoria';



CREATE TABLE IF NOT EXISTS "public"."customer_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "last_purchase_date" timestamp with time zone,
    "total_spent" numeric,
    "frequency_score" integer,
    "monetary_score" integer,
    "recency_score" integer,
    "churn_risk" "text",
    "custom_segment" "text",
    "calculated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_interactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "interaction_type" "text",
    "description" "text",
    "associated_sale_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_interactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "address" "jsonb",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "birthday" "date",
    "contact_preference" "text",
    "contact_permission" boolean DEFAULT false,
    "first_purchase_date" timestamp without time zone,
    "last_purchase_date" timestamp without time zone,
    "purchase_frequency" "text",
    "lifetime_value" numeric DEFAULT 0,
    "favorite_category" "text",
    "favorite_product" "uuid",
    "segment" "text",
    "tags" "jsonb" DEFAULT '[]'::"jsonb",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


COMMENT ON COLUMN "public"."customers"."tags" IS 'Array de tags personalizáveis para categorização flexível dos clientes';



COMMENT ON COLUMN "public"."customers"."deleted_at" IS 'Data e hora da exclusão lógica (soft delete). NULL = cliente ativo';



COMMENT ON COLUMN "public"."customers"."deleted_by" IS 'ID do usuário que realizou a exclusão lógica';



CREATE TABLE IF NOT EXISTS "public"."delivery_tracking" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "status" character varying(20) NOT NULL,
    "location_lat" numeric(10,8),
    "location_lng" numeric(11,8),
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "delivery_tracking_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('preparing'::character varying)::"text", ('out_for_delivery'::character varying)::"text", ('delivered'::character varying)::"text", ('cancelled'::character varying)::"text"])))
);


ALTER TABLE "public"."delivery_tracking" OWNER TO "postgres";


COMMENT ON TABLE "public"."delivery_tracking" IS 'RLS habilitado: Admin (all), Employee (CRUD), Delivery (próprias entregas)';



COMMENT ON COLUMN "public"."delivery_tracking"."sale_id" IS 'ID da venda relacionada à entrega';



COMMENT ON COLUMN "public"."delivery_tracking"."status" IS 'Status da entrega no momento do registro';



COMMENT ON COLUMN "public"."delivery_tracking"."location_lat" IS 'Latitude da localização quando o status foi registrado';



COMMENT ON COLUMN "public"."delivery_tracking"."location_lng" IS 'Longitude da localização quando o status foi registrado';



COMMENT ON COLUMN "public"."delivery_tracking"."notes" IS 'Observações sobre a mudança de status';



COMMENT ON COLUMN "public"."delivery_tracking"."created_by" IS 'Usuário que registrou a mudança de status';



CREATE TABLE IF NOT EXISTS "public"."delivery_zones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "zone_name" "text" NOT NULL,
    "base_fee" numeric DEFAULT 0 NOT NULL,
    "min_distance" integer DEFAULT 0,
    "max_distance" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."delivery_zones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric(10,2) NOT NULL,
    "stock_quantity" integer DEFAULT 0 NOT NULL,
    "category" "text" NOT NULL,
    "alcohol_content" numeric(4,2),
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "supplier" "text",
    "cost_price" numeric,
    "margin_percent" numeric,
    "unit_type" "text" DEFAULT 'un'::"text",
    "package_size" integer DEFAULT 1,
    "package_price" numeric(10,2),
    "package_margin" numeric(8,2),
    "turnover_rate" "text" DEFAULT 'medium'::"text",
    "last_sale_date" timestamp with time zone,
    "volume_ml" integer,
    "barcode" character varying(50),
    "is_package" boolean DEFAULT false,
    "units_per_package" integer DEFAULT 1,
    "package_barcode" character varying(50),
    "unit_barcode" character varying(50),
    "packaging_type" character varying(20) DEFAULT 'fardo'::character varying,
    "has_package_tracking" boolean DEFAULT false,
    "has_unit_tracking" boolean DEFAULT false,
    "package_units" integer,
    "expiry_date" "date",
    "has_expiry_tracking" boolean DEFAULT false NOT NULL,
    "stock_packages" integer DEFAULT 0 NOT NULL,
    "stock_units_loose" integer DEFAULT 0 NOT NULL,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "minimum_stock" integer,
    "store2_holding_packages" smallint DEFAULT 0 NOT NULL,
    "store2_holding_units_loose" smallint DEFAULT 0 NOT NULL,
    CONSTRAINT "check_barcode_format" CHECK ((("barcode" IS NULL) OR (("barcode")::"text" ~ '^[0-9]{8,14}$'::"text"))),
    CONSTRAINT "check_barcodes_different" CHECK ((("package_barcode" IS NULL) OR ("unit_barcode" IS NULL) OR (("package_barcode")::"text" <> ("unit_barcode")::"text"))),
    CONSTRAINT "check_package_units_positive" CHECK (("package_units" > 0)),
    CONSTRAINT "check_units_per_package_positive" CHECK (("units_per_package" > 0)),
    CONSTRAINT "chk_stock_packages_positive" CHECK (("stock_packages" >= 0)),
    CONSTRAINT "chk_stock_units_loose_positive" CHECK (("stock_units_loose" >= 0)),
    CONSTRAINT "products_price_nonnegative" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "products_stock_nonnegative" CHECK (("stock_quantity" >= 0)),
    CONSTRAINT "products_store2_holding_packages_check" CHECK (("store2_holding_packages" >= 0)),
    CONSTRAINT "products_store2_holding_units_loose_check" CHECK (("store2_holding_units_loose" >= 0)),
    CONSTRAINT "products_turnover_rate_check" CHECK (("turnover_rate" = ANY (ARRAY['fast'::"text", 'medium'::"text", 'slow'::"text"]))),
    CONSTRAINT "products_unit_type_check" CHECK (("unit_type" = ANY (ARRAY['un'::"text", 'pct'::"text"])))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'Products table - minimum_stock removed in v2.0.0 simplification (2025-09-24)';



COMMENT ON COLUMN "public"."products"."stock_quantity" IS 'DEPRECATED - Não usar no frontend. Campo mantido apenas para compatibilidade legada.';



COMMENT ON COLUMN "public"."products"."unit_type" IS 'Tipo de venda: unidade (un) ou pacote (pct)';



COMMENT ON COLUMN "public"."products"."package_size" IS 'Quantidade de unidades por pacote';



COMMENT ON COLUMN "public"."products"."package_price" IS 'Preço de venda do pacote';



COMMENT ON COLUMN "public"."products"."package_margin" IS 'Margem de lucro do pacote em percentual. Aumentado para NUMERIC(8,2) para evitar overflow com cost_price baixo (máximo: 999,999.99%)';



COMMENT ON COLUMN "public"."products"."turnover_rate" IS 'Taxa de giro: fast (rápido), medium (médio), slow (devagar)';



COMMENT ON COLUMN "public"."products"."last_sale_date" IS 'Data da última venda para cálculo de giro';



COMMENT ON COLUMN "public"."products"."volume_ml" IS 'Volume do produto em mililitros';



COMMENT ON COLUMN "public"."products"."is_package" IS 'Whether this product is sold as a package vs individual unit';



COMMENT ON COLUMN "public"."products"."units_per_package" IS 'Number of units contained in a package when is_package is true';



COMMENT ON COLUMN "public"."products"."package_barcode" IS 'Código de barras do fardo/pacote definido no cadastro do produto';



COMMENT ON COLUMN "public"."products"."unit_barcode" IS 'Código de barras da unidade individual definido no cadastro do produto';



COMMENT ON COLUMN "public"."products"."packaging_type" IS 'Tipo de embalagem: fardo, caixa, pacote, display, pallet, bandeja';



COMMENT ON COLUMN "public"."products"."has_package_tracking" IS 'Se o produto possui rastreamento ativo por fardo';



COMMENT ON COLUMN "public"."products"."has_unit_tracking" IS 'Se o produto possui rastreamento ativo por unidade individual';



COMMENT ON COLUMN "public"."products"."package_units" IS 'Quantidade de unidades dentro de cada fardo/pacote (substitui package_size)';



COMMENT ON COLUMN "public"."products"."expiry_date" IS 'Data de validade do produto (para unidade ou pacote, conforme configurado pelo usuário)';



COMMENT ON COLUMN "public"."products"."has_expiry_tracking" IS 'Se este produto tem controle de prazo de validade ativo';



COMMENT ON COLUMN "public"."products"."stock_packages" IS 'LEGACY: Mantido para compatibilidade, mas NÃO é atualizado em vendas desde v2.1.0';



COMMENT ON COLUMN "public"."products"."stock_units_loose" IS 'LEGACY: Mantido para compatibilidade, mas NÃO é atualizado em vendas desde v2.1.0';



COMMENT ON COLUMN "public"."products"."deleted_at" IS 'Timestamp when product was soft deleted. NULL means product is active.';



COMMENT ON COLUMN "public"."products"."deleted_by" IS 'User ID who soft deleted the product.';



COMMENT ON COLUMN "public"."products"."minimum_stock" IS 'Limite mínimo de estoque individual do produto.
   Se NULL, herda default_min_stock da categoria.
   Cascata: COALESCE(products.minimum_stock, categories.default_min_stock, 10)';



COMMENT ON COLUMN "public"."products"."store2_holding_packages" IS 'Estoque de pacotes armazenados na Loja 2 (holding stock)';



COMMENT ON COLUMN "public"."products"."store2_holding_units_loose" IS 'Estoque de unidades soltas armazenadas na Loja 2 (holding stock)';



CREATE OR REPLACE VIEW "public"."dual_stock_summary" AS
 SELECT 'Produtos com Pacotes'::"text" AS "category",
    "count"(*) AS "count",
    "sum"("products"."stock_packages") AS "total_packages",
    "sum"(("products"."stock_packages" * COALESCE("products"."package_units", 1))) AS "total_units_in_packages"
   FROM "public"."products"
  WHERE ("products"."stock_packages" > 0)
UNION ALL
 SELECT 'Produtos com Unidades Soltas'::"text" AS "category",
    "count"(*) AS "count",
    0 AS "total_packages",
    "sum"("products"."stock_units_loose") AS "total_units_in_packages"
   FROM "public"."products"
  WHERE ("products"."stock_units_loose" > 0)
UNION ALL
 SELECT 'Total Geral'::"text" AS "category",
    "count"(*) AS "count",
    "sum"("products"."stock_packages") AS "total_packages",
    "sum"("products"."stock_quantity") AS "total_units_in_packages"
   FROM "public"."products"
  WHERE ("products"."stock_quantity" > 0);


ALTER VIEW "public"."dual_stock_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."dual_stock_summary" IS 'Resumo executivo do sistema de dupla contagem';



CREATE TABLE IF NOT EXISTS "public"."expense_budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" character varying NOT NULL,
    "month_year" "date" NOT NULL,
    "budgeted_amount" numeric(10,2) NOT NULL,
    "actual_amount" numeric(10,2) DEFAULT 0,
    "variance" numeric(10,2) DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expense_budgets_budgeted_amount_check" CHECK (("budgeted_amount" >= (0)::numeric))
);


ALTER TABLE "public"."expense_budgets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" character varying NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "color" character varying DEFAULT '#6B7280'::character varying,
    "icon" character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "priority_level" character varying(20) DEFAULT 'medium'::character varying,
    "is_fixed_expense" boolean DEFAULT false,
    "typical_frequency" character varying(20) DEFAULT 'monthly'::character varying,
    "business_impact" character varying(20) DEFAULT 'important'::character varying,
    "target_percentage" numeric(5,2) DEFAULT 0.00,
    "alert_threshold" numeric(10,2) DEFAULT 0.00,
    "is_tax_deductible" boolean DEFAULT true,
    "department" character varying(100) DEFAULT 'geral'::character varying,
    "max_single_expense" numeric(10,2) DEFAULT 0.00,
    "requires_receipt" boolean DEFAULT true,
    CONSTRAINT "expense_categories_business_impact_check" CHECK ((("business_impact")::"text" = ANY (ARRAY[('critical'::character varying)::"text", ('important'::character varying)::"text", ('optional'::character varying)::"text"]))),
    CONSTRAINT "expense_categories_priority_level_check" CHECK ((("priority_level")::"text" = ANY (ARRAY[('high'::character varying)::"text", ('medium'::character varying)::"text", ('low'::character varying)::"text"]))),
    CONSTRAINT "expense_categories_target_percentage_check" CHECK ((("target_percentage" >= (0)::numeric) AND ("target_percentage" <= (100)::numeric))),
    CONSTRAINT "expense_categories_typical_frequency_check" CHECK ((("typical_frequency")::"text" = ANY (ARRAY[('daily'::character varying)::"text", ('weekly'::character varying)::"text", ('monthly'::character varying)::"text", ('quarterly'::character varying)::"text", ('yearly'::character varying)::"text", ('occasional'::character varying)::"text"])))
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text",
    "amount" numeric NOT NULL,
    "date" timestamp with time zone DEFAULT "now"(),
    "category_id" character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expiry_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "batch_id" "uuid",
    "alert_date" "date" NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "expiry_alerts_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'resolved'::character varying, 'ignored'::character varying])::"text"[])))
);


ALTER TABLE "public"."expiry_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "reason" "text",
    "user_id" "uuid",
    "customer_id" "uuid",
    "previous_stock" integer,
    "new_stock_quantity" integer,
    "quantity_change" integer NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "type_enum" "public"."movement_type",
    "sale_id" "uuid",
    "related_sale_id" "uuid"
);


ALTER TABLE "public"."inventory_movements" OWNER TO "postgres";


COMMENT ON TABLE "public"."inventory_movements" IS 'Movimentos de estoque. ATENÇÃO: O estoque é atualizado pela função create_inventory_movement(), não por triggers automáticos.';



CREATE TABLE IF NOT EXISTS "public"."sales" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "total_amount" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_method" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "delivery" boolean DEFAULT false,
    "delivery_address" "jsonb",
    "delivery_user_id" "uuid",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "seller_id" "uuid",
    "discount_amount" numeric DEFAULT 0 NOT NULL,
    "final_amount" numeric DEFAULT 0 NOT NULL,
    "payment_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "status_enum" "public"."sales_status_enum",
    "payment_method_enum" "public"."payment_method_enum",
    "delivery_type" character varying(20) DEFAULT 'presencial'::character varying,
    "delivery_fee" numeric(10,2) DEFAULT 0.00,
    "estimated_delivery_time" timestamp with time zone,
    "delivery_instructions" "text",
    "delivery_status" character varying(20) DEFAULT 'pending'::character varying,
    "delivery_person_id" "uuid",
    "delivery_started_at" timestamp with time zone,
    "delivery_completed_at" timestamp with time zone,
    "delivery_zone_id" "uuid",
    "order_number" integer NOT NULL,
    CONSTRAINT "sales_delivery_status_check" CHECK ((("delivery_status")::"text" = ANY (ARRAY[('pending'::character varying)::"text", ('preparing'::character varying)::"text", ('out_for_delivery'::character varying)::"text", ('delivered'::character varying)::"text", ('cancelled'::character varying)::"text"]))),
    CONSTRAINT "sales_delivery_type_check" CHECK ((("delivery_type")::"text" = ANY (ARRAY[('presencial'::character varying)::"text", ('delivery'::character varying)::"text", ('pickup'::character varying)::"text"]))),
    CONSTRAINT "sales_final_nonnegative" CHECK (("final_amount" >= (0)::numeric)),
    CONSTRAINT "sales_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'cancelled'::"text", 'delivering'::"text", 'delivered'::"text"]))),
    CONSTRAINT "sales_total_nonnegative" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."sales" OWNER TO "postgres";


COMMENT ON COLUMN "public"."sales"."payment_method" IS 'The method of payment used for the sale. Forcing schema cache reload.';



COMMENT ON COLUMN "public"."sales"."notes" IS 'User-added notes for the sale. Forcing schema cache reload.';



COMMENT ON COLUMN "public"."sales"."delivery_type" IS 'Tipo de venda: presencial, delivery ou pickup';



COMMENT ON COLUMN "public"."sales"."delivery_fee" IS 'Taxa de entrega cobrada do cliente';



COMMENT ON COLUMN "public"."sales"."estimated_delivery_time" IS 'Tempo estimado para entrega';



COMMENT ON COLUMN "public"."sales"."delivery_instructions" IS 'Instruções especiais para entrega';



COMMENT ON COLUMN "public"."sales"."delivery_status" IS 'Status atual da entrega';



COMMENT ON COLUMN "public"."sales"."delivery_person_id" IS 'ID do entregador responsável';



COMMENT ON COLUMN "public"."sales"."delivery_started_at" IS 'Momento que a entrega foi iniciada';



COMMENT ON COLUMN "public"."sales"."delivery_completed_at" IS 'Momento que a entrega foi finalizada';



COMMENT ON COLUMN "public"."sales"."delivery_zone_id" IS 'ID da zona de entrega';



COMMENT ON COLUMN "public"."sales"."order_number" IS 'Número sequencial do pedido para identificação amigável (1, 2, 3, ...)';



CREATE MATERIALIZED VIEW "public"."mv_customer_segmentation_kpis" AS
 SELECT "c"."id" AS "customer_id",
    "c"."name" AS "customer_name",
    "c"."segment",
    "c"."last_purchase_date",
    COALESCE("customer_stats"."total_orders", (0)::bigint) AS "total_orders",
    COALESCE("customer_stats"."total_spent", (0)::numeric) AS "total_spent",
    COALESCE("customer_stats"."avg_order_value", (0)::numeric) AS "avg_order_value",
    COALESCE("customer_stats"."first_purchase_date", "c"."created_at") AS "first_purchase_date",
        CASE
            WHEN ("c"."last_purchase_date" IS NULL) THEN 'never_purchased'::"text"
            WHEN ("c"."last_purchase_date" >= (CURRENT_DATE - '30 days'::interval)) THEN 'active'::"text"
            WHEN ("c"."last_purchase_date" >= (CURRENT_DATE - '90 days'::interval)) THEN 'at_risk'::"text"
            ELSE 'churned'::"text"
        END AS "activity_status",
        CASE
            WHEN ("c"."last_purchase_date" IS NOT NULL) THEN (CURRENT_DATE - ("c"."last_purchase_date")::"date")
            ELSE NULL::integer
        END AS "days_since_last_purchase"
   FROM ("public"."customers" "c"
     LEFT JOIN ( SELECT "sales"."customer_id",
            "count"(*) AS "total_orders",
            "sum"("sales"."total_amount") AS "total_spent",
            "avg"("sales"."total_amount") AS "avg_order_value",
            "min"("sales"."created_at") AS "first_purchase_date",
            "max"("sales"."created_at") AS "last_purchase_date"
           FROM "public"."sales"
          WHERE (("sales"."status_enum" = 'completed'::"public"."sales_status_enum") AND ("sales"."customer_id" IS NOT NULL))
          GROUP BY "sales"."customer_id") "customer_stats" ON (("c"."id" = "customer_stats"."customer_id")))
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."mv_customer_segmentation_kpis" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."mv_daily_sales_kpis" AS
 SELECT ("created_at")::"date" AS "sale_date",
    "count"(*) AS "total_sales",
    "sum"("total_amount") AS "total_revenue",
    "avg"("total_amount") AS "avg_order_value",
    "count"(DISTINCT "customer_id") AS "unique_customers",
    "sum"(
        CASE
            WHEN ("payment_method_enum" = 'cash'::"public"."payment_method_enum") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "cash_revenue",
    "sum"(
        CASE
            WHEN ("payment_method_enum" = 'credit'::"public"."payment_method_enum") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "credit_revenue",
    "sum"(
        CASE
            WHEN ("payment_method_enum" = 'pix'::"public"."payment_method_enum") THEN "total_amount"
            ELSE (0)::numeric
        END) AS "pix_revenue",
    "count"(
        CASE
            WHEN ("payment_method_enum" = 'cash'::"public"."payment_method_enum") THEN 1
            ELSE NULL::integer
        END) AS "cash_count",
    "count"(
        CASE
            WHEN ("payment_method_enum" = 'credit'::"public"."payment_method_enum") THEN 1
            ELSE NULL::integer
        END) AS "credit_count",
    "count"(
        CASE
            WHEN ("payment_method_enum" = 'pix'::"public"."payment_method_enum") THEN 1
            ELSE NULL::integer
        END) AS "pix_count"
   FROM "public"."sales"
  WHERE ("status_enum" = 'completed'::"public"."sales_status_enum")
  GROUP BY (("created_at")::"date")
  ORDER BY (("created_at")::"date") DESC
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."mv_daily_sales_kpis" OWNER TO "postgres";


CREATE MATERIALIZED VIEW "public"."mv_financial_kpis" AS
 SELECT CURRENT_DATE AS "calculation_date",
    "sum"(
        CASE
            WHEN ("due_date" >= CURRENT_DATE) THEN "amount"
            ELSE (0)::numeric
        END) AS "current_amount",
    "sum"(
        CASE
            WHEN (("due_date" < CURRENT_DATE) AND ("due_date" >= (CURRENT_DATE - '30 days'::interval))) THEN "amount"
            ELSE (0)::numeric
        END) AS "d0_30",
    "sum"(
        CASE
            WHEN (("due_date" < (CURRENT_DATE - '30 days'::interval)) AND ("due_date" >= (CURRENT_DATE - '60 days'::interval))) THEN "amount"
            ELSE (0)::numeric
        END) AS "d31_60",
    "sum"(
        CASE
            WHEN (("due_date" < (CURRENT_DATE - '60 days'::interval)) AND ("due_date" >= (CURRENT_DATE - '90 days'::interval))) THEN "amount"
            ELSE (0)::numeric
        END) AS "d61_90",
    "sum"(
        CASE
            WHEN ("due_date" < (CURRENT_DATE - '90 days'::interval)) THEN "amount"
            ELSE (0)::numeric
        END) AS "d90_plus",
    "round"(("sum"("amount") / NULLIF(( SELECT "avg"("daily_sales"."revenue") AS "avg"
           FROM ( SELECT "sum"("sales"."total_amount") AS "revenue"
                   FROM "public"."sales"
                  WHERE (("sales"."status_enum" = 'completed'::"public"."sales_status_enum") AND ("sales"."created_at" >= (CURRENT_DATE - '30 days'::interval)))
                  GROUP BY (("sales"."created_at")::"date")) "daily_sales"), (0)::numeric)), 1) AS "dso_days",
    "sum"("amount") AS "total_receivable",
    "count"(*) AS "total_invoices"
   FROM "public"."accounts_receivable" "ar"
  WHERE ("status" = 'open'::"text")
  WITH NO DATA;


ALTER MATERIALIZED VIEW "public"."mv_financial_kpis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" character varying(50) DEFAULT 'info'::character varying NOT NULL,
    "category" character varying(50) DEFAULT 'general'::character varying NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nps_surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "sale_id" "uuid",
    "score" integer NOT NULL,
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nps_surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."operational_expenses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" character varying,
    "description" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "expense_date" "date" NOT NULL,
    "payment_method" character varying NOT NULL,
    "supplier_vendor" character varying,
    "receipt_url" character varying,
    "is_recurring" boolean DEFAULT false,
    "recurring_frequency" character varying,
    "budget_category" character varying,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."operational_expenses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "type" "public"."payment_method_enum"
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_methods" IS 'Standardized payment methods for Brazilian market with PIX, credit/debit cards, and cash options';



CREATE TABLE IF NOT EXISTS "public"."product_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "batch_code" character varying(100) NOT NULL,
    "supplier_batch_code" character varying(100),
    "manufacturing_date" "date" NOT NULL,
    "expiry_date" "date" NOT NULL,
    "received_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "total_packages" integer DEFAULT 0 NOT NULL,
    "total_units" integer DEFAULT 0 NOT NULL,
    "available_packages" integer DEFAULT 0 NOT NULL,
    "available_units" integer DEFAULT 0 NOT NULL,
    "package_barcode_prefix" character varying(50),
    "unit_barcode_prefix" character varying(50),
    "supplier_id" "uuid",
    "supplier_name" character varying(200),
    "quality_grade" character varying(50) DEFAULT 'A'::character varying,
    "cost_per_unit" numeric(10,2),
    "total_cost" numeric(10,2),
    "status" character varying(20) DEFAULT 'active'::character varying,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_batches_status_check" CHECK ((("status")::"text" = ANY (ARRAY[('active'::character varying)::"text", ('expired'::character varying)::"text", ('sold_out'::character varying)::"text", ('recalled'::character varying)::"text"]))),
    CONSTRAINT "valid_expiry_date" CHECK (("expiry_date" > "manufacturing_date")),
    CONSTRAINT "valid_quantities" CHECK ((("available_packages" >= 0) AND ("available_units" >= 0) AND ("available_packages" <= "total_packages") AND ("available_units" <= "total_units")))
);


ALTER TABLE "public"."product_batches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_cost_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "cost_price" numeric(10,2) NOT NULL,
    "valid_from" timestamp with time zone DEFAULT "now"() NOT NULL,
    "valid_to" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "reason" "text",
    CONSTRAINT "positive_cost" CHECK (("cost_price" >= (0)::numeric)),
    CONSTRAINT "valid_period" CHECK ((("valid_to" IS NULL) OR ("valid_to" > "valid_from")))
);


ALTER TABLE "public"."product_cost_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_cost_history" IS 'Historical cost tracking for products with temporal validity';



COMMENT ON COLUMN "public"."product_cost_history"."valid_from" IS 'Start date when this cost price becomes effective';



COMMENT ON COLUMN "public"."product_cost_history"."valid_to" IS 'End date when this cost price stops being effective (NULL for current)';



COMMENT ON COLUMN "public"."product_cost_history"."reason" IS 'Reason for cost change (supplier change, market fluctuation, etc.)';



CREATE OR REPLACE VIEW "public"."product_movement_history" AS
 SELECT "im"."id",
    "im"."date",
    ("im"."type_enum")::"text" AS "type",
    "abs"("im"."quantity_change") AS "quantity",
    "im"."reason",
    'system'::"text" AS "source",
    "im"."previous_stock",
    "im"."new_stock_quantity" AS "new_stock",
    "im"."reason" AS "notes",
    "p"."name" AS "product_name",
    "p"."category" AS "product_category",
    "u"."name" AS "user_name",
    "u"."role" AS "user_role",
    "im"."quantity_change" AS "stock_change",
        CASE
            WHEN ("im"."type_enum" = 'stock_transfer_in'::"public"."movement_type") THEN 'Entrada'::"text"
            WHEN ("im"."type_enum" = 'initial_stock'::"public"."movement_type") THEN 'Estoque Inicial'::"text"
            WHEN ("im"."type_enum" = 'stock_transfer_out'::"public"."movement_type") THEN 'Saída'::"text"
            WHEN ("im"."type_enum" = 'sale'::"public"."movement_type") THEN 'Venda'::"text"
            WHEN ("im"."type_enum" = 'inventory_adjustment'::"public"."movement_type") THEN 'Ajuste'::"text"
            WHEN ("im"."type_enum" = 'return'::"public"."movement_type") THEN 'Devolução'::"text"
            WHEN ("im"."type_enum" = 'personal_consumption'::"public"."movement_type") THEN 'Consumo Pessoal'::"text"
            ELSE ("im"."type_enum")::"text"
        END AS "type_display",
        CASE
            WHEN ("im"."quantity_change" > 0) THEN 'success'::"text"
            WHEN ("im"."quantity_change" < 0) THEN 'error'::"text"
            ELSE 'default'::"text"
        END AS "type_variant"
   FROM (("public"."inventory_movements" "im"
     LEFT JOIN "public"."products" "p" ON (("im"."product_id" = "p"."id")))
     LEFT JOIN "public"."profiles" "u" ON (("im"."user_id" = "u"."id")))
  ORDER BY "im"."date" DESC;


ALTER VIEW "public"."product_movement_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sale_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sale_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "quantity" integer NOT NULL,
    "unit_price" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "sale_type" "text" DEFAULT 'unit'::"text",
    "package_units" integer DEFAULT 1,
    "units_sold" integer,
    "conversion_required" boolean DEFAULT false,
    "packages_converted" integer DEFAULT 0,
    CONSTRAINT "sale_items_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "sale_items_quantity_positive" CHECK (("quantity" > 0)),
    CONSTRAINT "sale_items_unit_price_nonnegative" CHECK (("unit_price" >= (0)::numeric))
);


ALTER TABLE "public"."sale_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."sale_items"."units_sold" IS 'Número real de unidades vendidas (para cálculos de estoque)';



COMMENT ON COLUMN "public"."sale_items"."conversion_required" IS 'Indica se foi necessária conversão de pacotes para atender a venda';



COMMENT ON COLUMN "public"."sale_items"."packages_converted" IS 'Número de pacotes convertidos para atender esta venda específica';



CREATE SEQUENCE IF NOT EXISTS "public"."sales_order_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sales_order_number_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sales_order_number_seq" OWNED BY "public"."sales"."order_number";



CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_info" "jsonb" DEFAULT '{}'::"jsonb",
    "products_supplied" "text"[] DEFAULT '{}'::"text"[],
    "delivery_time" "text",
    "payment_methods" "text"[] DEFAULT '{}'::"text"[],
    "minimum_order_value" numeric DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


COMMENT ON TABLE "public"."suppliers" IS 'Tabela de fornecedores com informações de contato e condições comerciais';



COMMENT ON COLUMN "public"."suppliers"."contact_info" IS 'JSON com telefone, whatsapp, email: {"phone": "", "whatsapp": "", "email": ""}';



COMMENT ON COLUMN "public"."suppliers"."products_supplied" IS 'Array com categorias ou tipos de produtos fornecidos';



COMMENT ON COLUMN "public"."suppliers"."delivery_time" IS 'Prazo típico de entrega (ex: "2-3 dias", "1 semana")';



COMMENT ON COLUMN "public"."suppliers"."payment_methods" IS 'Formas de pagamento aceitas (ex: ["dinheiro", "pix", "cartão"])';



COMMENT ON COLUMN "public"."suppliers"."minimum_order_value" IS 'Valor mínimo de pedido em reais';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'employee'::"text", 'delivery'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_customer_purchases" AS
 SELECT "s"."id" AS "purchase_id",
    "s"."customer_id",
    'sale'::"text" AS "source",
    COALESCE("s"."final_amount", "s"."total_amount", (0)::numeric) AS "total",
    "s"."created_at",
    "si"."items"
   FROM ("public"."sales" "s"
     LEFT JOIN ( SELECT "si_1"."sale_id",
            "jsonb_agg"("jsonb_build_object"('product_id', "si_1"."product_id", 'product_name', "p"."name", 'quantity', "si_1"."quantity", 'unit_price', "si_1"."unit_price")) AS "items"
           FROM ("public"."sale_items" "si_1"
             JOIN "public"."products" "p" ON (("p"."id" = "si_1"."product_id")))
          GROUP BY "si_1"."sale_id") "si" ON (("si"."sale_id" = "s"."id")));


ALTER VIEW "public"."v_customer_purchases" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_customer_stats" AS
 WITH "agg" AS (
         SELECT "v_customer_purchases"."customer_id",
            "sum"("v_customer_purchases"."total") AS "total_spent",
            "max"("v_customer_purchases"."created_at") AS "last_purchase"
           FROM "public"."v_customer_purchases"
          GROUP BY "v_customer_purchases"."customer_id"
        )
 SELECT "c"."id" AS "customer_id",
    COALESCE("a"."total_spent", (0)::numeric) AS "total_spent",
    "a"."last_purchase"
   FROM ("public"."customers" "c"
     LEFT JOIN "agg" "a" ON (("a"."customer_id" = "c"."id")));


ALTER VIEW "public"."v_customer_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."vw_kyrie_intelligence_margins" AS
 SELECT "p"."name" AS "product_name",
    "p"."category" AS "category_name",
    "count"("si"."id") AS "times_sold",
    "sum"("si"."quantity") AS "total_units_sold",
    "sum"((("si"."quantity")::numeric * "si"."unit_price")) AS "total_revenue",
    "sum"((("si"."quantity")::numeric * COALESCE("p"."cost_price", (0)::numeric))) AS "total_cost",
    ("sum"((("si"."quantity")::numeric * "si"."unit_price")) - "sum"((("si"."quantity")::numeric * COALESCE("p"."cost_price", (0)::numeric)))) AS "gross_profit",
        CASE
            WHEN ("sum"((("si"."quantity")::numeric * "si"."unit_price")) > (0)::numeric) THEN "round"(((("sum"((("si"."quantity")::numeric * "si"."unit_price")) - "sum"((("si"."quantity")::numeric * COALESCE("p"."cost_price", (0)::numeric)))) / "sum"((("si"."quantity")::numeric * "si"."unit_price"))) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS "margin_percent"
   FROM (("public"."sale_items" "si"
     JOIN "public"."products" "p" ON (("si"."product_id" = "p"."id")))
     JOIN "public"."sales" "s" ON (("si"."sale_id" = "s"."id")))
  WHERE (("s"."status_enum" = 'completed'::"public"."sales_status_enum") AND ("s"."created_at" >= (CURRENT_DATE - '60 days'::interval)))
  GROUP BY "p"."id", "p"."name", "p"."category"
  ORDER BY ("sum"((("si"."quantity")::numeric * "si"."unit_price")) - "sum"((("si"."quantity")::numeric * COALESCE("p"."cost_price", (0)::numeric)))) DESC;


ALTER VIEW "public"."vw_kyrie_intelligence_margins" OWNER TO "postgres";


ALTER TABLE ONLY "public"."sales" ALTER COLUMN "order_number" SET DEFAULT "nextval"('"public"."sales_order_number_seq"'::"regclass");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_logs"
    ADD CONSTRAINT "automation_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."batch_units"
    ADD CONSTRAINT "batch_units_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_insights"
    ADD CONSTRAINT "customer_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_interactions"
    ADD CONSTRAINT "customer_interactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_tracking"
    ADD CONSTRAINT "delivery_tracking_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_zones"
    ADD CONSTRAINT "delivery_zones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_budgets"
    ADD CONSTRAINT "expense_budgets_category_id_month_year_key" UNIQUE ("category_id", "month_year");



ALTER TABLE ONLY "public"."expense_budgets"
    ADD CONSTRAINT "expense_budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expiry_alerts"
    ADD CONSTRAINT "expiry_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operational_expenses"
    ADD CONSTRAINT "operational_expenses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_batches"
    ADD CONSTRAINT "product_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_cost_history"
    ADD CONSTRAINT "product_cost_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_barcode_unique" UNIQUE ("barcode");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_batches"
    ADD CONSTRAINT "unique_batch_per_product" UNIQUE ("product_id", "batch_code");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "customers_email_idx" ON "public"."customers" USING "btree" ("email");



CREATE INDEX "customers_name_idx" ON "public"."customers" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "name"));



CREATE INDEX "idx_accounts_receivable_due_date" ON "public"."accounts_receivable" USING "btree" ("due_date" DESC);



CREATE INDEX "idx_accounts_receivable_due_status" ON "public"."accounts_receivable" USING "btree" ("due_date", "status");



CREATE INDEX "idx_accounts_receivable_status" ON "public"."accounts_receivable" USING "btree" ("status");



CREATE INDEX "idx_activity_logs_action" ON "public"."activity_logs" USING "btree" ("action");



CREATE INDEX "idx_activity_logs_created_at" ON "public"."activity_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_activity_logs_role" ON "public"."activity_logs" USING "btree" ("role");



CREATE INDEX "idx_audit_logs_action" ON "public"."audit_logs" USING "btree" ("action");



CREATE INDEX "idx_audit_logs_created_at" ON "public"."audit_logs" USING "btree" ("created_at");



CREATE INDEX "idx_audit_logs_record_id" ON "public"."audit_logs" USING "btree" ("record_id");



CREATE INDEX "idx_audit_logs_table_name" ON "public"."audit_logs" USING "btree" ("table_name");



CREATE INDEX "idx_audit_logs_user_id" ON "public"."audit_logs" USING "btree" ("user_id");



CREATE INDEX "idx_categories_active" ON "public"."categories" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_categories_display_order" ON "public"."categories" USING "btree" ("display_order");



CREATE INDEX "idx_categories_name" ON "public"."categories" USING "btree" ("name");



CREATE INDEX "idx_customers_active" ON "public"."customers" USING "btree" ("id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_customers_created_at" ON "public"."customers" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_customers_deleted" ON "public"."customers" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);



CREATE INDEX "idx_customers_last_purchase" ON "public"."customers" USING "btree" ("last_purchase_date" DESC NULLS LAST);



CREATE INDEX "idx_customers_segment" ON "public"."customers" USING "btree" ("segment") WHERE ("segment" IS NOT NULL);



CREATE INDEX "idx_delivery_tracking_created_at" ON "public"."delivery_tracking" USING "btree" ("created_at");



CREATE INDEX "idx_delivery_tracking_sale_id" ON "public"."delivery_tracking" USING "btree" ("sale_id");



CREATE INDEX "idx_delivery_tracking_status" ON "public"."delivery_tracking" USING "btree" ("status");



CREATE INDEX "idx_expense_budgets_category" ON "public"."expense_budgets" USING "btree" ("category_id");



CREATE INDEX "idx_expense_budgets_month_year" ON "public"."expense_budgets" USING "btree" ("month_year" DESC);



CREATE INDEX "idx_expiry_alerts_batch" ON "public"."expiry_alerts" USING "btree" ("batch_id");



CREATE INDEX "idx_expiry_alerts_product" ON "public"."expiry_alerts" USING "btree" ("product_id");



CREATE INDEX "idx_expiry_alerts_status" ON "public"."expiry_alerts" USING "btree" ("status");



CREATE INDEX "idx_inventory_movements_date" ON "public"."inventory_movements" USING "btree" ("date" DESC);



CREATE INDEX "idx_inventory_movements_date_product" ON "public"."inventory_movements" USING "btree" ("date" DESC, "product_id");



CREATE INDEX "idx_inventory_movements_product_date" ON "public"."inventory_movements" USING "btree" ("product_id", "date" DESC);



CREATE INDEX "idx_mv_customer_segmentation_activity" ON "public"."mv_customer_segmentation_kpis" USING "btree" ("activity_status");



CREATE UNIQUE INDEX "idx_mv_customer_segmentation_customer" ON "public"."mv_customer_segmentation_kpis" USING "btree" ("customer_id");



CREATE INDEX "idx_mv_customer_segmentation_segment" ON "public"."mv_customer_segmentation_kpis" USING "btree" ("segment");



CREATE UNIQUE INDEX "idx_mv_daily_sales_kpis_date" ON "public"."mv_daily_sales_kpis" USING "btree" ("sale_date");



CREATE UNIQUE INDEX "idx_mv_financial_kpis_date" ON "public"."mv_financial_kpis" USING "btree" ("calculation_date");



CREATE INDEX "idx_notifications_category" ON "public"."notifications" USING "btree" ("category");



CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at");



CREATE INDEX "idx_notifications_read_at" ON "public"."notifications" USING "btree" ("read_at");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_payment_methods_type" ON "public"."payment_methods" USING "btree" ("type");



CREATE INDEX "idx_product_batches_batch_code" ON "public"."product_batches" USING "btree" ("batch_code");



CREATE INDEX "idx_product_batches_expiry_date" ON "public"."product_batches" USING "btree" ("expiry_date");



CREATE INDEX "idx_product_batches_product_id" ON "public"."product_batches" USING "btree" ("product_id");



CREATE INDEX "idx_product_batches_status" ON "public"."product_batches" USING "btree" ("status");



CREATE INDEX "idx_product_batches_supplier" ON "public"."product_batches" USING "btree" ("supplier_name");



CREATE INDEX "idx_product_cost_history_current" ON "public"."product_cost_history" USING "btree" ("product_id") WHERE ("valid_to" IS NULL);



CREATE INDEX "idx_product_cost_history_period" ON "public"."product_cost_history" USING "btree" ("valid_from", "valid_to");



CREATE INDEX "idx_product_cost_history_product_valid" ON "public"."product_cost_history" USING "btree" ("product_id", "valid_from" DESC, "valid_to" DESC);



CREATE INDEX "idx_products_available_by_last_sale" ON "public"."products" USING "btree" ("last_sale_date" DESC, "stock_quantity") WHERE (("stock_quantity" > 0) AND ("last_sale_date" IS NOT NULL));



COMMENT ON INDEX "public"."idx_products_available_by_last_sale" IS 'Produtos disponíveis ordenados por recência de venda';



CREATE INDEX "idx_products_barcode" ON "public"."products" USING "btree" ("barcode");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category");



CREATE INDEX "idx_products_category_stock" ON "public"."products" USING "btree" ("category", "stock_quantity");



CREATE INDEX "idx_products_deleted_at" ON "public"."products" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_products_expiry" ON "public"."products" USING "btree" ("expiry_date") WHERE (("has_expiry_tracking" = true) AND ("expiry_date" IS NOT NULL));



CREATE INDEX "idx_products_last_sale_date" ON "public"."products" USING "btree" ("last_sale_date");



CREATE INDEX "idx_products_low_stock_alert" ON "public"."products" USING "btree" ("stock_quantity", "category") WHERE (("stock_quantity" <= 10) AND ("stock_quantity" > 0));



COMMENT ON INDEX "public"."idx_products_low_stock_alert" IS 'Alert system para produtos com estoque baixo (<=10 unidades)';



CREATE INDEX "idx_products_package_barcode" ON "public"."products" USING "btree" ("package_barcode");



CREATE INDEX "idx_products_packaging_type" ON "public"."products" USING "btree" ("packaging_type");



CREATE INDEX "idx_products_stock_category_optimized" ON "public"."products" USING "btree" ("stock_quantity", "category", "turnover_rate") WHERE ("stock_quantity" > 0);



COMMENT ON INDEX "public"."idx_products_stock_category_optimized" IS 'Otimizar queries de produtos em estoque por categoria';



CREATE INDEX "idx_products_stock_packages" ON "public"."products" USING "btree" ("stock_packages") WHERE ("stock_packages" > 0);



CREATE INDEX "idx_products_stock_quantity" ON "public"."products" USING "btree" ("stock_quantity");



CREATE INDEX "idx_products_stock_units_loose" ON "public"."products" USING "btree" ("stock_units_loose") WHERE ("stock_units_loose" > 0);



CREATE INDEX "idx_products_store2_holding" ON "public"."products" USING "btree" ("store2_holding_packages", "store2_holding_units_loose") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_products_turnover_rate" ON "public"."products" USING "btree" ("turnover_rate");



CREATE INDEX "idx_products_unit_barcode" ON "public"."products" USING "btree" ("unit_barcode");



CREATE INDEX "idx_products_unit_type" ON "public"."products" USING "btree" ("unit_type");



CREATE INDEX "idx_profiles_email_role" ON "public"."profiles" USING "btree" ("email", "role");



CREATE INDEX "idx_profiles_id_role_temp" ON "public"."profiles" USING "btree" ("id", "role", "is_temporary_password");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_temp_password" ON "public"."profiles" USING "btree" ("is_temporary_password") WHERE ("is_temporary_password" = true);



CREATE INDEX "idx_sale_items_conversion_required" ON "public"."sale_items" USING "btree" ("conversion_required") WHERE ("conversion_required" = true);



CREATE INDEX "idx_sale_items_product" ON "public"."sale_items" USING "btree" ("product_id");



CREATE INDEX "idx_sale_items_product_created" ON "public"."sale_items" USING "btree" ("product_id", "created_at" DESC);



CREATE INDEX "idx_sale_items_product_id" ON "public"."sale_items" USING "btree" ("product_id");



CREATE INDEX "idx_sale_items_sale_product" ON "public"."sale_items" USING "btree" ("sale_id", "product_id");



CREATE INDEX "idx_sales_created_at" ON "public"."sales" USING "btree" ("created_at");



CREATE INDEX "idx_sales_customer_created" ON "public"."sales" USING "btree" ("customer_id", "created_at" DESC);



CREATE INDEX "idx_sales_customer_created_at" ON "public"."sales" USING "btree" ("customer_id", "created_at");



CREATE INDEX "idx_sales_order_number" ON "public"."sales" USING "btree" ("order_number");



CREATE INDEX "idx_sales_payment_method" ON "public"."sales" USING "btree" ("payment_method") WHERE ("status" = 'completed'::"text");



CREATE INDEX "idx_sales_payment_method_enum" ON "public"."sales" USING "btree" ("payment_method_enum");



CREATE INDEX "idx_sales_seller_id" ON "public"."sales" USING "btree" ("seller_id");



CREATE INDEX "idx_sales_status_created" ON "public"."sales" USING "btree" ("status", "created_at" DESC);



CREATE INDEX "idx_sales_status_enum" ON "public"."sales" USING "btree" ("status_enum");



CREATE INDEX "products_category_idx" ON "public"."products" USING "btree" ("category");



CREATE INDEX "products_name_idx" ON "public"."products" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "name"));



CREATE INDEX "sale_items_product_id_idx" ON "public"."sale_items" USING "btree" ("product_id");



CREATE INDEX "sale_items_sale_id_idx" ON "public"."sale_items" USING "btree" ("sale_id");



CREATE INDEX "sales_created_at_idx" ON "public"."sales" USING "btree" ("created_at");



CREATE INDEX "sales_customer_id_idx" ON "public"."sales" USING "btree" ("customer_id");



CREATE INDEX "sales_delivery_user_id_idx" ON "public"."sales" USING "btree" ("delivery_user_id");



CREATE INDEX "sales_user_id_idx" ON "public"."sales" USING "btree" ("user_id");



CREATE INDEX "suppliers_company_name_idx" ON "public"."suppliers" USING "btree" ("company_name");



CREATE INDEX "suppliers_is_active_idx" ON "public"."suppliers" USING "btree" ("is_active");



CREATE INDEX "suppliers_products_supplied_idx" ON "public"."suppliers" USING "gin" ("products_supplied");



CREATE OR REPLACE TRIGGER "handle_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "product_cost_change_trigger" AFTER UPDATE ON "public"."products" FOR EACH ROW WHEN (("old"."cost_price" IS DISTINCT FROM "new"."cost_price")) EXECUTE FUNCTION "public"."handle_product_cost_change"();



CREATE OR REPLACE TRIGGER "products_audit_trigger" AFTER UPDATE OF "stock_quantity" ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "sale_items_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."sale_items" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "sales_audit_trigger" AFTER INSERT OR DELETE OR UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();



CREATE OR REPLACE TRIGGER "sync_sales_enum_trigger" BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."sync_sales_enum_columns"();



CREATE OR REPLACE TRIGGER "trg_log_sale_event" AFTER INSERT ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."fn_log_sale_event"();



CREATE OR REPLACE TRIGGER "trg_sync_delivery_status" BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."sync_delivery_status_to_sale_status"();



CREATE OR REPLACE TRIGGER "update_customers_updated_at" BEFORE UPDATE ON "public"."customers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_expense_budgets_updated_at" BEFORE UPDATE ON "public"."expense_budgets" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_expense_categories_updated_at" BEFORE UPDATE ON "public"."expense_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_product_batches_updated_at" BEFORE UPDATE ON "public"."product_batches" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_sales_updated_at" BEFORE UPDATE ON "public"."sales" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "validate_product_category_trigger" BEFORE INSERT OR UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."validate_product_category"();



CREATE OR REPLACE TRIGGER "validate_stock_update" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."validate_product_stock_update"();



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."accounts_receivable"
    ADD CONSTRAINT "accounts_receivable_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."automation_logs"
    ADD CONSTRAINT "automation_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."batch_units"
    ADD CONSTRAINT "batch_units_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id");



ALTER TABLE ONLY "public"."batch_units"
    ADD CONSTRAINT "batch_units_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."customer_insights"
    ADD CONSTRAINT "customer_insights_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."customer_interactions"
    ADD CONSTRAINT "customer_interactions_associated_sale_id_fkey" FOREIGN KEY ("associated_sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."customer_interactions"
    ADD CONSTRAINT "customer_interactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."customer_interactions"
    ADD CONSTRAINT "customer_interactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_favorite_product_fkey" FOREIGN KEY ("favorite_product") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."delivery_tracking"
    ADD CONSTRAINT "delivery_tracking_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."delivery_tracking"
    ADD CONSTRAINT "delivery_tracking_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expense_budgets"
    ADD CONSTRAINT "expense_budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");



ALTER TABLE ONLY "public"."expense_budgets"
    ADD CONSTRAINT "expense_budgets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expenses"
    ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");



ALTER TABLE ONLY "public"."expiry_alerts"
    ADD CONSTRAINT "expiry_alerts_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expiry_alerts"
    ADD CONSTRAINT "expiry_alerts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_related_sale_id_fkey" FOREIGN KEY ("related_sale_id") REFERENCES "public"."sales"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."inventory_movements"
    ADD CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."nps_surveys"
    ADD CONSTRAINT "nps_surveys_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."operational_expenses"
    ADD CONSTRAINT "operational_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id");



ALTER TABLE ONLY "public"."product_batches"
    ADD CONSTRAINT "product_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_batches"
    ADD CONSTRAINT "product_batches_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_cost_history"
    ADD CONSTRAINT "product_cost_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."product_cost_history"
    ADD CONSTRAINT "product_cost_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."sale_items"
    ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_delivery_person_id_fkey" FOREIGN KEY ("delivery_person_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_delivery_user_id_fkey" FOREIGN KEY ("delivery_user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."sales"
    ADD CONSTRAINT "sales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin and Employee can delete sales" ON "public"."sales" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Admin and Employee can update sales" ON "public"."sales" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Admin can do everything on delivery_tracking" ON "public"."delivery_tracking" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin can manage expense budgets" ON "public"."expense_budgets" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin can manage expense categories" ON "public"."expense_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin can manage operational expenses" ON "public"."operational_expenses" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin can view all activity logs" ON "public"."activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin full access to NPS surveys" ON "public"."nps_surveys" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin full access to customer insights" ON "public"."customer_insights" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin full access to customers" ON "public"."customers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admin full access to delivery zones" ON "public"."delivery_zones" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage all batch units" ON "public"."batch_units" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage all batches" ON "public"."product_batches" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage all users" ON "public"."users" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can manage expiry alerts" ON "public"."expiry_alerts" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view deleted products" ON "public"."products" FOR SELECT USING ((("deleted_at" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Allow authenticated read access on accounts_receivable" ON "public"."accounts_receivable" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access on automation_logs" ON "public"."automation_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access on customer_interactions" ON "public"."customer_interactions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access on inventory_movements" ON "public"."inventory_movements" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated read access on payment_methods" ON "public"."payment_methods" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow insert for authenticated users" ON "public"."sales" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow insert for sale items" ON "public"."sale_items" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow select for all" ON "public"."sales" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Delivery can insert own delivery_tracking" ON "public"."delivery_tracking" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."sales" "s" ON (("s"."delivery_person_id" = "p"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'delivery'::"public"."user_role") AND ("s"."id" = "delivery_tracking"."sale_id")))));



CREATE POLICY "Delivery can view assigned batch units" ON "public"."batch_units" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role", 'delivery'::"public"."user_role"]))))));



CREATE POLICY "Delivery can view assigned sale items" ON "public"."sale_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."sales" "s"
  WHERE (("s"."id" = "sale_items"."sale_id") AND ("s"."delivery_user_id" = "auth"."uid"()) AND (("auth"."jwt"() ->> 'role'::"text") = 'delivery'::"text")))));



CREATE POLICY "Delivery can view assigned sales" ON "public"."sales" FOR SELECT USING (((("auth"."jwt"() ->> 'role'::"text") = 'delivery'::"text") AND ("delivery_user_id" = "auth"."uid"())));



CREATE POLICY "Delivery can view batches" ON "public"."product_batches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role", 'delivery'::"public"."user_role"]))))));



CREATE POLICY "Delivery can view own delivery_tracking" ON "public"."delivery_tracking" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."sales" "s" ON (("s"."delivery_person_id" = "p"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'delivery'::"public"."user_role") AND ("s"."id" = "delivery_tracking"."sale_id")))));



CREATE POLICY "Employee can insert delivery_tracking" ON "public"."delivery_tracking" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee can update delivery_tracking" ON "public"."delivery_tracking" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee can view delivery_tracking" ON "public"."delivery_tracking" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee can view expense budgets" ON "public"."expense_budgets" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee can view expense categories" ON "public"."expense_categories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee can view operational expenses" ON "public"."operational_expenses" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee insert access to NPS surveys" ON "public"."nps_surveys" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee insert customers" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['employee'::"public"."user_role", 'admin'::"public"."user_role"]))))));



CREATE POLICY "Employee read access to NPS surveys" ON "public"."nps_surveys" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee update active customers" ON "public"."customers" FOR UPDATE TO "authenticated" USING ((("deleted_at" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['employee'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "Employee view access to customer insights" ON "public"."customer_insights" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employee view active customers" ON "public"."customers" FOR SELECT TO "authenticated" USING ((("deleted_at" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['employee'::"public"."user_role", 'admin'::"public"."user_role"])))))));



CREATE POLICY "Employees and admins can view all sale items" ON "public"."sale_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can insert batch units" ON "public"."batch_units" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can insert batches" ON "public"."product_batches" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can insert sales" ON "public"."sales" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can update batch units" ON "public"."batch_units" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can update batches" ON "public"."product_batches" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can update sales" ON "public"."sales" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can view and create batches" ON "public"."product_batches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can view batch units" ON "public"."batch_units" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can view expiry alerts" ON "public"."expiry_alerts" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Employees can view sales" ON "public"."sales" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "Enable all access for authenticated users" ON "public"."expenses" USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Enable delete for admin users" ON "public"."products" FOR DELETE USING ((("auth"."uid"() IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Enable delete for admins" ON "public"."users" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "admin_profile"
  WHERE (("admin_profile"."id" = "auth"."uid"()) AND ("admin_profile"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Enable insert for admins and system" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "id") OR (("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Enable insert for authenticated users" ON "public"."products" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable insert for service role" ON "public"."audit_logs" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable read access for active products" ON "public"."products" FOR SELECT USING (("deleted_at" IS NULL));



CREATE POLICY "Enable read access for admins" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Enable read access for authenticated users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for authenticated users" ON "public"."products" FOR UPDATE USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Everyone can view delivery zones" ON "public"."delivery_zones" FOR SELECT USING (true);



CREATE POLICY "Staff can manage sale items" ON "public"."sale_items" USING ((("auth"."jwt"() ->> 'role'::"text") = ANY (ARRAY['admin'::"text", 'employee'::"text"])));



CREATE POLICY "System can insert notifications" ON "public"."notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own user data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."accounts_receivable" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "admin_full_access_inventory_movements" ON "public"."inventory_movements" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "admins select" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "authenticated can insert" ON "public"."audit_logs" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."automation_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."batch_units" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "categories_delete_policy" ON "public"."categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "categories_insert_policy" ON "public"."categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "categories_select_admin_all" ON "public"."categories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



COMMENT ON POLICY "categories_select_admin_all" ON "public"."categories" IS 'Permite admins visualizarem todas as categorias (ativas e inativas)';



CREATE POLICY "categories_select_policy" ON "public"."categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "categories_update_policy" ON "public"."categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."customer_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_interactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delivery_own_sales_only" ON "public"."sales" FOR SELECT TO "authenticated" USING (
CASE
    WHEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))) THEN true
    WHEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'employee'::"public"."user_role")))) THEN true
    WHEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'delivery'::"public"."user_role")))) THEN ("delivery_user_id" = "auth"."uid"())
    ELSE false
END);



ALTER TABLE "public"."delivery_tracking" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."delivery_zones" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "employee_create_inventory_movements" ON "public"."inventory_movements" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "employee_limited_product_access" ON "public"."products" FOR SELECT TO "authenticated" USING (
CASE
    WHEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))) THEN true
    WHEN (EXISTS ( SELECT 1
       FROM "public"."profiles"
      WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'employee'::"public"."user_role")))) THEN true
    ELSE false
END);



CREATE POLICY "employee_update_own_inventory_movements" ON "public"."inventory_movements" FOR UPDATE USING ((("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"])))))));



ALTER TABLE "public"."expense_budgets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expiry_alerts" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "financial_data_admin_only" ON "public"."accounts_receivable" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."inventory_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nps_surveys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."operational_expenses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_cost_history" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "product_cost_history_insert_policy" ON "public"."product_cost_history" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "product_cost_history_select_policy" ON "public"."product_cost_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = ANY (ARRAY['admin'::"public"."user_role", 'employee'::"public"."user_role"]))))));



CREATE POLICY "product_cost_history_update_policy" ON "public"."product_cost_history" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_admin_delete" ON "public"."profiles" FOR DELETE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'adm@adega.com'::"text"));



COMMENT ON POLICY "profiles_admin_delete" ON "public"."profiles" IS 'Admin pode deletar qualquer perfil';



CREATE POLICY "profiles_admin_insert" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'adm@adega.com'::"text"));



COMMENT ON POLICY "profiles_admin_insert" ON "public"."profiles" IS 'Admin pode inserir qualquer perfil';



CREATE POLICY "profiles_admin_update" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((("auth"."jwt"() ->> 'email'::"text") = 'adm@adega.com'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'email'::"text") = 'adm@adega.com'::"text"));



COMMENT ON POLICY "profiles_admin_update" ON "public"."profiles" IS 'Admin pode atualizar qualquer perfil';



CREATE POLICY "profiles_insert_own_only" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



COMMENT ON POLICY "profiles_insert_own_only" ON "public"."profiles" IS 'Permite INSERT apenas do próprio perfil';



CREATE POLICY "profiles_select_optimized" ON "public"."profiles" FOR SELECT USING ((("auth"."uid"() = "id") OR (("auth"."jwt"() ->> 'email'::"text") = 'adm@adega.com'::"text")));



COMMENT ON POLICY "profiles_select_optimized" ON "public"."profiles" IS 'SELECT otimizado: usuário vê próprio perfil OU admin vê tudo (1 decode JWT)';



CREATE POLICY "profiles_update_own_only" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id"));



COMMENT ON POLICY "profiles_update_own_only" ON "public"."profiles" IS 'Permite UPDATE apenas do próprio perfil';



ALTER TABLE "public"."sale_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "suppliers_admin_full_access" ON "public"."suppliers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "suppliers_delete_policy" ON "public"."suppliers" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "suppliers_insert_policy" ON "public"."suppliers" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "suppliers_select_policy" ON "public"."suppliers" FOR SELECT USING ((("auth"."role"() = 'authenticated'::"text") AND ("is_active" = true)));



CREATE POLICY "suppliers_update_policy" ON "public"."suppliers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";














































































































































































GRANT ALL ON FUNCTION "public"."assign_delivery_person"("p_sale_id" "uuid", "p_delivery_person_id" "uuid", "p_auto_assign" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."assign_delivery_person"("p_sale_id" "uuid", "p_delivery_person_id" "uuid", "p_auto_assign" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_delivery_person"("p_sale_id" "uuid", "p_delivery_person_id" "uuid", "p_auto_assign" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."break_packages_to_loose"("p_product_id" "uuid", "p_packages_to_break" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_delivery_fee"("p_latitude" numeric, "p_longitude" numeric, "p_order_value" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_turnover_rate"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_turnover_rate"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_turnover_rate"() TO "service_role";



GRANT ALL ON FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."convert_loose_to_packages"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_expiry_alert_if_needed"("p_batch_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."create_expiry_alert_if_needed"("p_batch_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_expiry_alert_if_needed"("p_batch_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_historical_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb", "p_total_amount" numeric, "p_payment_method" "text", "p_sale_date" timestamp with time zone, "p_notes" "text", "p_delivery" boolean, "p_delivery_fee" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."create_historical_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb", "p_total_amount" numeric, "p_payment_method" "text", "p_sale_date" timestamp with time zone, "p_notes" "text", "p_delivery" boolean, "p_delivery_fee" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_historical_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb", "p_total_amount" numeric, "p_payment_method" "text", "p_sale_date" timestamp with time zone, "p_notes" "text", "p_delivery" boolean, "p_delivery_fee" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_inventory_movement"("p_product_id" "uuid", "p_quantity_change" integer, "p_type" "public"."movement_type", "p_reason" "text", "p_metadata" "jsonb", "p_movement_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_inventory_movement"("p_product_id" "uuid", "p_quantity_change" integer, "p_type" "public"."movement_type", "p_reason" "text", "p_metadata" "jsonb", "p_movement_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_inventory_movement"("p_product_id" "uuid", "p_quantity_change" integer, "p_type" "public"."movement_type", "p_reason" "text", "p_metadata" "jsonb", "p_movement_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" character varying, "p_category" character varying, "p_data" "jsonb", "p_expires_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" character varying, "p_category" character varying, "p_data" "jsonb", "p_expires_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_title" "text", "p_message" "text", "p_type" character varying, "p_category" character varying, "p_data" "jsonb", "p_expires_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_product_batch"("p_product_id" "uuid", "p_batch_code" character varying, "p_manufacturing_date" "date", "p_expiry_date" "date", "p_total_packages" integer, "p_total_units" integer, "p_supplier_name" character varying, "p_supplier_batch_code" character varying, "p_cost_per_unit" numeric, "p_quality_grade" character varying, "p_notes" "text", "p_create_units" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."create_product_batch"("p_product_id" "uuid", "p_batch_code" character varying, "p_manufacturing_date" "date", "p_expiry_date" "date", "p_total_packages" integer, "p_total_units" integer, "p_supplier_name" character varying, "p_supplier_batch_code" character varying, "p_cost_per_unit" numeric, "p_quality_grade" character varying, "p_notes" "text", "p_create_units" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_product_batch"("p_product_id" "uuid", "p_batch_code" character varying, "p_manufacturing_date" "date", "p_expiry_date" "date", "p_total_packages" integer, "p_total_units" integer, "p_supplier_name" character varying, "p_supplier_batch_code" character varying, "p_cost_per_unit" numeric, "p_quality_grade" character varying, "p_notes" "text", "p_create_units" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_quick_customer"("p_name" "text", "p_phone" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_quick_customer"("p_name" "text", "p_phone" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_quick_customer"("p_name" "text", "p_phone" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_sale_with_items"("p_customer_id" "uuid", "p_items" "jsonb", "p_payment_method_id" "uuid", "p_total_amount" numeric, "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_sale_with_items"("p_customer_id" "uuid", "p_items" "jsonb", "p_payment_method_id" "uuid", "p_total_amount" numeric, "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_sale_with_items"("p_customer_id" "uuid", "p_items" "jsonb", "p_payment_method_id" "uuid", "p_total_amount" numeric, "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_sale_with_items"("p_sale_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_sale_with_items"("p_sale_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_sale_with_items"("p_sale_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."fn_log_sale_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."fn_log_sale_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."fn_log_sale_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_mix"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_mix"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_mix"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_crm_trends_new_customers"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_crm_trends_new_customers"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_crm_trends_new_customers"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_metrics"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_metrics"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_metrics"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_real_metrics"("p_customer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_retention"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_retention"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_retention"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_table_data"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_table_data"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_table_data"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_daily_cash_flow"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_daily_cash_flow"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_daily_cash_flow"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_daily_kpi_summary"("days_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_daily_kpi_summary"("days_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_daily_kpi_summary"("days_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_delivery_metrics"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_delivery_timeline"("p_sale_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_delivery_timeline"("p_sale_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_delivery_timeline"("p_sale_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_delivery_trends"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_delivery_trends"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_delivery_trends"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_delivery_vs_instore_comparison"("p_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_delivery_vs_instore_comparison"("p_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_delivery_vs_instore_comparison"("p_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_dual_stock_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_dual_stock_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_dual_stock_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_expense_summary"("start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_expense_summary"("start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expense_summary"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_expiry_alerts_30_days"("limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_expiry_alerts_30_days"("limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_expiry_alerts_30_days"("limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_inventory_financials"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_inventory_financials"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_inventory_financials"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_inventory_kpis"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_inventory_kpis"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_inventory_kpis"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_inventory_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "period_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_inventory_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "period_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_inventory_summary"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "period_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_inventory_total_value"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_inventory_total_value"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_inventory_total_value"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_low_stock_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_low_stock_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_low_stock_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_low_stock_products"("p_limit" integer, "p_offset" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_low_stock_products"("p_limit" integer, "p_offset" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_low_stock_products"("p_limit" integer, "p_offset" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_monthly_expenses"("target_month" integer, "target_year" integer, "category_filter" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."get_monthly_expenses"("target_month" integer, "target_year" integer, "category_filter" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_monthly_expenses"("target_month" integer, "target_year" integer, "category_filter" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_movement_summary_stats"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_movement_summary_stats"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_movement_summary_stats"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_nps_score"("start_date" "date", "end_date" "date", "customer_segment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_nps_score"("start_date" "date", "end_date" "date", "customer_segment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_nps_score"("start_date" "date", "end_date" "date", "customer_segment" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_nps_trend"("months_back" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_nps_trend"("months_back" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_nps_trend"("months_back" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_orphan_sales"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_orphan_sales"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_orphan_sales"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_cost_at_date"("p_product_id" "uuid", "p_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_cost_at_date"("p_product_id" "uuid", "p_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_cost_at_date"("p_product_id" "uuid", "p_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_cost_history"("p_product_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_cost_history"("p_product_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_cost_history"("p_product_id" "uuid", "p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_movement_summary"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_movement_summary"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_movement_summary"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_performance_summary"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_performance_summary"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_performance_summary"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_product_stock_quantity"("p_product_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_product_stock_quantity"("p_product_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_product_stock_quantity"("p_product_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_products_with_invalid_categories"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_products_with_invalid_categories"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_products_with_invalid_categories"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_by_category"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_by_category"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_by_category"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_by_payment_method"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_by_payment_method"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_by_payment_method"("start_date" timestamp with time zone, "end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_sales_chart_data"("p_start_date" timestamp with time zone, "p_end_date" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_stock_report_by_category"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_stock_report_by_category"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_stock_report_by_category"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_customers"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_customers"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_customers"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "by" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "by" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_products"("start_date" timestamp with time zone, "end_date" timestamp with time zone, "limit_count" integer, "by" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_simple"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_simple"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_simple"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_permission_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_permission_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_permission_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_product_cost_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_product_cost_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_product_cost_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hard_delete_customer"("p_customer_id" "uuid", "p_user_id" "uuid", "p_confirmation_text" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hard_delete_customer"("p_customer_id" "uuid", "p_user_id" "uuid", "p_confirmation_text" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hard_delete_customer"("p_customer_id" "uuid", "p_user_id" "uuid", "p_confirmation_text" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_feature_flag"("p_flag_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_feature_flag"("p_flag_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_feature_flag"("p_flag_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."import_delivery_csv_row"("p_order_number" "text", "p_datetime" "text", "p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_products" "text", "p_total_value" "text", "p_delivery_fee" "text", "p_payment_method" "text", "p_status" "text", "p_delivery_person" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."import_delivery_csv_row"("p_order_number" "text", "p_datetime" "text", "p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_products" "text", "p_total_value" "text", "p_delivery_fee" "text", "p_payment_method" "text", "p_status" "text", "p_delivery_person" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."import_delivery_csv_row"("p_order_number" "text", "p_datetime" "text", "p_customer_name" "text", "p_phone" "text", "p_address" "text", "p_products" "text", "p_total_value" "text", "p_delivery_fee" "text", "p_payment_method" "text", "p_status" "text", "p_delivery_person" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_activity"("p_actor" "text", "p_role" "text", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."log_activity"("p_actor" "text", "p_role" "text", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_activity"("p_actor" "text", "p_role" "text", "p_action" "text", "p_entity" "text", "p_entity_id" "text", "p_details" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_audit_event"() TO "service_role";



GRANT ALL ON FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric, "p_notes" "text", "p_is_delivery" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric, "p_notes" "text", "p_is_delivery" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_sale"("p_customer_id" "uuid", "p_user_id" "uuid", "p_items" "jsonb"[], "p_total_amount" numeric, "p_final_amount" numeric, "p_payment_method_id" "uuid", "p_discount_amount" numeric, "p_notes" "text", "p_is_delivery" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sell_from_batch_fifo"("p_product_id" "uuid", "p_quantity" integer, "p_sale_id" "uuid", "p_customer_id" "uuid", "p_allow_partial" boolean, "p_max_days_until_expiry" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sell_from_batch_fifo"("p_product_id" "uuid", "p_quantity" integer, "p_sale_id" "uuid", "p_customer_id" "uuid", "p_allow_partial" boolean, "p_max_days_until_expiry" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sell_from_batch_fifo"("p_product_id" "uuid", "p_quantity" integer, "p_sale_id" "uuid", "p_customer_id" "uuid", "p_allow_partial" boolean, "p_max_days_until_expiry" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_product_stock_absolute"("p_product_id" "uuid", "p_new_packages" integer, "p_new_units_loose" integer, "p_reason" "text", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_delivery_status_to_sale_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_delivery_status_to_sale_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_delivery_status_to_sale_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_sales_enum_columns"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_sales_enum_columns"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_sales_enum_columns"() TO "service_role";



GRANT ALL ON FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint, "p_quantity_units" smallint, "p_user_id" "uuid", "p_notes" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint, "p_quantity_units" smallint, "p_user_id" "uuid", "p_notes" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."transfer_to_store2_holding"("p_product_id" "uuid", "p_quantity_packages" smallint, "p_quantity_units" smallint, "p_user_id" "uuid", "p_notes" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_delivery_status"("p_sale_id" "uuid", "p_new_status" character varying, "p_notes" "text", "p_latitude" numeric, "p_longitude" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."update_delivery_status"("p_sale_id" "uuid", "p_new_status" character varying, "p_notes" "text", "p_latitude" numeric, "p_longitude" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_delivery_status"("p_sale_id" "uuid", "p_new_status" character varying, "p_notes" "text", "p_latitude" numeric, "p_longitude" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_product_category"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_product_category"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_product_category"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_product_stock_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_product_stock_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_product_stock_update"() TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;















GRANT ALL ON TABLE "public"."accounts_receivable" TO "anon";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "authenticated";
GRANT ALL ON TABLE "public"."accounts_receivable" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."activity_logs_view" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs_view" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs_view" TO "service_role";



GRANT ALL ON TABLE "public"."automation_logs" TO "anon";
GRANT ALL ON TABLE "public"."automation_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_logs" TO "service_role";



GRANT ALL ON TABLE "public"."batch_units" TO "anon";
GRANT ALL ON TABLE "public"."batch_units" TO "authenticated";
GRANT ALL ON TABLE "public"."batch_units" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."customer_insights" TO "anon";
GRANT ALL ON TABLE "public"."customer_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_insights" TO "service_role";



GRANT ALL ON TABLE "public"."customer_interactions" TO "anon";
GRANT ALL ON TABLE "public"."customer_interactions" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_interactions" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_tracking" TO "anon";
GRANT ALL ON TABLE "public"."delivery_tracking" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_tracking" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_zones" TO "anon";
GRANT ALL ON TABLE "public"."delivery_zones" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_zones" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."dual_stock_summary" TO "anon";
GRANT ALL ON TABLE "public"."dual_stock_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."dual_stock_summary" TO "service_role";



GRANT ALL ON TABLE "public"."expense_budgets" TO "anon";
GRANT ALL ON TABLE "public"."expense_budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_budgets" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON TABLE "public"."expenses" TO "anon";
GRANT ALL ON TABLE "public"."expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."expenses" TO "service_role";



GRANT ALL ON TABLE "public"."expiry_alerts" TO "anon";
GRANT ALL ON TABLE "public"."expiry_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."expiry_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_movements" TO "anon";
GRANT ALL ON TABLE "public"."inventory_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_movements" TO "service_role";



GRANT ALL ON TABLE "public"."sales" TO "anon";
GRANT ALL ON TABLE "public"."sales" TO "authenticated";
GRANT ALL ON TABLE "public"."sales" TO "service_role";



GRANT ALL ON TABLE "public"."mv_customer_segmentation_kpis" TO "anon";
GRANT ALL ON TABLE "public"."mv_customer_segmentation_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."mv_customer_segmentation_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."mv_daily_sales_kpis" TO "anon";
GRANT ALL ON TABLE "public"."mv_daily_sales_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."mv_daily_sales_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."mv_financial_kpis" TO "anon";
GRANT ALL ON TABLE "public"."mv_financial_kpis" TO "authenticated";
GRANT ALL ON TABLE "public"."mv_financial_kpis" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."nps_surveys" TO "anon";
GRANT ALL ON TABLE "public"."nps_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."nps_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."operational_expenses" TO "anon";
GRANT ALL ON TABLE "public"."operational_expenses" TO "authenticated";
GRANT ALL ON TABLE "public"."operational_expenses" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."product_batches" TO "anon";
GRANT ALL ON TABLE "public"."product_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."product_batches" TO "service_role";



GRANT ALL ON TABLE "public"."product_cost_history" TO "anon";
GRANT ALL ON TABLE "public"."product_cost_history" TO "authenticated";
GRANT ALL ON TABLE "public"."product_cost_history" TO "service_role";



GRANT ALL ON TABLE "public"."product_movement_history" TO "anon";
GRANT ALL ON TABLE "public"."product_movement_history" TO "authenticated";
GRANT ALL ON TABLE "public"."product_movement_history" TO "service_role";



GRANT ALL ON TABLE "public"."sale_items" TO "anon";
GRANT ALL ON TABLE "public"."sale_items" TO "authenticated";
GRANT ALL ON TABLE "public"."sale_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sales_order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sales_order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sales_order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."v_customer_purchases" TO "anon";
GRANT ALL ON TABLE "public"."v_customer_purchases" TO "authenticated";
GRANT ALL ON TABLE "public"."v_customer_purchases" TO "service_role";



GRANT ALL ON TABLE "public"."v_customer_stats" TO "anon";
GRANT ALL ON TABLE "public"."v_customer_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."v_customer_stats" TO "service_role";



GRANT ALL ON TABLE "public"."vw_kyrie_intelligence_margins" TO "anon";
GRANT ALL ON TABLE "public"."vw_kyrie_intelligence_margins" TO "authenticated";
GRANT ALL ON TABLE "public"."vw_kyrie_intelligence_margins" TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































RESET ALL;
