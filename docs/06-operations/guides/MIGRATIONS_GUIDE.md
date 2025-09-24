# Guia de Migrações do Banco de Dados

## 📋 Visão Geral

Este guia explica como trabalhar com migrações de banco de dados no sistema Adega Manager usando o Supabase CLI de forma segura e organizada.

## 🎯 O que são Migrações?

**Migrações** são como "receitas de mudanças" para o banco de dados. Cada migração é um arquivo que contém instruções SQL para:
- Criar tabelas
- Modificar colunas existentes
- Adicionar índices
- Criar funções
- Alterar permissões

## 🔧 Comandos Disponíveis

### Scripts do package.json

```bash
# Criar nova migração
npm run migration:create nome_da_mudanca

# Aplicar migrações pendentes
npm run migration:apply

# Ver status das migrações
npm run migration:status

# Criar migração baseada em diferenças
npm run migration:diff nome_da_migração

# Puxar esquema do remoto
npm run migration:pull
```

### Comandos Supabase CLI diretos

```bash
# Criar nova migração
supabase migration new nome_da_mudanca

# Aplicar no remoto
supabase db push

# Listar migrações
supabase migration list

# Ver diferenças
supabase db diff --file nome_arquivo
```

## 📝 Criando uma Nova Migração

### Passo 1: Criar arquivo de migração
```bash
npm run migration:create add_new_column_to_products
```

Isso cria um arquivo como: `supabase/migrations/20250924064500_add_new_column_to_products.sql`

### Passo 2: Escrever o SQL
```sql
-- Migration: Add discount_percentage column to products
-- Created: 2025-09-24

-- Add new column
ALTER TABLE products
ADD COLUMN discount_percentage DECIMAL(5,2) DEFAULT 0.0;

-- Add constraint to ensure valid percentage
ALTER TABLE products
ADD CONSTRAINT valid_discount_percentage
CHECK (discount_percentage >= 0.0 AND discount_percentage <= 100.0);

-- Update RLS policies if needed
-- (example if the new column affects security)

-- Add comment
COMMENT ON COLUMN products.discount_percentage IS 'Percentage discount for product (0.0 to 100.0)';
```

### Passo 3: Testar localmente (se Docker disponível)
```bash
supabase db reset  # Recria banco local com todas as migrações
```

### Passo 4: Aplicar no remoto
```bash
npm run migration:apply
```

## ⚠️ Boas Práticas

### ✅ DO (Faça)

1. **Sempre criar em branch de desenvolvimento**
   ```bash
   git checkout development/simplification
   npm run migration:create my_changes
   ```

2. **Nomes descritivos**
   - ✅ `add_expiry_date_to_products`
   - ✅ `fix_customer_segmentation_logic`
   - ❌ `changes` ou `fix`

3. **Incluir rollback quando possível**
   ```sql
   -- Forward migration
   ALTER TABLE products ADD COLUMN new_field TEXT;

   -- To rollback (in comments for reference):
   -- ALTER TABLE products DROP COLUMN new_field;
   ```

4. **Comentar mudanças complexas**
   ```sql
   -- This migration adds support for product variants
   -- Related to issue #123 and feature request ABC
   ```

5. **Testar com dados existentes**
   ```sql
   -- Update existing records with sensible defaults
   UPDATE products SET new_column = 'default_value' WHERE new_column IS NULL;
   ```

### ❌ DON'T (Não Faça)

1. **Nunca editar migrações já aplicadas**
   - Se precisa corrigir, crie uma nova migração

2. **Não fazer mudanças que quebram a aplicação**
   - Remover colunas que o código ainda usa
   - Renomear tabelas sem atualizar o código

3. **Não aplicar direto na produção sem testar**

4. **Não fazer migrações muito grandes**
   - Prefira várias migrações pequenas

## 🚀 Fluxo de Trabalho Recomendado

### 1. Desenvolvimento
```bash
# 1. Criar branch para a feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer mudanças no código
# ... editar arquivos React/TypeScript

# 3. Criar migração necessária
npm run migration:create add_support_for_nova_funcionalidade

# 4. Editar o arquivo SQL gerado
# 5. Aplicar migração
npm run migration:apply

# 6. Testar a aplicação
npm run dev

# 7. Commit tudo
git add .
git commit -m "feat: add nova funcionalidade with database migration"
```

### 2. Pull Request
```bash
# 1. Push branch
git push origin feature/nova-funcionalidade

# 2. Abrir PR para development/simplification
# 3. GitHub Actions vai validar:
#    - ✅ Lint passa
#    - ✅ TypeScript compila
#    - ✅ Testes passam

# 4. Após aprovação, merge
# 5. A migração é aplicada automaticamente no deploy
```

### 3. Produção (Manual)
```bash
# Após merge para main, aplicar manualmente:
git checkout main
git pull
npm run migration:apply
```

## 🔍 Verificando Status

### Ver migrações pendentes
```bash
npm run migration:status
```

### Ver diferenças entre local e remoto
```bash
npm run migration:diff proposed_changes
```

## 🚨 Solução de Problemas

### Migração falhou
```bash
# 1. Ver logs detalhados
supabase db push --debug

# 2. Verificar sintaxe SQL
# 3. Corrigir e tentar novamente
# 4. Se necessário, criar migração de correção
```

### Conflitos de migração
```bash
# 1. Ver status
npm run migration:status

# 2. Resolver conflitos manualmente
# 3. Criar nova migração se necessário
```

### Rollback (emergência)
```sql
-- Criar migração de rollback manual
-- Exemplo: reverter adição de coluna
ALTER TABLE products DROP COLUMN IF EXISTS problematic_column;
```

## 📚 Exemplos Práticos

### Exemplo 1: Adicionar nova tabela
```sql
-- Migration: Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### Exemplo 2: Modificar tabela existente
```sql
-- Migration: Add phone validation to customers
-- Add new column with default
ALTER TABLE customers
ADD COLUMN phone_validated BOOLEAN DEFAULT false;

-- Update existing records based on phone format
UPDATE customers
SET phone_validated = true
WHERE phone ~ '^[0-9]{10,11}$';

-- Add constraint
ALTER TABLE customers
ADD CONSTRAINT valid_phone_when_validated
CHECK (NOT phone_validated OR phone IS NOT NULL);
```

### Exemplo 3: Criar função/procedimento
```sql
-- Migration: Add customer activity tracking function
CREATE OR REPLACE FUNCTION track_customer_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO customer_activities (customer_id, activity_type, details)
  VALUES (NEW.id, 'updated', row_to_json(NEW));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER customer_activity_trigger
  AFTER UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION track_customer_activity();
```

## 🎓 Resumo para Iniciantes

1. **Migrações = Receitas de mudanças no banco**
2. **Sempre criar em branch de desenvolvimento**
3. **Usar nomes descritivos**
4. **Testar antes de aplicar**
5. **Usar PR como gate de qualidade**
6. **Aplicar manualmente na produção**

## 📞 Suporte

Se tiver dúvidas:
1. Consulte este guia
2. Veja exemplos nas migrações existentes em `supabase/migrations/`
3. Teste em desenvolvimento primeiro
4. Use o GitHub Actions como validação

---

*Criado em: 2025-09-24*
*Última atualização: 2025-09-24*