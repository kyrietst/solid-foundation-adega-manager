Prompt de Input para o Arquiteto de Banco de Dados Supabase
Assunto: Ordem de Serviço para Análise de Inconsistência de Cálculo em Ajuste de Estoque

ID da Tarefa: BUG-DIAG-20250917-01

Contexto da Tarefa:
Foi identificado um bug de cálculo na interface do usuário, especificamente no modal de ajuste de estoque (StockAdjustmentModal). Conforme as evidências, ao adicionar uma quantidade de pacotes que resulta em um total superior a 9, a pré-visualização do "Estoque Final" exibe um valor incorreto.

Cenário Falho: Estoque anterior de 5 pacotes + entrada de 6 pacotes resulta em uma exibição de "1 pacote e 1 unidade", em vez dos 11 pacotes esperados.

Cenário Válido: Estoque anterior de 5 pacotes + entrada de 4 pacotes resulta na exibição correta de "9 pacotes".

A hipótese principal é que a falha reside na lógica de cálculo do lado do cliente (frontend) e não na lógica do banco de dados. Sua tarefa é validar a integridade do backend e fornecer uma análise técnica para direcionar a correção.

Plano de Ação Detalhado:

1. Validar a Integridade da Lógica de Backend (SSoT):

Analise a Stored Procedure create_inventory_movement. Confirme que ela opera de forma agnóstica à interface, simplesmente somando ou subtraindo um quantity_change inteiro ao products.stock_quantity.

Descreva o que aconteceria no banco de dados se a operação do "Cenário Falho" fosse executada corretamente. Supondo que o produto "teste" tenha package_units = 10 e um estoque inicial de 50 (5 pacotes), simule a chamada: create_inventory_movement com quantity_change = 60 (6 pacotes). Descreva o valor final e correto de products.stock_quantity.

2. Fornecer uma Análise Técnica da Causa Provável:

Com base na sua validação de que a lógica do backend é robusta e transacional, emita um parecer técnico sobre a origem mais provável do bug.

Explique por que o comportamento (funcionar para <10 e falhar para >=10) aponta para um erro de manipulação de números ou strings na lógica de pré-visualização do componente de frontend, que ocorre antes de qualquer chamada ao banco de dados.

3. Recomendar os Próximos Passos:

Formalize uma recomendação para que esta análise seja encaminhada ao Engenheiro de Frontend Sênior.

Sugira o local mais provável do código a ser investigado (ex: o componente StockAdjustmentModal.tsx e qualquer hook ou utilitário relacionado ao cálculo de pré-visualização de estoque).

Entregáveis Esperados:

Confirmação da Lógica do Backend: Um parágrafo confirmando que a procedure create_inventory_movement lidaria com a transação corretamente e qual seria o resultado esperado no banco de dados.

Parecer Técnico: Uma análise clara apontando o frontend como a causa raiz do bug de exibição, explicando o porquê.

Recomendação Direcionada: Uma recomendação formal para a equipe de frontend investigar o componente do modal de ajuste de estoque.