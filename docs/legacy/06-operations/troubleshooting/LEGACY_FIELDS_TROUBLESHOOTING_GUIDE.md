# Guia de Troubleshooting: Campos Legacy vs Multi-Store

**Versão:** 3.4.5
**Data:** 07/11/2025
**Criticidade:** P0 (Bloqueia vendas)
**Status:** RESOLVIDO

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Sintomas Comuns](#sintomas-comuns)
3. [Hotfixes Aplicados (Novembro 2025)](#hotfixes-aplicados)
4. [Causa Raiz](#causa-raiz)
5. [Como Identificar](#como-identificar)
6. [Prevenção Futura](#prevenção-futura)
7. [Referências Técnicas](#referências-técnicas)

---

## Visão Geral

### Contexto Histórico

O sistema passou por uma **migração arquitetural crítica** de campos de estoque únicos para multi-store (Loja 1 e Loja 2) na versão v3.4.0:

**Antes (Single-Store - DEPRECATED):**
```sql
-- Campos legacy (não mais atualizados desde v3.4.0)
stock_quantity       -- Estoque total (unidades)
stock_packages       -- Pacotes em estoque
stock_units_loose    -- Unidades soltas
```

**Depois (Multi-Store - CORRETO):**
```sql
-- Campos ativos (fonte da verdade desde v3.4.0)
store1_stock_packages      -- Pacotes Loja 1
store1_stock_units_loose   -- Unidades Loja 1
store2_stock_packages      -- Pacotes Loja 2
store2_stock_units_loose   -- Unidades Loja 2
```

### Problema Central

**Código que ainda referencia campos legacy retorna dados ZERADOS**, causando:
- ❌ Bloqueio de vendas de produtos com estoque disponível
- ❌ Botões desabilitados incorretamente
- ❌ Limitação de quantidade no carrinho
- ❌ Modal de seleção não abre

---

## Sintomas Comuns

### Sintoma 1: Produto com Estoque Não Pode Ser Vendido

**Relato do Usuário:**
> "O produto 'Velhote' mostra 4 unidades em estoque, mas não consigo adicionar ao carrinho. O botão está habilitado mas não responde."

**Evidências:**
- Painel Supabase: `store1_stock_units_loose = 4` ✅
- Frontend PDV: Botão "Adicionar" amarelo (habilitado)
- Comportamento: Clique não adiciona produto ao carrinho
- Console: Sem erros JavaScript

**Causa:** Hook `handleAddToCart` lendo `stock_units_loose = 0` (legacy)

**Resolução:** Commit `e528b75`

---

### Sintoma 2: Limitação de Quantidade Após Edição de Estoque

**Relato do Usuário:**
> "Editei o produto 'Red Bull Pomelo' de 10 para 22 unidades. Voltei para PDV mas só consigo adicionar 10 unidades ao carrinho, mesmo o sistema mostrando 22."

**Evidências:**
- Banco: `store1_stock_units_loose = 22` (atualizado 15:27 UTC)
- PDV: Mostra "Estoque: 22"
- Modal: Limita "Máximo: 10 unidades"
- Tempo decorrido: Menos de 30 segundos desde edição

**Causas Combinadas:**
1. Cache com `staleTime: 30000ms` (30 segundos)
2. `invalidateQueries` não força refetch se dados "frescos"

**Resolução:** Commit `a83fa05`

---

### Sintoma 3: Modal de Seleção Não Abre

**Relato do Usuário:**
> "Produto 'Original 269ml pc/15' tem 9 unidades soltas e 75 pacotes. Não consigo vender unidades - botão não abre modal de escolha."

**Evidências:**
- Banco: `store1_stock_units_loose = 9`, `store1_stock_packages = 75`
- Frontend: Botão "Escolher" (laranja) habilitado
- Comportamento: Modal não abre ao clicar
- Hook: `useStockAvailabilitySSoT` retorna `maxUnits = 0`

**Causa:** Hook lendo `stock_units_loose = 0` (legacy) ao invés de `store1_stock_units_loose`

**Resolução:** Commit `af49d94`

---

### Sintoma 4: Código de Barras Reconhece Mas Não Adiciona ao Carrinho

**Relato do Usuário:**
> "Cadastrei produtos novos hoje (Maratá Tangerina 1L e Maratá Caju 200ml). Quando uso o leitor de código de barras, aparece o toast 'Produto encontrado - Maratá Tangerina 1L - código principal' mas o produto não é adicionado ao carrinho. Produtos antigos funcionam normalmente."

**Evidências:**
- Banco: `store1_stock_units_loose = 12` (Maratá Tangerina 1L)
- Banco: `stock_units_loose = 0` (campo legacy)
- Toast: "Produto encontrado" exibido corretamente ✅
- Comportamento: Produto não adicionado ao carrinho ❌
- Console: `[DEBUG] produto sem estoque disponível`
- Data cadastro: 07/11/2025 (produtos novos)

**Diferença Produtos Antigos vs Novos:**
- **Produtos antigos:** Estoque em AMBOS campos (legacy + multistore) → funciona
- **Produtos novos:** Estoque APENAS em campos multistore → falha

**Causa:** Hook `handleBarcodeScanned` lendo `stock_units_loose = 0` (legacy) ao invés de `store1_stock_units_loose`

**Resolução:** Commit `d9b3062`

---

## Hotfixes Aplicados

### Hotfix 1: `af49d94` - useStockAvailabilitySSoT (02/11/2025 02:53)

**Arquivo:** `src/features/sales/hooks/useProductsSSoT.ts`
**Linhas:** 257, 272-273

```typescript
// ❌ ANTES (Bug):
const { data: product, error } = await supabase
  .from('products')
  .select('stock_packages, stock_units_loose')  // Legacy
  .eq('id', productId)
  .single();

const stockPackages = product.stock_packages || 0;      // 0
const stockUnitsLoose = product.stock_units_loose || 0;  // 0

// ✅ DEPOIS (Corrigido):
const { data: product, error } = await supabase
  .from('products')
  .select('store1_stock_packages, store1_stock_units_loose')  // Multi-store
  .eq('id', productId)
  .single();

const stockPackages = product.store1_stock_packages || 0;      // Real
const stockUnitsLoose = product.store1_stock_units_loose || 0;  // Real
```

**Impacto:**
- ✅ Modal de seleção abre corretamente
- ✅ Disponibilidade calculada com dados reais
- ✅ Limites de quantidade corretos

---

### Hotfix 2: `a83fa05` - Cache Excessivo (03/11/2025 11:05)

**Arquivo:** `src/features/sales/hooks/useProductsSSoT.ts`
**Linhas:** 111, 297

```typescript
// ❌ ANTES (Bug):
useQuery({
  queryKey: ['product-ssot', productId],
  queryFn: async () => { /* ... */ },
  staleTime: 30000, // 30 segundos - dados antigos por 30s
});

useQuery({
  queryKey: ['stock-availability-ssot', ...],
  queryFn: async () => { /* ... */ },
  staleTime: 5000, // 5 segundos - dados antigos por 5s
});

// ✅ DEPOIS (Corrigido):
useQuery({
  queryKey: ['product-ssot', productId],
  queryFn: async () => { /* ... */ },
  staleTime: 0, // Refetch imediato quando invalidateQueries chamado
});

useQuery({
  queryKey: ['stock-availability-ssot', ...],
  queryFn: async () => { /* ... */ },
  staleTime: 0, // Refetch imediato quando invalidateQueries chamado
});
```

**Fluxo do Bug:**
1. Usuário abre PDV às 15:00:00 → Produto buscado: 10 unidades
2. React Query cacheia com `staleTime: 30000`
3. Usuário edita estoque às 15:00:10 → Atualiza para 22 unidades
4. `StockAdjustmentModal` executa `invalidateQueries()`
5. **Query marcada "stale" mas dados ainda "frescos" (dentro de 30s)**
6. Usuário volta PDV às 15:00:15 → **Retorna 10 unidades do cache** ❌
7. Tenta adicionar 15 → **Bloqueado** (maxUnits = 10 antigos)

**Impacto:**
- ✅ Dados sempre atualizados após edições
- ✅ `invalidateQueries` força refetch imediato
- ✅ Performance mantida (cache continua funcionando)

---

### Hotfix 3: `e528b75` - handleAddToCart (03/11/2025 14:05)

**Arquivo:** `src/shared/hooks/products/useProductsGridLogic.ts`
**Linhas:** 221-222

```typescript
// ❌ ANTES (Bug):
const handleAddToCart = async (product: Product) => {
  const stockUnitsLoose = product.stock_units_loose || 0;  // Legacy: 0
  const stockPackages = product.stock_packages || 0;       // Legacy: 0

  if (stockUnitsLoose > 0 && stockPackages > 0) {
    openProductSelection(product);  // Nunca executa
  } else if (stockUnitsLoose > 0) {
    await addItem({...});  // Nunca executa (0 > 0 = false)
  }
  // Nada acontece (silent fail)
};

// ✅ DEPOIS (Corrigido):
const handleAddToCart = async (product: Product) => {
  const stockUnitsLoose = product.store1_stock_units_loose || 0;  // Real: 4
  const stockPackages = product.store1_stock_packages || 0;       // Real: 0

  if (stockUnitsLoose > 0 && stockPackages > 0) {
    openProductSelection(product);
  } else if (stockUnitsLoose > 0) {
    await addItem({...});  // Executa corretamente (4 > 0 = true)
  }
};
```

**Produtos Afetados:**
- ✅ Todos com `package_price` definido mas 0 pacotes em estoque
- ✅ Exemplo: "Velhote", "Red Bull Pomelo", "51 Ice LIMÃO"

**Impacto:**
- ✅ Clique em "Adicionar" funciona corretamente
- ✅ Produto adicionado ao carrinho
- ✅ Sem silent fails

---

### Hotfix 4: `d9b3062` - handleBarcodeScanned (07/11/2025)

**Arquivo:** `src/shared/hooks/products/useProductsGridLogic.ts`
**Linhas:** 174-175

```typescript
// ❌ ANTES (Bug):
const handleBarcodeScanned = async (barcode: string) => {
  const result = await searchByBarcode(barcode);

  if (result && result.product) {
    const { product, type } = result;

    // Usando campos LEGACY
    const stockUnitsLoose = product.stock_units_loose || 0;  // Legacy: 0
    const stockPackages = product.stock_packages || 0;       // Legacy: 0

    if (stockUnitsLoose > 0 || stockPackages > 0) {
      await addItem(itemToAdd);  // Nunca executa (0 > 0 = false)
    } else {
      console.log('[DEBUG] produto sem estoque disponível');  // ✅ Executado
    }
  }
};

// ✅ DEPOIS (Corrigido):
const handleBarcodeScanned = async (barcode: string) => {
  const result = await searchByBarcode(barcode);

  if (result && result.product) {
    const { product, type } = result;

    // Usando campos MULTISTORE
    const stockUnitsLoose = product.store1_stock_units_loose || 0;  // Real: 12
    const stockPackages = product.store1_stock_packages || 0;       // Real: 0

    if (stockUnitsLoose > 0 || stockPackages > 0) {
      await addItem(itemToAdd);  // ✅ Executa corretamente (12 > 0 = true)
    }
  }
};
```

**Sintoma Relatado:**
> "Cadastrei produtos novos hoje (Maratá Tangerina 1L, Maratá Caju 200ml). Quando uso o leitor de código de barras, aparece o toast 'Produto encontrado' mas o produto não é adicionado ao carrinho. Produtos antigos funcionam normalmente."

**Produtos Afetados:**
- Maratá Tangerina 1L (barcode: 7898378180096) - 12 unidades
- Maratá Caju 200ml (barcode: 7898378180171) - 27 unidades
- Todos os produtos cadastrados após migração v3.4.0

**Por que produtos antigos funcionavam:**
Produtos antigos têm estoque em AMBOS os campos (legacy + multistore) devido à migração parcial. Produtos novos só têm estoque em multistore.

**Impacto:**
- ✅ Produtos novos podem ser vendidos via código de barras
- ✅ Toast + adição ao carrinho funcionando
- ✅ Paridade com botão "Adicionar" manual

---

## Causa Raiz

### Migração Incompleta

A migração v3.4.0 (Multi-Store) atualizou:
- ✅ Backend: RPC `process_sale`, `create_inventory_movement`
- ✅ Frontend: Componentes de edição (`StockAdjustmentModal`)
- ❌ **Frontend: Hooks de leitura continuaram usando campos legacy**

### Campos Legacy Não Atualizados

**Desde v3.4.0, campos legacy NÃO são mais atualizados:**

```sql
-- Estes campos permanecem ZERADOS após qualquer operação:
SELECT
  stock_quantity,     -- Sempre 0 ou valor antigo
  stock_packages,     -- Sempre 0 ou valor antigo
  stock_units_loose   -- Sempre 0 ou valor antigo
FROM products
WHERE name = 'Velhote';

-- Resultado:
-- stock_quantity: 0
-- stock_packages: 0
-- stock_units_loose: 0

-- Campos corretos (fonte da verdade):
SELECT
  store1_stock_packages,
  store1_stock_units_loose
FROM products
WHERE name = 'Velhote';

-- Resultado:
-- store1_stock_packages: 0
-- store1_stock_units_loose: 4  ✅ CORRETO
```

---

## Como Identificar

### Checklist de Diagnóstico

**1. Verificar Campos no Código:**

```bash
# Procurar uso de campos legacy no frontend:
grep -r "stock_packages\|stock_units_loose\|stock_quantity" src/features/sales/
grep -r "stock_packages\|stock_units_loose" src/shared/hooks/

# ❌ Se encontrar: PROBLEMA
# ✅ Se não encontrar: OK
```

**2. Verificar Banco de Dados:**

```sql
-- Comparar valores legacy vs multistore para produto problemático:
SELECT
  name,
  -- Legacy (DEPRECATED):
  stock_packages,
  stock_units_loose,
  -- Multi-Store (CORRETO):
  store1_stock_packages,
  store1_stock_units_loose
FROM products
WHERE name ILIKE '%nome_produto%';

-- Se stock_packages = 0 MAS store1_stock_packages > 0:
-- → Código está lendo campo legacy!
```

**3. Verificar React Query DevTools:**

```javascript
// No console do navegador:
window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE');

// Verificar staleTime das queries:
// Se > 0: Pode causar dados antigos em cache
```

---

## Prevenção Futura

### Regras de Código (MANDATORY)

**1. NUNCA usar campos legacy:**

```typescript
// ❌ PROIBIDO:
product.stock_packages
product.stock_units_loose
product.stock_quantity

// ✅ SEMPRE usar:
product.store1_stock_packages
product.store1_stock_units_loose
product.store2_stock_packages  // Se necessário
product.store2_stock_units_loose
```

**2. staleTime para dados de estoque:**

```typescript
// ❌ EVITAR para estoque:
staleTime: 30000  // 30 segundos muito longo

// ✅ RECOMENDADO:
staleTime: 0      // Refetch imediato ao invalidar

// ✅ ACEITÁVEL (dados menos críticos):
staleTime: 5000   // Máximo 5 segundos
```

**3. Invalidação de cache obrigatória:**

```typescript
// Após qualquer UPDATE de estoque:
queryClient.invalidateQueries({ queryKey: ['product-ssot', productId] });
queryClient.invalidateQueries({ queryKey: ['stock-availability-ssot', productId] });
queryClient.invalidateQueries({ queryKey: ['products', 'available'] });
```

### ESLint Rules (Proposta)

```json
{
  "rules": {
    "no-restricted-properties": [
      "error",
      {
        "object": "product",
        "property": "stock_packages",
        "message": "Use store1_stock_packages ou store2_stock_packages (multi-store)"
      },
      {
        "object": "product",
        "property": "stock_units_loose",
        "message": "Use store1_stock_units_loose ou store2_stock_units_loose (multi-store)"
      },
      {
        "object": "product",
        "property": "stock_quantity",
        "message": "Campo legacy descontinuado. Use campos multi-store."
      }
    ]
  }
}
```

### Code Review Checklist

- [ ] Código NÃO usa `stock_packages`, `stock_units_loose`, `stock_quantity`
- [ ] Queries React Query têm `staleTime` apropriado (≤ 5000ms para estoque)
- [ ] `invalidateQueries` chamado após mutations de estoque
- [ ] Testes cobrem cenários multi-store (Loja 1 e Loja 2)

---

## Referências Técnicas

### Commits Relacionados

| Commit | Data | Descrição |
|--------|------|-----------|
| `af49d94` | 02/11/2025 02:53 | Fix useStockAvailabilitySSoT campos legacy |
| `a83fa05` | 03/11/2025 11:05 | Fix staleTime cache bloqueando vendas |
| `e528b75` | 03/11/2025 14:05 | Fix handleAddToCart campos legacy |

### Documentação Relacionada

- `docs/07-changelog/HOTFIXES_NOVEMBRO_2025_v3.4.4.md` - Changelog completo
- `docs/02-architecture/guides/MULTI_STORE_ARCHITECTURE.md` - Arquitetura multi-store
- `docs/06-operations/guides/MIGRATIONS_GUIDE.md` - Guia de migrações

### Arquivos Críticos

**Frontend:**
- `src/features/sales/hooks/useProductsSSoT.ts` - Hooks SSoT de produtos
- `src/shared/hooks/products/useProductsGridLogic.ts` - Lógica do grid de produtos
- `src/features/sales/hooks/use-cart.ts` - Gerenciamento do carrinho

**Backend:**
- `supabase/migrations/20251025120000_multistore_phase1.sql` - Criação campos multi-store
- `supabase/migrations/20251102000000_fix_process_sale_multistore_complete.sql` - Fix process_sale

---

**Última Atualização:** 03/11/2025
**Responsável:** Claude AI + Luccas (Developer)
**Versão do Sistema:** v3.4.4
