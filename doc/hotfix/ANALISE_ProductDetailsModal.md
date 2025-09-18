# Análise Tática: Correção do ProductDetailsModal.tsx

**Data:** 18/09/2025
**Épico:** 1 - Estabilização e Reativação (Hotfix)
**Tarefa:** 1 - (Modal) Correção Tática do `ProductDetailsModal`

## 1. Objetivo da Análise

O objetivo desta análise é identificar os pontos exatos de falha no componente `ProductDetailsModal.tsx` após a migração do banco de dados para a arquitetura Single Source of Truth (SSoT) e definir um plano de ação claro para a correção. A meta é a **funcionalidade**, não o redesenho.

## 2. Análise do Componente

-   **Responsabilidade:** Exibir uma visão detalhada e completa de um único produto (`Product`).
-   **Entrada Principal (Props):** `product: Product | null`. O componente é inteiramente dependente da estrutura e dos dados contidos neste objeto.
-   **Estado Derivado Crítico:** O componente calcula vários estados derivados a partir do `product` prop, incluindo:
    -   `packageDisplay`: Usa a função `calculatePackageDisplay`.
    -   `completeness`: Calcula o percentual de preenchimento dos dados do produto.
    -   `stockStatus`: Determina o status do estoque (Disponível, Baixo, etc.).
    -   `turnoverAnalysis`: Analisa o giro do produto (usando o hook `useProductAnalytics`).

## 3. Análise de Dependências (Foco no SSoT)

| Dependência | Verificação de Conformidade SSoT | Status |
| :--- | :--- | :--- |
| **`Product` type** (`@/types/inventory.types`) | É crucial que este tipo reflita **exatamente** a estrutura da tabela `products` do Supabase e não contenha mais nenhum campo da antiga `product_variants`. | ✅ **Verificado** |
| **`calculatePackageDisplay`** (`@/shared/utils/stockCalculations`) | Esta função deve usar `stock_quantity` e `package_units` do objeto `product`. | ✅ **Conforme** |
| **`useProductAnalytics`** (`@/features/inventory/hooks`) | Este hook busca dados analíticos. Deve funcionar corretamente desde que o `product.id` seja válido. | ✅ **Conforme** |
| **Renderização de Dados** | O JSX do componente deve ler **apenas** propriedades existentes no tipo `Product`. Campos como `variant.name` ou `variant.stock` não devem existir. | ⚠️ **Ponto de Falha Potencial** |

## 4. Diagnóstico e Pontos de Falha

A análise do código-fonte do `ProductDetailsModal.tsx` revela que ele já está **muito bem alinhado com a SSoT**. Ele lê `product.stock_quantity` e os campos de pacote corretos (`has_package_tracking`, `package_units`).

Portanto, o problema **NÃO** está em uma referência direta a um campo antigo que foi removido. A causa mais provável da quebra do modal é uma das seguintes:

1.  **Dados Incompletos no Objeto `product`:** O componente que chama o `ProductDetailsModal` (provavelmente `InventoryTable.tsx`) está passando um objeto `product` incompleto, sem todos os campos que o modal espera.
2.  **Lógica de Cálculo com `null`/`undefined`:** Uma das funções de estado derivado (ex: `getStockStatus` ou `completeness`) não está tratando corretamente um campo que agora pode ser `null` ou `undefined` após a migração.
3.  **Erro Silencioso na Renderização:** O componente tenta renderizar um campo que não existe mais (ex: `product.unit_barcode` que pode ser `product.barcode` agora) e, embora o TypeScript possa não ter pego, isso causa um erro de runtime.

## 5. Riscos da Correção

-   **Baixo Risco Arquitetural:** Como é uma correção tática, o risco de introduzir problemas de arquitetura é mínimo.
-   **Risco de Efeito Colateral:** Uma correção que não considere todos os estados do `product` (ex: um produto sem pacote) pode quebrar a UI em outros cenários.

## 6. Plano de Ação Tático (Passo a Passo)

Quando o tempo de espera acabar, siga estes passos:

1.  **Verificar a Fonte de Dados:** Vá para o componente que abre este modal (provavelmente `InventoryTable.tsx`). Coloque um `console.log(product)` na função que abre o modal e verifique no console do navegador se o objeto `product` que está sendo passado contém **todos** os campos esperados.
2.  **Auditar a Leitura de Propriedades:** Faça uma varredura (Ctrl+F) no arquivo `ProductDetailsModal.tsx` por cada uma das propriedades do objeto `product` que são usadas no JSX. Compare com a definição do tipo `Product` em `inventory.types.ts`.
    -   **Foco Especial em:** `barcode`, `unit_barcode`, `package_barcode`, `package_price`, `cost_price`. A lógica para decidir qual `barcode` exibir pode ser um ponto de falha.
3.  **Adicionar "Guards" Defensivos:** Para cada acesso a uma propriedade que pode ser opcional, garanta que há um tratamento para o caso de ela ser `null` ou `undefined`.
    -   **Exemplo:** Em vez de `{product.supplier}`, use `{product.supplier || 'Não informado'}`. O código atual já faz isso bem em alguns lugares, mas é preciso garantir 100% de cobertura.
4.  **Testar o Componente Isoladamente:** Se possível, adicione um estado de teste no componente pai para passar um objeto `product` mockado e completo para o modal, garantindo que, com os dados corretos, ele renderize perfeitamente. Isso isolará o problema (se ele está nos dados ou no componente).

---

Com este plano, você estará pronto para atacar o problema de forma cirúrgica assim que puder voltar a codificar.