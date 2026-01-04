# Deep Cleanup Audit: Pre-Production Protocol (Go-Live 08/01)

**Data:** 2026-01-04 **Auditor:** AntiGravity Agent **Status:** DRAFT (Awaiting
Execution)

Este relatório identifica dívida técnica, código morto e artefatos de teste que
devem ser removidos ou otimizados antes do Go-Live.

---

## 1. Auditoria de Banco de Dados (Database)

### 🗑️ Tabelas Zumbis (Candidatas à Exclusão)

As seguintes tabelas foram identificadas como artefatos de debug ou obsoletas:

| Tabela                      | Motivo                                          | Ação Recomendada                                                 |
| :-------------------------- | :---------------------------------------------- | :--------------------------------------------------------------- |
| **`debug_stock_calls_log`** | Tabela de log temporário para debug de estoque. | **DROP TABLE** (Imediato).                                       |
| **`automation_logs`**       | Logs antigos de automação não-estruturada.      | **TRUNCATE**. Manter estrutura se ainda usada, mas limpar dados. |
| **`audit_logs`**            | Logs de sistema.                                | **TRUNCATE** para iniciar a produção limpa.                      |

### 🔌 RPCs e Funções Zumbis

Funções armazenadas que existem no Schema `public` mas não foram encontradas no
codebase (`src/`):

1. **`import_delivery_csv_row`**: Parece ser de uma importação legada de
   delivery. Se não houver botão de importação ativo, **DROP**.
2. **`show_limit` / `set_limit`**: Funções genéricas do Postgres/Extensions que
   muitas vezes vêm com extensões de testes. (Manter se forem do sistema, mas
   validar).
3. **`sync_delivery_status_to_sale_status`**: Verificar se há Trigger ativo. Se
   não houver trigger chamando, é código morto.

### 🧹 Estratégia de Higienização de Dados (Data Wipe)

Para o dia do Go-Live, recomenda-se rodar o seguinte script (com backup prévio):

```sql
-- 1. Limpar transações (Ordem correta devido a FKs)
TRUNCATE TABLE invoice_logs CASCADE;
TRUNCATE TABLE sale_items CASCADE;
TRUNCATE TABLE inventory_movements CASCADE;
TRUNCATE TABLE sales CASCADE;

-- 2. Resetar sequências (Para o Pedido #1 ser o primeiro da produção)
ALTER SEQUENCE sales_order_number_seq RESTART WITH 1;

-- 3. Manter Cadastros Base
-- NÃO TRUNCATE: products, customers, store_settings, users, payment_methods, categories.
```

---

## 2. Auditoria de Backend (Edge Functions)

### `fiscal-handler`

O arquivo `functions/fiscal-handler/index.ts` está saudável, mas possui débitos:

1. **Tipagem `any`**:
   - `const paymentDet: any` (Linha 204).
   - `items.map((item: any ...)` (Linha 151).
   - _Risco:_ Baixo, mas reduz a segurança de refatoração futura.
   - _Ação:_ Criar interfaces TypeScript para o DB Types (`SaleItem`,
     `PaymentMethod`).

2. **Código Morto / Comentários**:
   - Logs de debug como `console.log('[Fiscal] Emit Block:', ...)` devem ser
     removidos ou silenciados via flag de ambiente (`LOG_LEVEL=error`) para não
     poluir os logs de produção, exceto em erro.

3. **Variáveis de Ambiente**:
   - Certifique-se de que `SUPABASE_SERVICE_ROLE_KEY` (se usada) esteja
     atualizada nos Secrets.
   - `NUVEM_FISCAL_CLIENT_ID` e `SECRET` devem ser os de **PRODUÇÃO** no dia do
     Go-Live.

---

## 3. Auditoria de Frontend (Codebase)

### 💀 Código Morto (Dead Code)

| Arquivo                                         | Diagnóstico                                        | Ação                                                                            |
| :---------------------------------------------- | :------------------------------------------------- | :------------------------------------------------------------------------------ |
| `src/pages/DesignSystemPage.tsx`                | Página de desenvolvimento para testar componentes. | **Excluir** do build de produção ou deletar arquivo.                            |
| `src/__tests__/*`                               | Pasta pesada de testes.                            | Configurar `tsconfig.json` ou bundler para excluir `__tests__` do bundle final. |
| `src/shared/components/TempPasswordHandler.tsx` | Validar uso. Se não for usado no Login, remover.   | Verificar referência em `App.tsx`.                                              |

### 🔍 Otimizações de Build

- O build está incluindo bibliotecas de teste? Verifique o tamanho do bundle
  (`npm run build`).

---

## 4. Plano de Ação (Checklist)

### Fase 1: Limpeza Segura (Hoje - 04/01)

- [ ] Executar `DROP TABLE debug_stock_calls_log`.
- [ ] Executar `DROP FUNCTION import_delivery_csv_row`.
- [ ] Remover `DesignSystemPage.tsx` se ninguém usa.

### Fase 2: Otimização (Até 06/01)

- [ ] Refatorar `fiscal-handler` para remover `any` e limpar logs excessivos
      (manter logs de erro/recovery).
- [ ] Rodar Auditoria de Indices no Banco (ver se faltam indexes em
      `invoice_logs.sale_id` ou `sales.created_at`).

### Fase 3: Go-Live (08/01 - Manhã)

- [ ] Backup Full do Banco (via Supabase Dashboard).
- [ ] Executar Script de Data Wipe (Resetar vendas e estoque se necessário).
- [ ] Trocar chaves da Nuvem Fiscal para Produção.
- [ ] Mudar `store_settings.environment` para `production`.

---

**Aprovação necessária para execução da Fase 1.**
