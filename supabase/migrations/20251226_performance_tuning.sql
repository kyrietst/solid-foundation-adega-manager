-- Migration: Performance Tuning (2025-12-26)
-- Description: Cleans up duplicate indexes and adds missing FK/Performance indexes.
-- Idempotent: Can be run multiple times without error.

-- ============================================================
-- SEÇÃO 1: LIMPEZA (Remover Duplicatas)
-- ============================================================

-- Tabela products: Removemos índices redundantes de categoria para recriar o padrão.
DROP INDEX IF EXISTS public.idx_products_category;
DROP INDEX IF EXISTS public.products_category_idx;

-- Tabela sales: Removemos índices redundantes de created_at.
DROP INDEX IF EXISTS public.idx_sales_created_at;
DROP INDEX IF EXISTS public.sales_created_at_idx;

-- Tabela sale_items: Removemos índices triplicados de product_id.
DROP INDEX IF EXISTS public.idx_sale_items_product;
DROP INDEX IF EXISTS public.idx_sale_items_product_id;
DROP INDEX IF EXISTS public.sale_items_product_id_idx;

-- ============================================================
-- SEÇÃO 2: INDEXAÇÃO DE FOREIGN KEYS (Gargalos de Join)
-- ============================================================

-- sale_items(sale_id): Critical for loading sale details
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items (sale_id);

-- sales(customer_id): Critical for filtering sales by customer
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON public.sales (customer_id);

-- inventory_movements(product_id): Critical for product history
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements (product_id);

-- Extra: Delivery indexes mentioned in report as missing
CREATE INDEX IF NOT EXISTS idx_sales_delivery_person_id ON public.sales (delivery_person_id);
CREATE INDEX IF NOT EXISTS idx_sales_delivery_zone_id ON public.sales (delivery_zone_id);

-- Recriar indices limpos da Seção 1 se necessário (Standardization)
-- sale_items(product_id)
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items (product_id);

-- sales(created_at) - Useful for sorting/filtering recent sales
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales (created_at);

-- ============================================================
-- SEÇÃO 3: TURBO (Full Scans em Products)
-- ============================================================

-- products(name): Search by name
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);

-- products(category): Filter by category (Corrected from category_id to category based on schema)
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
