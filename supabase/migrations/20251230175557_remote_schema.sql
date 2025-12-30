drop extension if exists "pg_net";

create extension if not exists "pg_trgm" with schema "public";

drop trigger if exists "update_batch_units_updated_at" on "public"."batch_units";

drop trigger if exists "categories_updated_at_trigger" on "public"."categories";

drop trigger if exists "customers_activity_trigger" on "public"."customers";

drop trigger if exists "trigger_delivery_tracking_updated_at" on "public"."delivery_tracking";

drop trigger if exists "trigger_notify_delivery_status" on "public"."delivery_tracking";

drop trigger if exists "trigger_delivery_zones_updated_at" on "public"."delivery_zones";

drop trigger if exists "update_expiry_alerts_updated_at" on "public"."expiry_alerts";

drop trigger if exists "check_inventory_changes" on "public"."inventory";

drop trigger if exists "trg_log_inventory_movement_event" on "public"."inventory_movements";

drop trigger if exists "update_nps_surveys_updated_at" on "public"."nps_surveys";

drop trigger if exists "update_operational_expenses_updated_at" on "public"."operational_expenses";

drop trigger if exists "products_activity_trigger" on "public"."products";

drop trigger if exists "sync_sale_totals_trigger" on "public"."sale_items";

drop trigger if exists "trigger_update_product_last_sale" on "public"."sale_items";

drop trigger if exists "detect_customer_preferences_trigger" on "public"."sales";

drop trigger if exists "sales_activity_trigger" on "public"."sales";

drop trigger if exists "sales_delete_update_customer_last_purchase" on "public"."sales";

drop trigger if exists "sales_insert_update_customer_last_purchase" on "public"."sales";

drop trigger if exists "sales_update_update_customer_last_purchase" on "public"."sales";

drop trigger if exists "update_customer_after_sale_trigger" on "public"."sales";

drop policy "financial_data_admin_only" on "public"."accounts_receivable";

drop policy "Employees can view activity logs" on "public"."activity_logs";

drop policy "admins select" on "public"."audit_logs";

drop policy "authenticated can insert" on "public"."audit_logs";

drop policy "Admins can manage all batch units" on "public"."batch_units";

drop policy "Delivery can view assigned batch units" on "public"."batch_units";

drop policy "Employees can insert batch units" on "public"."batch_units";

drop policy "Employees can update batch units" on "public"."batch_units";

drop policy "Employees can view batch units" on "public"."batch_units";

drop policy "categories_delete_policy" on "public"."categories";

drop policy "categories_insert_policy" on "public"."categories";

drop policy "categories_select_admin_all" on "public"."categories";

drop policy "categories_select_policy" on "public"."categories";

drop policy "categories_update_policy" on "public"."categories";

drop policy "Allow authenticated insert on customer_events" on "public"."customer_events";

drop policy "Allow authenticated read access on customer_events" on "public"."customer_events";

drop policy "Allow insert for staff on customer_events" on "public"."customer_events";

drop policy "allow_all_insert_customer_history" on "public"."customer_history";

drop policy "allow_owner_select_customer_history" on "public"."customer_history";

drop policy "Allow authenticated delete on customer_insights" on "public"."customer_insights";

drop policy "Allow authenticated insert on customer_insights" on "public"."customer_insights";

drop policy "Allow authenticated read access on customer_insights" on "public"."customer_insights";

drop policy "Allow authenticated update on customer_insights" on "public"."customer_insights";

drop policy "Admin full access to customers" on "public"."customers";

drop policy "Employee insert customers" on "public"."customers";

drop policy "Employee update active customers" on "public"."customers";

drop policy "Employee view active customers" on "public"."customers";

drop policy "Admin users can view debug logs" on "public"."debug_stock_calls_log";

drop policy "Admin can do everything on delivery_tracking" on "public"."delivery_tracking";

drop policy "Delivery can insert own delivery_tracking" on "public"."delivery_tracking";

drop policy "Delivery can view own delivery_tracking" on "public"."delivery_tracking";

drop policy "Employee can insert delivery_tracking" on "public"."delivery_tracking";

drop policy "Employee can update delivery_tracking" on "public"."delivery_tracking";

drop policy "Employee can view delivery_tracking" on "public"."delivery_tracking";

drop policy "Admin can do everything on delivery_zones" on "public"."delivery_zones";

drop policy "Employee and Delivery can view active delivery_zones" on "public"."delivery_zones";

drop policy "Employee can update delivery_zones" on "public"."delivery_zones";

drop policy "Admin can manage expense budgets" on "public"."expense_budgets";

drop policy "Employee can view expense budgets" on "public"."expense_budgets";

drop policy "Admin can manage expense categories" on "public"."expense_categories";

drop policy "Employee can view expense categories" on "public"."expense_categories";

drop policy "Admins can manage all expiry alerts" on "public"."expiry_alerts";

drop policy "Delivery can view relevant expiry alerts" on "public"."expiry_alerts";

drop policy "Employees can update expiry alerts" on "public"."expiry_alerts";

drop policy "Employees can view expiry alerts" on "public"."expiry_alerts";

drop policy "Admin has full access to inventory" on "public"."inventory";

drop policy "Allow inventory view for employees and admin" on "public"."inventory";

drop policy "Employees can only insert basic inventory info" on "public"."inventory";

drop policy "Employees can only update quantity" on "public"."inventory";

drop policy "conversion_log_delete" on "public"."inventory_conversion_log";

drop policy "conversion_log_insert" on "public"."inventory_conversion_log";

drop policy "conversion_log_select" on "public"."inventory_conversion_log";

drop policy "admin_full_access_inventory_movements" on "public"."inventory_movements";

drop policy "employee_create_inventory_movements" on "public"."inventory_movements";

drop policy "employee_update_own_inventory_movements" on "public"."inventory_movements";

drop policy "Users can update own notifications" on "public"."notifications";

drop policy "Users can view own notifications" on "public"."notifications";

drop policy "Admin full access to NPS surveys" on "public"."nps_surveys";

drop policy "Employee insert access to NPS surveys" on "public"."nps_surveys";

drop policy "Employee read access to NPS surveys" on "public"."nps_surveys";

drop policy "Admin can manage operational expenses" on "public"."operational_expenses";

drop policy "Employee can view operational expenses" on "public"."operational_expenses";

drop policy "Admins can manage all batches" on "public"."product_batches";

drop policy "Delivery can view batches" on "public"."product_batches";

drop policy "Employees can insert batches" on "public"."product_batches";

drop policy "Employees can update batches" on "public"."product_batches";

drop policy "Employees can view and create batches" on "public"."product_batches";

drop policy "product_cost_history_insert_policy" on "public"."product_cost_history";

drop policy "product_cost_history_select_policy" on "public"."product_cost_history";

drop policy "product_cost_history_update_policy" on "public"."product_cost_history";

drop policy "Admins can view deleted products" on "public"."products";

drop policy "Enable delete for admin users" on "public"."products";

drop policy "Enable insert for authenticated users" on "public"."products";

drop policy "Enable read access for active products" on "public"."products";

drop policy "Enable update for authenticated users" on "public"."products";

drop policy "employee_limited_product_access" on "public"."products";

drop policy "profiles_admin_delete" on "public"."profiles";

drop policy "profiles_admin_insert" on "public"."profiles";

drop policy "profiles_admin_update" on "public"."profiles";

drop policy "profiles_insert_own_only" on "public"."profiles";

drop policy "profiles_select_optimized" on "public"."profiles";

drop policy "profiles_update_own_only" on "public"."profiles";

drop policy "Allow insert for sale items" on "public"."sale_items";

drop policy "Delivery can view assigned sale items" on "public"."sale_items";

drop policy "Employees and admins can view all sale items" on "public"."sale_items";

drop policy "Staff can manage sale items" on "public"."sale_items";

drop policy "Admin and Employee can delete sales" on "public"."sales";

drop policy "Admin and Employee can update sales" on "public"."sales";

drop policy "Allow insert for authenticated users" on "public"."sales";

drop policy "Allow select for all" on "public"."sales";

drop policy "Delivery can view assigned sales" on "public"."sales";

drop policy "Employees can insert sales" on "public"."sales";

drop policy "Employees can update sales" on "public"."sales";

drop policy "Employees can view sales" on "public"."sales";

drop policy "delivery_own_sales_only" on "public"."sales";

drop policy "suppliers_admin_full_access" on "public"."suppliers";

drop policy "suppliers_delete_policy" on "public"."suppliers";

drop policy "suppliers_insert_policy" on "public"."suppliers";

drop policy "suppliers_select_policy" on "public"."suppliers";

drop policy "suppliers_update_policy" on "public"."suppliers";

drop policy "Admins can manage all users" on "public"."users";

drop policy "Enable delete for admins" on "public"."users";

drop policy "Enable insert for admins and system" on "public"."users";

drop policy "Enable read access for authenticated users" on "public"."users";

drop policy "Users can view own user data" on "public"."users";

revoke delete on table "public"."inventory" from "anon";

revoke insert on table "public"."inventory" from "anon";

revoke references on table "public"."inventory" from "anon";

revoke select on table "public"."inventory" from "anon";

revoke trigger on table "public"."inventory" from "anon";

revoke truncate on table "public"."inventory" from "anon";

revoke update on table "public"."inventory" from "anon";

revoke delete on table "public"."inventory" from "authenticated";

revoke insert on table "public"."inventory" from "authenticated";

revoke references on table "public"."inventory" from "authenticated";

revoke select on table "public"."inventory" from "authenticated";

revoke trigger on table "public"."inventory" from "authenticated";

revoke truncate on table "public"."inventory" from "authenticated";

revoke update on table "public"."inventory" from "authenticated";

revoke delete on table "public"."inventory" from "service_role";

revoke insert on table "public"."inventory" from "service_role";

revoke references on table "public"."inventory" from "service_role";

revoke select on table "public"."inventory" from "service_role";

revoke trigger on table "public"."inventory" from "service_role";

revoke truncate on table "public"."inventory" from "service_role";

revoke update on table "public"."inventory" from "service_role";

revoke delete on table "public"."inventory_conversion_log" from "anon";

revoke insert on table "public"."inventory_conversion_log" from "anon";

revoke references on table "public"."inventory_conversion_log" from "anon";

revoke select on table "public"."inventory_conversion_log" from "anon";

revoke trigger on table "public"."inventory_conversion_log" from "anon";

revoke truncate on table "public"."inventory_conversion_log" from "anon";

revoke update on table "public"."inventory_conversion_log" from "anon";

revoke delete on table "public"."inventory_conversion_log" from "authenticated";

revoke insert on table "public"."inventory_conversion_log" from "authenticated";

revoke references on table "public"."inventory_conversion_log" from "authenticated";

revoke select on table "public"."inventory_conversion_log" from "authenticated";

