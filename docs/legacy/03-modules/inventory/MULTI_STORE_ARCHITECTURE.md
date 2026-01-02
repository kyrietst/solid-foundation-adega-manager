# Multi-Store Architecture Guide

**Versão:** v3.6.0 (restaurado)
**Status:** ✅ ATIVO
**Data:** 2025-11-27

---

## 📌 Resumo Executivo

O **Sistema Multi-Store** permite gerenciar estoque **DIVIDIDO** entre duas lojas físicas independentes:

- **Loja 1**: Estoque principal (todos os produtos iniciam aqui)
- **Loja 2**: Estoque secundário (recebe produtos via transferência)

**Características principais:**
- ✅ Estoque **DIVIDIDO** (não compartilhado)
- ✅ Transferências entre lojas **movem** estoque (subtrai origem, adiciona destino)
- ✅ Visibilidade controlada (produtos só aparecem na loja após transferência)
- ✅ Histórico completo de transferências (auditoria)
- ✅ Validação de estoque por loja (não permite transferir mais do que tem)

---

## 🏗️ Arquitetura do Sistema

### 1. Database Schema

#### Colunas do Produto (Multi-Store)

```sql
-- Tabela: products
CREATE TABLE products (
  -- ... colunas existentes ...

  -- 📦 ESTOQUE LOJA 1 (v3.6.0)
  store1_stock_packages INTEGER DEFAULT 0 CHECK (store1_stock_packages >= 0),
  store1_stock_units_loose INTEGER DEFAULT 0 CHECK (store1_stock_units_loose >= 0),

  -- 📦 ESTOQUE LOJA 2 (v3.6.0)
  store2_stock_packages INTEGER DEFAULT 0 CHECK (store2_stock_packages >= 0),
  store2_stock_units_loose INTEGER DEFAULT 0 CHECK (store2_stock_units_loose >= 0),

  -- 🔄 CAMPOS LEGACY (calculados como soma das lojas)
  stock_packages INTEGER DEFAULT 0,
  stock_units_loose INTEGER DEFAULT 0
);
```

**Regra importante:**
```
stock_packages = store1_stock_packages + store2_stock_packages
stock_units_loose = store1_stock_units_loose + store2_stock_units_loose
```

#### Tabela de Transferências

```sql
-- Tabela: store_transfers
CREATE TABLE store_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  from_store INTEGER NOT NULL CHECK (from_store IN (1, 2)),
  to_store INTEGER NOT NULL CHECK (to_store IN (1, 2)),
  packages INTEGER NOT NULL DEFAULT 0,
  units_loose INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Propósito:**
- Registro histórico de todas as transferências
- Auditoria (quem transferiu, quando, quanto)
- Base para cálculo de distribuição em migrations

---

### 2. RPCs (Stored Procedures)

#### `execute_store_transfer()`

Transferir estoque entre lojas.

**Parâmetros:**
```typescript
{
  p_product_id: UUID,
  p_from_store: 1 | 2,
  p_to_store: 1 | 2,
  p_packages: number,
  p_units_loose: number,
  p_user_id: UUID,
  p_notes?: string
}
```

**Lógica:**
1. Validar estoque suficiente na loja de origem
2. Subtrair quantidade da loja origem
3. Adicionar quantidade na loja destino
4. Registrar histórico em `store_transfers`

**Exemplo de uso:**
```typescript
const { data, error } = await supabase.rpc('execute_store_transfer', {
  p_product_id: '123e4567-e89b-12d3-a456-426614174000',
  p_from_store: 1,
  p_to_store: 2,
  p_packages: 5,
  p_units_loose: 10,
  p_user_id: userId,
  p_notes: 'Reposição semanal'
});
```

#### `set_product_stock_absolute_multistore()`

Ajustar estoque de uma loja específica (ajuste manual).

**Parâmetros:**
```typescript
{
  p_product_id: UUID,
  p_store: 1 | 2,
  p_new_packages: number,
  p_new_units_loose: number,
  p_user_id: UUID,
  p_reason?: string
}
```

**Lógica:**
1. Atualizar estoque da loja específica
2. Recalcular campos legacy (soma das lojas)
3. Registrar movimento em `stock_movements`

**Exemplo de uso:**
```typescript
const { error } = await supabase.rpc('set_product_stock_absolute_multistore', {
  p_product_id: productId,
  p_store: 1,
  p_new_packages: 20,
  p_new_units_loose: 50,
  p_user_id: userId,
  p_reason: 'Inventário mensal'
});
```

---

### 3. Frontend Architecture

#### Hook: `useStoreInventory`

Buscar produtos com estoque em uma loja específica.

**Uso:**
```typescript
import { useStoreInventory } from '@/features/inventory/hooks/useStoreInventory';

