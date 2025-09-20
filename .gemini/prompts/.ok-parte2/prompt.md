

-----

### Comando Detalhado para o Agente

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Prompt a ser salvo em um arquivo .md:**

**Assunto: Missão de Correção Crítica - Depurar e Consertar a Lógica do `ProductDetailsModal.tsx`**

**Contexto:**
Apesar da conclusão da certificação de estilo do Épico 2, os testes manuais confirmaram que o componente `ProductDetailsModal.tsx` continua funcionalmente quebrado. A limpeza de cache foi realizada e não resolveu o problema. A suspeita é de um bug na lógica de busca de dados ou de renderização condicional do componente.

**Sua Missão:**
Esta é uma missão de **depuração de lógica**, não de estilo. Você deve encontrar e corrigir a causa raiz que impede o modal de funcionar corretamente.

1.  **Isolamento do Componente:** Concentre sua análise exclusivamente no arquivo `src/features/inventory/components/ProductDetailsModal.tsx`.

2.  **Análise do Fluxo de Dados:**

      * Investigue como o `productId` é recebido por este componente.
      * Analise o hook do React Query (`useQuery` ou um hook customizado) responsável por buscar os dados do produto no Supabase. Verifique se a query está sendo executada corretamente e se está retornando os dados esperados ou um erro.
      * Verifique o console em busca de erros específicos de `data-fetching` quando o modal é aberto.

3.  **Depuração da Lógica de Renderização:**

      * Inspecione o JSX do componente. Encontre onde os dados do produto (`product.name`, `product.price`, etc.) são renderizados.
      * Implemente "guardas" de renderização (`loading states` e `error states`) para garantir que o componente só tente exibir os dados **depois** que eles forem carregados com sucesso. Se a busca falhar, ele deve exibir uma mensagem de erro clara. Se estiver carregando, um `spinner`.

    **Exemplo de Padrão de Segurança a ser aplicado:**

    ```tsx
    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error || !product) {
      return <ErrorFallback message="Não foi possível carregar os detalhes do produto." />;
    }

    // Somente se passar pelas guardas acima, o JSX principal é renderizado.
    return (
      <div>
        <h1>{product.name}</h1>
        {/* ... resto dos detalhes ... */}
      </div>
    );
    ```

4.  **Forneça o Código Corrigido:** Apresente a versão completa e corrigida do arquivo `ProductDetailsModal.tsx` que seja robusta contra erros de carregamento e exiba os detalhes do produto corretamente.

**Critério de Aceitação:**

  - O modal de detalhes do produto deve abrir e exibir as informações corretas de qualquer produto sem quebrar a aplicação.
  - O componente deve lidar de forma elegante com os estados de carregamento e erro.