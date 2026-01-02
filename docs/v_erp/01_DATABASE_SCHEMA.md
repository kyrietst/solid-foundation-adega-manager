# 01. Database Schema (v.ERP Fiscal)

> [!IMPORTANT]
> Este documento é a **ÚNICA fonte de verdade** para o schema do banco de dados
> a partir de Janeiro/2026. Esqueça documentações antigas.

## 1. Domain Tables (Tabelas de Domínio)

### `payment_methods` (Métodos de Pagamento)

Esta tabela agora governa todos os tipos de pagamento aceitos pelo sistema,
vinculando-os aos códigos oficiais da SEFAZ para emissão de NFC-e.

| Coluna      | Tipo | Obrigatório | Descrição                       | Exemplo                |
| :---------- | :--- | :---------- | :------------------------------ | :--------------------- |
| `id`        | uuid | Sim         | PK                              | ...                    |
| `name`      | text | Sim         | Nome legível para UI            | "PIX", "Dinheiro"      |
| `code`      | text | **Sim**     | **Código SEFAZ (Nuvem Fiscal)** | `"01"`, `"03"`, `"17"` |
| `is_active` | bool | Sim         | Se deve aparecer no PDV         | `true`                 |

**Códigos SEFAZ Suportados (Hardcoded):**

- `01`: Dinheiro (Cash)
- `03`: Cartão de Crédito
- `04`: Cartão de Débito
- `17`: PIX
- `99`: Outros

---

## 2. Core Tables (Tabelas Principais)

### `products` (Produtos)

A tabela de produtos agora possui validações rígidas (Constraints) para impedir
que dados inválidos poluam a emissão fiscal.

| Coluna | Tipo | Constraint (Regra)                  | Descrição                                                 |
| :----- | :--- | :---------------------------------- | :-------------------------------------------------------- |
| `ncm`  | text | `CHECK (ncm ~ '^\d{8}$')`           | Deve conter **exatamente 8 dígitos numéricos**.           |
| `cfop` | text | `CHECK (cfop ~ '^\d{4}$')`          | Deve conter **exatamente 4 dígitos numéricos**.           |
| `ucom` | text | `CHECK (ucom IN ('UN', 'KG', ...))` | Deve ser uma unidade aceita (Whitelist). Default: `'UN'`. |
| `cest` | text | -                                   | Código CEST (Opcional).                                   |

### `sales` (Vendas)

| Coluna              | Tipo | Notas                                                                                               |
| :------------------ | :--- | :-------------------------------------------------------------------------------------------------- |
| `payment_method_id` | uuid | **FK -> payment_methods(id)**. Novo padrão.                                                         |
| `payment_method`    | text | **[LEGACY/DEPRECATED]**. Mantido apenas para compatibilidade temporária. NÃO USAR EM NOVAS QUERIES. |

### `sale_items` (Itens da Venda)

| Coluna            | Tipo      | Descrição                                                                   |
| :---------------- | :-------- | :-------------------------------------------------------------------------- |
| `fiscal_snapshot` | **jsonb** | **Imutabilidade Fiscal**. Armazena os dados do produto NO MOMENTO DA VENDA. |

#### Estrutura do `fiscal_snapshot`

```json
{
  "ncm": "22041000",
  "cfop": "5102",
  "uCom": "UN",
  "cest": "0200100",
  "xProd": "Vinho Tinto Suave 750ml"
}
```

---

## 3. Automation & Triggers

### `trg_set_fiscal_snapshot` (Trigger)

**Alvo:** `sale_items` (BEFORE INSERT) **Função:** Garante que, se o Frontend
não enviar o snapshot, o banco preenche automaticamente copiando os dados da
tabela `products`.

> Isso permite que versões antigas do Frontend continuem funcionando (Backward
> Compatibility) enquanto já geram dados fiscais válidos no backend.

---

## 4. RPC Functions (Server-Side Logic)

### `process_sale`

Responsável por orquestrar a transação de venda: Decrementa estoque e Cria
registro de venda atomicamente.

**Assinatura:**

```sql
FUNCTION process_sale(
  p_customer_id uuid,
  p_user_id uuid,
  p_items jsonb,
  p_total_amount numeric,
  p_final_amount numeric,
  p_payment_method_id uuid DEFAULT NULL, -- NEW (JANEIRO/2026)
  p_discount_amount numeric,
  p_payment_method text DEFAULT NULL, -- DEPRECATED (FALLBACK)
  ...
) RETURNS jsonb
```

**Lógica de Pagamento:**

1. Se `p_payment_method_id` for enviado, usa ele.
2. Se for `NULL`, tenta buscar na tabela `payment_methods` usando o texto de
   `p_payment_method` (Fallback).
3. Insere `payment_method_id` na tabela `sales`.
