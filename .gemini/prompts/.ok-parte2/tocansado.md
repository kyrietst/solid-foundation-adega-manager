Assunto: [MISSÃO DE DIAGNÓSTICO FORENSE] Encontrar a Discrepância de Dados Entre Frontend e Backend no Fluxo de Venda
Para: supabase-database-architect / Agente de Frontend
Prioridade: CRÍTICA

1. Contexto do Problema

O sistema está falhando em um cenário específico e crítico:

A venda de unidades subtrai o estoque corretamente.

A venda de pacotes falha silenciosamente, não alterando o estoque de pacotes.

Isso nos leva a uma única suspeita: existe uma discrepância sutil no valor do campo sale_type entre o que o frontend envia e o que a stored procedure process_sale no backend espera.

2. Sua Missão

Sua tarefa é realizar uma análise de código focada para confirmar ou refutar esta suspeita. Você deve atuar na sua área de especialidade (Frontend ou Backend) e responder a perguntas específicas.

Se você é o supabase-database-architect (Agente Backend):
Sua análise deve focar exclusivamente no arquivo debug_process_sale_with_logs.sql.

Perguntas a Responder:

Análise da Lógica Condicional: Inspecione a estrutura IF v_sale_type = 'unit' THEN ... ELSIF v_sale_type = 'package' THEN .... Qual é a string exata, caractere por caractere (incluindo maiúsculas/minúsculas), que a procedure espera para identificar um pacote?

Análise da Limpeza de Dados: Examine a linha v_sale_type := TRIM(LOWER(item->>'sale_type'));. Esta linha garante que a comparação não seja sensível a maiúsculas/minúsculas ou espaços em branco. Isso está funcionando como esperado?

Veredito: Com base na sua análise, qual é o valor exato que o campo sale_type precisa ter no JSON para que o bloco de código que subtrai stock_packages seja executado?

Entregável:
Crie um arquivo chamado analise_backend.md contendo as respostas detalhadas para as três perguntas acima.

Se você é o Agente de Frontend:
Sua análise deve focar nos arquivos do frontend, principalmente no hook use-sales.ts, que monta o payload da venda.

Perguntas a Responder:

Análise da Construção do Payload: Encontre a seção do código onde o array items é criado para ser enviado à procedure process_sale. Qual é a string exata, caractere por caractere (incluindo maiúsculas/minúsculas), que está sendo atribuída ao campo sale_type quando um item do tipo "pacote" é vendido?

Análise de Tipos de Dados: Existe alguma interface ou type TypeScript que define os valores possíveis para sale_type? Se sim, quais são eles?

Veredito: Com base na sua análise, qual é o valor exato que o frontend está enviando no campo sale_type para um pacote?

Entregável:
Crie um arquivo chamado analise_frontend.md contendo as respostas detalhadas para as três perguntas acima.