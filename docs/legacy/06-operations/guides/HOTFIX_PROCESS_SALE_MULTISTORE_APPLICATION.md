# 🚨 HOTFIX P0 - Aplicação de Migration process_sale Multistore

**Documento:** Procedimento de Aplicação de Hotfix Crítico
**Versão:** 1.0.0
**Data:** 2025-11-02
**Status:** ⚠️ URGENTE - P0 (Executar Imediatamente)
**Autor:** Sistema de Análise e Correção de Bugs

---

## 📋 Contexto do Problema

### Bug Reportado
**Sintoma:** Vendas falham ao finalizar com erro 400 "Estoque insuficiente... disponível 0, solicitado 1"

**Situação Atual:**
- ✅ **Frontend corrigido** (commit `af49d94`, 02/11/2025): Lê `store1_stock_units_loose = 9` corretamente
- ❌ **Backend não corrigido**: RPC `process_sale` usa campos LEGACY (`stock_packages`, `stock_units_loose`) que retornam 0

**Impacto:**
- **Severidade:** P0 - CRÍTICO
- **Afetados:** 100% das vendas em PROD
- **Operacional:** Sistema de vendas completamente bloqueado
- **Financeiro:** Perda de receita contínua

### Análise de Causa Raiz

**Root Cause Confirmada:**
A function `process_sale` **nunca foi migrada** para usar colunas multistore.

**Evidências:**
```sql
-- LINHA 8025 (pacotes) - ❌ LEGACY
SELECT stock_packages INTO v_current_packages
FROM products WHERE id = v_product_id;

-- LINHA 8050 (unidades) - ❌ LEGACY
SELECT stock_units_loose INTO v_current_units
FROM products WHERE id = v_product_id;
```

**Problema:** Essas colunas não são mais atualizadas desde migration `20251025000001_fix_inventory_movement_multistore.sql` (v2.1.0).

---

## 🎯 Solução Aplicada

### Migration Criada
- **Arquivo:** `supabase/migrations/20251102000000_fix_process_sale_multistore_complete.sql`
- **Data de criação:** 02/11/2025
- **Tamanho:** 236 linhas (8.5 KB)
- **Tipo:** `CREATE OR REPLACE FUNCTION` (atômica, sem downtime)

### Correções Incluídas

#### Correção 1: Multistore (Linha 110)
```sql
-- ANTES:
SELECT stock_packages INTO v_current_packages
FROM products WHERE id = v_product_id;

-- DEPOIS:
SELECT store1_stock_packages INTO v_current_store1_packages
FROM products
WHERE id = v_product_id
  AND deleted_at IS NULL;
```

#### Correção 2: Multistore (Linha 143)
```sql
-- ANTES:
SELECT stock_units_loose INTO v_current_units
FROM products WHERE id = v_product_id;

-- DEPOIS:
SELECT store1_stock_units_loose INTO v_current_store1_units
FROM products
WHERE id = v_product_id
  AND deleted_at IS NULL;
```

#### Correção 3: Soft Delete
- Adicionado filtro `AND deleted_at IS NULL` em ambos os SELECTs
- Previne tentativa de venda de produtos deletados

#### Correção 4: Validação Melhorada
- Adicionada validação `IF NOT FOUND` após cada SELECT
- Mensagem de erro clara: "Produto X não encontrado ou foi excluído"

---

## 📝 Procedimento de Aplicação em PROD

### ⚠️ PRÉ-REQUISITOS

#### 1. Verificação de Acesso
- [ ] Acesso ao Supabase Dashboard PROD
- [ ] URL: https://supabase.com/dashboard/project/uujkzvbgnfzuzlztrzln
- [ ] Usuário com permissão de `SECURITY DEFINER` functions

#### 2. Backup Automático
Supabase mantém backups automáticos. Para verificar:
```
Dashboard → Settings → Database → Backups
```
**Validação:**
- [ ] Último backup < 24 horas
- [ ] Backup status: "Completed"

