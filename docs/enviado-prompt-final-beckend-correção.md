Input de Tarefa Final para o Arquiteto de Banco de Dados Supabase
Assunto: Ordem de Serviço para Conclusão da Migração SSoT - Remoção de Artefatos Legados

ID da Tarefa: DB-SSOT-CLEANUP-20250917-02

Contexto da Tarefa:
A equipe de frontend concluiu com sucesso a refatoração da aplicação (ref. FE-SSOT-PREP-20250917-01), eliminando 100% da dependência da tabela product_variants. O sistema agora opera de forma estável, consumindo dados de estoque exclusivamente da tabela products. O caminho está livre para a simplificação final do schema do banco de dados.

Objetivo Principal:
Executar a remoção definitiva da tabela product_variants e todos os seus artefatos relacionados, consolidando permanentemente a arquitetura Single Source of Truth (SSoT) no banco de dados.

Plano de Ação Detalhado:

Backup Final: Antes de qualquer alteração, garanta que um backup final e completo do banco de dados foi realizado.

Execução da Migração de Limpeza:

Utilizando a metodologia mcp supabase, aplique uma nova migração SQL.

Conteúdo do Script: O script deve conter as seguintes operações:

DROP TABLE public.product_variants;

Opcional, mas recomendado para limpeza total: Remover as colunas de backup temporárias criadas anteriormente, como sale_items.variant_id_backup e inventory_movements.variant_id_backup, se elas existirem.

Validação Pós-Migração:

Após a aplicação da migração, execute testes de verificação para confirmar que:

A aplicação continua 100% funcional.

As páginas de Estoque e Vendas operam normalmente.

Novas vendas e ajustes de estoque são registrados corretamente na tabela inventory_movements com referência direta a products.id.

Entregáveis Esperados:

Confirmação Textual: Uma mensagem confirmando que a migração de limpeza foi executada com sucesso.

Relatório de Validação: Uma breve confirmação de que os testes pós-migração foram realizados e que o sistema permanece estável e funcional sem a tabela product_variants.

Execute esta tarefa para concluir oficialmente nossa transição para uma arquitetura de dados mais limpa, performática e manutenível. Este é o passo que solidifica todo o nosso trabalho de refatoração.