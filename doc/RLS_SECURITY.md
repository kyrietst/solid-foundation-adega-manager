# Políticas de Segurança RLS do Supabase

## Visão Geral

Este documento descreve as políticas de segurança em nível de linha (RLS - Row Level Security) implementadas no banco de dados do Adega Manager. Essas políticas garantem que os usuários só possam acessar os dados aos quais têm permissão.

## Estrutura de Autenticação

O sistema utiliza três níveis de acesso:

1. **admin**: Acesso total ao sistema
2. **employee**: Acesso às funcionalidades de vendas e estoque
3. **delivery**: Acesso apenas às funcionalidades de entrega

## Políticas RLS por Tabela

### Tabela: customers

#### 1. Permissão de Leitura

```sql
-- Permite que todos os usuários autenticados vejam os clientes
CREATE POLICY "Permitir leitura de clientes para usuários autenticados"
ON customers
FOR SELECT
TO authenticated
USING (true);

-- Permite que usuários vejam apenas seus próprios dados de cliente
CREATE POLICY "Permitir que clientes vejam apenas seus próprios dados"
ON customers
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

#### 2. Permissão de Inserção

```sql
-- Apenas administradores podem criar novos clientes
CREATE POLICY "Apenas administradores podem criar clientes"
ON customers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

#### 3. Permissão de Atualização

```sql
-- Clientes podem atualizar apenas suas próprias informações
CREATE POLICY "Clientes podem atualizar apenas seus próprios dados"
ON customers
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Administradores podem atualizar qualquer cliente
CREATE POLICY "Administradores podem atualizar qualquer cliente"
ON customers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

### Tabela: sales

#### 1. Permissão de Leitura

```sql
-- Vendedores podem ver apenas suas próprias vendas
CREATE POLICY "Vendedores podem ver suas próprias vendas"
ON sales
FOR SELECT
TO authenticated
USING (
  seller_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Vendedores podem ver vendas da equipe
CREATE POLICY "Vendedores podem ver vendas da equipe"
ON sales
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'seller'
  )
  AND seller_id IN (
    SELECT id FROM users 
    WHERE role IN ('employee', 'seller')
  )
);
```

#### 2. Permissão de Inserção

```sql
-- Vendedores podem criar novas vendas
CREATE POLICY "Vendedores podem criar vendas"
ON sales
FOR INSERT
TO authenticated
WITH CHECK (
  seller_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('seller', 'employee', 'admin')
  )
);

-- Apenas administradores podem aplicar descontos acima de 20%
CREATE POLICY "Restrição de desconto para não administradores"
ON sales
FOR INSERT
TO authenticated
WITH CHECK (
  (discount_amount / NULLIF(total_amount, 0)) <= 0.2
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Apenas administradores podem cancelar vendas
CREATE POLICY "Apenas administradores podem cancelar vendas"
ON sales
FOR UPDATE
TO authenticated
USING (
  status != 'cancelled'
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

### Tabela: sale_items

#### 1. Permissão de Leitura

```sql
-- Itens de venda são visíveis para quem pode ver a venda
CREATE POLICY "Itens de venda são visíveis para quem pode ver a venda"
ON sale_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE sales.id = sale_items.sale_id
    AND (
      sales.seller_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND role = 'admin'
      )
    )
  )
);

#### 2. Permissão de Inserção/Atualização

```sql
-- Apenas o vendedor pode adicionar itens à venda
CREATE POLICY "Apenas o vendedor pode adicionar itens à venda"
ON sale_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM sales 
    WHERE sales.id = sale_items.sale_id
    AND sales.seller_id = auth.uid()
  )
);
```

### Tabela: payment_methods

#### 1. Permissão de Leitura

```sql
-- Todos os usuários autenticados podem ver os métodos de pagamento ativos
CREATE POLICY "Todos podem ver métodos de pagamento ativos"
ON payment_methods
FOR SELECT
TO authenticated
USING (is_active = true);

