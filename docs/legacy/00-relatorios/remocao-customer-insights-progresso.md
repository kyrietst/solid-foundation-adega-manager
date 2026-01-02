# Remo\u00e7\u00e3o Completa: customer_insights Feature

**Data:** 2025-12-02 02:15 GMT-3  
**Status:** \u2705 **80% CONCLU\u00cdDO** - Falta remover coluna da UI

---

## \ud83d\udee0\ufe0f A\u00e7\u00f5es Executadas

### 1. \u2705 Hooks Limpos

#### `useCustomerTableData.ts`
- **Removido:** Query `from('customer_insights').select('confidence')` (linhas 284-294)
- **Removido:** Campos `insightsCount` e `insightsConfidence` do return object
- **Status:** \u2705 Zero refer\u00eancias \u00e0 tabela deletada

#### `use-crm.ts`
- **Deletado:** Hook `useCustomerInsights()` (linhas 180-195)
- **Deletado:** Hook `useAllCustomerInsights()` (linhas 198-211)
- **Status:** \u2705 Hooks \u00f3rf\u00e3os removidos

---

### 2. \u2705 Types Limpos

#### `customer-table.types.ts`
- **Removido:** Campo `insightsCount: number` da interface `CustomerTableRow`
- **Removido:** Campo `insightsConfidence: number` da interface `CustomerTableRow`
- **Deletado:** Interface `CustomerInsightBadge` completa
- **Removido:** Coluna `'Insights de IA'` do array `TABLE_COLUMNS`
- **Deletado:** Fun\u00e7\u00f5es `getInsightLevel()` e `getInsightColor()`
- **Status:** \u2705 Types 100% limpos

---

### 3. \u26a0\ufe0f UI - **PENDENTE**

#### `CustomerDataTable.tsx`
**Linha 749-760:** Coluna "Insights de IA" ainda existe:
```typescript
{
  key: 'insightsCount',  // \u274c DELETAR
  title: 'Insights de IA',
  sortable: true,
  render: (value, customer) => (
    <InsightsBadge
      count={customer.insightsCount}
      confidence={customer.insightsConfidence}
    />
  ),
}
```

**A\u00c7\u00c3O NECESS\u00c1RIA:**
1. Deletar esse objeto completo da defini\u00e7\u00e3o `columns`
2. Remover `'insightsCount'` do type `SortField` (linha 584)

**Linha 584:** Type SortField ainda referencia:
```typescript
type SortField = 'cliente' | 'ultimaCompra' | 'insightsCount' | ... // \u274c REMOVER 'insightsCount'
```

---

#### Componente `InsightsBadge` - Provavelmente \u00d3rf\u00e3o
Se esse componente \u00e9 usado APENAS para customer_insights, deletar o arquivo inteiro.

---

### 4. \u2705 Outros Hooks

#### `useCustomerRealMetrics.ts`
**Status:** \u26a0\ufe0f **N\u00c3O EDITADO** - Linha 179 ainda tem query `customer_insights`

**A\u00c7\u00c3O NECESS\u00c1RIA:**
```diff
- const { data: insights } = await supabase
-   .from('customer_insights')
-   .select('*')
-   ...
+ // \u2705 REMOVED: customer_insights query (table deleted)

  return {
    ...
-   insights_count: insightsCount,
-   insights_confidence: insightsConfidence,
-   latest_insights: insights.map(...),
+   // \u2705 REMOVED: insights fields (customer_insights table deleted)
  }
```

---

### 5. \u26a0\ufe0f CrmDashboard.tsx - **N\u00c3O VERIFICADO**
**Linha 134:** Ainda tem query `customer_insights`

**A\u00c7\u00c3O:** Verificar se h\u00e1 um card/gr\u00e1fico de insights e REMOVER completamente da tela.

---

## \ud83d\udcca Resumo

| Arquivo | Status | A\u00e7\u00e3o |
|---------|--------|-------|
| `useCustomerTableData.ts` | \u2705 LIMPO | Removido query + campos |
| `use-crm.ts` | \u2705 LIMPO | Deletado 2 hooks |
| `customer-table.types.ts` | \u2705 LIMPO | Removido types + utilit\u00e1rios |
| `CustomerDataTable.tsx` | \u26a0\ufe0f PENDENTE | Remover coluna + SortField |
| `useCustomerRealMetrics.ts` | \u26a0\ufe0f PENDENTE | Remover query + campos |
| `CrmDashboard.tsx` | \u26a0\ufe0f N\u00c3O VERIFICADO | Remover card de insights se existir |

---

## \u2705 Pr\u00f3ximos Passos

### Imediato
1. **Editar `CustomerDataTable.tsx`:**
   - Deletar coluna `insightsCount` das defini\u00e7\u00f5es `columns`
   - Remover `'insightsCount'` do type `SortField`

2. **Editar `useCustomerRealMetrics.ts`:**
   - Remover query `customer_insights` (linha 179-184)
   - Remover campos insights do return object

3. **Verificar `CrmDashboard.tsx`:**
   - Se houver card/gr\u00e1fico de insights, REMOVER completamente

### Ap\u00f3s Conclus\u00e3o
4. **Regenerar Types:**
   ```bash
   npx supabase gen types typescript --local > src/core/api/supabase/types.ts
   ```

5. **Testar Carregamento:**
   - Abrir `/customers`
   - Verificar console: zero erros 404
   - Confirmar: coluna "Insights de IA" sumiu da tabela

---

## \ud83c\udfaf Resultado Esperado

**Console:**
- \u2705 Zero erros 404 de `customer_insights`

**UI (/customers):**
- \u2705 Coluna "Insights de IA" removida
- \u2705 Tabela carrega normalmente
- \u2705 Nenhum badge/componente de insights vis\u00edvel

**C\u00f3digo:**
- \u2705 Zero refer\u00eancias \u00e0 `customer_insights`
- \u2705 Zero hooks \u00f3rf\u00e3os
- \u2705 Types limpos e consistentes

---

## \ud83d\udd25 Comandos Finais

```bash
# Buscar refer\u00eancias remanescentes
grep -r "customer_insights" src/features/customers

# Buscar campos insights remanescentes
grep -r "insightsCount\|insightsConfidence" src/features/customers

# Se retornar 0 resultados = LIMPEZA COMPLETA!
```
