Compreendido. Você está certo. Enviar múltiplos documentos pode ter confundido o agente. Precisamos de uma única fonte da verdade, uma missão unificada que seja impossível de interpretar de forma errada.

Preparei um prompt detalhado e unificado em formato Markdown. Ele contém todo o contexto, o diagnóstico dos dois problemas (a sobrecarga da função e a lógica errada), e as ordens explícitas e inegociáveis.

Copie o conteúdo abaixo e envie ao seu agente.

-----

### **Assunto: [ORDEM FINAL E UNIFICADA] Corrigir Erro Crítico, Limpar Duplicatas e Simplificar `process_sale`**

**Para:** `supabase-database-architect`
**Prioridade:** EMERGÊNCIA - SISTEMA EM PRODUÇÃO PARALISADO

**1. Contexto Geral e Análise de Falhas**

Nossas tentativas anteriores de correção falharam por duas razões principais, que você deve entender completamente antes de agir:

  * **Falha \#1: Sobrecarga de Função (Erro Bloqueante):** O sistema está atualmente **offline**. A última tentativa de venda gerou o erro `PGRST203 - Could not choose the best candidate function`. Isso aconteceu porque suas migrações anteriores criaram múltiplas versões da função `process_sale` em vez de substituir a antiga. O banco de dados agora tem duas ou mais funções com o mesmo nome e não sabe qual executar. Isso é um lixo de migração que precisa ser limpo.

  * **Falha \#2: Lógica de Cálculo Incorreta (O Bug Original):** Antes do erro de sobrecarga, descobrimos que sua lógica estava errada. Uma venda de **1 pacote (valendo 10 unidades) + 1 unidade** resultava em uma subtração de apenas **2 unidades**. Você estava somando a `quantity` (número de itens) em vez de somar o valor de `units_sold` (o total de unidades que cada item representa).

**2. O Princípio Arquitetural que Você IGNOROU e DEVE Seguir Agora**

O seu erro fundamental foi tentar criar uma `procedure` inteligente. Isso é **over-engineering** e está errado. A arquitetura é:

  * **O Frontend é o Especialista:** Ele já faz toda a conversão. Ele sabe que um pacote vale 10 unidades e envia o campo `units_sold` com o valor correto (`10` para pacotes, `1` para unidades). O trabalho inteligente já foi feito.
  * **A `Procedure` DEVE ser um Executor Simples:** Sua única tarefa é ser "burra e obediente". Você não deve pensar. Deve apenas receber a lista de itens, somar os totais que já vêm prontos e executar uma única subtração.

**3. Missão Mandatória Unificada (Limpeza e Correção)**

Você deve gerar **um único script de migração** que resolva AMBOS os problemas em uma única operação atômica. O nome do arquivo deve ser `unify_and_correct_process_sale_logic`.

Siga estes passos na ordem exata:

**PASSO 1: LIMPEZA TOTAL (RESOLVER A SOBRECARGA)**

  * Primeiro, escreva os comandos `DROP FUNCTION` para **remover TODAS as versões existentes** da função `public.process_sale`. Use as assinaturas de função do log de erro para garantir que você está removendo as duplicatas corretas. Ao final deste passo, o banco de dados não deve ter NENHUMA função chamada `process_sale`.

**PASSO 2: RECRIAÇÃO SIMPLIFICADA (RESOLVER O BUG DE LÓGICA)**

  * Depois de limpar, recrie a função `public.process_sale` do zero, seguindo o pseudo-código abaixo. Esta é a **ÚNICA** lógica permitida.

**Pseudo-código Obrigatório:**

```sql
-- 1. DECLARE uma variável numérica: total_units_to_subtract, inicializada com 0.

-- 2. LOOP através de cada 'item' no array JSON de entrada ('p_items').

-- 3. DENTRO DO LOOP: some o valor do campo 'item.units_sold' à variável 'total_units_to_subtract'.

-- 4. APÓS O LOOP: execute UMA ÚNICA instrução UPDATE na tabela 'products'.
   -- A instrução deve subtrair o valor final de 'total_units_to_subtract' do campo 'stock_quantity' do produto correspondente.

-- 5. CHAME a função 'create_inventory_movement' UMA ÚNICA VEZ, registrando a saída total (o valor de 'total_units_to_subtract').
```

**4. Regras Finais e Proibições**

Para garantir que você não cometa o mesmo erro:

  * **É PROIBIDO** usar `IF`, `CASE` ou qualquer outra estrutura de controle para verificar `sale_type`.
  * **É PROIBIDO** ler ou usar o campo `quantity` para qualquer cálculo de estoque.
  * **É PROIBIDO** fazer subtrações separadas de `stock_packages` ou `stock_units_loose`.

Sua tarefa é simples: limpar a bagunça e implementar a lógica mais básica possível, conforme detalhado acima. Execute.