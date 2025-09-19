Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**.

Sua investigação anterior foi um sucesso e identificou a causa raiz da nossa inconsistência de estoque: os dados históricos da coluna `stock_quantity` nunca foram migrados para as novas colunas `stock_packages` e `stock_units_loose`.

Sua missão agora é finalizar o trabalho: executar a migração de dados e implementar o mecanismo de sincronização para prevenir futuras inconsistências.

**Sua Tarefa:**

**1. Executar a Migração de Dados:**
   * Execute a função `migrate_stock_to_dual_counting()` que você identificou anteriormente.
   * Esta ação deve ser aplicada a **todos os produtos** na tabela para sincronizar o estoque histórico de uma vez por todas.

**2. Implementar o Trigger de Sincronização:**
   * Crie e aplique um trigger na tabela `products`.
   * Este trigger deve ser acionado em qualquer `UPDATE` nas colunas `stock_packages` ou `stock_units_loose`.
   * A função do trigger deve ser recalcular e atualizar a coluna `stock_quantity` para garantir que ela sempre reflita o total correto (`stock_quantity = (stock_packages * package_units) + stock_units_loose`). Isso garante a compatibilidade com partes do sistema que ainda leem a coluna antiga.

**3. Validação Final:**
   * Após executar a migração e criar o trigger, execute novamente a consulta no produto "teste" para confirmar que os dados agora estão consistentes.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Confirmação de Execução:** Uma mensagem confirmando que a função de migração foi executada com sucesso para todos os produtos.
2.  **Código do Trigger:** O script SQL completo da função do trigger e do comando `CREATE TRIGGER` que você implementou.
3.  **Dados de Validação:** O resultado da consulta final no produto "teste", mostrando os valores agora sincronizados de `stock_quantity`, `stock_packages`, e `stock_units_loose`.