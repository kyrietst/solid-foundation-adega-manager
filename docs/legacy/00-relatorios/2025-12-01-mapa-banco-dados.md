# Relatório de Auditoria do Banco de Dados - Adega Anita's
**Data:** 2025-12-01  
**Ambiente:** adega-dev (Development)  
**Objetivo:** Mapear estruturas, identificar over-engineering e preparar refatoração.

---

## 1. Resumo Executivo

| Métrica | Valor |
|:--------|------:|
| **Total de Tabelas** | 35 |
| **Tabelas Core** | 8 |
| **Tabelas de Suporte** | 12 |
| **Tabelas Suspeitas/Bloated** | 9 |
| **Tabelas Backup/Legacy** | 3 |
| **Materialized Views** | 3 |

### Diagnóstico
🚨 **ALERTA VERMELHO:** Sistema com over-engineering moderado a alto. Aproximadamente **26% das tabelas são candidatas à remoção imediata**. Muitas tabelas de "features" que provavelmente nunca foram completadas ou são redundantes com sistemas de auditoria modernos.

---

## 2. Detalhamento por Grupo

### 🟢 [CORE] - Tabelas Essenciais (8)

#### `products` (38 colunas)
**Colunas Principais:**
- `id` (PK), `name`, `description`, `price`, `cost_price` ⭐
- `stock_quantity`, `stock_packages`, `stock_units_loose`
- `store2_holding_packages`, `store2_holding_units_loose`
- `category` (FK), `barcode`, `unit_barcode`, `package_barcode`
- `margin_percent`, `package_margin` ⭐

**Análise:** Tabela central do sistema. Contém dados de COGS (`cost_price`) e margem. **CRÍTICA para BI comercial.**

**Problemas Detectados:**
- 38 colunas são muitas. Há mistura de dados de estoque, fiscal, exibição e loja 2.
- `stock_quantity` parece redundante com `stock_packages` + `stock_units_loose`.

---

#### `sales` (28 colunas)
**Colunas Principais:**
- `id` (PK), `customer_id` (FK), `user_id` (FK), `seller_id` (FK)
- `total_amount`, `discount_amount`, `final_amount`
- `payment_method_enum`, `payment_status`, `status_enum`
- `delivery_type`, `delivery_fee`, `delivery_person_id` (FK)

**Análise:** Core de vendas. Rastreamento completo de transações.

**Problemas:** Muitos campos de delivery misturados. Poderia ter uma tabela separada `sale_delivery_details`.

---

#### `sale_items` (11 colunas)
**Colunas Principais:**
- `id` (PK), `sale_id` (FK), `product_id` (FK)
- `quantity`, `unit_price`, `total_price`

**Análise:** Itens da venda. Simples e correta. ✅

---

#### `customers` (21 colunas)
**Colunas Principais:**
- `id` (PK), `name`, `email`, `phone` ⭐
- `cpf`, `address`, `neighborhood`, `city`, `state`, `zip_code` ⭐
- `total_purchases`, `last_purchase_date`
- `debt_amount`, `credit_balance`, `loyalty_points`
- `segment`, `favorite_product` (FK)

**Análise:** Core de CRM. Contém **dados de contato para campanha de Ads** (email, phone, endereço).

**Problemas:**
- `total_purchases` e `last_purchase_date` são campos calculados/cache → risco de inconsistência.

---

#### `inventory_movements` (11 colunas)
**Colunas Principais:**
- `id` (PK), `product_id` (FK), `user_id` (FK)
- `quantity_change`, `type_enum`, `reason`
- `stock_quantity_snapshot`, `cost_price_snapshot` ⭐

**Análise:** Log de movimentações de estoque. Essencial para rastreabilidade.

---

#### `categories` (12 colunas)
**Colunas Principais:**
- `id` (PK), `name`, `description`
- `default_min_stock_packages`, `default_min_stock_units_loose`

**Análise:** Categorias de produtos. Tabela de domínio. OK.

---

#### `users` (6 colunas)
**Colunas Principais:**
- `id` (PK), `email`, `full_name`, `role`

**Análise:** Usuários do sistema. Simples. ✅

---

#### `profiles` (8 colunas)
**Colunas Principais:**
- `id` (PK), `user_id`, `full_name`, `avatar_url`, `role`

**Análise:** Perfis de usuários (complemento de `users`). Parece redundante, mas pode ser do Supabase Auth.

---

### 🟡 [SUPORTE] - Configurações e Utilities (12)

#### `suppliers` (12 colunas)
- Fornecedores. Suporte OK.

