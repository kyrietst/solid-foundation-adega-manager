export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          read: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          read?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          read?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          cpf: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          inscricao_estadual: string | null
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome: string
          numero: string | null
          observacoes: string | null
          telefone: string | null
          tipo: string
          uf: string | null
          updated_at: string
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo: string
          uf?: string | null
          updated_at?: string
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          cpf?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          inscricao_estadual?: string | null
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome?: string
          numero?: string | null
          observacoes?: string | null
          telefone?: string | null
          tipo?: string
          uf?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_events: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          payload: Json | null
          source: string
          source_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          payload?: Json | null
          source: string
          source_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          payload?: Json | null
          source?: string
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
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          total_purchases: number | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_purchases?: number | null
          updated_at?: string | null
          zip_code?: string | null
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
          sale_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          sale_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          sale_id?: string | null
          status?: string | null
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
        ]
      }
      distributors: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          contact_person: string | null
          created_at: string | null
          distributor_type: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          state: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_type?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_type?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          payment_method: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          payment_method: string
          status?: string
          type: string
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
          payment_method?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          new_stock_quantity: number | null
          previous_stock: number | null
          product_id: string
          quantity_change: number
          reason: string
          related_sale_id: string | null
          sale_id: string | null
          type_enum: Database["public"]["Enums"]["movement_type"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_stock_quantity?: number | null
          previous_stock?: number | null
          product_id: string
          quantity_change: number
          reason: string
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          new_stock_quantity?: number | null
          previous_stock?: number | null
          product_id?: string
          quantity_change?: number
          reason?: string
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"] | null
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
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_low_stock_products"
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
      movement_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          alcohol_content: number | null
          barcode: string | null
          category: string | null
          category_id: string | null
          cest: string | null
          cfop: string | null
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
          id: string
          image_url: string | null
          is_package: boolean | null
          last_sale_date: string | null
          margin_percent: number | null
          measurement_type: string | null
          measurement_value: number | null
          minimum_stock: number
          name: string
          ncm: string | null
          origin: string | null
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
          updated_at: string | null
          vintage: string | null
          volume: string | null
          volume_ml: number | null
        }
        Insert: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          category_id?: string | null
          cest?: string | null
          cfop?: string | null
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
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: number | null
          minimum_stock?: number
          name: string
          ncm?: string | null
          origin?: string | null
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
          updated_at?: string | null
          vintage?: string | null
          volume?: string | null
          volume_ml?: number | null
        }
        Update: {
          alcohol_content?: number | null
          barcode?: string | null
          category?: string | null
          category_id?: string | null
          cest?: string | null
          cfop?: string | null
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
          id?: string
          image_url?: string | null
          is_package?: boolean | null
          last_sale_date?: string | null
          margin_percent?: number | null
          measurement_type?: string | null
          measurement_value?: number | null
          minimum_stock?: number
          name?: string
          ncm?: string | null
          origin?: string | null
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
          updated_at?: string | null
          vintage?: string | null
          volume?: string | null
          volume_ml?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          conversion_required: boolean | null
          created_at: string | null
          id: string
          package_units: number
          packages_converted: number
          product_id: string
          quantity: number
          sale_id: string
          sale_type: string
          unit_price: number
          units_sold: number
        }
        Insert: {
          conversion_required?: boolean | null
          created_at?: string | null
          id?: string
          package_units?: number
          packages_converted?: number
          product_id: string
          quantity: number
          sale_id: string
          sale_type?: string
          unit_price: number
          units_sold?: number
        }
        Update: {
          conversion_required?: boolean | null
          created_at?: string | null
          id?: string
          package_units?: number
          packages_converted?: number
          product_id?: string
          quantity?: number
          sale_id?: string
          sale_type?: string
          unit_price?: number
          units_sold?: number
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
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "v_low_stock_products"
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
          payment_method_enum: Database["public"]["Enums"]["payment_method_enum"] | null
          payment_status: string | null
          seller_id: string | null
          status: string | null
          status_enum: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
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
          payment_method_enum?: Database["public"]["Enums"]["payment_method_enum"] | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
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
          payment_method_enum?: Database["public"]["Enums"]["payment_method_enum"] | null
          payment_status?: string | null
          seller_id?: string | null
          status?: string | null
          status_enum?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number | null
          updated_at?: string | null
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
            foreignKeyName: "sales_delivery_user_id_fkey"
            columns: ["delivery_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_seller_id_fkey"
            columns: ["seller_id"]
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
    }
    Views: {
      mv_customer_segmentation_kpis: {
        Row: {
          avg_purchase_value: number | null
          customer_id: string | null
          first_purchase_date: string | null
          last_purchase_date: string | null
          purchase_frequency: number | null
          rfm_score: number | null
          segment: string | null
          total_spent: number | null
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
          avg_ticket: number | null
          customer_id: string | null
          last_purchase_date: string | null
          sales_count: number | null
          total_revenue: number | null
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
      v_financial_kpis: {
        Row: {
          accounts_receivable: number | null
          cash_balance: number | null
          expenses: number | null
          gross_profit: number | null
          net_profit: number | null
          revenue: number | null
        }
        Relationships: []
      }
      v_low_stock_products: {
        Row: {
          current_stock: number | null
          id: string | null
          minimum_stock: number | null
          name: string | null
          unit_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_inventory_movement: {
        Args: {
          p_product_id: string
          p_quantity_change: number
          p_type: Database["public"]["Enums"]["movement_type"]
          p_reason: string
          p_metadata?: Json
          p_movement_type?: string
        }
        Returns: Json
      }
      delete_sale_with_items: {
        Args: {
          p_sale_id: string
        }
        Returns: boolean
      }
      fn_log_sale_event: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      get_dual_stock_report: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          stock_units_loose: number
          stock_packages: number
          units_per_package: number
        }[]
      }
      get_low_stock_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_low_stock_products: {
        Args: {
          limit_count?: number
        }
        Returns: {
          id: string
          name: string
          quantity: number
          min_stock: number
          unit: string
        }[]
      }
      get_orphan_sales: {
        Args: Record<PropertyKey, never>
        Returns: {
          sale_id: string
          item_count: number
        }[]
      }
      get_product_stock_quantity: {
        Args: {
          p_product_id: string
        }
        Returns: number
      }
      get_sales_by_category: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          category: string
          total_revenue: number
          sales_count: number
        }[]
      }
      get_sales_by_payment_method: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          payment_method: string
          total_sales: number
        }[]
      }
      get_sales_chart_data: {
        Args: {
          start_date: string
          end_date: string
        }
        Returns: {
          sale_date: string
          daily_revenue: number
        }[]
      }
      get_stock_report_by_category: {
        Args: Record<PropertyKey, never>
        Returns: {
          category: string
          total_products: number
          total_stock_value: number
        }[]
      }
      process_sale: {
        Args: {
          p_customer_id: string
          p_user_id: string
          p_items: Json[]
          p_total_amount: number
          p_final_amount: number
          p_payment_method_id: string
          p_discount_amount?: number
          p_notes?: string
          p_is_delivery?: boolean
          p_delivery_fee?: number
          p_delivery_address?: string
          p_delivery_person_id?: string
          p_delivery_instructions?: string
        }
        Returns: Json
      }
      recalc_customer_insights: {
        Args: {
          p_customer_id: string
        }
        Returns: undefined
      }
      set_product_stock_absolute: {
        Args: {
          p_product_id: string
          p_stock_units: number
          p_stock_packages: number
        }
        Returns: undefined
      }
      sync_delivery_status_to_sale_status: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      sync_sales_enum_columns: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      validate_product_stock_update: {
        Args: Record<PropertyKey, never>
        Returns: unknown
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
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
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
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
