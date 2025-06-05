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

#### sales
- Registro de vendas com status tracking
- Relacionamento com customers e users
- Sistema de delivery integrado
- Notas e informações adicionais em campos específicos

#### sale_items
- Itens individuais de cada venda
- Mantém histórico de preços
- Relacionamento com products

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
```

## Recomendações Finais

1. **Sempre use transações** para operações múltiplas
2. **Implemente validações** em nível de aplicação e banco
3. **Mantenha índices** atualizados e otimizados
4. **Monitore performance** regularmente
5. **Faça backup** dos dados críticos
6. **Documente mudanças** no schema
7. **Teste** todas as políticas RLS
8. **Valide** dados antes de inserir/atualizar
9. **Use prepared statements** para prevenir SQL injection
10. **Mantenha logs** de operações críticas 