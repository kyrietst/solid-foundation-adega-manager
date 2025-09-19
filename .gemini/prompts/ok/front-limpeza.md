
---

### Análise do Erro: O Parâmetro Esquecido

1.  **O que está acontecendo:** O frontend está tentando chamar a nova procedure `set_product_stock_absolute`, o que está correto. Ele também está enviando os valores absolutos (`newPackages: 200`), o que também está correto. No entanto, o servidor responde com um erro `404 - Not Found`.

2.  **A Causa Raiz (A "Dica" do Supabase):** A mensagem de erro do Supabase é a chave de tudo. Ela diz:
    > *"Eu não encontrei a função que você está chamando com 4 parâmetros. **Dica:** talvez você quisesse chamar a função que existe, com 5 parâmetros, incluindo `p_user_id`."*

3.  **Diagnóstico Final:**
    * O agente de banco de dados (`supabase-database-architect`) construiu a procedure corretamente, exigindo 5 parâmetros (`product_id`, `new_packages`, `new_units_loose`, `reason`, e `user_id`) para garantir que cada ajuste seja auditado.
    * O agente de frontend (`frontend-ui-performance-engineer`), ao refatorar o modal, removeu a lógica antiga, mas esqueceu de adicionar o `user_id` do usuário logado na nova chamada de função.

O resultado é que o frontend está fazendo uma chamada com 4 parâmetros para uma função que espera 5. O Supabase, corretamente, diz que "essa função não existe".

---

### Plano de Ação

Esta é uma correção rápida e cirúrgica para o frontend.

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Prompt:**
**Assunto: Correção Final - Adicionar Parâmetro `p_user_id` Faltante na Chamada RPC do `StockAdjustmentModal`**

**Contexto:**
A refatoração para o Modelo de Estado Absoluto está 99% completa. O backend tem a procedure `set_product_stock_absolute` esperando 5 parâmetros, mas o frontend está enviando apenas 4, causando uma falha na chamada RPC (erro 404/PGRST202).

**Bug:**
A chamada atual para `supabase.rpc('set_product_stock_absolute', ...)` no `StockAdjustmentModal.tsx` **não está incluindo o ID do usuário logado**. A procedure do banco de dados requer o `p_user_id` para fins de auditoria.

**Sua Missão:**
1.  **Abra o arquivo** `src/features/inventory/components/StockAdjustmentModal.tsx`.
2.  **Acesse o ID do usuário:** Dentro do componente, utilize o `AuthContext` para obter o ID do usuário logado (ex: `const { user } = useAuth(); const userId = user?.id;`).
3.  **Atualize a Chamada RPC:** Na função `onSubmit` (ou onde a chamada é feita), adicione o parâmetro `p_user_id: userId` ao objeto que é enviado para a procedure `set_product_stock_absolute`.
4.  **Garanta a Validação:** Assegure-se de que a chamada só seja feita se o `userId` estiver disponível, tratando o caso de o usuário não estar logado, se necessário.

**Critério de Aceitação:**
- O objeto de parâmetros enviado para a RPC deve agora conter 5 chaves: `p_product_id`, `p_new_packages`, `p_new_units_loose`, `p_reason`, e `p_user_id`.