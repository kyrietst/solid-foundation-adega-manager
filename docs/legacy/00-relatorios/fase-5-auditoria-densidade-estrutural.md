# Fase 5: Auditoria de Densidade Estrutural - Relatório

## 📊 Resumo Executivo

Analisamos 4 áreas críticas do banco de dados (24 tabelas total) e encontramos **oportunidades significativas de otimização**.

---

## 🔴 1. O "Monstro" de Produtos (38 Colunas)

### Estrutura Atual
A tabela `products` possui **38 colunas**, sendo uma das mais complexas do sistema.

### Colunas Detectadas (Lista Completa)
1. `id`, `name`, `description`, `price`
2. `stock_quantity`, `category`, `alcohol_content`
3. `image_url`, `created_at`, `updated_at`
4. `supplier`, `cost_price`, `margin_percent`
5. `unit_type`, `package_size`, `package_price`, `package_margin`
6. `turnover_rate`, `last_sale_date`, `volume_ml`
7. `barcode`, `is_package`, `units_per_package`
8. `package_barcode`, `unit_barcode`, `packaging_type`
9. `has_package_tracking`, `has_unit_tracking`, `package_units`
10. `expiry_date`, `has_expiry_tracking`
11. `stock_packages`, `stock_units_loose`
12. `deleted_at`, `deleted_by`, `minimum_stock`
13. **`store2_holding_packages`** ⚠️ (EM USO: 3 valores únicos, max=7)
14. **`store2_holding_units_loose`** ⚠️ (EM USO: 3 valores únicos)

### 🟢 Candidatas NÃO podem ser removidas

#### A. Colunas "Store 2" (Multi-loja EM USO!)
- ✅ **`store2_holding_packages`** (smallint) - **TEM DADOS** (0 a 7)
- ✅ **`store2_holding_units_loose`** (smallint) - **TEM DADOS**

**Evidência:** 
- Query revelou **3 valores únicos** em cada coluna
- Valores vão de **0 a 7** (não estão zeradas!)
- Feature de múltiplas lojas **ESTÁ SENDO USADA** ✅

**Recomendação:** **MANTER** - dados ativos

#### B. Soft Delete ATIVO
- ✅ **`deleted_at`** - **5 produtos** soft-deleted
- ✅ **`deleted_by`** - Em uso

**Recomendação:** **MANTER** - sistema usa soft delete

#### C. Colunas Subutilizadas (Potencial Limpeza)
- ❌ **`image_url`** - **0 de 11 produtos** têm imagem
- ⚠️ **`description`** - Apenas **1 de 11 produtos** tem descrição
- ⚠️ **`expiry_date`** - Apenas **2 de 11 produtos** rastreiam validade
- ⚠️ **`barcode`** - **10 de 11** (bom uso)

**Recomendação:** Colunas OK para manter (são opcionais por natureza)

---

## 🟡 2. Complexidade de Vendas - Duplicação Detectada

### Dados Coletados
| Métrica | Valor |
|---------|-------|
| Total de vendas | 44 |
| Vendas com `delivery_address` | 10 (23%) |
| Vendas com `delivery_fee` | 44 (100%) |
| Vendas com `delivery_status` | 44 (100%) |
| Registros em `delivery_tracking` | 46 |

### 🔴 Problema: Duplicação de Dados

**Descoberta Crítica:** 
- `delivery_tracking` tem **46 registros** mas só há **44 vendas**
- Isso indica que **tracking está sendo criado independentemente** das vendas (possível bug)

**Dados Duplicados entre `sales` e `delivery_tracking`:**
1. **`delivery_address`**: Armazenado em `sales` (JSON) em 23% dos casos
2. **`delivery_status`**: Existe em ambas as tabelas (100% preenchido)
3. **`delivery_fee`**: Existe em `sales` (sempre preenchido)

### Recomendação
🟡 **CONSOLIDAR**: Mover toda lógica de delivery para `delivery_tracking` e limpar colunas de `sales`:
- Manter `sales.delivery_type` (enum: presencial/delivery/pickup)
- **DROPAR**: `sales.delivery_address`, `sales.delivery_status`, `sales.delivery_fee`
- Centralizar tudo em `delivery_tracking`

---

## 🔴 3. Regras de Negócio em `expense_categories` (17 Colunas)

### Estrutura Completa
| # | Coluna | Tipo | Nullable | Categoria | Uso Atual |
|---|--------|------|----------|-----------|-----------|
| 1 | `id` | varchar | NO | 🔵 Estrutural | 6/6 |
| 2 | `name` | varchar | NO | 🔵 Estrutural | 6/6 |
| 3 | `description` | text | YES | 🔵 Estrutural | 6/6 |
| 4 | `color` | varchar | YES | 🟢 UI/UX | 6/6 |
| 5 | `icon` | varchar | YES | 🟢 UI/UX | 6/6 |
| 6 | `created_at` | timestamp | YES | 🔵 Estrutural | 6/6 |
| 7 | `updated_at` | timestamp | YES | 🔵 Estrutural | 6/6 |
| 8 | **`priority_level`** | varchar | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 9 | **`is_fixed_expense`** | boolean | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 10 | **`typical_frequency`** | varchar | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 11 | **`business_impact`** | varchar | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 12 | **`target_percentage`** | numeric | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 13 | **`alert_threshold`** | numeric | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 14 | `is_tax_deductible` | boolean | YES | 🟡 Fiscal | 6/6 |
| 15 | `department` | varchar | YES | 🟡 Organizacional | 6/6 |
| 16 | `max_single_expense` | numeric | YES | 🔴 **Regra de Negócio** | **6/6** ✅ |
| 17 | `requires_receipt` | boolean | YES | 🟡 Compliance | 6/6 |

