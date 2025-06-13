# Configuração do Banco de Dados para Módulo de Vendas

**Última atualização: 20/06/2025**

Este documento descreve a estrutura do banco de dados e as configurações necessárias para o módulo de Vendas do Adega Manager.

## Visão Geral do Esquema

O módulo de Vendas consiste nas seguintes tabelas principais:

1. `sales` - Registro de vendas
2. `sale_items` - Itens de cada venda
3. `payment_methods` - Métodos de pagamento disponíveis
4. `sale_payments` - Pagamentos parcelados (nova)
5. `sale_discounts` - Descontos aplicados (nova)
6. `sale_returns` - Devoluções de vendas (nova)

## Tabelas do Sistema

### 1. Tabela `payment_methods`

```sql
-- Criação da tabela de métodos de pagamento
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir métodos de pagamento padrão
INSERT INTO public.payment_methods (name, description, is_active) VALUES
  ('Dinheiro', 'Pagamento em espécie', true),
  ('Cartão de Crédito', 'Pagamento com cartão de crédito', true),
  ('Cartão de Débito', 'Pagamento com cartão de débito', true),
  ('PIX', 'Pagamento via PIX', true),
  ('Transferência Bancária', 'Transferência entre contas bancárias', true),
  ('Outro', 'Outro método de pagamento', true)
ON CONFLICT (name) DO NOTHING;
```

### 2. Tabela `sales`

```sql
-- Criação da tabela de vendas
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  final_amount NUMERIC(10, 2) NOT NULL CHECK (final_amount >= 0),
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled', 'returned')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhorar consultas comuns
CREATE INDEX IF NOT EXISTS sales_customer_id_idx ON public.sales(customer_id);
CREATE INDEX IF NOT EXISTS sales_seller_id_idx ON public.sales(seller_id);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS sales_status_idx ON public.sales(status);
```

### 3. Tabela `sale_items`

```sql
-- Criação da tabela de itens da venda
CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  discount_percentage NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  subtotal NUMERIC(10, 2) GENERATED ALWAYS AS 
    (quantity * unit_price * (1 - COALESCE(discount_percentage, 0) / 100)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhorar consultas comuns
CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON public.sale_items(product_id);

-- Índice para busca por produto em itens de venda
CREATE INDEX IF NOT EXISTS sale_items_product_created_idx 
ON public.sale_items(product_id, created_at);
```

### 4. Tabela `sale_payments` (Nova)

```sql
-- Criação da tabela de pagamentos parcelados
CREATE TABLE IF NOT EXISTS public.sale_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id) ON DELETE RESTRICT,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  paid_amount NUMERIC(10, 2) DEFAULT 0,
  paid_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhorar consultas
CREATE INDEX IF NOT EXISTS sale_payments_sale_id_idx ON public.sale_payments(sale_id);
CREATE INDEX IF NOT EXISTS sale_payments_due_date_idx ON public.sale_payments(due_date);
CREATE INDEX IF NOT EXISTS sale_payments_status_idx ON public.sale_payments(status);
```

### 5. Tabela `sale_discounts` (Nova)

```sql
-- Criação da tabela de descontos aplicados
CREATE TABLE IF NOT EXISTS public.sale_discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'promo_code')),
  value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhorar consultas
CREATE INDEX IF NOT EXISTS sale_discounts_sale_id_idx ON public.sale_discounts(sale_id);
```

### 6. Tabela `sale_returns` (Nova)

```sql
-- Criação da tabela de devoluções
CREATE TABLE IF NOT EXISTS public.sale_returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE RESTRICT,
  returned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  refund_amount NUMERIC(10, 2) CHECK (refund_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de itens devolvidos
CREATE TABLE IF NOT EXISTS public.sale_return_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  return_id UUID NOT NULL REFERENCES public.sale_returns(id) ON DELETE CASCADE,
  sale_item_id UUID NOT NULL REFERENCES public.sale_items(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  reason TEXT,
  condition TEXT CHECK (condition IN ('new', 'opened', 'damaged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para melhorar consultas
CREATE INDEX IF NOT EXISTS sale_returns_sale_id_idx ON public.sale_returns(sale_id);
CREATE INDEX IF NOT EXISTS sale_returns_status_idx ON public.sale_returns(status);
CREATE INDEX IF NOT EXISTS sale_return_items_return_id_idx ON public.sale_return_items(return_id);
```

