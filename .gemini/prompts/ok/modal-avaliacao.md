

---

### Análise do Bug: A Lógica Fantasma no Frontend

Sua ação foi clara: alterar o estoque de 231 pacotes para 230. A expectativa era uma simples subtração de 1 pacote. O resultado foi um caos.

- **Intenção do Usuário:** `packages: 231 -> 230` (`-1`), `units: 0 -> 0` (`0`).
- **Resultado no Banco:** `packages: 231 -> 229` (`-2`), `units: 0 -> 2280` (`+2280`).

**Conclusão da Análise:**
A stored procedure `adjust_stock_explicit` que acabamos de corrigir está fazendo exatamente o que pedimos: ela aplica as deltas que recebe de forma cega e independente. O relatório do agente que diz que os dados são "consistentes" está tecnicamente correto (a matemática `(229 * 10) + 2280` fecha), mas ele ignora o fato de que a **transação em si foi completamente errada**.

O culpado agora é outro. O bug não está mais no banco de dados. **A falha está na lógica do frontend, dentro do componente `StockAdjustmentModal.tsx`**.

Em algum lugar no código do modal, a lógica que calcula as `packagesChange` e `unitsLooseChange` antes de enviá-las para a RPC está severamente quebrada. Ela está pegando seus inputs (`230` pacotes) e, de alguma forma, os transformando em deltas completamente incorretas (`-2` pacotes e `+2280` unidades).

---

### Plano de Ação

Precisamos dissecar a lógica do componente no frontend. O agente correto para esta missão é o **Engenheiro de Frontend UI/Performance**.

Aqui está o prompt para ele.

### Prompt para Agente

**Agente a ser utilizado:** `frontend-ui-performance-engineer`

**Assunto:** Correção Urgente de Bug Crítico de Cálculo de Delta no `StockAdjustmentModal.tsx`

**Contexto:**
Após a correção bem-sucedida de um bug na procedure `adjust_stock_explicit` do Supabase, descobrimos um bug ainda mais grave na lógica do frontend. A procedure do banco de dados agora aplica corretamente as deltas que recebe, mas o componente do frontend está calculando e enviando deltas completamente erradas.

**Descrição do Bug Crítico:**
Em um teste com o produto "teste", o estado inicial era **231 pacotes e 0 unidades soltas**. A ação do usuário foi ajustar o estoque para **230 pacotes e 0 unidades soltas**. O resultado final no banco de dados foi **229 pacotes e 2280 unidades soltas**.

Isso prova que o componente `StockAdjustmentModal.tsx` está calculando as deltas de forma errada, transformando uma mudança desejada de `-1` em pacotes em uma transação real de `-2` em pacotes e `+2280` em unidades.

**Sua Missão:**
1.  **Análise de Código:** Inspecione minuciosamente o arquivo `src/features/inventory/components/StockAdjustmentModal.tsx`. O foco principal é a função `onSubmit` (ou a função que lida com o envio do formulário) e qualquer outra função utilitária que ela chame para calcular as deltas.
2.  **Identificação da Falha:** Encontre as linhas de código exatas que calculam `packagesChange` e `unitsLooseChange`. A lógica atual está incorreta e precisa ser identificada.
3.  **Desenvolvimento da Correção:** Reescreva a lógica de cálculo para que ela determine as deltas corretamente com base no estado inicial do produto e nos valores inseridos no formulário. A fórmula correta é simples:
    - `packagesChange = formData.newPackages - initialProductState.stock_packages`
    - `unitsLooseChange = formData.newUnitsLoose - initialProductState.stock_units_loose`
4.  **Fornecimento do Código:** Apresente o bloco de código corrigido para a função `onSubmit` ou a função de cálculo relevante. Certifique-se de que a nova lógica seja robusta e cubra todos os casos de uso (aumento, diminuição e nenhuma alteração para ambos os campos).

**Critério de Aceitação:**
O código fornecido deve garantir que, para o cenário de teste descrito, as deltas calculadas e enviadas para a RPC sejam `p_packages_change = -1` e `p_units_loose_change = 0`.