

---

### **Assunto: Missão Final e Definitiva: Simplificar a Lógica de Subtração de Estoque em `process_sale`**

**Para:** `supabase-database-architect`
**Prioridade:** MÁXIMA / CRÍTICA

**Contexto:**
Nós identificamos a causa raiz exata e final para o bug de estoque. A sua função `process_sale` está tentando ser inteligente, mas a inteligência já foi feita pelo frontend. O frontend envia um payload perfeito, mas a sua `procedure` está interpretando-o de forma errada.

**A Falha Comprovada:**
Uma venda de **1 pacote (que vale 10 unidades) + 1 unidade** está resultando em uma subtração de apenas **2 unidades** do estoque total. A `procedure` está somando a quantidade de *itens* no carrinho, em vez de somar a quantidade de *unidades que esses itens representam*.

**O Princípio Arquitetural que Você DEVE Seguir:**
1.  **O Frontend é o Especialista:** Ele sabe a diferença entre "pacote" e "unidade". Ele faz a conversão e nos envia o valor correto no campo `units_sold`.
2.  **A `Procedure` é o Executor Simples:** Sua única tarefa é receber as ordens e executá-las sem questionar. Você deve confiar cegamente nos dados que o frontend envia.

**Sua Missão Detalhada - Simplifique Agora:**
Sua missão é reescrever a `FUNCTION process_sale` para ser o mais simples possível. Remova toda a complexidade.

Siga **EXATAMENTE** estes passos:

1.  **Receba o JSON de `items`:** Sua função continuará recebendo o array de itens da venda.
2.  **Inicialize um Totalizador:** Crie uma variável numérica dentro da função, chamada `total_units_to_subtract`, e inicie-a com o valor `0`.
3.  **Itere e Some o Campo Correto:** Percorra cada item (`item`) dentro do array JSON. Para cada `item`, pegue o valor do campo `item.units_sold` e some-o à sua variável `total_units_to_subtract`.
4.  **Execute UMA ÚNICA Subtração:** Após o loop terminar, você terá o número exato de unidades a serem removidas. Execute **uma única** instrução `UPDATE` na tabela `products` para subtrair o valor de `total_units_to_subtract` do campo `stock_quantity`.

**REGRAS INEGOCIÁVEIS (O que NÃO fazer):**
* **NÃO** use `IF` ou `CASE` para verificar o `sale_type` ou `variant_type`. Isso é proibido.
* **NÃO** leia ou utilize o campo `quantity` dos itens para qualquer cálculo de estoque. Ignore-o.
* **NÃO** tente fazer nenhuma conversão ou cálculo matemático complexo. Apenas some os valores de `units_sold`.

**Entregável:**
Gere um novo script de migração do Supabase que contenha **APENAS** a nova versão simplificada e correta da `FUNCTION process_sale`. Nomeie o arquivo de migração como `fix_final_stock_subtraction_logic`.