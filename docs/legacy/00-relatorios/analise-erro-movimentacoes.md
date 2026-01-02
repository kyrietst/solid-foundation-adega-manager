# Análise de Erro: PGRST201 em Movimentações de Estoque

**Data:** 02/12/2025
**Ambiente:** ADEGA-DEV
**Erro:** `PGRST201: Could not embed because more than one relationship was found for 'inventory_movements' and 'sales'`

## Descrição do Problema

Ao acessar a página de movimentações, o console do navegador exibe um erro `PGRST201`. Este erro ocorre quando o PostgREST (camada de API do Supabase) encontra múltiplas chaves estrangeiras (Foreign Keys) conectando duas tabelas e não sabe qual utilizar para realizar o `JOIN` (embedding).

Neste caso específico, a tabela `inventory_movements` possui duas chaves estrangeiras apontando para a tabela `sales`:

1.  **`inventory_movements_sale_id_fkey`**: Relaciona a coluna `sale_id` com `sales.id`.
2.  **`inventory_movements_related_sale_id_fkey`**: Relaciona a coluna `related_sale_id` com `sales.id`.

A query no frontend (`useMovements.ts`) solicita:
```typescript
.select(`
  *,
  sales:sales ( ... )
`)
```
Como não foi especificado qual relacionamento utilizar, o Supabase retorna o erro de ambiguidade.

## Causa Raiz

A recente correção de esquema adicionou explicitamente as colunas `sale_id` e `related_sale_id` e suas respectivas chaves estrangeiras para corrigir um erro anterior (`PGRST200` - falta de relacionamento). Ao fazer isso, criamos dois caminhos possíveis para chegar em `sales`, gerando a ambiguidade.

## Solução Proposta

Para resolver o erro, devemos ser explícitos na query do frontend sobre qual relacionamento utilizar.

### Opção A: Utilizar `sale_id` (Recomendada)
Se o objetivo é mostrar a venda direta associada à movimentação.
Alterar a query para:
```typescript
sales:sales!inventory_movements_sale_id_fkey ( ... )
```

### Opção B: Utilizar `related_sale_id`
Se o objetivo é mostrar a venda "relacionada" (ex: devoluções, trocas que linkam a uma venda original).
Alterar a query para:
```typescript
sales:sales!inventory_movements_related_sale_id_fkey ( ... )
```

### Recomendação Técnica
Dado que a interface espera um objeto `sales` contendo dados da venda, e a coluna `sale_id` é a referência primária de venda, a **Opção A** é a mais adequada para manter a semântica padrão. Se for necessário acessar a venda relacionada, deve-se adicionar um novo alias na query (ex: `related_sale:sales!inventory_movements_related_sale_id_fkey (...)`).

## Próximos Passos
1.  Atualizar `src/features/movements/hooks/useMovements.ts` para especificar o relacionamento `inventory_movements_sale_id_fkey`.
2.  Verificar se o erro persiste.
