
---

### Prompt para Agente Frontend: Adaptar o Fluxo de Venda (PDV) para Dupla Contagem

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, com expertise em fluxos de e-commerce, gerenciamento de estado e experiência do usuário.

Concluímos com sucesso toda a refatoração do backend e dos modais de inventário. O sistema de Dupla Contagem está robusto e funcional. Agora, iniciamos a **Tarefa 6**, a última etapa de implementação de frontend deste épico: adaptar a tela de Ponto de Venda (PDV) para operar com a nova lógica de estoque.

**Contexto da Missão:**

* **Status do Projeto:** Iniciando a Tarefa 6 do ÉPICO 1. Todas as demais tarefas de refatoração de backend e frontend (modais) estão concluídas.
* **Objetivo Imediato:** Implementar as "guardas" de estoque na tela de vendas para garantir que a integridade do sistema de Dupla Contagem seja mantida durante as operações de venda.
* **Regra de Negócio CRÍTICA:** O sistema deve **impedir a venda de uma unidade de produto se o estoque de unidades soltas (`stock_units_loose`) for zero**. A venda de pacotes também deve ser impedida se o estoque de pacotes (`stock_packages`) for zero.

### Análise Funcional Detalhada (O que o PDV deve fazer)

A tela de vendas é o ponto mais crítico de interação. A experiência do usuário deve ser fluida, mas as regras de negócio devem ser aplicadas de forma rigorosa para evitar inconsistências no estoque.

1.  **Busca de Dados no PDV:**
    * O componente que exibe a grade de produtos para venda (provavelmente `ProductsGrid.tsx` dentro da `feature/sales`) deve ser atualizado. Sua query de busca de produtos precisa agora, obrigatoriamente, incluir os campos `stock_packages` e `stock_units_loose`.

2.  **Interface do Usuário (UI) e Feedback Visual:**
    * O card de produto na tela de vendas (`SalesProductCard.tsx` ou similar) precisa ser modificado para fornecer feedback visual instantâneo sobre a disponibilidade.
    * O botão **"Adicionar Unidade"** deve ser **desabilitado** (`disabled`) se o produto correspondente tiver `stock_units_loose <= 0`.
    * O botão **"Adicionar Pacote"** (se existir) deve ser **desabilitado** se o produto tiver `stock_packages <= 0`.
    * É crucial adicionar um componente `<Tooltip>` a esses botões quando desabilitados, explicando o motivo ao usuário (ex: "Sem unidades soltas em estoque" ou "Sem pacotes fechados em estoque").

3.  **Lógica do Carrinho de Compras (`use-cart`):**
    * A lógica de adicionar itens ao carrinho (provavelmente no hook `use-cart.ts` ou em um estado Zustand) deve ser a nossa segunda linha de defesa.
    * A função `addItemToCart` deve ser modificada. Antes de adicionar um item, ela deve realizar uma verificação final:
        * Se o item for uma unidade, verificar se `product.stock_units_loose > 0`.
        * Se o item for um pacote, verificar se `product.stock_packages > 0`.
    * Se a verificação falhar (por exemplo, devido a dados em cache), a função não deve adicionar o item ao carrinho e, em vez disso, deve disparar uma notificação (`toast`) informando ao usuário que o produto está sem estoque.

### Sua Tarefa

Sua missão é localizar e refatorar os componentes e hooks responsáveis pelo fluxo de venda para implementar as regras de negócio da Dupla Contagem.

**Por favor, siga estes passos:**

1.  **Localizar os Arquivos Relevantes:** Analise a estrutura da `feature/sales` para identificar os componentes-chave: a página de vendas, a grade de produtos e o hook de gerenciamento do carrinho.
2.  **Atualizar a Busca de Dados:** Modifique a query do React Query na tela de vendas para buscar os novos campos de estoque.
3.  **Implementar as Mudanças na UI:** Altere o card de produto do PDV para desabilitar os botões de adicionar ao carrinho com base no estoque de `stock_units_loose` e `stock_packages`, incluindo os tooltips informativos.
4.  **Reforçar a Lógica do Carrinho:** Adicione a lógica de verificação de segurança dentro do hook `use-cart` para prevenir a adição de itens sem estoque e notificar o usuário adequadamente.
5.  **Garantir a Qualidade:** Assegure que as mudanças sejam performáticas, sigam o Design System e não introduzam nenhum comportamento inesperado no fluxo de venda.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Análise e Plano de Ação:** Um breve relatório identificando os arquivos que você irá modificar e descrevendo seu plano para implementar as mudanças.
2.  **Código Completo e Refatorado:** O código-fonte final e completo de **todos os arquivos modificados** (ex: `ProductsGrid.tsx`, `SalesProductCard.tsx`, `use-cart.ts`, etc.), prontos para serem copiados e colados no projeto.