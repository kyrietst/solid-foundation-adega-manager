# 05. RPC Catalog (Catálogo de Funções)

Lista de funções críticas do Server-Side (Postgres/Supabase). Use
`supabase.rpc('nome_da_funcao', { params })` para chamar.

## Inventory & Sales

### `process_sale`

Orquestrador de venda (Estoque + Financeiro).

> **Atenção:** `p_items` deve ser um array JSON de objetos:
> `[{ product_id: "uuid", quantity: 1, unit_price: 10.0, sale_type: "unit" }]`

```sql
FUNCTION process_sale(
    p_customer_id uuid,
    p_user_id uuid,
    p_items jsonb,
    p_total_amount numeric,
    p_final_amount numeric,
    p_payment_method_id uuid DEFAULT NULL,
    p_discount_amount numeric DEFAULT 0,
    p_payment_method text DEFAULT NULL,
    p_is_delivery boolean DEFAULT false,
    p_notes text DEFAULT NULL,
    p_delivery_fee numeric DEFAULT 0,
    p_delivery_address text DEFAULT NULL,
    p_delivery_person_id uuid DEFAULT NULL,
    p_delivery_instructions text DEFAULT NULL
) RETURNS jsonb
```

### `create_inventory_movement`

Motor de movimentação de estoque. Usado internamente por `process_sale` e
manualmente por ajustes.

```sql
FUNCTION create_inventory_movement(
    p_product_id uuid,
    p_quantity_change integer,   -- Positivo (Entrada) ou Negativo (Saída)
    p_type text,                 -- Motivo Enum: 'sale', 'stock_transfer_in', etc.
    p_reason text,               -- Descrição livre
    p_metadata jsonb DEFAULT '{}',
    p_movement_type text DEFAULT 'unit' -- 'unit' ou 'package'
) RETURNS jsonb
```

### `set_product_stock_absolute`

Define estoque exato (usado no Modal de Ajuste).

```sql
FUNCTION set_product_stock_absolute(
    p_product_id uuid,
    p_new_packages integer,
    p_new_units_loose integer,
    p_reason text,
    p_user_id uuid
) RETURNS jsonb
```

## Analytics & Dashboard

| Função                      | Descrição                           | Parâmetros Chave             |
| :-------------------------- | :---------------------------------- | :--------------------------- |
| **`get_sales_chart_data`**  | Vendas por dia (Faturamento).       | `p_start_date`, `p_end_date` |
| **`get_delivery_trends`**   | Comparativo Delivery vs Presencial. | `p_start_date`, `p_end_date` |
| **`get_inventory_summary`** | Dados do dashboard.                 | `start_date`, `end_date`     |

## Notas de Manutenção (Dev Ops)

- **Assinaturas:** Ao alterar argumentos, **CRIE UMA MIGRATION** com
  `DROP FUNCTION` antes de recriar.
- **Tipagem:** Evite `any` ou `text` para Enums se possível, mas strings são
  mais seguras para APIs públicas.
- **RPC vs Direct:** O Frontend NUNCA deve fazer `INSERT INTO sales`
  diretamente. Sempre use `process_sale`.