#### 3. Arquivo de Migration
- [ ] Arquivo existe: `supabase/migrations/20251102000000_fix_process_sale_multistore_complete.sql`
- [ ] Tamanho: ~8.5 KB (236 linhas)
- [ ] Contém: `CREATE OR REPLACE FUNCTION public.process_sale`

---

### 🚀 PROCEDIMENTO DE APLICAÇÃO

#### Opção A: Via Supabase Dashboard (RECOMENDADO)

**Tempo estimado:** 5 minutos

##### Passo 1: Abrir SQL Editor (1 min)
1. Acessar: https://supabase.com/dashboard/project/uujkzvbgnfzuzlztrzln
2. Ir para: **SQL Editor**
3. Clicar em: **+ New Query**

##### Passo 2: Copiar Migration (1 min)
1. Abrir arquivo local: `supabase/migrations/20251102000000_fix_process_sale_multistore_complete.sql`
2. Copiar **TODO o conteúdo** (Ctrl+A, Ctrl+C)
3. Colar no SQL Editor do Supabase

##### Passo 3: Revisar SQL (1 min)
**Checklist de revisão rápida:**
- [ ] Primeira linha: `-- Migration: Fix process_sale to use multistore columns`
- [ ] Linha ~110: `SELECT store1_stock_packages`
- [ ] Linha ~113: `AND deleted_at IS NULL`
- [ ] Linha ~143: `SELECT store1_stock_units_loose`
- [ ] Linha ~146: `AND deleted_at IS NULL`
- [ ] Última seção: `COMMENT ON FUNCTION` com versão v2.2.0

##### Passo 4: Executar Migration (30 seg)
1. Clicar no botão: **Run** (ou Ctrl+Enter)
2. Aguardar mensagem de sucesso
3. **Resultado esperado:**
   ```
   Success. No rows returned.
   ```

**Se houver erro:**
- Copiar mensagem de erro completa
- NÃO tentar novamente sem análise
- Reportar erro para análise técnica

##### Passo 5: Validar Aplicação (2 min)
Executar query de validação:

```sql
-- 1. Verificar se function usa colunas multistore
SELECT
  proname as function_name,
  CASE
    WHEN pg_get_functiondef(oid) LIKE '%store1_stock_packages%' THEN 'OK: Usa multistore'
    ELSE 'ERRO: Usa legacy'
  END as validation_multistore,
  CASE
    WHEN pg_get_functiondef(oid) LIKE '%deleted_at IS NULL%' THEN 'OK: Filtra soft delete'
    ELSE 'ERRO: Não filtra'
  END as validation_soft_delete
FROM pg_proc
WHERE proname = 'process_sale'
  AND pronamespace = 'public'::regnamespace;
```

**Resultado esperado:**
```
function_name | validation_multistore  | validation_soft_delete
--------------|-----------------------|------------------------
process_sale  | OK: Usa multistore    | OK: Filtra soft delete
```

---

#### Opção B: Via Supabase CLI (Alternativa)

**Tempo estimado:** 3 minutos

##### Pré-requisito: Supabase CLI configurado
```bash
# Verificar se CLI está instalada
supabase --version

# Verificar se está linkado ao projeto PROD
supabase projects list
```

##### Aplicar Migration
```bash
cd "/mnt/d/1. LUCCAS/aplicativos ai/adega/solid-foundation-adega-manager"

# Aplicar migration em PROD
supabase db push --project-ref uujkzvbgnfzuzlztrzln
```

**Validar:**
```bash
# Verificar status de migrations
supabase migration list --project-ref uujkzvbgnfzuzlztrzln
```

---

### ✅ VALIDAÇÕES PÓS-APLICAÇÃO

