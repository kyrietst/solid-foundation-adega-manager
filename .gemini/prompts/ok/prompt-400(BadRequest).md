
---

Olá! Assuma sua persona de **Engenheiro de Frontend Sênior**, especialista em depuração de integrações frontend-backend.

Encontramos um erro crítico de runtime. Ao usar o `StockAdjustmentModal` refatorado para alterar a quantidade de pacotes de um produto (ex: de 17 para 30), a aplicação falha e recebemos um erro `400 (Bad Request)` da chamada à RPC `adjust_stock_explicit` do Supabase.

Nossa principal hipótese é que o componente frontend está enviando o **valor absoluto** do novo estoque, em vez de calcular e enviar a **diferença (delta)** entre o valor novo e o original, que é o que a função RPC espera.

**Sua Tarefa:**

Sua missão é depurar o `StockAdjustmentModal.tsx`, confirmar a causa do erro 400 e implementar a correção.

**Por favor, siga estes passos:**

1.  **Análise do Payload de Saída:**
    * Modifique o arquivo `src/features/inventory/components/StockAdjustmentModal.tsx`.
    * Localize a função de submissão do formulário (provavelmente `onSubmit` ou a função dentro da `useMutation`).
    * **Antes** da chamada `mutate` para a RPC, adicione um `console.log` detalhado para inspecionar o objeto exato de parâmetros que está sendo enviado. Precisamos ver os nomes e os valores de `p_product_id`, `p_packages_change`, `p_units_loose_change`, e `p_reason`.

2.  **Verificação da Lógica de Cálculo:**
    * Analise o código que calcula esses parâmetros.
    * Confirme se ele está corretamente calculando a **diferença** (novo valor - valor original) para `p_packages_change` e `p_units_loose_change`. Se ele estiver enviando diretamente o valor do campo do formulário, esta é a causa do bug.

3.  **Consulta à Definição da RPC:**
    * Para ter 100% de certeza, consulte o relatório `migracao-estoque-dupla-contagem-relatorio-tecnico-completo.md` para encontrar a assinatura da função `adjust_stock_explicit` e confirme os nomes e tipos exatos dos parâmetros que ela espera.

4.  **Implementação da Correção:**
    * Com base na sua análise, corrija a lógica de cálculo na função de submissão para garantir que apenas os deltas sejam enviados ao backend.
    * Garanta que o restante da funcionalidade do modal permaneça intacto.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Relatório de Diagnóstico:** Uma confirmação clara da causa do erro 400, incluindo o payload incorreto que estava sendo enviado.
2.  **Código Completo e Corrigido:** O código-fonte final e completo do arquivo `src/features/inventory/components/StockAdjustmentModal.tsx` com a lógica de cálculo do delta devidamente corrigida, pronto para ser copiado e colado.