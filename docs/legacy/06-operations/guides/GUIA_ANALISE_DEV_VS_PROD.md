# 🔍 GUIA: Análise Comparativa DEV vs PROD

**Versão:** 1.0.0
**Data:** 2025-10-30
**Contexto:** Preparação para migração v3.4.3 para produção
**Autor:** Claude Code AI

---

## 📋 OBJETIVO

Este guia documenta o processo de análise comparativa entre ambientes **Supabase DEV** e **Supabase PROD** para garantir migração segura de mudanças de schema, dados e configurações.

**Meta:** Criar documentação completa que permita:
1. Identificar todas as diferenças entre DEV e PROD
2. Planejar migração segura de v3.4.3
3. Minimizar riscos de downtime ou perda de dados
4. Garantir reversibilidade (rollback) em caso de problemas

---

## 🎯 ESCOPO DA ANÁLISE

### O Que Analisar

1. **Schema de Banco de Dados**
   - Tabelas (estrutura, colunas, tipos)
   - Índices e chaves
   - Constraints e triggers
   - Views e materialized views

2. **Migrations**
   - Histórico de migrations aplicadas
   - Migrations pendentes
   - Ordem de aplicação

3. **Row Level Security (RLS)**
   - Políticas existentes
   - Cobertura de segurança
   - Diferenças de implementação

4. **Stored Procedures e Functions**
   - Funções SQL customizadas
   - Triggers automáticos
   - Versões e assinaturas

5. **Dados e Volume**
   - Contagem de registros por tabela
   - Integridade referencial
   - Dados de teste vs produção

6. **Performance**
   - Índices existentes
   - Query plans
   - Estatísticas de uso

---

## 🔧 FERRAMENTAS NECESSÁRIAS

### MCP Supabase

**Ambientes configurados:**
- ✅ **DEV**: `mcp__supabase-smithery` (project-ref: goppneqeowgeehpqkcxe)
- ✅ **PROD**: `mcp__supabase-smithery` (project-ref: uujkzvbgnfzuzlztrzln)

**Ferramentas MCP disponíveis:**
- `execute_sql` - Executar queries SQL
- `list_tables` - Listar tabelas
- `list_migrations` - Listar migrations aplicadas
- `get_advisors` - Verificar recomendações de segurança/performance

---

## 📊 QUERIES DE ANÁLISE

### 1. Análise de Schema

#### 1.1 Listar Todas as Tabelas

```sql
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;
```

**Executar em:** DEV e PROD
**Objetivo:** Identificar tabelas presentes/ausentes em cada ambiente

---

#### 1.2 Estrutura Detalhada de Tabela

```sql
SELECT
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'products'
ORDER BY c.ordinal_position;
```

**Executar em:** DEV e PROD para cada tabela crítica
**Tabelas críticas:**
- `products`
- `store_transfers` (nova em v3.4.0)
- `sales`
- `customers`
- `users`

---

#### 1.3 Índices Existentes

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Executar em:** DEV e PROD
**Objetivo:** Validar índices de performance

---

#### 1.4 Constraints e Chaves

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
```

**Executar em:** DEV e PROD
**Objetivo:** Validar integridade referencial

---

### 2. Análise de Migrations

#### 2.1 Migrations Aplicadas

```sql
SELECT
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version;
```

**Executar em:** DEV e PROD
**Objetivo:** Identificar migrations pendentes em PROD

---

#### 2.2 Última Migration

```sql
SELECT
  version,
  name,
  executed_at
FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 1;
```

**Executar em:** DEV e PROD
**Objetivo:** Confirmar versão atual de cada ambiente

---

### 3. Análise de RLS (Row Level Security)

#### 3.1 Tabelas com RLS Habilitado

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Executar em:** DEV e PROD
**Objetivo:** Identificar tabelas sem RLS (risco de segurança)

---

#### 3.2 Políticas RLS por Tabela

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Executar em:** DEV e PROD
**Objetivo:** Comparar políticas de segurança

---

#### 3.3 Contagem de Políticas

```sql
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Executar em:** DEV e PROD
**Objetivo:** Score de segurança rápido

---

### 4. Análise de Dados

#### 4.1 Contagem de Registros

```sql
SELECT
  'products' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active_rows,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_rows
FROM products

UNION ALL

SELECT
  'store_transfers',
  COUNT(*),
  COUNT(*) FILTER (WHERE to_store = 1),
  COUNT(*) FILTER (WHERE to_store = 2)
FROM store_transfers

UNION ALL

SELECT
  'sales',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'completed'),
  COUNT(*) FILTER (WHERE status != 'completed')
FROM sales

UNION ALL

SELECT
  'customers',
  COUNT(*),
  COUNT(*) FILTER (WHERE deleted_at IS NULL),
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)
FROM customers;
```