function InventoryPage() {
  const { data: productsStore1 } = useStoreInventory({ store: 'store1' });
  const { data: productsStore2 } = useStoreInventory({ store: 'store2' });

  // productsStore2 retorna APENAS produtos transferidos para lá
}
```

**Lógica de filtro:**
- **Loja 1**: Retorna TODOS os produtos cadastrados
- **Loja 2**: Retorna APENAS produtos com histórico de transferência

#### Hook: `useProductsGridLogic`

Hook coordenador com suporte a multi-store.

**Uso:**
```typescript
import { useProductsGridLogic } from '@/shared/hooks/products/useProductsGridLogic';

function ProductsGrid() {
  const {
    products,
    currentProducts,
    isLoading
  } = useProductsGridLogic({
    storeFilter: 'store2', // Filtrar por loja
    stockFilter: 'all',
    showSearch: true
  });
}
```

#### Helper: `getStoreStock()`

Obter estoque de uma loja específica.

**Uso:**
```typescript
import { getStoreStock } from '@/features/inventory/hooks/useStoreInventory';

const stock = getStoreStock(product, 'store1');
console.log(stock); // { packages: 10, units: 20 }
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Cadastrar Produto Novo

1. **Frontend:** `NewProductModal` cria produto
   ```typescript
   {
     name: "Vinho Tinto",
     stock_packages: 10,
     stock_units_loose: 20,
     store1_stock_packages: 10,  // Todo estoque vai para Loja 1
     store1_stock_units_loose: 20,
     store2_stock_packages: 0,    // Loja 2 inicia vazia
     store2_stock_units_loose: 0
   }
   ```

2. **Resultado:**
   - Produto aparece APENAS na aba "Loja 1"
   - Aba "Loja 2" NÃO mostra o produto (ainda não foi transferido)

### Fluxo 2: Transferir Produto Entre Lojas

1. **Usuário:** Clica em "Transferir" na Loja 1
2. **Frontend:** Abre `StoreTransferModal`
3. **Usuário:** Define quantidade (ex: 5 pacotes / 10 unidades)
4. **Frontend:** Chama RPC
   ```typescript
   await supabase.rpc('execute_store_transfer', {
     p_product_id: productId,
     p_from_store: 1,
     p_to_store: 2,
     p_packages: 5,
     p_units_loose: 10,
     p_user_id: userId
   });
   ```

5. **Database:**
   - Loja 1: 10p/20u → **5p/10u** ✅
   - Loja 2: 0p/0u → **5p/10u** ✅
   - Total: 10p/20u (mantido)
   - Cria registro em `store_transfers`

