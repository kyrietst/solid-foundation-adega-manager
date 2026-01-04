# 03. Roadmap Frontend (Technical Debt)

O Backend já é "v.ERP Fiscal" (Estrito, Validado, Imutável). O Frontend (React)
ainda é "v.Legacy" (Flexível, Strings Mágicas).

Este documento lista as discrepâncias que devem ser corrigidas para alinhar as
duas pontas.

## 1. Cadastro de Produtos (ProductForm)

> [!WARNING]
> Prioridade Alta. O usuário pode tomar erro ao salvar se não validar no front.

- [ ] **Input NCM:**
  - **Atual:** Input de texto livre.
  - **Meta:** Input Mask `99999999` (8 dígitos). Validar length == 8.
- [ ] **Select Unidade (uCom):**
  - **Atual:** Input texto ou select incompleto?
  - **Meta:** Select dropdown fixo com valores da Whitelist (`UN`, `KG`, `L`,
    `M`, `CX`, `DZ`, `GT`).
- [ ] **Integração API Brasil (Opcional):**
  - Consultar NCM/CEST válidos para ajudar o usuário.

## 2. Processo de Venda (PDV/Checkout)

- [x] **Seleção de Pagamento:**
  - **Atual:** Salva string livre ("Pix", "Dinheiro") na coluna legada
    `payment_method`.
  - **Meta:**
    1. Carregar lista da tabela `payment_methods` (Query).
    2. Mostrar botões dinâmicos baseados no `is_active`.
    3. Salvar o UUID no campo `payment_method_id`.
- [ ] **Snapshot no Frontend:**
  - **Atual:** Não envia nada. Trigger do banco resolve.
  - **Meta:** O Frontend deveria saber o snapshot? (Discutível. Talvez deixar o
    banco resolver seja mais seguro/DRY).

## 3. Relatórios & Dashboards

- [ ] **Agrupamento por Pagamento:**
  - **Atual:** Faz `GROUP BY payment_method` (string).
  - **Meta:** Fazer `GROUP BY payment_method_id` e join com a tabela para pegar
    os nomes oficiais. Isso padroniza "pix", "PIX", "Pix" num único bucket.

## 4. Limpeza de Código (Cleanup)

- [ ] Remover tipos manuais/interfaces duplicadas de `Product` e `Sale`. Usar
      tipos gerados do Supabase.
- [x] Remover constantes hardcoded de métodos de pagamento no código
      client-side.