#### `delivery_zones` (12 colunas)
- Zonas de entrega. Se delivery for usado, OK.

#### `payment_methods` (6 colunas)
- Métodos de pagamento. OK.

#### `expense_categories` (17 colunas) ⚠️
- **ALERTA:** 17 colunas para categoria de despesa é suspeito. Muitas regras de negócio (`target_percentage`, `alert_threshold`, `max_single_expense`).

#### `expense_budgets` (9 colunas)
- Orçamentos de despesas. Se módulo financeiro for usado, OK.

#### `expenses` (7 colunas)
- Despesas operacionais. OK.

#### `operational_expenses` (15 colunas)
- **Duplicação com `expenses`?** Verificar se ambas são necessárias.

#### `accounts_receivable` (7 colunas)
- Contas a receber. OK se módulo financeiro for usado.

#### `notifications` (11 colunas)
- Sistema de notificações. OK.

#### `delivery_tracking` (9 colunas)
- Rastreamento de entregas. OK se delivery for core.

#### `product_batches` (23 colunas) ⚠️
- Controle de lotes. **23 colunas** é muito para lotes.

#### `batch_units` (22 colunas) ⚠️
- Unidades individuais de lotes. **22 colunas** para rastreamento unitário é over-engineering pesado.

---

### 🔴 [BLOATED/SUSPEITO] - Candidatos à Remoção (9)

#### `debug_stock_calls_log` (5 colunas) ❌
**Veredito:** **DELETAR IMEDIATAMENTE**  
**Razão:** Tabela de debug. Não deve existir em produção.

---

#### `customer_history` (7 colunas) ❌
**Veredito:** **REMOVER ou CONSOLIDAR**  
**Razão:** Redundante com `audit_logs`. Se `audit_logs` já rastreia mudanças em `customers`, esta é desnecessária.

**Colunas:** `customer_id`, `event_type`, `event_data`, `created_at`

---

#### `customer_events` (6 colunas) ❌
**Veredito:** **CONSOLIDAR em `customer_interactions`**  
**Razão:** Competição de responsabilidade. `customer_events` vs `customer_interactions` parecem fazer o mesmo.

---

#### `customer_insights` (7 colunas) ❌
**Veredito:** **REMOVER**  
**Razão:** Provavelmente feature incompleta de "insights automáticos". Se dados são calculados, devem vir de query ou MV.

**Colunas:** `customer_id`, `insight_type`, `insight_data`, `calculated_at`

---

#### `automation_logs` (8 colunas) ⚠️
**Veredito:** **CONSOLIDAR em `activity_logs`**  
**Razão:** Mais um tipo de log específico. `activity_logs` já existe.

---

#### `nps_surveys` (13 colunas) ⚠️
**Veredito:** **AVALIAR USO REAL**  
**Razão:** Se NPS nunca foi usado ou usado 1x, deletar.

**Colunas:** `customer_id`, `sale_id`, `score`, `feedback`, `sent_at`, `completed_at`

---

#### `expiry_alerts` (29 colunas) ❌
**Veredito:** **SIMPLIFICAR OU REMOVER**  
**Razão:** **29 colunas** para um alerta de validade?! Over-engineering extremo.

---

#### `inventory_conversion_log` (14 colunas) ⚠️
**Veredito:** **AVALIAR**  
**Razão:** Parece rastrear conversão pacote→unidades. Se não for usado, deletar.

---

#### `product_cost_history` (8 colunas) ⚠️
**Veredito:** **MANTER se usado para análise histórica de custo**  
**Razão:** Rastrear mudanças de custo pode ser legítimo para BI.

**Colunas:** `product_id`, `cost_price`, `changed_at`, `changed_by`

---

### 🟣 [BACKUP/LEGACY] - Lixo de Migração (3)

#### `products_backup_20251124` (47 colunas) ❌
**Veredito:** **DELETAR APÓS CONFIRMAR MIGRAÇÃO**  
**Razão:** Backup de tabela. Não deve estar em banco ativo.

---

#### `products_multistore_backup` (10 colunas) ❌
**Veredito:** **DELETAR**  
**Razão:** Backup de feature multistore abandonada.

---

#### `store_transfers_backup` (9 colunas) ❌
**Veredito:** **DELETAR**  
**Razão:** Backup de transferências entre lojas.

---

#### `_deleted_objects_backup` (7 colunas) ⚠️
**Veredito:** **MANTER se usado para rollback de migrações**  
**Razão:** Armazena objetos deletados (views, triggers, etc.) para auditoria de refatoração.

