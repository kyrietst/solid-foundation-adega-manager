# 🐛 BUGFIX: Produtos com Estoque Zerado Não Apareciam no Inventário

**Data:** 2025-10-29
**Versão:** v3.4.2
**Tipo:** Correção de Bug
**Prioridade:** Alta
**Status:** ✅ CORRIGIDO

---

## 📋 Descrição do Bug

### Problema Relatado
Produtos cadastrados com estoque = 0 **não apareciam** na aba de inventário/estoque da interface, impossibilitando que o usuário ajustasse o estoque inicial após o cadastro.

### Exemplo Real
- **Produto**: "teste"
- **ID**: f67cec32-4774-44a6-9a7f-de6c209d5516
- **Código de Barras**: 55555555555
- **Status no Banco**: ✅ Cadastrado com sucesso
- **Estoque**: 0 pacotes, 0 unidades (todas as lojas)
- **Problema**: ❌ Não aparecia na interface do inventário

### Impacto
- ❌ Usuário não conseguia ajustar estoque de produtos recém-cadastrados
- ❌ Produtos "desapareciam" após cadastro
- ❌ UX confusa - dava impressão que cadastro havia falhado

---

## 🔍 Causa Raiz

Filtros SQL nas queries de produtos que **excluíam produtos com estoque = 0**:

### Filtro Problemático
```sql
-- Exemplo do filtro que causava o bug
.or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0')
```

Este filtro retornava **APENAS** produtos onde:
- `store1_stock_packages > 0` **OU**
- `store1_stock_units_loose > 0`

**Resultado**: Produtos com ambos os campos = 0 eram excluídos.

---

## 🛠️ Arquivos Corrigidos

### 1. `src/shared/hooks/products/useProductsGridLogic.ts`

**Linhas Modificadas**: 55-60

**ANTES:**
```typescript
// 🏪 Filtrar por loja se especificado
if (storeFilter === 'store1') {
  query = query.or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');
} else if (storeFilter === 'store2') {
  query = query.or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
}
```

**DEPOIS:**
```typescript
// 🏪 Filtro de estoque removido - produtos aparecem mesmo com estoque = 0
// Permite visualizar e ajustar estoque de produtos recém-cadastrados
// storeFilter ainda é usado para exibir estoque correto nos cards (via getStoreStock helper)
```

**Impacto**: Query principal de produtos agora retorna TODOS os produtos (exceto deletados), independente do estoque.

---

### 2. `src/features/inventory/hooks/useStoreInventory.ts` (Parte 1)

**Linhas Modificadas**: 31-36

**ANTES:**
```typescript
const { data, error } = await supabase
  .from('products')
  .select('*')
  .is('deleted_at', null)
  .or(`${packagesField}.gt.0,${unitsField}.gt.0`);
```

**DEPOIS:**
```typescript
// Filtro de estoque removido - produtos aparecem mesmo com estoque = 0
// Permite visualizar e ajustar estoque de produtos recém-cadastrados
const { data, error } = await supabase
  .from('products')
  .select('*')
  .is('deleted_at', null);
```

**Impacto**: Hook `useStoreInventory` agora retorna todos os produtos da loja, mesmo com estoque zerado.

---

### 3. `src/features/inventory/hooks/useStoreInventory.ts` (Parte 2)

**Linhas Modificadas**: 60-74

**ANTES:**
```typescript
// Contar produtos com estoque na Loja 1
const { count: store1Count, error: error1 } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .is('deleted_at', null)
  .or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');

// Contar produtos com estoque na Loja 2
const { count: store2Count, error: error2 } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .is('deleted_at', null)
  .or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
```

**DEPOIS:**
```typescript
// Filtro de estoque removido - contagem inclui TODOS os produtos (mesmo com estoque = 0)
// Permite contabilizar produtos cadastrados que ainda precisam de estoque inicial

// Contar produtos na Loja 1
const { count: store1Count, error: error1 } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .is('deleted_at', null);

// Contar produtos na Loja 2
const { count: store2Count, error: error2 } = await supabase
  .from('products')
  .select('*', { count: 'exact', head: true })
  .is('deleted_at', null);
```

**Impacto**: Contadores de produtos agora incluem produtos com estoque zerado.

---

## ✅ Validação

### Testes Executados
- ✅ **Lint**: Passou sem erros ou warnings
- ✅ **TypeScript**: Compilação OK
- ✅ **Query Supabase**: Produto "teste" agora deve aparecer