## Funções do Banco de Dados

### 1. Função para criar uma venda

```sql
CREATE OR REPLACE FUNCTION public.create_sale(
  p_customer_id UUID,
  p_seller_id UUID,
  p_items JSONB[],
  p_payment_method_id UUID,
  p_discount_amount NUMERIC DEFAULT 0,
  p_installments INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT NULL,
  p_discounts JSONB DEFAULT '[]'::jsonb
) 
RETURNS TABLE (sale_id UUID, status TEXT, message TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  v_sale_id UUID;
  v_total_amount NUMERIC(10, 2) := 0;
  v_final_amount NUMERIC(10, 2) := 0;
  v_discount_total NUMERIC(10, 2) := 0;
  v_item RECORD;
  v_discount RECORD;
  v_installment_amount NUMERIC(10, 2);
  v_due_date DATE;
  v_current_date DATE := CURRENT_DATE;
  v_payment_interval INTERVAL := '1 month';
  v_payment_method RECORD;
  v_can_split_payment BOOLEAN;
  v_installment_fee NUMERIC(5, 2) := 0;
  v_installment_fee_percentage NUMERIC(5, 2) := 1.99; -- Exemplo: 1.99% de juros
BEGIN
  -- Verificar se o método de pagamento permite parcelamento
  SELECT allows_installments, COALESCE(installment_fee_percentage, 0) 
  INTO v_can_split_payment, v_installment_fee_percentage
  FROM payment_methods 
  WHERE id = p_payment_method_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Método de pagamento não encontrado';
  END IF;
  
  -- Validar parcelamento
  IF p_installments > 1 AND NOT v_can_split_payment THEN
    RAISE EXCEPTION 'Este método de pagamento não permite parcelamento';
  END IF;
  
  -- Calcular totais dos itens
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items::jsonb) AS x(
    product_id UUID,
    quantity INTEGER,
    unit_price NUMERIC(10, 2),
    discount_percentage NUMERIC(5, 2) DEFAULT 0
  )
  LOOP
    -- Verificar estoque
    PERFORM id FROM products 
    WHERE id = v_item.product_id 
    AND stock_quantity >= v_item.quantity
    FOR UPDATE; -- Lock para evitar race condition
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto sem estoque suficiente: %', v_item.product_id;
    END IF;
    
    -- Calcular subtotal com desconto
    v_total_amount := v_total_amount + (v_item.quantity * v_item.unit_price);
    v_discount_total := v_discount_total + 
      (v_item.quantity * v_item.unit_price * v_item.discount_percentage / 100);
  END LOOP;
  
  -- Aplicar descontos adicionais
  FOR v_discount IN SELECT * FROM jsonb_to_recordset(p_discounts) AS x(
    discount_type TEXT,
    value NUMERIC(10, 2),
    reason TEXT
  )
  LOOP
    IF v_discount.discount_type = 'percentage' THEN
      v_discount_total := v_discount_total + (v_total_amount * v_discount.value / 100);
    ELSE -- 'fixed'
      v_discount_total := v_discount_total + v_discount.value;
    END IF;
  END LOOP;
  
  -- Garantir que o desconto total não seja maior que o total
  v_discount_total := LEAST(v_discount_total, v_total_amount);
  v_final_amount := v_total_amount - v_discount_total;
  
  -- Calcular valor das parcelas com juros, se aplicável
  IF p_installments > 1 AND v_installment_fee_percentage > 0 THEN
    v_installment_fee := (v_final_amount * v_installment_fee_percentage / 100) * p_installments;
    v_final_amount := v_final_amount + v_installment_fee;
  END IF;
  
  v_installment_amount := ROUND(v_final_amount / p_installments, 2);
  
  -- Iniciar transação
  BEGIN
    -- Inserir venda
    INSERT INTO sales (
      customer_id, seller_id, total_amount, discount_amount, 
      final_amount, payment_method_id, notes, status
    ) VALUES (
      p_customer_id, p_seller_id, v_total_amount, v_discount_total,
      v_final_amount, p_payment_method_id, p_notes, 'completed'
    ) RETURNING id INTO v_sale_id;
    
    -- Inserir itens da venda
    INSERT INTO sale_items (
      sale_id, product_id, quantity, unit_price, discount_percentage
    )
    SELECT 
      v_sale_id, 
      (item->>'product_id')::UUID, 
      (item->>'quantity')::INTEGER, 
      (item->>'unit_price')::NUMERIC(10, 2),
      COALESCE((item->>'discount_percentage')::NUMERIC(5, 2), 0)
    FROM jsonb_array_elements(p_items::jsonb) AS item;
    
    -- Atualizar estoque
    UPDATE products p
    SET stock_quantity = stock_quantity - i.quantity,
        updated_at = NOW()
    FROM (
      SELECT 
        (item->>'product_id')::UUID as product_id,
        (item->>'quantity')::INTEGER as quantity
      FROM jsonb_array_elements(p_items::jsonb) AS item
    ) i
    WHERE p.id = i.product_id;
    
    -- Inserir parcelas, se aplicável
    IF p_installments > 1 THEN
      FOR i IN 1..p_installments LOOP
        v_due_date := v_current_date + (i * v_payment_interval);
        
        INSERT INTO sale_payments (
          sale_id, payment_method_id, amount, due_date, status
        ) VALUES (
          v_sale_id, p_payment_method_id, 
          CASE 
            WHEN i = p_installments THEN 
              v_final_amount - (v_installment_amount * (p_installments - 1))
            ELSE 
              v_installment_amount 
          END,
          v_due_date,
          'pending'
        );
      END LOOP;
    ELSE
      -- Pagamento à vista
      INSERT INTO sale_payments (
        sale_id, payment_method_id, amount, due_date, status
      ) VALUES (
        v_sale_id, p_payment_method_id, v_final_amount, v_current_date, 'pending'
      );
    END IF;
    
    -- Registrar descontos
    FOR v_discount IN SELECT * FROM jsonb_to_recordset(p_discounts) AS x(
      discount_type TEXT,
      value NUMERIC(10, 2),
      reason TEXT
    )
    LOOP
      INSERT INTO sale_discounts (
        sale_id, discount_type, value, reason, approved_by
      ) VALUES (
        v_sale_id, v_discount.discount_type, v_discount.value, 
        v_discount.reason, p_seller_id
      );
    END LOOP;
    
    -- Atualizar histórico do cliente
    PERFORM update_customer_after_sale(p_customer_id, v_final_amount);
    
    -- Confirmar transação
    sale_id := v_sale_id;
    status := 'success';
    message := 'Venda registrada com sucesso';
    RETURN NEXT;
    
    EXCEPTION
      WHEN OTHERS THEN
        -- Rollback implícito em caso de erro
        RAISE EXCEPTION 'Erro ao processar venda: %', SQLERRM;
  END;
END;
$$;

### 2. Função para atualizar dados do cliente após venda

```sql
CREATE OR REPLACE FUNCTION public.update_customer_after_sale(
  p_customer_id UUID,
  p_sale_amount NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
-- Implementação da função de atualização do cliente
-- (conteúdo detalhado omitido por brevidade)
$$;
```

## Políticas de Segurança (RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para payment_methods
CREATE POLICY "Todos podem visualizar métodos de pagamento ativos" 
ON public.payment_methods 
FOR SELECT 
TO authenticated 
USING (is_active = true);

-- Políticas para sales
CREATE POLICY "Vendedores podem ver suas próprias vendas" 
ON public.sales 
FOR SELECT 
TO authenticated 
USING (seller_id = auth.uid());

CREATE POLICY "Gerentes podem ver todas as vendas" 
ON public.sales 
FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM auth.users 
  WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
));

-- Políticas para sale_items
CREATE POLICY "Itens de venda são visíveis para quem pode ver a venda" 
ON public.sale_items 
FOR SELECT 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.sales 
  WHERE id = sale_id AND (
    seller_id = auth.uid() OR 
    (SELECT raw_user_meta_data->>'role' = 'admin' FROM auth.users WHERE id = auth.uid())
  )
));
```

## Funções Adicionais

### 2. Função para processar devolução

```sql
CREATE OR REPLACE FUNCTION public.process_return(
  p_sale_id UUID,
  p_items JSONB[],
  p_reason TEXT,
  p_processed_by UUID
) 
RETURNS TABLE (return_id UUID, status TEXT, message TEXT) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
-- Implementação da função de devolução
-- (conteúdo detalhado omitido por brevidade)
$$;
```

### 3. Função para gerar relatório de vendas

```sql
CREATE OR REPLACE FUNCTION public.generate_sales_report(
  p_start_date DATE,
  p_end_date DATE,
  p_seller_id UUID DEFAULT NULL,
  p_payment_method_id UUID DEFAULT NULL
) 
RETURNS TABLE (
  sale_date DATE,
  total_sales NUMERIC(12, 2),
  total_items INTEGER,
  average_ticket NUMERIC(10, 2),
  payment_methods JSONB
) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
-- Implementação da função de relatório
-- (conteúdo detalhado omitido por brevidade)
$$;
```

## Gatilhos (Triggers)

### 1. Atualização de Estoque

```sql
-- Gatilho para atualizar o estoque quando um item de venda é inserido
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o estoque quando um item é vendido
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Anexar o gatilho à tabela sale_items
CREATE TRIGGER trg_update_stock_after_sale
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();
```

### 2. Histórico de Preços

```sql
-- Tabela de histórico de preços
CREATE TABLE IF NOT EXISTS product_price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price NUMERIC(10, 2) NOT NULL,
  new_price NUMERIC(10, 2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para melhorar consultas
CREATE INDEX IF NOT EXISTS product_price_history_product_id_idx 
ON product_price_history(product_id, changed_at DESC);

-- Gatilho para registrar alterações de preço
CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price != NEW.price THEN
    INSERT INTO product_price_history (product_id, old_price, new_price, changed_by)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Anexar o gatilho à tabela products
CREATE TRIGGER trg_log_price_change
BEFORE UPDATE OF price ON products
FOR EACH ROW
WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION log_price_change();
```

## Índices de Desempenho

Além dos índices já mencionados, considere adicionar os seguintes para melhorar o desempenho:

```sql
-- Índice para consultas de relatórios
CREATE INDEX IF NOT EXISTS sales_date_status_idx ON sales(created_at, status);

-- Índice para busca por cliente
CREATE INDEX IF NOT EXISTS sales_customer_created_idx ON sales(customer_id, created_at DESC);

-- Índice para consultas de estoque baixo
CREATE INDEX IF NOT EXISTS products_low_stock_idx ON products(stock_quantity) 
WHERE stock_quantity < 10; -- Ajuste o valor conforme necessário

-- Índice para consultas de vendas por status de pagamento
CREATE INDEX IF NOT EXISTS sales_payment_status_idx ON sales(payment_status);
```

## Próximos Passos

1. **Executar Migrações**: 
   - Execute os comandos SQL acima no SQL Editor do Supabase em ordem
   - Verifique se todas as tabelas, funções e gatilhos foram criados corretamente

2. **Testes Iniciais**:
   - Crie vendas de teste com diferentes cenários (à vista, parcelado, com desconto)
   - Verifique se o estoque está sendo atualizado corretamente
   - Teste o processo de devolução

3. **Configuração de Segurança**:
   - Revise e ajuste as políticas RLS conforme necessário
   - Verifique as permissões dos usuários

4. **Monitoramento**:
   - Configure alertas para estoque baixo
   - Monitore o desempenho das consultas
   - Ajuste índices conforme necessário

## Notas Importantes

- **Backup**: Sempre faça backup do banco de dados antes de executar migrações em produção
- **Permissões**: Verifique se o usuário do Supabase tem as permissões necessárias para criar objetos no banco de dados
- **Personalização**: Ajuste os tipos de dados, restrições e valores padrão conforme as necessidades específicas do seu negócio
- **Documentação**: Mantenha este documento atualizado com quaisquer alterações no esquema do banco de dados

## Atualizações Recentes

- **20/06/2025**: 
  - Adicionadas tabelas para pagamentos parcelados, descontos e devoluções
  - Implementada função completa de criação de venda com suporte a parcelamento
  - Adicionados gatilhos para gerenciamento de estoque e histórico de preços
  - Melhorada a documentação e adicionados índices de desempenho
