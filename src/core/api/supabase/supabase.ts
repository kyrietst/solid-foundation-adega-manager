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
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
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
          created_at: string | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
      batch_units: {
        Row: {
          batch_id: string
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          defects: string | null
          expired_at: string | null
          id: string
          location_code: string | null
          package_barcode: string | null
          package_code: string | null
          package_sequence: number | null
          product_id: string
          quality_notes: string | null
          reserved_at: string | null
          sale_id: string | null
          shelf_code: string | null
          sold_at: string | null
          status: string | null
          unit_barcode: string | null
          unit_code: string
          unit_sequence: number
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          defects?: string | null
          expired_at?: string | null
          id?: string
          location_code?: string | null
          package_barcode?: string | null
          package_code?: string | null
          package_sequence?: number | null
          product_id: string
          quality_notes?: string | null
          reserved_at?: string | null
          sale_id?: string | null
          shelf_code?: string | null
          sold_at?: string | null
          status?: string | null
          unit_barcode?: string | null
          unit_code: string
          unit_sequence: number
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          defects?: string | null
          expired_at?: string | null
          id?: string
          location_code?: string | null
          package_barcode?: string | null
          package_code?: string | null
          package_sequence?: number | null
          product_id?: string
          quality_notes?: string | null
          reserved_at?: string | null
          sale_id?: string | null
          shelf_code?: string | null
          sold_at?: string | null
          status?: string | null
          unit_barcode?: string | null
          unit_code?: string
          unit_sequence?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_units_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_units_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          default_min_stock_packages: number | null
          default_min_stock_units: number | null
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          default_min_stock_packages?: number | null
          default_min_stock_units?: number | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          default_min_stock_packages?: number | null
          default_min_stock_units?: number | null
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
            foreignKeyName: "customer_interactions_associated_sale_id_fkey"
            columns: ["associated_sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
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
          address: Json | null
          birthday: string | null
          contact_permission: boolean | null
          contact_preference: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
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
          tags: Json | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          birthday?: string | null
          contact_permission?: boolean | null
          contact_preference?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
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
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          birthday?: string | null
          contact_permission?: boolean | null
          contact_preference?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
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
          tags?: Json | null
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
      debug_stock_calls_log: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payload: Json
          session_info: Json | null
          source_identifier: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payload: Json
          session_info?: Json | null
          source_identifier: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payload?: Json
          session_info?: Json | null
          source_identifier?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          sale_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          sale_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          sale_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          color_hex: string | null
          created_at: string | null
          delivery_fee: number
          description: string | null
          estimated_time_minutes: number
          id: string
          is_active: boolean | null
          minimum_order_value: number | null
          name: string
          polygon: Json
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          color_hex?: string | null
          created_at?: string | null
          delivery_fee?: number
          description?: string | null
          estimated_time_minutes?: number
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          name: string
          polygon: Json
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          color_hex?: string | null
          created_at?: string | null
          delivery_fee?: number
          description?: string | null
          estimated_time_minutes?: number
          id?: string
          is_active?: boolean | null
          minimum_order_value?: number | null
          name?: string
          polygon?: Json
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_budgets: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category_id: string
          created_at: string | null
          created_by: string | null
          id: string
          month_year: string
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          month_year: string
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          month_year?: string
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          alert_threshold: number | null
          business_impact: string | null
          color: string | null
          created_at: string | null
          department: string | null
          description: string | null
          icon: string | null
          id: string
          is_fixed_expense: boolean | null
          is_tax_deductible: boolean | null
          max_single_expense: number | null
          name: string
          priority_level: string | null
          requires_receipt: boolean | null
          target_percentage: number | null
          typical_frequency: string | null
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          business_impact?: string | null
          color?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          icon?: string | null
          id: string
          is_fixed_expense?: boolean | null
          is_tax_deductible?: boolean | null
          max_single_expense?: number | null
          name: string
          priority_level?: string | null
          requires_receipt?: boolean | null
          target_percentage?: number | null
          typical_frequency?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          business_impact?: string | null
          color?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_fixed_expense?: boolean | null
          is_tax_deductible?: boolean | null
          max_single_expense?: number | null
          name?: string
          priority_level?: string | null
          requires_receipt?: boolean | null
          target_percentage?: number | null
          typical_frequency?: string | null
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
      expiry_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_packages: number | null
          affected_units: number | null
          alert_date: string
          alert_level: number
          alert_type: string
          batch_id: string
          created_at: string | null
          days_until_expiry: number
          estimated_loss_value: number | null
          expiry_date: string
          id: string
          message: string
          notification_method: string | null
          notification_sent: boolean | null
          notification_sent_at: string | null
          priority: number | null
          product_category: string | null
          product_id: string
          product_name: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          suggested_action: string | null
          supplier_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_packages?: number | null
          affected_units?: number | null
          alert_date: string
          alert_level?: number
          alert_type: string
          batch_id: string
          created_at?: string | null
          days_until_expiry: number
          estimated_loss_value?: number | null
          expiry_date: string
          id?: string
          message: string
          notification_method?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          priority?: number | null
          product_category?: string | null
          product_id: string
          product_name: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          suggested_action?: string | null
          supplier_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_packages?: number | null
          affected_units?: number | null
          alert_date?: string
          alert_level?: number
          alert_type?: string
          batch_id?: string
          created_at?: string | null
          days_until_expiry?: number
          estimated_loss_value?: number | null
          expiry_date?: string
          id?: string
          message?: string
          notification_method?: string | null
          notification_sent?: boolean | null
          notification_sent_at?: string | null
          priority?: number | null
          product_category?: string | null
          product_id?: string
          product_name?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          suggested_action?: string | null
          supplier_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expiry_alerts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "product_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expiry_alerts_product_id_fkey"
            columns: ["product_id"]
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
      inventory_conversion_log: {
        Row: {
          conversion_type: string
          created_at: string
          id: string
          package_stock_after: number
          package_stock_before: number
          packages_converted: number
          product_id: string
          reason: string | null
          sale_id: string | null
          unit_stock_after: number
          unit_stock_before: number
          units_converted: number
          units_per_package: number
          user_id: string | null
        }
        Insert: {
          conversion_type: string
          created_at?: string
          id?: string
          package_stock_after?: number
          package_stock_before?: number
          packages_converted?: number
          product_id: string
          reason?: string | null
          sale_id?: string | null
          unit_stock_after?: number
          unit_stock_before?: number
          units_converted?: number
          units_per_package: number
          user_id?: string | null
        }
        Update: {
          conversion_type?: string
          created_at?: string
          id?: string
          package_stock_after?: number
          package_stock_before?: number
          packages_converted?: number
          product_id?: string
          reason?: string | null
          sale_id?: string | null
          unit_stock_after?: number
          unit_stock_before?: number
          units_converted?: number
          units_per_package?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_conversion_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_conversion_log_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_conversion_log_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          customer_id: string | null
          date: string
          id: string
          metadata: Json | null
          new_stock_quantity: number | null
          previous_stock: number | null
          product_id: string
          quantity_change: number
          reason: string | null
          related_sale_id: string | null
          sale_id: string | null
          type_enum: Database["public"]["Enums"]["movement_type"] | null
          user_id: string | null
        }
        Insert: {
          customer_id?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          new_stock_quantity?: number | null
          previous_stock?: number | null
          product_id: string
          quantity_change: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"] | null
          user_id?: string | null
        }
        Update: {
          customer_id?: string | null
          date?: string
          id?: string
          metadata?: Json | null
          new_stock_quantity?: number | null
          previous_stock?: number | null
          product_id?: string
          quantity_change?: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"] | null
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
            foreignKeyName: "inventory_movements_related_sale_id_fkey"
            columns: ["related_sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
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
      notifications: {
        Row: {
          category: string
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nps_surveys: {
        Row: {
          channel: string | null
          comment: string | null
          context: Json | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          device_info: Json | null
          id: string
          response_date: string | null
          sale_id: string | null
          score: number
          survey_type: string | null
          updated_at: string | null
        }
        Insert: {
          channel?: string | null
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          device_info?: Json | null
          id?: string
          response_date?: string | null
          sale_id?: string | null
          score: number
          survey_type?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string | null
          comment?: string | null
          context?: Json | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          device_info?: Json | null
          id?: string
          response_date?: string | null
          sale_id?: string | null
          score?: number
          survey_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nps_surveys_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "nps_surveys_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "nps_surveys_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nps_surveys_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      operational_expenses: {
        Row: {
          amount: number
          budget_category: string | null
          category_id: string
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string
          id: string
          is_recurring: boolean | null
          payment_method: string
          receipt_url: string | null
          recurring_frequency: string | null
          subcategory: string | null
          supplier_vendor: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          budget_category?: string | null
          category_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date: string
          id?: string
          is_recurring?: boolean | null
          payment_method: string
          receipt_url?: string | null
          recurring_frequency?: string | null
          subcategory?: string | null
          supplier_vendor?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          budget_category?: string | null
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          is_recurring?: boolean | null
          payment_method?: string
          receipt_url?: string | null
          recurring_frequency?: string | null
          subcategory?: string | null
          supplier_vendor?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
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
          type: Database["public"]["Enums"]["payment_method_enum"] | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: Database["public"]["Enums"]["payment_method_enum"] | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["payment_method_enum"] | null
        }
        Relationships: []
      }
      product_batches: {
        Row: {
          available_packages: number
          available_units: number
          batch_code: string
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          expiry_date: string
          id: string
          manufacturing_date: string
          notes: string | null
          package_barcode_prefix: string | null
          product_id: string
          quality_grade: string | null
          received_date: string
          status: string | null
          supplier_batch_code: string | null
          supplier_id: string | null
          supplier_name: string | null
          total_cost: number | null
          total_packages: number
          total_units: number
          unit_barcode_prefix: string | null
          updated_at: string | null
        }
        Insert: {
          available_packages?: number
          available_units?: number
          batch_code: string
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          expiry_date: string
          id?: string
          manufacturing_date: string
          notes?: string | null
          package_barcode_prefix?: string | null
          product_id: string
          quality_grade?: string | null
          received_date?: string
          status?: string | null
          supplier_batch_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          total_packages?: number
          total_units?: number
          unit_barcode_prefix?: string | null
          updated_at?: string | null
        }
        Update: {
          available_packages?: number
          available_units?: number
          batch_code?: string
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string
          id?: string
          manufacturing_date?: string
          notes?: string | null
          package_barcode_prefix?: string | null
          product_id?: string
          quality_grade?: string | null
          received_date?: string
          status?: string | null
          supplier_batch_code?: string | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_cost?: number | null
          total_packages?: number
          total_units?: number
          unit_barcode_prefix?: string | null
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
          alcohol_content: number | null
          barcode: string | null
          category: string
          cost_price: number | null
          country: string | null
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
          measurement_type: string | null
          measurement_value: string | null
          minimum_stock: number | null
          name: string
          package_barcode: string | null
          package_margin: number | null
          package_price: number | null
          package_size: number | null
          package_units: number | null
          packaging_type: string | null
          price: number
          producer: string | null
          region: string | null
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
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name: string
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price: number
          producer?: string | null
          region?: string | null
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
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name?: string
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number
          producer?: string | null
          region?: string | null
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
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Relationships: []
      }
      products_backup_deploy_final: {
        Row: {
          alcohol_content: number | null
          barcode: string | null
          category: string | null
          cost_price: number | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          expiry_date: string | null
          has_expiry_tracking: boolean | null
          has_package_tracking: boolean | null
          has_unit_tracking: boolean | null
          id: string | null
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          margin_percent: number | null
          measurement_type: string | null
          measurement_value: string | null
          minimum_stock: number | null
          name: string | null
          package_barcode: string | null
          package_margin: number | null
          package_price: number | null
          package_size: number | null
          package_units: number | null
          packaging_type: string | null
          price: number | null
          producer: string | null
          region: string | null
          stock_packages: number | null
          stock_quantity: number | null
          stock_units_loose: number | null
          store2_holding_packages: number | null
          store2_holding_units_loose: number | null
          supplier: string | null
          turnover_rate: string | null
          unit_barcode: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string | null
          vintage: number | null
          volume: number | null
          volume_ml: number | null
        }
        Insert: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string | null
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number | null
          producer?: string | null
          region?: string | null
          stock_packages?: number | null
          stock_quantity?: number | null
          stock_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string | null
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Update: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string | null
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number | null
          producer?: string | null
          region?: string | null
          stock_packages?: number | null
          stock_quantity?: number | null
          stock_units_loose?: number | null
          store2_holding_packages?: number | null
          store2_holding_units_loose?: number | null
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string | null
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Relationships: []
      }
      products_backup_pre_deploy_20251128: {
        Row: {
          alcohol_content: number | null
          barcode: string | null
          category: string | null
          cost_price: number | null
          country: string | null
          created_at: string | null
          deleted_at: string | null
          deleted_by: string | null
          description: string | null
          expiry_date: string | null
          has_expiry_tracking: boolean | null
          has_package_tracking: boolean | null
          has_unit_tracking: boolean | null
          id: string | null
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          margin_percent: number | null
          measurement_type: string | null
          measurement_value: string | null
          minimum_stock: number | null
          name: string | null
          package_barcode: string | null
          package_margin: number | null
          package_price: number | null
          package_size: number | null
          package_units: number | null
          packaging_type: string | null
          price: number | null
          producer: string | null
          region: string | null
          stock_packages: number | null
          stock_quantity: number | null
          stock_units_loose: number | null
          store1_stock_packages: number | null
          store1_stock_units_loose: number | null
          store2_stock_packages: number | null
          store2_stock_units_loose: number | null
          supplier: string | null
          turnover_rate: string | null
          unit_barcode: string | null
          unit_type: string | null
          units_per_package: number | null
          updated_at: string | null
          vintage: number | null
          volume: number | null
          volume_ml: number | null
        }
        Insert: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string | null
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number | null
          producer?: string | null
          region?: string | null
          stock_packages?: number | null
          stock_quantity?: number | null
          stock_units_loose?: number | null
          store1_stock_packages?: number | null
          store1_stock_units_loose?: number | null
          store2_stock_packages?: number | null
          store2_stock_units_loose?: number | null
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string | null
          vintage?: number | null
          volume?: number | null
          volume_ml?: number | null
        }
        Update: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          cost_price?: number | null
          country?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string | null
          expiry_date?: string | null
          has_expiry_tracking?: boolean | null
          has_package_tracking?: boolean | null
          has_unit_tracking?: boolean | null
          id?: string | null
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: string | null
          minimum_stock?: number | null
          name?: string | null
          package_barcode?: string | null
          package_margin?: number | null
          package_price?: number | null
          package_size?: number | null
          package_units?: number | null
          packaging_type?: string | null
          price?: number | null
          producer?: string | null
          region?: string | null
          stock_packages?: number | null
          stock_quantity?: number | null
          stock_units_loose?: number | null
          store1_stock_packages?: number | null
          store1_stock_units_loose?: number | null
          store2_stock_packages?: number | null
          store2_stock_units_loose?: number | null
          supplier?: string | null
          turnover_rate?: string | null
          unit_barcode?: string | null
          unit_type?: string | null
          units_per_package?: number | null
          updated_at?: string | null
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
          feature_flags: Json
          id: string
          is_temporary_password: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          feature_flags?: Json
          id: string
          is_temporary_password?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          feature_flags?: Json
          id?: string
          is_temporary_password?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          conversion_required: boolean | null
          created_at: string
          id: string
          package_units: number | null
          packages_converted: number | null
          product_description_legacy: string | null
          product_id: string | null
          quantity: number
          sale_id: string
          sale_type: string | null
          unit_price: number
          units_sold: number | null
          variant_id: string | null
        }
        Insert: {
          conversion_required?: boolean | null
          created_at?: string
          id?: string
          package_units?: number | null
          packages_converted?: number | null
          product_description_legacy?: string | null
          product_id?: string | null
          quantity: number
          sale_id: string
          sale_type?: string | null
          unit_price: number
          units_sold?: number | null
          variant_id?: string | null
        }
        Update: {
          conversion_required?: boolean | null
          created_at?: string
          id?: string
          package_units?: number | null
          packages_converted?: number | null
          product_description_legacy?: string | null
          product_id?: string | null
          quantity?: number
          sale_id?: string
          sale_type?: string | null
          unit_price?: number
          units_sold?: number | null
          variant_id?: string | null
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
            referencedRelation: "v_customer_purchases"
            referencedColumns: ["purchase_id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
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
          discount_amount: number
          estimated_delivery_time: string | null
          final_amount: number
          id: string
          notes: string | null
          order_number: number
          payment_method: string
          payment_method_enum:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status: string
          seller_id: string | null
          status: string
          status_enum: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
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
          discount_amount?: number
          estimated_delivery_time?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method: string
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string
          seller_id?: string | null
          status?: string
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
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
          discount_amount?: number
          estimated_delivery_time?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string
          seller_id?: string | null
          status?: string
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sales_delivery_zone_id"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
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
      sales_backup_20251113: {
        Row: {
          created_at: string
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
          discount_amount: number
          estimated_delivery_time: string | null
          final_amount: number
          id: string
          notes: string | null
          order_number: number
          payment_method: string
          payment_method_enum:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status: string
          seller_id: string | null
          status: string
          status_enum: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
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
          discount_amount?: number
          estimated_delivery_time?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method: string
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string
          seller_id?: string | null
          status?: string
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
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
          discount_amount?: number
          estimated_delivery_time?: string | null
          final_amount?: number
          id?: string
          notes?: string | null
          order_number?: number
          payment_method?: string
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string
          seller_id?: string | null
          status?: string
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sales_backup_deploy_final: {
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
          id: string | null
          notes: string | null
          order_number: number | null
          payment_method: string | null
          payment_method_enum:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status: string | null
          seller_id: string | null
          status: string | null
          status_enum: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number | null
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
          id?: string | null
          notes?: string | null
          order_number?: number | null
          payment_method?: string | null
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number | null
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
          id?: string | null
          notes?: string | null
          order_number?: number | null
          payment_method?: string | null
          payment_method_enum?:
            | Database["public"]["Enums"]["payment_method_enum"]
            | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      store_transfers_backup_pre_deploy_20251128: {
        Row: {
          created_at: string | null
          from_store: number | null
          id: string | null
          notes: string | null
          packages: number | null
          product_id: string | null
          to_store: number | null
          units_loose: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          from_store?: number | null
          id?: string | null
          notes?: string | null
          packages?: number | null
          product_id?: string | null
          to_store?: number | null
          units_loose?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          from_store?: number | null
          id?: string | null
          notes?: string | null
          packages?: number | null
          product_id?: string | null
          to_store?: number | null
          units_loose?: number | null
          user_id?: string | null
        }
        Relationships: []
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
          new_stock: string | null
          notes: string | null
          previous_stock: string | null
          product_category: string | null
          product_name: string | null
          quantity: number | null
          reason: string | null
          reference_number: string | null
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
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
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
      add_delivery_tracking: {
        Args: {
          p_created_by?: string
          p_location_lat?: number
          p_location_lng?: number
          p_notes?: string
          p_sale_id: string
          p_status: string
        }
        Returns: string
      }
      adjust_stock_packages: {
        Args: {
          p_packages_delta: number
          p_product_id: string
          p_reason?: string
        }
        Returns: Json
      }
      adjust_stock_units_loose: {
        Args: { p_product_id: string; p_reason?: string; p_units_delta: number }
        Returns: Json
      }
      analyze_debug_stock_logs: {
        Args: { p_hours_back?: number; p_product_id?: string }
        Returns: {
          actual_state: Json
          created_at: string
          discrepancy_detected: boolean
          expected_changes: Json
          log_id: string
          notes: string
          product_id: string
          source_identifier: string
        }[]
      }
      assign_delivery_person: {
        Args: {
          p_auto_assign?: boolean
          p_delivery_person_id?: string
          p_sale_id: string
        }
        Returns: Json
      }
      break_packages_to_loose: {
        Args: { p_packages_to_break: number; p_product_id: string }
        Returns: Json
      }
      calculate_budget_variance: {
        Args: { target_month: number; target_year: number }
        Returns: {
          actual_amount: number
          budgeted_amount: number
          category_id: string
          category_name: string
          status: string
          variance: number
          variance_percent: number
        }[]
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
      calculate_delivery_kpis: {
        Args: {
          p_delivery_person_id?: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_delivery_fee: number
          avg_delivery_time_minutes: number
          avg_distance_per_delivery: number
          avg_preparation_time_minutes: number
          cancelled_deliveries: number
          completed_deliveries: number
          customer_satisfaction_rate: number
          efficiency_score: number
          late_deliveries: number
          on_time_deliveries: number
          on_time_rate: number
          total_deliveries: number
          total_delivery_fees: number
          total_distance_km: number
        }[]
      }
      calculate_delivery_person_score: {
        Args: { p_days?: number; p_delivery_person_id: string }
        Returns: {
          avg_delivery_time: number
          completed_deliveries: number
          completion_rate: number
          delivery_person_id: string
          delivery_person_name: string
          efficiency_score: number
          on_time_rate: number
          performance_grade: string
          total_deliveries: number
        }[]
      }
      calculate_turnover_rate: { Args: never; Returns: undefined }
      change_password_unified: {
        Args: { current_password: string; new_password: string }
        Returns: Json
      }
      check_all_expiry_alerts: { Args: never; Returns: number }
      check_rate_limit: {
        Args: { p_email: string; p_ip: string }
        Returns: boolean
      }
      check_variant_availability: {
        Args: {
          p_product_id: string
          p_quantity: number
          p_variant_type: string
        }
        Returns: Json
      }
      cleanup_debug_logs: { Args: { p_days_to_keep?: number }; Returns: number }
      convert_loose_to_packages: {
        Args: { p_product_id: string }
        Returns: Json
      }
      convert_to_sao_paulo: {
        Args: { input_timestamp: string }
        Returns: string
      }
      create_csv_product_mapping: { Args: never; Returns: number }
      create_direct_admin: {
        Args: { p_email: string; p_name?: string; p_password: string }
        Returns: Json
      }
      create_expiry_alert_if_needed: {
        Args: { p_batch_id: string }
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
      create_inventory_movement:
        | {
            Args: {
              p_movement_type: string
              p_movement_variant_type?: string
              p_product_id: string
              p_quantity_change: number
              p_reason: string
            }
            Returns: string
          }
        | {
            Args: {
              p_metadata?: Json
              p_movement_type?: string
              p_product_id: string
              p_quantity_change: number
              p_reason: string
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
      debug_log_stock_adjustment: {
        Args: {
          p_packages_change: number
          p_product_id: string
          p_reason: string
          p_units_loose_change: number
        }
        Returns: undefined
      }
      decrement_product_stock: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: undefined
      }
      delete_sale_cascade: { Args: { sale_uuid: string }; Returns: Json }
      delete_sale_with_items: { Args: { p_sale_id: string }; Returns: Json }
      delete_user_profile: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      delete_user_role: { Args: { user_id_param: string }; Returns: undefined }
      detect_late_deliveries: {
        Args: never
        Returns: {
          current_status: string
          customer_name: string
          delay_minutes: number
          delivery_person_name: string
          estimated_time: string
          sale_id: string
          zone_name: string
        }[]
      }
      find_matching_product: {
        Args: { product_description: string }
        Returns: {
          match_score: number
          product_id: string
          product_name: string
        }[]
      }
      format_br_datetime: { Args: { input_timestamp: string }; Returns: string }
      get_available_delivery_persons: {
        Args: never
        Returns: {
          active_deliveries: number
          avg_delivery_time_minutes: number
          completed_today: number
          delivery_person_email: string
          delivery_person_id: string
          delivery_person_name: string
          is_available: boolean
        }[]
      }
      get_category_mix: {
        Args: { end_date: string; start_date: string }
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
        Args: { end_date: string; start_date: string }
        Returns: {
          active_customers: number
          new_customers: number
          total_customers: number
        }[]
      }
      get_customer_real_metrics: {
        Args: { p_customer_id: string }
        Returns: Json
      }
      get_customer_retention: {
        Args: { end_date: string; start_date: string }
        Returns: {
          lost: number
          period: string
          retained: number
        }[]
      }
      get_customer_satisfaction_metrics: {
        Args: { p_days?: number }
        Returns: {
          avg_rating: number
          complaint_rate: number
          five_star_percentage: number
          repeat_customer_rate: number
          total_reviews: number
        }[]
      }
      get_customer_summary: {
        Args: { end_date: string; period_type?: string; start_date: string }
        Returns: {
          average_order_value: number
          new_customers: number
          period_label: string
          period_start: string
          returning_customers: number
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
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          balance: number
          date: string
          income: number
          outcome: number
        }[]
      }
      get_daily_kpi_summary: {
        Args: { days_back?: number }
        Returns: {
          avg_order_value: number
          period_end: string
          period_start: string
          total_revenue: number
          total_sales: number
          unique_customers: number
        }[]
      }
      get_dashboard_financials: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          average_ticket: number
          cogs: number
          gross_profit: number
          sales_count: number
          total_revenue: number
        }[]
      }
      get_deleted_customers:
        | {
            Args: { p_limit?: number; p_offset?: number }
            Returns: {
              days_since_deletion: number
              deleted_at: string
              deleted_by: string
              deleted_by_name: string
              email: string
              id: string
              lifetime_value: number
              name: string
              phone: string
              total_purchases: number
            }[]
          }
        | {
            Args: { p_user_id: string }
            Returns: {
              deleted_at: string
              deleted_by_name: string
              email: string
              id: string
              lifetime_value: number
              name: string
              sales_count: number
            }[]
          }
      get_delivery_daily_trends: {
        Args: { p_days?: number }
        Returns: {
          avg_delivery_time: number
          late_orders: number
          on_time_orders: number
          total_orders: number
          total_revenue: number
          trend_date: string
        }[]
      }
      get_delivery_kpis_report: {
        Args: { p_days?: number }
        Returns: {
          benchmark: string
          category: string
          metric_name: string
          metric_unit: string
          metric_value: string
          status: string
        }[]
      }
      get_delivery_metrics: {
        Args: { p_end_date?: string; p_start_date?: string }
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
      get_delivery_person_daily_details: {
        Args: { p_days?: number; p_person_id: string }
        Returns: {
          avg_time: number
          date: string
          deliveries_count: number
          on_time_count: number
          person_id: string
          person_name: string
          revenue: number
          total_time: number
        }[]
      }
      get_delivery_person_performance:
        | {
            Args: { p_days?: number }
            Returns: {
              avg_delivery_time: number
              customer_rating: number
              efficiency: number
              id: string
              name: string
              on_time_rate: number
              total_deliveries: number
              total_revenue: number
            }[]
          }
        | {
            Args: { p_end_date?: string; p_start_date?: string }
            Returns: {
              avg_delivery_time_minutes: number
              completed_deliveries: number
              completion_rate: number
              delivery_person_id: string
              delivery_person_name: string
              total_deliveries: number
              total_revenue: number
            }[]
          }
      get_delivery_summary_report: {
        Args: { p_days?: number; p_status?: string; p_zone_id?: string }
        Returns: {
          actual_delivery_time: string
          created_at: string
          customer_name: string
          delivery_address: string
          delivery_fee: number
          delivery_person_name: string
          delivery_status: string
          estimated_delivery_time: string
          final_amount: number
          on_time: boolean
          sale_id: string
          zone_name: string
        }[]
      }
      get_delivery_timeline: {
        Args: { p_sale_id: string }
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
        Args: { p_end_date: string; p_start_date: string }
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
      get_delivery_vs_instore_comparison:
        | {
            Args: { p_days: number }
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
        | {
            Args: { p_end_date: string; p_start_date: string }
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
      get_delivery_zone_analysis: {
        Args: { p_end_date?: string; p_start_date?: string }
        Returns: {
          avg_delivery_time: number
          completion_rate: number
          total_orders: number
          total_revenue: number
          zone_id: string
          zone_name: string
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
        Args: { end_date: string; start_date: string }
        Returns: {
          avg_expense: number
          top_category: string
          top_category_amount: number
          total_expenses: number
          total_transactions: number
        }[]
      }
      get_expiry_alerts_30_days: {
        Args: { limit_count?: number }
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
      get_expiry_statistics: {
        Args: never
        Returns: {
          attention_30_days: number
          critical_7_days: number
          expired_batches: number
          expired_value: number
          total_batches_monitored: number
          total_units_at_risk: number
          total_value_at_risk: number
          warning_15_days: number
        }[]
      }
      get_financial_metrics: {
        Args: { end_date: string; start_date: string }
        Returns: {
          cogs: number
          gross_revenue: number
          net_revenue: number
        }[]
      }
      get_inventory_financials: { Args: never; Returns: Json }
      get_inventory_kpis: {
        Args: { p_end_date: string; p_start_date: string }
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
      get_inventory_metrics: {
        Args: never
        Returns: {
          total_products: number
          total_value: number
        }[]
      }
      get_inventory_summary: {
        Args: { end_date: string; period_type?: string; start_date: string }
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
      get_low_stock_count: { Args: never; Returns: number }
      get_low_stock_products: {
        Args: { p_limit?: number; p_offset?: number }
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
        Args: { p_product_id: string }
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
        Args: { months_back?: number }
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
      get_pending_deliveries_count: { Args: never; Returns: number }
      get_product_cost_at_date: {
        Args: { p_date?: string; p_product_id: string }
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
        Args: { p_product_id: string }
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
        Args: { p_product_id: string }
        Returns: number
      }
      get_product_total_units: {
        Args: { p_product_id: string }
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
        Args: { end_date: string; start_date: string }
        Returns: {
          category_name: string
          total_revenue: number
        }[]
      }
      get_sales_by_payment_method: {
        Args: { end_date: string; start_date: string }
        Returns: {
          avg_ticket: number
          payment_method: string
          total_revenue: number
          total_sales: number
        }[]
      }
      get_sales_chart_data: {
        Args: { p_end_date: string; p_start_date: string }
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
      get_sales_metrics: {
        Args: { end_date: string; start_date: string }
        Returns: {
          average_ticket: number
          total_revenue: number
          total_sales: number
        }[]
      }
      get_sales_trends: {
        Args: { end_date: string; period_type: string; start_date: string }
        Returns: {
          date_trunc: string
          total_sales: number
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
        Args: { end_date: string; limit_count: number; start_date: string }
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
            Args: { end_date: string; limit_count: number; start_date: string }
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
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_zone_benchmarks: {
        Args: { p_days?: number }
        Returns: {
          improvement_potential: string
          overall_rank: number
          performance_score: number
          punctuality_rank: number
          revenue_rank: number
          time_rank: number
          zone_name: string
        }[]
      }
      get_zone_detailed_analysis: {
        Args: { p_days?: number }
        Returns: {
          avg_distance: number
          customer_density: number
          delivery_fee: number
          peak_hours: string
          repeat_rate: number
          zone_id: string
          zone_name: string
        }[]
      }
      get_zone_peak_hours_analysis: {
        Args: { p_days?: number; p_zone_id?: string }
        Returns: {
          avg_delivery_time: number
          hour_of_day: number
          order_count: number
          revenue: number
          zone_name: string
        }[]
      }
      get_zone_performance: {
        Args: { p_days?: number }
        Returns: {
          avg_delivery_time: number
          on_time_rate: number
          order_count: number
          revenue: number
          zone_name: string
        }[]
      }
      hard_delete_customer: {
        Args: {
          p_confirmation_text: string
          p_customer_id: string
          p_user_id: string
        }
        Returns: Json
      }
      has_feature_flag: { Args: { p_flag_name: string }; Returns: boolean }
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
      is_admin: { Args: never; Returns: boolean }
      is_supreme_admin: { Args: never; Returns: boolean }
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
      log_auth_attempt: {
        Args: {
          p_email: string
          p_ip: string
          p_success: boolean
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_user_login: {
        Args: { user_email: string; user_id: string }
        Returns: undefined
      }
      migrate_invalid_categories_to_outros: { Args: never; Returns: number }
      monitor_expiry_alerts: { Args: never; Returns: Json }
      normalize_brazilian_phone: {
        Args: { phone_input: string }
        Returns: string
      }
      parse_csv_product_item: {
        Args: { item_text: string }
        Returns: {
          clean_name: string
          original: string
          quantity: number
        }[]
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
      recalc_all_customer_last_purchase: { Args: never; Returns: number }
      recalc_customer_insights: {
        Args: { p_customer_id: string }
        Returns: undefined
      }
      record_nps_survey: {
        Args: {
          p_channel?: string
          p_comment?: string
          p_context?: Json
          p_customer_id: string
          p_sale_id?: string
          p_score: number
          p_survey_type?: string
        }
        Returns: string
      }
      record_product_movement: {
        Args: {
          p_notes?: string
          p_product_id: string
          p_quantity: number
          p_reason?: string
          p_reference_number?: string
          p_related_sale_id?: string
          p_source?: string
          p_type: string
          p_user_id?: string
        }
        Returns: string
      }
      refresh_all_kpi_views: { Args: never; Returns: string }
      reprocess_csv_sale_with_real_products: {
        Args: { p_products_text: string; p_sale_id: string }
        Returns: {
          processed_items: number
          total_value: number
        }[]
      }
      reset_admin_password: { Args: { p_password: string }; Returns: undefined }
      restore_customer: {
        Args: { p_customer_id: string; p_user_id: string }
        Returns: Json
      }
      schedule_mv_refresh: { Args: { schedule_type?: string }; Returns: string }
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
      set_product_stock_absolute_multistore: {
        Args: {
          p_new_packages: number
          p_new_units_loose: number
          p_product_id: string
          p_reason: string
          p_store?: number
          p_user_id: string
        }
        Returns: Json
      }
      setup_first_admin: {
        Args: { p_email: string; p_name: string }
        Returns: Json
      }
      soft_delete_customer: {
        Args: { p_customer_id: string; p_user_id: string }
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
      update_estimated_delivery_times: { Args: never; Returns: undefined }
      upsert_customer_from_csv: {
        Args: { p_address: string; p_name: string; p_phone: string }
        Returns: string
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
