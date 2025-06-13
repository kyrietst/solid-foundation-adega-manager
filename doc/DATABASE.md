# Documentação do Banco de Dados

## Visão Geral

O Adega Manager utiliza o PostgreSQL através do Supabase como banco de dados principal. A estrutura foi projetada para garantir integridade referencial, performance e segurança.

## Estrutura Atual

### Tabelas Principais

#### users
- Armazena informações dos usuários do sistema
- Integrada com auth.users do Supabase
- Campos críticos: role, email (unique)
- Políticas RLS implementadas para segurança
- Roles disponíveis: 'admin', 'employee', 'delivery'
- Tabela principal para controle de acesso

#### profiles
- Extensão da tabela users com informações adicionais
- Mantém sincronização com users via triggers
- Usado para informações não críticas do usuário
- Deve manter role sincronizada com a tabela users
- Importante: Ao criar novo usuário, garantir que role seja igual em ambas as tabelas

#### products
- Catálogo completo de produtos
- Índices otimizados para busca por nome e categoria
- Controle de estoque integrado
- Imagens armazenadas no Storage do Supabase

#### customers
- Cadastro de clientes
- Endereços armazenados em JSONB para flexibilidade
- Índices para busca por nome e email
- Campos estendidos para CRM:
  - birthday: data de aniversário do cliente
  - contact_preference: preferência de contato (whatsapp, sms, email, call)
  - contact_permission: permissão para contato (boolean)
  - first_purchase_date: data da primeira compra
  - last_purchase_date: data da última compra
  - purchase_frequency: frequência de compra (weekly, biweekly, monthly, occasional)
  - lifetime_value: valor total gasto pelo cliente
  - favorite_category: categoria favorita (baseada em compras)
  - favorite_product: produto favorito (referência à products.id)
  - segment: segmento do cliente (VIP, Regular, Novo, Inativo, Em risco)

#### sales
- Registro de vendas com status tracking
- Relacionamento com customers e users
- Sistema de delivery integrado
- Notas e informações adicionais em campos específicos

#### sale_items
- Itens individuais de cada venda
- Mantém histórico de preços
- Relacionamento com products

#### customer_insights
- Armazena insights gerados sobre os clientes
- Campos principais:
  - customer_id: referência ao cliente
  - insight_type: tipo do insight (preference, pattern, opportunity, risk)
  - insight_value: descrição textual do insight
  - confidence: nível de confiança (0.0 a 1.0)
  - is_active: se o insight ainda é válido
  - created_at: data de criação

#### customer_interactions
- Registra todas as interações com clientes
- Campos principais:
  - customer_id: referência ao cliente
  - interaction_type: tipo de interação (note, call, email, complaint)
  - description: descrição textual da interação
  - associated_sale_id: venda associada (opcional)
  - created_by: usuário que registrou a interação
  - created_at: data da interação

#### automation_logs
- Registra eventos das automações do CRM
- Campos principais:
  - customer_id: referência ao cliente
  - workflow_id: identificador do fluxo de automação
  - workflow_name: nome do fluxo
  - trigger_event: evento que acionou a automação
  - result: resultado da automação
  - details: detalhes adicionais em JSONB
  - created_at: timestamp do evento

## Boas Práticas e Recomendações

### 1. Gerenciamento de Dados

#### Inserções e Atualizações
```sql
-- SEMPRE use transações para operações múltiplas
BEGIN;
  -- Suas operações aqui
  INSERT INTO sales (...) VALUES (...);
  UPDATE products SET stock_quantity = stock_quantity - 1 WHERE id = :id;
COMMIT;

-- Use RETURNING para obter dados atualizados
INSERT INTO products (...) 
VALUES (...) 
RETURNING id, name, stock_quantity;

-- Sempre valide dados antes de inserir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products WHERE id = :product_id) THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;
END $$;
```

#### Consultas
```sql
-- Use índices apropriadamente
CREATE INDEX idx_products_search ON products 
USING gin(to_tsvector('portuguese', name || ' ' || description));

-- Evite SELECT *
SELECT id, name, price, stock_quantity 
FROM products 
WHERE category = 'vinho_tinto';

-- Use JOINs com critério
SELECT s.id, s.total_amount, c.name as customer_name
FROM sales s
LEFT JOIN customers c ON c.id = s.customer_id
WHERE s.created_at >= NOW() - INTERVAL '30 days';
```

### 2. Segurança

#### Políticas RLS
```sql
-- Sempre habilite RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Seja específico nas políticas
CREATE POLICY "Employees can update stock" ON products
FOR UPDATE USING (
  auth.role() = 'employee' 
  AND (OLD.stock_quantity IS DISTINCT FROM NEW.stock_quantity)
);

-- Políticas para deleção devem ser restritas
CREATE POLICY "Only admins can delete" ON products
FOR DELETE USING (auth.role() = 'admin');
```

#### Validações
```sql
-- Adicione constraints apropriadas
ALTER TABLE products 
ADD CONSTRAINT positive_price 
CHECK (price >= 0);

-- Use enums para valores fixos
CREATE TYPE sale_status AS ENUM (
  'pending', 
  'processing', 
  'completed', 
  'cancelled'
);

-- Valide dados em triggers
CREATE TRIGGER validate_stock
BEFORE INSERT OR UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION validate_stock_quantity();
```

