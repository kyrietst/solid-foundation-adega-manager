

### Prompt para Agente (Versão Corrigida e Assertiva)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto:** **Comando de Correção Imediata: O bug do parâmetro `p_user_id` é real e precisa ser corrigido agora.**

**Contexto e Ordem Direta:**
Ignore qualquer relatório anterior que afirme que o código está correto. Os logs do console do ambiente de produção são a única fonte da verdade e eles mostram um erro **`404 (PGRST202)`** persistente.

A análise é final e inequívoca: a chamada RPC para `set_product_stock_absolute` dentro do `StockAdjustmentModal.tsx` **NÃO ESTÁ ENVIANDO O PARÂMETRO `p_user_id`**. A "dica" do Supabase nos logs confirma isso.

**Sua Missão é Executar, Não Analisar:**
Esta não é uma missão de análise, é uma missão de implementação. Execute os seguintes passos para corrigir o bug:

1.  **Localize o Arquivo:** `src/features/inventory/components/StockAdjustmentModal.tsx`.

2.  **Acesse o Contexto de Autenticação:** Obtenha o `user` do `useAuth()` hook.

3.  **Implemente a Lógica de Validação:** Antes da chamada RPC, adicione uma verificação para garantir que `user.id` existe. Se não existir, a operação deve falhar com uma mensagem de erro clara para o usuário (ex: "Sessão inválida").

4.  **Corrija a Chamada RPC:** Encontre o objeto de parâmetros que é passado para a função `supabase.rpc('set_product_stock_absolute', ...)`. Adicione a chave que falta. O objeto final **DEVE** ter esta aparência:

    ```tsx
    const rpcParams = {
      p_product_id: //...valor existente,
      p_new_packages: //...valor existente,
      p_new_units_loose: //...valor existente,
      p_reason: //...valor existente,
      p_user_id: user.id // <--- GARANTA QUE ESTA LINHA EXISTA E SEJA EXECUTADA
    };
    ```

5.  **Entregue o Código:** Forneça o bloco de código modificado da função `onSubmit` (ou da `mutationFn` do React Query) como prova de que a correção foi aplicada.

**Critério de Aceitação (Não Negociável):**
A chamada de rede no painel "Network" do navegador deve mostrar um payload para a RPC `set_product_stock_absolute` contendo explicitamente as 5 chaves, incluindo `p_user_id`. Qualquer resultado diferente será considerado uma falha na missão.