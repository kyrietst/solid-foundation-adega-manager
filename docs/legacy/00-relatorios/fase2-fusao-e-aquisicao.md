# FASE 2: Plano de Fusão e Aquisição - Duplicidade Lógica

**Data:** 2025-12-02 00:10 GMT-3  
**Funções Atuais:** 73  
**Meta Final:** <50

---

## 🚨 ALERTA CRÍTICO: CÓDIGO QUEBRADO!

**DESCOBERTA URGENTE:** Algumas funções foram dropadas na Fase 1 mas **AINDA ESTÃO SENDO USADAS**!

### 🔴 Funções INEXISTENTES mas Em Uso

#### 1. `change_password_unified` ⚠️ **CRITICAL**
- **Status:** DROPADA na Fase 1 (Kill Set 6)
- **Uso Ativo:** ✅ `ChangeTemporaryPasswordModal.tsx:122`
- **Severidade:** 🔴 **QUEBRA EM PRODUÇÃO**
- **Ação Imediata:** **RECRIAR** esta função OU refatorar para usar Supabase Auth nativo

```typescript
// USO ATUAL (QUEBRADO):
const { data, error } = await supabase.rpc('change_password_unified', {
  current_password, new_password
});
```

**Recomendação:** Usar `supabase.auth.updateUser({ password: newPassword })` do Supabase nativo

---

#### 2. `adjust_product_stock` ⚠️ **CRITICAL**
- **Status:** DROPADA na Fase 1 (Kill Set 6)
- **Uso Ativo:** ✅ `useSalesErrorRecovery.ts:111`
- **Severidade:** 🔴 **QUEBRA EM PRODUÇÃO**
- **Ação Imediata:** **RECRIAR** OU migrar para `create_inventory_movement`

```typescript
// USO ATUAL (QUEBRADO):
supabase.rpc('adjust_product_stock', { ... });
```

**Recomendação:** Substituir com `create_inventory_movement`

---

#### 3. `adjust_variant_stock` ⚠️ **UNKNOWN**
- **Uso:** ✅ `InventoryManagement.tsx:232`
- **Status:** Desconhecido (precisa verificar se existe)

```typescript
.rpc('adjust_variant_stock', { ... });
```

---

#### 4. `get_available_delivery_persons` ⚠️ **UNKNOWN**
- **Uso:** ✅ `DeliveryAssignmentModal.tsx:65`
- **Status:** Desconhecido (precisa verificar se existe)

---

#### 5. `get_total_inventory_valuation` ⚠️ **UNKNOWN**
- **Uso:** ✅ `useInventoryHealth.ts:57`
- **Status:** Desconhecido (precisa verificar se existe)

---

## 🟡 FUNÇÕES NUNCA USADAS (Candidatas para DROP)

### Categoria: KPI/Metrics Órfãos

#### 1. `get_sales_metrics` - 🔴 DROP
- **Argumentos:** `(start_date, end_date)`
- **Uso no Código:** ❌ **0 referências**
- **Lógica:** Query simples de `sales` para revenue/total/avg
- **Veredito:** 🔴 **DROP** - Nunca foi usada

```sql
DROP FUNCTION IF EXISTS get_sales_metrics(timestamp with time zone, timestamp with time zone) CASCADE;
```

---

#### 2. `get_financial_metrics` - 🔴 DROP
- **Uso no Código:** ❌ **0 referências**
- **Veredito:** 🔴 **DROP** - Nunca foi usada

```sql
DROP FUNCTION IF EXISTS get_financial_metrics CASCADE;
```

---

#### 3. `get_dashboard_data` - 🔴 DROP
- **Uso no Código:** ❌ **0 referências**
- **Veredito:** 🔴 **DROP** - Nunca foi usada

```sql
DROP FUNCTION IF EXISTS get_dashboard_data CASCADE;
```

---

## 🟡 DUPLICATAS LÓGICAS (Overloads Desnecessários)

### Grupo 1: `get_deleted_customers` (2 overloads)

#### Overload A: Por Paginação
```sql
get_deleted_customers(p_limit integer, p_offset integer)
-- Retorna lista paginada de todos os clientes deletados
```

#### Overload B: Por User
```sql
get_deleted_customers(p_user_id uuid)
-- Retorna clientes deletados por um usuário específico
```

**Uso no Código:** ❌ **0 referências** para ambos

**Veredito:** 🔴 **DROP AMBOS** - Feature não é usada

```sql
DROP FUNCTION IF EXISTS get_deleted_customers(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_deleted_customers(uuid) CASCADE;
```

---

### Grupo 2: `get_delivery_vs_instore_comparison` (2 overloads)

#### Overload A: Por Dias
```sql
get_delivery_vs_instore_comparison(p_days integer)
-- Compara últimos N dias
```

#### Overload B: Por Range
```sql
get_delivery_vs_instore_comparison(p_start_date timestamp, p_end_date timestamp)
-- Compara período específico
```

**Uso no Código:** ✅ **1 referência** - `DeliveryPerformanceDashboard.tsx:64`

**Implementação Atual:**
```typescript
const {data, error} = await supabase.rpc('get_delivery_vs_instore_comparison', {
  p_days: 30
});
```

**Veredito:** 
- 🟢 **MANTER** Overload A (por dias) - EM USO
- 🔴 **DROP** Overload B (timestamp) - NÃO USADO