revoke trigger on table "public"."inventory_conversion_log" from "authenticated";

revoke truncate on table "public"."inventory_conversion_log" from "authenticated";

revoke update on table "public"."inventory_conversion_log" from "authenticated";

revoke delete on table "public"."inventory_conversion_log" from "service_role";

revoke insert on table "public"."inventory_conversion_log" from "service_role";

revoke references on table "public"."inventory_conversion_log" from "service_role";

revoke select on table "public"."inventory_conversion_log" from "service_role";

revoke trigger on table "public"."inventory_conversion_log" from "service_role";

revoke truncate on table "public"."inventory_conversion_log" from "service_role";

revoke update on table "public"."inventory_conversion_log" from "service_role";

alter table "public"."batch_units" drop constraint "batch_units_status_check";

alter table "public"."batch_units" drop constraint "unique_unit_code";

alter table "public"."batch_units" drop constraint "valid_package_sequence";

alter table "public"."batch_units" drop constraint "valid_sequence";

alter table "public"."customer_history" drop constraint "customer_history_customer_id_fkey";

alter table "public"."debug_stock_calls_log" drop constraint "debug_stock_calls_log_created_at_idx_constraint";

alter table "public"."debug_stock_calls_log" drop constraint "debug_stock_calls_log_user_id_fkey";

alter table "public"."expiry_alerts" drop constraint "expiry_alerts_alert_type_check";

alter table "public"."expiry_alerts" drop constraint "expiry_alerts_priority_check";

alter table "public"."expiry_alerts" drop constraint "valid_days_until_expiry";

alter table "public"."expiry_alerts" drop constraint "valid_quantities";

alter table "public"."inventory_conversion_log" drop constraint "inventory_conversion_log_conversion_type_check";

alter table "public"."inventory_conversion_log" drop constraint "inventory_conversion_log_product_id_fkey";

alter table "public"."inventory_conversion_log" drop constraint "inventory_conversion_log_sale_id_fkey";

alter table "public"."inventory_conversion_log" drop constraint "inventory_conversion_log_user_id_fkey";

alter table "public"."nps_surveys" drop constraint "nps_surveys_score_check";

alter table "public"."nps_surveys" drop constraint "valid_score";

alter table "public"."operational_expenses" drop constraint "operational_expenses_amount_check";

alter table "public"."operational_expenses" drop constraint "operational_expenses_created_by_fkey";

alter table "public"."operational_expenses" drop constraint "operational_expenses_recurring_frequency_check";

alter table "public"."sale_items" drop constraint "product_reference_check";

alter table "public"."sales" drop constraint "fk_sales_delivery_zone_id";

alter table "public"."batch_units" drop constraint "batch_units_batch_id_fkey";

alter table "public"."batch_units" drop constraint "batch_units_product_id_fkey";

alter table "public"."expiry_alerts" drop constraint "expiry_alerts_status_check";

alter table "public"."inventory_movements" drop constraint "inventory_movements_related_sale_id_fkey";

alter table "public"."inventory_movements" drop constraint "inventory_movements_sale_id_fkey";

alter table "public"."nps_surveys" drop constraint "nps_surveys_customer_id_fkey";

alter table "public"."nps_surveys" drop constraint "nps_surveys_sale_id_fkey";

alter table "public"."sale_items" drop constraint "sale_items_sale_id_fkey";

drop index if exists "public"."idx_mv_customer_segmentation_activity";

drop index if exists "public"."idx_mv_customer_segmentation_segment";

drop function if exists "public"."add_delivery_tracking"(p_sale_id uuid, p_status character varying, p_notes text, p_location_lat numeric, p_location_lng numeric, p_created_by uuid);

drop function if exists "public"."adjust_product_stock"();

drop function if exists "public"."adjust_stock_packages"(p_product_id uuid, p_packages_delta integer, p_reason text);

drop function if exists "public"."adjust_stock_units_loose"(p_product_id uuid, p_units_delta integer, p_reason text);

drop function if exists "public"."analyze_debug_stock_logs"(p_product_id uuid, p_hours_back integer);

drop function if exists "public"."calculate_budget_variance"(target_month integer, target_year integer);

drop function if exists "public"."calculate_delivery_kpis"(p_start_date timestamp with time zone, p_end_date timestamp with time zone, p_delivery_person_id uuid);

drop function if exists "public"."calculate_delivery_person_score"(p_delivery_person_id uuid, p_days integer);

drop function if exists "public"."change_password_unified"(current_password text, new_password text);

drop function if exists "public"."check_all_expiry_alerts"();

drop function if exists "public"."check_price_changes"();

drop function if exists "public"."check_rate_limit"(p_email text, p_ip text);

drop function if exists "public"."check_variant_availability"(p_product_id uuid, p_variant_type text, p_quantity integer);

drop function if exists "public"."cleanup_debug_logs"(p_days_to_keep integer);

drop function if exists "public"."convert_to_sao_paulo"(input_timestamp timestamp with time zone);

drop function if exists "public"."create_csv_product_mapping"();

drop function if exists "public"."create_direct_admin"(p_email text, p_password text, p_name text);

drop function if exists "public"."create_inventory_movement"(p_product_id uuid, p_quantity_change integer, p_movement_type text, p_reason text, p_metadata jsonb, p_movement_variant_type text);

drop function if exists "public"."debug_log_stock_adjustment"(p_product_id uuid, p_packages_change integer, p_units_loose_change integer, p_reason text);

drop function if exists "public"."decrement_product_stock"(p_product_id uuid, p_quantity integer);

drop function if exists "public"."delete_user_profile"(user_id_param uuid);

drop function if exists "public"."delete_user_role"(user_id_param uuid);

drop function if exists "public"."detect_customer_preferences"();

drop function if exists "public"."detect_late_deliveries"();

drop function if exists "public"."ensure_admin_permissions"();

drop function if exists "public"."find_matching_product"(product_description text);

drop function if exists "public"."fn_log_movement_event"();

drop function if exists "public"."format_br_datetime"(input_timestamp timestamp with time zone);

drop function if exists "public"."get_available_delivery_persons"();

drop function if exists "public"."get_customer_satisfaction_metrics"(p_days integer);

drop function if exists "public"."get_customer_summary"(start_date timestamp with time zone, end_date timestamp with time zone, period_type text);

drop function if exists "public"."get_dashboard_financials"(p_start_date timestamp with time zone, p_end_date timestamp with time zone);

drop function if exists "public"."get_deleted_customers"(p_limit integer, p_offset integer);

drop function if exists "public"."get_deleted_customers"(p_user_id uuid);

drop function if exists "public"."get_delivery_daily_trends"(p_days integer);

drop function if exists "public"."get_delivery_kpis_report"(p_days integer);

drop function if exists "public"."get_delivery_person_daily_details"(p_person_id text, p_days integer);

drop function if exists "public"."get_delivery_person_performance"(p_days integer);

drop function if exists "public"."get_delivery_person_performance"(p_start_date timestamp with time zone, p_end_date timestamp with time zone);

drop function if exists "public"."get_delivery_summary_report"(p_days integer, p_zone_id text, p_status text);

drop function if exists "public"."get_delivery_vs_instore_comparison"(p_start_date timestamp with time zone, p_end_date timestamp with time zone);

drop function if exists "public"."get_delivery_zone_analysis"(p_start_date timestamp with time zone, p_end_date timestamp with time zone);

drop function if exists "public"."get_expiry_statistics"();

drop function if exists "public"."get_financial_metrics"(start_date timestamp with time zone, end_date timestamp with time zone);

drop function if exists "public"."get_inventory_metrics"();

drop function if exists "public"."get_pending_deliveries_count"();

drop function if exists "public"."get_product_total_units"(p_product_id uuid);

drop function if exists "public"."get_sales_metrics"(start_date timestamp with time zone, end_date timestamp with time zone);

drop function if exists "public"."get_sales_trends"(start_date timestamp with time zone, end_date timestamp with time zone, period_type text);

drop function if exists "public"."get_zone_benchmarks"(p_days integer);

drop function if exists "public"."get_zone_detailed_analysis"(p_days integer);

drop function if exists "public"."get_zone_peak_hours_analysis"(p_zone_id text, p_days integer);

drop function if exists "public"."get_zone_performance"(p_days integer);

drop function if exists "public"."handle_new_user"();

drop function if exists "public"."handle_new_user_smart"();

drop function if exists "public"."is_supreme_admin"();

drop function if exists "public"."log_auth_attempt"(p_email text, p_success boolean, p_ip text, p_user_agent text);

drop function if exists "public"."log_customer_activity"();

drop function if exists "public"."log_product_activity"();

drop function if exists "public"."log_sale_activity"();

drop function if exists "public"."log_user_login"(user_id uuid, user_email text);

drop function if exists "public"."migrate_invalid_categories_to_outros"();

drop function if exists "public"."monitor_expiry_alerts"();

drop function if exists "public"."normalize_brazilian_phone"(phone_input text);

drop function if exists "public"."notify_delivery_status_change"();

drop function if exists "public"."parse_csv_product_item"(item_text text);

drop function if exists "public"."recalc_all_customer_last_purchase"();

drop function if exists "public"."recalc_customer_insights"(p_customer_id uuid);

drop function if exists "public"."record_nps_survey"(p_customer_id uuid, p_score integer, p_comment text, p_survey_type text, p_context jsonb, p_sale_id uuid, p_channel text);

drop function if exists "public"."record_product_movement"(p_product_id uuid, p_type text, p_quantity integer, p_reason text, p_reference_number text, p_source text, p_user_id uuid, p_related_sale_id uuid, p_notes text);

drop function if exists "public"."refresh_all_kpi_views"();

drop function if exists "public"."reprocess_csv_sale_with_real_products"(p_sale_id uuid, p_products_text text);

drop function if exists "public"."reset_admin_password"(p_password text);

drop function if exists "public"."restore_customer"(p_customer_id uuid, p_user_id uuid);

drop function if exists "public"."schedule_mv_refresh"(schedule_type text);

drop function if exists "public"."set_product_stock_absolute_multistore"(p_product_id uuid, p_new_packages integer, p_new_units_loose integer, p_reason text, p_user_id uuid, p_store integer);

drop function if exists "public"."setup_first_admin"(p_email text, p_name text);

drop function if exists "public"."soft_delete_customer"(p_customer_id uuid, p_user_id uuid);

drop function if exists "public"."sync_sale_totals"();

drop function if exists "public"."update_categories_updated_at"();

drop function if exists "public"."update_customer_after_sale"();

drop function if exists "public"."update_customer_last_purchase"();

drop function if exists "public"."update_delivery_tracking_updated_at"();

drop function if exists "public"."update_delivery_zones_updated_at"();

drop function if exists "public"."update_estimated_delivery_times"();

drop function if exists "public"."update_nps_surveys_updated_at"();

