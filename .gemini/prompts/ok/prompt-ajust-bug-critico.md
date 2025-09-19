Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**, com foco em depuração de lógica em funções PL/pgSQL.

Encontramos um bug de cálculo crítico na função `adjust_stock_explicit` que está corrompendo os dados de estoque. Precisamos de sua expertise para auditar o código da função e corrigir a falha de lógica.

**CENÁRIO DO BUG (CASO DE TESTE):**

1.  **Estado Inicial do Produto "teste":**
    * `stock_packages`: 62
    * `stock_units_loose`: 0

2.  **Ação Executada:**
    * Chamada à RPC `adjust_stock_explicit` com os seguintes parâmetros (delta):
        * `p_packages_change`: -2
        * `p_units_loose_change`: 0

3.  **Resultado Esperado:**
    * `stock_packages`: 60
    * `stock_units_loose`: 0

4.  **Resultado Atual (BUG):**
    * `stock_packages`: 58
    * `stock_units_loose`: 560

**Sua Tarefa:**

Sua missão é depurar o código-fonte da função `adjust_stock_explicit` para encontrar e corrigir o erro de cálculo.

1.  **Auditoria de Código:**
    * Analise o código PL/pgSQL da função `adjust_stock_explicit`.
    * Nossa especificação de "Controle Explícito" exige que a função execute **apenas** uma adição/subtração direta dos deltas recebidos. A lógica deveria ser tão simples quanto:
        ```sql
        UPDATE products
        SET
          stock_packages = stock_packages + p_packages_change,
          stock_units_loose = stock_units_loose + p_units_loose_change
        WHERE id = p_product_id;
        ```
    * Identifique qualquer cálculo, conversão ou lógica adicional que esteja sendo executada e que cause a discrepância nos resultados.

2.  **Implementação da Correção:**
    * Reescreva a função `adjust_stock_explicit` para garantir que ela siga **estritamente** a lógica de adição/subtração direta dos deltas, sem nenhum cálculo ou conversão extra.
    * Garanta que a função ainda interaja corretamente com o trigger `sync_stock_quantity_trigger` para manter o `stock_quantity` total atualizado.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Análise da Causa Raiz:** Uma explicação clara de qual parte do código na função estava causando o erro de cálculo.
2.  **Script SQL Corrigido:** O código `CREATE OR REPLACE FUNCTION` completo para a função `adjust_stock_explicit`, agora com a lógica de cálculo corrigida e simplificada, pronto para ser aplicado.