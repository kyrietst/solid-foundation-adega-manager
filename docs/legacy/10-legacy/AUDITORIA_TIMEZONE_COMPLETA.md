# Auditoria Completa de Timezone - Sistema Adega Manager

**Data:** 19/10/2025 00:48 BRT
**Versão:** 1.1.0
**Status:** ✅ AUDITORIA CONCLUÍDA - CORREÇÕES APLICADAS
**Timezone Oficial:** America/Sao_Paulo (BRT/BRST)

---

## 📋 Sumário Executivo

Esta auditoria foi realizada após descoberta de bug crítico de timezone no sistema de vendas históricas, onde horários inseridos pelo usuário estavam sendo salvos incorretamente com 3 horas de diferença.

**Problema Identificado:**
- Usuário inseriu: `17/10/2025 10:10` (horário de Brasília)
- Sistema salvou: `2025-10-17 10:10:00+00` (UTC - **ERRADO**)
- Sistema exibiu: `17/10/2025 07:10` (conversão UTC→BRT)
- **Resultado:** Discrepância de 3 horas

**Correção Aplicada:**
- Código agora interpreta input como BRT: `2025-10-17T10:10:00-03:00`
- Converte para UTC antes de salvar: `2025-10-17T13:10:00+00`
- Display correto: `17/10/2025 10:10` ✅

---

## 🔍 Escopo da Auditoria

### 1. Vendas no Banco de Dados (DEV)

**Query Executada:**
```sql
SELECT
  id,
  created_at as utc_armazenado,
  created_at AT TIME ZONE 'America/Sao_Paulo' as horario_sao_paulo,
  EXTRACT(HOUR FROM created_at AT TIME ZONE 'America/Sao_Paulo') as hora_brt,
  total_amount,
  payment_method,
  notes
FROM sales
WHERE created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;
```

**Resultado:** ✅ **TODAS AS VENDAS ESTÃO CORRETAS**

| ID | UTC Armazenado | Horário SP | Observação |
|----|----------------|------------|------------|
| 79ac96aa... | 2025-10-17 13:10:00+00 | 2025-10-17 10:10:00 | ✅ Corrigida (venda histórica) |
| a25743a4... | 2025-10-05 14:30:00+00 | 2025-10-05 11:30:00 | ✅ Correto (3h diferença) |
| 48c138ea... | 2025-10-04 18:00:00+00 | 2025-10-04 15:00:00 | ✅ Correto |
| 0e6df054... | 2025-09-30 16:57:35+00 | 2025-09-30 13:57:35 | ✅ Correto |
| 28c67c0e... | 2025-09-24 10:20:00+00 | 2025-09-24 07:20:00 | ✅ Correto |

**Conclusão:** Banco de dados está consistente. Todas as vendas estão com timezone correto (UTC no storage, conversão correta para BRT).

---

### 2. Arquivos de Código Analisados

**Total de arquivos verificados:** 33 arquivos usando `new Date().toISOString()`

**Categorias:**
- ✅ **9 arquivos** já usam `getSaoPauloTimestamp()` (CORRETO)
- ⚠️ **24 arquivos** usam `new Date().toISOString()` (INCORRETO)
- 🧪 **Maioria são arquivos de teste** (não crítico)
- 🔴 **3 arquivos de produção** críticos (REQUEREM CORREÇÃO)

---

## 🔴 Problemas Críticos Identificados

### Problema 1: `use-sales.ts` - Filtros de Data Incorretos

**Arquivo:** `src/features/sales/hooks/use-sales.ts`
**Linhas:** 144, 150
**Impacto:** 🔴 **ALTO** - Afeta filtros de relatórios e dashboard

**Código Problemático:**
```typescript
// LINHA 144 - FILTRO DE DATA INICIAL
if (params?.startDate) {
  baseQuery = baseQuery.gte("created_at", params.startDate.toISOString());
}

// LINHA 150 - FILTRO DE DATA FINAL
if (params?.endDate) {
  const nextDay = new Date(params.endDate);
  nextDay.setDate(nextDay.getDate() + 1);
  baseQuery = baseQuery.lt("created_at", nextDay.toISOString());
}
```

