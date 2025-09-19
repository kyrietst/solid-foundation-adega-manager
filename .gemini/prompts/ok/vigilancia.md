Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**, com foco em depuração de problemas sistêmicos e segurança.

Nossa investigação anterior sobre o bug crítico de estoque revelou que a causa **não são os triggers**. Suspeitamos agora de um processo externo ou concorrente que está modificando os dados de forma inesperada.

Sua missão é nos ajudar a criar uma "armadilha" de diagnóstico para identificar este processo fantasma.

**Sua Tarefa:**

**1. Crie uma Tabela de Logs Dedicada:**
   * Gere o script SQL para criar uma nova tabela chamada `debug_stock_calls_log`.
   * A tabela deve ter as seguintes colunas:
     * `id` (UUID, primary key, default gen_random_uuid())
     * `created_at` (TIMESTAMPTZ, default now())
     * `source_identifier` (TEXT) - Para identificarmos a origem da chamada.
     * `payload` (JSONB) - Para armazenarmos os parâmetros recebidos.
     * `notes` (TEXT) - Para qualquer observação adicional.

**2. Crie uma Função "Armadilha" (Honeypot):**
   * Gere o script SQL para criar uma nova função RPC chamada `debug_log_stock_adjustment`.
   * Esta função deve aceitar os mesmos parâmetros que a `adjust_stock_explicit`: `p_product_id` (UUID), `p_packages_change` (INTEGER), `p_units_loose_change` (INTEGER), `p_reason` (TEXT).
   * A única lógica desta função será inserir um registro na nossa nova tabela `debug_stock_calls_log`, registrando os parâmetros que recebeu no campo `payload` e uma `source_identifier` de 'adjust_stock_explicit_call'. **Esta função NÃO deve modificar a tabela `products` de forma alguma.**

**3. Modifique a Função Original:**
   * Altere a função `adjust_stock_explicit` existente.
   * A primeira linha de código dentro dela deve ser uma chamada para a nossa nova função de log (`PERFORM debug_log_stock_adjustment(...)`), passando todos os parâmetros que ela recebeu.

**O Plano:**
Com esta estrutura, cada vez que o frontend chamar a função de ajuste, teremos um registro imutável do que foi pedido. Se os dados na tabela `products` mudarem de uma forma que não corresponde ao que está no nosso log, teremos a prova definitiva de que um processo externo está interferindo.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  O script SQL completo para `CREATE TABLE debug_stock_calls_log`.
2.  O script SQL completo para `CREATE OR REPLACE FUNCTION debug_log_stock_adjustment`.
3.  O código `CREATE OR REPLACE FUNCTION` final e modificado para a `adjust_stock_explicit`, agora com a chamada de log integrada.