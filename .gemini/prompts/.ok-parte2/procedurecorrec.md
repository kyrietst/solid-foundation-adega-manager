
Para: Agente supabase-database-architect
Prioridade: CRÍTICA
1. Contexto
Uma nova análise, baseada em logs detalhados do frontend, revelou que a procedure process_sale ainda contém um erro de cálculo, mas desta vez na forma como ela agrega os itens de uma venda com múltiplos tipos (unidades e pacotes).

2. Evidência Irrefutável (Análise dos Logs)
A procedure foi chamada com o seguinte payload de itens:

[
  { "product_id": "...", "units_sold": 1, "quantity": 1, "sale_type": "unit" },
  { "product_id": "...", "units_sold": 10, "quantity": 1, "sale_type": "package" }
]

Resultado Esperado: O estoque do produto deveria ser reduzido em 11 (1 + 10).

Resultado Real: O estoque do produto foi reduzido em 2 (1 + 1).

3. Diagnóstico e Tarefa
A sua lógica atual dentro da procedure process_sale está, incorretamente, somando o campo quantity de cada objeto no array de itens.

Sua missão é corrigir a procedure process_sale para que ela:

Itere sobre o array de items recebido como parâmetro.

Para cada item, some o valor do campo units_sold para calcular o total de unidades a serem subtraídas.

Use este total agregado de units_sold para realizar a única operação de subtração no estoque do produto correspondente.

Gere um novo script de migração do Supabase contendo APENAS a versão corrigida da FUNCTION process_sale. Nomeie a migração como fix_sale_aggregation_logic.