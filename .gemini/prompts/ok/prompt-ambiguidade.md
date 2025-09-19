
-----

### Prompt para Agente Supabase: Correção da Ambiguidade de Coluna na RPC

Aqui está o prompt final e cirúrgico. Ele contém a prova do crime e a instrução exata para a correção. Envie isto para o seu **agente Supabase**.

````markdown
Olá! Assuma sua persona de **Arquiteto de Banco de Dados Supabase Sênior**.

Estamos na fase final da depuração do nosso sistema de estoque e isolamos a causa raiz de um erro 400 persistente. O frontend está enviando os dados corretos, mas a RPC `adjust_stock_explicit` está falhando com um erro de ambiguidade de coluna.

**DADOS DA DEPURACÃO (PROVA DO ERRO):**

**1. Payload Enviado pelo Frontend (CORRETO):**
```json
{
  "calculated_deltas": { "packagesChange": 13, "unitsLooseChange": 0 },
  "rpc_parameters": {
    "p_product_id": "03c44fba-b95e-4331-940c-dddb244f04fc",
    "p_packages_change": 13,
    "p_units_loose_change": 0,
    "p_reason": "teste"
  }
}
````

**2. Erro Recebido do Supabase (A CAUSA RAIZ):**

```json
{
  "code": "42702",
  "message": "column reference \"package_units\" is ambiguous",
  "details": "It could refer to either a PL/pgSQL variable or a table column."
}
```

**Sua Tarefa:**

1.  **Analise a Função:** Inspecione o código-fonte da função (procedure) `adjust_stock_explicit` no nosso banco de dados Supabase.
2.  **Identifique a Ambiguidade:** Localize a consulta SQL dentro da função que usa a coluna `package_units` sem especificar a tabela de origem (ex: `products.package_units`). O erro ocorre porque a consulta provavelmente envolve um `JOIN` ou a definição de variáveis com o mesmo nome das colunas.
3.  **Implemente a Correção:** Corrija a ambiguidade qualificando o nome da coluna com o nome da tabela. Por exemplo, altere `package_units` para `products.package_units` em todos os locais necessários dentro da função para que o PostgreSQL saiba exatamente a qual coluna você se refere.

### Entregáveis Esperados

Forneça uma única resposta contendo:

1.  **Diagnóstico Confirmado:** Uma breve frase confirmando que a ambiguidade foi encontrada.
2.  **Script SQL Corrigido:** O código `CREATE OR REPLACE FUNCTION` completo para a função `adjust_stock_explicit` com a ambiguidade de coluna devidamente resolvida.

<!-- end list -->

```
```