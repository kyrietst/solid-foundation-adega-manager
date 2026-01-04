# 04. Inventory Mechanics (Mecânica de Estoque)

## 1. Conceitos Fundamentais

O sistema utiliza um modelo de **Estoque Híbrido** (Unitário + Pacote/Fardo)
para atender à realidade de distribuidoras de bebidas.

### Estrutura na Tabela `products`

| Coluna              | Descrição                                            | Exemplo                 |
| :------------------ | :--------------------------------------------------- | :---------------------- |
| `stock_units_loose` | Unidades soltas (avulsas).                           | 5 (garrafas soltas)     |
| `stock_packages`    | Quantidade de embalagens fechadas (fardos).          | 10 (fardos fechados)    |
| `stock_quantity`    | **Total Absoluto em Unidades**. Calculado.           | (10 * 12) + 5 = **125** |
| `package_units`     | Fator de conversão (Quantas unidades vêm no pacote). | 12                      |

> [!NOTE]
> `stock_quantity` é a coluna usada para validação rápida de "Tem estoque?". Mas
> a realidade física é dividida entre soltos e pacotes.

---

## 2. Movimentações de Estoque (`inventory_movements`)

Toda alteração de estoque DEVE gerar um registro nesta tabela. É o log auditável
(Extrato).

### Schema (v.ERP)

- **`id`**: uuid
- **`created_at`**: timestamp (substitui a antiga coluna `date`)
- **`type_enum`**: Enum (`sale`, `inventory_adjustment`, `stock_transfer_in`,
  `initial_stock`, etc.)
- **`quantity_change`**: int (Positivo para entrada, Negativo para saída)
- **`current_stock_quantity`**: int (Snapshot do estoque total APÓS o movimento)

---

## 3. RPCs Críticas (Funções de Banco)

### A. `create_inventory_movement` (Core)

Função de baixo nível usada para aumentar ou diminuir estoque.

- **Uso:** Vendas, Devoluções, Entradas de Nota.
- **Lógica:**
  - Se `p_movement_type` for 'package': Ajusta `stock_packages` e recalcula o
    total.
  - Se for 'unit': Ajusta `stock_units_loose` e recalcula o total.
  - Cria o registro em `inventory_movements`.
  - Atualiza `products`.

### B. `set_product_stock_absolute` (Ajuste Manual / Balanço)

Função usada pelo **Modal de Ajuste de Estoque**.

- **Diferença:** Define o estoque para um valor EXATO (ex: "Contei e tem 50"),
  em vez de somar/subtrair.
- **Log:** Calcula a diferença entre o valor antigo e o novo e gera um registro
  `inventory_adjustment` com essa diferença, para manter a rastreabilidade.

> [!WARNING]
> Ambas as funções foram refatoradas em Jan/2026 para remover dependências da
> coluna legada `date`. Se editar, mantenha o uso de `created_at`.

---

## 4. Vendas em Fardo (Lógica de Toggle)

No Frontend (Modal de Produto), o toggle "Vender também por caixa/pacote"
(`has_package_tracking`) ativa a UI de pacotes.

- **No Banco:** Não existe uma flag específica. A existência de
  `package_units > 1` e `package_price > 0` implica que o produto suporta fardo.
- **Validação:** O Schema Zod valida os campos de pacote apenas se o toggle
  estiver ON.
