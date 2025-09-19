Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, especialista em gerenciamento de cache e data fetching com React Query.

Encontramos um bug crítico de corrupção de dados causado por dados obsoletos (stale data) no `StockAdjustmentModal`. O modal está operando sobre uma versão em cache do estado do produto, em vez dos dados mais recentes do banco de dados, levando a cálculos de delta incorretos e corrupção de dados.

**EVIDÊNCIA DO BUG:**
Um teste mostrou que a UI exibia um estoque de 130 pacotes, mas o log de diagnóstico revelou que a operação de ajuste foi baseada em um valor obsoleto de 135 pacotes, provando a inconsistência do cache.

**Sua Tarefa:**

Sua missão é implementar uma estratégia de invalidação de cache agressiva e eficaz para garantir que os modais de estoque **sempre** operem com os dados mais recentes.

**Por favor, siga estes passos:**

1.  **Analisar o Ponto de Mutação:**
    * Inspecione o hook ou componente que contém a `useMutation` para a chamada da RPC `adjust_stock_explicit` (provavelmente no `StockAdjustmentModal.tsx` ou em um hook customizado).

2.  **Implementar Invalidação de Cache no `onSuccess`:**
    * Dentro da `onSuccess` da `useMutation`, utilize o `queryClient` do React Query para invalidar todas as queries relacionadas ao inventário. Isso forçará o React Query a buscar novos dados na próxima vez que eles forem necessários.
    * Adicione as seguintes invalidações:
        ```typescript
        queryClient.invalidateQueries({ queryKey: ['products'] }); // Invalida a lista geral de produtos
        queryClient.invalidateQueries({ queryKey: ['product', productId] }); // Invalida o detalhe deste produto específico
        ```

3.  **Garantir Refetch ao Abrir o Modal:**
    * Localize a `useQuery` dentro do `StockAdjustmentModal.tsx` que busca os dados do produto.
    * Adicione a opção `refetchOnWindowFocus: true` a esta query. Isso garantirá que, se o usuário sair e voltar para a janela, os dados serão atualizados.
    * Adicione também `staleTime: 0` para garantir que os dados sejam considerados obsoletos imediatamente, forçando uma nova busca em segundo plano sempre que o componente for montado.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Análise da Causa Raiz:** Uma confirmação de que o problema é de cache obsoleto (stale data).
2.  **Código Completo e Corrigido:** O código-fonte final de **todos os arquivos modificados** (provavelmente `StockAdjustmentModal.tsx` e/ou hooks relacionados) com a nova estratégia de invalidação de cache implementada.