### Resultado Esperado
Após esta correção, o produto "teste" (ID: f67cec32-4774-44a6-9a7f-de6c209d5516) deve:
- ✅ Aparecer na lista do inventário
- ✅ Mostrar "0 pacotes, 0 unidades" no card
- ✅ Permitir ajuste de estoque via modal
- ✅ Ser visível em ambas as lojas (Loja 1 e Loja 2)

---

## 📊 Comportamento Antes vs Depois

### ANTES (com bug)
```
Query SQL:
  SELECT * FROM products
  WHERE deleted_at IS NULL
  AND (store1_stock_packages > 0 OR store1_stock_units_loose > 0)

Resultado:
  ❌ Produto "teste" (estoque = 0) NÃO retornado
  ❌ Não aparece na interface
```

### DEPOIS (corrigido)
```
Query SQL:
  SELECT * FROM products
  WHERE deleted_at IS NULL

Resultado:
  ✅ Produto "teste" (estoque = 0) É retornado
  ✅ Aparece na interface com estoque zerado
  ✅ Pode ser ajustado pelo usuário
```

---

## 🎯 Decisão de Design

### Por que permitir produtos com estoque = 0?

**Justificativas:**

1. **UX Melhorada**
   - Produtos cadastrados não "desaparecem"
   - Fluxo natural: Cadastrar → Ver na lista → Ajustar estoque

2. **Workflow Real**
   - Usuários podem cadastrar produtos antes de receber mercadoria
   - Permite planejamento de compras
   - Facilita importação em lote

3. **Consistência**
   - Produtos deletados já são filtrados por `deleted_at`
   - Não há necessidade de filtro duplo (deleted + estoque)

4. **Alinhamento com Outros Sistemas**
   - A maioria dos ERPs/sistemas de inventário mostram produtos com estoque zerado
   - Comportamento esperado pelo usuário

---

## 🔄 Reversão (Se Necessário)

Caso seja necessário reverter esta mudança (muito improvável), basta:

### Reverter Arquivo 1: `useProductsGridLogic.ts`
```typescript
// Adicionar de volta (linhas 55-60):
if (storeFilter === 'store1') {
  query = query.or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');
} else if (storeFilter === 'store2') {
  query = query.or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
}
```

### Reverter Arquivo 2: `useStoreInventory.ts`
```typescript
// Adicionar de volta (linha 35):
.or(`${packagesField}.gt.0,${unitsField}.gt.0`);

// Adicionar de volta (linhas 65 e 72):
.or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');
.or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
```

---

## 📈 Impacto do Bugfix

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Produtos visíveis | Apenas com estoque > 0 | Todos (exceto deletados) | 100% |
| UX de cadastro | Confusa | Clara | ✅ |
| Workflow | Quebrado | Natural | ✅ |
| Produtos "perdidos" | Sim | Não | ✅ |

---

## 🔗 Relações

### Commits Relacionados
- v3.4.0: Implementação sistema multi-store
- v3.4.2: Fase 2A - Limpeza backend DEV

### Issues Relacionadas
- Produto "teste" não aparecia no inventário (reportado em 2025-10-29)

### Documentação Relacionada
- `docs/03-modules/inventory/INVENTORY_MANAGEMENT_GUIDE.md`
- `docs/07-changelog/BACKEND_ANALYSIS_RESULTS_v3.4.2.md`

---

## 📝 Notas Adicionais

### Outros Filtros Preservados
- ✅ Filtro `deleted_at IS NULL` **MANTIDO** (produtos deletados continuam ocultos)
- ✅ Ordenação alfabética por nome **MANTIDA**
- ✅ storeFilter para exibição de estoque **MANTIDO** (usado em helpers)

### Produtos Ainda Ocultos (Esperado)
- ❌ Produtos com `deleted_at != NULL` (soft deleted)
  - Exemplo: Produto ID a6705109-10cc-4344-90be-95beb8ecbced (deletado em 2025-10-24)

---

## ✅ Conclusão

**Status**: ✅ BUGFIX APLICADO COM SUCESSO

**Resultado**:
- Produtos com estoque zerado agora aparecem no inventário
- UX melhorada significativamente
- Workflow de cadastro → ajuste de estoque corrigido
- Sistema alinhado com comportamento esperado

**Próximos Passos**:
1. Usuário deve testar interface e confirmar que produto "teste" aparece
2. Testar ajuste de estoque do produto
3. Prosseguir com Fase 2B (análise DEV vs PROD)

---

**Última Atualização**: 2025-10-29
**Autor**: Claude Code AI
**Aprovado por**: Luccas (usuário)
