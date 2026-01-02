-- ============================================================================
-- Migration: FIX - Corrigir erro de coluna inexistente em create_inventory_movement
-- Data: 2026-01-02
-- Descrição: Recria a função create_inventory_movement para garantir compatibilidade
--            com o schema atual (sem coluna 'date', usando 'created_at', e 'type_enum').
-- ============================================================================

CREATE OR REPLACE FUNCTION create_inventory_movement(
    p_product_id uuid, 
    p_quantity_change integer, 
    p_type text, -- String para compatibilidade, converteremos para enum internamente
    p_reason text, 
    p_metadata jsonb DEFAULT '{}'::jsonb, 
    p_movement_type text DEFAULT 'unit'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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
  v_movement_type_enum movement_type;
BEGIN
  -- Definir contexto para permitir atualização via RPC
  PERFORM set_config('app.called_from_rpc', 'true', true);

  -- Converter tipo de texto para enum
  BEGIN
    v_movement_type_enum := p_type::movement_type;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback ou erro explícito
    v_movement_type_enum := 'inventory_adjustment'::movement_type;
  END;

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
    v_new_stock_units := v_current_stock_units; -- Unidades soltas não mudam
    -- Calcular total
    v_new_stock_quantity := (v_new_stock_packages * v_package_units) + v_new_stock_units;
  ELSE
    -- Movimento de unidades
    v_new_stock_units := v_current_stock_units + p_quantity_change;
    v_new_stock_packages := v_current_stock_packages; -- Pacotes não mudam
    v_new_stock_quantity := (v_new_stock_packages * v_package_units) + v_new_stock_units;
  END IF;

  -- 3. Inserir movimento (USANDO created_at, não date)
  INSERT INTO inventory_movements (
    product_id,
    quantity_change,
    type_enum, -- Usando a coluna correta de enum
    reason,
    metadata,
    created_at, -- Coluna correta
    new_stock_quantity,
    sale_id
    -- Removido: date, type (string)
  )
  VALUES (
    p_product_id,
    p_quantity_change,
    v_movement_type_enum,
    p_reason,
    p_metadata,
    NOW(), -- Data atual
    v_new_stock_quantity,
    (p_metadata->>'sale_id')::uuid
  )
  RETURNING id INTO v_movement_id;

  -- 4. Atualizar produto (apenas quantidades e snapshots)
  UPDATE products
  SET 
    stock_quantity = v_new_stock_quantity,
    stock_packages = v_new_stock_packages,
    stock_units_loose = v_new_stock_units,
    updated_at = NOW()
  WHERE id = p_product_id;

  -- 5. Preparar resultado
  v_result := jsonb_build_object(
    'movement_id', v_movement_id,
    'previous_stock', v_current_stock_quantity,
    'new_stock', v_new_stock_quantity,
    'quantity_change', p_quantity_change
  );

  RETURN v_result;
END;
$$;
