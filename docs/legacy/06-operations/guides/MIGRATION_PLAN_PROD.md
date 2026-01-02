# 🚀 PLANO DE MIGRAÇÃO: DEV → PROD (v3.4.0 Multi-Store)

**Data de Criação:** 2025-10-30
**Versão:** v3.4.0 + v3.4.3
**Status:** 📋 PLANEJADO - Aguardando Aprovação do Cliente

---

## 📋 INFORMAÇÕES CRÍTICAS

### Ambientes

| Ambiente | Project ID | Status | URL |
|----------|-----------|--------|-----|
| **DEV** | goppneqeowgeehpqkcxe | ✅ Atualizado | - |
| **PROD** | uujkzvbgnfzuzlztrzln | ⚠️ Desatualizado | Vercel |

### Dados de Produção

- **925+ produtos** cadastrados
- **Vendas diárias** em operação
- **Zero downtime** é objetivo, mas não garantido
- **Backup obrigatório** antes de qualquer mudança

---

## 🎯 OBJETIVOS

### O Que Vamos Fazer

1. **Aplicar migration** `20251025185108_add_multi_store_support.sql` em PROD
2. **Validar** criação de colunas e tabelas
3. **Migrar dados** de campos legacy para multi-store
4. **Testar** funcionalmente antes de liberar

### O Que NÃO Vamos Fazer (Ainda)

- ❌ Deploy de código v3.4.3 (será feito DEPOIS da migration)
- ❌ Deletar campos legacy (manter para backup)
- ❌ Fazer rollback de PROD para commit antigo

---

## ⏱️ JANELA DE MANUTENÇÃO

### Sugestão

**Data:** A combinar com cliente
**Horário:** 02:00 - 04:00 (madrugada)
**Duração Total:** 2 horas (com buffer)
**Downtime Esperado:** 5-10 minutos

### Cronograma

| Hora | Atividade | Duração |
|------|-----------|---------|
| 02:00 | Avisar usuários (se houver) | 5 min |
| 02:05 | Criar backup completo | 15 min |
| 02:20 | Aplicar migration | 2 min |
| 02:22 | Validar schema | 3 min |
| 02:25 | Validar dados | 5 min |
| 02:30 | Testar acesso (admin + employee) | 10 min |
| 02:40 | Liberar sistema | 5 min |
| 02:45 | **CONCLUÍDO** | - |

**Buffer:** 1h15min para problemas inesperados

---

## 📦 PRÉ-REQUISITOS

### Checklist OBRIGATÓRIO

- [ ] Cliente aprovou data e horário
- [ ] Backup automático do Supabase verificado
- [ ] Backup manual criado (download .sql)
- [ ] Acesso ao Supabase Dashboard (PROD)
- [ ] Acesso ao Vercel Dashboard
- [ ] Equipe de suporte em standby
- [ ] Plano de rollback revisado
- [ ] Queries de validação testadas em DEV

### Ferramentas Necessárias

