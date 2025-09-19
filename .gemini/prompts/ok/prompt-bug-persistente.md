Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**, com foco em depuração de triggers e lógica PL/pgSQL complexa.

Encontramos um bug crítico de cálculo de estoque que persiste. A evidência aponta para um trigger duplicado ou conflitante na tabela `products`. Sua missão é auditar a fundo, encontrar e eliminar a causa raiz deste problema de uma vez por todas.

**CENÁRIO DO BUG (CASO DE TESTE IRREFUTÁVEL):**

1.  **Estado Inicial do Produto "teste":**
    * `stock_packages`: 63
    * `stock_units_loose`: 0

2.  **Ação Executada (Payload enviado pelo Frontend):**
    * Chamada à RPC `adjust_stock_explicit` com os parâmetros:
        * `p_packages_change`: -3
        * `p_units_loose_change`: 0

3.  **Resultado Imediato Retornado pela RPC (conforme logs):**
    * `new_packages`: 60
    * `new_units_loose`: 0

4.  **Resultado Final Persistido no Banco de Dados (O BUG):**
    * `stock_packages`: 57 (uma dedução dupla)
    * `stock_units_loose`: 540 (um valor inexplicável e incorreto)

**Sua Tarefa:**

1.  **Listar Todos os Triggers:**
    * Execute uma consulta no sistema para listar **TODOS** os triggers ativos na tabela `public.products`, incluindo o nome da função que cada um executa. Precisamos de visibilidade total.

2.  **Auditoria de Funções e Triggers:**
    * Analise o código da função `adjust_stock_explicit`.
    * Analise o código da função do trigger `sync_stock_quantity_trigger`.
    * Compare a lista de triggers ativos com o que deveria existir. A causa mais provável é um trigger antigo que não foi removido e está causando o efeito de "eco" ou dupla execução.

3.  **Implementar a Correção Definitiva:**
    * **Elimine a Redundância:** Forneça o script SQL para dar `DROP` no trigger duplicado ou conflitante.
    * **Garanta a Simplicidade:** Confirme que a versão final da função `adjust_stock_explicit` contém apenas a lógica de adição/subtração direta, e que o trigger `sync_stock_quantity_trigger` contém apenas a lógica de sincronização do `stock_quantity`.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Relatório de Auditoria:** A lista de todos os triggers encontrados na tabela `products` e sua análise confirmando a causa raiz (o trigger duplicado).
2.  **Script SQL de Correção:** O(s) comando(s) `DROP TRIGGER` necessários e o código `CREATE OR REPLACE FUNCTION` final e correto para a `adjust_stock_explicit` e para a função do trigger, se necessário.
3.  **Validação Final:** O resultado de uma consulta no produto "teste" após a correção, mostrando que o estoque agora está consistente e correto.