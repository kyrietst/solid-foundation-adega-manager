

### **Prompt: Refatoração Abrangente do Sistema de Gestão de Estoque com Foco em Qualidade e Arquitetura**

#### **1. Objetivo Principal**

Refatorar a arquitetura de controle de estoque para adotar um modelo de "Fonte Única da Verdade" (Single Source of Truth). O objetivo é eliminar ambiguidades, aumentar a precisão, tornar o sistema totalmente auditável e prepará-lo para funcionalidades avançadas, como múltiplas lojas e produtos compostos.

#### **2. Diretrizes de Implementação e Qualidade de Código**

* **Para o Banco de Dados (Supabase):** Utilize estritamente a metodologia **`mcp supabase`**. Isso significa que toda a modelagem de dados, criação de tabelas (`inventory_movements`), e a implementação da função `create_inventory_movement` devem seguir as melhores práticas de performance, segurança (RLS) e escalabilidade recomendadas para o Supabase.
* **Para o Código (Frontend):** Utilize o framework **`context7`** como guia para a arquitetura do código. A refatoração dos hooks (`useCheckout`), componentes e utilitários deve resultar em um código limpo, modular, com alta coesão e baixo acoplamento. Siga os princípios de separação de responsabilidades (hooks para lógica de estado, componentes para UI, utils para funções puras).

#### **3. Etapa Prévia: Análise do Código Existente (Ação Inicial)**

**Antes de escrever ou modificar qualquer código**, execute uma análise completa dos seguintes arquivos para entender a implementação atual da lógica de inventário e vendas. O objetivo é identificar todos os pontos de contato onde o estoque é lido, exibido ou modificado.

* **`src/core/types/inventory.types.ts`**: Analisar a estrutura de dados atual dos produtos para entender todos os campos existentes.
* **`src/features/inventory/hooks/useInventoryOperations.ts`**: Compreender como as operações de CRUD (Criar, Ler, Atualizar, Deletar) de produtos estão implementadas atualmente.
* **`src/features/sales/hooks/useCheckout.ts`**: Mapear precisamente como o estoque é debitado ao finalizar uma venda, prestando atenção especial à lógica que diferencia a venda de unidades e pacotes.
* **`src/features/inventory/components/ProductForm.tsx`** e componentes relacionados: Entender como os dados do produto, incluindo o estoque, são inseridos e editados pela interface do usuário.

A saída desta análise deve ser um resumo dos pontos de código que precisarão ser alterados para se alinharem com a nova arquitetura.

#### **4. Arquitetura Proposta: A Fonte Única da Verdade**

**4.1. Tabela `products`:**

* O estoque será representado por uma única coluna: `stock_quantity` (integer).
* Esta coluna armazenará o **total absoluto de unidades individuais** do produto.
* A noção de "pacote" será definida pela coluna `units_per_package` (integer).
* **Ação:** Remover qualquer coluna que armazene a "quantidade de pacotes".

**4.2. Nova Tabela: `inventory_movements`**

* Criar uma nova tabela chamada `inventory_movements` que servirá como um livro-razão imutável.
* **Estrutura da Tabela:**
    * `id` (uuid, primary key)
    * `product_id` (uuid, foreign key to `products.id`)
    * `quantity_change` (integer): **Negativo para saídas**, **positivo para entradas**.
    * `new_stock_quantity` (integer): O valor do estoque *após* a transação (para auditoria).
    * `type` (text): Enum (`sale`, `initial_stock`, `inventory_adjustment`, `return`, `stock_transfer_out`, `stock_transfer_in`, `personal_consumption`).
    * `reason` (text, nullable): Justificativa manual.
    * `metadata` (jsonb, nullable): Para IDs de referência (`sale_id`, `user_id`, etc.).
    * `created_at` (timestampz)

#### **5. Lógica de Backend: Centralização das Operações**

* **Criar uma Função de Banco de Dados (Supabase RPC):**
    * Desenvolver a função `create_inventory_movement`, que será a **única** forma de alterar o estoque.
    * **Responsabilidades:** Executar a atualização na tabela `products` e a inserção na `inventory_movements` de forma **atômica (transacional)**.
    * **Segurança:** Aplicar RLS para remover permissões de `UPDATE` direto na `stock_quantity` da tabela `products`, forçando o uso da RPC.

#### **6. Lógica de Frontend: Adaptação da Interface e Hooks**

**6.1. Exibição de Estoque:**

* A exibição de "pacotes" e "unidades soltas" será **calculada dinamicamente** a partir do `stock_quantity` total em todas as UIs.
* **Fórmula (Pacotes):** `Math.floor(stock_quantity / units_per_package)`
* **Fórmula (Unidades Soltas):** `stock_quantity % units_per_package`

**6.2. Hooks e Operações:**

* Modificar `useCheckout` e outros hooks relevantes para chamar a nova função `supabase.rpc('create_inventory_movement', { ... })` em vez de fazer updates diretos.

#### **7. Exemplos Práticos (usando o "Produto Teste")**

* **Configuração do Produto Teste:** `name`: "Produto Teste", `units_per_package`: 10.
* **Cenário 1 (Entrada de Estoque):** Entrada de 10 pacotes chama a RPC com `quantity_change: 100`.
    * **Resultado:** `products.stock_quantity` = `100`. **UI exibe:** "10 pacotes e 0 unidades".
* **Cenário 2 (Venda de Unidade):** Com estoque de 100, vender 1 unidade chama a RPC com `quantity_change: -1`.
    * **Resultado:** `products.stock_quantity` = `99`. **UI exibe:** "9 pacotes e 9 unidades".
* **Cenário 3 (Venda de Pacote):** Com estoque de 99, vender 1 pacote chama a RPC com `quantity_change: -10`.
    * **Resultado:** `products.stock_quantity` = `89`. **UI exibe:** "8 pacotes e 9 unidades".

#### **8. Benefícios da Nova Arquitetura**

* **Precisão Absoluta:** Elimina o risco de descompasso.
* **Auditabilidade Completa:** Histórico rastreável de cada mudança no estoque.
* **Simplicidade Lógica:** Reduz a complexidade do código.
* **Escalabilidade:** Prepara o terreno para funcionalidades futuras (multi-loja, produtos compostos).