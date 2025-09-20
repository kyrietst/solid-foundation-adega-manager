
---

### Prompt para o Agente

(Salve este conteúdo em um arquivo, por exemplo, `FIX_PROCESS_SALE_STOCK.md`)

**Agente a ser utilizado:** `supabase-database-architect`

**Assunto: Missão de Correção Crítica - Procedure `process_sale` Não Está Subtraindo o Estoque**

**Contexto:**
Identificamos um bug de severidade máxima. A procedure `process_sale` está concluindo as vendas, mas não está realizando a subtração correspondente dos itens vendidos do estoque na tabela `products`. Isso quebra a integridade do inventário.

**Diretriz Principal (A Regra de Ouro):**
A subtração do estoque deve ser uma "conta de 5ª série", simples e direta, como já definimos:
* Se 1 unidade foi vendida, subtraia 1 de `stock_units_loose`.
* Se 1 pacote foi vendido, subtraia 1 de `stock_packages`.

**Sua Missão:**

1.  **Inspecionar a Procedure:** Abra a *stored procedure* `public.process_sale` no nosso banco de dados Supabase.

2.  **Analisar o Fluxo de Lógica:**
    * Siga o código da procedure passo a passo.
    * Localize o `LOOP` ou a iteração que deveria passar por cada item da venda.
    * Encontre a instrução `UPDATE public.products SET ...` que deveria subtrair as quantidades.

3.  **Identificar e Corrigir a Falha:**
    * Verifique por que a instrução `UPDATE` não está funcionando. Ela está ausente? Contém um erro de lógica? Está sendo executada dentro da transação principal?
    * Implemente a lógica de subtração correta, garantindo que ela lide separadamente com unidades (`stock_units_loose`) e pacotes (`stock_packages`) para cada item vendido.

4.  **Garantir a Atomicidade:** A operação de `UPDATE` no estoque **DEVE** estar dentro da mesma transação que a criação da venda. Se a atualização do estoque falhar por qualquer motivo (ex: estoque insuficiente), a venda inteira deve ser revertida (`ROLLBACK`) para evitar inconsistências.

**Critério de Aceitação:**
- Após a correção, ao se concluir uma venda de 1 unidade e 1 pacote do produto "teste", o estoque desse produto no banco de dados deve ser decrementado exatamente em 1 unidade e 1 pacote.