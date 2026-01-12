create table if not exists public.sale_payments (
    id uuid not null default gen_random_uuid(),
    sale_id uuid not null,
    payment_method_id uuid not null,
    amount numeric not null,
    installments integer not null default 1,
    created_at timestamp with time zone default now(),

    constraint sale_payments_pkey primary key (id),
    constraint sale_payments_sale_id_fkey foreign key (sale_id) references public.sales(id) on delete cascade,
    constraint sale_payments_payment_method_id_fkey foreign key (payment_method_id) references public.payment_methods(id)
) tablespace pg_default;

create index if not exists idx_sale_payments_sale_id on public.sale_payments using btree (sale_id);