drop function if exists "public"."update_product_last_sale"();

drop function if exists "public"."update_product_variants_updated_at"();

drop function if exists "public"."upsert_customer_from_csv"(p_name text, p_phone text, p_address text);

drop view if exists "public"."v_customer_timeline";

drop view if exists "public"."dual_stock_summary";

drop view if exists "public"."product_movement_history";

drop view if exists "public"."v_customer_stats";

drop view if exists "public"."v_customer_purchases";

alter table "public"."inventory" drop constraint "inventory_pkey";

alter table "public"."inventory_conversion_log" drop constraint "inventory_conversion_log_pkey";

drop index if exists "public"."customers_email_idx";

drop index if exists "public"."customers_name_idx";

drop index if exists "public"."idx_accounts_receivable_due_date";

drop index if exists "public"."idx_accounts_receivable_due_status";

drop index if exists "public"."idx_accounts_receivable_status";

drop index if exists "public"."idx_activity_logs_action";

drop index if exists "public"."idx_activity_logs_created_at";

drop index if exists "public"."idx_activity_logs_role";

drop index if exists "public"."idx_audit_logs_action";

drop index if exists "public"."idx_audit_logs_created_at";

drop index if exists "public"."idx_audit_logs_record_id";

drop index if exists "public"."idx_audit_logs_table_name";

drop index if exists "public"."idx_batch_units_customer_id";

drop index if exists "public"."idx_batch_units_hierarchy";

drop index if exists "public"."idx_batch_units_package_barcode";

drop index if exists "public"."idx_batch_units_sale_id";

drop index if exists "public"."idx_batch_units_status";

drop index if exists "public"."idx_batch_units_unit_barcode";

drop index if exists "public"."idx_categories_active";

drop index if exists "public"."idx_conversion_log_conversion_type";

drop index if exists "public"."idx_conversion_log_created_at";

drop index if exists "public"."idx_conversion_log_product_id";

drop index if exists "public"."idx_conversion_log_sale_id";

drop index if exists "public"."idx_conversion_log_user_id";

drop index if exists "public"."idx_customer_events_customer_created_at";

drop index if exists "public"."idx_customer_insights_active_by_customer";

drop index if exists "public"."idx_customer_insights_composite";

drop index if exists "public"."idx_customers_active";

drop index if exists "public"."idx_customers_created_at";

drop index if exists "public"."idx_customers_deleted";

drop index if exists "public"."idx_debug_stock_calls_log_created_at";

drop index if exists "public"."idx_debug_stock_calls_log_payload";

drop index if exists "public"."idx_debug_stock_calls_log_source";

drop index if exists "public"."idx_delivery_tracking_created_at";

drop index if exists "public"."idx_delivery_tracking_status";

drop index if exists "public"."idx_delivery_zones_is_active";

drop index if exists "public"."idx_delivery_zones_priority";

drop index if exists "public"."idx_expense_budgets_category";

drop index if exists "public"."idx_expense_budgets_month_year";

drop index if exists "public"."idx_expiry_alerts_alert_date";

drop index if exists "public"."idx_expiry_alerts_alert_type";

drop index if exists "public"."idx_expiry_alerts_dashboard";

drop index if exists "public"."idx_expiry_alerts_days_until_expiry";

drop index if exists "public"."idx_expiry_alerts_expiry_date";

drop index if exists "public"."idx_expiry_alerts_priority";

drop index if exists "public"."idx_expiry_alerts_status";

drop index if exists "public"."idx_inventory_movements_date";

drop index if exists "public"."idx_inventory_movements_date_product";

drop index if exists "public"."idx_inventory_movements_product_date";

drop index if exists "public"."idx_notifications_category";

drop index if exists "public"."idx_notifications_created_at";

drop index if exists "public"."idx_notifications_read_at";

drop index if exists "public"."idx_notifications_type";

drop index if exists "public"."idx_nps_surveys_created_at";

drop index if exists "public"."idx_nps_surveys_response_date";

drop index if exists "public"."idx_nps_surveys_score";

drop index if exists "public"."idx_nps_surveys_survey_type";

drop index if exists "public"."idx_operational_expenses_category";

drop index if exists "public"."idx_operational_expenses_created_by";

drop index if exists "public"."idx_operational_expenses_date";

drop index if exists "public"."idx_payment_methods_type";

drop index if exists "public"."idx_product_batches_batch_code";

drop index if exists "public"."idx_product_batches_expiry_date";

drop index if exists "public"."idx_product_batches_status";

drop index if exists "public"."idx_product_batches_supplier";

drop index if exists "public"."idx_product_cost_history_current";

drop index if exists "public"."idx_product_cost_history_period";

drop index if exists "public"."idx_product_cost_history_product_valid";

drop index if exists "public"."idx_products_available_by_last_sale";

drop index if exists "public"."idx_products_barcode";

drop index if exists "public"."idx_products_category";

drop index if exists "public"."idx_products_category_stock";

drop index if exists "public"."idx_products_deleted_at";

drop index if exists "public"."idx_products_expiry";

drop index if exists "public"."idx_products_last_sale_date";

drop index if exists "public"."idx_products_low_stock_alert";

drop index if exists "public"."idx_products_package_barcode";

drop index if exists "public"."idx_products_packaging_type";

drop index if exists "public"."idx_products_stock";

drop index if exists "public"."idx_products_stock_category_optimized";

drop index if exists "public"."idx_products_stock_packages";

drop index if exists "public"."idx_products_stock_units_loose";

drop index if exists "public"."idx_products_turnover_rate";

drop index if exists "public"."idx_products_unit_barcode";

drop index if exists "public"."idx_products_unit_type";

drop index if exists "public"."idx_profiles_email_role";

drop index if exists "public"."idx_profiles_temp_password";

drop index if exists "public"."idx_sale_items_conversion_required";

drop index if exists "public"."idx_sale_items_product_description_legacy";

drop index if exists "public"."idx_sale_items_sale_product";

drop index if exists "public"."idx_sales_customer_created";

drop index if exists "public"."idx_sales_customer_created_at";

drop index if exists "public"."idx_sales_order_number";

drop index if exists "public"."idx_sales_payment_method_enum";

drop index if exists "public"."idx_sales_status_created";

drop index if exists "public"."idx_sales_status_created_at";

drop index if exists "public"."idx_sales_status_enum";

drop index if exists "public"."inventory_conversion_log_pkey";

drop index if exists "public"."inventory_pkey";

drop index if exists "public"."products_name_idx";

drop index if exists "public"."sales_delivery_user_id_idx";

drop index if exists "public"."sales_user_id_idx";

drop index if exists "public"."suppliers_company_name_idx";

drop index if exists "public"."suppliers_is_active_idx";

drop index if exists "public"."suppliers_products_supplied_idx";

drop index if exists "public"."unique_unit_code";

drop table "public"."inventory";

drop table "public"."inventory_conversion_log";

alter table "public"."batch_units" drop column "customer_id";

alter table "public"."batch_units" drop column "defects";

alter table "public"."batch_units" drop column "expired_at";

alter table "public"."batch_units" drop column "location_code";

alter table "public"."batch_units" drop column "package_barcode";

alter table "public"."batch_units" drop column "package_sequence";

alter table "public"."batch_units" drop column "quality_notes";

alter table "public"."batch_units" drop column "reserved_at";

alter table "public"."batch_units" drop column "sale_id";

alter table "public"."batch_units" drop column "shelf_code";

alter table "public"."batch_units" drop column "sold_at";

alter table "public"."batch_units" drop column "unit_barcode";

alter table "public"."batch_units" drop column "unit_sequence";

alter table "public"."batch_units" alter column "batch_id" drop not null;

alter table "public"."batch_units" alter column "package_code" set data type character varying using "package_code"::character varying;

alter table "public"."batch_units" alter column "product_id" drop not null;

alter table "public"."batch_units" alter column "status" set default 'in_stock'::character varying;

alter table "public"."batch_units" alter column "status" set data type character varying using "status"::character varying;

alter table "public"."batch_units" alter column "unit_code" set data type character varying using "unit_code"::character varying;

alter table "public"."customer_history" alter column "id" set default gen_random_uuid();

alter table "public"."customer_history" disable row level security;

alter table "public"."customer_insights" drop column "confidence";

alter table "public"."customer_insights" drop column "created_at";

alter table "public"."customer_insights" drop column "insight_type";

alter table "public"."customer_insights" drop column "insight_value";

alter table "public"."customer_insights" drop column "is_active";

alter table "public"."customer_insights" add column "calculated_at" timestamp with time zone default now();

alter table "public"."customer_insights" add column "churn_risk" text;

alter table "public"."customer_insights" add column "custom_segment" text;

alter table "public"."customer_insights" add column "frequency_score" integer;

alter table "public"."customer_insights" add column "last_purchase_date" timestamp with time zone;

alter table "public"."customer_insights" add column "monetary_score" integer;

alter table "public"."customer_insights" add column "recency_score" integer;

alter table "public"."customer_insights" add column "total_spent" numeric;

alter table "public"."customer_insights" alter column "id" set default gen_random_uuid();

alter table "public"."debug_stock_calls_log" disable row level security;

alter table "public"."delivery_zones" drop column "color_hex";

alter table "public"."delivery_zones" drop column "delivery_fee";

alter table "public"."delivery_zones" drop column "description";

alter table "public"."delivery_zones" drop column "estimated_time_minutes";

alter table "public"."delivery_zones" drop column "is_active";

alter table "public"."delivery_zones" drop column "minimum_order_value";

alter table "public"."delivery_zones" drop column "name";

alter table "public"."delivery_zones" drop column "polygon";

alter table "public"."delivery_zones" drop column "priority";

alter table "public"."delivery_zones" add column "active" boolean default true;

alter table "public"."delivery_zones" add column "base_fee" numeric not null default 0;

alter table "public"."delivery_zones" add column "max_distance" integer default 0;

alter table "public"."delivery_zones" add column "min_distance" integer default 0;

alter table "public"."delivery_zones" add column "zone_name" text not null;

alter table "public"."expiry_alerts" drop column "acknowledged_at";

alter table "public"."expiry_alerts" drop column "affected_packages";

alter table "public"."expiry_alerts" drop column "affected_units";

alter table "public"."expiry_alerts" drop column "alert_level";

alter table "public"."expiry_alerts" drop column "alert_type";

alter table "public"."expiry_alerts" drop column "days_until_expiry";

alter table "public"."expiry_alerts" drop column "estimated_loss_value";

alter table "public"."expiry_alerts" drop column "expiry_date";

alter table "public"."expiry_alerts" drop column "message";

alter table "public"."expiry_alerts" drop column "notification_method";

alter table "public"."expiry_alerts" drop column "notification_sent";

alter table "public"."expiry_alerts" drop column "notification_sent_at";