**Executar em:** DEV e PROD
**Objetivo:** Comparar volume de dados

---

#### 4.2 Produtos Multi-Store (Crítico para v3.4.3)

```sql
SELECT
  COUNT(*) as total_products,
  COUNT(*) FILTER (WHERE store1_stock_packages > 0 OR store1_stock_units_loose > 0) as products_with_store1_stock,
  COUNT(*) FILTER (WHERE store2_stock_packages > 0 OR store2_stock_units_loose > 0) as products_with_store2_stock,
  COUNT(DISTINCT st.product_id) as products_transferred_to_store2
FROM products p
LEFT JOIN store_transfers st ON p.id = st.product_id AND st.to_store = 2
WHERE p.deleted_at IS NULL;
```

**Executar em:** DEV e PROD
**Objetivo:** Validar estado do sistema multi-store

---

#### 4.3 Transferências por Loja

```sql
SELECT
  from_store,
  to_store,
  COUNT(*) as transfer_count,
  SUM(packages) as total_packages,
  SUM(units_loose) as total_units
FROM store_transfers
GROUP BY from_store, to_store
ORDER BY from_store, to_store;
```

**Executar em:** DEV e PROD (se tabela existir)
**Objetivo:** Entender padrão de transferências

---

### 5. Análise de Performance

#### 5.1 Tamanho das Tabelas

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Executar em:** DEV e PROD
**Objetivo:** Identificar tabelas grandes (risco de performance)

---

#### 5.2 Índices Não Utilizados

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Executar em:** PROD
**Objetivo:** Identificar índices desnecessários

---

### 6. Análise de Stored Procedures

#### 6.1 Listar Functions

```sql
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY p.proname;
```

**Executar em:** DEV e PROD
**Objetivo:** Comparar functions customizadas

---

#### 6.2 Triggers Ativos

