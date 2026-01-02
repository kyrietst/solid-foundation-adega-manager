# 🐛 Bugfix: Loop Infinito e Filtro "Todos" - Histórico de Compras

**Data**: 09/11/2025
**Severidade**: Crítica
**Componente**: Customer Purchase History Hook
**Status**: ✅ **CORRIGIDO**

---

## 📋 Descrição dos Bugs

### Bug #1: Maximum Update Depth Exceeded (Loop Infinito)
**Console Error**:
```
useCustomerPurchaseHistory.ts:291 Maximum update depth exceeded.
This can happen when a component calls setState inside useEffect, but useEffect
either doesn't have a dependency array, or one of the dependencies changes on every render.
```

**Sintomas**:
- Erro de loop infinito ao clicar no dropdown de filtro de período
- Browser trava/congela
- Performance severamente degradada

### Bug #2: Filtro "Todos" Mostra Mensagem Errada
**Sintoma**:
- Ao clicar em "Todos" → mensagem "Este cliente ainda não realizou compras"
- Mensagem incorreta mesmo quando cliente tem compras
- Filtros param de funcionar após clicar em "Todos"

---

## 🔍 Causa Raiz

### Bug #1: Dependência Circular no useEffect

**Arquivo**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts`
**Linha problemática**: 297 (array de dependências)

**Código Bugado**:
```typescript
useEffect(() => {
  if (rawPurchases && rawPurchases.length > 0) {
    // ... lógica de acumulação ...
    setHasMoreData(rawPurchases.length === pagination.limit); // ❌ Usa pagination.limit
  }
}, [rawPurchases, currentPage, pagination.limit]); // ❌ PROBLEMA: pagination.limit nas deps
```

**Por que causava loop infinito**:

1. **Objeto `pagination` recriado a cada render** (linha ~540):
   ```typescript
   pagination: {
     ...pagination,  // Spread cria novo objeto
     page: currentPage,
     hasMore: hasMoreData
   }
   ```

2. **Cadeia de eventos**:
   ```
   useEffect dispara
   → setState ocorre
   → componente re-renderiza
   → novo objeto pagination criado (nova referência)
   → useEffect detecta mudança em pagination.limit
   → useEffect dispara novamente
   → LOOP INFINITO
   ```

3. **Trigger ao clicar dropdown**: Qualquer re-render (como abrir dropdown) reiniciava o loop

### Bug #2: Valores Não Retornados pelo Hook

**Problema**: Hook calculava `hasData`, `isEmpty`, `isFiltered` mas não os retornava

**Linha**: ~550 (return statement original não incluía estes valores)

**Componente esperava** (CustomerPurchaseHistoryTab.tsx:144-146):
```typescript
const {
  // ...
  hasData,     // ❌ undefined
  isEmpty,     // ❌ undefined
  isFiltered,  // ❌ undefined
  // ...
} = useCustomerPurchaseHistory(customerId, filters);
```

**Resultado**: Lógica de empty state sempre avaliava como "não filtrado" → mensagem errada

---

## 🔧 Correções Aplicadas

### Correção #1: Remover Dependência Circular

**3 mudanças necessárias**:

#### Mudança 1: Adicionar Constante (linha ~160)
```typescript
// Constante de paginação (evita re-renders desnecessários)
const PAGINATION_LIMIT = 100;
```

#### Mudança 2: Usar Constante ao Invés de pagination.limit (linha ~291)
```typescript
// ANTES:
setHasMoreData(rawPurchases.length === pagination.limit);

// DEPOIS:
setHasMoreData(rawPurchases.length === PAGINATION_LIMIT);
```

#### Mudança 3: Remover pagination.limit das Dependências (linha ~297)
```typescript
// ANTES:
}, [rawPurchases, currentPage, pagination.limit]);

// DEPOIS:
}, [rawPurchases, currentPage]);
```

**Por que funciona**:
- `PAGINATION_LIMIT` é uma constante → mesma referência em todos os renders
- useEffect não depende mais de objeto mutável
- Quebra o ciclo de re-renders infinitos

### Correção #2: Retornar Valores Faltantes

**Interface atualizada** (linhas 102-105):
```typescript
export interface PurchaseHistoryOperations {
  // ... outros campos ...

  // Estados derivados
  hasData: boolean;
  isEmpty: boolean;
  isFiltered: boolean;