### 🔴 Problema: Lógica de Aplicação no Banco

**6 Colunas de Regras de Negócio 100% POPULADAS:**

Todas as 6 categorias têm valores preenchidos nas colunas de regras de negócio, o que indica **USO ATIVO**.

**Porém**, essas regras deveriam estar no **código da aplicação**:

1. **`priority_level`** → Enum/Const no Frontend
2. **`is_fixed_expense`** → Lógica de cálculo (fixo vs variável)
3. **`typical_frequency`** → Enum de frequência (mensal, trimestral, etc)
4. **`business_impact`** → Categorização de negócio (alto/médio/baixo)
5. **`target_percentage`** → Config de metas
6. **`alert_threshold`** → Config de alertas
7. **`max_single_expense`** → Limite por despesa

### Recomendação
🟡 **CONSIDERAR MIGRAÇÃO FUTURA**:
- Dados estão sendo usados (6/6 categorias)
- Migração requer refatoração do código
- **NÃO REMOVER AGORA** - mas planejar refatoração em sprint futuro
- Mover para tabela de configurações ou código quando viável

---

## 🟢/🔴 4. Tabelas de Suporte "Fantasmas"

### Dados Coletados
| Tabela | Contagem | Status |
|--------|----------|--------|
| `notifications` | **66 linhas** | 🟢 ATIVA |
| `delivery_zones` | **0 linhas** | 🔴 VAZIA |

### Veredito

#### `notifications` - 🟢 MANTER
- Tem **66 registros** ativos
- Feature em uso ✅

#### `delivery_zones` - 🔴 DELETAR
- **0 linhas** = Feature nunca implementada
- Tabela fantasma ocupando espaço
- **AÇÃO:** DROP TABLE delivery_zones

---

## 📋 Relatório de Oportunidades de Refatoração

### 🔴 ALTA PRIORIDADE (Ação Imediata)

1. **DROP `delivery_zones`** (tabela vazia, sem uso)
   ```sql
   DROP TABLE delivery_zones CASCADE;
   ```

### 🟡 MÉDIA PRIORIDADE (Refatoração Planejada)

2. **Consolidar dados de delivery em `sales`**
   - **Problema:** Duplicação entre `sales` e `delivery_tracking`
   - **Solução:** Mover colunas delivery para `delivery_tracking` exclusivamente
   - **Colunas a dropar:** `delivery_address`, `delivery_status`, `delivery_fee`
   - **Benefício:** Centralização e eliminação de redundância

3. **Refatorar regras de negócio de `expense_categories`**
   - **Problema:** 6 colunas de regras no banco (deveria ser código)
   - **Solução:** Migrar para enums/configurações no TypeScript
   - **Status:** Dados ativos (6/6 categorias usam), requer planejamento

### 🟢 DESCOBERTAS POSITIVAS

4. **`products.store2_*` está em uso**
   - ✅ Feature de múltiplas lojas **ATIVA**
   - ✅ Soft delete **ATIVO** (5 produtos)
   - **Ação:** Nenhuma remoção necessária

---

## 💡 Benefícios Esperados

### Imediatos (após DROP delivery_zones)
- ✅ **Limpeza do Schema**: Remover 1 tabela fantasma
- ✅ **Clareza:** Menos confusão sobre features disponíveis

### Médio Prazo (após consolidação delivery)
- ✅ **Consistência**: Dados de delivery centralizados
- ✅ **Performance**: Menos colunas em `sales` (tabela principal)
- ✅ **Manutenibilidade**: Single source of truth para delivery

### Longo Prazo (após refatoração expense_categories)
- ✅ **Testabilidade**: Regras de negócio no código (mais fácil de testar)
- ✅ **Flexibilidade**: Alterações de regras sem migrations
- ✅ **Type Safety**: Enums TypeScript vs strings no banco

### Estimativa de Redução
- **Colunas removíveis imediatas**: ~0 (todas em uso!)
- **Colunas removíveis médio prazo**: ~3 (delivery em sales)
- **Tabelas removíveis**: 1 (delivery_zones)
- **Ganho de arquitetura**: Significativo (separação de concerns)

---

## ⚠️ Conclusão Crítica

**O banco está MAIS EFICIENTE do que esperado!**

- ❌ Não encontramos "colunas mortas" em `products`
- ✅ Store2 columns estão **EM USO**
- ✅ Soft delete está **ATIVO**
- ⚠️ Única tabela realmente "fantasma": `delivery_zones`

**Próximos passos recomendados:**
1. Executar DROP de `delivery_zones` (seguro)
2. Planejar consolidação de delivery (requer refatoração de código)
3. Documentar uso de `store2_*` para evitar confusão futura
