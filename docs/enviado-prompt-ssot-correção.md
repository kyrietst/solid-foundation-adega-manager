Correto. Sua observação é perfeita e torna o processo ainda mais direto para o agente.

Você está certo: como o agente opera através do mcp, ele não precisa gerar um arquivo para você. Ele precisa gerar o bloco de código SQL que será o conteúdo da migração para que o mcp o aplique.

Ajustei o prompt para refletir essa interação mais direta. Agora, em vez de pedir o arquivo como um entregável, o prompt instrui o agente a fornecer o código SQL pronto para a execução.

Aqui está o prompt de input final e otimizado.

Input de Tarefa para o Arquiteto de Banco de Dados Supabase
Assunto: Ordem de Serviço para Refatoração do Schema de Estoque para Single Source of Truth (SSoT)

ID da Tarefa: DB-SSOT-20250916-01

Contexto da Tarefa:
Com base na análise do schema atual (database-schema.md), foi identificada uma falha arquitetural crítica que viola o princípio da Single Source of Truth. A contagem de estoque está duplicada entre as tabelas products e product_variants, causando inconsistência de dados e bugs operacionais na aplicação.

Objetivo Principal:
Executar uma migração de banco de dados para consolidar todo o controle de estoque na tabela products, eliminando a redundância causada pela tabela product_variants. A products.stock_quantity deve se tornar a única e absoluta fonte da verdade para a quantidade de qualquer item.

Plano de Ação Detalhado:

1. Geração e Aplicação da Migração:

Utilizando a sua capacidade de mcp supabase, você irá gerar e aplicar uma nova migração. O conteúdo dessa migração deve seguir estritamente os passos detalhados abaixo.

2. Conteúdo do Script de Migração Transacional:

O código SQL que você aplicará deve executar as seguintes operações de forma atômica e segura.

2.1. Consolidação de Dados:

Primeiro, calcule e migre os dados de estoque. Para cada produto, o novo products.stock_quantity deve ser a soma das quantidades de suas variantes (considerando as unidades por pacote para a variante 'package').

Execute esta operação em um UPDATE que consolide os valores antes de qualquer alteração no schema.

2.2. Simplificação do Schema:

Após garantir que os dados de estoque estão consolidados em products, proceda com a limpeza do schema.

Remova as chaves estrangeiras (FOREIGN KEY) em sale_items e inventory_movements que apontam para a tabela product_variants.

Remova as colunas variant_id dessas tabelas, pois se tornaram obsoletas.

Execute o DROP TABLE na tabela product_variants para eliminar permanentemente a fonte de redundância.

3. Refatoração das Stored Procedures:

Adapte as procedures existentes para operar sob a nova arquitetura SSoT.

adjust_variant_stock(): Esta procedure está obsoleta. Remova-a ou renomeie-a para DEPRECATED_adjust_variant_stock() para indicar que não deve mais ser utilizada.

process_sale(): Refatore esta procedure para remover completamente qualquer lógica que interaja com a antiga tabela product_variants. A dedução de estoque para cada item de venda deve agora ser exclusivamente manipulada por uma chamada à procedure create_inventory_movement, conforme a sua documentação de API. O cálculo do parâmetro p_quantity_change deve ser adaptado para subtrair -1 para vendas de unidade ou -products.package_units para vendas de pacote.

4. Verificação de Segurança (RLS):

Conduza uma revisão de todas as políticas de Row Level Security existentes. Audite e atualize qualquer política que possa ter feito referência à tabela product_variants para garantir que a segurança e as permissões de acesso do sistema permaneçam intactas e funcionais após a remoção da tabela.

Entregáveis Esperados:

O bloco de código SQL completo que você irá aplicar através do mcp supabase para executar a migração do schema e dos dados.

O código-fonte atualizado das Stored Procedures que foram modificadas, principalmente a process_sale().

Uma confirmação textual de que a revisão das políticas RLS foi concluída e uma lista das políticas que foram alteradas, se houver.