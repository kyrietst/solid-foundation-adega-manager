
---

### Prompt para Agente Frontend: Auditoria de Integração dos Modais Refatorados

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, com foco em depuração e arquitetura de componentes.

Enfrentamos uma inconsistência: apesar dos relatórios confirmarem a refatoração bem-sucedida dos modais (`StockAdjustmentModal`, `EditProductModal`, `ProductDetailsModal`), as mudanças visuais esperadas não estão sendo refletidas na aplicação em execução. A aplicação abre os modais sem erros, mas com a aparência antiga.

Nossa principal hipótese é que os componentes pais (como a tabela de inventário) ainda estão importando e renderizando as versões antigas dos modais, e não as novas.

**Sua Tarefa:**

Sua missão é realizar uma auditoria de integração para verificar se os componentes refatorados estão sendo corretamente utilizados na aplicação e, caso não estejam, corrigir o problema.

**Por favor, siga estes passos metodicamente:**

**Fase 1: Verificação em Tempo de Execução (Runtime)**

1.  **Adicionar Logs de Diagnóstico:**
    * Modifique os **três** arquivos de modais que foram refatorados (`StockAdjustmentModal.tsx`, `EditProductModal.tsx`, `ProductDetailsModal.tsx`).
    * Dentro de cada um, adicione um `console.log` distinto e inconfundível no início do componente ou dentro de um `useEffect` com array de dependências vazio, para que ele dispare apenas uma vez quando o componente for montado.
    * **Exemplos:**
        * Em `StockAdjustmentModal.tsx`: `console.log('✅ RENDERIZANDO: Novo StockAdjustmentModal (Dupla Contagem)');`
        * Em `EditProductModal.tsx`: `console.log('✅ RENDERIZANDO: Novo EditProductModal (Read-Only Estoque)');`
        * Em `ProductDetailsModal.tsx`: `console.log('✅ RENDERIZANDO: Novo ProductDetailsModal (StatCards)');`

**Fase 2: Análise de Estrutura e Importação (Estática)**

1.  **Rastrear o Fluxo de Renderização:**
    * Comece pela página principal de inventário (`src/pages/InventoryPage.tsx` ou similar).
    * Identifique o componente que renderiza a tabela ou a grade de produtos (provavelmente `InventoryTable.tsx` ou `InventoryGrid.tsx`). Este é o nosso "componente pai".
    * Dentro do componente pai, localize o código que gerencia o estado de abertura dos modais (`useState`) e os botões que os acionam.

2.  **Auditar as Importações:**
    * Verifique as declarações de `import` no topo do arquivo do componente pai.
    * Confirme se o caminho de importação para `StockAdjustmentModal`, `EditProductModal` e `ProductDetailsModal` aponta para os arquivos corretos que contêm o código refatorado. É aqui que suspeitamos que o erro esteja.

**Fase 3: Relatório e Correção**

1.  **Apresente suas Descobertas:**
    * Com base nos logs (se eles apareceram ou não no console ao abrir os modais) e na sua análise dos imports, escreva um breve relatório de diagnóstico.
    * Confirme ou refute nossa hipótese.

2.  **Forneça a Correção:**
    * Se a hipótese estiver correta, forneça o código completo e corrigido do(s) componente(s) pai(s), já com os `import`s apontando para os novos modais.
    * Se a causa for outra, explique o problema e forneça a solução correspondente.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Relatório de Diagnóstico:** A conclusão da sua investigação.
2.  **Código Corrigido:** O código-fonte final e completo do(s) arquivo(s) que precisaram de correção (provavelmente o componente da tabela/grade de inventário) para que a aplicação finalmente renderize os modais corretos.