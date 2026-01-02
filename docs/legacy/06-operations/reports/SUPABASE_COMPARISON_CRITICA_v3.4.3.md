# 🔥 ANÁLISE CRÍTICA: DEV vs PROD - Por Que o Deploy Falhou

**Data:** 2025-10-30
**Versão Analisada:** v3.4.0 multi-store (commit 4555e07)
**Status:** 🔴 PRODUÇÃO BLOQUEADA - Migrations Faltantes

---

## 🚨 RESUMO EXECUTIVO

**Commit `4555e07` QUEBROU produção porque:**
1. ❌ PROD não tem tabela `store_transfers`
2. ❌ PROD não tem colunas multi-store em `products`
3. ❌ PROD não tem migration `20251025185108_add_multi_store_support`

**Frontend tenta ler estas colunas/tabelas → Supabase retorna erro → Console logs cheios de erros**

---

## 🔍 DESCOBERTAS CRÍTICAS

### 1. Tabela `store_transfers` Não Existe em PROD

**DEV:**
```sql
✅ store_transfers EXISTS
   - Criada pela migration 20251025185108
   - Contém 2 registros de transferência
   - RLS habilitado
```

**PROD:**
```sql
❌ store_transfers NÃO EXISTE
   - Erro ao executar queries: "relation store_transfers does not exist"
   - Frontend tentou buscar: SELECT * FROM store_transfers WHERE to_store = 2
   - Resultado: CRASH da página de estoque
```

**Impacto:**
- 🔴 BLOQUEANTE para v3.4.0 e v3.4.3
- Commit 4555e07 usa esta tabela em `useStoreInventory.ts`
- v3.4.3 usa esta tabela em `useProductsGridLogic.ts`

---

### 2. Colunas Multi-Store Não Existem em PROD

**DEV - Tabela `products`:**
```sql
✅ store1_stock_packages (smallint, default 0)
✅ store1_stock_units_loose (smallint, default 0)
✅ store2_stock_packages (smallint, default 0)
✅ store2_stock_units_loose (smallint, default 0)
```

**PROD - Tabela `products`:**
```sql
❌ store1_stock_packages NÃO EXISTE
❌ store1_stock_units_loose NÃO EXISTE
❌ store2_stock_packages NÃO EXISTE
❌ store2_stock_units_loose NÃO EXISTE

✅ Tem apenas:
   - stock_packages (integer, legacy)
   - stock_units_loose (integer, legacy)
```

**Código problemático em commit 4555e07:**
```typescript
// useProductsGridLogic.ts (linhas 56-60)
if (storeFilter === 'store1') {
  query = query.or('store1_stock_packages.gt.0,store1_stock_units_loose.gt.0');
} else if (storeFilter === 'store2') {
  query = query.or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
}
```

**Erro gerado:**
```
column "store2_stock_packages" does not exist
```

**Impacto:**
- 🔴 BLOQUEANTE para v3.4.0 e v3.4.3
- Qualquer SELECT que menciona essas colunas falha
- Frontend não consegue renderizar aba de estoque

---

### 3. Migration Multi-Store Não Aplicada em PROD

**DEV - Migrations Multi-Store:**
```
✅ 20251025185108_add_multi_store_support (APLICADA)
✅ 20251025233113_fix_inventory_movement_multistore_v2 (APLICADA)
✅ 20251025233405_fix_inventory_movement_multistore_v3 (APLICADA)
```

**PROD - Última Migration:**
```
❌ 20251003123451_add_product_description_legacy_to_sale_items (ÚLTIMA)
❌ Nenhuma migration multi-store aplicada
❌ Schema está 1 mês desatualizado em relação ao DEV
```

**Gap de Migrations:**
- PROD parou em: 2025-10-03
- DEV avançou para: 2025-10-25
- **22 dias de diferença!**

---

## 📊 COMPARAÇÃO DETALHADA

### Tabelas em DEV mas NÃO em PROD

| Tabela | DEV | PROD | Impacto |
|--------|-----|------|---------|
| `store_transfers` | ✅ EXISTS | ❌ MISSING | 🔴 BLOQUEANTE |
| `_deleted_objects_backup` | ✅ EXISTS | ❌ MISSING | 🟡 Não crítico |

### Tabelas em PROD mas NÃO em DEV (limpeza necessária)