alter table "public"."expiry_alerts" drop column "priority";

alter table "public"."expiry_alerts" drop column "product_category";

alter table "public"."expiry_alerts" drop column "product_name";

alter table "public"."expiry_alerts" drop column "resolution_notes";

alter table "public"."expiry_alerts" drop column "resolved_at";

alter table "public"."expiry_alerts" drop column "suggested_action";

alter table "public"."expiry_alerts" drop column "supplier_name";

alter table "public"."expiry_alerts" drop column "title";

alter table "public"."expiry_alerts" drop column "updated_at";

alter table "public"."expiry_alerts" alter column "batch_id" drop not null;

alter table "public"."expiry_alerts" alter column "product_id" drop not null;

alter table "public"."expiry_alerts" alter column "status" set default 'pending'::character varying;

alter table "public"."nps_surveys" drop column "channel";

alter table "public"."nps_surveys" drop column "comment";

alter table "public"."nps_surveys" drop column "context";

alter table "public"."nps_surveys" drop column "device_info";

alter table "public"."nps_surveys" drop column "response_date";

alter table "public"."nps_surveys" drop column "survey_type";

alter table "public"."nps_surveys" add column "feedback" text;

alter table "public"."operational_expenses" drop column "subcategory";

alter table "public"."operational_expenses" alter column "amount" set data type numeric using "amount"::numeric;

alter table "public"."operational_expenses" alter column "category_id" drop not null;

alter table "public"."products" alter column "has_unit_tracking" set default true;

alter table "public"."products" alter column "package_margin" set data type numeric(8,2) using "package_margin"::numeric(8,2);

alter table "public"."sale_items" drop column "product_description_legacy";

alter table "public"."sale_items" drop column "variant_id";

CREATE INDEX idx_accounts_receivable_customer_id ON public.accounts_receivable USING btree (customer_id);

CREATE INDEX idx_accounts_receivable_sale_id ON public.accounts_receivable USING btree (sale_id);

CREATE INDEX idx_automation_logs_customer_id ON public.automation_logs USING btree (customer_id);

CREATE INDEX idx_batch_units_created_by ON public.batch_units USING btree (created_by);

CREATE INDEX idx_categories_created_by ON public.categories USING btree (created_by);

CREATE INDEX idx_customer_events_customer_id ON public.customer_events USING btree (customer_id);

CREATE INDEX idx_customer_history_customer_id ON public.customer_history USING btree (customer_id);

CREATE INDEX idx_customer_insights_customer_id ON public.customer_insights USING btree (customer_id);

CREATE INDEX idx_customer_interactions_associated_sale_id ON public.customer_interactions USING btree (associated_sale_id);

CREATE INDEX idx_customer_interactions_created_by ON public.customer_interactions USING btree (created_by);

CREATE INDEX idx_customer_interactions_customer_id ON public.customer_interactions USING btree (customer_id);

CREATE INDEX idx_customers_deleted_by ON public.customers USING btree (deleted_by);

CREATE INDEX idx_customers_favorite_product ON public.customers USING btree (favorite_product);

CREATE INDEX idx_debug_stock_calls_log_user_id ON public.debug_stock_calls_log USING btree (user_id);

CREATE INDEX idx_delivery_tracking_created_by ON public.delivery_tracking USING btree (created_by);

CREATE INDEX idx_expense_budgets_created_by ON public.expense_budgets USING btree (created_by);

CREATE INDEX idx_expenses_category_id ON public.expenses USING btree (category_id);

CREATE INDEX idx_expiry_alerts_acknowledged_by ON public.expiry_alerts USING btree (acknowledged_by);

CREATE INDEX idx_expiry_alerts_resolved_by ON public.expiry_alerts USING btree (resolved_by);

CREATE INDEX idx_inventory_movements_customer_id ON public.inventory_movements USING btree (customer_id);

CREATE INDEX idx_inventory_movements_related_sale_id ON public.inventory_movements USING btree (related_sale_id);

CREATE INDEX idx_inventory_movements_sale_id ON public.inventory_movements USING btree (sale_id);

CREATE INDEX idx_inventory_movements_user_id ON public.inventory_movements USING btree (user_id);

CREATE INDEX idx_nps_surveys_created_by ON public.nps_surveys USING btree (created_by);

CREATE INDEX idx_nps_surveys_sale_id ON public.nps_surveys USING btree (sale_id);

CREATE INDEX idx_operational_expenses_category_id ON public.operational_expenses USING btree (category_id);

CREATE INDEX idx_product_batches_created_by ON public.product_batches USING btree (created_by);

CREATE INDEX idx_product_cost_history_created_by ON public.product_cost_history USING btree (created_by);

CREATE INDEX idx_product_cost_history_product_id ON public.product_cost_history USING btree (product_id);

CREATE INDEX idx_products_deleted_by ON public.products USING btree (deleted_by);

CREATE INDEX idx_products_name_trigram ON public.products USING gin (name public.gin_trgm_ops);

CREATE INDEX idx_products_store2_holding ON public.products USING btree (store2_holding_packages, store2_holding_units_loose) WHERE (deleted_at IS NULL);

CREATE INDEX idx_sales_delivery_user_id ON public.sales USING btree (delivery_user_id);

CREATE INDEX idx_sales_user_id ON public.sales USING btree (user_id);

CREATE INDEX idx_suppliers_created_by ON public.suppliers USING btree (created_by);

alter table "public"."batch_units" add constraint "batch_units_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.product_batches(id) not valid;

alter table "public"."batch_units" validate constraint "batch_units_batch_id_fkey";

alter table "public"."batch_units" add constraint "batch_units_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public.products(id) not valid;

alter table "public"."batch_units" validate constraint "batch_units_product_id_fkey";

alter table "public"."expiry_alerts" add constraint "expiry_alerts_status_check" CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('resolved'::character varying)::text, ('ignored'::character varying)::text]))) not valid;

alter table "public"."expiry_alerts" validate constraint "expiry_alerts_status_check";

