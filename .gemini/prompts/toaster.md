
-----

### Prompt para Correção Segura do Toaster

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto:** **Correção de UI: Fazer o Toaster do `StockAdjustmentModal` Exibir os Valores Corretos**

**Diretriz Principal: Cirúrgico e Seguro. NÃO ALTERAR O BACKEND OU A LÓGICA DA CHAMADA RPC.**

**Contexto:**
A funcionalidade de ajuste de estoque está 100% operacional. O banco de dados salva os valores corretos. No entanto, a notificação de sucesso (toaster) sempre exibe "0 pacotes e 0 unidades", o que confunde o usuário.

**Análise do Problema:**
O toaster está com essa mensagem incorreta porque ele não está recebendo os dados do novo estoque para exibir. A solução mais segura é usar os dados que o próprio frontend já possui: os valores que o usuário acabou de inserir no formulário.

**Sua Missão:**

1.  **Localize o Componente:** Abra o arquivo `src/features/inventory/components/StockAdjustmentModal.tsx`.

2.  **Encontre a Lógica do Toaster:** Encontre o local onde o `toast.success(...)` é chamado após a mutação ser bem-sucedida (provavelmente dentro de um bloco `onSuccess` ou `mutate` do `useMutation`).

3.  **Corrija a Mensagem:** Modifique a chamada do `toast.success` para que ela utilize as variáveis contendo os dados do formulário (`newPackages`, `newUnitsLoose`) que foram enviadas para a RPC. O hook `useMutation` do React Query nos dá acesso a essas variáveis no callback `onSuccess`.

    **Exemplo de como a lógica deve ficar:**

    ```tsx
    // Dentro do useMutation
    onSuccess: (result, variables) => {
      // 'variables' contém o que foi enviado para a RPC,
      // incluindo os valores do formulário.
      toast.success(
        `Estoque ajustado com sucesso! Estoque atualizado para: ${variables.p_new_packages} pacotes e ${variables.p_new_units_loose} unidades soltas`
      );
      // ... resto da lógica, como fechar o modal e invalidar o cache.
    },
    ```

4.  **Forneça o Código Corrigido:** Apresente apenas o bloco de código atualizado do `onSuccess` do `useMutation` como prova da correção.

**Critério de Aceitação:**

  - Após um ajuste de estoque, o toaster deve exibir **exatamente** os números que o usuário digitou nos campos de pacotes e unidades.
  - Nenhuma outra parte do código, especialmente a chamada `supabase.rpc`, deve ser alterada.