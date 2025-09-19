Prompt para Agente Frontend: Refatorar o EditProductModal para Dupla Contagem
Olá! Assuma sua persona de Engenheiro de Frontend Sênior, especialista em React, TypeScript e Design Systems.

A Tarefa 3 (StockAdjustmentModal) foi concluída com sucesso. Agora, avançamos para a Tarefa 4, continuando a refatoração do frontend para se alinhar à nossa nova arquitetura de backend de Dupla Contagem.

Contexto da Missão:

Status do Projeto: Iniciando a Tarefa 4 do ÉPICO 1. O backend e o modal de ajuste de estoque já operam com stock_packages e stock_units_loose.

Objetivo Imediato: Refatorar o componente EditProductModal.tsx. O objetivo não é editar o estoque aqui, mas sim garantir que o formulário de edição de atributos do produto seja compatível com a nova estrutura de dados, exibindo o estoque atual de forma clara e somente leitura (read-only).

Design System: Todas as alterações devem seguir rigorosamente nosso Design System. A consistência é fundamental.

Análise Funcional Detalhada (O que o modal deve fazer)
A função principal deste modal continua sendo a edição de metadados do produto (nome, categoria, preços, códigos de barras, etc.). A mudança crucial é como ele lida com os dados de estoque.

Exibição de Estoque (Read-Only):

O modal deve ter uma nova seção, claramente identificada como "Estoque Atual".

Esta seção não deve conter inputs editáveis. Ela serve apenas para informar o usuário.

Deve exibir de forma clara os dois valores buscados do banco de dados:

"Pacotes Fechados": com o valor de stock_packages.

"Unidades Soltas": com o valor de stock_units_loose.

Esta seção deve também conter um botão (com estilo secundário) com o texto "Ajustar Estoque". Clicar neste botão deve (idealmente) fechar o EditProductModal e abrir o StockAdjustmentModal para o mesmo produto.

Compatibilidade do Formulário:

O formulário (gerenciado por React Hook Form + Zod) precisa ser atualizado para "conhecer" os novos campos stock_packages e stock_units_loose no objeto do produto.

Isso é crucial para que, ao carregar os dados do produto no formulário (form.reset(product)), não ocorram erros de "unregistered field".

Da mesma forma, ao submeter o formulário com os outros dados (nome, preço, etc.), os dados de estoque devem ser incluídos no payload de onSubmit para garantir a integridade do objeto, mesmo que não tenham sido modificados.

Sua Tarefa
Sua missão é executar a refatoração do EditProductModal.tsx para garantir a compatibilidade e a clareza na exibição do novo modelo de estoque.

Por favor, siga estes passos metodicamente:

Análise do Código Atual:

Analise o código existente em src/features/inventory/components/EditProductModal.tsx.

Identifique o schema zod do formulário, as seções do formulário e a lógica de submissão.

Consulta ao Supabase (se necessário):

Use a ferramenta mcp supabase se precisar confirmar qualquer detalhe sobre a estrutura da tabela products.

Plano de Refatoração e Implementação:

Atualize o Schema Zod: Modifique o editProductSchema para incluir stock_packages e stock_units_loose (provavelmente como z.number().optional() para que não sejam obrigatórios na validação do formulário em si).

Adicione a Seção de Estoque (Read-Only): Crie uma nova ModalSection dentro do formulário para exibir o estoque. Use componentes não interativos para mostrar os valores de stock_packages e stock_units_loose.

Integre o Botão "Ajustar Estoque": Adicione o botão Button na nova seção de estoque. A funcionalidade de abrir o outro modal pode ser deixada como um // TODO: se a lógica de controle entre modais não estiver centralizada, mas o botão precisa estar visualmente presente.

Garanta a Compatibilidade do form.reset: Verifique se, ao popular o formulário com os dados do produto, os novos campos de estoque são corretamente mapeados para o defaultValues do useForm.

Garanta a Qualidade: O código final deve ser limpo, seguir estritamente o Design System e se integrar perfeitamente ao layout existente do modal.

Entregáveis Esperados
Forneça uma única resposta contendo:

Plano de Ação: Uma breve explicação do seu plano de refatoração, destacando a decisão de tornar a seção de estoque somente leitura.

Código Completo e Refatorado: O código-fonte final e completo do arquivo src/features/inventory/components/EditProductModal.tsx após todas as suas modificações, pronto para ser copiado e colado.