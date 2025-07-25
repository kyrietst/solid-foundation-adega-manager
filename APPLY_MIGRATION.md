# Como Aplicar a Migração do Estoque

## 📋 Instruções para Aplicar no Supabase

### 1. **Acesse o Painel do Supabase**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto "adega"
4. Vá em **SQL Editor** no menu lateral

### 2. **Execute os Comandos SQL**

Cole e execute o seguinte SQL no editor:

```sql
-- PASSO 1: Adicionar novos campos na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS unit_type TEXT DEFAULT 'un' CHECK (unit_type IN ('un', 'pct')),
ADD COLUMN IF NOT EXISTS package_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS package_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS package_margin NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS turnover_rate TEXT DEFAULT 'medium' CHECK (turnover_rate IN ('fast', 'medium', 'slow')),
ADD COLUMN IF NOT EXISTS last_sale_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS volume_ml INTEGER;

-- PASSO 2: Adicionar comentários para documentação
COMMENT ON COLUMN products.unit_type IS 'Tipo de venda: unidade (un) ou pacote (pct)';
COMMENT ON COLUMN products.package_size IS 'Quantidade de unidades por pacote';
COMMENT ON COLUMN products.package_price IS 'Preço de venda do pacote';
COMMENT ON COLUMN products.package_margin IS 'Margem de lucro do pacote em percentual';
COMMENT ON COLUMN products.turnover_rate IS 'Taxa de giro: fast (rápido), medium (médio), slow (devagar)';
COMMENT ON COLUMN products.last_sale_date IS 'Data da última venda para cálculo de giro';
COMMENT ON COLUMN products.volume_ml IS 'Volume do produto em mililitros';

-- PASSO 3: Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_turnover_rate ON products(turnover_rate);
CREATE INDEX IF NOT EXISTS idx_products_last_sale_date ON products(last_sale_date);
CREATE INDEX IF NOT EXISTS idx_products_unit_type ON products(unit_type);
```

### 3. **Execute as Funções Automáticas**

Cole e execute este segundo bloco:

```sql
-- PASSO 4: Função para atualizar automaticamente a data da última venda
CREATE OR REPLACE FUNCTION update_product_last_sale()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar a data da última venda do produto
    UPDATE products 
    SET last_sale_date = (
        SELECT created_at FROM sales WHERE id = NEW.sale_id LIMIT 1
    )
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 5: Trigger para atualizar automaticamente quando uma venda for criada
DROP TRIGGER IF EXISTS trigger_update_product_last_sale ON sale_items;
CREATE TRIGGER trigger_update_product_last_sale
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_last_sale();
```

### 4. **Execute a Função de Cálculo de Giro**

Cole e execute este terceiro bloco:

```sql
-- PASSO 6: Função para calcular taxa de giro automaticamente
CREATE OR REPLACE FUNCTION calculate_turnover_rate()
RETURNS void AS $$
DECLARE
    product_record RECORD;
    sales_last_30_days INTEGER;
    avg_sales_per_day NUMERIC;
    new_turnover_rate TEXT;
BEGIN
    -- Para cada produto, calcular a taxa de giro
    FOR product_record IN SELECT id, minimum_stock FROM products LOOP
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
$$ LANGUAGE plpgsql;

-- PASSO 7: Executar o cálculo inicial de giro para produtos existentes
SELECT calculate_turnover_rate();
```

### 5. **Atualizar Produtos Existentes**

Cole e execute este último bloco:

```sql
-- PASSO 8: Atualizar produtos existentes com valores padrão adequados
UPDATE products 
SET 
    unit_type = COALESCE(unit_type, 'un'),
    package_size = COALESCE(package_size, 1),
    turnover_rate = COALESCE(turnover_rate, 'medium')
WHERE unit_type IS NULL OR package_size IS NULL OR turnover_rate IS NULL;

-- PASSO 9: Atualizar last_sale_date baseado nas vendas existentes
UPDATE products 
SET last_sale_date = (
    SELECT MAX(s.created_at)
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE si.product_id = products.id
)
WHERE last_sale_date IS NULL;

-- PASSO 10: Verificação final
SELECT 
    'Migração concluída!' as status,
    COUNT(*) as total_produtos,
    COUNT(CASE WHEN unit_type IS NOT NULL THEN 1 END) as com_tipo_venda,
    COUNT(CASE WHEN turnover_rate IS NOT NULL THEN 1 END) as com_giro
FROM products;
```

## ✅ **Verificação**

Após executar todos os comandos, você deve ver uma mensagem similar a:

```
status              | total_produtos | com_tipo_venda | com_giro
Migração concluída! | 0              | 0              | 0
```

## 🚀 **Após a Migração**

1. **Reinicie a aplicação** com `npm run dev`
2. **Acesse a aba Estoque** 
3. **Teste criando um novo produto** com todos os campos
4. **Verifique os cálculos automáticos** de margem

## ⚠️ **Nota Importante**

Se houver algum erro durante a execução, execute os comandos um de cada vez para identificar onde está o problema. Todos os comandos usam `IF NOT EXISTS` e `COALESCE` para serem seguros em múltiplas execuções.