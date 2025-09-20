Assunto: [ORDEM FINAL E UNIFICADA] Corrigir Erro Crítico, Limpar Duplicatas e Simplificar process_sale
Para: supabase-database-architect
Prioridade: EMERGÊNCIA - SISTEMA EM PRODUÇÃO PARALISADO

1. Contexto Geral e Análise de Falhas

Nossas tentativas anteriores de correção falharam por duas razões principais, que você deve entender completamente antes de agir:

Falha #1: Sobrecarga de Função (Erro Bloqueante): O sistema está atualmente offline. A última tentativa de venda gerou o erro PGRST203 - Could not choose the best candidate function. Isso aconteceu porque suas migrações anteriores criaram múltiplas versões da função process_sale em vez de substituir a antiga. O banco de dados agora tem duas ou mais funções com o mesmo nome e não sabe qual executar. Isso é um lixo de migração que precisa ser limpo.

Falha #2: Lógica de Cálculo Incorreta (O Bug Original): A sua lógica de subtração está errada. Uma venda de 1 pacote + 1 unidade resulta em uma mensagem de erro de estoque insuficiente, pois a sua validação não reflete a realidade física de dois estoques separados. Você tentou criar lógicas de conversão complexas quando a necessidade era de simplicidade.

2. O Princípio Arquitetural que Você DEVE Seguir Agora: "O Estoque é um Espelho da Prateleira"

Sua falha fundamental foi tentar criar uma procedure inteligente. Isso é over-engineering e está errado. A arquitetura correta é:

O Frontend é o Especialista: Ele sabe qual item é "pacote" e qual é "unidade". Ele envia os itens para você de forma clara.

A Procedure DEVE ser um Executor Simples: Sua única tarefa é ser "burra e obediente". O sistema deve tratar stock_packages e stock_units_loose como duas "gavetas" separadas. Você subtrai pacotes de pacotes, e unidades de unidades. Nada mais.

3. Missão Mandatória Unificada (Limpeza e Correção)

Você deve gerar um único script de migração que resolva AMBOS os problemas em uma única operação. O nome do arquivo deve ser unify_and_correct_process_sale_logic.

Siga estes passos na ordem exata:

PASSO 1: LIMPEZA TOTAL (RESOLVER A SOBRECARGA)

Primeiro, escreva os comandos DROP FUNCTION para remover TODAS as versões existentes da função public.process_sale. Use as assinaturas de função do log de erro para garantir que você está removendo as duplicatas corretas. Ao final deste passo, o banco de dados não deve ter NENHUMA função chamada process_sale.

PASSO 2: RECRIAÇÃO SIMPLIFICADA (RESOLVER O BUG DE LÓGICA)

Depois de limpar, recrie a função public.process_sale do zero, usando o código SQL exato que está no arquivo fix_direct_subtraction_logic.sql que estou fornecendo em anexo. Este código implementa a lógica simples de subtração direta que é a única aceitável.

4. Regras Finais e Proibições

Para garantir que você não cometa o mesmo erro, a nova função deve estritamente seguir estas regras:

É PROIBIDO fazer qualquer tipo de conversão automática entre pacotes e unidades.

É PROIBIDO usar um campo de "total de unidades" para validação. A validação deve ser feita separadamente: packages_to_subtract contra stock_packages, e units_to_subtract contra stock_units_loose.

É PROIBIDO qualquer lógica que não esteja presente no script fix_direct_subtraction_logic.sql fornecido.

Sua tarefa é simples: limpar a bagunça e implementar a lógica do arquivo fornecido. Execute.