
# Ordem de Serviço: Criação do Modal de Ajuste de Estoque SSoT

**ID da Tarefa:** FE-SSOT-MODAL-CREATE-20250918-01
**Componente:** `StockAdjustmentModal.tsx`
**Prioridade:** Crítica
**Dependências:** Arquitetura SSoT, Design System v2.0.0

## 1. Resumo Executivo

O objetivo desta tarefa é criar o componente `StockAdjustmentModal.tsx`, a interface central para todas as operações de ajuste de estoque no Adega Manager. Este modal deve ser construído seguindo rigorosamente a arquitetura **Single Source of Truth (SSoT)** e os padrões do nosso **Design System**. Ele será a única interface permitida para alterar a quantidade de um produto, garantindo que cada movimentação seja registrada de forma clara, auditável e segura através da procedure RPC `create_inventory_movement`.

## 2. Diretrizes Arquiteturais (Não Negociáveis)

1.  **Conformidade SSoT Absoluta:** O modal deve operar exclusivamente com os dados da tabela `products`. Toda a lógica de exibição deve ser derivada do `stock_quantity` total e do `package_units`.
2.  **Design System First:** Utilize **exclusivamente** os componentes primitivos de `shadcn/ui` (`Dialog`, `Button`, `Input`, `Select`, `RadioGroup`, etc.) e os tokens de design (`tailwind.config.ts`). Nenhuma estilização customizada ("mágica") é permitida.
3.  **Performance como Requisito:** O modal deve ser leve e rápido, com renderizações otimizadas para garantir uma experiência fluida, mesmo em hardware de baixo desempenho.
4.  **Clareza na UX:** A interface deve ser intuitiva, fornecendo feedback claro ao usuário sobre o resultado de suas ações, especialmente através da pré-visualização do ajuste.

## 3. Requisitos Funcionais

### 3.1. Campos de Entrada (Inputs do Usuário)

O formulário dentro do modal deve conter os seguintes campos:

-   **Tipo de Movimentação:**
    -   Componente: `<Select>`
    -   Opções: As opções devem vir do enum `movement_type` do banco de dados (`entrada`, `saida`, `ajuste`, `venda`, `devolucao`).
    -   Validação: Campo obrigatório.
-   **Quantidade:**
    -   Componente: `<Input type="number">`
    -   Validação: Obrigatório, deve ser um número inteiro positivo.
-   **Unidade de Medida:**
    -   Componente: `<RadioGroup>` ou `<ToggleGroup>`
    -   Opções: "Unidades" e "Pacotes" (ou o `packaging_type` do produto, ex: "Fardos"). A opção "Pacotes" só deve estar habilitada se o produto tiver `package_units > 1`.
    -   Default: "Unidades".
-   **Motivo/Justificativa:**
    -   Componente: `<Textarea>`
    -   Validação: Opcional, mas recomendado. Limite de 255 caracteres.

### 3.2. Exibições de Contexto (Read-Only)

O modal deve exibir as seguintes informações para o usuário:

-   **Título do Modal:** "Ajustar Estoque de: [Nome do Produto]"
-   **Resumo do Ajuste (Pré-visualização Dinâmica):**
    -   **Estoque Anterior:** O estoque atual do produto, formatado usando a função `calculatePackageDisplay`.
    -   **Ajuste:** O valor da movimentação que está sendo feita (ex: "+ 6 Pacotes" ou "- 10 Unidades").
    -   **Estoque Final:** O resultado do estoque após o ajuste, também formatado com `calculatePackageDisplay`. Este valor deve ser recalculado em tempo real conforme o usuário altera a quantidade ou a unidade de medida.

## 4. Detalhes Técnicos da Implementação

-   **Localização do Arquivo:** `src/features/inventory/components/StockAdjustmentModal.tsx`
-   **Gerenciamento de Estado do Formulário:** Utilize `react-hook-form` para gerenciar o estado e as interações do formulário.
-   **Validação:** Utilize `zod` para criar o schema de validação dos campos de entrada.
-   **Busca de Dados:** Ao abrir, o modal deve usar `TanStack Query` (`useQuery`) para buscar os dados atuais do produto (`id`, `name`, `stock_quantity`, `package_units`) da tabela `products`.
-   **Submissão de Dados (Mutação):** A ação de "Salvar" deve usar `TanStack Query` (`useMutation`) para chamar a procedure RPC `create_inventory_movement`.

## 5. Contrato com o Backend (Chamada RPC)

Ao submeter o formulário, o hook de mutação deve chamar a procedure `create_inventory_movement` com um objeto contendo os seguintes parâmetros:

-   `p_product_id`: O ID do produto que está sendo ajustado.
-   `p_quantity_change`: **O valor numérico absoluto da mudança.** Este é o ponto mais crítico.
    -   Se o tipo for `entrada`, o valor é positivo (`+`). Se for `saida`, `venda` ou `ajuste` negativo, o valor é negativo (`-`).
    -   Se a unidade de medida for "Pacotes", este valor **deve ser multiplicado** por `product.package_units`. (Ex: entrada de 6 pacotes de 10 unidades = `p_quantity_change: 60`).
-   `p_type`: O valor selecionado no campo "Tipo de Movimentação".
-   `p_reason`: O texto do campo "Motivo".
-   `p_metadata`: Um objeto JSONB contendo, no mínimo, o `user_id` do usuário logado que está realizando a ação.

## 6. Entregáveis Esperados

1.  **Código-Fonte Completo:** O código do novo componente `StockAdjustmentModal.tsx`.
2.  **Hooks e Tipos Associados:** O código de quaisquer hooks customizados (ex: `useStockAdjustment`) ou tipos/schemas (Zod) que forem criados para suportar o modal.
3.  **Confirmação Textual:** Uma breve confirmação de que o componente foi testado nos seguintes cenários:
    -   Entrada/Saída de unidades.
    -   Entrada/Saída de pacotes.
    -   A pré-visualização ("Resumo do ajuste") funciona corretamente em todos os casos.
    -   A submissão para o backend envia o `quantity_change` absoluto corretamente calculado.