
---

### Prompt para o Agente

(Salve este conteúdo em um arquivo, por exemplo, `DEBUG_CART_STATE.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão de Depuração Crítica - Produto Identificado por Barcode não é Adicionado ao Carrinho**

**Contexto:**
Na página de Vendas (PDV), a funcionalidade de busca de produtos por código de barras está funcionando (confirmado por um toaster de sucesso), mas o produto identificado não aparece no carrinho e o próprio componente do carrinho não é exibido. Não há erros no console, indicando uma falha na lógica de gerenciamento de estado.

**Sua Missão:**
1.  **Rastrear o Evento de Sucesso:** Localize o código que é executado quando a busca por código de barras é bem-sucedida (o código que dispara o toaster "Produto encontrado").

2.  **Verificar a Chamada da Ação:** Confirme se, após encontrar o produto, a ação para adicioná-lo ao carrinho (provavelmente algo como `cart.addItem(product)`) está sendo de fato chamada. Esta ação deve vir do nosso hook de estado `use-cart`.

3.  **Analisar o *Store* (Zustand):**
    * Inspecione o arquivo `src/features/sales/hooks/use-cart.ts`.
    * Analise a lógica da função `addItem`. Verifique se ela está corretamente criando um **novo** array de itens para o estado. Um erro comum é tentar modificar o array existente (`state.items.push(newItem)`), o que não dispara a re-renderização no React. A forma correta deve ser algo como `items: [...state.items, newItem]`.

4.  **Analisar a Visibilidade do Carrinho:**
    * Inspecione o componente `src/features/sales/components/Cart.tsx` e seu uso dentro da `src/features/sales/components/SalesPage.tsx`.
    * Verifique a condição que controla sua renderização. É provável que ele só apareça se `cart.items.length > 0`.

5.  **Implementar a Correção:** Corrija o bug, seja na chamada da ação, na lógica do *store* Zustand, ou na condição de renderização do componente.

**Critério de Aceitação:**
- Ao escanear um código de barras de um produto válido, o produto deve ser adicionado ao carrinho, e o componente do carrinho deve aparecer na tela com o produto dentro.