# Auditoria de RPCs e Triggers - Plano de Limpeza

**Data:** 2025-12-01  
**Status:** ⚠️ AGUARDANDO APROVAÇÃO

---

## 📊 Resumo Executivo

O banco possui **80+ funções RPC** cadastradas. Identificamos **5 funções legadas SEM USO no código** que podem ser deletadas com segurança.

---

## 🔴 FUNÇÕES PARA DELETAR (5 total)

### Categoria: Admin Creation (Duplicatas/Legacy)

#### 1. `create_direct_admin`
- **Argumentos:** _não especificado_
- **Uso no Código:** ❌ **0 referências**
- **Status:** Apenas definição de tipo em `types.ts`
- **Veredito:** 🔴 **DROP** - Função nunca usada

```sql
DROP FUNCTION IF EXISTS create_direct_admin CASCADE;
```

---

#### 2. `setup_first_admin`
- **Argumentos:** `p_email text, p_name text`
- **Uso no Código:** ❌ **0 referências**  
- **Status:** Apenas definição de tipo em `types.ts` e `database.types.ts`
- **Veredito:** 🔴 **DROP** - Duplicata de funcionalidade (provavelmente substituída por outra função)

```sql
DROP FUNCTION IF EXISTS setup_first_admin(text, text) CASCADE;
```

---

### Categoria: Auth/Security (Legacy)

#### 3. `is_supreme_admin`
- **Argumentos:** Nenhum (`Args: never`)
- **Retorno:** `boolean`
- **Uso no Código:** ❌ **0 referências**
- **Análise:** Possível backdoor legado ou função de teste nunca removida
- **Veredito:** 🔴 **DROP** - BACKDOOR POTENCIAL, remover imediatamente

```sql
DROP FUNCTION IF EXISTS is_supreme_admin() CASCADE;
```

---

#### 4. `check_rate_limit`
- **Argumentos:** `p_email text, p_ip text`
- **Uso no Código:** ❌ **0 referências**
- **Status:** Feature de rate limiting nunca implementada no frontend
- **Veredito:** 🔴 **DROP** - Funcionalidade não utilizada

```sql
DROP FUNCTION IF EXISTS check_rate_limit(text, text) CASCADE;
```

---

#### 5. `log_auth_attempt`
- **Argumentos:** _não especificado_
- **Uso no Código:** ❌ **0 referências**
- **Status:** Logging de autenticação nunca implementado
- **Veredito:** 🔴 **DROP** - Funcionalidade não utilizada

```sqlDROP FUNCTION IF EXISTS log_auth_attempt CASCADE;
```

---

## 🟢 FUNÇÕES CONFIRMADAS EM USO (Sample)

### Core Functionality
| Função | Refs | Onde Usa |
|--------|------|----------|
| `create_inventory_movement` | **31+** | useInventoryMovements, testes, hooks |
| `process_sale` | - | use-sales (interface criada) |
| `delete_sale_with_items` | - | use-sales (interface criada) |
| `create_quick_customer` | 1 | QuickCustomerCreateModal.tsx |
| `create_historical_sale` | 1 | use-historical-sales.ts |
| `create_notification` | 1 | useNotifications.ts |
| `create_product_batch` | 1 | useBatches.ts |

### Business Logic
- `calculate_delivery_fee` - Cálculo dinâmico de taxa
- `update_delivery_status` - Sistema de delivery
- `get_delivery_metrics` - Dashboard de delivery
- `assign_delivery_person` - Atribuição de entregadores
- `validate_product_category` - Trigger de validação
- `validate_product_stock_update` - Trigger de estoque

**Todas as ~75 funções restantes devem ser MANTIDAS** (em uso ou triggers essenciais).

---

## 🟡 FUNÇÕES SUSPEITAS (Revisar Futuramente)

### Triggers de Tabelas Deletadas

#### 1. `update_delivery_zones_updated_at`
- **Análise:** Trigger para tabela `delivery_zones` que foi **DROPADA**
- **Recomendação:** 🟡 Pode ser removido (mas DROP CASCADE já tratou?)

```sql
-- Verificar se ainda existe:
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'update_delivery_zones_updated_at';

-- Se existir:
DROP FUNCTION IF EXISTS update_delivery_zones_updated_at() CASCADE;
```

---

#### 2. `update_nps_surveys_updated_at`
- **Análise:** Trigger para tabela `nps_surveys` (verificar se existe)
- **Recomendação:** 🟡 Investigar se tabela ainda existe

---

## 📋 Script SQL de Limpeza (AGUARDANDO APROVAÇÃO)

```sql
-- ==============================================
-- SCRIPT DE LIMPEZA DE RPCs LEGADAS
-- Data: 2025-12-01
-- ==============================================

-- AVISO: Execute linha por linha e verifique o output
-- Não execute tudo de uma vez sem revisão

-- 1. Admin Creation - Duplicatas
DROP FUNCTION IF EXISTS create_direct_admin CASCADE;
DROP FUNCTION IF EXISTS setup_first_admin(text, text) CASCADE;

-- 2. Auth/Security - Legacy/Backdoor
DROP FUNCTION IF EXISTS is_supreme_admin() CASCADE;
DROP FUNCTION IF EXISTS check_rate_limit(text, text) CASCADE;
DROP FUNCTION IF EXISTS log_auth_attempt CASCADE;

-- 3. Triggers de Tabelas Deletadas (Opcional)
DROP FUNCTION IF EXISTS update_delivery_zones_updated_at() CASCADE;

-- Verificação Final
SELECT COUNT(*) as functions_remaining 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public';
```

---

## ⚠️ CHECKLIST PRÉ-EXECUÇÃO

Antes de executar o script de limpeza, confirme:

- [ ] **Backup realizado** (snapshot do banco)
- [ ] **Código estava correto** (nenhuma das 5 funções tem `.rpc()` no código)
- [ ] **Types.ts será regenerado** após limpeza
- [ ] **Testes passam** no localhost antes do deploy
- [ ] **Aprovação do usuário** para executar DROP

---

## 🎯 Impacto Esperado

### Antes
- **80+ funções** no banco
- 5 funções legadas confundindo autocomplete
- Potencial backdoor (`is_supreme_admin`)

### Depois
- **~75 funções** (limpeza de ~6%)
- Autocomplete limpo
- Backdoor removido ✅
- Schema mais claro

---

## 📝 Próximos Passos

1. **AGUARDAR APROVAÇÃO** do usuário
2. Executar script SQL linha por linha
3. Regenerar `types.ts`: `npx supabase gen types typescript`
4. Verificar que testes passam
5. Deploy para produção

---

## 🚨 NOTA CRÍTICA

A função **`is_supreme_admin`** é especialmente suspeita:
- Retorna boolean sem argumentos
- Nome sugere bypass de permissões
- **ZERO uso no código**
- Possível **backdoor legado**

**RECOMENDAÇÃO URGENTE:** Dropar esta função IMEDIATAMENTE por segurança.
