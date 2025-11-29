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
      _deleted_objects_backup: {
        Row: {
          analysis_version: string | null
          definition: string | null
          deleted_at: string | null
          id: number
          object_name: string
          object_type: string
          reason: string | null
        }
        Insert: {
          analysis_version?: string | null
          definition?: string | null
          deleted_at?: string | null
          id?: number
          object_name: string
          object_type: string
          reason?: string | null
        }
        Update: {
          analysis_version?: string | null
          definition?: string | null
          deleted_at?: string | null
          id?: number
          object_name?: string
          object_type?: string
          reason?: string | null
        }
        Relationships: []
      }
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
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string | null
          details: string | null
          entity: string | null
          entity_id: string | null
          id: string
          role: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string | null
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          role?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string | null
          details?: string | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          details: Json | null
          entity_id: string | null
          id: string
          table_name: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          entity_id?: string | null
          id?: string
          table_name: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          entity_id?: string | null
          id?: string
          table_name?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          total_purchases: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          total_purchases?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          product_id: string | null
          quantity: number
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          movement_type: Database["public"]["Enums"]["movement_type"]
          product_id?: string | null
          quantity: number
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          movement_type?: Database["public"]["Enums"]["movement_type"]
          product_id?: string | null
          quantity?: number
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
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
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          minimum_stock: number | null
          name: string
          price: number
          stock_packages: number
          stock_units_loose: number
          store1_stock_packages: number | null
          store1_stock_units_loose: number | null
          store2_stock_packages: number | null
          store2_stock_units_loose: number | null
          supplier_id: string | null
          units_per_package: number | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          minimum_stock?: number | null
          name: string
          price: number
          stock_packages?: number
          stock_units_loose?: number
          store1_stock_packages?: number | null
          store1_stock_units_loose?: number | null
          store2_stock_packages?: number | null
          store2_stock_units_loose?: number | null
          supplier_id?: string | null
          units_per_package?: number | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          minimum_stock?: number | null
          name?: string
          price?: number
          stock_packages?: number
          stock_units_loose?: number
          store1_stock_packages?: number | null
          store1_stock_units_loose?: number | null
          store2_stock_packages?: number | null
          store2_stock_units_loose?: number | null
          supplier_id?: string | null
          units_per_package?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity: number
          sale_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
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
          created_at: string | null
          customer_id: string | null
          delivery: boolean | null
          delivery_address: Json | null
          delivery_completed_at: string | null
          delivery_fee: number | null
          delivery_instructions: string | null
          delivery_person_id: string | null
          delivery_started_at: string | null
          delivery_status: string | null
          delivery_type: string | null
          delivery_user_id: string | null
          delivery_zone_id: string | null
          discount_amount: number | null
          estimated_delivery_time: string | null
          final_amount: number | null
          id: string
          notes: string | null
          order_number: number
          payment_method: string | null
          payment_method_enum:
          | Database["public"]["Enums"]["payment_method_enum"]
          | null
          payment_status: string | null
          seller_id: string | null
          status: string | null
          status_enum: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_completed_at?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_person_id?: string | null
          delivery_started_at?: string | null
          delivery_status?: string | null
          delivery_type?: string | null
          delivery_user_id?: string | null
          delivery_zone_id?: string | null
          discount_amount?: number | null
          estimated_delivery_time?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_method_enum?:
          | Database["public"]["Enums"]["payment_method_enum"]
          | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_completed_at?: string | null
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_person_id?: string | null
          delivery_started_at?: string | null
          delivery_status?: string | null
          delivery_type?: string | null
          delivery_user_id?: string | null
          delivery_zone_id?: string | null
          discount_amount?: number | null
          estimated_delivery_time?: string | null
          final_amount?: number | null
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string | null
          payment_method_enum?:
          | Database["public"]["Enums"]["payment_method_enum"]
          | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
          updated_at?: string | null
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
            foreignKeyName: "sales_delivery_person_id_fkey"
            columns: ["delivery_person_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
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
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_debug_stock_logs: {
        Args: {
          p_product_id?: string
          p_hours_back?: number
        }
        Returns: {
          log_time: string
          product_name: string
          action: string
          details: string
          actor: string
        }[]
      }
      create_historical_sale: {
        Args: {
          p_customer_id: string
          p_user_id: string
          p_items: Json
          p_total_amount: number
          p_payment_method: string
          p_sale_date: string
          p_notes?: string
          p_delivery?: boolean
          p_delivery_fee?: number
        }
        Returns: string
      }
      create_inventory_movement: {
        Args: {
          p_product_id: string
          p_quantity_change: number
          p_type: Database["public"]["Enums"]["movement_type"]
          p_reason?: string
          p_metadata?: Json
          p_movement_type?: string
        }
        Returns: string
      }
      delete_sale_with_items: {
        Args: {
          p_sale_id: string
        }
        Returns: undefined
      }
      get_dashboard_financials: {
        Args: {
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          total_revenue: number
          total_expenses: number
          net_profit: number
          expense_breakdown: Json
        }[]
      }
      get_deleted_customers: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          name: string
          email: string
          phone: string
          deleted_at: string
        }[]
      }
      get_delivery_trends: {
        Args: {
          p_start_date: string
          p_end_date: string
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
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          delivery_orders: number
          delivery_revenue: number
          delivery_avg_ticket: number
          instore_orders: number
          instore_revenue: number
          instore_avg_ticket: number
          delivery_growth_rate: number
          instore_growth_rate: number
        }[]
      }
      get_inventory_kpis: {
        Args: {
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          replenishment_needed: Json
          dead_stock: Json
          top_movers: Json
          total_stock_value: number
          critical_products_count: number
        }[]
      }
      get_product_cost_at_date: {
        Args: {
          p_product_id: string
          p_date?: string
        }
        Returns: number
      }
      get_top_products: {
        Args: {
          start_date: string
          end_date: string
          limit_count: number
          by: string
        }
        Returns: {
          product_name: string
          total_quantity: number
          total_revenue: number
        }[]
      }
      get_total_inventory_valuation: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      handle_product_cost_change: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_audit_event: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      log_customer_activity: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      migrate_stock_to_dual_counting: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      normalize_brazilian_phone: {
        Args: {
          phone_input: string
        }
        Returns: string
      }
      parse_csv_product_item: {
        Args: {
          item_text: string
        }
        Returns: {
          name: string
          stock_packages: number
          stock_units_loose: number
          price: number
          cost_price: number
          category: string
          barcode: string
          min_stock: number
          units_per_package: number
        }[]
      }
      record_nps_survey: {
        Args: {
          p_customer_id: string
          p_score: number
          p_comment?: string
          p_survey_type?: string
          p_context?: Json
          p_sale_id?: string
          p_channel?: string
        }
        Returns: string
      }
      sell_from_batch_fifo: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_sale_id?: string
          p_customer_id?: string
          p_allow_partial?: boolean
          p_max_days_until_expiry?: number
        }
        Returns: {
          batch_id: string
          quantity_taken: number
          cost_at_time: number
        }[]
      }
      setup_first_admin: {
        Args: {
          p_email: string
          p_name: string
        }
        Returns: undefined
      }
      sync_delivery_status_to_sale_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_sales_enum_columns: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      transfer_to_store2_holding: {
        Args: {
          p_product_id: string
          p_quantity_packages?: number
          p_quantity_units?: number
          p_user_id?: string
          p_notes?: string
        }
        Returns: string
      }
      update_categories_updated_at: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_customer_after_sale: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_delivery_status: {
        Args: {
          p_sale_id: string
          p_new_status: string
          p_notes?: string
          p_latitude?: number
          p_longitude?: number
        }
        Returns: undefined
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

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof Database["public"]["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
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