| Tabela | DEV | PROD | Ação |
|--------|-----|------|------|
| `csv_delivery_data` | ❌ Removida | ✅ EXISTS | Deletar em PROD |
| `product_variants_backup` | ❌ Removida | ✅ EXISTS | Deletar em PROD |
| `sale_items_teste_backup` | ❌ N/A | ✅ EXISTS | Deletar em PROD |
| `sales_teste_backup` | ❌ N/A | ✅ EXISTS | Deletar em PROD |

### Colunas Faltantes em `products` (PROD)

| Coluna | Tipo | Default | Crítico? |
|--------|------|---------|----------|
| `store1_stock_packages` | smallint | 0 | 🔴 SIM |
| `store1_stock_units_loose` | smallint | 0 | 🔴 SIM |
| `store2_stock_packages` | smallint | 0 | 🔴 SIM |
| `store2_stock_units_loose` | smallint | 0 | 🔴 SIM |
| `deleted_at` | timestamptz | null | 🟡 Moderado |
| `deleted_by` | uuid | null | 🟡 Moderado |

---

## 🔥 POR QUE O DEPLOY FALHOU

### Sequência do Erro

1. **Vercel Deploy** do commit 4555e07
2. **Frontend carrega** página de estoque
3. **React Query executa:**
   ```typescript
   const { data: products } = useQuery({
     queryFn: async () => {
       const { data } = await supabase
         .from('products')
         .select('..., store2_stock_packages, store2_stock_units_loose, ...')
         .or('store2_stock_packages.gt.0,store2_stock_units_loose.gt.0');
       return data;
     }
   });
   ```
4. **Supabase retorna erro:**
   ```json
   {
     "code": "42703",
     "message": "column \"store2_stock_packages\" does not exist",
     "hint": "Perhaps you meant to reference the column \"products.stock_packages\"."
   }
   ```
5. **Frontend:**
   - Console log: 🔴 Error fetching products
   - Página de estoque: ❌ Não carrega
   - Usuário: "Não consigo entrar em estoque"

6. **Rollback necessário** para commit b31f925 (estável)

---

## 💡 POR QUE v3.4.3 TAMBÉM VAI FALHAR (Se Deployar Agora)

v3.4.3 usa **mesma dependência**:

```typescript
// useProductsGridLogic.ts (v3.4.3 - NÃO COMMITADO AINDA)
if (storeFilter === 'store2') {
  // 1. Buscar transfers (TABELA NÃO EXISTE EM PROD!)
  const { data: transfers } = await supabase
    .from('store_transfers')  // ← 💥 CRASH!
    .select('product_id')
    .eq('to_store', 2);

  // 2. Filtrar produtos
  const { data } = await supabase
    .from('products')
    .select('..., store2_stock_packages, ...')  // ← 💥 CRASH!
    .in('id', productIds);
}
```

**Resultado:** Mesmo erro que 4555e07!

---

## ✅ SOLUÇÃO

### Fase 1: Aplicar Migrations em PROD

**CRÍTICO:** Executar em ordem:

1. **Backup completo de PROD** (obrigatório)
2. **Aplicar migration:**
   ```
   20251025185108_add_multi_store_support.sql
   ```
3. **Validar:**
   - ✅ Colunas `store*_stock_*` existem
   - ✅ Tabela `store_transfers` existe
   - ✅ RLS habilitado
   - ✅ Índices criados

### Fase 2: Re-deploy v3.4.3

**Somente após Fase 1 completa:**
- Aplicar correções v3.4.3 no código local
- Commit + push
- Deploy na Vercel
- Validar sem erros

---

## 🔐 DADOS DE PRODUÇÃO (925+ Registros)

### Estado Atual PROD

**Produtos:**
- Total: ~925 produtos cadastrados
- Todos com `stock_packages` e `stock_units_loose` (campos legacy)
- **Nenhum** tem campos `store1_*` ou `store2_*`

### Migration vai fazer:

```sql
-- Adicionar colunas com valores padrão
ALTER TABLE products
  ADD COLUMN store1_stock_packages SMALLINT DEFAULT 0,
  ADD COLUMN store1_stock_units_loose SMALLINT DEFAULT 0,
  ADD COLUMN store2_stock_packages SMALLINT DEFAULT 0,
  ADD COLUMN store2_stock_units_loose SMALLINT DEFAULT 0;

-- Copiar dados legacy para store1 (Loja 1)
UPDATE products
SET store1_stock_packages = stock_packages,
    store1_stock_units_loose = stock_units_loose
WHERE deleted_at IS NULL;
```