**Problema:**
- Quando usuário seleciona "01/10/2025" em um filtro, o sistema usa `params.startDate.toISOString()`
- Se `params.startDate` for `new Date('2025-10-01')`, converte para `2025-10-01T00:00:00Z` (UTC)
- Mas o horário local de Brasília em 01/10 00:00 BRT é `2025-10-01T03:00:00Z` (UTC)
- **Resultado:** Filtro pega vendas de 3h antes do esperado

**Correção Necessária:**
```typescript
import { getSaoPauloTimestamp, convertToSaoPaulo } from '@/shared/utils/timezone-saopaulo';

// Converter startDate para UTC corretamente
if (params?.startDate) {
  const spDate = convertToSaoPaulo(params.startDate);
  baseQuery = baseQuery.gte("created_at", spDate.toISOString());
}

// Converter endDate para UTC corretamente
if (params?.endDate) {
  const spDate = convertToSaoPaulo(params.endDate);
  const nextDay = new Date(spDate);
  nextDay.setDate(nextDay.getDate() + 1);
  baseQuery = baseQuery.lt("created_at", nextDay.toISOString());
}
```

---

### Problema 2: `useInventoryOperations.ts` - Timestamps de Criação/Atualização

**Arquivo:** `src/features/inventory/hooks/useInventoryOperations.ts`
**Linhas:** 30, 31
**Impacto:** 🟡 **MÉDIO** - Afeta auditoria e logs de produtos

**Código Problemático:**
```typescript
// LINHAS 30-31
const { data: product, error } = await supabase
  .from('products')
  .insert({
    ...productDataWithoutStock,
    stock_quantity: 0,
    created_at: new Date().toISOString(), // ❌ ERRADO
    updated_at: new Date().toISOString(), // ❌ ERRADO
  })
  .select()
  .single();
```

**Problema:**
- Usa `new Date().toISOString()` que retorna UTC do sistema
- Se sistema executar às 10:00 BRT, salva 13:00 UTC
- Quando exibido, mostra 10:00 BRT (correto por acaso)
- **Mas se sistema rodar em servidor com timezone diferente, haverá erro**

**Correção Necessária:**
```typescript
import { getSaoPauloTimestamp } from '@/shared/utils/timezone-saopaulo';

const { data: product, error } = await supabase
  .from('products')
  .insert({
    ...productDataWithoutStock,
    stock_quantity: 0,
    created_at: getSaoPauloTimestamp(), // ✅ CORRETO
    updated_at: getSaoPauloTimestamp(), // ✅ CORRETO
  })
  .select()
  .single();
```

---

### Problema 3: `useCustomerOperations.ts` - Timestamps de Cliente

**Arquivo:** `src/features/customers/hooks/useCustomerOperations.ts`
**Linhas:** 22, 23 (create), 54 (update)
**Impacto:** 🟡 **MÉDIO** - Afeta auditoria de clientes

**Código Problemático:**
```typescript
// LINHAS 22-23 (CREATE)
const { data, error } = await supabase
  .from('customers')
  .insert({
    ...customerData,
    created_at: new Date().toISOString(), // ❌ ERRADO
    updated_at: new Date().toISOString(), // ❌ ERRADO
  })

// LINHA 54 (UPDATE)
const { data, error } = await supabase
  .from('customers')
  .update({
    ...updateData,
    updated_at: new Date().toISOString(), // ❌ ERRADO
  })
```

**Correção Necessária:**
```typescript
import { getSaoPauloTimestamp } from '@/shared/utils/timezone-saopaulo';

// CREATE
const { data, error } = await supabase
  .from('customers')
  .insert({
    ...customerData,
    created_at: getSaoPauloTimestamp(), // ✅ CORRETO
    updated_at: getSaoPauloTimestamp(), // ✅ CORRETO
  })

// UPDATE
const { data, error } = await supabase
  .from('customers')
  .update({
    ...updateData,
    updated_at: getSaoPauloTimestamp(), // ✅ CORRETO
  })
```

---

## ✅ Arquivos Já Corretos

### 1. `timezone-saopaulo.ts` - Biblioteca de Timezone

**Arquivo:** `src/shared/utils/timezone-saopaulo.ts`
**Status:** ✅ **EXCELENTE** - Documentação completa e funções corretas

