# Relatório de Auditoria de Banco de Dados: DEV vs PROD

**Data:** 30/12/2025
**Auditor:** Agent Antigravity
**Fonte da Verdade:** `adega-dev`
**Alvo:** `adega` (Produção)

---

## 1. Resumo Executivo
Detectamos uma divergência estrutural entre os ambientes após a tentativa de sincronização. O ambiente de Produção contém tabelas e colunas "fantasmas" que não existem no Desenvolvimento, indicando que o deploy apenas *adicionou* novos recursos ou ignorou estruturas existentes, sem limpar o legado. Além disso, algumas views do DEV não foram criadas em PROD.

*   **Tabelas em DEV:** 32 (aprox)
*   **Tabelas em PROD:** 34 (aprox)

## 2. Tabelas Fantasmas (Apenas em PROD)
Estas tabelas existem no banco de produção mas não fazem parte da base de código nem do ambiente de dev. Muito provavelmente são vestígios de versões anteriores do sistema.

| Tabela | Análise Preliminar | Recomendação |
| :--- | :--- | :--- |
| **`inventory`** | Estrutura simplificada (`min_stock`, `price`, `quantity`). Parece ser a tabela de estoque antiga, antes da migração para `inventory_movements`. | 🛑 **DROP IMEDIATO** (Após confirmação visual de que está vazia ou obsoleta). |
| **`inventory_conversion_log`** | Registra conversões de pacotes/unidades. O sistema atual usa outra lógica para isso ou não rastreia dessa forma. | ⚠️ **Analisar**. Se o código atual não lê esta tabela, remover. |
| **`v_customer_timeline`** | View de linha do tempo do cliente. | ⚠️ **Remover** se não for usada por dashboards externos (Data Studio/Metabase). |

## 3. Entidades Ausentes em PROD (Apenas em DEV)
Estas entidades deveriam ter sido criadas no deploy, mas falharam (provavelmente devido ao `skip` na migration).

*   **View:** `vw_kyrie_intelligence_margins` (Análise de margens de lucro).

## 4. Divergências de Colunas (Schema Drift)
Tabelas que existem em ambos, mas têm estruturas diferentes. Isso é **CRÍTICO** pois o código pode quebrar ao esperar um formato e receber outro, ou perder dados ao gravar.

| Tabela | Situação | Detalhes | Ação Recomendada |
| :--- | :--- | :--- | :--- |
| **`sale_items`** | **PROD tem +2 colunas** | `product_description_legacy` (text), `variant_id` (text). | **DROP COLUMN**. Colunas legadas que sujam o schema. |
| **`batch_units`** | **PROD tem +13 colunas** | Diferença massiva. PROD parece manter um histórico ou metadados que foram removidos no DEV. | **INVESTIGAR**. Verificar se há dados úteis antes de dropar. |
| **`delivery_zones`** | **PROD tem +4 colunas** | Campos extras de configuração de zona. | **Sincronizar**. Dropar excessos ou adicionar ao DEV se forem úteis. |
| **`nps_surveys`** | **PROD tem +5 colunas** | PROD tem mais campos de resposta/análise. | **Sincronizar**. |
| **`customer_insights`** | **DEV tem +3 colunas** | PROD está *desatualizado*. Faltam 3 colunas novas criadas no DEV. | **APLICAR MIGRATION**. `ALTER TABLE ADD COLUMN...` |

## 5. Tabelas Críticas Verificadas (OK)
As tabelas centrais do sistema estão **SINCRONIZADAS** (mesmo hash de schema):
*   ✅ `products`
*   ✅ `sales`
*   ✅ `customers`
*   ✅ `profiles`
*   ✅ `inventory_movements` (Baseado no count de colunas, verificar hash para certeza absoluta, mas parece ok).

## 6. Plano de Ação Sugerido
1.  **Backup de Segurança**: Fazer dump apenas das tabelas fantasmas para arquivo CSV/SQL.
2.  **Limpeza (Sanitization)**: Criar uma migration de "Limpeza" para:
    *   `DROP TABLE inventory;`
    *   `DROP TABLE inventory_conversion_log;`
    *   `DROP VIEW v_customer_timeline;`
    *   Remove as colunas extras de `sale_items`.
3.  **Correção (Fix)**:
    *   Criar manualmente a view `vw_kyrie_intelligence_margins` em PROD.
    *   Adicionar as colunas faltantes em `customer_insights` em PROD.

---
**Status**: Aguardando autorização para executar o Plano de Ação.
