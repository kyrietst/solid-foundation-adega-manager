⚠️ ULTIMATO ARQUITETURAL: SIMPLIFICAÇÃO OBRIGATÓRIA DA FUNÇÃO process_sale
Para: Agente supabase-database-architect
Status: CORREÇÃO ANTERIOR REJEITADA. EXECUÇÃO FINAL ORDENADA.
1. Veredito da Análise Anterior
Sua implementação anterior foi rejeitada. Você criou uma lógica complexa com IF/CASE para tratar packages e units separadamente. Isso viola diretamente o princípio arquitetural definido.

A única lógica aceitável é a de um executor simples.

2. A Lógica Correta (Implementação Obrigatória)
Você DEVE reescrever a função process_sale para conter APENAS a seguinte lógica, sem desvios ou inteligência adicional.

Pseudo-código Mandatório:

-- 1. DECLARE uma variável numérica: total_units_to_subtract, inicializada com 0.

-- 2. LOOP através de cada 'item' no array JSON de entrada.

-- 3. DENTRO DO LOOP: some o valor de 'item.units_sold' à variável 'total_units_to_subtract'.

-- 4. APÓS O LOOP: execute UMA ÚNICA instrução UPDATE na tabela 'products'.
   -- A instrução deve subtrair o valor final de 'total_units_to_subtract' do campo 'stock_quantity'.

-- 5. CHAME a função 'create_inventory_movement' UMA VEZ, registrando a saída total.

3. Ordem Final
ELIMINE qualquer lógica que verifique sale_type ou variant_type.

NÃO faça subtrações separadas de stock_packages ou stock_units_loose. A única fonte da verdade é a subtração do total de stock_quantity.

Confie 100% no campo units_sold enviado pelo frontend.

Gere a migração fix_final_stock_subtraction_logic com esta lógica simplificada. Não há outra alternativa. Esta é a solução. Execute.