### 3. Performance

#### Índices
```sql
-- Índices para campos frequentemente buscados
CREATE INDEX idx_sales_date ON sales (created_at DESC);

-- Índices parciais para queries específicas
CREATE INDEX idx_low_stock ON products (stock_quantity) 
WHERE stock_quantity < 10;

-- Índices compostos para queries comuns
CREATE INDEX idx_sales_customer_date 
ON sales (customer_id, created_at DESC);

-- Índices para tabelas CRM
CREATE INDEX idx_customer_interactions_customer 
ON customer_interactions (customer_id, created_at DESC);

CREATE INDEX idx_customer_insights_type
ON customer_insights (customer_id, insight_type, is_active);
```

#### Otimizações
```sql
-- Use materialized views para relatórios
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT 
  date_trunc('month', created_at) as month,
  sum(total_amount) as total,
  count(*) as count
FROM sales
GROUP BY 1;

-- Atualize views materializadas periodicamente
REFRESH MATERIALIZED VIEW monthly_sales;
```

### 4. Manutenção

#### Backups
- Configure backups diários automáticos
- Mantenha backups por pelo menos 30 dias
- Teste restauração periodicamente

#### Monitoramento
- Configure alertas para:
  - Baixo estoque
  - Falhas em transações
  - Erros de validação
  - Performance degradada

#### Limpeza
```sql
-- Delete dados antigos periodicamente
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';

-- Archive dados importantes
INSERT INTO sales_archive 
SELECT * FROM sales 
WHERE created_at < NOW() - INTERVAL '1 year';
```

## Triggers e Automações

### Trigger de Atualização de Cliente
```sql
-- Função para atualizar automaticamente os dados do cliente após uma venda
CREATE OR REPLACE FUNCTION public.update_customer_after_sale()
RETURNS TRIGGER AS $$
DECLARE
  total_purchases NUMERIC;
  most_purchased_category TEXT;
  most_purchased_product UUID;
  purchase_interval INTERVAL;
  purchase_frequency TEXT;
  customer_segment TEXT;
BEGIN
  -- Atualizar data da primeira compra se for null
  IF (SELECT first_purchase_date FROM customers WHERE id = NEW.customer_id) IS NULL THEN
    UPDATE customers SET first_purchase_date = NEW.created_at WHERE id = NEW.customer_id;
  END IF;
  
  -- Atualizar data da última compra
  UPDATE customers SET last_purchase_date = NEW.created_at WHERE id = NEW.customer_id;
  
  -- Calcular o valor total de compras do cliente
  SELECT COALESCE(SUM(total_amount), 0) INTO total_purchases 
  FROM sales 
  WHERE customer_id = NEW.customer_id AND status != 'cancelled';
  
  -- Atualizar lifetime_value
  UPDATE customers SET lifetime_value = total_purchases WHERE id = NEW.customer_id;
  
  -- Lógica para determinar categoria favorita, produto favorito, 
  -- frequência de compra e gerar insights automáticos
  -- [código resumido para brevidade]
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para vendas
CREATE TRIGGER update_customer_after_sale_trigger
AFTER INSERT OR UPDATE OF status
ON sales
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.customer_id IS NOT NULL)
EXECUTE FUNCTION public.update_customer_after_sale();
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Permissão**
   - Verifique políticas RLS
   - Confirme role do usuário
   - Valide tokens JWT

2. **Performance Lenta**
   - Analise EXPLAIN ANALYZE
   - Verifique índices
   - Otimize queries

3. **Inconsistência de Dados**
   - Use transações
   - Implemente constraints
   - Adicione triggers de validação

## Migrations

### Boas Práticas
```sql
-- Sempre inclua rollback
BEGIN;
  -- Up migration
  ALTER TABLE products ADD COLUMN category text;
  
  -- Rollback
  --ALTER TABLE products DROP COLUMN category;
COMMIT;

-- Use transações
BEGIN;
  -- Suas alterações aqui
COMMIT;

-- Documente mudanças
COMMENT ON COLUMN products.category IS 'Categoria do produto';
```

## Monitoramento e Logs

### Queries de Diagnóstico
```sql
-- Verificar conexões ativas
SELECT * FROM pg_stat_activity;

-- Verificar uso de índices
SELECT * FROM pg_stat_user_indexes;

-- Identificar queries lentas
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC;

-- Verificar consistência de dados CRM
SELECT c.id, c.name, c.segment, c.lifetime_value,
  (SELECT COUNT(*) FROM sales WHERE customer_id = c.id) AS sales_count,
  (SELECT COUNT(*) FROM customer_insights WHERE customer_id = c.id AND is_active = true) AS active_insights
FROM customers c
ORDER BY c.lifetime_value DESC;
```

## Recomendações Finais

1. **Sempre use transações** para operações múltiplas
2. **Implemente validações** em nível de aplicação e banco
3. **Mantenha índices** atualizados e otimizados
4. **Documente triggers e automações** sempre que houver atualizações
5. **Revise logs de automação** periodicamente para identificar problemas
6. **Faça backup** dos dados críticos
7. **Documente mudanças** no schema
8. **Teste** todas as políticas RLS
9. **Valide** dados antes de inserir/atualizar
10. **Use prepared statements** para prevenir SQL injection
11. **Mantenha logs** de operações críticas 