# Relatório de Auditoria de Sincronização (Dev vs Prod)

**Data:** 17/01/2026 **Status Global:** � **Sincronizado (Corrigido em 17/01)**

---

## 1. Lógica de Negócio (RPCs) - 🥗 ✅ Sincronizado

As funções críticas (Core) estão 100% idênticas (Hash MD5 verificado).

| Função                      | Status   | Hash Checado  |
| :-------------------------- | :------- | :------------ |
| `process_sale`              | ✅ Igual | `a01f08c9...` |
| `create_inventory_movement` | ✅ Igual | `da63a8a2...` |
| `cancel_sale`               | ✅ Igual | `d0a41713...` |

---

## 2. Edge Functions - ✅ Atualizado

A função `fiscal-handler` foi deployada para a versão mais recente em Produção e Desenvolvimento.

| Função | Status | Ação |
| :--- | :--- | :--- |
| `fiscal-handler` (Prod) | ✅ Sincronizado | Deploy forçado v73+ |
| `fiscal-handler` (Dev) | ✅ Sincronizado | Deploy forçado (Sync com Prod) |

---

## 3. Schema de Tabelas (`store_settings`) - ✅ Corrigido

As colunas faltantes foram adicionadas via script SQL.

**Colunas Adicionadas:**

- `phone` (text)
- `email` (text)
- `state_registration` (text)

---

## 4. Log de Resolução

*   **17/01/2026 23:15:** Executado `ALTER TABLE` em Produção.
*   **17/01/2026 23:15:** Deploy manual da `fiscal-handler` (Prod) via CLI.
*   **17/01/2026 23:18:** Deploy manual da `fiscal-handler` (Dev) via CLI.

### Script de Sincronização (`SYNC_PROD_SCHEMA.sql`)

```sql
-- Rodar APENAS em Produção (uujkzvbgnfzuzlztrzln)

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS state_registration text;
```
