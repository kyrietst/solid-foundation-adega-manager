1. Contexto
Com base na análise aprofundada fornecida no RELATORIO_BUGS_ESTOQUE.md, foi identificado que a causa raiz das inconsistências de estoque é um conflito arquitetural no banco de dados. Múltiplos mecanismos (trigger_update_variant_stock e trg_adjust_stock em conjunto com a função process_sale) tentam manipular o estoque simultaneamente, resultando em subtrações duplicadas e incorretas.

A operação de ajuste manual de estoque funciona corretamente pois ela não aciona essa cadeia de triggers conflitantes, confirmando o diagnóstico.

2. Decisão Arquitetural
Fica decidido:

Adoção da "Opção 1: Correção Rápida e Cirúrgica" do relatório.

A função process_sale() será consolidada como a ÚNICA FONTE DA VERDADE (Single Source of Truth) para a lógica de subtração de estoque durante uma venda.

Desativação imediata do trigger trigger_update_variant_stock, que opera na tabela sale_items, pois sua lógica é redundante e concorrente à orquestração principal.

A refatoração completa para unificar os sistemas de variants e products (Opção 2 do relatório) é reconhecida como a solução ideal a longo prazo e será tratada como dívida técnica, a ser priorizada em um novo Épico (Épico 3: Unificação do Modelo de Dados de Estoque) após a estabilização completa do sistema.

3. Plano de Ação Imediato (Sua Missão)
Você deve executar os seguintes passos na ordem exata descrita.

FASE 1: PREPARAÇÃO E SEGURANÇA

Backup Completo: Antes de qualquer alteração, realize um backup completo do banco de dados de produção. Confirme que o backup foi concluído com sucesso.

FASE 2: IMPLEMENTAÇÃO DA CORREÇÃO

Desabilitar o Trigger Conflitante: Execute o comando SQL para desabilitar o trigger que está causando a duplicação da lógica.

ALTER TABLE public.sale_items DISABLE TRIGGER trigger_update_variant_stock;

Centralizar a Lógica em process_sale: A stored procedure process_sale deve ser alterada para garantir que ela, e somente ela, realize a dedução do estoque de forma correta, manipulando tanto stock_quantity (unidades) quanto stock_packages (pacotes), se aplicável. A lógica interna da procedure já deve estar correta após as últimas intervenções, mas agora ela operará sem a interferência do outro trigger.

Criar Script de Migração: Crie um novo arquivo de migração no Supabase com o comando da FASE 2, Passo 2. Isso garante que a mudança seja versionada e possa ser revertida se necessário.

Exemplo de comando: supabase migration new hotfix_disable_redundant_stock_trigger

FASE 3: VALIDAÇÃO FINAL

Executar o Plano de Teste de Aceitação: Siga rigorosamente o "Plano de Teste de Aceitação: Ciclo de Venda" que defini na nossa conversa anterior.

Verifique o estado do estoque ANTES da venda.

Execute uma venda de um produto específico.

Verifique o estado do estoque DEPOIS da venda.

Confirme o registro na tabela sales e sale_items.

Confirme o registro único e correto na tabela de auditoria inventory_movements.

4. Critério de Sucesso
A missão estará concluída quando uma venda completa no PDV subtrair a quantidade exata de itens do estoque, sem duplicatas ou cálculos incorretos, conforme validado pelo Plano de Teste de Aceitação.