#### Validação 1: SQL - Function Atualizada (OBRIGATÓRIA)
```sql
-- Verificar versão da function
SELECT
  proname,
  pg_get_functiondef(oid) LIKE '%store1_stock%' as uses_multistore,
  pg_get_functiondef(oid) LIKE '%deleted_at IS NULL%' as filters_soft_delete
FROM pg_proc
WHERE proname = 'process_sale'
  AND pronamespace = 'public'::regnamespace;
```

**Resultado esperado:**
```
proname       | uses_multistore | filters_soft_delete
--------------|-----------------|--------------------
process_sale  | true            | true
```

#### Validação 2: SQL - Contar Estoque do Produto de Teste
```sql
-- Produto "Original 269ml pc/15" (exemplo)
SELECT
  id,
  name,
  store1_stock_packages as pacotes_loja1,
  store1_stock_units_loose as unidades_loja1,
  stock_packages as pacotes_legacy,    -- Deve ser NULL ou 0
  stock_units_loose as unidades_legacy  -- Deve ser NULL ou 0
FROM products
WHERE name ILIKE '%Original 269ml%'
  AND deleted_at IS NULL;
```

**Resultado esperado:**
```
name                  | pacotes_loja1 | unidades_loja1 | pacotes_legacy | unidades_legacy
----------------------|---------------|----------------|----------------|----------------
Original 269ml pc/15  | 75            | 9              | NULL/0         | NULL/0
```

#### Validação 3: Teste Funcional - Venda Real (OBRIGATÓRIA)

**Procedimento:**
1. Acessar aplicação em PROD (Vercel)
2. Ir para módulo **Vendas (PDV)**
3. Adicionar produto "Original 269ml pc/15" ao carrinho
   - Tipo: **Unidade Individual**
   - Quantidade: **1**
4. Clicar em **Finalizar Venda**
5. Preencher dados:
   - Cliente: Qualquer
   - Método de pagamento: Qualquer
   - Valor: 10.00 (ou conforme preço do produto)
6. Confirmar venda

**Resultado esperado:**
- ✅ Venda finalizada **SEM ERRO**
- ✅ Mensagem de sucesso: "Venda processada com sucesso"
- ✅ Console do navegador **SEM ERRO 400**
- ✅ Estoque decrementado: `store1_stock_units_loose` agora é 8 (era 9)

**Se falhar:**
- Copiar erro completo do console
- Verificar se migration foi realmente aplicada (Validação 1)
- NÃO tentar mais vendas até diagnosticar

#### Validação 4: SQL - Verificar Movimento de Estoque Criado
```sql
-- Verificar se movimento foi criado para a última venda
SELECT
  im.id,
  im.product_id,
  p.name as product_name,
  im.quantity_change,
  im.new_stock_quantity,
  im.type_enum,
  im.metadata->>'sale_id' as sale_id,
  im.created_at
FROM inventory_movements im
JOIN products p ON p.id = im.product_id
WHERE p.name ILIKE '%Original 269ml%'
ORDER BY im.created_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
product_name          | quantity_change | new_stock_quantity | type_enum | sale_id      | created_at
----------------------|-----------------|-------------------|-----------|--------------|------------
Original 269ml pc/15  | -1              | 8                 | sale      | [UUID]       | 2025-11-02 ...
```

---

### 🔄 PLANO DE ROLLBACK (Se Necessário)

**Probabilidade:** 🟢 Muito Baixa (< 1%)
**Tempo de execução:** < 2 minutos

#### Quando Fazer Rollback?
- Migration causou erro na aplicação
- Vendas continuam falhando após aplicação
- Erro SQL crítico não previsto

#### Procedimento de Rollback

##### Opção 1: Via SQL Editor (RÁPIDO)
```sql
-- Restaurar versão LEGACY da function
-- (Disponível em supabase/schema_producao.sql linhas 7948-8101)

CREATE OR REPLACE FUNCTION public.process_sale(...)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
-- [Código original com stock_packages e stock_units_loose]
$$;
```

**Arquivo de rollback:** `supabase/schema_producao.sql` (linhas 7948-8101)

