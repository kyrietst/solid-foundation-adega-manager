# 🐛 Bugfix: Filtro "Todos" no Histórico de Compras

**Data**: 09/11/2025
**Severidade**: Média
**Componente**: Customer Purchase History Tab
**Status**: ✅ **CORRIGIDO**

---

## 📋 Descrição do Bug

### Sintoma
Ao navegar para o perfil do cliente → aba "Histórico de Compra & Financeiro":
1. ✅ Histórico carrega corretamente ao abrir a aba
2. ✅ Filtros de período (1 ano, 6 meses, 3 meses, 30 dias) funcionam
3. ❌ Ao clicar em "Todos" → aparece mensagem "Este cliente não realizou compras"
4. ❌ Depois disso, nenhum filtro funciona mais (estado quebrado persiste)

### Impacto
- Usuários não conseguem voltar a ver todas as compras após filtrar por período
- Interface entra em estado quebrado sem forma de recuperação
- Mensagem confusa mostrada ("não realizou compras" quando deveria ser "filtros aplicados")

---

## 🔍 Causa Raiz

### Bug 1: Lógica `isFiltered` Incorreta

**Arquivo**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts` (linha 515)

**Código Bugado**:
```typescript
const isFiltered = searchTerm !== '' || periodFilter !== 'all';
// ❌ Falta verificar productSearchTerm!
```

**Problema**:
- A variável `isFiltered` determina qual mensagem mostrar quando não há compras:
  - `isFiltered = true` → "Nenhuma compra encontrada com os filtros aplicados" ✅
  - `isFiltered = false` → "Este cliente não realizou compras" ❌
- Quando usuário faz busca por produto (`productSearchTerm`), depois clica em "Todos":
  - `periodFilter = 'all'` (filtro de período desativado)
  - `searchTerm = ''` (busca de texto vazia)
  - **MAS** `productSearchTerm` ainda está ativo com valor da busca anterior!
  - Query retorna vazio (filtrando por produto que não existe)
  - `isFiltered = false` (porque não verifica `productSearchTerm`)
  - Mensagem errada aparece: "Este cliente não realizou compras"

### Bug 2: `productSearchTerm` Não Limpo ao Mudar Período

**Arquivo**: `src/features/customers/components/CustomerPurchaseHistoryTab.tsx` (linhas 163-168)

**Código Bugado**:
```typescript
const handlePeriodChange = useCallback((value: string) => {
  setFilters(prev => ({
    ...prev,
    periodFilter: value as PurchaseFilters['periodFilter']
    // ❌ Não limpa productSearchTerm!
  }));
}, []);
```

**Problema**:
- Ao mudar o filtro de período, `productSearchTerm` permanece ativo
- Isso causa o estado quebrado persistente
- Usuário não tem forma de limpar o filtro oculto

---

## 🔧 Correção Aplicada

### Correção 1: Incluir `productSearchTerm` em `isFiltered`

**Arquivo**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts`
**Linha**: 515

**Antes**:
```typescript
const isFiltered = searchTerm !== '' || periodFilter !== 'all';
```

**Depois**:
```typescript
const isFiltered = searchTerm !== '' || periodFilter !== 'all' || (productSearchTerm !== '' && productSearchTerm !== undefined);
```

**Impacto**:
- ✅ Mensagem correta mostrada quando há filtro de produto ativo
- ✅ Botão "Limpar Filtros" aparece quando necessário

### Correção 2: Limpar `productSearchTerm` ao Mudar Período

**Arquivo**: `src/features/customers/components/CustomerPurchaseHistoryTab.tsx`
**Linhas**: 163-171

**Antes**:
```typescript
const handlePeriodChange = useCallback((value: string) => {
  setFilters(prev => ({
    ...prev,
    periodFilter: value as PurchaseFilters['periodFilter']
  }));
}, []);
```

**Depois**:
```typescript
const handlePeriodChange = useCallback((value: string) => {
  setSearchInput(''); // Limpar input de busca
  setDebouncedSearchTerm(''); // Limpar busca debounced
  setFilters(prev => ({
    ...prev,
    periodFilter: value as PurchaseFilters['periodFilter'],
    productSearchTerm: '' // Limpar filtro de produto ao mudar período
  }));
}, []);
```

