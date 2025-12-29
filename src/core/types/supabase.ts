export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts_receivable: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string
          due_date: string
          id: string
          sale_id: string | null
          status: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id: string
          due_date: string
          id?: string
          sale_id?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string
          due_date?: string
          id?: string
          sale_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "accounts_receivable_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          complemento: string | null
          created_at: string | null
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome: string
          numero: string | null
          organizacao_id: string | null
          telefone: string | null
          tipo: string | null
          uf: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome: string
          numero?: string | null
          organizacao_id?: string | null
          telefone?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome?: string
          numero?: string | null
          organizacao_id?: string | null
          telefone?: string | null
          tipo?: string | null
          uf?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          complement: string | null
          created_at: string
          email: string | null
          id: string
          last_purchase_date: string | null
          latitude: number | null
          longitude: number | null
          name: string
          neighborhood: string | null
          notes: string | null
          number: string | null
          phone: string | null
          state: string | null
          total_spent: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_purchase_date?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          phone?: string | null
          state?: string | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          payment_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          payment_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          product_id: string
          quantity_change: number
          reason: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          product_id: string
          quantity_change: number
          reason?: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          product_id?: string
          quantity_change?: number
          reason?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "dual_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_product_performance_summary"
            referencedColumns: ["top_performer"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_products_with_invalid_categories"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_stock_report_by_category"
            referencedColumns: ["category"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_top_products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_kyrie_intelligence_margins"
            referencedColumns: ["product_name"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          active: boolean | null
          batch_code: string
          cost_per_unit: number | null
          created_at: string
          created_by: string | null
          expiry_date: string
          id: string
          initial_packages: number
          initial_units: number
          manufacturing_date: string
          notes: string | null
          product_id: string
          quality_grade: string | null
          related_movement_id: string | null
          remaining_packages: number
          remaining_units: number
          supplier_batch_code: string | null
          supplier_id: string | null
          supplier_name: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          batch_code: string
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date: string
          id?: string
          initial_packages?: number
          initial_units?: number
          manufacturing_date: string
          notes?: string | null
          product_id: string
          quality_grade?: string | null
          related_movement_id?: string | null
          remaining_packages: number
          remaining_units: number
          supplier_batch_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          batch_code?: string
          cost_per_unit?: number | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string
          id?: string
          initial_packages?: number
          initial_units?: number
          manufacturing_date?: string
          notes?: string | null
          product_id?: string
          quality_grade?: string | null
          related_movement_id?: string | null
          remaining_packages?: number
          remaining_units?: number
          supplier_batch_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "dual_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_product_performance_summary"
            referencedColumns: ["top_performer"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_products_with_invalid_categories"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_stock_report_by_category"
            referencedColumns: ["category"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_top_products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_kyrie_intelligence_margins"
            referencedColumns: ["product_name"]
          },
          {
            foreignKeyName: "product_batches_related_movement_id_fkey"
            columns: ["related_movement_id"]
            isOneToOne: false
            referencedRelation: "inventory_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_expiry_alerts: {
        Row: {
          alert_level: number
          batch_id: string
          created_at: string
          days_until_expiry: number
          dismissed_at: string | null
          dismissed_by: string | null
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          alert_level: number
          batch_id: string
          created_at?: string
          days_until_expiry: number
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          alert_level?: number
          batch_id?: string
          created_at?: string
          days_until_expiry?: number
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_expiry_alerts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          alcohol_content: number | null
          barcode: string | null
          category: string
          cost_price: number | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          expiry_date: string | null
          has_expiry_tracking: boolean
          has_package_tracking: boolean | null
          has_unit_tracking: boolean | null
          id: string
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          margin_percent: number | null
          minimum_stock: number | null
          name: string
          ncm: string | null
          cest: string | null
          cfop: string | null
          origin: string | null
          package_barcode: string | null
          package_margin: number | null
          package_price: number | null
          package_size: number | null
          package_units: number | null
          packaging_type: string | null
          price: number
          stock_packages: number
          stock_quantity: number
          stock_units_loose: number
          store2_holding_packages: number
          store2_holding_units_loose: number
          supplier: string | null
          turnover_rate: string | null
          unit_barcode: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          alcohol_content?: number | null
          barcode?: string | null
          category: string
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          minimum_stock?: number | null
          name: string
          ncm?: string | null
          cest?: string | null
          cfop?: string | null
          origin?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price: number
          stock_packages?: number
          stock_quantity: number
          stock_units_loose?: number
          store2_holding_packages?: number
          store2_holding_units_loose?: number
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          minimum_stock?: number | null
          name?: string
          ncm?: string | null
          cest?: string | null
          cfop?: string | null
          origin?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number
          stock_packages?: number
          stock_quantity?: number
          stock_units_loose?: number
          store2_holding_packages?: number
          store2_holding_units_loose?: number
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          feature_flags: Json
          full_name: string | null
          id: string
          preferences: Json
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          feature_flags?: Json
          full_name?: string | null
          id: string
          preferences?: Json
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          feature_flags?: Json
          full_name?: string | null
          id?: string
          preferences?: Json
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      route_optimization_config: {
        Row: {
          average_delivery_time_minutes: number
          average_speed_kmh: number
          clustering_radius_km: number
          created_at: string
          delivery_fee_base: number
          delivery_fee_per_km: number
          id: string
          max_deliveries_per_driver: number
          max_route_distance_km: number
          service_area_radius_km: number
          updated_at: string
        }
        Insert: {
          average_delivery_time_minutes?: number
          average_speed_kmh?: number
          clustering_radius_km?: number
          created_at?: string
          delivery_fee_base?: number
          delivery_fee_per_km?: number
          id?: string
          max_deliveries_per_driver?: number
          max_route_distance_km?: number
          service_area_radius_km?: number
          updated_at?: string
        }
        Update: {
          average_delivery_time_minutes?: number
          average_speed_kmh?: number
          clustering_radius_km?: number
          created_at?: string
          delivery_fee_base?: number
          delivery_fee_per_km?: number
          id?: string
          max_deliveries_per_driver?: number
          max_route_distance_km?: number
          service_area_radius_km?: number
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          quantity: number
          sale_id: string
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          quantity?: number
          sale_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "dual_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_low_stock_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_product_performance_summary"
            referencedColumns: ["top_performer"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_products_with_invalid_categories"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_stock_report_by_category"
            referencedColumns: ["category"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "get_top_products"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "vw_kyrie_intelligence_margins"
            referencedColumns: ["product_name"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string
          deleted_at: string | null
          delivery_address: string | null
          delivery_fee: number | null
          delivery_status: string | null
          delivery_user_id: string | null
          discount_amount: number | null
          final_amount: number | null
          id: string
          is_delivery: boolean | null
          items: Json
          notes: string | null
          payment_method: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_status?: string | null
          delivery_user_id?: string | null
          discount_amount?: number | null
          final_amount?: number | null
          id?: string
          is_delivery?: boolean | null
          items: Json
          notes?: string | null
          payment_method: string
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          deleted_at?: string | null
          delivery_address?: string | null
          delivery_fee?: number | null
          delivery_status?: string | null
          delivery_user_id?: string | null
          discount_amount?: number | null
          final_amount?: number | null
          id?: string
          is_delivery?: boolean | null
          items?: Json
          notes?: string | null
          payment_method?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          company_name: string
          contact_info: Json | null
          created_at: string
          created_by: string | null
          delivery_time: string | null
          id: string
          is_active: boolean | null
          minimum_order_value: number | null
          notes: string | null
          payment_methods: string[] | null
          products_supplied: string[] | null
          updated_at: string
        }
        Insert: {
          company_name: string
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          notes?: string | null
          payment_methods?: string[] | null
          products_supplied?: string[] | null
          updated_at?: string
        }
        Update: {
          company_name?: string
          contact_info?: Json | null
          created_at?: string
          created_by?: string | null
          delivery_time?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          notes?: string | null
          payment_methods?: string[] | null
          products_supplied?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      activity_logs_view: {
        Row: {
          action: string | null
          actor: string | null
          created_at: string | null
          details: string | null
          entity: string | null
          entity_id: string | null
          id: string | null
          role: string | null
        }
        Relationships: []
      }
      dual_stock_summary: {
        Row: {
          category: string | null
          count: number | null
          total_packages: number | null
          total_units_in_packages: number | null
        }
        Relationships: []
      }
      mv_customer_segmentation_kpis: {
        Row: {
          activity_status: string | null
          avg_order_value: number | null
          customer_id: string | null
          customer_name: string | null
          days_since_last_purchase: number | null
          first_purchase_date: string | null
          last_purchase_date: string | null
          segment: string | null
          total_orders: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      mv_daily_sales_kpis: {
        Row: {
          avg_order_value: number | null
          cash_count: number | null
          cash_revenue: number | null
          credit_count: number | null
          credit_revenue: number | null
          pix_count: number | null
          pix_revenue: number | null
          sale_date: string | null
          total_revenue: number | null
          total_sales: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      mv_financial_kpis: {
        Row: {
          calculation_date: string | null
          current_amount: number | null
          d0_30: number | null
          d31_60: number | null
          d61_90: number | null
          d90_plus: number | null
          dso_days: number | null
          total_invoices: number | null
          total_receivable: number | null
        }
        Relationships: []
      }
      product_movement_history: {
        Row: {
          date: string | null
          id: string | null
          new_stock: number | null
          notes: string | null
          previous_stock: number | null
          product_category: string | null
          product_name: string | null
          quantity: number | null
          reason: string | null
          source: string | null
          stock_change: number | null
          type: string | null
          type_display: string | null
          type_variant: string | null
          user_name: string | null
          user_role: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      v_customer_purchases: {
        Row: {
          created_at: string | null
          customer_id: string | null
          items: Json | null
          purchase_id: string | null
          source: string | null
          total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      v_customer_stats: {
        Row: {
          customer_id: string | null
          last_purchase: string | null
          total_spent: number | null
        }
        Relationships: []
      }
      vw_kyrie_intelligence_margins: {
        Row: {
          category_name: string | null
          gross_profit: number | null
          margin_percent: number | null
          product_name: string | null
          times_sold: number | null
          total_cost: number | null
          total_revenue: number | null
          total_units_sold: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_delivery_person: {
        Args: {
          p_auto_assign?: boolean
          p_delivery_person_id?: string
          p_sale_id: string
        }
        Returns: Json
      }
      break_packages_to_loose: {
        Args: {
          p_packages_to_break: number
          p_product_id: string
        }
        Returns: Json
      }
      calculate_delivery_fee: {
        Args: {
          p_latitude: number
          p_longitude: number
          p_order_value?: number
        }
        Returns: {
          delivery_fee: number
          estimated_time_minutes: number
          is_eligible: boolean
          minimum_order_value: number
          zone_id: string
          zone_name: string
        }[]
      }
      calculate_turnover_rate: {
        Args: never
        Returns: undefined
      }
      convert_loose_to_packages: {
        Args: {
          p_product_id: string
        }
        Returns: Json
      }
      create_expiry_alert_if_needed: {
        Args: {
          p_batch_id: string
        }
        Returns: undefined
      }
      create_historical_sale: {
        Args: {
          p_customer_id: string
          p_delivery?: boolean
          p_delivery_fee?: number
          p_items: Json
          p_notes?: string
          p_payment_method: string
          p_sale_date: string
          p_total_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      create_inventory_movement: {
        Args: {
          p_metadata?: Json
          p_movement_type?: string
          p_product_id: string
          p_quantity_change: number
          p_reason?: string
          p_type: Database["public"]["Enums"]["movement_type"]
        }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_category?: string
          p_data?: Json
          p_expires_hours?: number
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      create_product_batch: {
        Args: {
          p_batch_code: string
          p_cost_per_unit?: number
          p_create_units?: boolean
          p_expiry_date: string
          p_manufacturing_date: string
          p_notes?: string
          p_product_id: string
          p_quality_grade?: string
          p_supplier_batch_code?: string
          p_supplier_name?: string
          p_total_packages?: number
          p_total_units?: number
        }
        Returns: Json
      }
      create_quick_customer: {
        Args: {
          p_name: string
          p_phone?: string
        }
        Returns: string
      }
      create_sale_with_items: {
        Args: {
          p_customer_id: string
          p_items: Json
          p_notes?: string
          p_payment_method_id: string
          p_total_amount: number
        }
        Returns: string
      }
      get_category_mix: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          category: string
          revenue: number
        }[]
      }
      get_crm_trends_new_customers: {
        Args: never
        Returns: {
          active_customers: number
          avg_ltv: number
          month: number
          new_customers: number
          year: number
        }[]
      }
      get_customer_metrics: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          active_customers: number
          new_customers: number
          total_customers: number
        }[]
      }
      get_customer_real_metrics: {
        Args: {
          p_customer_id: string
        }
        Returns: Json
      }
      get_customer_retention: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          lost: number
          period: string
          retained: number
        }[]
      }
      get_customer_summary: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          active_customers: number
          new_customers: number
          total_customers: number
        }[]
      }
      get_customer_table_data: {
        Args: never
        Returns: {
          categoria_favorita: string
          cliente: string
          created_at: string
          id: string
          insights_confidence: number
          insights_count: number
          metodo_preferido: string
          segmento: string
          ultima_compra: string
          updated_at: string
        }[]
      }
      get_daily_cash_flow: {
        Args: {
          p_end_date: string
          p_start_date: string
        }
        Returns: {
          balance: number
          date: string
          income: number
          outcome: number
        }[]
      }
      get_daily_kpi_summary: {
        Args: {
          days_back?: number
        }
        Returns: {
          avg_order_value: number
          period_end: string
          period_start: string
          total_revenue: number
          total_sales: number
          unique_customers: number
        }[]
      }
      get_delivery_metrics: {
        Args: {
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_delivery_ticket: number
          avg_delivery_time_minutes: number
          completion_rate: number
          on_time_rate: number
          total_deliveries: number
          total_delivery_fees: number
          total_delivery_revenue: number
        }[]
      }
      get_delivery_timeline: {
        Args: {
          p_sale_id: string
        }
        Returns: {
          created_at: string
          created_by_id: string
          created_by_name: string
          is_current_status: boolean
          location_lat: number
          location_lng: number
          notes: string
          status: string
          time_diff_minutes: number
          tracking_id: string
        }[]
      }
      get_delivery_trends: {
        Args: {
          p_end_date: string
          p_start_date: string
        }
        Returns: {
          date: string
          delivery_orders: number
          delivery_revenue: number
          instore_orders: number
          instore_revenue: number
          total_orders: number
          total_sales: number
        }[]
      }
      get_delivery_vs_instore_comparison: {
        Args: {
          p_days: number
        }
        Returns: {
          delivery_avg_ticket: number
          delivery_growth_rate: number
          delivery_orders: number
          delivery_revenue: number
          instore_avg_ticket: number
          instore_growth_rate: number
          instore_orders: number
          instore_revenue: number
        }[]
      }
      get_dual_stock_report: {
        Args: never
        Returns: {
          estimated_loose_value: number
          estimated_packages_value: number
          package_units: number
          packages: number
          product_id: string
          product_name: string
          total_units: number
          total_value: number
          units_loose: number
        }[]
      }
      get_expense_summary: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          avg_expense: number
          top_category: string
          top_category_amount: number
          total_expenses: number
          total_transactions: number
        }[]
      }
      get_expiry_alerts_30_days: {
        Args: {
          limit_count?: number
        }
        Returns: {
          affected_units: number
          alert_level: number
          batch_code: string
          batch_id: string
          category: string
          days_until_expiry: number
          estimated_loss_value: number
          expiry_date: string
          product_id: string
          product_name: string
          supplier_name: string
        }[]
      }
      get_inventory_financials: {
        Args: never
        Returns: Json
      }
      get_inventory_kpis: {
        Args: {
          p_end_date: string
          p_start_date: string
        }
        Returns: {
          avg_daily_sales: number
          category: string
          doh: number
          is_critical: boolean
          is_dead_stock: boolean
          name: string
          product_id: string
          stock: number
          turnover: number
        }[]
      }
      get_inventory_summary: {
        Args: {
          end_date: string
          period_type?: string
          start_date: string
        }
        Returns: {
          out_of_stock: number
          period_label: string
          period_start: string
          products_added: number
          products_sold: number
        }[]
      }
      get_inventory_total_value: {
        Args: never
        Returns: {
          total_value: number
        }[]
      }
      get_low_stock_count: {
        Args: never
        Returns: number
      }
      get_low_stock_products: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          category: string
          current_stock: number
          id: string
          is_legacy_override: boolean
          limit_packages: number
          limit_units: number
          minimum_stock: number
          name: string
          price: number
          stock_packages: number
          stock_units_loose: number
        }[]
      }
      get_monthly_expenses: {
        Args: {
          category_filter?: string
          target_month: number
          target_year: number
        }
        Returns: {
          avg_amount: number
          category_id: string
          category_name: string
          expense_count: number
          total_amount: number
        }[]
      }
      get_movement_summary_stats: {
        Args: {
          p_product_id: string
        }
        Returns: {
          total_ajustes: number
          total_entradas: number
          total_saidas: number
        }[]
      }
      get_nps_score: {
        Args: {
          customer_segment?: string
          end_date?: string
          start_date?: string
        }
        Returns: {
          detractor_percentage: number
          detractors: number
          nps_score: number
          passives: number
          promoter_percentage: number
          promoters: number
          total_responses: number
        }[]
      }
      get_nps_trend: {
        Args: {
          months_back?: number
        }
        Returns: {
          avg_score: number
          month_year: string
          nps_score: number
          responses: number
        }[]
      }
      get_orphan_sales: {
        Args: never
        Returns: {
          audit_info: Json
          created_at: string
          customer_name: string
          final_amount: number
          sale_id: string
          seller_name: string
          total_amount: number
        }[]
      }
      get_product_cost_at_date: {
        Args: {
          p_date?: string
          p_product_id: string
        }
        Returns: number
      }
      get_product_cost_history: {
        Args: {
          p_end_date?: string
          p_product_id: string
          p_start_date?: string
        }
        Returns: {
          cost_price: number
          created_at: string
          id: string
          reason: string
          valid_from: string
          valid_to: string
        }[]
      }
      get_product_movement_summary: {
        Args: {
          p_product_id: string
        }
        Returns: {
          current_stock: number
          product_category: string
          product_name: string
          total_ajustes: number
          total_entradas: number
          total_saidas: number
        }[]
      }
      get_product_performance_summary: {
        Args: never
        Returns: {
          low_stock_count: number
          no_sales_count: number
          slow_moving_count: number
          top_performer: string
          top_revenue: number
          total_products: number
        }[]
      }
      get_product_stock_quantity: {
        Args: {
          p_product_id: string
        }
        Returns: number
      }
      get_products_with_invalid_categories: {
        Args: never
        Returns: {
          invalid_category: string
          product_id: string
          product_name: string
        }[]
      }
      get_sales_by_category: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          category_name: string
          total_revenue: number
        }[]
      }
      get_sales_by_payment_method: {
        Args: {
          end_date: string
          start_date: string
        }
        Returns: {
          avg_ticket: number
          payment_method: string
          total_revenue: number
          total_sales: number
        }[]
      }
      get_sales_chart_data: {
        Args: {
          p_end_date: string
          p_start_date: string
        }
        Returns: {
          delivery_orders: number
          delivery_revenue: number
          period_label: string
          presencial_orders: number
          presencial_revenue: number
          sale_date: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_stock_report_by_category: {
        Args: never
        Returns: {
          avg_price: number
          category: string
          percentage_of_total: number
          total_products: number
          total_units: number
          total_value: number
        }[]
      }
      get_top_customers: {
        Args: {
          end_date: string
          limit_count: number
          start_date: string
        }
        Returns: {
          avg_order_value: number
          customer_id: string
          customer_name: string
          total_orders: number
          total_spent: number
        }[]
      }
      get_top_products:
        | {
            Args: {
              end_date: string
              limit_count: number
              start_date: string
            }
            Returns: {
              product_name: string
              total_sold: number
            }[]
          }
        | {
            Args: {
              by: string
              end_date: string
              limit_count: number
              start_date: string
            }
            Returns: {
              category: string
              name: string
              product_id: string
              qty: number
              revenue: number
            }[]
          }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      hard_delete_customer: {
        Args: {
          p_confirmation_text: string
          p_customer_id: string
          p_user_id: string
        }
        Returns: Json
      }
      has_feature_flag: {
        Args: {
          p_flag_name: string
        }
        Returns: boolean
      }
      import_delivery_csv_row: {
        Args: {
          p_address: string
          p_customer_name: string
          p_datetime: string
          p_delivery_fee: string
          p_delivery_person?: string
          p_order_number: string
          p_payment_method: string
          p_phone: string
          p_products: string
          p_status?: string
          p_total_value: string
        }
        Returns: string
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
      log_activity: {
        Args: {
          p_action: string
          p_actor: string
          p_details?: string
          p_entity: string
          p_entity_id?: string
          p_role: string
        }
        Returns: undefined
      }
      process_sale: {
        Args: {
          p_customer_id: string
          p_discount_amount?: number
          p_final_amount: number
          p_is_delivery?: boolean
          p_items: Json[]
          p_notes?: string
          p_payment_method_id: string
          p_total_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      sell_from_batch_fifo: {
        Args: {
          p_allow_partial?: boolean
          p_customer_id?: string
          p_max_days_until_expiry?: number
          p_product_id: string
          p_quantity: number
          p_sale_id?: string
        }
        Returns: Json
      }
      set_product_stock_absolute: {
        Args: {
          p_new_packages: number
          p_new_units_loose: number
          p_product_id: string
          p_reason: string
          p_user_id: string
        }
        Returns: Json
      }
      transfer_to_store2_holding: {
        Args: {
          p_notes?: string
          p_product_id: string
          p_quantity_packages?: number
          p_quantity_units?: number
          p_user_id?: string
        }
        Returns: Json
      }
      update_delivery_status: {
        Args: {
          p_latitude?: number
          p_longitude?: number
          p_new_status: string
          p_notes?: string
          p_sale_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      movement_type:
        | "sale"
        | "initial_stock"
        | "inventory_adjustment"
        | "return"
        | "stock_transfer_out"
        | "stock_transfer_in"
        | "personal_consumption"
      payment_method_enum:
        | "cash"
        | "credit"
        | "debit"
        | "pix"
        | "bank_transfer"
        | "check"
        | "other"
      report_period_type: "day" | "week" | "month" | "year"
      sales_status_enum:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "refunded"
      user_role: "admin" | "employee" | "delivery"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      movement_type: [
        "sale",
        "initial_stock",
        "inventory_adjustment",
        "return",
        "stock_transfer_out",
        "stock_transfer_in",
        "personal_consumption",
      ],
      payment_method_enum: [
        "cash",
        "credit",
        "debit",
        "pix",
        "bank_transfer",
        "check",
        "other",
      ],
      report_period_type: ["day", "week", "month", "year"],
      sales_status_enum: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded",
      ],
      user_role: ["admin", "employee", "delivery"],
    },
  },
} as const
