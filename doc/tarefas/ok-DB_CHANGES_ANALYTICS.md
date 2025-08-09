# Mudanças de Banco para Analytics (Dashboard e Relatórios)

Este documento lista, um a um, os itens pendentes/opcionais/próximos que exigem mudanças no banco (Supabase/PostgreSQL), incluindo assinaturas de funções e SQL conceitual.

Observação: mantenha RLS e políticas adequadas; todas as funções devem ser `security definer` somente quando necessário e restringidas por papéis.

---

## 1) Top 5 produtos do mês (Dashboard)

- Descrição: listar top N produtos por receita ou quantidade, com período configurável.
- Recurso: função RPC `get_top_products(start_date, end_date, limit_count, by)`
- Impacto: usado no widget “Top 5 produtos” do Dashboard e em relatórios de Vendas.

SQL conceitual:
```sql
create or replace function public.get_top_products(
  start_date timestamptz,
  end_date timestamptz,
  limit_count int default 5,
  by text default 'revenue'
)
returns table (
  product_id uuid,
  name text,
  category text,
  qty numeric,
  revenue numeric
) language sql stable as $$
  select
    p.id as product_id,
    p.name,
    p.category,
    sum(si.quantity) as qty,
    sum(si.quantity * si.unit_price) as revenue
  from sale_items si
  join products p on p.id = si.product_id
  join sales s on s.id = si.sale_id
  where s.created_at >= start_date
    and s.created_at < end_date
  group by 1,2,3
  order by case when by = 'quantity' then sum(si.quantity) end desc,
           case when by = 'revenue' then sum(si.quantity * si.unit_price) end desc
  limit greatest(limit_count, 1)
$$;
```

Índices:
- `create index if not exists idx_sales_created_at on sales(created_at);`
- `create index if not exists idx_sale_items_product on sale_items(product_id);`

---

## 2) Clientes ativos (30d) no KPI

- Descrição: retornar “clientes ativos” no período (≥ 1 compra).
- Recurso: estender `get_customer_metrics(start_date, end_date)` para incluir `active_customers`.
- Impacto: KPI “Clientes ativos (30d)” no Dashboard.

SQL conceitual:
```sql
create or replace function public.get_customer_metrics(
  start_date timestamptz,
  end_date timestamptz
)
returns table (
  total_customers bigint,
  new_customers bigint,
  active_customers bigint
) language sql stable as $$
  with sales_period as (
    select distinct customer_id
    from sales
    where created_at >= start_date and created_at < end_date
  ),
  first_purchase as (
    select customer_id, min(created_at) as first_order
    from sales
    group by 1
  )
  select
    (select count(*) from customers) as total_customers,
    (select count(*) from first_purchase fp where fp.first_order >= start_date and fp.first_order < end_date) as new_customers,
    (select count(*) from sales_period) as active_customers
$$;
```

Índice:
- `create index if not exists idx_sales_customer_created_at on sales(customer_id, created_at);`

---

## 3) Mix por categoria (Dashboard e Relatórios)

- Descrição: distribuição de receita por categoria em um período.
- Recurso: nova função `get_category_mix(start_date, end_date)`.
- Impacto: donut chart no Dashboard e relatório de Vendas.

SQL conceitual:
```sql
create or replace function public.get_category_mix(
  start_date timestamptz,
  end_date timestamptz
)
returns table (
  category text,
  revenue numeric
) language sql stable as $$
  select
    p.category,
    coalesce(sum(si.quantity * si.unit_price), 0) as revenue
  from sale_items si
  join products p on p.id = si.product_id
  join sales s on s.id = si.sale_id
  where s.created_at >= start_date and s.created_at < end_date
  group by p.category
  order by revenue desc
$$;
```

Índice:
- `create index if not exists idx_products_category on products(category);`

---

## 4) KPIs de Estoque avançado (Relatórios)

- Descrição: DOH (dias de cobertura), giro (turnover), críticos e dead stock.
- Recurso: função `get_inventory_kpis(window_days int)`.
- Impacto: relatório de Estoque detalhado.

SQL conceitual:
```sql
create or replace function public.get_inventory_kpis(
  window_days int default 30
)
returns table (
  product_id uuid,
  name text,
  category text,
  stock numeric,
  avg_daily_sales numeric,
  doh numeric,
  turnover numeric,
  is_critical boolean,
  is_dead_stock boolean
) language plpgsql stable as $$
declare
  start_date timestamptz := now() - (window_days || ' days')::interval;
begin
  return query
  with s as (
    select si.product_id, sum(si.quantity) as qty
    from sale_items si
    join sales sa on sa.id = si.sale_id
    where sa.created_at >= start_date
    group by 1
  )
  select
    p.id, p.name, p.category, p.stock,
    (coalesce(s.qty, 0) / nullif(window_days, 0))::numeric as avg_daily_sales,
    case when coalesce(s.qty, 0) > 0
         then (p.stock / (coalesce(s.qty, 0) / window_days))
         else null end as doh,
    case when p.stock > 0 and coalesce(s.qty, 0) > 0
         then (coalesce(s.qty, 0) / nullif(p.stock, 0)) else null end as turnover,
    (p.stock <= p.min_stock) as is_critical,
    (coalesce(s.qty, 0) = 0) as is_dead_stock
  from products p
  left join s on s.product_id = p.id;
end $$;
```

Índices: `sales(created_at)`, `sale_items(product_id)`, `products(category, stock)`.

---

## 5) Financeiro: Aging e DSO (Relatórios)

- Descrição: aging por faixas e cálculo de DSO.
- Recurso: função `get_financial_metrics(window_days int)`.
- Impacto: relatório Financeiro.

SQL conceitual:
```sql
create or replace function public.get_financial_metrics(window_days int default 90)
returns table (
  current numeric,
  d0_30 numeric,
  d31_60 numeric,
  d61_90 numeric,
  d90_plus numeric,
  dso numeric
) language sql stable as $$
  with ar as (
    select amount, due_date, status from accounts_receivable
    where status = 'open'
  ),
  payments as (
    select id, created_at as receipt_date, total from sales -- ajustar à sua origem de recebimento real
    where created_at >= now() - (window_days || ' days')::interval
  )
  select
    sum(case when due_date >= now() then amount else 0 end) as current,
    sum(case when due_date < now() and due_date >= now()-interval '30 days' then amount else 0 end) as d0_30,
    sum(case when due_date < now()-interval '30 days' and due_date >= now()-interval '60 days' then amount else 0 end) as d31_60,
    sum(case when due_date < now()-interval '60 days' and due_date >= now()-interval '90 days' then amount else 0 end) as d61_90,
    sum(case when due_date < now()-interval '90 days' then amount else 0 end) as d90_plus,
    coalesce(avg(extract(day from (receipt_date - date_trunc('day', receipt_date)))), 0) as dso
  from ar left join payments on true
$$;
```

Índice: `accounts_receivable(due_date, status)`.

---

## 6) Melhorias de dados e performance (Sprint 3)

- Histórico de custos (COGS): tabela `product_cost_history` com vigência.
- Triggers: atualizar `customers.last_purchase` após venda; normalizar `sales.status` e `payment_methods.type`.
- Cron: materializar views diárias para KPIs.