```sql
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

**Executar em:** DEV e PROD
**Objetivo:** Validar automações

---

## 📝 DOCUMENTAÇÃO A CRIAR

### Documento 1: Estado DEV

**Nome:** `SUPABASE_DEV_STATE_v3.4.3.md`

**Conteúdo:**
- Resumo executivo
- Schema completo
- Migrations aplicadas (lista completa)
- RLS policies (todas as tabelas)
- Dados e volume
- Functions e triggers
- Índices de performance
- Recomendações de segurança (via get_advisors)

---

### Documento 2: Estado PROD

**Nome:** `SUPABASE_PROD_STATE_v3.4.3.md`

**Conteúdo:**
- Mesmo formato que DEV
- Foco em dados de produção (925+ registros)
- Histórico de migrations
- Performance atual

---

### Documento 3: Comparação

**Nome:** `SUPABASE_DEV_VS_PROD_COMPARISON.md`

**Conteúdo:**
- Tabela comparativa lado a lado
- Diferenças críticas destacadas
- Migrations pendentes em PROD
- Dados que serão afetados
- Riscos identificados

**Formato sugerido:**
| Aspecto | DEV | PROD | Status |
|---------|-----|------|--------|
| Migration 20251025000000 | ✅ Aplicada | ❌ Pendente | 🔴 Crítico |
| Tabela store_transfers | ✅ Existe | ❌ Não existe | 🔴 Bloqueante |
| RLS em products | ✅ 15 policies | ⚠️ 12 policies | 🟡 Atenção |

---

### Documento 4: Plano de Migração

**Nome:** `MIGRATION_PLAN_v3.4.3_TO_PROD.md`

**Conteúdo:**
1. **Pré-requisitos**
   - Backup completo de PROD
   - Janela de manutenção agendada
   - Validações de integridade

2. **Passos de Execução**
   - Ordem de migrations
   - Scripts SQL a executar
   - Validações intermediárias

3. **Testes Pós-Migração**
   - Queries de validação
   - Testes funcionais críticos
   - Performance checks

4. **Plano de Rollback**
   - Condições de aborto
   - Passos de reversão
   - Restauração de backup

5. **Monitoramento**
   - Métricas a acompanhar
   - Alertas configurados
   - Logs a revisar

---

## ⚠️ RISCOS IDENTIFICADOS

### Risco 1: Tabela store_transfers Não Existe em PROD

**Severidade:** 🔴 Crítica
**Impacto:** v3.4.3 depende desta tabela
**Mitigação:**
- Migration 20251025000000 deve ser aplicada primeiro
- Validar criação bem-sucedida antes de prosseguir

---

### Risco 2: Dados de Produção (925+ Registros)

**Severidade:** 🔴 Crítica
**Impacto:** Qualquer erro afeta operações reais
**Mitigação:**
- Backup completo OBRIGATÓRIO
- Testar migration em cópia de PROD primeiro
- Rollback plan documentado

---

### Risco 3: Downtime Durante Migração

**Severidade:** 🟡 Média
**Impacto:** Sistema indisponível temporariamente
**Mitigação:**
- Janela de manutenção em horário de baixo uso
- Comunicação prévia com usuários
- Migrations rápidas (<5 min cada)

---

### Risco 4: Inconsistência de RLS

**Severidade:** 🔴 Crítica
**Impacto:** Risco de segurança
**Mitigação:**
- Comparar políticas RLS antes da migração
- Validar acesso após migração
- Teste de diferentes roles

---

## ✅ CHECKLIST DE ANÁLISE

### Fase 1: Preparação
- [ ] Acesso a Supabase DEV confirmado
- [ ] Acesso a Supabase PROD confirmado
- [ ] MCP tools validadas (execute_sql, list_tables, etc.)
- [ ] Documentos template criados

### Fase 2: Coleta de Dados DEV
- [ ] Schema completo extraído
- [ ] Migrations listadas
- [ ] RLS policies documentadas
- [ ] Contagem de registros obtida
- [ ] Functions e triggers listados
- [ ] Índices documentados
- [ ] Advisors executados

### Fase 3: Coleta de Dados PROD
- [ ] Schema completo extraído
- [ ] Migrations listadas
- [ ] RLS policies documentadas
- [ ] Contagem de registros obtida (925+)
- [ ] Functions e triggers listados
- [ ] Índices documentados
- [ ] Advisors executados

### Fase 4: Comparação
- [ ] Tabelas comparadas (presença/ausência)
- [ ] Colunas comparadas (tipos, nullable, defaults)
- [ ] Migrations comparadas (aplicadas vs pendentes)
- [ ] RLS comparado (cobertura e políticas)
- [ ] Dados comparados (volume e integridade)
- [ ] Performance comparada (índices e query plans)

### Fase 5: Documentação
- [ ] `SUPABASE_DEV_STATE_v3.4.3.md` criado
- [ ] `SUPABASE_PROD_STATE_v3.4.3.md` criado
- [ ] `SUPABASE_DEV_VS_PROD_COMPARISON.md` criado
- [ ] `MIGRATION_PLAN_v3.4.3_TO_PROD.md` criado

### Fase 6: Revisão
- [ ] Documentos revisados por desenvolvedor
- [ ] Riscos identificados e documentados
- [ ] Plano de rollback validado
- [ ] Aprovação de cliente obtida
- [ ] Janela de manutenção agendada

---

## 🎯 CRITÉRIOS DE SUCESSO

**Análise considerada completa quando:**

1. ✅ Todos os 4 documentos criados
2. ✅ Todas as queries executadas em ambos os ambientes
3. ✅ Diferenças críticas identificadas e documentadas
4. ✅ Plano de migração detalhado e revisado
5. ✅ Rollback plan documentado e testável
6. ✅ Riscos mitigados ou com plano de contingência
7. ✅ Cliente revisou e aprovou documentação

---

## 📚 REFERÊNCIAS

### Documentação Relacionada

1. `docs/07-changelog/CHANGELOG_v3.4.3.md` - Mudanças de v3.4.3
2. `docs/07-changelog/FEATURE_FILTRO_LOJA2_v3.4.3.md` - Feature detalhada
3. `docs/06-operations/guides/MIGRATIONS_GUIDE.md` - Guia de migrations
4. `docs/09-api/MCP_SUPABASE_COMPARISON.md` - MCP tools disponíveis

### Migrations Relevantes

- `20251025000000_add_multi_store_support.sql` - Sistema multi-store (v3.4.0)
- `20251029221031_remove_orphan_tables_and_functions.sql` - Limpeza (v3.4.2)
- Futuras migrations de v3.4.3 (se necessário)

---

**Última Atualização**: 2025-10-30
**Autor**: Claude Code AI
**Status**: 📋 GUIA PRONTO - Aguardando Execução
**Próximo Passo**: Iniciar Fase 1 (Preparação) e Fase 2 (Coleta DEV)
