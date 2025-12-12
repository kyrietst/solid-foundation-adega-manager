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
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          low_stock_threshold: number | null
          minimum_stock: number | null
          name: string
          package_alert_min: number | null
          parent_id: string | null
          unit_alert_min: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          minimum_stock?: number | null
          name: string
          package_alert_min?: number | null
          parent_id?: string | null
          unit_alert_min?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          minimum_stock?: number | null
          name?: string
          package_alert_min?: number | null
          parent_id?: string | null
          unit_alert_min?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          notes: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          notes?: string | null
          type?: string
        }
        Relationships: [
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
          address: string | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          estado: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          numero: string | null
          phone: string | null
          referencia: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          numero?: string | null
          phone?: string | null
          referencia?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          estado?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          numero?: string | null
          phone?: string | null
          referencia?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      delivery_orders: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          delivery_notes: string | null
          driver_id: string | null
          estimated_delivery_end: string | null
          estimated_delivery_start: string | null
          id: string
          order_type: string | null
          priority: string | null
          sale_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_notes?: string | null
          driver_id?: string | null
          estimated_delivery_end?: string | null
          estimated_delivery_start?: string | null
          id?: string
          order_type?: string | null
          priority?: string | null
          sale_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_notes?: string | null
          driver_id?: string | null
          estimated_delivery_end?: string | null
          estimated_delivery_start?: string | null
          id?: string
          order_type?: string | null
          priority?: string | null
          sale_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales_with_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_orders_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "v_sales_daily_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          notas: string | null
          pago: boolean | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          data: string
          descricao?: string | null
          id?: string
          notas?: string | null
          pago?: boolean | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          notas?: string | null
          pago?: boolean | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          metadata: Json | null
          product_id: string
          quantity_change: number
          reason: string | null
          sale_id: string | null
          source_variant_id: string | null
          target_variant_id: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          quantity_change: number
          reason?: string | null
          sale_id?: string | null
          source_variant_id?: string | null
          target_variant_id?: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          quantity_change?: number
          reason?: string | null
          sale_id?: string | null
          source_variant_id?: string | null
          target_variant_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"]
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_inventory_movements_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_inventory_movements_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales_with_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_inventory_movements_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sales_daily_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      product_batches: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_quantity: number
          expiry_date: string | null
          id: string
          initial_quantity: number
          notes: string | null
          product_id: string
          status: string | null
          supplier: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_quantity: number
          expiry_date?: string | null
          id?: string
          initial_quantity: number
          notes?: string | null
          product_id: string
          status?: string | null
          supplier?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_quantity?: number
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          notes?: string | null
          product_id?: string
          status?: string | null
          supplier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_cost_history: {
        Row: {
          cost_price: number
          created_at: string | null
          created_by: string | null
          id: string
          product_id: string
          reason: string | null
          valid_from: string
          valid_to: string | null
        }
        Insert: {
          cost_price: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id: string
          reason?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Update: {
          cost_price?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id?: string
          reason?: string | null
          valid_from?: string
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_cost_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category: string | null
          cost_price: number | null
          created_at: string
          deleted_at: string | null
          expiry_date: string | null
          has_expiry_tracking: boolean | null
          has_package_tracking: boolean | null
          has_unit_tracking: boolean | null
          id: string
          image_url: string | null
          margin_percent: number | null
          minimum_stock: number | null
          name: string
          package_barcode: string | null
          package_margin: number | null
          package_price: number | null
          package_size: string | null
          package_units: number | null
          price: number
          stock_packages: number | null
          stock_quantity: number
          stock_units_loose: number | null
          store2_holding_packages: number | null
          store2_holding_units_loose: number | null
          supplier: string | null
          turnover_rate: string | null
          unit_barcode: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          margin_percent?: number | null
          minimum_stock?: number | null
          name: string
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: string | null
          package_units?: number | null
          price?: number
          stock_packages?: number | null
          stock_quantity?: number
          stock_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          margin_percent?: number | null
          minimum_stock?: number | null
          name?: string
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: string | null
          package_units?: number | null
          price?: number
          stock_packages?: number | null
          stock_quantity?: number
          stock_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
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
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_cache: {
        Row: {
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          period_type: Database["public"]["Enums"]["report_period_type"]
          updated_at: string | null
        }
        Insert: {
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          period_type: Database["public"]["Enums"]["report_period_type"]
          updated_at?: string | null
        }
        Update: {
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          period_type?: Database["public"]["Enums"]["report_period_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          id: string
          price_at_sale: number
          product_id: string
          quantity: number
          sale_id: string
          unit_type: string | null
        }
        Insert: {
          id?: string
          price_at_sale: number
          product_id: string
          quantity: number
          sale_id: string
          unit_type?: string | null
        }
        Update: {
          id?: string
          price_at_sale?: number
          product_id?: string
          quantity?: number
          sale_id?: string
          unit_type?: string | null
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
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales_with_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sales_daily_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          channel: string | null
          created_at: string
          customer_id: string | null
          discount: number | null
          id: string
          notes: string | null
          pago: boolean | null
          payment_method: string | null
          seller_id: string | null
          status: Database["public"]["Enums"]["sales_status_enum"] | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          pago?: boolean | null
          payment_method?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          customer_id?: string | null
          discount?: number | null
          id?: string
          notes?: string | null
          pago?: boolean | null
          payment_method?: string | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          total?: number
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
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mv_customer_segmentation_kpis: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          days_since_purchase: number | null
          first_purchase: string | null
          last_purchase: string | null
          recency_score: number | null
          total_orders: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      sales_with_items: {
        Row: {
          channel: string | null
          created_at: string | null
          customer_id: string | null
          discount: number | null
          id: string | null
          items: Json | null
          notes: string | null
          pago: boolean | null
          payment_method: string | null
          seller_id: string | null
          status: Database["public"]["Enums"]["sales_status_enum"] | null
          total: number | null
          updated_at: string | null
          user_id: string | null
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
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_stats: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          last_purchase: string | null
          total_orders: number | null
          total_spent: number | null
        }
        Relationships: []
      }
      v_sales_daily_summary: {
        Row: {
          channel: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          discount: number | null
          id: string | null
          items: Json | null
          notes: string | null
          pago: boolean | null
          payment_method: string | null
          sale_date: string | null
          status: Database["public"]["Enums"]["sales_status_enum"] | null
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
    }
    Functions: {
      check_and_break_package: {
        Args: { p_product_id: string; p_required_units: number }
        Returns: boolean
      }
      create_inventory_movement: {
        Args: {
          p_product_id: string
          p_quantity_change: number
          p_type: Database["public"]["Enums"]["movement_type"]
          p_reason?: string
          p_metadata?: Json
          p_sale_id?: string
        }
        Returns: Json
      }
      get_crm_kpis: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_delivery_kpis: {
        Args: { p_start_date: string; p_end_date: string }
        Returns: Json
      }
      get_low_stock_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_low_stock_products: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          product_id: string
          product_name: string
          category: string
          stock_packages: number
          stock_units_loose: number
          package_alert_min: number
          unit_alert_min: number
          has_package_tracking: boolean
        }[]
      }
      get_sales_funnel: {
        Args: { p_start_date: string; p_end_date: string }
        Returns: Json
      }
      refresh_customer_segmentation: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_product_stock_absolute: {
        Args: {
          p_product_id: string
          p_new_packages: number
          p_new_units: number
          p_reason?: string
        }
        Returns: Json
      }
      transfer_stock_between_stores: {
        Args: {
          p_product_id: string
          p_packages_to_transfer: number
          p_units_to_transfer: number
          p_transfer_direction: string
          p_reason?: string
        }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