6. **Frontend:** Invalida cache
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['products', 'available'] });
   queryClient.invalidateQueries({ queryKey: ['products', 'store'] });
   ```

7. **Resultado:**
   - Produto agora aparece em AMBAS as abas
   - Loja 1 mostra 5p/10u
   - Loja 2 mostra 5p/10u

### Fluxo 3: Ajustar Estoque de Loja Específica

1. **Usuário:** Clica em "Ajustar Estoque" na Loja 2
2. **Frontend:** Abre `StockAdjustmentModal` (com seletor de loja)
3. **Usuário:** Define novo estoque (ex: 8 pacotes / 15 unidades)
4. **Frontend:** Chama RPC
   ```typescript
   await supabase.rpc('set_product_stock_absolute_multistore', {
     p_product_id: productId,
     p_store: 2,
     p_new_packages: 8,
     p_new_units_loose: 15,
     p_user_id: userId,
     p_reason: 'Inventário mensal'
   });
   ```

5. **Database:**
   - Loja 2: 5p/10u → **8p/15u** ✅
   - Total recalculado: Loja1 (5p/10u) + Loja2 (8p/15u) = **13p/25u**
   - Cria registro em `stock_movements`

---

## 🚀 Deployment (Produção)

### Checklist Pré-Deploy

**CRÍTICO:** Este sistema foi restaurado após ter sido removido em v3.5.4.
A migração PRESERVA dados existentes baseado em histórico de transferências.

#### 1. Backup

```bash
# Fazer backup completo do banco ANTES de aplicar migrations
# Especialmente importante: tabela store_transfers (histórico)
```

#### 2. Validação de Dados

```sql
-- Verificar quantos registros de transferência existem
SELECT COUNT(*) FROM store_transfers;

-- Verificar produtos mais transferidos
SELECT
  p.name,
  COUNT(*) as transfer_count
FROM store_transfers st
JOIN products p ON p.id = st.product_id
GROUP BY p.name
ORDER BY transfer_count DESC
LIMIT 10;
```

#### 3. Aplicar Migrations (Ordem CRÍTICA)

```bash
# Step 1: Adicionar colunas (sem popular)
npm run migration:apply -- 20251127002110_restore_multistore_step1_add_columns.sql

# Step 2: Popular baseado em histórico (INTELIGENTE)
npm run migration:apply -- 20251127002158_restore_multistore_step2_populate_from_history.sql

# ⚠️ ATENÇÃO: Monitor os logs RAISE NOTICE
# Verificar se estoque foi calculado corretamente
# Se houver erro de "inconsistência", migration FAZ ROLLBACK automático

# Step 3: Atualizar RPCs
npm run migration:apply -- 20251127002316_restore_multistore_step3_update_rpcs.sql
```

#### 4. Deploy Código

```bash
# Deploy no Vercel (frontend)
git push origin main
```

#### 5. Validação Pós-Deploy

```sql
-- Verificar produtos na Loja 2 (devem aparecer os transferidos)
SELECT
  p.name,
  p.store1_stock_packages,
  p.store1_stock_units_loose,
  p.store2_stock_packages,
  p.store2_stock_units_loose,
  p.stock_packages as total_packages,
  p.stock_units_loose as total_units
FROM products p
WHERE p.store2_stock_packages > 0
   OR p.store2_stock_units_loose > 0;

-- Verificar integridade (soma das lojas = total)
SELECT COUNT(*) as inconsistent_products
FROM products
WHERE deleted_at IS NULL
  AND (
    (store1_stock_packages + store2_stock_packages) != stock_packages
    OR
    (store1_stock_units_loose + store2_stock_units_loose) != stock_units_loose
  );
-- Esperado: 0
```

---

## 🧪 Testing

### Cenário de Teste 1: Produto Novo

**Setup:**
```typescript
// Criar produto com 10p/20u
const { data } = await supabase
  .from('products')
  .insert({
    name: 'Teste Multi-Store',
    stock_packages: 10,
    stock_units_loose: 20,
    store1_stock_packages: 10,
    store1_stock_units_loose: 20,
    store2_stock_packages: 0,
    store2_stock_units_loose: 0
  });