##### Opção 2: Via Supabase Time Travel (SE DISPONÍVEL)
```
Dashboard → Settings → Database → Point in Time Recovery
```
1. Selecionar timestamp: Antes da aplicação da migration
2. Restaurar apenas a function `process_sale`

#### Após Rollback
- [ ] Documentar motivo do rollback
- [ ] Reportar erro encontrado
- [ ] Aguardar análise técnica antes de reaplicar
- [ ] Sistema voltará ao estado anterior: **Vendas bloqueadas** (bug original persiste)

---

## 📊 Monitoramento Pós-Aplicação

### Período de Monitoramento
**Duração:** 24 horas após aplicação

### Métricas a Monitorar

#### 1. Logs de Erro (Supabase Dashboard)
```
Dashboard → Logs → Error Logs
```
**Filtros:**
- Timeframe: Last 1 hour
- Filter: `process_sale`

**Alerta se:**
- Aparecer erro "Estoque insuficiente... disponível 0"
- Aparecer erro "Produto não encontrado"
- Taxa de erro > 0.5%

#### 2. Taxa de Sucesso de Vendas (Frontend)
**Monitorar:**
- Console do navegador (erros 400)
- Feedback de usuários (vendas não finalizando)
- Dashboard de vendas (volume normal de vendas)

**Alerta se:**
- Vendas continuam falhando
- Console mostra erro 400 recorrente
- Usuários reportam impossibilidade de vender

#### 3. Integridade de Estoque (SQL Query)
```sql
-- Executar a cada 4 horas nas primeiras 24h
SELECT
  COUNT(*) as total_products,
  COUNT(CASE WHEN store1_stock_units_loose > 0 THEN 1 END) as products_with_units,
  COUNT(CASE WHEN store1_stock_packages > 0 THEN 1 END) as products_with_packages,
  SUM(store1_stock_units_loose) as total_units,
  SUM(store1_stock_packages) as total_packages
FROM products
WHERE deleted_at IS NULL;
```

**Alerta se:**
- `total_units` ou `total_packages` decresce anormalmente
- Estoque negativo aparece (não deveria ser possível)

---

## 📈 Métricas de Sucesso

### KPIs de Aplicação Bem-Sucedida

| Métrica | Antes | Depois | Status |
|---------|-------|--------|--------|
| **Vendas finalizadas com sucesso** | 0% | 100% | [ ] Validar |
| **Erro 400 "Estoque insuficiente"** | 100% | 0% | [ ] Validar |
| **Function usa multistore** | ❌ Não | ✅ Sim | [ ] Validar |
| **Function filtra soft delete** | ❌ Não | ✅ Sim | [ ] Validar |
| **Downtime observado** | - | 0 min | [ ] Validar |

### Critérios de Sucesso COMPLETO ✅

- [ ] Migration aplicada sem erros SQL
- [ ] Validação 1 (SQL): Function usa `store1_stock_*` ✅
- [ ] Validação 2 (SQL): Produto de teste tem estoque correto ✅
- [ ] Validação 3 (Funcional): Venda de teste finalizada com sucesso ✅
- [ ] Validação 4 (SQL): Movimento de estoque criado ✅
- [ ] Sem erros nos logs nas primeiras 2 horas
- [ ] Cliente confirmou que vendas estão funcionando

---

## 🎓 Lições Aprendidas e Prevenção

### Root Cause Analysis

**Por que este bug aconteceu?**
1. Migration `20251101120000_fix_process_sale_soft_delete_multistore.sql` tinha nome enganoso
2. O arquivo dizia "Fix process_sale" mas só corrigia `create_inventory_movement`
3. Faltou grep abrangente por todas as ocorrências de `stock_packages` e `stock_units_loose`
4. Faltou teste E2E do fluxo completo de venda (frontend → backend → banco)

### Ações Preventivas Futuras

