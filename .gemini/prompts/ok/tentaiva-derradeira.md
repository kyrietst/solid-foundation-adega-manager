

-----

### Prompt para Agente

**Agente a ser utilizado:** `supabase-database-architect`

**Assunto:** Correção Urgente de Bug Crítico na Stored Procedure `adjust_stock_explicit`

**Contexto:**
Estamos finalizando o ÉPICO 1 (Implementação de Estoque de Dupla Contagem), que utiliza as colunas `stock_packages` (pacotes) e `stock_units_loose` (unidades soltas) na tabela `products` para gerenciar o estoque. A principal procedure para modificar esse estoque é a `adjust_stock_explicit`, que aceita as mudanças em pacotes (`p_packages_change`) e em unidades soltas (`p_units_loose_change`) como parâmetros.

**Descrição do Bug Crítico:**
Foi identificado um bug de corrupção de dados. Ao realizar um ajuste de estoque que modifica *apenas* a quantidade de pacotes (ex: `p_packages_change = -5` e `p_units_loose_change = 0`), a procedure está, incorretamente, calculando o equivalente em unidades da mudança de pacotes (ex: `-5 * 10 [unidades por pacote] = -50 unidades`) e subtraindo este valor da coluna `stock_units_loose`.

Isso resulta em uma dupla contagem negativa: o número de pacotes é ajustado corretamente, mas o estoque de unidades soltas também é reduzido, o que não foi solicitado e corrompe a contagem total do estoque.

**Análise da Causa Raiz:**
A suspeita, com 99% de certeza, é de que a instrução `UPDATE` dentro da procedure `adjust_stock_explicit` está realizando um cálculo cruzado indevido. A lógica defeituosa provavelmente se assemelha a:

```sql
-- Lógica hipotética com o bug
UPDATE products
SET
  stock_packages = stock_packages + p_packages_change,
  stock_units_loose = stock_units_loose + p_units_loose_change + (p_packages_change * package_units) -- LINHA INCORRETA
WHERE id = p_product_id;
```

**Sua Missão:**

1.  **Localize** a stored procedure `adjust_stock_explicit` no nosso esquema do Supabase.
2.  **Inspecione** a instrução `UPDATE` que modifica a tabela `products`.
3.  **Corrija** a lógica para garantir que as colunas `stock_packages` e `stock_units_loose` sejam atualizadas de forma independente, utilizando *apenas* seus respectivos parâmetros de delta (`p_packages_change` e `p_units_loose_change`). A conversão de pacotes para unidades não deve, em hipótese alguma, afetar o `stock_units_loose` nesta operação.
4.  **Forneça** o código SQL completo e corrigido da function `adjust_stock_explicit` para que eu possa aplicá-lo no banco de dados.

**Critérios de Aceitação:**

  - A procedure atualizada deve passar nos seguintes cenários de teste:
      - Se `p_packages_change` for `-5` e `p_units_loose_change` for `0`, apenas `stock_packages` deve ser alterado. `stock_units_loose` deve permanecer intacto.
      - Se `p_packages_change` for `0` e `p_units_loose_change` for `20`, apenas `stock_units_loose` deve ser alterado. `stock_packages` deve permanecer intacto.
      - Se ambos os parâmetros tiverem valores, ambas as colunas devem ser atualizadas de forma independente e correta.