```

**Validações:**
- ✅ Produto aparece na aba "Loja 1"
- ✅ Produto NÃO aparece na aba "Loja 2"

### Cenário de Teste 2: Transferência

**Setup:**
```typescript
// Transferir 5p/10u para Loja 2
await supabase.rpc('execute_store_transfer', {
  p_product_id: productId,
  p_from_store: 1,
  p_to_store: 2,
  p_packages: 5,
  p_units_loose: 10,
  p_user_id: userId
});
```

**Validações:**
- ✅ Loja 1 mostra 5p/10u
- ✅ Loja 2 mostra 5p/10u
- ✅ Total mantido: 10p/20u
- ✅ Registro criado em `store_transfers`

### Cenário de Teste 3: Validação de Estoque

**Setup:**
```typescript
// Tentar transferir mais do que tem
await supabase.rpc('execute_store_transfer', {
  p_product_id: productId,
  p_from_store: 1,
  p_to_store: 2,
  p_packages: 100, // Loja 1 só tem 5p
  p_units_loose: 10,
  p_user_id: userId
});
```

**Validações:**
- ✅ RPC retorna erro: "Insufficient packages in store 1: has 5, requested 100"
- ✅ Estoque NÃO é alterado

---

## 🐛 Troubleshooting

### Problema: Produtos aparecem em ambas as lojas ao cadastrar

**Sintoma:** Produto recém-criado aparece em Loja 1 E Loja 2

**Causa:** Cache do React Query compartilhado entre lojas

**Solução:**
```typescript
// useProductsGridLogic.ts - Garantir queryKey diferenciada
queryKey: ['products', 'available', storeFilter || 'all', stockFilter || 'all']

// NewProductModal.tsx - Invalidar múltiplas queries
queryClient.invalidateQueries({ queryKey: ['products', 'available'] });
queryClient.invalidateQueries({ queryKey: ['products', 'store'] });
```

### Problema: Estoque total inconsistente

**Sintoma:** `stock_packages` diferente de `store1_stock_packages + store2_stock_packages`

**Causa:** Atualização manual sem recalcular total

**Solução:**
```sql
-- Recalcular campos legacy para todos os produtos
UPDATE products
SET
  stock_packages = store1_stock_packages + store2_stock_packages,
  stock_units_loose = store1_stock_units_loose + store2_stock_units_loose
WHERE deleted_at IS NULL;
```

### Problema: Migration Step 2 falha com "inconsistência"

**Sintoma:** Migration reverte com erro de validação

**Causa:** Dados corrompidos ou transferências inválidas

**Investigação:**
```sql
-- Identificar produtos problemáticos
SELECT
  p.id,
  p.name,
  p.stock_packages as total,
  (SELECT SUM(packages) FROM store_transfers WHERE product_id = p.id AND to_store = 2) as transferido_loja2,
  (SELECT SUM(packages) FROM store_transfers WHERE product_id = p.id AND from_store = 2) as retirado_loja2
FROM products p
WHERE deleted_at IS NULL;
```

---

## 📚 Referências

### Arquivos Relacionados

**Database:**
- `supabase/migrations/20251127002110_restore_multistore_step1_add_columns.sql`
- `supabase/migrations/20251127002158_restore_multistore_step2_populate_from_history.sql`
- `supabase/migrations/20251127002316_restore_multistore_step3_update_rpcs.sql`

**Types:**
- `src/core/types/inventory.types.ts` - StoreTransfer, StoreTransferInput

**Hooks:**
- `src/features/inventory/hooks/useStoreInventory.ts`
- `src/shared/hooks/products/useProductsGridLogic.ts`

**Components:**
- `src/features/inventory/components/NewProductModal.tsx`
- `src/features/inventory/components/StoreTransferModal.tsx`

### Migration History

- **v3.4.0**: Sistema multi-store criado
- **v3.5.4**: Sistema multi-store REMOVIDO (tabela dropada)
- **v3.6.0**: Sistema multi-store RESTAURADO (tabela preservada)

---

**Última Atualização:** 2025-11-27
**Autor:** Claude Code
**Status:** ✅ Documentação completa e validada
