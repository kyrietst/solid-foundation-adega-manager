
### Prompt Detalhado para o Agente

(Salve este conteúdo em um arquivo, por exemplo, `DIAGNOSTICO_ROTAS_E_IMPORTS.md`)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto: Missão de Diagnóstico de Arquitetura - Mapear a Árvore de Rotas e Importações de Componentes**

**Contexto:**
Enfrentamos um bug persistente onde as modificações e correções aplicadas nos modais do inventário (especialmente `ProductDetailsModal.tsx`) não estão surtindo efeito na aplicação em execução. Suspeitamos de um problema fundamental na arquitetura de importação de arquivos: um caminho incorreto, um componente duplicado sendo usado, ou o agente aplicando alterações no arquivo errado.

**Sua Missão:**
Sua tarefa é criar um documento de diagnóstico que mapeie, de forma inequívoca, a cadeia de renderização e importação desde a raiz da aplicação até os modais problemáticos. Você deve agir como um detetive, seguindo o rastro dos arquivos.

1.  **Ponto de Partida:** Comece a análise pelo arquivo `src/main.tsx`.

2.  **Mapeamento da Rota Principal:**

      * Analise o `src/App.tsx` e a configuração do `react-router-dom` para identificar qual componente é renderizado na rota principal (`/`).
      * Documente o caminho exato do arquivo do componente da página principal (provavelmente `src/pages/Index.tsx`).

3.  **Rastreamento do Módulo de Inventário:**

      * Dentro do componente da página principal, identifique qual componente renderiza a funcionalidade de "Estoque".
      * Documente o caminho exato do arquivo do componente principal do inventário (provavelmente `src/features/inventory/components/InventoryManagement.tsx`).

4.  **Diagnóstico Final dos Modais:**

      * Inspecione o arquivo `InventoryManagement.tsx` e liste **TODOS** os componentes de modal que ele importa (`StockAdjustmentModal`, `EditProductModal`, `ProductDetailsModal`, etc.).
      * Para cada modal importado, documente o **caminho absoluto e exato** do arquivo de origem.

**Formato da Entrega:**
Crie um novo documento em `docs/diagnostics/ROUTE_IMPORT_MAP.md`. O documento deve ter uma estrutura clara, como a seguinte:

```markdown
# Mapa de Diagnóstico de Rotas e Importações

## 1. Ponto de Entrada
- **Arquivo:** `src/main.tsx`
- **Renderiza:** `<App />` de `src/App.tsx`

## 2. Configuração do Router
- **Arquivo:** `src/App.tsx`
- **Rota Principal ('/'):** Renderiza `<Index />`
- **Caminho do Arquivo:** `src/pages/Index.tsx`

## 3. Módulo de Inventário
- **Renderizado por:** `<Index />`
- **Componente Principal:** `<InventoryManagement />`
- **Caminho do Arquivo:** `src/features/inventory/components/InventoryManagement.tsx`

## 4. Análise de Importação dos Modais de Inventário
- **Analisando o arquivo:** `src/features/inventory/components/InventoryManagement.tsx`
- **Modais Importados:**
    - `ProductDetailsModal`: importado de `[CAMINHO EXATO DO ARQUIVO]`
    - `StockAdjustmentModal`: importado de `[CAMINHO EXATO DO ARQUIVO]`
    - `EditProductModal`: importado de `[CAMINHO EXATO DO ARQUIVO]`
    - `NewProductModal`: importado de `[CAMINHO EXATO DO ARQUIVO]`
```

Este mapa nos permitirá validar se os arquivos que estamos tentando corrigir são os mesmos que a aplicação está de fato utilizando.

-----
