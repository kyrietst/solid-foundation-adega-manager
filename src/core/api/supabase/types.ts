export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_logs: {
        Row: {
          created_at: string | null
          customer_id: string | null
          details: Json | null
          id: string
          result: string | null
          trigger_event: string | null
          workflow_id: string | null
          workflow_name: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          details?: Json | null
          id?: string
          result?: string | null
          trigger_event?: string | null
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          details?: Json | null
          id?: string
          result?: string | null
          trigger_event?: string | null
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_events: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          payload: Json | null
          source: string
          source_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          payload?: Json | null
          source: string
          source_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          payload?: Json | null
          source?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_history: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          origin_id: string | null
          type: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          origin_id?: string | null
          type: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          origin_id?: string | null
          type?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_insights: {
        Row: {
          confidence: number | null
          created_at: string | null
          customer_id: string | null
          id: string
          insight_type: string | null
          insight_value: string | null
          is_active: boolean | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          insight_type?: string | null
          insight_value?: string | null
          is_active?: boolean | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          insight_type?: string | null
          insight_value?: string | null
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_insights_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_insights_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          associated_sale_id: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          id: string
          interaction_type: string | null
        }
        Insert: {
          associated_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          interaction_type?: string | null
        }
        Update: {
          associated_sale_id?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          interaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_associated_sale_id_fkey"
            columns: ["associated_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customers: {
        Row: {
          address: Json | null
          birthday: string | null
          contact_permission: boolean | null
          contact_preference: string | null
          created_at: string
          email: string | null
          favorite_category: string | null
          favorite_product: string | null
          first_purchase_date: string | null
          id: string
          last_purchase_date: string | null
          lifetime_value: number | null
          name: string
          notes: string | null
          phone: string | null
          purchase_frequency: string | null
          segment: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          birthday?: string | null
          contact_permission?: boolean | null
          contact_preference?: string | null
          created_at?: string
          email?: string | null
          favorite_category?: string | null
          favorite_product?: string | null
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          purchase_frequency?: string | null
          segment?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          birthday?: string | null
          contact_permission?: boolean | null
          contact_preference?: string | null
          created_at?: string
          email?: string | null
          favorite_category?: string | null
          favorite_product?: string | null
          first_purchase_date?: string | null
          id?: string
          last_purchase_date?: string | null
          lifetime_value?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          purchase_frequency?: string | null
          segment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_favorite_product_fkey"
            columns: ["favorite_product"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          created_at: string | null
          id: string
          min_stock: number | null
          price: number
          product_name: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_stock?: number | null
          price: number
          product_name: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          min_stock?: number | null
          price?: number
          product_name?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          amount: number | null
          ar_status: string | null
          customer_id: string | null
          date: string
          due_date: string | null
          id: string
          product_id: string
          quantity: number
          reason: string | null
          related_sale_id: string | null
          sale_id: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          ar_status?: string | null
          customer_id?: string | null
          date?: string
          due_date?: string | null
          id?: string
          product_id: string
          quantity: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          ar_status?: string | null
          customer_id?: string | null
          date?: string
          due_date?: string | null
          id?: string
          product_id?: string
          quantity?: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_related_sale_id_fkey"
            columns: ["related_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
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
      payment_methods: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          alcohol_content: number | null
          barcode: string | null
          category: string
          cost_price: number | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          margin_percent: number | null
          measurement_type: string | null
          measurement_value: string | null
          minimum_stock: number
          name: string
          package_margin: number | null
          package_price: number | null
          package_size: number | null
          price: number
          producer: string | null
          region: string | null
          stock_quantity: number
          supplier: string | null
          turnover_rate: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string
          vintage: number | null
          volume: number | null
          volume_ml: number | null
        }
        Insert: {
          alcohol_content?: number | null
          barcode?: string | null
          category: string
          cost_price?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number
          name: string
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          price: number
          producer?: string | null
          region?: string | null
          stock_quantity?: number
          supplier?: string | null
          turnover_rate?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Update: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string
          cost_price?: number | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number
          name?: string
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          price?: number
          producer?: string | null
          region?: string | null
          stock_quantity?: number
          supplier?: string | null
          turnover_rate?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          sale_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery: boolean | null
          delivery_address: Json | null
          delivery_user_id: string | null
          discount_amount: number
          final_amount: number
          id: string
          notes: string | null
          payment_method: string
          payment_status: string
          seller_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_user_id?: string | null
          discount_amount?: number
          final_amount?: number
          id?: string
          notes?: string | null
          payment_method: string
          payment_status?: string
          seller_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_user_id?: string | null
          discount_amount?: number
          final_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          seller_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
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
      v_customer_purchases: {
        Row: {
          created_at: string | null
          customer_id: string | null
          items: Json | null
          purchase_id: string | null
          source: string | null
          total: number | null
        }
        Relationships: []
      }
      v_customer_stats: {
        Row: {
          customer_id: string | null
          last_purchase: string | null
          total_spent: number | null
        }
        Relationships: []
      }
      v_customer_timeline: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string | null
          payload: Json | null
          source: string | null
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          payload?: Json | null
          source?: string | null
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string | null
          payload?: Json | null
          source?: string | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
    }
    Functions: {
      calculate_turnover_rate: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_rate_limit: {
        Args: { p_email: string; p_ip: string }
        Returns: boolean
      }
      cleanup_old_auth_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_admin_user: {
        Args: { p_email: string; p_password: string; p_name?: string }
        Returns: Json
      }
      create_admin_user_with_password: {
        Args: { p_email: string; p_password: string; p_name?: string }
        Returns: Json
      }
      create_direct_admin: {
        Args: { p_email: string; p_password: string; p_name?: string }
        Returns: Json
      }
      create_sale_with_items: {
        Args: {
          p_customer_id: string
          p_items: Json
          p_payment_method_id: string
          p_total_amount: number
          p_notes?: string
        }
        Returns: string
      }
      decrement_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      delete_sale_with_items: {
        Args: { p_sale_id: string }
        Returns: undefined
      }
      delete_user_profile: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      delete_user_role: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      get_customer_metrics: {
        Args: { start_date: string; end_date: string }
        Returns: {
          total_customers: number
          new_customers: number
        }[]
      }
      get_customer_retention: {
        Args: { start_date: string; end_date: string }
        Returns: {
          period: string
          retained: number
          lost: number
        }[]
      }
      get_customer_summary: {
        Args: { start_date: string; end_date: string; period_type?: string }
        Returns: {
          period_start: string
          period_label: string
          new_customers: number
          returning_customers: number
          total_customers: number
          average_order_value: number
        }[]
      }
      get_financial_metrics: {
        Args: { start_date: string; end_date: string }
        Returns: {
          gross_revenue: number
          net_revenue: number
          cogs: number
        }[]
      }
      get_inventory_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_products: number
          total_stock_value: number
          low_stock_items: number
        }[]
      }
      get_inventory_summary: {
        Args: { start_date: string; end_date: string; period_type?: string }
        Returns: {
          period_start: string
          period_label: string
          products_sold: number
          products_added: number
          out_of_stock: number
          low_stock: number
        }[]
      }
      get_low_stock_products: {
        Args: { limit_count: number }
        Returns: {
          product_id: string
          name: string
          stock_quantity: number
        }[]
      }
      get_sales_by_category: {
        Args: { start_date: string; end_date: string }
        Returns: {
          category_name: string
          total_revenue: number
        }[]
      }
      get_sales_by_payment_method: {
        Args: { start_date: string; end_date: string }
        Returns: {
          payment_method: string
          total_sales: number
        }[]
      }
      get_sales_metrics: {
        Args: { start_date: string; end_date: string }
        Returns: {
          total_revenue: number
          total_sales: number
          average_ticket: number
        }[]
      }
      get_sales_trends: {
        Args: { start_date: string; end_date: string; period_type: string }
        Returns: {
          date_trunc: string
          total_sales: number
        }[]
      }
      get_top_customers: {
        Args: { start_date: string; end_date: string; limit_count: number }
        Returns: {
          customer_id: string
          customer_name: string
          total_spent: number
        }[]
      }
      get_top_products: {
        Args: { start_date: string; end_date: string; limit_count: number }
        Returns: {
          product_name: string
          total_sold: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: { role_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_supreme_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_auth_attempt: {
        Args: {
          p_email: string
          p_success: boolean
          p_ip: string
          p_user_agent?: string
        }
        Returns: undefined
      }
      process_sale: {
        Args: {
          p_customer_id: string
          p_user_id: string
          p_payment_method_id: string
          p_notes: string
          p_items: Json[]
        }
        Returns: string
      }
      recalc_customer_insights: {
        Args: { p_customer_id: string }
        Returns: undefined
      }
      reset_admin_password: {
        Args: { p_password: string }
        Returns: undefined
      }
      setup_first_admin: {
        Args: { p_email: string; p_name: string }
        Returns: Json
      }
    }
    Enums: {
      report_period_type: "day" | "week" | "month" | "year"
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
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      report_period_type: ["day", "week", "month", "year"],
      user_role: ["admin", "employee", "delivery"],
    },
  },
} as const