**Impacto:**
- ✅ **ZERO perda de dados** (apenas adiciona colunas)
- ✅ Dados migrados automaticamente
- ✅ Campos legacy mantidos (backward compatibility)
- ⏱️ Tempo estimado: ~30 segundos (925 registros)

---

## ⚠️ RISCOS E MITIGAÇÕES

### Risco 1: Downtime Durante Migration

**Severidade:** 🟡 Média
**Probabilidade:** Alta
**Impacto:** Sistema indisponível por ~1-2 minutos

**Mitigação:**
- ✅ Executar em horário de baixo uso (madrugada)
- ✅ Avisar usuários com antecedência
- ✅ Ter backup pronto para rollback

---

### Risco 2: Migration Falhar

**Severidade:** 🔴 Crítica
**Probabilidade:** Baixa
**Impacto:** Sistema fica offline

**Mitigação:**
- ✅ Backup completo ANTES da migration
- ✅ Testar migration em cópia do banco primeiro
- ✅ Plano de rollback documentado

---

### Risco 3: RLS Bloquear Acesso

**Severidade:** 🔴 Crítica
**Probabilidade:** Média
**Impacto:** Usuários não conseguem acessar dados

**Mitigação:**
- ✅ Validar políticas RLS após migration
- ✅ Testar com diferentes roles (admin, employee)
- ✅ Ter queries de correção prontas

---

## 📋 CHECKLIST PRÉ-DEPLOY

### Pré-requisitos OBRIGATÓRIOS

- [ ] Backup completo de PROD criado
- [ ] Janela de manutenção agendada
- [ ] Cliente informado e aprovou
- [ ] Plano de rollback documentado
- [ ] Queries de validação preparadas
- [ ] Equipe de suporte em standby

### Validação Pós-Migration

- [ ] Colunas `store*_stock_*` existem
- [ ] Tabela `store_transfers` existe
- [ ] RLS habilitado em ambas
- [ ] Índices criados corretamente
- [ ] Dados migrados (925 produtos)
- [ ] Admin consegue acessar estoque
- [ ] Employee consegue acessar estoque
- [ ] Sem erros no console do navegador

### Validação Pós-Deploy v3.4.3

- [ ] Aba Loja 1 funciona
- [ ] Aba Loja 2 funciona
- [ ] Transferência funciona
- [ ] Contadores corretos
- [ ] Performance aceitável (<2s load)
- [ ] Sem erros no Supabase logs
- [ ] Sem erros no Vercel logs

---

## 🎯 PRÓXIMOS PASSOS

### 1. Criar Plano de Migração Detalhado ✅ (próximo documento)

`MIGRATION_PLAN_PROD.md` com:
- SQL exato a executar
- Passos de validação
- Plano de rollback
- Checklist de execução

### 2. Agendar Janela de Manutenção

**Sugerido:**
- Data: A combinar com cliente
- Horário: 02:00-04:00 (madrugada)
- Duração: 2 horas (buffer)
- Downtime esperado: ~5 minutos

### 3. Executar Migration em PROD

**Somente após aprovação do cliente**

### 4. Re-implementar v3.4.3

**Somente após migration bem-sucedida**

---

## 📚 REFERÊNCIAS

### Documentação Relacionada

1. `docs/07-changelog/CHANGELOG_v3.4.3.md` - Mudanças v3.4.3
2. `docs/06-operations/guides/GUIA_ANALISE_DEV_VS_PROD.md` - Guia de análise
3. `docs/06-operations/guides/MIGRATIONS_GUIDE.md` - Guia de migrations

### Migrations Relevantes

- `supabase/migrations/20251025185108_add_multi_store_support.sql`
- `supabase/migrations/20251029221031_remove_orphan_tables_and_functions.sql`

### Commits Relevantes

- `4555e07` - Commit que quebrou PROD (v3.4.0 multi-store)
- `b31f925` - Commit estável (rollback target)

---

**Última Atualização**: 2025-10-30
**Autor**: Claude Code AI
**Status**: 🔴 CRÍTICO - Migration Obrigatória Antes de Qualquer Deploy
**Aprovação Necessária**: Cliente + Equipe Técnica