---

## 3. Investigação de Inteligência Comercial (Andromeda)

### 🎯 Preço de Custo (COGS)
**Localização Primária:**
- **Tabela:** `products`
- **Coluna:** `cost_price` (numeric)

**Localização Secundária (Histórico):**
- **Tabela:** `inventory_movements`
- **Coluna:** `cost_price_snapshot` (numeric) - snapshot no momento da movimentação

**Localização Terciária (Histórico Dedicado):**
- **Tabela:** `product_cost_history`
- **Colunas:** `cost_price`, `changed_at`, `changed_by`

---

### 📧 Dados de Contato do Cliente (Ads/Campanhas)
**Localização:**
- **Tabela:** `customers`
- **Colunas Críticas:**
  - `email` (text)
  - `phone` (character varying)
  - `name` (text)
  - `cpf` (character varying) - pode ser usado para deduplicação
  - `address`, `neighborhood`, `city`, `state`, `zip_code` - segmentação geográfica

**Observações:**
- Verificar LGPD: se há coluna de consentimento para marketing.
- `segment` pode ser usado para targeting (ex: VIP, Regular).

---

## 4. Sugestão de "Kill List" (Deleção Imediata)

### A. DELETAR IMEDIATAMENTE (Alta Confiança)
1. **`debug_stock_calls_log`** - Debug table
2. **`products_backup_20251124`** - Backup antigo
3. **`products_multistore_backup`** - Feature abandonada
4. **`store_transfers_backup`** - Backup de feature abandonada

### B. REMOVER APÓS ANÁLISE DE USO (Média Confiança)
5. **`customer_history`** - Redundante com `audit_logs`
6. **`customer_events`** - Redundante com `customer_interactions`
7. **`customer_insights`** - Feature incompleta

### C. CONSOLIDAR (Refatoração Necessária)
8. **`automation_logs`** → Consolidar em `activity_logs` com campo `type='automation'`
9. **`customer_events`** → Consolidar em `customer_interactions`

### D. SIMPLIFICAR (Over-Engineered)
10. **`expiry_alerts`** - 29 colunas → simplificar para ~10
11. **`expense_categories`** - 17 colunas → mover regras de negócio para código
12. **`batch_units`** - 22 colunas → avaliar se rastreamento unitário é realmente necessário

### E. AVALIAR USO REAL (Deletar se não usado)
13. **`nps_surveys`** - Verificar se NPS foi usado nos últimos 6 meses
14. **`inventory_conversion_log`** - Verificar uso
15. **`operational_expenses`** vs **`expenses`** - Verificar se ambas são necessárias

---

## 5. Recomendações Estratégicas

### Prioridade 1: Limpeza Imediata (Esta Semana)
- Deletar 4 tabelas de backup (`debug_stock_calls_log`, backups de produtos/transfers).
- **Ganho:** Redução de ~11% na contagem de tabelas.

### Prioridade 2: Auditoria de Uso (Próxima Semana)
- Rodar queries para verificar se `nps_surveys`, `customer_insights`, `inventory_conversion_log` possuem dados e foram acessadas.
- **Ganho:** Potencial de deletar mais 3-5 tabelas.

### Prioridade 3: Consolidação (Próximo Mês)
- Unificar logs (`automation_logs` → `activity_logs`).
- Unificar CRM (`customer_events` → `customer_interactions`).
- **Ganho:** Menos tabelas = menos manutenção.

### Prioridade 4: Refatoração Profunda (Q1 2026)
- Simplificar `expiry_alerts` (29 → 10 colunas).
- Simplificar `expense_categories` (17 → 8 colunas).
- Avaliar necessidade de `batch_units` (rastreamento unitário).

---

## 6. Riscos Identificados

### Risco 1: Inconsistência de Cache
- **Problema:** `customers.total_purchases` e `customers.last_purchase_date` são calculados e armazenados.
- **Solução:** Migrar para Materialized View ou cálculo em runtime.

### Risco 2: Redundância de Estoque
- **Problema:** `products.stock_quantity` vs `stock_packages + stock_units_loose`.
- **Solução:** Escolher uma fonte de verdade e deletar a outra.

### Risco 3: Auditoria Fragmentada
- **Problema:** Múltiplos sistemas de log (`activity_logs`, `audit_logs`, `automation_logs`, `customer_history`).
- **Solução:** Padronizar em `audit_logs` (detalhado) + `activity_logs` (resumo).

---

**Fim do Relatório**
