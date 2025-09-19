Com certeza. Chegamos à etapa final da refatoração dos nossos modais. Com o `StockAdjustmentModal` e o `EditProductModal` já alinhados, a última peça é o `ProductDetailsModal`. A sua função é a mais simples, porém a mais importante para a visualização do dia a dia: mostrar o estado real do estoque.

Aqui está o prompt detalhado para a **Tarefa 5**. Ele instrui o agente a focar na clareza da informação, garantindo que sua cliente veja o estoque da mesma forma que ela o vê no mundo real.

**Nome do arquivo sugerido:** `prompts/EPICO1_TAREFA5_FEAT_ProductDetailsModal.md`

---

### Prompt para Agente Frontend: Refatorar o `ProductDetailsModal` para Dupla Contagem

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, especialista em React, TypeScript e Design Systems.

Estamos na fase final da refatoração dos modais de inventário. Com as Tarefas 3 e 4 concluídas com sucesso, nossa missão agora é a **Tarefa 5**: alinhar o `ProductDetailsModal` com a nossa arquitetura de **Dupla Contagem (Controle Explícito)**.

**Contexto da Missão:**

* **Status do Projeto:** Iniciando a Tarefa 5 do ÉPICO 1. O backend e os modais de ajuste/edição já estão operando com as colunas `stock_packages` e `stock_units_loose`.
* **Objetivo Imediato:** Refatorar o componente `ProductDetailsModal.tsx` para que ele exiba de forma clara e intuitiva as novas contagens de estoque separadas. A função deste modal é **apenas visualização**.
* **Design System:** Aderência estrita ao nosso Design System é obrigatória para garantir consistência em toda a aplicação.

### Análise Funcional Detalhada (O que o modal deve exibir)

O propósito deste modal é ser o painel de informações rápidas sobre um produto. Ele deve responder à pergunta "Qual o estado deste item agora?" da forma mais direta possível.

1.  **Busca de Dados:**
    * A query que busca os dados do produto deve ser atualizada para incluir explicitamente os campos `stock_packages` e `stock_units_loose`.

2.  **Interface do Usuário (UI) - A Mudança Principal:**
    * **Remover Lógica Antiga:** Qualquer lógica ou função que calcula a exibição de pacotes/unidades a partir da coluna `stock_quantity` (como a antiga `calculatePackageDisplay`) está obsoleta e **deve ser completamente removida**.
    * **Nova Seção de Estoque:** A área que atualmente mostra o estoque deve ser redesenhada para apresentar as informações da Dupla Contagem de forma proeminente. A sugestão de design é usar dois "Stat Cards" lado a lado:
        * Um card para **"Pacotes Fechados"**, exibindo o valor de `stock_packages`.
        * Um card para **"Unidades Soltas"**, exibindo o valor de `stock_units_loose`.
    * **Exibição do Total (Opcional, mas recomendado):** Um terceiro card ou um texto de resumo pode exibir o `stock_quantity` total (que o backend já fornece), com o rótulo "Total em Unidades", para fornecer um contexto completo.
    * **Consistência:** O restante do modal, que exibe outras informações do produto (preço, categoria, códigos de barras, etc.), deve permanecer funcional e consistente.

### Sua Tarefa

Sua missão é executar a refatoração visual e lógica do `ProductDetailsModal.tsx`.

**Por favor, siga estes passos:**

1.  **Análise do Código Atual:**
    * Analise o código existente em `src/features/inventory/components/ProductDetailsModal.tsx`.
    * Identifique a query de busca de dados e a seção do JSX responsável por renderizar as informações de estoque.

2.  **Consulta ao Supabase (se necessário):**
    * Utilize `mcp supabase` se precisar confirmar os nomes exatos das colunas na tabela `products`.

3.  **Plano de Refatoração e Implementação:**
    * **Atualize a Busca de Dados:** Modifique a query do `useQuery` para selecionar o produto com as colunas `stock_packages` e `stock_units_loose`.
    * **Remova Código Obsoleto:** Delete a chamada e a dependência da função `calculatePackageDisplay` ou qualquer outra lógica de cálculo de estoque derivado.
    * **Redesenhe a UI de Estoque:** Implemente a nova seção de estoque com os cards informativos, conforme descrito na análise funcional. Utilize os componentes do nosso Design System (`Card`, `KpiCard`, etc.) para criar uma visualização limpa e profissional.
    * **Garanta a Qualidade:** O código final deve ser legível, performático e perfeitamente alinhado com a estética do restante da aplicação.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Plano de Ação:** Uma breve explicação de como você abordará a refatoração, focando na nova apresentação visual do estoque.
2.  **Código Completo e Refatorado:** O código-fonte final e completo do arquivo `src/features/inventory/components/ProductDetailsModal.tsx` após todas as suas modificações, pronto para ser copiado e colado diretamente no projeto.