# 02. Módulo Financeiro: Despesas Operacionais

> [!NOTE]
> Este documento detalha a implementação técnica do controle de despesas
> (`ExpensesTab.tsx`), focando na estabilidade de tipos e integração com o
> Supabase.

## 1. Visão Geral

O módulo de despesas gerencia saídas financeiras (Contas de Luz, Água, Salários,
Fornecedores). Diferente das Vendas (que têm alto volume de escrita), as
Despesas têm leitura pesada (Analytics, Filtros).

### Stack Específica

- **State:** `useExpenses` (Query), `useCreateExpense` (Mutation).
- **Dados:** Tabela `expenses` + `expense_categories`.
- **Relatórios:** RPC `get_monthly_expenses`.

---

## 2. Arquitetura de Tipos (Type Architecture)

Para evitar erros de recursividade do TypeScript ("Excessively deep
instantiation"), adotamos uma **Tipagem Manual Estrita**.

### `OperationalExpense` (Single Source of Truth)

Definida em `useExpenses.ts`, essa interface decopla o Frontend do schema
complexo do Supabase.

```typescript
interface OperationalExpense {
  id: string;
  user_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  date: string; // ISO String
  paid: boolean;
  // Campos Legados (Opcionais)
  payment_method?: string | null;
  supplier_vendor?: string | null;
  receipt_url?: string | null;
  created_at: string;
  updated_at: string;
}
```

> [!IMPORTANT]
> Nunca importe `Database['public']['Tables']['expenses']['Row']` diretamente em
> componentes. Use essa interface.

### `OperationalExpenseWithCategory`

Extensão para incluir dados joinados (necessário para exibição na UI).

```typescript
interface OperationalExpenseWithCategory extends OperationalExpense {
  expense_categories: {
    name: string;
    color: string | null;
    icon: string | null;
  } | null;
}
```

---

## 3. Protocolo de Isolamento de Client (Client Isolation)

Para garantir que o TypeScript não tente inferir tipos infinitamente através das
relações de chave estrangeira, isolamos o client Supabase com `as any` dentro
dos Hooks.

**Padrão de Implementação:**

```typescript
// useExpenses.ts
const { data, error } = await (supabase as any) // <-- Isolamento
  .from("expenses" as any)
  .select("*, expense_categories(name)")
  .single()
  .then((res) => ({
    // Cast explícito no retorno para garantir segurança onde importa: na UI
    data: res.data as unknown as OperationalExpenseWithCategory,
    error: res.error,
  }));
```

Isso garante:

1. **Build Rápido:** O compilador não gasta ciclos tentando resolver relações
   profundas.
2. **Zero Erros de IDE:** A "sujeira" do tipo any fica contida no Hook; o
   componente recebe tipos limpos.

---

## 4. UI/UX Features

### Componentes

- **`ExpensesTab.tsx`:** Container principal. Responsável por layout e
  orquestração de modais.
- **`ExpensesEmptyState`:** UI rica para quando não há dados.
- **`NewExpenseModal`:** Formulário com validação Zod.

### Paginação & Filtros

A paginação é _server-side_ e respeita a seguinte lógica:

1. **Filtros:** Aplicados na query base (`category_id`, `date range`).
2. **Range:** Supabase `.range(from, to)` aplicado por último.
3. **Contagem:** `count: 'exact'` para recalcular total de páginas corretamente.

---

## 5. Regras de Negócio (Backend/RPC)

### `get_monthly_expenses`

RPC utilizada para o gráfico de resumo mensal.

**Assinatura:**

```sql
FUNCTION get_monthly_expenses(
  target_month int,
  target_year int,
  category_filter uuid DEFAULT null
)
RETURNS TABLE (
  category_name text,
  total_amount numeric
)
```

Essa função agrega valores no banco, evitando transferir milhares de linhas para
o frontend apenas para somar um total.
