Input de Tarefa para o Engenheiro de Frontend Sênior
Assunto: Ordem de Serviço para Refatoração do Frontend para Arquitetura Single Source of Truth (SSoT)

ID da Tarefa: FE-SSOT-PREP-20250917-01

Contexto da Tarefa:
A missão anterior (BUG-DIAG-20250917-01) foi um sucesso tático. Estabilizamos o sistema corrigindo um bug de cálculo crítico e restaurando temporariamente a tabela product_variants para eliminar erros 404. Agora, com o sistema estável, iniciaremos a fase estratégica final: refatorar o frontend para que ele opere de forma independente da tabela product_variants, permitindo sua remoção definitiva no backend.

Objetivo Principal:
Refatorar todos os componentes e hooks relacionados às páginas de Estoque e Vendas para que toda a lógica de busca, exibição e manipulação de dados de produtos utilize exclusivamente a tabela products como a "Fonte Única da Verdade", eliminando 100% da dependência da tabela product_variants.

Plano de Ação Detalhado:

1. Análise de Pontos de Contato:

Inicie analisando a base de código para mapear todos os locais onde a tabela (ou tipo) product_variants é atualmente utilizada.

Foco Principal:

src/features/inventory/ (Página de Estoque e componentes relacionados)

src/features/sales/ (Página de Vendas, Carrinho, e modais de seleção)

Hooks que buscam dados de produtos (ex: useProducts, useProductVariants).

2. Refatoração da Lógica de Busca de Dados:

Modifique todos os hooks e chamadas à API Supabase.

Ação: Altere as queries para que, em vez de buscar em product_variants, elas busquem diretamente da tabela products. A query deve retornar o objeto do produto, incluindo stock_quantity e package_units.

Exemplo: O hook useProductVariants deve ser descontinuado ou refatorado para se tornar um useProducts que busca da tabela products.

3. Refatoração da Lógica de Exibição de Estoque (Ação Crítica):

Em todos os componentes que exibem o estoque (ex: InventoryTable.tsx, ProductSelectionModal.tsx), remova qualquer lógica que leia estoques separados para unidades e pacotes.

Ação:

Implemente de forma consistente o uso da função calculatePackageDisplay ou do componente <StockDisplay />.

A função deve receber o stock_quantity total da tabela products e o package_units para calcular e exibir dinamicamente a string correta (ex: "11 pacotes" ou "10 pacotes e 5 unidades").

4. Refatoração do Fluxo de Adição ao Carrinho (Página de Vendas):

Modifique o fluxo de adição de produtos ao carrinho.

Ação:

Remova o modal de seleção que pergunta entre "unidade" e "pacote" se ele depender de product_variants.

Conforme nossa arquitetura de UX proposta, implemente botões de ação direta no card do produto: + Unidade e + Pacote.

Ao clicar em + Pacote, o frontend deve adicionar o item ao carrinho sabendo que ele representa package_units do stock_quantity total.

Entregáveis Esperados:

Relatório de Componentes Refatorados: Uma lista de todos os arquivos (.tsx) e hooks (.ts) que foram modificados para remover a dependência de product_variants.

Confirmação de Funcionalidade: Um resumo confirmando que as páginas de Estoque e Vendas continuam 100% funcionais, mas agora operando sob a nova lógica SSoT.

Código-Fonte das Funções-Chave: Forneça o código atualizado de hooks de busca de dados e do componente que exibe o estoque, para validação da nova implementação.

Execute esta refatoração com precisão. Este trabalho irá desacoplar permanentemente o frontend da estrutura de dados legada, permitindo que a equipe de backend execute a migração final para SSoT sem qualquer risco para a estabilidade da aplicação.