**Funções Disponíveis:**
```typescript
getSaoPauloTimestamp()      // Timestamp atual em SP
convertToSaoPaulo(date)     // Converter qualquer date para SP
formatBrazilian(date)       // Formatar dd/mm/aaaa hh:mm
getSaoPauloDateRange(days)  // Criar ranges para filtros
calculateDeliveryTime(min)  // Estimar tempo de entrega
```

**Regras Documentadas:**
- ❌ NUNCA USAR: `new Date().toISOString()`
- ✅ SEMPRE USAR: `getSaoPauloTimestamp()`

---

### 2. `use-brasil-timezone.ts` - Hook de Timezone

**Arquivo:** `src/shared/hooks/common/use-brasil-timezone.ts`
**Status:** ✅ Correto (usa funções de timezone-saopaulo.ts)

---

### 3. `CustomerHistoricalSalesTab.tsx` - JÁ CORRIGIDO

**Arquivo:** `src/features/customers/components/CustomerHistoricalSalesTab.tsx`
**Linha:** 214
**Status:** ✅ **CORRIGIDO** nesta auditoria

**Antes (BUG):**
```typescript
const fullDateTime = `${saleDate}T${saleTime}:00Z`; // Tratava como UTC
```

**Depois (CORRETO):**
```typescript
const localDateTime = new Date(`${saleDate}T${saleTime}:00-03:00`); // BRT
const fullDateTime = localDateTime.toISOString(); // Converte para UTC
```

---

## 📊 Estatísticas da Auditoria

| Métrica | Valor |
|---------|-------|
| Vendas Auditadas | 8 vendas (últimos 30 dias) |
| Vendas com Timezone Correto | 8 (100%) |
| Arquivos Verificados | 33 arquivos |
| Arquivos com `new Date().toISOString()` | 24 |
| Arquivos com `getSaoPauloTimestamp()` | 9 |
| **Arquivos de Produção com Problemas** | **3** 🔴 |
| **Correções Necessárias** | **3 arquivos, 5 linhas** |

---

## 🎯 Plano de Correção

### Fase 1: Correções Críticas (IMEDIATO) ✅ CONCLUÍDA

**Ordem de Prioridade:**

1. ✅ **CustomerHistoricalSalesTab.tsx** - CORRIGIDO
2. ✅ **use-sales.ts** - Filtros de data CORRIGIDOS (v3.3.1)
3. ✅ **useInventoryOperations.ts** - Timestamps de produtos CORRIGIDOS (v3.3.1)
4. ✅ **useCustomerOperations.ts** - Timestamps de clientes CORRIGIDOS (v3.3.1)

**Status:** Todas as 4 correções críticas foram aplicadas em 19/10/2025.

### Fase 2: Validação (PÓS-CORREÇÃO) ✅ CONCLUÍDA

1. ✅ Executar `npm run lint` - PASSOU sem erros
2. ✅ Executar `npm run build` - PASSOU compilação
3. ✅ Testar filtros de data no dashboard - FUNCIONANDO
4. ✅ Testar criação de produtos - TIMESTAMPS CORRETOS
5. ✅ Testar criação de clientes - TIMESTAMPS CORRETOS
6. ✅ Verificar timestamps no banco após cada operação - VALIDADO

**Status:** Todas as validações foram realizadas com sucesso.

### Fase 3: Documentação (FINAL) ✅ CONCLUÍDA

1. ✅ Atualizar changelog v3.3.1 com correções de timezone - CRIADO
2. ✅ Criar guia de timezone para novos desenvolvedores - REFERÊNCIA EM USE_CUSTOMER_METRICS_GUIDE.md
3. ⏳ Adicionar linter rule para proibir `new Date().toISOString()` - PENDENTE (futuro)

**Status:** Documentação completa criada em `docs/07-changelog/TIMEZONE_FIX_AND_SSOT_METRICS_v3.3.1.md`

---

## 🔧 Comandos para Validação Manual

### Verificar Vendas no Banco (DEV)
```sql
SELECT
  id,
  created_at as utc,
  created_at AT TIME ZONE 'America/Sao_Paulo' as brt,
  total_amount
FROM sales
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar Produtos Recentes
```sql
SELECT
  id,
  name,
  created_at as utc,
  created_at AT TIME ZONE 'America/Sao_Paulo' as brt
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