-- Apenas administradores podem ver métodos inativos
CREATE POLICY "Apenas administradores podem ver métodos inativos"
ON payment_methods
FOR SELECT
TO authenticated
USING (
  is_active = false
  AND EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

### Tabela: customer_interactions

#### 1. Permissão de Leitura

```sql
-- Usuários podem ver apenas as interações que criaram
CREATE POLICY "Permitir leitura de interações para o criador"
ON customer_interactions
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Administradores podem ver todas as interações
CREATE POLICY "Administradores podem ver todas as interações"
ON customer_interactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);
```

## Funções de Apoio para Vendas

### Função: can_manage_sale(sale_id)

Verifica se o usuário atual pode gerenciar uma venda específica.

```sql
CREATE OR REPLACE FUNCTION can_manage_sale(sale_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    -- O vendedor da venda
    SELECT 1 FROM sales WHERE id = sale_id AND seller_id = auth.uid()
    UNION
    -- Ou um administrador
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    UNION
    -- Ou um vendedor visualizando venda da equipe
    SELECT 1 
    FROM sales s
    JOIN users u ON u.id = s.seller_id
    WHERE s.id = sale_id 
    AND u.role IN ('seller', 'employee')
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'seller'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Função: validate_sale_items()

Valida os itens de uma venda antes da inserção/atualização.

```sql
CREATE OR REPLACE FUNCTION validate_sale_items()
RETURNS TRIGGER AS $$
DECLARE
  product_stock int;
BEGIN
  -- Verifica se o produto existe e tem estoque suficiente
  SELECT stock_quantity INTO product_stock
  FROM products
  WHERE id = NEW.product_id;
  
  IF product_stock < NEW.quantity THEN
    RAISE EXCEPTION 'Estoque insuficiente para o produto %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validação
CREATE TRIGGER validate_sale_items_trigger
BEFORE INSERT OR UPDATE ON sale_items
FOR EACH ROW
EXECUTE FUNCTION validate_sale_items();
```

## Funções de Apoio Gerais

### Função: is_admin()

Verifica se o usuário atual é um administrador.

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Função: is_employee()

Verifica se o usuário atual é um funcionário ou administrador.

```sql
CREATE OR REPLACE FUNCTION is_employee()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM users 
    WHERE id = auth.uid() 
    AND role IN ('employee', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Melhores Práticas de Segurança

1. **Sempre use RLS**: Todas as tabelas devem ter RLS ativado, mesmo que a política permita amplo acesso.

2. **Princípio do Menor Privilégio**: Conceda apenas as permissões mínimas necessárias para cada função.

3. **Use Funções de Apoio**: Crie funções reutilizáveis para verificações de permissão comuns.

4. **Auditoria**: Mantenha um registro de alterações nas políticas de segurança.

5. **Teste de Segurança**:
   - Teste cada política com diferentes níveis de usuário
   - Verifique se as restrições estão funcionando conforme o esperado
   - Teste cenários de borda e tentativas de injeção SQL

## Solução de Problemas Comuns

### Problema: Usuário não consegue acessar dados

1. Verifique se o RLS está ativado na tabela:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. Verifique as políticas ativas:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'nome_da_tabela';
   ```

3. Verifique a função `auth.uid()`:
   ```sql
   SELECT auth.uid(); -- Deve retornar o ID do usuário atual
   ```

### Problema: Políticas conflitantes

Se várias políticas se aplicarem a uma operação, elas são combinadas com OR. Use WITH CHECK para validação adicional.

## Atualizações

- **2025-06-20**: Adicionadas políticas específicas para o módulo de Vendas
- **2025-06-13**: Documentação inicial das políticas RLS

## Próximos Passos

1. Implementar auditoria de alterações nas tabelas críticas
2. Adicionar políticas para novas tabelas conforme necessário
3. Revisar e atualizar políticas periodicamente para garantir a conformidade com os requisitos de segurança