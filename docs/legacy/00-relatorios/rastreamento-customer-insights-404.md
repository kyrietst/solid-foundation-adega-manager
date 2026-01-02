# Rastreamento: Erro 404 customer_insights

**Data:** 2025-12-02 02:07 GMT-3  
**Tabela Deletada:** `customer_insights`

---

## 🔴 Arquivos com Referências Broken

### 1. ✅ **useCustomerTableData.ts** (CRÍTICO)
**Linha:** 286-287

```typescript
const { data: insightsData } = await supabase
  .from('customer_insights')  // ❌ TABELA DELETADA
  .select('confidence')
  .eq('customer_id', customer.id)
  .eq('is_active', true);
```

**Contexto:** Função `fetchCustomerTableDataFallback` - calcula insights count e confidence média

---

### 2. ✅ **useCustomerRealMetrics.ts**
**Linha:** 179-184

```typescript
const { data: insights } = await supabase
  .from('customer_insights')  // ❌ TABELA DELETADA
  .select('*')
  .eq('customer_id', customerId)
  .eq('is_active', true)
```

**Contexto:** Função `calculateCustomerMetricsManual` - busca últimos 5 insights ativos

---

### 3. ✅ **use-crm.ts** (2 ocorrências)
**Linhas:** 185, 203

```typescript
// Hook: useCustomerInsights
.from('customer_insights')  // ❌ TABELA DELETADA

// Hook: useAllCustomerInsights  
.from('customer_insights')  // ❌ TABELA DELETADA
```

**Contexto:** 2 hooks exportados que buscam insights de clientes

---

### 4. ✅ **CrmDashboard.tsx**
**Linha:** 134

```typescript
.from('customer_insights')  // ❌ TABELA DELETADA
```

**Contexto:** Componente dashboard CRM

---

## 📊 Resumo

| Arquivo | Ocorrências | Tipo |
|---------|-------------|------|
| `useCustomerTableData.ts` | 1 | Query na função fallback |
| `useCustomerRealMetrics.ts` | 1 | Query manual metrics |
| `use-crm.ts` | 2 | 2 hooks exportados |
| `CrmDashboard.tsx` | 1 | Componente |
| **TOTAL** | **5** | - |

---

## ⚠️ Impacto

**Severidade:** 🔴 **ALTA**
- Página de Clientes (/customers) quebrada
- Erro 404 repetido no console
- Tabela de clientes não carrega corretamente

**Causa:** Tabela `customer_insights` foi deletada mas código ainda tenta acessá-la

---

## ✅ Ação Recomendada

### Opção A: Remover Completamente
Deletar todas as 5 referências e retornar valores default:
- `insightsCount = 0`
- `insightsConfidence = 0`
- `latest_insights = []`

### Opção B: Comentar Queries
Comentar queries mas manter estrutura de dados (valores zerados)

**Qual opção executar?**
