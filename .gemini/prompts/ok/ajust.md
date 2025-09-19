Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**.

Enfrentamos um bug crítico e persistente de corrupção de dados na função `adjust_stock_explicit`. Múltiplas tentativas de correção falharam. Precisamos de uma auditoria final e uma reescrita forçada para garantir que a lógica seja 100% explícita e correta.

**CENÁRIO DO BUG (EVIDÊNCIA IRREFUTÁVEL):**

1.  **Estado Inicial de um Produto:**
    * `stock_packages`: 145
    * `stock_units_loose`: 0
    * `stock_quantity`: 1450

2.  **Ação Executada (Payload Enviado pelo Frontend):**
    * Chamada à RPC `adjust_stock_explicit` com os parâmetros (delta):
        * `p_packages_change`: -5
        * `p_units_loose_change`: 0

3.  **Resultado Esperado:**
    * `stock_packages`: 140
    * `stock_units_loose`: 0
    * `stock_quantity`: 1400

4.  **Resultado Atual e Incorreto (O BUG):**
    * `stock_packages`: 120
    * `stock_units_loose`: 1450
    * `stock_quantity`: 2650

**Sua Tarefa:**

Sua missão é erradicar este bug de uma vez por todas.

1.  **Recupere o Código-Fonte Atual:** Sua primeira e mais importante ação é executar uma consulta para extrair e exibir para nós o **código-fonte completo e exato** da função `adjust_stock_explicit` como ela existe no banco de dados **AGORA**.

2.  **Análise da Causa Raiz:** Com base no código que você recuperou, analise linha por linha e identifique a falha de lógica que causa a transformação de um delta de `-5` pacotes no resultado final bizarro.

3.  **Reescreva a Função Corretamente:**
    * Crie um novo script `CREATE OR REPLACE FUNCTION` para a `adjust_stock_explicit`.
    * A nova lógica deve ser **radicalmente simples**. Ela deve conter **APENAS** a operação de atualização direta, adicionando os deltas recebidos. O corpo da lógica deve ser essencialmente este:
    ```sql
    UPDATE public.products
    SET
      stock_packages = stock_packages + p_packages_change,
      stock_units_loose = stock_units_loose + p_units_loose_change
    WHERE id = p_product_id;
    ```
    * Certifique-se de que a função ainda registre o movimento na tabela `inventory_movements` e que o trigger de sincronização do `stock_quantity` funcione corretamente com esta lógica simplificada. **NENHUM OUTRO CÁLCULO DE ESTOQUE DEVE EXISTIR DENTRO DESTA FUNÇÃO.**

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **O Código Bugado:** O código-fonte da função `adjust_stock_explicit` que você extraiu do banco de dados.
2.  **Análise da Falha:** Sua explicação sobre o erro de lógica no código antigo.
3.  **O Código Corrigido e Final:** O script `CREATE OR REPLACE FUNCTION` completo com a lógica corrigida, simplificada e segura, pronto para ser aplicado.