alter table "public"."inventory_movements" add constraint "inventory_movements_related_sale_id_fkey" FOREIGN KEY (related_sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_related_sale_id_fkey";

alter table "public"."inventory_movements" add constraint "inventory_movements_sale_id_fkey" FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."inventory_movements" validate constraint "inventory_movements_sale_id_fkey";

alter table "public"."nps_surveys" add constraint "nps_surveys_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES public.customers(id) not valid;

alter table "public"."nps_surveys" validate constraint "nps_surveys_customer_id_fkey";

alter table "public"."nps_surveys" add constraint "nps_surveys_sale_id_fkey" FOREIGN KEY (sale_id) REFERENCES public.sales(id) not valid;

alter table "public"."nps_surveys" validate constraint "nps_surveys_sale_id_fkey";

alter table "public"."sale_items" add constraint "sale_items_sale_id_fkey" FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE not valid;

alter table "public"."sale_items" validate constraint "sale_items_sale_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_quick_customer(p_name text, p_phone text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_customer_id uuid;
BEGIN
  INSERT INTO customers (name, phone, created_at, updated_at)
  VALUES (p_name, p_phone, NOW(), NOW())
  RETURNING id INTO v_customer_id;
  
  RETURN v_customer_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.fn_tgr_deduct_stock()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_has_unit_tracking BOOLEAN;
  v_has_package_tracking BOOLEAN;
  v_movement_type TEXT;
  v_quantity_change INTEGER;
BEGIN
    -- 1. Get product tracking flags
    SELECT has_unit_tracking, has_package_tracking
    INTO v_has_unit_tracking, v_has_package_tracking
    FROM products
    WHERE id = NEW.product_id;

    -- 2. Determine movement type based on sale_item
    IF NEW.sale_type = 'package' THEN
        -- Check Logic for Package
        IF v_has_package_tracking IS NOT TRUE THEN
            RETURN NEW; 
        END IF;
        v_movement_type := 'package';
        v_quantity_change := -(NEW.quantity); -- Deduct bundles
    ELSE
        -- Check Logic for Units
        IF v_has_unit_tracking IS NOT TRUE THEN
            RETURN NEW; 
        END IF;
        v_movement_type := 'unit';
        v_quantity_change := -(NEW.quantity); -- Deduct units
    END IF;

    -- 3. Call inventory movement
    PERFORM create_inventory_movement(
        NEW.product_id,
        v_quantity_change,
        'sale'::movement_type,
        'Venda Automática - Sale #' || NEW.sale_id,
        jsonb_build_object(
            'sale_id', NEW.sale_id,
            'source', 'trigger_deduct_stock',
            'sale_type', COALESCE(NEW.sale_type, 'unit')
        ),
        v_movement_type
    );

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_customer_summary(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS TABLE(total_customers bigint, new_customers bigint, active_customers bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        -- 1. Total Customers (Base total histórica)
        (SELECT count(*) FROM customers WHERE deleted_at IS NULL)::bigint,
        
        -- 2. New Customers (Cadastrados no período)
        (SELECT count(*) FROM customers WHERE created_at BETWEEN start_date AND end_date AND deleted_at IS NULL)::bigint,
        
        -- 3. Active Customers (Compraram no período)
        (SELECT count(DISTINCT customer_id) FROM sales WHERE created_at BETWEEN start_date AND end_date AND customer_id IS NOT NULL AND status = 'completed')::bigint;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_role_safe()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT role::text
    FROM public.profiles
    WHERE id = auth.uid()
    LIMIT 1
  );
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_sale(p_customer_id uuid, p_user_id uuid, p_items jsonb[], p_total_amount numeric, p_final_amount numeric, p_payment_method_id uuid, p_discount_amount numeric DEFAULT 0, p_notes text DEFAULT ''::text, p_is_delivery boolean DEFAULT false, p_delivery_type text DEFAULT 'presencial'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_payment_method_name TEXT;
    v_product_id UUID;
    v_quantity_to_subtract INTEGER;
    v_sale_type TEXT;
    v_current_packages INTEGER;
    v_current_units INTEGER;
BEGIN
    -- Definir contexto RPC
    PERFORM set_config('app.called_from_rpc', 'true', true);

    -- 1. Validações e Criação da Venda
    SELECT name INTO v_payment_method_name FROM payment_methods WHERE id = p_payment_method_id LIMIT 1;
    IF v_payment_method_name IS NULL THEN v_payment_method_name := 'Outro'; END IF;

    IF p_final_amount < 0 THEN RAISE EXCEPTION 'Valor final não pode ser negativo'; END IF;

    INSERT INTO sales (customer_id, user_id, total_amount, discount_amount, final_amount, payment_method, payment_status, status, notes, delivery, delivery_type)
    VALUES (p_customer_id, p_user_id, p_total_amount, p_discount_amount, p_final_amount, v_payment_method_name, 'paid', 'completed', p_notes, p_is_delivery, p_delivery_type)
    RETURNING id INTO v_sale_id;

    -- 2. Processar Itens (LOOP)
    FOREACH v_item IN ARRAY p_items
    LOOP
        v_product_id := (v_item->>'product_id')::uuid;
        v_quantity_to_subtract := (v_item->>'quantity')::INTEGER;
        v_sale_type := COALESCE(v_item->>'sale_type', 'unit'); -- Default 'unit'

        -- Registrar Item na Tabela sale_items
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal, sale_type)
        VALUES (
            v_sale_id,
            v_product_id,
            v_quantity_to_subtract,
            (v_item->>'unit_price')::NUMERIC,
            ((v_item->>'unit_price')::NUMERIC * v_quantity_to_subtract),
            v_sale_type
        );

         -- 3. Baixa de Estoque (Unit vs Package)
        IF v_sale_type = 'package' THEN
            -- [ROTA PACOTE]: Baixa de stock_packages
            PERFORM create_inventory_movement(
                v_product_id,
                -v_quantity_to_subtract, -- Negativo para saída
                'sale'::movement_type,
                'Venda de pacote - Sale #' || v_sale_id,
                jsonb_build_object(
                    'sale_id', v_sale_id,
                    'units_subtracted', v_quantity_to_subtract,
                    'source', 'process_sale',
                    'unit_type', 'package',
                    'payment_method', v_payment_method_name
                ),
                'package' -- <== CRITICAL: Route to package stock
            );
        ELSE
            -- [ROTA UNIDADE]: Baixa de stock_units_loose
            PERFORM create_inventory_movement(
                v_product_id,
                -v_quantity_to_subtract, -- Negativo para saída
                'sale'::movement_type,
                'Venda de unidades - Sale #' || v_sale_id,
                jsonb_build_object(
                    'sale_id', v_sale_id,
                    'units_subtracted', v_quantity_to_subtract,
                    'source', 'process_sale',
                    'unit_type', 'unit',
                    'payment_method', v_payment_method_name
                ),
                'unit' -- <== CRITICAL: Route to unit stock
            );
        END IF;

    END LOOP;

    -- Recalcular insights (Opcional, ignorar erro se func não existir)
    BEGIN PERFORM recalc_customer_insights(p_customer_id); EXCEPTION WHEN OTHERS THEN NULL; END;

    RETURN jsonb_build_object('sale_id', v_sale_id, 'status', 'success');
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao processar venda: %', SQLERRM;
END;
$function$
;

create or replace view "public"."vw_kyrie_intelligence_margins" as  SELECT p.name AS product_name,
    p.category AS category_name,
    count(si.id) AS times_sold,
    sum(si.quantity) AS total_units_sold,
    sum(((si.quantity)::numeric * si.unit_price)) AS total_revenue,
    sum(((si.quantity)::numeric * COALESCE(p.cost_price, (0)::numeric))) AS total_cost,
    (sum(((si.quantity)::numeric * si.unit_price)) - sum(((si.quantity)::numeric * COALESCE(p.cost_price, (0)::numeric)))) AS gross_profit,
        CASE
            WHEN (sum(((si.quantity)::numeric * si.unit_price)) > (0)::numeric) THEN round((((sum(((si.quantity)::numeric * si.unit_price)) - sum(((si.quantity)::numeric * COALESCE(p.cost_price, (0)::numeric)))) / sum(((si.quantity)::numeric * si.unit_price))) * (100)::numeric), 2)
            ELSE (0)::numeric
        END AS margin_percent
   FROM ((public.sale_items si
     JOIN public.products p ON ((si.product_id = p.id)))
     JOIN public.sales s ON ((si.sale_id = s.id)))
  WHERE ((s.status_enum = 'completed'::public.sales_status_enum) AND (s.created_at >= (CURRENT_DATE - '60 days'::interval)))
  GROUP BY p.id, p.name, p.category
  ORDER BY (sum(((si.quantity)::numeric * si.unit_price)) - sum(((si.quantity)::numeric * COALESCE(p.cost_price, (0)::numeric)))) DESC;


CREATE OR REPLACE FUNCTION public.create_historical_sale(p_customer_id uuid, p_user_id uuid, p_items jsonb, p_total_amount numeric, p_payment_method text, p_sale_date timestamp with time zone, p_notes text DEFAULT NULL::text, p_delivery boolean DEFAULT false, p_delivery_fee numeric DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_final_amount NUMERIC;
  v_items_count INTEGER := 0;
  v_customer_name TEXT;
  v_package_units INTEGER;
BEGIN
  -- ================================================================
  -- VALIDAÇÕES INICIAIS
  -- ================================================================
  
  -- Validar que o cliente existe
  SELECT name INTO v_customer_name FROM customers WHERE id = p_customer_id;
  IF v_customer_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cliente não encontrado'
    );
  END IF;
  
  -- Validar que há itens
  IF jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'A venda deve ter pelo menos 1 item'
    );
  END IF;
  
  -- Calcular valor final
  v_final_amount := p_total_amount;
  
  -- ================================================================
  -- INSERIR VENDA PRINCIPAL (SEM process_sale)
  -- ================================================================
  
  INSERT INTO sales (
    customer_id,
    user_id,
    total_amount,
    discount_amount,
    final_amount,
    payment_method,
    payment_status,
    status,
    delivery,
    delivery_fee,
    delivery_type,
    notes,
    created_at,
    updated_at
  ) VALUES (
    p_customer_id,
    p_user_id,
    p_total_amount,
    0, -- sem desconto
    v_final_amount,
    p_payment_method,
    'paid', -- sempre paga (histórica)
    'completed', -- sempre completada
    p_delivery,
    p_delivery_fee,
    CASE WHEN p_delivery THEN 'delivery' ELSE 'presencial' END,
    COALESCE(p_notes, 'Venda histórica - importação manual'),
    p_sale_date, -- Data customizada (backdating)
    p_sale_date  -- updated_at também usa data histórica
  ) RETURNING id INTO v_sale_id;
  
  -- ================================================================
  -- INSERIR ITENS DA VENDA (COM package_units)
  -- ================================================================
  
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    -- Validar que o produto existe
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = (v_item->>'product_id')::UUID) THEN
      RAISE EXCEPTION 'Produto não encontrado: %', (v_item->>'product_id');
    END IF;
    
    -- ✅ CORREÇÃO: Buscar package_units do item ou usar 1 como padrão
    v_package_units := COALESCE((v_item->>'package_units')::INTEGER, 1);
    
    INSERT INTO sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      sale_type,
      package_units,  -- ✅ CORREÇÃO: Incluir package_units
      created_at
    ) VALUES (
      v_sale_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      COALESCE(v_item->>'sale_type', 'unit'),
      v_package_units,  -- ✅ CORREÇÃO: Salvar package_units
      p_sale_date -- Mesmo timestamp da venda
    );
    
    v_items_count := v_items_count + 1;
  END LOOP;
  
  -- ================================================================
  -- IMPORTANTE: NÃO CRIAR inventory_movements
  -- Isso garante que o estoque permanece intocado
  -- Os triggers automáticos (update_customer_after_sale, etc) 
  -- vão atualizar as métricas do cliente normalmente
  -- ================================================================
  
  -- Log de sucesso
  RAISE NOTICE 'Venda histórica criada: % (cliente: %, itens: %, data: %)', 
    v_sale_id, v_customer_name, v_items_count, p_sale_date;
  
  -- ================================================================
  -- RETORNAR RESULTADO
  -- ================================================================
  
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', v_sale_id,
    'customer_name', v_customer_name,
    'items_count', v_items_count,
    'total_amount', p_total_amount,
    'sale_date', p_sale_date,
    'message', format('Venda histórica criada com sucesso (%s itens)', v_items_count),
    'warning', 'Esta venda NÃO afetou o estoque (como esperado)'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log de erro
    RAISE LOG 'Erro ao criar venda histórica: % - %', SQLERRM, SQLSTATE;
    
    -- Retornar erro estruturado
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_sale_with_items(p_customer_id uuid, p_items jsonb, p_payment_method_id uuid, p_total_amount numeric, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_sale_id uuid;
  v_item record;
begin
  -- Insert the sale record without seller_id
  insert into public.sales (
    customer_id,
    payment_method_id,
    total_amount,
    final_amount,
    payment_status,
    status,
    notes
  ) values (
    p_customer_id,
    p_payment_method_id,
    p_total_amount,
    p_total_amount, -- Assuming no discount for now
    'pending',
    'completed',
    p_notes
  )
  returning id into v_sale_id;

  -- Insert sale items
  for v_item in select * from jsonb_to_recordset(p_items) as x(
    product_id uuid,
    quantity integer,
    unit_price numeric
  )
  loop
    insert into public.sale_items (
      sale_id,
      product_id,
      quantity,
      unit_price,
      subtotal
    ) values (
      v_sale_id,
      v_item.product_id,
      v_item.quantity,
      v_item.unit_price,
      v_item.quantity * v_item.unit_price
    );

    -- Update product stock (if you have a stock column)
    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;
  end loop;

  return v_sale_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_sale_with_items(p_sale_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_item RECORD;
BEGIN
    -- 1. Restore stock for each sale item
    FOR v_item IN 
        SELECT 
            product_id, 
            quantity, 
            sale_type 
        FROM sale_items 
        WHERE sale_id = p_sale_id
    LOOP
        PERFORM create_inventory_movement(
            v_item.product_id,
            v_item.quantity,
            'return'::movement_type,
            'Cancelamento de venda ' || p_sale_id::text,
            jsonb_build_object(
                'sale_id', p_sale_id,
                'action', 'delete_sale_restore',
                'fixed_by', 'fix_fk_prod_strict',
                'original_sale_type', COALESCE(v_item.sale_type, 'unit')
            ),
            COALESCE(v_item.sale_type, 'unit')::text
        );
    END LOOP;

    -- 2. Explicitly unlink inventory movements
    UPDATE inventory_movements 
    SET sale_id = NULL, related_sale_id = NULL 
    WHERE sale_id = p_sale_id OR related_sale_id = p_sale_id;

    -- 3. Cleanup related records blocking deletion (NO ACTION constraints)
    DELETE FROM accounts_receivable WHERE sale_id = p_sale_id;
    DELETE FROM customer_interactions WHERE associated_sale_id = p_sale_id;
    DELETE FROM nps_surveys WHERE sale_id = p_sale_id;
    
    -- 4. Delete sale items explicitly
    DELETE FROM sale_items WHERE sale_id = p_sale_id;

    -- 5. Delete the sale
    DELETE FROM sales WHERE id = p_sale_id;
END;
$function$
;

create or replace view "public"."dual_stock_summary" as  SELECT 'Produtos com Pacotes'::text AS category,
    count(*) AS count,
    sum(products.stock_packages) AS total_packages,
    sum((products.stock_packages * COALESCE(products.package_units, 1))) AS total_units_in_packages
   FROM public.products
  WHERE (products.stock_packages > 0)
UNION ALL
 SELECT 'Produtos com Unidades Soltas'::text AS category,
    count(*) AS count,
    0 AS total_packages,
    sum(products.stock_units_loose) AS total_units_in_packages
   FROM public.products
  WHERE (products.stock_units_loose > 0)
UNION ALL
 SELECT 'Total Geral'::text AS category,
    count(*) AS count,
    sum(products.stock_packages) AS total_packages,
    sum(products.stock_quantity) AS total_units_in_packages
   FROM public.products
  WHERE (products.stock_quantity > 0);


CREATE OR REPLACE FUNCTION public.fn_log_sale_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.customer_events (customer_id, source, source_id, payload)
  VALUES (NEW.customer_id, 'sale', NEW.id, to_jsonb(NEW));
  RETURN NEW;
END$function$
;

CREATE OR REPLACE FUNCTION public.get_crm_trends_new_customers()
 RETURNS TABLE(month integer, year integer, new_customers integer, active_customers integer, avg_ltv numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  WITH monthly_data AS (
    -- Dados dos últimos 6 meses
    SELECT 
      DATE_PART('month', generate_series::date) as month_num,
      DATE_PART('year', generate_series::date) as year_num,
      generate_series::date as month_start
    FROM generate_series(
      DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months'),
      DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Sao_Paulo'),
      INTERVAL '1 month'
    )
  ),
  new_customers_per_month AS (
    SELECT 
      DATE_PART('month', created_at AT TIME ZONE 'America/Sao_Paulo') as month_num,
      DATE_PART('year', created_at AT TIME ZONE 'America/Sao_Paulo') as year_num,
      COUNT(*) as new_count
    FROM customers
    WHERE created_at >= DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months')
    GROUP BY 1, 2
  ),
  active_customers_per_month AS (
    SELECT 
      DATE_PART('month', last_purchase_date AT TIME ZONE 'America/Sao_Paulo') as month_num,
      DATE_PART('year', last_purchase_date AT TIME ZONE 'America/Sao_Paulo') as year_num,
      COUNT(*) as active_count,
      AVG(lifetime_value) as avg_ltv_val
    FROM customers
    WHERE last_purchase_date IS NOT NULL
      AND last_purchase_date >= DATE_TRUNC('month', (NOW() AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '5 months')
    GROUP BY 1, 2
  )
  SELECT 
    md.month_num::INTEGER,
    md.year_num::INTEGER,
    COALESCE(nc.new_count, 0)::INTEGER as new_customers,
    COALESCE(ac.active_count, 0)::INTEGER as active_customers,
    COALESCE(ac.avg_ltv_val, 0)::NUMERIC(10,2) as avg_ltv
  FROM monthly_data md
  LEFT JOIN new_customers_per_month nc ON md.month_num = nc.month_num AND md.year_num = nc.year_num
  LEFT JOIN active_customers_per_month ac ON md.month_num = ac.month_num AND md.year_num = ac.year_num
  ORDER BY md.year_num, md.month_num;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_customer_retention(start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS TABLE(period text, retained bigint, lost bigint)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  WITH monthly_activity AS (
    SELECT 
      TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') as period,
      COUNT(DISTINCT s.customer_id) as active_customers,
      COUNT(s.id) as total_sales
    FROM sales s
    WHERE s.created_at BETWEEN start_date AND end_date
      AND s.status = 'completed'
      AND s.final_amount > 0
    GROUP BY TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
  ),
  baseline AS (
    SELECT COUNT(DISTINCT id) as total_customers 
    FROM customers 
    WHERE created_at <= end_date
  )
  SELECT 
    ma.period,
    ma.active_customers as retained,
    (SELECT total_customers FROM baseline) - ma.active_customers as lost
  FROM monthly_activity ma
  
  UNION ALL
  
  -- Add periods with no activity but show progression
  SELECT 
    TO_CHAR(date_series, 'YYYY-MM') as period,
    0 as retained,
    (SELECT total_customers FROM baseline) as lost
  FROM generate_series(
    DATE_TRUNC('month', start_date AT TIME ZONE 'America/Sao_Paulo'),
    DATE_TRUNC('month', end_date AT TIME ZONE 'America/Sao_Paulo'),
    INTERVAL '1 month'
  ) as date_series
  WHERE TO_CHAR(date_series, 'YYYY-MM') NOT IN (
    SELECT TO_CHAR(s.created_at AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM')
    FROM sales s
    WHERE s.created_at BETWEEN start_date AND end_date
      AND s.status = 'completed'
      AND s.final_amount > 0
  )
  
  ORDER BY period;
$function$
;

CREATE OR REPLACE FUNCTION public.get_delivery_trends(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(date text, delivery_orders bigint, delivery_revenue numeric, instore_orders bigint, instore_revenue numeric, total_orders bigint, total_sales numeric)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN QUERY
    WITH date_series AS (
        SELECT generate_series(p_start_date, p_end_date, '1 day'::interval)::date AS day
    ),
    daily_sales AS (
        SELECT
            -- FIX: Convert to Brazil Time before truncating to day
            date_trunc('day', created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS sale_day,
            COUNT(*) FILTER (WHERE delivery_type = 'delivery') AS delivery_count,
            COALESCE(SUM(final_amount) FILTER (WHERE delivery_type = 'delivery'), 0) AS delivery_amount,
            COUNT(*) FILTER (WHERE delivery_type = 'presencial' OR delivery = false) AS instore_count,
            COALESCE(SUM(final_amount) FILTER (WHERE delivery_type = 'presencial' OR delivery = false), 0) AS instore_amount,
            COUNT(*) AS total_count,
            COALESCE(SUM(final_amount), 0) AS total_amount
        FROM sales
        WHERE created_at >= p_start_date AND created_at <= p_end_date
        AND status = 'completed'
        GROUP BY 1
    )
    SELECT
        to_char(ds.day, 'DD/MM') as date,
        COALESCE(s.delivery_count, 0) as delivery_orders,
        COALESCE(s.delivery_amount, 0) as delivery_revenue,
        COALESCE(s.instore_count, 0) as instore_orders,
        COALESCE(s.instore_amount, 0) as instore_revenue,
        COALESCE(s.total_count, 0) as total_orders,
        COALESCE(s.total_amount, 0) as total_sales
    FROM date_series ds
    LEFT JOIN daily_sales s ON ds.day = s.sale_day
    ORDER BY ds.day;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_inventory_summary(start_date timestamp with time zone, end_date timestamp with time zone, period_type text DEFAULT 'day'::text)
 RETURNS TABLE(period_start text, period_label text, products_sold bigint, products_added bigint, out_of_stock bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    WITH periods AS (
        SELECT date_trunc(period_type, dd AT TIME ZONE 'America/Sao_Paulo')::date as period_start
        FROM generate_series(start_date, end_date, '1 day'::interval) dd
        GROUP BY 1
    ),
    inventory_data AS (
        SELECT
            date_trunc(period_type, date AT TIME ZONE 'America/Sao_Paulo')::date as period_start,
            SUM(CASE WHEN type = 'OUT' THEN quantity ELSE 0 END) as products_sold,
            SUM(CASE WHEN type = 'IN' THEN quantity ELSE 0 END) as products_added
        FROM inventory_movements
        WHERE date BETWEEN start_date AND end_date
        GROUP BY 1
    ),
    stock_status AS (
        SELECT
            date_trunc(period_type, created_at AT TIME ZONE 'America/Sao_Paulo')::date as period_start,
            COUNT(*) as out_of_stock
        FROM products
        WHERE (stock_packages * units_per_package + stock_units_loose) = 0
        GROUP BY 1
    )
    SELECT
        to_char(p.period_start, 'YYYY-MM-DD') as period_start,
        CASE 
            WHEN period_type = 'day' THEN to_char(p.period_start, 'DD/MM/YYYY')
            WHEN period_type = 'week' THEN 'Semana ' || to_char(p.period_start, 'IYYY-W"IW"')
            WHEN period_type = 'month' THEN to_char(p.period_start, 'MM/YYYY')
            WHEN period_type = 'quarter' THEN 'T' || to_char(p.period_start, 'Q/YYYY')
            ELSE to_char(p.period_start, 'DD/MM/YYYY')
        END AS period_label,
        COALESCE(id.products_sold, 0)::bigint as products_sold,
        COALESCE(id.products_added, 0)::bigint as products_added,
        COALESCE(ss.out_of_stock, 0)::bigint as out_of_stock
    FROM periods p
    LEFT JOIN inventory_data id ON p.period_start = id.period_start
    LEFT JOIN stock_status ss ON p.period_start = ss.period_start
    ORDER BY p.period_start;
$function$
;

CREATE OR REPLACE FUNCTION public.get_nps_trend(months_back integer DEFAULT 12)
 RETURNS TABLE(month_year text, nps_score integer, responses integer, avg_score numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo'), 'YYYY-MM') as month_year,
        -- Calcular NPS para o mês
        (
            SELECT 
                ROUND(
                    ((COUNT(*) FILTER (WHERE score >= 9)::NUMERIC / COUNT(*)::NUMERIC) * 100) -
                    ((COUNT(*) FILTER (WHERE score <= 6)::NUMERIC / COUNT(*)::NUMERIC) * 100)
                )::INTEGER
            FROM nps_surveys ns2 
            WHERE DATE_TRUNC('month', ns2.response_date AT TIME ZONE 'America/Sao_Paulo') = DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo')
        ) as nps_score,
        COUNT(*)::INTEGER as responses,
        ROUND(AVG(ns.score), 1) as avg_score
    FROM nps_surveys ns
    WHERE ns.response_date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo') - INTERVAL '1 month' * months_back)
    GROUP BY DATE_TRUNC('month', ns.response_date AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY month_year DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_sales_chart_data(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
 RETURNS TABLE(sale_date date, period_label text, total_revenue numeric, total_orders integer, delivery_revenue numeric, delivery_orders integer, presencial_revenue numeric, presencial_orders integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN QUERY
  WITH daily_sales AS (
    SELECT
      -- Agrupar por dia em timezone São Paulo
      (s.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE as day_date,
      
      -- Delivery: delivery_status = 'delivered' (entrega concluída)
      CASE 
        WHEN (s.delivery_type = 'delivery' OR s.delivery = true)
             AND s.delivery_status = 'delivered'
        THEN s.final_amount
        ELSE 0
      END as delivery_amount,
      
      CASE 
        WHEN (s.delivery_type = 'delivery' OR s.delivery = true)
             AND s.delivery_status = 'delivered'
        THEN 1
        ELSE 0
      END as delivery_count,
      
      -- Presencial: status = 'completed' (venda paga)
      CASE 
        WHEN (s.delivery_type = 'presencial' OR (s.delivery = false AND s.delivery_type IS NULL))
             AND s.status = 'completed'
        THEN s.final_amount
        ELSE 0
      END as presencial_amount,
      
      CASE 
        WHEN (s.delivery_type = 'presencial' OR (s.delivery = false AND s.delivery_type IS NULL))
             AND s.status = 'completed'
        THEN 1
        ELSE 0
      END as presencial_count
      
    FROM sales s
    WHERE 
      -- Filtro de período
      s.created_at >= p_start_date
      AND s.created_at <= p_end_date
      -- Excluir canceladas e devolvidas
      AND s.status NOT IN ('cancelled', 'returned')
      -- Apenas vendas com valor
      AND s.final_amount IS NOT NULL
      AND s.final_amount > 0
  )
  SELECT
    ds.day_date as sale_date,
    -- Label formatado: DD/MM
    TO_CHAR(ds.day_date, 'DD/MM') as period_label,
    -- Totais por dia
    COALESCE(SUM(ds.delivery_amount + ds.presencial_amount), 0)::NUMERIC as total_revenue,
    COALESCE(SUM(ds.delivery_count + ds.presencial_count), 0)::INTEGER as total_orders,
    -- Breakdown delivery
    COALESCE(SUM(ds.delivery_amount), 0)::NUMERIC as delivery_revenue,
    COALESCE(SUM(ds.delivery_count), 0)::INTEGER as delivery_orders,
    -- Breakdown presencial
    COALESCE(SUM(ds.presencial_amount), 0)::NUMERIC as presencial_revenue,
    COALESCE(SUM(ds.presencial_count), 0)::INTEGER as presencial_orders
  FROM daily_sales ds
  GROUP BY ds.day_date
  ORDER BY ds.day_date ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_stock_report_by_category()
 RETURNS TABLE(category text, total_products bigint, total_units bigint, total_value numeric, avg_price numeric, percentage_of_total numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  total_portfolio_value NUMERIC;
BEGIN
  -- Calcular valor total do portfólio (Custo)
  SELECT SUM(
    (COALESCE(stock_packages, 0) * COALESCE(units_per_package, 1) + COALESCE(stock_units_loose, 0)) * COALESCE(cost_price, 0)
  ) INTO total_portfolio_value
  FROM products 
  WHERE deleted_at IS NULL;

  RETURN QUERY
  WITH base_data AS (
    SELECT 
      p.category::TEXT as cat,
      COUNT(*)::BIGINT as total_prod,
      SUM(COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0))::BIGINT as total_un,
      SUM(
        (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) * COALESCE(p.cost_price, 0)
      ) as total_val,
      AVG(p.price) as avg_pr, -- Mantendo preço de venda médio para referência
      CASE 
        WHEN total_portfolio_value > 0 THEN 
          (SUM(
            (COALESCE(p.stock_packages, 0) * COALESCE(p.units_per_package, 1) + COALESCE(p.stock_units_loose, 0)) * COALESCE(p.cost_price, 0)
          ) / total_portfolio_value * 100)
        ELSE 0
      END as raw_percentage
    FROM products p
    WHERE p.deleted_at IS NULL
    GROUP BY p.category
  ),
  with_adjusted_percentages AS (
    SELECT 
      *,
      CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY total_val DESC) = COUNT(*) OVER () THEN
          100.00 - SUM(ROUND(raw_percentage, 2)) OVER () + ROUND(raw_percentage, 2)
        ELSE
          ROUND(raw_percentage, 2)
      END as adjusted_percentage
    FROM base_data
  )
  SELECT 
    cat,
    total_prod,
    total_un,
    total_val,
    avg_pr,
    adjusted_percentage
  FROM with_adjusted_percentages
  ORDER BY total_val DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_top_products(start_date timestamp with time zone, end_date timestamp with time zone, limit_count integer)
 RETURNS TABLE(product_name text, total_sold bigint)
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT p.name, SUM(si.quantity) FROM sales s
  JOIN sale_items si ON s.id = si.sale_id
  JOIN products p ON si.product_id = p.id
  WHERE s.created_at BETWEEN start_date AND end_date
  GROUP BY p.name ORDER BY 2 DESC LIMIT limit_count;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_product_cost_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Only proceed if cost_price actually changed
    IF OLD.cost_price IS DISTINCT FROM NEW.cost_price THEN
        -- Close the previous cost record by setting valid_to to just before now
        UPDATE product_cost_history 
        SET valid_to = NOW() - INTERVAL '1 second'
        WHERE product_id = OLD.id 
        AND valid_to IS NULL;
        
        -- Insert new cost record
        INSERT INTO product_cost_history (
            product_id,
            cost_price,
            valid_from,
            valid_to,
            created_by,
            reason
        ) VALUES (
            NEW.id,
            NEW.cost_price,
            NOW(),
            NULL,
            auth.uid(),
            'Product cost updated via trigger'
        );
        
        -- Log the change in audit_logs (using correct column names)
        INSERT INTO audit_logs (
            table_name,
            action,
            old_data,
            new_data,
            user_id,
            ip_address
        ) VALUES (
            'products',
            'UPDATE_COST',
            jsonb_build_object('cost_price', OLD.cost_price),
            jsonb_build_object('cost_price', NEW.cost_price),
            auth.uid(),
            inet_client_addr()
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.hard_delete_customer(p_customer_id uuid, p_user_id uuid, p_confirmation_text text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_customer_name TEXT;
  v_sales_count INTEGER;
  v_user_role TEXT;
BEGIN
  -- Verificar se é admin
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;
  
  IF v_user_role != 'admin' THEN
    RAISE EXCEPTION 'Apenas administradores podem realizar exclusão permanente';
  END IF;
  
  -- Validar texto de confirmação
  IF p_confirmation_text != 'EXCLUIR PERMANENTEMENTE' THEN
    RAISE EXCEPTION 'Texto de confirmação inválido';
  END IF;
  
  -- Buscar informações do cliente
  SELECT name INTO v_customer_name
  FROM customers
  WHERE id = p_customer_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Cliente não encontrado';
  END IF;
  
  -- Contar vendas (serão preservadas com customer_id NULL)
  SELECT COUNT(*)
  INTO v_sales_count
  FROM sales
  WHERE customer_id = p_customer_id;
  
  -- Registrar no audit log ANTES de deletar usando new_data
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    new_data,
    user_id,
    created_at
  ) VALUES (
    'customers',
    p_customer_id,
    'hard_delete',
    jsonb_build_object(
      'customer_name', v_customer_name,
      'sales_count', v_sales_count,
      'confirmation_text', p_confirmation_text
    ),
    p_user_id,
    NOW()
  );
  
  -- Desvincular vendas (manter vendas para fins fiscais)
  UPDATE sales
  SET customer_id = NULL
  WHERE customer_id = p_customer_id;
  
  -- Deletar permanentemente
  DELETE FROM customers WHERE id = p_customer_id;
  
  -- Retornar resultado
  RETURN json_build_object(
    'success', true,
    'message', 'Cliente excluído permanentemente',
    'customer_name', v_customer_name,
    'sales_count', v_sales_count
  );
END;
$function$
;

create or replace view "public"."product_movement_history" as  SELECT im.id,
    im.date,
    (im.type_enum)::text AS type,
    abs(im.quantity_change) AS quantity,
    im.reason,
    'system'::text AS source,
    im.previous_stock,
    im.new_stock_quantity AS new_stock,
    im.reason AS notes,
    p.name AS product_name,
    p.category AS product_category,
    u.name AS user_name,
    u.role AS user_role,
    im.quantity_change AS stock_change,
        CASE
            WHEN (im.type_enum = 'stock_transfer_in'::public.movement_type) THEN 'Entrada'::text
            WHEN (im.type_enum = 'initial_stock'::public.movement_type) THEN 'Estoque Inicial'::text
            WHEN (im.type_enum = 'stock_transfer_out'::public.movement_type) THEN 'Saída'::text
            WHEN (im.type_enum = 'sale'::public.movement_type) THEN 'Venda'::text
            WHEN (im.type_enum = 'inventory_adjustment'::public.movement_type) THEN 'Ajuste'::text
            WHEN (im.type_enum = 'return'::public.movement_type) THEN 'Devolução'::text
            WHEN (im.type_enum = 'personal_consumption'::public.movement_type) THEN 'Consumo Pessoal'::text
            ELSE (im.type_enum)::text
        END AS type_display,
        CASE
            WHEN (im.quantity_change > 0) THEN 'success'::text
            WHEN (im.quantity_change < 0) THEN 'error'::text
            ELSE 'default'::text
        END AS type_variant
   FROM ((public.inventory_movements im
     LEFT JOIN public.products p ON ((im.product_id = p.id)))
     LEFT JOIN public.profiles u ON ((im.user_id = u.id)))
  ORDER BY im.date DESC;


CREATE OR REPLACE FUNCTION public.set_product_stock_absolute(p_product_id uuid, p_new_packages integer, p_new_units_loose integer, p_reason text, p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    v_old_packages INTEGER;
    v_old_units_loose INTEGER;
    v_units_per_package INTEGER;
    v_package_change INTEGER;
    v_units_change INTEGER;
    v_total_unit_change INTEGER;
    v_product_name TEXT;
    v_movement_type movement_type;
    v_result JSON;
BEGIN
    PERFORM set_config('app.called_from_rpc', 'true', true);
    
    SELECT stock_packages, stock_units_loose, units_per_package, name
    INTO v_old_packages, v_old_units_loose, v_units_per_package, v_product_name
    FROM products WHERE id = p_product_id;
    
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto com ID % não encontrado', p_product_id; END IF;
    IF p_new_packages < 0 OR p_new_units_loose < 0 THEN RAISE EXCEPTION 'Valores de estoque não podem ser negativos.'; END IF;
    
    v_package_change := p_new_packages - COALESCE(v_old_packages, 0);
    v_units_change := p_new_units_loose - COALESCE(v_old_units_loose, 0);
    v_total_unit_change := (v_package_change * COALESCE(v_units_per_package, 1)) + v_units_change;
    
    IF v_package_change != 0 OR v_units_change != 0 THEN
        v_movement_type := 'inventory_adjustment'::movement_type;
        -- FIX DEV: Only insert into columns that exist in DEV (type_enum, quantity_change)
        INSERT INTO inventory_movements (
            product_id, type_enum, quantity_change, reason, user_id, date
        ) VALUES (
            p_product_id, 
            v_movement_type,        -- type_enum (enum)
            v_total_unit_change,    -- quantity_change (integer)
            p_reason, p_user_id, NOW()
        );
    END IF;
    
    UPDATE products SET stock_packages = p_new_packages, stock_units_loose = p_new_units_loose, updated_at = NOW() WHERE id = p_product_id;
    
    v_result := jsonb_build_object(
        'success', true,
        'product_id', p_product_id,
        'product_name', v_product_name,
        'audit_recorded', (v_package_change != 0 OR v_units_change != 0),
        'timestamp', NOW()
    );
    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Erro em set_product_stock_absolute: % - %', SQLERRM, SQLSTATE;
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_delivery_status_to_sale_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Quando delivery_status muda para 'delivered', atualizar status da venda
  IF NEW.delivery_status = 'delivered' AND OLD.delivery_status != 'delivered' THEN
    NEW.status := 'completed';
  END IF;
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.sync_sales_enum_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Sync status
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IS NOT NULL THEN
        NEW.status_enum := CASE 
            WHEN NEW.status = 'completed' THEN 'completed'::sales_status_enum
            WHEN NEW.status = 'pending' THEN 'pending'::sales_status_enum
            WHEN NEW.status = 'cancelled' THEN 'cancelled'::sales_status_enum
            WHEN NEW.status = 'processing' THEN 'processing'::sales_status_enum
            WHEN NEW.status = 'refunded' THEN 'refunded'::sales_status_enum
            ELSE 'pending'::sales_status_enum
        END;
    END IF;
    
    -- Sync payment_method
    IF NEW.payment_method IS DISTINCT FROM OLD.payment_method AND NEW.payment_method IS NOT NULL THEN
        NEW.payment_method_enum := CASE 
            WHEN LOWER(NEW.payment_method) = 'cash' THEN 'cash'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'credit' THEN 'credit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'debit' THEN 'debit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'card' THEN 'credit'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'pix' THEN 'pix'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'bank_transfer' THEN 'bank_transfer'::payment_method_enum
            WHEN LOWER(NEW.payment_method) = 'check' THEN 'check'::payment_method_enum
            ELSE 'other'::payment_method_enum
        END;
    END IF;
    
    RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.transfer_to_store2_holding(p_product_id uuid, p_quantity_packages smallint DEFAULT 0, p_quantity_units smallint DEFAULT 0, p_user_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_product RECORD;
  v_result JSON;
BEGIN
  -- Validação de entrada
  IF p_quantity_packages < 0 OR p_quantity_units < 0 THEN
    RAISE EXCEPTION 'Quantidades não podem ser negativas';
  END IF;

  IF p_quantity_packages = 0 AND p_quantity_units = 0 THEN
    RAISE EXCEPTION 'Transfira pelo menos pacotes OU unidades';
  END IF;

  -- Lock do produto (evita race conditions)
  SELECT * INTO v_product
  FROM products
  WHERE id = p_product_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produto não encontrado ou deletado';
  END IF;

  -- Verificar estoque disponível (Loja 1 / Active Stock)
  IF v_product.stock_packages < p_quantity_packages THEN
    RAISE EXCEPTION 'Estoque insuficiente de pacotes. Disponível: %, Solicitado: %',
      v_product.stock_packages, p_quantity_packages;
  END IF;

  IF v_product.stock_units_loose < p_quantity_units THEN
    RAISE EXCEPTION 'Estoque insuficiente de unidades. Disponível: %, Solicitado: %',
      v_product.stock_units_loose, p_quantity_units;
  END IF;

  -- ✅ TRANSFERÊNCIA ATÔMICA: Loja 1 → Loja 2
  UPDATE products
  SET
    stock_packages = stock_packages - p_quantity_packages,
    stock_units_loose = stock_units_loose - p_quantity_units,
    store2_holding_packages = store2_holding_packages + p_quantity_packages,
    store2_holding_units_loose = store2_holding_units_loose + p_quantity_units,
    updated_at = NOW()
  WHERE id = p_product_id;

  -- ✅ FIX: Usar type_enum e quantity_change
  INSERT INTO inventory_movements (
    product_id,
    type_enum,
    quantity_change,
    reason,
    user_id,
    metadata
  )
  VALUES (
    p_product_id,
    'stock_transfer_out'::movement_type,
    -(p_quantity_packages + p_quantity_units),
    COALESCE(p_notes, 'Transferência para Loja 2 (Holding)'),
    p_user_id,
    jsonb_build_object(
      'transfer_type', 'store1_to_store2',
      'packages_moved', p_quantity_packages,
      'units_moved', p_quantity_units
    )
  );

  -- Resultado da operação
  v_result := json_build_object(
    'success', true,
    'product_id', p_product_id,
    'transferred', json_build_object(
      'packages', p_quantity_packages,
      'units', p_quantity_units
    ),
    'new_stock_active', json_build_object(
      'packages', v_product.stock_packages - p_quantity_packages,
      'units', v_product.stock_units_loose - p_quantity_units
    ),
    'new_stock_holding', json_build_object(
      'packages', v_product.store2_holding_packages + p_quantity_packages,
      'units', v_product.store2_holding_units_loose + p_quantity_units
    )
  );

  RETURN v_result;
END;
$function$
;

create or replace view "public"."v_customer_purchases" as  SELECT s.id AS purchase_id,
    s.customer_id,
    'sale'::text AS source,
    COALESCE(s.final_amount, s.total_amount, (0)::numeric) AS total,
    s.created_at,
    si.items
   FROM (public.sales s
     LEFT JOIN ( SELECT si_1.sale_id,
            jsonb_agg(jsonb_build_object('product_id', si_1.product_id, 'product_name', p.name, 'quantity', si_1.quantity, 'unit_price', si_1.unit_price)) AS items
           FROM (public.sale_items si_1
             JOIN public.products p ON ((p.id = si_1.product_id)))
          GROUP BY si_1.sale_id) si ON ((si.sale_id = s.id)));


create or replace view "public"."v_customer_stats" as  WITH agg AS (
         SELECT v_customer_purchases.customer_id,
            sum(v_customer_purchases.total) AS total_spent,
            max(v_customer_purchases.created_at) AS last_purchase
           FROM public.v_customer_purchases
          GROUP BY v_customer_purchases.customer_id
        )
 SELECT c.id AS customer_id,
    COALESCE(a.total_spent, (0)::numeric) AS total_spent,
    a.last_purchase
   FROM (public.customers c
     LEFT JOIN agg a ON ((a.customer_id = c.id)));



  create policy "Unified delete for batch_units"
  on "public"."batch_units"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified insert for batch_units"
  on "public"."batch_units"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified select for batch_units"
  on "public"."batch_units"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role, 'delivery'::public.user_role]))))));



  create policy "Unified update for batch_units"
  on "public"."batch_units"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Enable read access for all users"
  on "public"."categories"
  as permissive
  for select
  to public
using (true);



  create policy "Enable read/write for all"
  on "public"."customer_events"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Unified delete for customer_insights"
  on "public"."customer_insights"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for customer_insights"
  on "public"."customer_insights"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for customer_insights"
  on "public"."customer_insights"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for customer_insights"
  on "public"."customer_insights"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified all for customers"
  on "public"."customers"
  as permissive
  for all
  to authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'delivery'::public.user_role))))));



  create policy "Unified insert for delivery_tracking"
  on "public"."delivery_tracking"
  as permissive
  for insert
  to authenticated
with check ((((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'delivery'::public.user_role)))) AND (created_by = ( SELECT auth.uid() AS uid))) OR (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role])))))));



  create policy "Unified select for delivery_tracking"
  on "public"."delivery_tracking"
  as permissive
  for select
  to authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))) OR (EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = delivery_tracking.sale_id) AND (sales.delivery_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Unified all for delivery_zones"
  on "public"."delivery_zones"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified delete for expense_budgets"
  on "public"."expense_budgets"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for expense_budgets"
  on "public"."expense_budgets"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for expense_budgets"
  on "public"."expense_budgets"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for expense_budgets"
  on "public"."expense_budgets"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified delete for expense_categories"
  on "public"."expense_categories"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for expense_categories"
  on "public"."expense_categories"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for expense_categories"
  on "public"."expense_categories"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for expense_categories"
  on "public"."expense_categories"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified delete for expiry_alerts"
  on "public"."expiry_alerts"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for expiry_alerts"
  on "public"."expiry_alerts"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for expiry_alerts"
  on "public"."expiry_alerts"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for expiry_alerts"
  on "public"."expiry_alerts"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified delete for nps_surveys"
  on "public"."nps_surveys"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for nps_surveys"
  on "public"."nps_surveys"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified modify for nps_surveys"
  on "public"."nps_surveys"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for nps_surveys"
  on "public"."nps_surveys"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified delete for operational_expenses"
  on "public"."operational_expenses"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified insert for operational_expenses"
  on "public"."operational_expenses"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified select for operational_expenses"
  on "public"."operational_expenses"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for operational_expenses"
  on "public"."operational_expenses"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = 'admin'::public.user_role)))));



  create policy "Unified delete for product_batches"
  on "public"."product_batches"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified insert for product_batches"
  on "public"."product_batches"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified select for product_batches"
  on "public"."product_batches"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role, 'delivery'::public.user_role]))))));



  create policy "Unified update for product_batches"
  on "public"."product_batches"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified select for product_cost_history"
  on "public"."product_cost_history"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Emergency public read products"
  on "public"."products"
  as permissive
  for select
  to public
