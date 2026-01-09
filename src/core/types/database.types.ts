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
      campaign_templates: {
        Row: {
          channel: Database["public"]["Enums"]["marketing_channel"]
          content: string
          created_at: string
          description: string | null
          id: string
          name: string
          tags: string[] | null
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["marketing_channel"]
          content: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tags?: string[] | null
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["marketing_channel"]
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tags?: string[] | null
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          cpf_cnpj: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      delivery_stats: {
        Row: {
          active_delivery_people: number | null
          avg_delivery_time_minutes: number | null
          completed_deliveries_today: number | null
          id: string
          last_updated: string | null
          pending_deliveries: number | null
          total_delivery_fees_today: number | null
        }
        Insert: {
          active_delivery_people?: number | null
          avg_delivery_time_minutes?: number | null
          completed_deliveries_today?: number | null
          id?: string
          last_updated?: string | null
          pending_deliveries?: number | null
          total_delivery_fees_today?: number | null
        }
        Update: {
          active_delivery_people?: number | null
          avg_delivery_time_minutes?: number | null
          completed_deliveries_today?: number | null
          id?: string
          last_updated?: string | null
          pending_deliveries?: number | null
          total_delivery_fees_today?: number | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          deleted_at: string | null
          description: string
          id: string
          payment_method: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          deleted_at?: string | null
          description: string
          id?: string
          payment_method: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          description?: string
          id?: string
          payment_method?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          cost_price: number | null
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          product_id: string
          quantity_change: number
          reason: string
          stock_after: number
          stock_before: number
          type: Database["public"]["Enums"]["movement_type"]
          unit_type: string
          user_id: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          product_id: string
          quantity_change: number
          reason: string
          stock_after: number
          stock_before: number
          type: Database["public"]["Enums"]["movement_type"]
          unit_type: string
          user_id?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string
          quantity_change?: number
          reason?: string
          stock_after?: number
          stock_before?: number
          type?: Database["public"]["Enums"]["movement_type"]
          unit_type?: string
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
      invoice_logs: {
        Row: {
          created_at: string
          error_message: string | null
          external_id: string | null
          id: string
          pdf_url: string | null
          provider: string
          sale_id: string
          status: string | null
          updated_at: string
          xml_url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          pdf_url?: string | null
          provider?: string
          sale_id: string
          status?: string | null
          updated_at?: string
          xml_url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          id?: string
          pdf_url?: string | null
          provider?: string
          sale_id?: string
          status?: string | null
          updated_at?: string
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_logs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          audience_filters: Json | null
          budget_spent: number | null
          channel: Database["public"]["Enums"]["marketing_channel"]
          clicks_count: number | null
          conversions_count: number | null
          cost_per_conversion: number | null
          created_at: string
          end_date: string | null
          id: string
          messages_sent: number | null
          name: string
          revenue_generated: number | null
          roi: number | null
          schedule_type: string | null
          scheduled_for: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          target_audience_size: number | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          audience_filters?: Json | null
          budget_spent?: number | null
          channel: Database["public"]["Enums"]["marketing_channel"]
          clicks_count?: number | null
          conversions_count?: number | null
          cost_per_conversion?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          messages_sent?: number | null
          name: string
          revenue_generated?: number | null
          roi?: number | null
          schedule_type?: string | null
          scheduled_for?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience_size?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          audience_filters?: Json | null
          budget_spent?: number | null
          channel?: Database["public"]["Enums"]["marketing_channel"]
          clicks_count?: number | null
          conversions_count?: number | null
          cost_per_conversion?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          messages_sent?: number | null
          name?: string
          revenue_generated?: number | null
          roi?: number | null
          schedule_type?: string | null
          scheduled_for?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          target_audience_size?: number | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          barcode: string | null
          category: string
          category_id: string
          cest: string | null
          cfop: string | null
          cost_price: number | null
          created_at: string
          deleted_at: string | null
          description: string | null
          has_package_tracking: boolean | null
          has_unit_tracking: boolean | null
          id: string
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          markup: number | null
          min_stock_level: number | null
          minimum_stock: number | null
          name: string
          ncm: string | null
          origin: number | null
          package_barcode: string | null
          package_price: number | null
          package_size: number | null
          price: number
          stock_packages: number | null
          stock_quantity: number
          stock_units_loose: number | null
          store1_holding_packages: number | null
          store1_holding_units_loose: number | null
          store2_holding_packages: number | null
          store2_holding_units_loose: number | null
          supplier_id: string | null
          total_sales_count: number | null
          track_stock: boolean | null
          turnover_rate: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          barcode?: string | null
          category: string
          category_id?: string
          cest?: string | null
          cfop?: string | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          markup?: number | null
          min_stock_level?: number | null
          minimum_stock?: number | null
          name: string
          ncm?: string | null
          origin?: number | null
          package_barcode?: string | null
          package_price?: number | null
          package_size?: number | null
          price: number
          stock_packages?: number | null
          stock_quantity?: number
          stock_units_loose?: number | null
          store1_holding_packages?: number | null
          store1_holding_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
          supplier_id?: string | null
          total_sales_count?: number | null
          track_stock?: boolean | null
          turnover_rate?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          barcode?: string | null
          category?: string
          category_id?: string
          cest?: string | null
          cfop?: string | null
          cost_price?: number | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          markup?: number | null
          min_stock_level?: number | null
          minimum_stock?: number | null
          name?: string
          ncm?: string | null
          origin?: number | null
          package_barcode?: string | null
          package_price?: number | null
          package_size?: number | null
          price?: number
          stock_packages?: number | null
          stock_quantity?: number
          stock_units_loose?: number | null
          store1_holding_packages?: number | null
          store1_holding_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
          supplier_id?: string | null
          total_sales_count?: number | null
          track_stock?: boolean | null
          turnover_rate?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string
          id: string
          product_base_price: number | null
          product_id: string
          quantity: number
          sale_id: string
          sale_type: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_base_price?: number | null
          product_id: string
          quantity: number
          sale_id: string
          sale_type?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          product_base_price?: number | null
          product_id?: string
          quantity?: number
          sale_id?: string
          sale_type?: string | null
          total_price?: number
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
          delivery_address: string | null
          delivery_address_json: Json | null
          delivery_completed_at: string | null
          delivery_fee: number | null
          delivery_person_id: string | null
          delivery_started_at: string | null
          delivery_status: string | null
          discount_amount: number | null
          final_amount: number
          id: string
          is_delivery: boolean | null
          notes: string | null
          payment_method: string
          payment_method_id: string | null
          status: Database["public"]["Enums"]["sales_status_enum"] | null
          subtotal: number | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: string | null
          delivery_address_json?: Json | null
          delivery_completed_at?: string | null
          delivery_fee?: number | null
          delivery_person_id?: string | null
          delivery_started_at?: string | null
          delivery_status?: string | null
          discount_amount?: number | null
          final_amount: number
          id?: string
          is_delivery?: boolean | null
          notes?: string | null
          payment_method: string
          payment_method_id?: string | null
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          subtotal?: number | null
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: string | null
          delivery_address_json?: Json | null
          delivery_completed_at?: string | null
          delivery_fee?: number | null
          delivery_person_id?: string | null
          delivery_started_at?: string | null
          delivery_status?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          is_delivery?: boolean | null
          notes?: string | null
          payment_method?: string
          payment_method_id?: string | null
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          subtotal?: number | null
          total_amount?: number
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
            foreignKeyName: "sales_delivery_person_id_fkey"
            columns: ["delivery_person_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          contact_info: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          contact_info?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          contact_info?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_customer_segmentation_kpis: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          days_since_first_purchase: number | null
          days_since_last_purchase: number | null
          customer_journey_days: number | null
          frequency_category: string | null
          is_active: boolean | null
          is_churned: boolean | null
          is_new: boolean | null
          is_recurring: boolean | null
          is_vip: boolean | null
          last_purchase_date: string | null
          purchase_frequency: number | null
          recency_category: string | null
          total_spent: number | null
          total_visits: number | null
          value_category: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      v_customer_stats: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          days_since_last_purchase: number | null
          last_purchase_date: string | null
          total_spent: number | null
          total_visits: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      v_financial_metrics: {
        Row: {
          avg_ticket: number | null
          metric_date: string | null
          total_cost: number | null
          total_discount: number | null
          total_margin: number | null
          total_profit: number | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      v_product_analytics: {
        Row: {
          avg_ticket: number | null
          current_stock_quantity: number | null
          last_sale_date: string | null
          product_id: string | null
          product_name: string | null
          profit_margin: number | null
          total_cost: number | null
          total_profit: number | null
          total_revenue: number | null
          total_units_sold: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_campaign_metrics: {
        Args: {
          campaign_uuid: string
        }
        Returns: Json
      }
      create_inventory_movement: {
        Args: {
          p_product_id: string
          p_quantity_change: number
          p_type: Database["public"]["Enums"]["movement_type"]
          p_reason?: string
          p_metadata?: Json
          p_cost_price?: number
        }
        Returns: {
          stock_after: number
          movement_id: string
        }[]
      }
      create_pre_sale: {
        Args: {
          p_user_id: string
          p_customer_id: string
          p_items: Json
          p_total_amount: number
          p_final_amount: number
          p_discount_amount: number
          p_payment_method: string
          p_is_delivery: boolean
          p_notes: string
          p_delivery_fee?: number
          p_delivery_address?: string
        }
        Returns: string
      }
      dashboard_kpis: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_revenue_today: number
          sales_count_today: number
          avg_ticket_today: number
          top_product_name: string
        }[]
      }
      delete_sale_cascade: {
        Args: {
          sale_uuid: string
        }
        Returns: {
          sale_items: number
          inventory_movements: number
        }[]
      }
      delete_user: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      get_monthly_expenses: {
        Args: {
          year: number
          month: number
        }
        Returns: {
          category: string
          total_amount: number
        }[]
      }
      process_sale: {
        Args: {
          p_user_id: string
          p_customer_id: string
          p_items: Json
          p_total_amount: number
          p_final_amount: number
          p_discount_amount: number
          p_payment_method_id: string
          p_is_delivery: boolean
          p_notes: string
        }
        Returns: string
      }
      refresh_materialized_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_delivery_status: {
        Args: {
          p_sale_id: string
          p_status: string
          p_notes: string
          p_delivery_person_id?: string
        }
        Returns: boolean
      }
      update_sale_items: {
        Args: {
          p_sale_id: string
          p_final_amount: number
          p_items: Json
        }
        Returns: boolean
      }
    }
    Enums: {
      campaign_status: ["draft", "scheduled", "active", "completed", "cancelled"]
      marketing_channel: ["whatsapp", "email", "sms", "push"]
      movement_type: [
        "sale",
        "initial_stock",
        "inventory_adjustment",
        "return",
        "stock_transfer_out",
        "stock_transfer_in",
        "personal_consumption",
        "purchase",
        "loss",
        "damaged"
      ]
      payment_method_enum: [
        "cash",
        "credit",
        "debit",
        "pix",
        "bank_transfer",
        "check",
        "other"
      ]
      report_period_type: ["day", "week", "month", "year"]
      sales_status_enum: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "refunded"
      ]
      user_role: ["admin", "employee", "delivery"]
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]
type DatabaseSchemaKeys = Exclude<keyof Database, "__InternalSupabase">

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: DatabaseSchemaKeys },
  TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: DatabaseSchemaKeys },
  TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: DatabaseSchemaKeys },
  TableName extends PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: DatabaseSchemaKeys }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: DatabaseSchemaKeys },
  EnumName extends PublicEnumNameOrOptions extends { schema: DatabaseSchemaKeys }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: DatabaseSchemaKeys }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: DatabaseSchemaKeys },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: DatabaseSchemaKeys
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: DatabaseSchemaKeys }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
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
        "purchase",
        "loss",
        "damaged"
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
