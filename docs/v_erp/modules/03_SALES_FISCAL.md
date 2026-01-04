# 03. Módulo de Vendas & Fiscal (Sales & Fiscal)

> [!NOTE]
> Este documento detalha o fluxo de vendas (PDV), que é o coração do ERP, e sua
> integração íntima com o motor fiscal (`fiscal-handler`).

## 1. Visão Geral

O módulo de Vendas (`src/features/sales`) não apenas registra transações, mas
orquestra o estoque e a preparação fiscal. Ele opera sob a premissa **"Fiscal
First"**: Toda venda é uma potencial Nota Fiscal.

### Stack Específica

- **State:** `usePOS` (Zustand - Gerenciamento de carrinho local).
- **Dados:** Tabela `sales` e `sale_items`.
- **Checkout:** `CheckoutModal.tsx` com validação de crédito e seleção de método
  de pagamento.

---

## 2. Arquitetura de Checkout e RPC (`process_sale`)

Para garantir integridade atômica (Venda + Estoque + Financeiro), usamos **uma
única transação de banco**.

### A. O RPC `process_sale`

NUNCA insira dados manualmente em `sales` e `sale_items` em chamadas separadas.
Se a internet cair no meio, você terá estoque baixado sem venda registrada. Use
a RPC Mestra:

```sql
FUNCTION process_sale(
  p_user_id uuid,
  p_customer_id uuid, -- Opcional
  p_items jsonb,      -- Array de produtos e quantidades
  p_payment_method payment_method_enum,
  p_discount_amount numeric
  ...
)
```

Ela garante:

1. Verificação de Estoque (Rollback se insuficiente).
2. Criação da Venda.
3. Criação dos Itens.
4. Baixa no Estoque (via `create_inventory_movement` interno).

---

## 3. Integração Fiscal (`fiscal-handler`)

Após o sucesso do `process_sale`, o frontend dispara (se configurado) a emissão
fiscal.

### A. Edge Function

Nossa lógica fiscal reside em uma **Edge Function Supabase** para isolamento e
segurança de certificados (A1).

**Fluxo:**

1. Frontend: `await process_sale(...)` -> Retorna `sale_id`.
2. Frontend:
   `await supabase.functions.invoke('fiscal-handler', { body: { sale_id } })`.
3. Edge Function:
   - Busca dados da venda.
   - Busca dados da empresa (Emissor).
   - Busca dados do cliente (Destinatário).
   - Calcula Impostos (Simples Nacional vs Regime Normal).
   - Envia para API de Emissão (ex: Nuvem Fiscal).

### B. Regras de Endereço

Para emissão síncrona, o cliente (se identificado) DEVE ter:

- CPF/CNPJ válido.
- Endereço com código IBGE (ver `01_CUSTOMERS.md`).

Se faltar algo, a Edge Function retorna erro 400, e o UI deve abrir o modal de
`EditCustomer`.

---

## 4. Tratamento de Erros e Offline

- **Venda:** Ocorre mesmo offline? Não (Supabase Client requer conexão).
  - _Roadmap:_ Implementar fila local (IndexedDB) para sincronia futura.
- **Fiscal:** Se a API fiscal cair, a venda é salva mas fica com
  `fiscal_status: 'pending'`.
  - O sistema possui worker para reprocessar notas pendentes.