#### 1. Migrations Multistore - Checklist Obrigatório
Ao criar migration que muda estrutura de dados:
- [ ] Grep por **TODAS** as ocorrências de campos antigos:
  ```bash
  grep -r "stock_packages\|stock_units_loose" supabase/
  ```
- [ ] Atualizar **TODAS** as functions que usam os campos
- [ ] Adicionar comentário em cada function com versão (ex: `v2.2.0`)
- [ ] Criar testes E2E que validem o fluxo completo

#### 2. Code Review de Migrations - Questões Obrigatórias
- ✅ Migration corrige TODAS as functions mencionadas no título?
- ✅ Grep confirma que não há outras ocorrências do campo antigo?
- ✅ Testes E2E validam o fluxo afetado?
- ✅ Rollback documentado e testado?

#### 3. Lint Rule para Detectar Campos DEPRECATED
```javascript
// ESLint custom rule (futuro)
'no-restricted-strings': ['error', {
  strings: [
    {
      pattern: 'stock_packages[^_]',
      message: 'Use store1_stock_packages ou store2_stock_packages'
    },
    {
      pattern: 'stock_units_loose',
      message: 'Use store1_stock_units_loose ou store2_stock_units_loose'
    }
  ]
}]
```

---

## 📞 Suporte e Escalação

### Responsáveis Técnicos
- **Backend/Database:** [Nome do DBA]
- **Frontend:** [Nome do Frontend Lead]
- **DevOps:** [Nome do DevOps Lead]

### Canais de Comunicação
- **Slack:** #ops-hotfix-prod
- **E-mail:** ops-urgent@adegamanager.com
- **Telefone Emergência:** [Número]

### Escalação em Caso de Problemas
1. **Primeiro Contato:** DBA/Backend Lead
2. **Backup:** DevOps Lead
3. **Último Recurso:** CTO/Arquiteto Principal

---

## ✅ CHECKLIST FINAL DE EXECUÇÃO

### Pré-Aplicação
- [ ] Backup PROD verificado (< 24h)
- [ ] Arquivo de migration existe e foi revisado
- [ ] Acesso ao Supabase Dashboard PROD confirmado
- [ ] Time técnico notificado sobre hotfix

### Aplicação
- [ ] SQL copiado para SQL Editor
- [ ] SQL revisado visualmente (store1_*, deleted_at IS NULL)
- [ ] Migration executada com sucesso ("No rows returned")

### Validações
- [ ] Validação 1 (SQL): Function usa multistore ✅
- [ ] Validação 2 (SQL): Estoque do produto de teste correto ✅
- [ ] Validação 3 (Funcional): Venda de teste finalizada ✅
- [ ] Validação 4 (SQL): Movimento de estoque criado ✅

### Pós-Aplicação
- [ ] Monitoramento configurado (24h)
- [ ] Cliente informado sobre correção
- [ ] Logs sem erros nas primeiras 2 horas
- [ ] Documentação atualizada

---

## 📚 Referências

- **Migration:** `supabase/migrations/20251102000000_fix_process_sale_multistore_complete.sql`
- **Relatório de Investigação:** (disponível no histórico da conversa)
- **Hotfix Frontend:** Commit `af49d94` (02/11/2025 02:53)
- **Migration create_inventory_movement:** `20251101120000_fix_process_sale_soft_delete_multistore.sql`
- **Schema Produção:** `supabase/schema_producao.sql` (linhas 7948-8101)

---

**Documento Finalizado - Pronto para Execução**

**Próximos Passos:**
1. Revisar este documento com DBA/Backend Lead
2. Executar procedimento de aplicação (Opção A recomendada)
3. Executar todas as 4 validações obrigatórias
4. Confirmar com cliente que vendas estão funcionando
5. Monitorar por 24 horas
6. Marcar hotfix como concluído após confirmação

---

*Gerado automaticamente pelo Sistema de Correção de Bugs P0 - Adega Manager*
*Data: 02/11/2025*
*Versão: 1.0.0*
