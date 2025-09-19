Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**.

Estamos em fase final de testes e encontramos uma inconsistência crítica nos dados de estoque para um produto específico, o que está impedindo a conclusão dos testes.

**Contexto da Missão:**

* **Problema:** Um produto de teste exibe um estoque total (`stock_quantity`) de 200 unidades na interface principal, mas ao abrir os modais de ajuste e na tela de vendas, o estoque de pacotes (`stock_packages`) e de unidades soltas (`stock_units_loose`) aparece como zero.
* **Hipótese:** Suspeitamos de uma falha na sincronização dos dados dentro da tabela `products`, possivelmente relacionada aos triggers que deveriam manter as três colunas de estoque consistentes.

**Sua Tarefa:**

Sua missão é atuar como um investigador de dados para nos fornecer a verdade fundamental sobre o estado deste produto no banco de dados.

**Por favor, execute os seguintes passos:**

1.  **Localize o Produto:**
    * Execute uma consulta na tabela `products` para encontrar o registro onde o campo `name` é igual a 'teste'.

2.  **Extraia os Dados de Estoque:**
    * Para este produto, selecione e nos retorne os valores exatos das seguintes colunas:
        * `id`
        * `name`
        * `stock_quantity`
        * `stock_packages`
        * `stock_units_loose`
        * `package_units`

3.  **Analise e Relate:**
    * Com base nos dados que você encontrar, forneça um breve relatório de diagnóstico respondendo a estas perguntas:
        * Qual é o estado real do estoque do produto "teste" no banco de dados?
        * Os valores são consistentes entre si (ou seja, `stock_quantity` é igual a `(stock_packages * package_units) + stock_units_loose`)?
        * Com base no estado dos dados, qual é a sua principal suspeita para a causa dessa inconsistência?

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Os Dados do Produto:** A linha da tabela com os valores das colunas solicitadas para o produto "teste".
2.  **Seu Relatório de Diagnóstico:** Sua análise profissional sobre o estado dos dados e a provável causa do problema.