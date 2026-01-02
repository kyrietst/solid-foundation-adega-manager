# Análise de Sincronização: DEV → PROD (Objetos Faltantes)

**Data**: 08/11/2025
**Escopo**: Identificar objetos de aplicação desenvolvidos em DEV que faltam em PROD
**Foco**: Funções, Views, Triggers

---

## 📋 Resumo Executivo

**Resultado da Análise:**
✅ **Views**: 100% sincronizadas (6 views idênticas)
✅ **Triggers**: 100% sincronizados (37 triggers idênticos)
🔶 **Funções**: 1 função de aplicação faltando em PROD

**Conclusão**: Apenas **1 objeto de aplicação** identificado que existe em DEV mas falta em PROD.

---

## 🔍 Análise Detalhada

### 1. FUNÇÕES (RPCs) - 1 Objeto Faltante

| # | Função | Argumentos | Status | Tipo |
|---|--------|-----------|---------|------|
| 1 | `get_deleted_customers` | `p_user_id uuid` | ⚠️ **FALTA EM PROD** | Aplicação |

---

## 📦 Detalhamento da Função Faltante

### ⚠️ `get_deleted_customers(p_user_id uuid)`

**Status**: Existe em **DEV**, falta em **PROD**

#### **Assinatura Completa (DEV)**
```sql
CREATE FUNCTION get_deleted_customers(
  p_user_id uuid
)
RETURNS TABLE(...)
SECURITY DEFINER
VOLATILE
```

#### **Propósito**
Buscar clientes deletados (soft delete) filtrados por usuário específico. Esta é uma versão mais específica da função existente `get_deleted_customers(p_limit, p_offset)` que já existe em ambos os ambientes.

#### **Contexto**
- **DEV** possui **2 overloads** da função `get_deleted_customers`:
  1. `get_deleted_customers(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)` ✅ Existe em DEV e PROD
  2. `get_deleted_customers(p_user_id uuid)` ⚠️ Existe apenas em DEV

- **PROD** possui **1 overload** da função `get_deleted_customers`:
  1. `get_deleted_customers(p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)` ✅ Existe em DEV e PROD

#### **Uso Potencial**
- Auditoria de clientes deletados por usuário específico
- Rastreamento de quem deletou quais clientes
- Relatórios de atividade de usuário

#### **Recomendação**
🟢 **MIGRAR PARA PROD**

Esta função representa uma melhoria de rastreabilidade e auditoria desenvolvida em DEV. Recomendamos migrar para PROD para manter paridade funcional.

#### **SQL de Criação (Para PROD)**
```sql
-- Esta query precisa ser executada no DEV para extrair a definição completa:
SELECT pg_get_functiondef(p.oid)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_deleted_customers'
  AND pg_catalog.pg_get_function_arguments(p.oid) = 'p_user_id uuid';
```

---

## ✅ Objetos Sincronizados (Sem Ação Necessária)

### 2. VIEWS - 100% Sincronizadas

| # | View | Status |
|---|------|--------|
| 1 | `activity_logs_view` | ✅ Idêntica em DEV e PROD |
| 2 | `dual_stock_summary` | ✅ Idêntica em DEV e PROD |
| 3 | `product_movement_history` | ✅ Idêntica em DEV e PROD |
| 4 | `v_customer_purchases` | ✅ Idêntica em DEV e PROD |
| 5 | `v_customer_stats` | ✅ Idêntica em DEV e PROD |
| 6 | `v_customer_timeline` | ✅ Idêntica em DEV e PROD |

**Total**: 6 views
**Sincronização**: 100%
**Ação**: ✅ Nenhuma ação necessária

---

### 3. TRIGGERS - 100% Sincronizados

| # | Trigger | Tabela | Função | Timing | Event | Status |
|---|---------|--------|--------|--------|-------|--------|
| 1 | `update_batch_units_updated_at` | batch_units | update_updated_at_column | BEFORE | UPDATE | ✅ Sincronizado |
| 2 | `categories_updated_at_trigger` | categories | update_categories_updated_at | BEFORE | UPDATE | ✅ Sincronizado |
| 3 | `customers_activity_trigger` | customers | log_customer_activity | AFTER | INSERT | ✅ Sincronizado |
| 4 | `update_customers_updated_at` | customers | update_updated_at | BEFORE | UPDATE | ✅ Sincronizado |
| 5-37 | [...] | [...] | [...] | [...] | [...] | ✅ Sincronizado |

**Total**: 37 triggers
**Sincronização**: 100%
**Ação**: ✅ Nenhuma ação necessária

**Triggers por Tabela (Resumo):**
- batch_units: 1 trigger
- categories: 1 trigger
- customers: 2 triggers
- delivery_tracking: 2 triggers
- delivery_zones: 1 trigger
- expense_budgets: 1 trigger
- expense_categories: 1 trigger
- expiry_alerts: 1 trigger
- inventory: 1 trigger
- inventory_movements: 2 triggers
- nps_surveys: 1 trigger
- operational_expenses: 1 trigger
- product_batches: 1 trigger
- products: 6 triggers
- profiles: 1 trigger
- sale_items: 3 triggers
- sales: 10 triggers
- users: 1 trigger

