Input de Tarefa para o Engenheiro de Frontend Sênior
Assunto: Ordem de Serviço para Análise de Conformidade SSoT dos Modais de Inventário

ID da Tarefa: FE-SSOT-MODAL-AUDIT-20250917-01

Contexto da Tarefa:
Com a conclusão bem-sucedida da migração do backend para a arquitetura Single Source of Truth (SSoT) e a implementação do nosso Design System, é crucial garantir que todos os componentes de frontend estejam alinhados a estes novos padrões. Antes de prosseguir com novas funcionalidades ou otimizações de UX, precisamos validar e, se necessário, planejar a correção dos principais modais de interação com os produtos.

Objetivo Principal:
Realizar uma análise técnica detalhada de três modais críticos do módulo de inventário — "Ajustar Estoque", "Detalhes do Produto" e "Editar Produto" — para avaliar sua conformidade com a arquitetura SSoT e identificar qualquer lógica ou dependência legada.

Plano de Ação Detalhado - Análise por Componente:

Você deve analisar os seguintes arquivos e responder às perguntas correspondentes para cada um deles.

1. Modal de Ajuste de Estoque (src/features/inventory/components/StockAdjustmentModal.tsx)

Análise de Fluxo: Investigue o fluxo completo, desde a abertura do modal até o envio do ajuste.

Perguntas a Responder:

Busca de Dados: Como o modal recebe os dados do produto, incluindo o estoque atual? Ele busca diretamente da tabela products ou ainda existe alguma referência a product_variants?

Exibição de Estoque: Como o "Estoque Anterior" e o "Estoque Final" são calculados e exibidos na pré-visualização ("Resumo do ajuste")? A lógica está utilizando a função centralizada calculatePackageDisplay ou possui um cálculo manual próprio?

Lógica de Submissão: Ao salvar o ajuste, qual função ou hook é chamado? Ele invoca a procedure RPC correta (create_inventory_movement) passando um quantity_change numérico e absoluto, conforme a documentação da API SSoT?

2. Modal de Detalhes do Produto (src/features/inventory/components/ProductDetailsModal.tsx)

Análise de Fluxo: Investigue como os detalhes de um produto são carregados e apresentados ao usuário.

Perguntas a Responder:

Busca de Dados: Qual hook (useProduct ou similar) é utilizado para buscar os dados? Confirme que ele busca exclusivamente da tabela products. Existe algum resquício do hook useProductVariants ou lógica similar?

Exibição de Estoque: Como o estoque do produto é exibido neste modal? Ele utiliza o componente <StockDisplay /> do nosso Design System para garantir a exibição dinâmica e padronizada de pacotes e unidades?

Ações do Modal: Os botões de ação dentro deste modal (como "Editar" ou "Ajustar Estoque") estão direcionando para os outros modais e passando os dados corretamente, já no formato SSoT?

3. Modal de Edição do Produto (src/features/inventory/components/EditProductModal.tsx)

Análise de Fluxo: Investigue o processo de carregar os dados de um produto em um formulário, editá-los e salvá-los.

Perguntas a Responder:

Carregamento do Formulário: Ao abrir o modal para edição, os campos de estoque (stock_quantity) são populados com o valor correto vindo da tabela products?

Interação com o Estoque: O formulário permite a edição direta do campo stock_quantity? Se sim, como essa alteração é tratada? A boa prática seria que a edição de estoque fosse feita exclusivamente através do modal de "Ajustar Estoque". Verifique se há um bloqueio ou aviso para o usuário sobre isso.

Lógica de Submissão: Ao salvar o formulário de edição, a lógica de atualização envia dados apenas para a tabela products? Confirme que não há tentativas de atualizar ou criar registros na antiga product_variants.

Entregáveis Esperados:

Relatório de Análise em Markdown: Um documento único, dividido em três seções (uma para cada modal).

Detalhes por Seção: Dentro de cada seção, responda às perguntas listadas, fornecendo trechos de código (code snippets) relevantes do estado atual para evidenciar suas conclusões.

Veredito de Conformidade: Para cada modal, forneça um veredito final:

✅ SSoT Conforme: O modal já opera corretamente com a nova arquitetura.

⚠️ Requer Refatoração: O modal ainda utiliza lógica legada e precisa de correção. Descreva brevemente o principal ponto de falha.

Esta análise nos dará a clareza necessária para criar um prompt de correção preciso e eficiente.