```sql
DROP FUNCTION IF EXISTS get_delivery_vs_instore_comparison(timestamp with time zone, timestamp with time zone) CASCADE;
-- MANTER: get_delivery_vs_instore_comparison(integer)
```

---

### Grupo 3: `get_top_products` (Duplicata Detectada)

**Aparece 2x na lista de 73 funções** - Provavelmente overload

**Uso no Código:** Precisa verificar qual assinatura é usada

**Ação:** 🟡 INVESTIGAR overloads e dropar não usado

---

## 🟢 FUNÇÕES EM USO (Manter)

### Core Business (Confirmado em Uso)
| Função | Refs | Status |
|--------|------|--------|
| `process_sale` | 3+ | 🟢 ESSENCIAL |
| `create_inventory_movement` | 30+ | 🟢 ESSENCIAL |
| `create_quick_customer` | 1 | 🟢 MANTER |
| `create_notification` | 1 | 🟢 MANTER |
| `calculate_delivery_fee` | 1 | 🟢 MANTER |
| `update_delivery_status` | 1 | 🟢 MANTER |
| `get_delivery_metrics` | 1 | 🟢 MANTER |
| `set_product_stock_absolute` | 1 | 🟢 MANTER |
| `transfer_to_store2_holding` | 1 | 🟢 MANTER |
| `get_low_stock_products` | 1 | 🟢 MANTER |

### Analytics/Reports (Em Uso)
| Função | Refs | Status |
|--------|------|--------|
| `get_delivery_vs_instore_comparison` | 1 | 🟢 MANTER (1 overload) |
| `get_delivery_trends` | 1 | 🟢 MANTER |
| `get_daily_cash_flow` | 1 | 🟢 MANTER |
| `get_customer_summary` | 1 | 🟢 MANTER |
| `get_customer_retention` | 1 | 🟢 MANTER |
| `get_top_customers` | 1 | 🟢 MANTER |
| `get_customer_table_data` | 1 | 🟢 MANTER |
| `get_customer_real_metrics` | 1 | 🟢 MANTER |

---

## 📊 PLANO DE AÇÃO FASE 2

### URGENTE: Corrigir Código Quebrado (Prioridade 1)

#### Opção A: Recriar Funções Dropadas
```sql
-- Recriar change_password_unified
CREATE OR REPLACE FUNCTION change_password_unified(...)
RETURNS Json AS $$ ... $$;

-- Recriar adjust_product_stock  
CREATE OR REPLACE FUNCTION adjust_product_stock()
RETURNS trigger AS $$ ... $$;
```

#### Opção B: Refatorar Código (RECOMENDADO)
1. **`change_password_unified`** → Usar `supabase.auth.updateUser()`
2. **`adjust_product_stock`** → Usar `create_inventory_movement`

**Recomendação:** **OPÇÃO B** - Modernizar código

---

### DROP Seguro: Funções Órfãs (Prioridade 2)

```sql
-- KPI/Metrics Nunca Usados
DROP FUNCTION IF EXISTS get_sales_metrics(timestamp with time zone, timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS get_financial_metrics CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_data CASCADE;

-- Deleted Customers (Feature não usada)
DROP FUNCTION IF EXISTS get_deleted_customers(integer, integer) CASCADE;
DROP FUNCTION IF EXISTS get_deleted_customers(uuid) CASCADE;

-- Delivery Comparison Overload
DROP FUNCTION IF EXISTS get_delivery_vs_instore_comparison(timestamp with time zone, timestamp with time zone) CASCADE;
```

**Total a Dropar:** ~6 funções

---

### Investigar Overloads (Prioridade 3)

1. **`get_top_products`** - 2 entries (verificar overloads)
2. **`get_available_delivery_persons`** - Verificar se existe
3. **`adjust_variant_stock`** - Verificar se existe
4. **`get_total_inventory_valuation`** - Verificar se existe

---

## 📈 PROJEÇÃO DE RESULTADOS

| Métrica | Atual | Após Corrigir Quebrados | Após DROP Órfãos | Final |
|---------|-------|-------------------------|------------------|-------|
| Funções Totais | 73 | 75 (+2 recriadas) | **69** (-6) | ~65-67 |
| Código Quebrado | 2+ | **0** ✅ | 0 | 0 |
| Funções Órfãs | 6+ | 6+ | **0** ✅ | 0 |

---

## ⚠️ RECOMENDAÇÃO FINAL

### ANTES de executar Fase 2:

1. **🔴 CRITICAL:** Corrigir código quebrado
   - Refatorar `ChangeTemporaryPasswordModal.tsx`
   - Refatorar `useSalesErrorRecovery.ts`

2. **🟡 Verificar funções desconhecidas:**
   - `adjust_variant_stock`
   - `get_available_delivery_persons`
   - `get_total_inventory_valuation`

3. **🟢 Após correções:** Executar DROP de órfãos (6 funções)

### Resultado Esperado:
- ✅ Código 100% funcional
- ✅ ~65-67 funções (redução de 8-10)
- ✅ Zero código quebrado
- ✅ Apenas funções essenciais/usadas

---

## 🎯 PRÓXIMO PASSO

**AGUARDANDO DECISÃO DO USUÁRIO:**

1. **Opção A:** Recriar `change_password_unified` e `adjust_product_stock`
2. **Opção B:** Refatorar código para usar funções modernas (RECOMENDADO)

Após decisão, executar DROP de órfãos e chegar a ~65 funções.