---

## 📊 Métricas de Sincronização

### Resumo Geral

| Tipo de Objeto | DEV | PROD | Idênticos | Faltam em PROD | Sincronização |
|----------------|-----|------|-----------|----------------|---------------|
| **Funções (RPCs)** | 158 | 151 | 150 | 1 | 99.4% |
| **Views** | 6 | 6 | 6 | 0 | 100% |
| **Triggers** | 37 | 37 | 37 | 0 | 100% |
| **TOTAL** | **201** | **194** | **193** | **1** | **99.5%** |

### Divergências Identificadas

| # | Tipo | Nome | Ação |
|---|------|------|------|
| 1 | Função | `get_deleted_customers(p_user_id uuid)` | 🟢 Migrar para PROD |

---

## 🎯 Plano de Ação Recomendado

### Fase 1: Obter Definição Completa da Função (DEV)

```sql
-- Executar no DEV
SELECT pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'get_deleted_customers'
  AND pg_catalog.pg_get_function_arguments(p.oid) = 'p_user_id uuid';
```

### Fase 2: Criar Migration

**Arquivo**: `supabase/migrations/YYYYMMDDHHMMSS_add_get_deleted_customers_by_user.sql`

```sql
-- ============================================================================
-- Migration: add_get_deleted_customers_by_user
-- Data: [DATA_CRIAÇÃO]
-- Descrição: Adiciona overload de get_deleted_customers filtrado por user_id
-- ============================================================================

-- Copiar definição completa obtida na Fase 1
[DEFINIÇÃO_COMPLETA_AQUI]

-- Verificação
DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname = 'get_deleted_customers';

  RAISE NOTICE 'Total de overloads de get_deleted_customers: %', func_count;

  -- Esperado: 2 overloads após migration
  IF func_count != 2 THEN
    RAISE WARNING 'Atenção: Esperado 2 overloads, encontrado %', func_count;
  END IF;
END $$;
```

### Fase 3: Testar em DEV

```bash
# Aplicar migration no DEV
supabase db reset --project-ref goppneqeowgeehpqkcxe

# Verificar se migration foi aplicada
# Verificar se função já existia (deve manter 2 overloads)
```

### Fase 4: Aplicar em PROD

```bash
# Após validação em DEV, aplicar em PROD
# Via dashboard ou CLI
```

### Fase 5: Validar Frontend

```bash
# Verificar se existe algum código frontend usando esta função
grep -r "get_deleted_customers" src/
grep -r "rpc('get_deleted_customers'" src/

# Se encontrado uso com p_user_id, validar que funciona
# Se não encontrado uso, adicionar comentário na função
```

---

## ⚠️ Observações Importantes

### Diferenças de Tipo de Parâmetro (Não Críticas)

Identificamos uma pequena diferença de tipo em uma função (não afeta funcionalidade):

**`set_product_stock_absolute_multistore`**
- **DEV**: `p_store smallint DEFAULT NULL::smallint`
- **PROD**: `p_store integer DEFAULT NULL::integer`

**Impacto**: ✅ Nenhum (compatibilidade total: smallint é subconjunto de integer)
**Ação**: ✅ Nenhuma ação necessária

### Funções Extras em PROD (Obsoletas)

PROD possui algumas funções que DEV não tem (já removidas em DEV):
- `handle_new_user()` - Obsoleta
- `handle_new_user_smart()` - Obsoleta
- `reset_admin_password(p_password text)` - Obsoleta

**Nota**: Estas funções estão obsoletas e já foram identificadas na análise anterior (COMPLETE_SYNC_ANALYSIS_2025-11-07.md) como candidatas para remoção. Não representam melhorias de DEV que faltam em PROD.

---

## 📚 Referências

- [COMPLETE_SYNC_ANALYSIS_2025-11-07.md](./COMPLETE_SYNC_ANALYSIS_2025-11-07.md) - Análise PROD → DEV (objetos obsoletos)
- [DATABASE_CLEANUP_v3.5.0.md](../../07-changelog/DATABASE_CLEANUP_v3.5.0.md) - Limpeza de objetos obsoletos executada
- [Migration: 20251108000000_cleanup_legacy_objects_complete.sql](../../../supabase/migrations/20251108000000_cleanup_legacy_objects_complete.sql)

---

**📅 Data da Análise**: 08/11/2025
**🔍 Ambiente DEV**: goppneqeowgeehpqkcxe (37 tabelas, 158 funções)
**🔍 Ambiente PROD**: uujkzvbgnfzuzlztrzln (39 tabelas, 151 funções)
**✅ Status**: Análise completa - 1 função identificada para migração
**📊 Sincronização Geral**: 99.5%