**Impacto**:
- ✅ Estado de busca completamente limpo ao mudar período
- ✅ Evita estado quebrado persistente
- ✅ Comportamento intuitivo para o usuário

---

## 🧪 Como Testar a Correção

### Teste 1: Filtro "Todos" Básico
1. ✅ Abrir perfil de cliente com compras (ex: "cliente teste analytics")
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Verificar que compras carregam
4. ✅ Clicar em filtro "Todos"
5. ✅ **Esperado**: Todas as compras continuam visíveis

### Teste 2: Filtro "Todos" Após Busca de Produto
1. ✅ Abrir perfil de cliente com compras
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Buscar por um produto específico (ex: "Vinho")
4. ✅ Verificar que lista filtra
5. ✅ Clicar em filtro "Todos"
6. ✅ **Esperado**:
   - Busca de produto é limpa automaticamente
   - Todas as compras aparecem novamente
   - Nenhuma mensagem de erro

### Teste 3: Filtro "Todos" com Produto Inexistente
1. ✅ Abrir perfil de cliente com compras
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Buscar por produto que não existe (ex: "xyz123")
4. ✅ Verificar mensagem "Nenhuma compra encontrada com os filtros aplicados"
5. ✅ Verificar que botão "Limpar Filtros" aparece
6. ✅ Clicar em "Limpar Filtros"
7. ✅ **Esperado**: Todas as compras aparecem novamente

### Teste 4: Troca de Filtros de Período
1. ✅ Abrir perfil de cliente com compras
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Buscar por um produto específico
4. ✅ Mudar filtro para "Últimos 30 dias"
5. ✅ **Esperado**: Busca de produto é limpa, mostra compras dos últimos 30 dias
6. ✅ Mudar filtro para "Últimos 3 meses"
7. ✅ **Esperado**: Mostra compras dos últimos 3 meses (sem filtro de produto)
8. ✅ Clicar em "Todos"
9. ✅ **Esperado**: Mostra todas as compras

---

## 📊 Arquivos Modificados

```bash
src/shared/hooks/business/useCustomerPurchaseHistory.ts           # 1 linha alterada
src/features/customers/components/CustomerPurchaseHistoryTab.tsx  # 3 linhas adicionadas
```

**Total**: 2 arquivos, 4 linhas modificadas

---

## ✅ Checklist de Validação

Antes do commit:
- [x] Código corrigido nos 2 arquivos
- [ ] Testes manuais executados (Testes 1-4 acima)
- [ ] `npm run lint` executado (zero warnings)
- [ ] Verificado que outros filtros não foram afetados

---

## 🎯 Próximos Passos

1. **Teste Manual**: Usuário deve executar os 4 testes acima
2. **Validação**: Confirmar que filtro "Todos" funciona corretamente
3. **Commit**: Após validação, fazer commit com mensagem:

```bash
fix(customers): correct "Todos" filter in purchase history

- Fixed isFiltered logic to include productSearchTerm check
- Clear productSearchTerm when changing period filter
- Prevents broken state when switching between filters
- Shows correct message when filters are active

Fixes bug where "Todos" filter showed "no purchases" message
even when purchases existed but were filtered by hidden
productSearchTerm.

Files modified:
- src/shared/hooks/business/useCustomerPurchaseHistory.ts
- src/features/customers/components/CustomerPurchaseHistoryTab.tsx

Refs: docs/07-changelog/BUGFIX_PURCHASE_HISTORY_FILTER_2025-11-09.md
```

---

## 📚 Referências

- **Hook**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts`
- **Component**: `src/features/customers/components/CustomerPurchaseHistoryTab.tsx`
- **Related**: Customer Profile → Histórico de Compra & Financeiro tab

---

**Data da Correção**: 09/11/2025
**Testado Por**: Aguardando testes do usuário
**Status**: ✅ Código corrigido, aguardando validação manual