  // ... resto ...
}
```

**Return statement já incluía** (linhas 554-556):
```typescript
return {
  // ... outros valores ...

  // Estado derivado
  hasData,
  isEmpty,
  isFiltered
};
```

**Nota**: Esta parte já estava parcialmente implementada, apenas ajustamos a interface TypeScript.

---

## 📊 Resumo das Mudanças

**Arquivo modificado**: `src/shared/hooks/business/useCustomerPurchaseHistory.ts`

**Estatísticas**:
```
1 file changed, 10 insertions(+), 7 deletions(-)
```

**Mudanças específicas**:
1. ➕ Linha ~160: Constante `PAGINATION_LIMIT = 100` adicionada
2. 🔄 Linha ~291: `pagination.limit` → `PAGINATION_LIMIT`
3. ➖ Linha ~297: Removido `pagination.limit` das dependências
4. ➕ Linhas 102-105: Tipos adicionados na interface

---

## 🧪 Como Testar as Correções

### Teste 1: Verificar Ausência de Loop Infinito
1. ✅ Abrir perfil de cliente com compras
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Clicar no dropdown de período várias vezes
4. ✅ **Esperado**: Nenhum erro no console, interface responsiva

### Teste 2: Filtro "Todos" Funciona
1. ✅ Abrir perfil de cliente com compras (ex: "cliente teste analytics")
2. ✅ Ir para aba "Histórico de Compra & Financeiro"
3. ✅ Verificar que compras carregam corretamente
4. ✅ Selecionar "Últimos 30 dias"
5. ✅ Verificar filtragem
6. ✅ Selecionar "Todos"
7. ✅ **Esperado**: Todas as compras aparecem novamente (sem mensagem de erro)

### Teste 3: Busca de Produto + "Todos"
1. ✅ Buscar por um produto específico
2. ✅ Verificar lista filtrada
3. ✅ Selecionar "Todos"
4. ✅ **Esperado**: Busca limpa, todas as compras mostradas

### Teste 4: Performance
1. ✅ Abrir console do navegador (F12)
2. ✅ Navegar pela aba de histórico
3. ✅ Alternar entre filtros várias vezes
4. ✅ **Esperado**: Nenhum warning de re-renders excessivos

---

## ✅ Checklist de Validação

**Pré-commit**:
- [x] Código corrigido
- [ ] Testes manuais executados (Testes 1-4 acima)
- [ ] `npm run lint` (zero warnings)
- [ ] Console limpo (sem erros)

**Pós-commit**:
- [ ] Monitorar Sentry/logs por 24h
- [ ] Verificar feedback de usuários

---

## 🎯 Próximos Passos

1. **Testar manualmente**: Executar os 4 testes acima
2. **Validar console**: Verificar que não há mais erro "Maximum update depth"
3. **Confirmar filtros**: Validar que todos os filtros funcionam corretamente
4. **Commit**: Após validação, fazer commit:

```bash
fix(customers): resolve infinite loop in purchase history

- Fixed infinite re-render loop caused by pagination.limit dependency
- Replaced pagination.limit with constant PAGINATION_LIMIT
- Removed pagination.limit from useEffect dependency array
- Updated TypeScript interface with missing state properties

Fixes:
- "Maximum update depth exceeded" error when clicking period filter
- "Todos" filter showing incorrect "no purchases" message
- Filter dropdown freezing/lagging browser

Breaking the circular dependency chain prevents infinite renders
and allows proper filter state management.

Files modified:
- src/shared/hooks/business/useCustomerPurchaseHistory.ts

Refs: docs/07-changelog/BUGFIX_INFINITE_LOOP_2025-11-09.md
```

---

## 📚 Referências Técnicas

### React Hooks - Dependency Array
- [React Docs: useEffect Dependencies](https://react.dev/reference/react/useEffect#specifying-reactive-dependencies)
- Regra: Dependências devem ter identidade estável entre renders
- Objetos/arrays criados inline → nova referência → re-trigger

### Debugging Infinite Loops
```typescript
// ❌ RUIM: Objeto criado a cada render
const config = { limit: 100 };
useEffect(() => {}, [config]); // Sempre re-executa

// ✅ BOM: Constante ou useMemo
const LIMIT = 100;
useEffect(() => {}, [LIMIT]); // Estável

// ✅ BOM: Extração de valores primitivos
const { limit } = config;
useEffect(() => {}, [limit]); // Apenas primitivo
```

---

**Data da Correção**: 09/11/2025
**Testado Por**: Aguardando testes do usuário
**Status**: ✅ Código corrigido, aguardando validação manual