- ✅ Supabase Dashboard (https://supabase.com/dashboard)
- ✅ MCP Supabase tools (backup)
- ✅ SQL Editor do Supabase
- ✅ Vercel Dashboard (monitoramento)

---

## 🔧 PASSO A PASSO DE EXECUÇÃO

### FASE 1: Backup (15 minutos)

#### 1.1 Backup Automático Supabase

```bash
# Verificar último backup automático
# Dashboard → Settings → Backup & Restore
# Confirmar que backup existe nas últimas 24h
```

**Validação:**
- ✅ Backup existe
- ✅ Tamanho razoável (~50-100 MB com 925 produtos)
- ✅ Data recente (máximo 24h atrás)

#### 1.2 Backup Manual (Download)

```sql
-- No SQL Editor do Supabase PROD, executar:
-- (Não é query, é ação manual no dashboard)

-- 1. Database → Backups → Create Backup
-- 2. Download backup file (.sql)
-- 3. Salvar em local seguro (Google Drive/Backup local)
```

**Arquivo esperado:**
- Nome: `supabase_prod_backup_2025-10-30.sql`
- Tamanho: ~50-100 MB
- Contém: Schema + Dados

#### 1.3 Backup de Tabelas Críticas (Extra Segurança)

```sql
-- Executar no SQL Editor PROD:

-- Backup da tabela products
CREATE TABLE products_backup_20251030 AS
SELECT * FROM products;

-- Backup da tabela sales (últimas 30 dias)
CREATE TABLE sales_backup_20251030 AS
SELECT * FROM sales
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Backup da tabela customers
CREATE TABLE customers_backup_20251030 AS
SELECT * FROM customers;
```

**Validação:**
```sql
SELECT COUNT(*) FROM products_backup_20251030;  -- Deve ser ~925
SELECT COUNT(*) FROM sales_backup_20251030;      -- Verificar número
SELECT COUNT(*) FROM customers_backup_20251030;  -- Verificar número
```

---

### FASE 2: Aplicar Migration (2 minutos)

#### 2.1 Ler Migration File

```bash
# No terminal local:
cat supabase/migrations/20251025185108_add_multi_store_support.sql
```

**Verificar que migration contém:**
- ✅ ADD COLUMN store1_stock_packages
- ✅ ADD COLUMN store1_stock_units_loose
- ✅ ADD COLUMN store2_stock_packages
- ✅ ADD COLUMN store2_stock_units_loose
- ✅ CREATE TABLE store_transfers
- ✅ CREATE INDEX em store_transfers
- ✅ ALTER TABLE para RLS
- ✅ CREATE POLICY para RLS

#### 2.2 Executar Migration

**Opção A: Via Supabase Dashboard (Recomendado)**

1. Supabase Dashboard → Database → Migrations
2. Upload file: `20251025185108_add_multi_store_support.sql`
3. Review SQL
4. Click "Run Migration"
5. Aguardar confirmação

**Opção B: Via SQL Editor (Alternativa)**

1. Copiar conteúdo do arquivo .sql
2. Colar no SQL Editor
3. Executar query
4. Verificar "Success" message

**Tempo esperado:** 30-60 segundos

---

### FASE 3: Validar Schema (3 minutos)

#### 3.1 Validar Colunas Criadas

```sql
-- Executar no SQL Editor PROD:

SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN (
    'store1_stock_packages',
    'store1_stock_units_loose',
    'store2_stock_packages',
    'store2_stock_units_loose'
  )
ORDER BY column_name;
```

**Resultado esperado:** 4 linhas

| column_name | data_type | column_default | is_nullable |
|-------------|-----------|----------------|-------------|
| store1_stock_packages | smallint | 0 | YES |
| store1_stock_units_loose | smallint | 0 | YES |
| store2_stock_packages | smallint | 0 | YES |
| store2_stock_units_loose | smallint | 0 | YES |

**Se não retornar 4 linhas:** ❌ ABORTAR e executar rollback!

#### 3.2 Validar Tabela Criada

```sql
-- Verificar que store_transfers existe
SELECT COUNT(*) as total_transfers
FROM store_transfers;
```

**Resultado esperado:**
- Query executa sem erro
- Total: 0 (tabela vazia em PROD, normal)

**Se der erro:** ❌ ABORTAR e executar rollback!

#### 3.3 Validar RLS

```sql
-- Verificar RLS habilitado
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('products', 'store_transfers')
ORDER BY tablename;
```

**Resultado esperado:**

| tablename | rowsecurity |
|-----------|-------------|
| products | t |
| store_transfers | t |

**Se rowsecurity = 'f':** ⚠️ RLS não habilitado, executar correção!

#### 3.4 Validar Índices

```sql
-- Verificar índices criados
SELECT
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'store_transfers'
ORDER BY indexname;
```

**Resultado esperado:** Pelo menos 3 índices
- `store_transfers_pkey` (primary key)
- `idx_store_transfers_product_id`
- `idx_store_transfers_created_at`

---

### FASE 4: Validar Dados (5 minutos)

#### 4.1 Verificar Migração de Dados Legacy

```sql
-- Verificar se dados foram copiados para store1
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE store1_stock_packages > 0) as products_with_store1_packages,
  COUNT(*) FILTER (WHERE store1_stock_units_loose > 0) as products_with_store1_units,
  COUNT(*) FILTER (WHERE stock_packages > 0) as products_with_legacy_packages,
  COUNT(*) FILTER (WHERE stock_units_loose > 0) as products_with_legacy_units
FROM products
WHERE deleted_at IS NULL;
```

**Validação:**
```
products_with_store1_packages == products_with_legacy_packages
products_with_store1_units == products_with_legacy_units
```

**Se números não baterem:** ⚠️ Migração de dados falhou, executar query de correção!

#### 4.2 Query de Correção (Se Necessário)

```sql
-- EXECUTAR APENAS SE VALIDAÇÃO 4.1 FALHAR

UPDATE products
SET store1_stock_packages = stock_packages,
    store1_stock_units_loose = stock_units_loose
WHERE deleted_at IS NULL
  AND (store1_stock_packages != stock_packages
       OR store1_stock_units_loose != stock_units_loose);
```

**Re-executar validação 4.1 após correção.**

#### 4.3 Verificar Integridade

```sql
-- Verificar que NENHUM produto tem valores negativos
SELECT COUNT(*) as products_with_negative_stock
FROM products
WHERE store1_stock_packages < 0
   OR store1_stock_units_loose < 0
   OR store2_stock_packages < 0
   OR store2_stock_units_loose < 0;
```

**Resultado esperado:** 0

**Se > 0:** ⚠️ Dados corrompidos, investigar!

---

### FASE 5: Testes Funcionais (10 minutos)

#### 5.1 Teste de Acesso Admin

```sql
-- Simular query que admin faria
SELECT
  id,
  name,
  barcode,
  store1_stock_packages,
  store1_stock_units_loose,
  store2_stock_packages,
  store2_stock_units_loose
FROM products
WHERE deleted_at IS NULL
ORDER BY name
LIMIT 10;
```

**Resultado esperado:**
- Query executa sem erro
- Retorna 10 produtos
- Colunas multi-store visíveis

#### 5.2 Teste de Acesso Employee

```sql
-- Simular query que employee faria (via RLS)
SET LOCAL ROLE authenticated;

SELECT
  id,
  name,
  store1_stock_packages
FROM products
WHERE deleted_at IS NULL
LIMIT 5;

RESET ROLE;
```

**Resultado esperado:**
- Query executa sem erro
- Retorna 5 produtos (RLS permitiu)

**Se der erro de permissão:** ⚠️ RLS muito restritivo, ajustar!

#### 5.3 Teste de Inserção em store_transfers

```sql
-- Testar que tabela aceita inserções
DO $$
DECLARE
  test_product_id UUID;
  test_user_id UUID;
BEGIN
  -- Pegar primeiro produto
  SELECT id INTO test_product_id
  FROM products
  LIMIT 1;

  -- Pegar primeiro usuário
  SELECT id INTO test_user_id
  FROM auth.users
  LIMIT 1;

  -- Inserir transferência de teste
  INSERT INTO store_transfers (
    product_id,
    from_store,
    to_store,
    packages,
    units_loose,
    user_id,
    notes
  ) VALUES (
    test_product_id,
    1,
    2,
    5,
    10,
    test_user_id,
    'TESTE - Pode deletar'
  );

  -- Verificar inserção
  IF EXISTS (SELECT 1 FROM store_transfers WHERE notes = 'TESTE - Pode deletar') THEN
    RAISE NOTICE 'Teste de inserção: SUCESSO';

    -- Deletar registro de teste
    DELETE FROM store_transfers WHERE notes = 'TESTE - Pode deletar';
  ELSE
    RAISE EXCEPTION 'Teste de inserção: FALHOU';
  END IF;
END $$;
```

**Resultado esperado:** "Teste de inserção: SUCESSO"

---

### FASE 6: Liberação (5 minutos)

#### 6.1 Limpeza de Backups Temporários

```sql
-- OPCIONAL: Deletar backups temporários (após confirmar que tudo funcionou)
-- AGUARDAR 7 DIAS antes de executar!

-- DROP TABLE products_backup_20251030;
-- DROP TABLE sales_backup_20251030;
-- DROP TABLE customers_backup_20251030;
```

**Recomendação:** Manter backups por 7-14 dias

#### 6.2 Atualizar Documentação

- [ ] Marcar migration como aplicada em PROD
- [ ] Atualizar `SUPABASE_COMPARISON_CRITICA_v3.4.3.md`
- [ ] Documentar data/hora da execução
- [ ] Anotar quaisquer problemas encontrados

#### 6.3 Comunicar Sucesso

- [ ] Informar cliente que migration foi bem-sucedida
- [ ] Confirmar que sistema está estável
- [ ] Agendar deploy de v3.4.3 (próxima fase)

---

## 🔙 PLANO DE ROLLBACK

### Se Migration Falhar

#### Opção A: Rollback do Backup Automático

1. Supabase Dashboard → Settings → Backup & Restore
2. Selecionar backup pré-migration
3. Click "Restore"
4. Aguardar 5-10 minutos
5. Validar que sistema voltou ao estado anterior

**Tempo:** 10-15 minutos

#### Opção B: Rollback Manual

```sql
-- EXECUTAR APENAS SE OPÇÃO A FALHAR

-- 1. Deletar tabela criada
DROP TABLE IF EXISTS store_transfers CASCADE;

-- 2. Remover colunas adicionadas
ALTER TABLE products
  DROP COLUMN IF EXISTS store1_stock_packages,
  DROP COLUMN IF EXISTS store1_stock_units_loose,
  DROP COLUMN IF EXISTS store2_stock_packages,
  DROP COLUMN IF EXISTS store2_stock_units_loose;

-- 3. Validar que produtos ainda existem
SELECT COUNT(*) FROM products WHERE deleted_at IS NULL;
-- Deve retornar ~925
```

**Tempo:** 2-3 minutos

#### Opção C: Restaurar de Backup Manual

```bash
# Se Opções A e B falharem:

# 1. Supabase Dashboard → Database → SQL Editor
# 2. Upload arquivo: supabase_prod_backup_2025-10-30.sql
# 3. Execute
# 4. Aguardar restauração completa
```

**Tempo:** 10-20 minutos (depende do tamanho)

---

## ⚠️ PROBLEMAS ESPERADOS E SOLUÇÕES

### Problema 1: Migration Timeout

**Sintoma:** Query demora mais de 5 minutos

**Causa:** Banco muito grande ou muitas conexões ativas

**Solução:**
1. Cancelar query
2. Executar migration em partes menores
3. Adicionar APENAS colunas primeiro
4. Copiar dados em batches separados

### Problema 2: RLS Bloqueando Acesso

**Sintoma:** Admin não consegue ver dados após migration

**Causa:** Políticas RLS muito restritivas

**Solução:**
```sql
-- Temporariamente desabilitar RLS em store_transfers
ALTER TABLE store_transfers DISABLE ROW LEVEL SECURITY;

-- Validar acesso
SELECT * FROM store_transfers LIMIT 1;

-- Re-habilitar RLS
ALTER TABLE store_transfers ENABLE ROW LEVEL SECURITY;

-- Criar política mais permissiva
CREATE POLICY "Allow all authenticated users"
  ON store_transfers
  FOR ALL
  TO authenticated
  USING (true);
```

### Problema 3: Dados Não Migrados

**Sintoma:** store1_stock_* permanecem zerados

**Causa:** UPDATE não executou ou foi esquecido

**Solução:** Executar query de correção 4.2 (ver Fase 4)

---

## 📊 MÉTRICAS DE SUCESSO

### Validações Finais (Todas devem passar)

- [ ] Migration aplicada sem erros
- [ ] 4 colunas criadas em `products`
- [ ] Tabela `store_transfers` existe
- [ ] RLS habilitado em ambas
- [ ] Dados migrados corretamente (925 produtos)
- [ ] Admin consegue acessar dados
- [ ] Employee consegue acessar dados
- [ ] Sem erros no Supabase logs
- [ ] Sistema está responsivo

---

## 🎯 APÓS MIGRATION BEM-SUCEDIDA

### Próximos Passos

1. **Aguardar 24-48h** para validar estabilidade
2. **Monitorar logs** de erro no Supabase
3. **Preparar código v3.4.3** para deploy
4. **Testar v3.4.3 localmente** contra PROD
5. **Agendar deploy v3.4.3** (nova janela)

### Deploy v3.4.3 (Fase Separada)

**Não fazer no mesmo dia da migration!**

- Aguardar pelo menos 24h
- Validar que PROD está estável
- Fazer deploy em horário comercial
- Monitorar ativamente por 1h após deploy

---

## 📞 CONTATOS DE EMERGÊNCIA

### Equipe Técnica

- **Desenvolvedor:** Claude Code AI
- **Cliente:** Luccas
- **Backup:** [Definir]

### Suporte

- **Supabase Support:** https://supabase.com/dashboard/support
- **Vercel Support:** https://vercel.com/help

---

## 📚 REFERÊNCIAS

### Documentação

1. `SUPABASE_COMPARISON_CRITICA_v3.4.3.md` - Análise do problema
2. `MIGRATIONS_GUIDE.md` - Guia geral de migrations
3. `GUIA_ANALISE_DEV_VS_PROD.md` - Guia de análise

### Migration File

- `supabase/migrations/20251025185108_add_multi_store_support.sql`

### Commits

- `4555e07` - Commit que quebrou PROD
- `b31f925` - Commit estável (atual em PROD)

---

**Última Atualização**: 2025-10-30
**Autor**: Claude Code AI
**Status**: 📋 PRONTO PARA APROVAÇÃO
**Aprovação Necessária**: ✅ Cliente