### Verificar Clientes Recentes
```sql
SELECT
  id,
  name,
  created_at as utc,
  created_at AT TIME ZONE 'America/Sao_Paulo' as brt
FROM customers
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📝 Lições Aprendidas

### 1. Timezone Storage vs Display

**REGRA FUNDAMENTAL:**
- ✅ **Storage (banco):** SEMPRE UTC
- ✅ **Display (frontend):** SEMPRE BRT (America/Sao_Paulo)
- ✅ **Input (usuário):** Interpretar como BRT, converter para UTC

### 2. Funções Proibidas

**❌ NUNCA USAR:**
```typescript
new Date().toISOString()           // Usa timezone do sistema
date.toISOString()                 // Sem conversão explícita
new Date()                         // Para filtros de período
Date.now()                         // Para timestamps
```

**✅ SEMPRE USAR:**
```typescript
getSaoPauloTimestamp()             // Para timestamps
convertToSaoPaulo(date)            // Para conversões
getSaoPauloDateRange(days)         // Para filtros
calculateDeliveryTime(minutes)     // Para delivery
```

### 3. Offset de Brasília

**Horário de Brasília (BRT):**
- Sem horário de verão: UTC-3 (ano todo atualmente)
- Histórico: Tinha UTC-2 durante horário de verão
- ISO 8601 offset: `-03:00`

**Exemplo:**
- 10:00 BRT = 13:00 UTC
- Input: `2025-10-17T10:10:00-03:00`
- Storage: `2025-10-17T13:10:00+00`
- Display: `17/10/2025 10:10`

---

## 🚨 Alertas para Desenvolvedores

### Alerta 1: Filtros de Dashboard
Se você ver discrepâncias em relatórios (ex: vendas de "hoje" mostrando vendas de ontem à noite), **é problema de timezone**.

### Alerta 2: Timezone do Servidor
Se o sistema rodar em servidor fora do Brasil (AWS US, por exemplo), `new Date().toISOString()` retornará horário errado.

### Alerta 3: Supabase Default Timestamps
Supabase usa `now()` do PostgreSQL para colunas com default, que retorna UTC. Isso está **correto** e não deve ser mudado.

---

## 🔗 Referências

- Documentação oficial: `src/shared/utils/timezone-saopaulo.ts`
- Guia de uso: `src/shared/utils/TIMEZONE_USAGE_GUIDE.md`
- Hook helper: `src/shared/hooks/common/use-brasil-timezone.ts`
- Changelog: `docs/07-changelog/CUSTOMER_HISTORICAL_SALES_v3.3.0.md`

---

## ✅ Checklist de Conformidade

Antes de criar/modificar código que usa timestamps:

- [ ] Importei `getSaoPauloTimestamp` de timezone-saopaulo.ts?
- [ ] Estou usando `getSaoPauloTimestamp()` em vez de `new Date().toISOString()`?
- [ ] Se recebo data do usuário, estou interpretando como BRT?
- [ ] Se salvo no banco, estou convertendo para UTC?
- [ ] Se exibo para usuário, estou convertendo de UTC para BRT?
- [ ] Testei com datas de diferentes meses (considerar horário de verão histórico)?

---

## 📦 Resumo da Versão v3.3.1

**Correções Aplicadas:**
- ✅ Bug de import path em `use-sales.ts` (convertToSaoPaulo)
- ✅ Filtros de data com timezone correto
- ✅ Timestamps de produtos usando `getSaoPauloTimestamp()`
- ✅ Timestamps de clientes usando `getSaoPauloTimestamp()`
- ✅ Cache invalidation completo para KPIs do header

**Refatorações SSoT:**
- ✅ Hook centralizado `useCustomerMetrics` criado
- ✅ Hook `useCustomerProfileHeaderSSoT` refatorado (-68 linhas)
- ✅ Documentação completa criada

**Referências:**
- Changelog completo: `docs/07-changelog/TIMEZONE_FIX_AND_SSOT_METRICS_v3.3.1.md`
- Guia do hook SSoT: `docs/02-architecture/guides/USE_CUSTOMER_METRICS_GUIDE.md`
- Guia de refatoração: `docs/02-architecture/guides/SSOT_HOOKS_REFACTORING.md`

---

**Auditoria realizada por:** Claude Code AI Assistant
**Data da auditoria:** 19/10/2025 00:48 BRT
**Data da conclusão:** 19/10/2025 02:30 BRT
**Próxima auditoria recomendada:** Q1 2026 (sistema estável)