using (true);



  create policy "Unified delete for products"
  on "public"."products"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified insert for products"
  on "public"."products"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified update for products"
  on "public"."products"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))))
with check ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified insert for profiles"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Unified select for profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using (((( SELECT public.get_my_role_safe() AS get_my_role_safe) = ANY (ARRAY['admin'::text, 'employee'::text])) OR (id = auth.uid())));



  create policy "Unified update for profiles"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((id = ( SELECT auth.uid() AS uid)))
with check ((id = ( SELECT auth.uid() AS uid)));



  create policy "Unified insert for sale_items"
  on "public"."sale_items"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "Unified select for sale_items"
  on "public"."sale_items"
  as permissive
  for select
  to authenticated
using (((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))) OR (EXISTS ( SELECT 1
   FROM public.sales
  WHERE ((sales.id = sale_items.sale_id) AND (sales.delivery_user_id = ( SELECT auth.uid() AS uid)))))));



  create policy "Unified delete for sales"
  on "public"."sales"
  as permissive
  for delete
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified insert for sales"
  on "public"."sales"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.role() AS role) = 'authenticated'::text));



  create policy "Unified select for sales"
  on "public"."sales"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Unified update for sales"
  on "public"."sales"
  as permissive
  for update
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified all for suppliers"
  on "public"."suppliers"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));



  create policy "Unified all for users"
  on "public"."users"
  as permissive
  for all
  to authenticated
using ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = ( SELECT auth.uid() AS uid)) AND (profiles.role = ANY (ARRAY['admin'::public.user_role, 'employee'::public.user_role]))))));


CREATE TRIGGER trg_deduct_stock_on_insert AFTER INSERT ON public.sale_items FOR EACH ROW EXECUTE FUNCTION public.fn_tgr_deduct_stock();


