### Tarefa 2: O Mensageiro (Front-end)

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Prompt:**
**Assunto: Refatoração do `StockAdjustmentModal` para o Modelo de Estado Absoluto**

**Diretriz Principal: O frontend não faz contas. Ele é o mensageiro.**

**Contexto:**
O back-end terá uma nova procedure chamada `set_product_stock_absolute` que aceita os valores finais de estoque. Toda a lógica de cálculo de "deltas" foi movida para o back-end. A responsabilidade do frontend agora é apenas coletar o que o usuário digita e enviar.

**Sua Missão:**
1.  **Abra o arquivo** `src/features/inventory/components/StockAdjustmentModal.tsx`.
2.  **Remova toda a lógica de cálculo de deltas.** Encontre e delete o código que calcula `packagesChange` e `unitsLooseChange`. O frontend não precisa mais saber o estado anterior do produto para fazer o ajuste.
3.  **Altere a chamada da RPC:**
    * Substitua a chamada à antiga procedure (`adjust_stock_explicit`) pela nova `set_product_stock_absolute`.
    * Passe os valores dos campos do formulário (`newPackages`, `newUnitsLoose`) **diretamente** para os parâmetros `p_new_packages` e `p_new_units_loose` da nova procedure.

4.  **Forneça o código atualizado** da função `onSubmit` (ou a função que lida com o envio do formulário) dentro do `StockAdjustmentModal.tsx`.

**Critério de Aceitação:**
- O componente não deve ter mais nenhuma lógica de `(novo valor - valor antigo)`.
- A chamada RPC deve invocar `set_product_stock_absolute` e passar os valores do formulário como números absolutos.