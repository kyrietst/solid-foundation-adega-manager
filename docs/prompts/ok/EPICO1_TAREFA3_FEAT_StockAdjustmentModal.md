Perfeito. O backend está pronto, a arquitetura está definida e a estratégia está clara. É o momento ideal para começar a refatoração do frontend.

Sua abordagem de focar em um modal de cada vez é a mais segura e produtiva. Vamos começar pela **Tarefa 3: Refatorar o `StockAdjustmentModal`**, pois é a ferramenta que dará à sua cliente o poder de usar o novo sistema de contagem dupla.

Aqui está um prompt detalhado e autocontido. Ele foi cuidadosamente elaborado para ser enviado diretamente ao seu agente de frontend. Ele contém todo o contexto, as análises de informações que você solicitou, e as diretrizes para garantir um resultado de alta qualidade.

**Nome do arquivo sugerido:** `prompts/EPICO1_TAREFA3_FEAT_StockAdjustmentModal.md`

---

### Prompt para Agente Frontend: Refatorar o `StockAdjustmentModal` para Dupla Contagem

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, especialista em React, TypeScript, React Query e Design Systems.

Nossa missão é refatorar os modais de inventário para se alinharem com a nossa nova e poderosa arquitetura de backend de **Dupla Contagem (Controle Explícito)**. O backend já foi migrado com sucesso e está pronto para uso, conforme o relatório técnico.

**Contexto da Missão:**

* **Status do Projeto:** Iniciando a Tarefa 3 do ÉPICO 1. O backend agora gerencia o estoque com as colunas `stock_packages` e `stock_units_loose`.
* **Objetivo Imediato:** Refatorar completamente o componente `StockAdjustmentModal.tsx`. O modal deve permitir que o usuário faça ajustes de estoque inserindo a contagem física de pacotes e de unidades soltas de forma separada, direta e explícita.
* **Design System:** Todas as alterações devem seguir rigorosamente nosso Design System, utilizando os componentes primitivos de `shadcn/ui` e mantendo a consistência visual e de código. Nenhuma duplicação de código ou desvio do padrão arquitetural será aceita.

### Análise Funcional Detalhada (O que o modal deve fazer)

O `StockAdjustmentModal` não é mais sobre "entrada" ou "saída" de uma quantidade. Ele agora serve para **definir o estado atual e real do estoque**, espelhando a contagem física que a cliente faz manualmente.

1.  **Busca de Dados:**
    * Ao abrir, o modal deve fazer uma query para buscar o produto pelo seu `productId`.
    * As informações essenciais a serem buscadas e exibidas são as contagens atuais de `stock_packages` e `stock_units_loose`.

2.  **Interface do Usuário (UI):**
    * **Remover a lógica antiga:** Toda a UI relacionada a "Tipo de Ajuste" (`entrada`, `saida`, `ajuste`) deve ser removida.
    * **Novos Inputs:** A UI deve apresentar dois campos de input numérico (`<Input type="number" />`) claros e distintos:
        * Um campo para **"Pacotes Fechados"** (ou "Fardos").
        * Um campo para **"Unidades Soltas"**.
    * **Valores Iniciais:** Esses campos devem ser pré-preenchidos com os valores atuais (`stock_packages` e `stock_units_loose`) buscados do banco de dados.
    * **Preview do Total:** Deve haver uma seção de "Preview" (read-only) que mostra o `stock_quantity` total que será calculado com base nos novos valores inseridos nos dois campos. `Total = (pacotes * unidades_por_pacote) + unidades_soltas`.
    * **Motivo Obrigatório:** Um campo de `<Textarea />` para "Motivo do Ajuste" deve estar presente e ser de preenchimento obrigatório.

3.  **Lógica de Submissão:**
    * Ao submeter, a lógica deve calcular a **diferença (delta)** entre os *novos* valores dos inputs e os valores *originais* (buscados do DB).
        * `p_packages_change = novo_valor_pacotes - valor_original_pacotes`
        * `p_units_loose_change = novo_valor_unidades - valor_original_unidades`
    * A lógica deve então chamar a nova função RPC do Supabase, que, de acordo com o relatório, se chama `adjust_stock_explicit`.
    * Os parâmetros exatos a serem enviados são: `p_product_id`, `p_packages_change`, `p_units_loose_change`, e `p_reason`.

### Sua Tarefa

Sua missão é executar a refatoração completa do `StockAdjustmentModal.tsx`.

**Por favor, siga estes passos metodicamente:**

1.  **Atualizar Tipos:** Primeiro, vá ao arquivo `src/core/types/inventory.types.ts` e atualize a interface `Product` para incluir os novos campos: `stock_packages: number;` e `stock_units_loose: number;`. Esta é a base para todo o trabalho.

2.  **Análise do Código Atual:**
    * Analise o código existente em `src/features/inventory/components/StockAdjustmentModal.tsx`.
    * Identifique a lógica de busca de dados (React Query `useQuery`), o gerenciamento de estado (`useState`) e a função de submissão (`useMutation`).

3.  **Consulta ao Supabase (se necessário):**
    * Você tem permissão para usar a ferramenta `mcp supabase` para confirmar a assinatura exata da nova função `adjust_stock_explicit` se tiver qualquer dúvida sobre os nomes ou tipos dos parâmetros.

4.  **Plano de Refatoração e Implementação:**
    * **Atualize a Busca de Dados:** Modifique a query do `useQuery` para selecionar o produto com as novas colunas `stock_packages` e `stock_units_loose`.
    * **Redesenhe a UI:** Implemente a nova UI conforme a análise funcional acima, usando os componentes do nosso Design System. Organize os novos inputs de forma clara e intuitiva.
    * **Refatore o Estado e Validação:** Adapte o estado do componente. Recomenda-se o uso de `react-hook-form` com `zod` para gerenciar os inputs e validar que os números não são negativos e que o motivo foi preenchido.
    * **Implemente a Nova Lógica de Submissão:** Crie a função `onSubmit` que calcula as diferenças (deltas) e chama a `useMutation` para a RPC `adjust_stock_explicit`.
    * **Garanta a Qualidade:** O código final deve ser limpo, bem-documentado, seguir o Design System e não introduzir duplicações.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Plano de Ação:** Uma breve explicação do seu plano de refatoração.
2.  **Código Completo e Refatorado:** O código-fonte final e completo do arquivo `src/features/inventory/components/StockAdjustmentModal.tsx` após todas as suas modificações. O código deve estar pronto para ser copiado e colado diretamente no projeto.