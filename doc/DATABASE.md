# Documentação do Banco de Dados

## Visão Geral

O Adega Manager utiliza o PostgreSQL através do Supabase como banco de dados principal. A estrutura foi projetada para garantir integridade referencial, performance e segurança.

## Tabelas Principais

### users
Armazena informações dos usuários do sistema.
```sql
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  full_name text,
  role text not null check (role in ('admin', 'employee')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS
alter table public.users enable row level security;

-- Usuários podem ver seus próprios dados
create policy "Users can view own user data." on users
  for select using (auth.uid() = id);

-- Admins podem gerenciar todos os usuários
create policy "Admins can manage all users." on users
  using (auth.jwt() ->> 'role' = 'admin');
```

### products
Cadastro de produtos/vinhos.
```sql
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  stock_quantity integer not null default 0,
  category text not null,
  vintage integer,
  producer text,
  country text,
  region text,
  alcohol_content decimal(4,2),
  volume integer, -- em ml
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index products_name_idx on products using gin (to_tsvector('portuguese', name));
create index products_category_idx on products(category);

-- Políticas RLS
alter table public.products enable row level security;

create policy "Public read access" on products
  for select using (true);

create policy "Staff can manage products" on products
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));
```

### customers
Cadastro de clientes.
```sql
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique,
  phone text,
  address jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index customers_name_idx on customers using gin (to_tsvector('portuguese', name));
create index customers_email_idx on customers(email);

-- Políticas RLS
alter table public.customers enable row level security;

create policy "Staff can manage customers" on customers
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));
```

### sales
Registro de vendas.
```sql
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id),
  user_id uuid references public.users(id) not null,
  total_amount decimal(10,2) not null,
  payment_method text not null,
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled')),
  delivery boolean default false,
  delivery_address jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index sales_customer_id_idx on sales(customer_id);
create index sales_user_id_idx on sales(user_id);
create index sales_created_at_idx on sales(created_at);

-- Políticas RLS
alter table public.sales enable row level security;

create policy "Staff can manage sales" on sales
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));
```

### sale_items
Itens de cada venda.
```sql
create table public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.sales(id) not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index sale_items_sale_id_idx on sale_items(sale_id);
create index sale_items_product_id_idx on sale_items(product_id);

-- Políticas RLS
alter table public.sale_items enable row level security;

create policy "Staff can manage sale items" on sale_items
  using (auth.jwt() ->> 'role' in ('admin', 'employee'));
```

## Funções e Triggers

### update_updated_at
Atualiza o campo updated_at automaticamente.
```sql
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Aplicar aos triggers
create trigger update_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

create trigger update_customers_updated_at
  before update on public.customers
  for each row execute function public.update_updated_at();

create trigger update_sales_updated_at
  before update on public.sales
  for each row execute function public.update_updated_at();
```

### process_sale
Processa uma venda, atualizando estoque e validando quantidades.
```sql
create or replace function public.process_sale(
  p_customer_id uuid,
  p_user_id uuid,
  p_items jsonb,
  p_payment_method text,
  p_delivery boolean default false,
  p_delivery_address jsonb default null,
  p_notes text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_sale_id uuid;
  v_total decimal(10,2) := 0;
  v_item jsonb;
  v_product_id uuid;
  v_quantity int;
  v_unit_price decimal(10,2);
  v_current_stock int;
begin
  -- Validar usuário
  if not exists (select 1 from public.users where id = p_user_id) then
    raise exception 'Invalid user';
  end if;

  -- Validar cliente se fornecido
  if p_customer_id is not null and not exists (select 1 from public.customers where id = p_customer_id) then
    raise exception 'Invalid customer';
  end if;

  -- Criar venda
  insert into public.sales (
    customer_id,
    user_id,
    payment_method,
    delivery,
    delivery_address,
    notes,
    total_amount,
    status
  ) values (
    p_customer_id,
    p_user_id,
    p_payment_method,
    p_delivery,
    p_delivery_address,
    p_notes,
    0,
    'pending'
  ) returning id into v_sale_id;

  -- Processar itens
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity := (v_item->>'quantity')::int;
    
    -- Validar produto e estoque
    select price, stock_quantity 
    into v_unit_price, v_current_stock
    from public.products 
    where id = v_product_id;
    
    if not found then
      raise exception 'Product not found: %', v_product_id;
    end if;
    
    if v_current_stock < v_quantity then
      raise exception 'Insufficient stock for product: %', v_product_id;
    end if;
    
    -- Inserir item
    insert into public.sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price
    ) values (
      v_sale_id,
      v_product_id,
      v_quantity,
      v_unit_price
    );
    
    -- Atualizar total
    v_total := v_total + (v_unit_price * v_quantity);
    
    -- Atualizar estoque
    update public.products
    set stock_quantity = stock_quantity - v_quantity
    where id = v_product_id;
  end loop;
  
  -- Atualizar total da venda
  update public.sales
  set total_amount = v_total,
      status = 'completed'
  where id = v_sale_id;
  
  return v_sale_id;
end;
$$;
```

## Boas Práticas

1. **Validação de Dados**
   - Use constraints para garantir integridade
   - Implemente checks para valores válidos
   - Mantenha relacionamentos com foreign keys

2. **Performance**
   - Crie índices apropriados
   - Otimize queries complexas
   - Use explain analyze para verificar performance

3. **Segurança**
   - Mantenha RLS ativo
   - Implemente políticas granulares
   - Use funções security definer com cautela

4. **Manutenção**
   - Documente alterações no schema
   - Mantenha migrations versionadas
   - Faça backup regularmente

## Migrations

Todas as alterações no banco devem ser feitas através de migrations versionadas:

1. Crie um novo arquivo na pasta `supabase/migrations`
2. Nome do arquivo: `YYYYMMDDHHMMSS_descricao.sql`
3. Execute localmente para testar
4. Commit e push para aplicar em produção

## Monitoramento

1. **Queries Lentas**
   - Configure log_min_duration_statement
   - Monitore pg_stat_statements
   - Otimize queries problemáticas

2. **Espaço em Disco**
   - Monitore crescimento das tabelas
   - Configure vacuum automático
   - Arquive dados antigos se necessário

3. **Conexões**
   - Monitore número de conexões ativas
   - Configure pool de conexões adequadamente
   - Identifique conexões problemáticas

## Backup e Recuperação

1. **Backup Automático**
   - Configurado pelo Supabase
   - Retenção de 7 dias
   - Point-in-time recovery disponível

2. **Restore**
   - Disponível via dashboard Supabase
   - Teste procedimento periodicamente
   - Mantenha documentação atualizada

## Troubleshooting

### Problemas Comuns

1. **Deadlocks**
   - Identifique queries conflitantes
   - Otimize ordem de operações
   - Use índices apropriados

2. **Performance**
   - Analise explain analyze
   - Verifique índices
   - Otimize queries

3. **Conexões**
   - Verifique limites do pool
   - Identifique conexões zombies
   - Monitore timeouts 