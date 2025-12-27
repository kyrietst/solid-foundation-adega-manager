-- CLEANUP: UNUSED INDEXES (Supabase Advisor)
-- Drops indexes identified as unused, excluding those critical for Foreign Key constraints.

BEGIN;

-- CUSTOMERS
DROP INDEX IF EXISTS public.customers_email_idx;
DROP INDEX IF EXISTS public.customers_name_idx;
DROP INDEX IF EXISTS public.idx_customers_active;
DROP INDEX IF EXISTS public.idx_customers_created_at;
DROP INDEX IF EXISTS public.idx_customers_deleted;

-- ACCOUNTS RECEIVABLE
DROP INDEX IF EXISTS public.idx_accounts_receivable_due_date;
DROP INDEX IF EXISTS public.idx_accounts_receivable_due_status;
DROP INDEX IF EXISTS public.idx_accounts_receivable_status;

-- LOGS
DROP INDEX IF EXISTS public.idx_activity_logs_action;
DROP INDEX IF EXISTS public.idx_activity_logs_created_at;
DROP INDEX IF EXISTS public.idx_activity_logs_role;
DROP INDEX IF EXISTS public.idx_audit_logs_action;
DROP INDEX IF EXISTS public.idx_audit_logs_created_at;
DROP INDEX IF EXISTS public.idx_audit_logs_record_id;
DROP INDEX IF EXISTS public.idx_audit_logs_table_name;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;

-- CATEGORIES
DROP INDEX IF EXISTS public.idx_categories_active;

-- DELIVERY TRACKING
DROP INDEX IF EXISTS public.idx_delivery_tracking_created_at;
DROP INDEX IF EXISTS public.idx_delivery_tracking_status;

-- EXPENSE BUDGETS
DROP INDEX IF EXISTS public.idx_expense_budgets_category;
DROP INDEX IF EXISTS public.idx_expense_budgets_month_year;

-- EXPIRY ALERTS
DROP INDEX IF EXISTS public.idx_expiry_alerts_batch;
DROP INDEX IF EXISTS public.idx_expiry_alerts_product;
DROP INDEX IF EXISTS public.idx_expiry_alerts_status;

-- INVENTORY MOVEMENTS
DROP INDEX IF EXISTS public.idx_inventory_movements_date;
DROP INDEX IF EXISTS public.idx_inventory_movements_date_product;
DROP INDEX IF EXISTS public.idx_inventory_movements_product_date;

-- MV KPIS
DROP INDEX IF EXISTS public.idx_mv_customer_segmentation_activity;
DROP INDEX IF EXISTS public.idx_mv_customer_segmentation_segment;

-- NOTIFICATIONS
DROP INDEX IF EXISTS public.idx_notifications_category;
DROP INDEX IF EXISTS public.idx_notifications_created_at;
DROP INDEX IF EXISTS public.idx_notifications_read_at;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_user_id;

-- PAYMENT METHODS
DROP INDEX IF EXISTS public.idx_payment_methods_type;

-- PRODUCT BATCHES
-- Keeping idx_product_batches_product_id (FK)
DROP INDEX IF EXISTS public.idx_product_batches_batch_code;
DROP INDEX IF EXISTS public.idx_product_batches_expiry_date;
DROP INDEX IF EXISTS public.idx_product_batches_status;
DROP INDEX IF EXISTS public.idx_product_batches_supplier;

-- PRODUCT COST HISTORY
DROP INDEX IF EXISTS public.idx_product_cost_history_current;
DROP INDEX IF EXISTS public.idx_product_cost_history_period;
DROP INDEX IF EXISTS public.idx_product_cost_history_product_valid;

-- PRODUCTS
-- Keeping FK indexes if they exist
DROP INDEX IF EXISTS public.idx_products_available_by_last_sale;
DROP INDEX IF EXISTS public.idx_products_barcode;
DROP INDEX IF EXISTS public.idx_products_category; -- Likely legacy, real FK is category_id
DROP INDEX IF EXISTS public.idx_products_category_stock;
DROP INDEX IF EXISTS public.idx_products_deleted_at;
DROP INDEX IF EXISTS public.idx_products_expiry;
DROP INDEX IF EXISTS public.idx_products_last_sale_date;
DROP INDEX IF EXISTS public.idx_products_low_stock_alert;
DROP INDEX IF EXISTS public.idx_products_package_barcode;
DROP INDEX IF EXISTS public.idx_products_packaging_type;
DROP INDEX IF EXISTS public.idx_products_stock_category_optimized;
DROP INDEX IF EXISTS public.idx_products_stock_packages;
DROP INDEX IF EXISTS public.idx_products_stock_units_loose;
DROP INDEX IF EXISTS public.idx_products_turnover_rate;
DROP INDEX IF EXISTS public.idx_products_unit_barcode;
DROP INDEX IF EXISTS public.idx_products_unit_type;
DROP INDEX IF EXISTS public.products_name_idx;

-- PROFILES
DROP INDEX IF EXISTS public.idx_profiles_email_role;
DROP INDEX IF EXISTS public.idx_profiles_temp_password;

-- SALE ITEMS
-- Keeping idx_sale_items_product_id (FK)
DROP INDEX IF EXISTS public.idx_sale_items_conversion_required;
DROP INDEX IF EXISTS public.idx_sale_items_sale_product;

-- SALES
-- Keeping FKs: idx_sales_customer_id, idx_sales_seller_id, idx_sales_delivery_person_id
DROP INDEX IF EXISTS public.idx_sales_customer_created;
DROP INDEX IF EXISTS public.idx_sales_customer_created_at;
DROP INDEX IF EXISTS public.idx_sales_order_number;
DROP INDEX IF EXISTS public.idx_sales_payment_method_enum;
DROP INDEX IF EXISTS public.idx_sales_status_created;
DROP INDEX IF EXISTS public.idx_sales_status_enum;
DROP INDEX IF EXISTS public.sales_delivery_user_id_idx; -- Dropping old naming convention (replaced by standard FK index)
DROP INDEX IF EXISTS public.sales_user_id_idx;

-- SUPPLIERS
DROP INDEX IF EXISTS public.suppliers_company_name_idx;
DROP INDEX IF EXISTS public.suppliers_is_active_idx;
DROP INDEX IF EXISTS public.suppliers_products_supplied_idx;

COMMIT;
