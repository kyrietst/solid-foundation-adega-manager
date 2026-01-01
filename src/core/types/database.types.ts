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
          {
            foreignKeyName: "accounts_receivable_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sales_with_profit"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          city: string
          complement: string | null
          country: string
          created_at: string | null
          id: string
          neighborhood: string
          number: string
          postal_code: string
          state: string
          street: string
          updated_at: string | null
        }
        Insert: {
          city: string
          complement?: string | null
          country?: string
          created_at?: string | null
          id?: string
          neighborhood: string
          number: string
          postal_code: string
          state?: string
          street: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          complement?: string | null
          country?: string
          created_at?: string | null
          id?: string
          neighborhood?: string
          number?: string
          postal_code?: string
          state?: string
          street?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
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
      companies: {
        Row: {
          cnpj: string
          created_at: string | null
          dba_name: string
          id: string
          legal_name: string
          updated_at: string | null
        }
        Insert: {
          cnpj: string
          created_at?: string | null
          dba_name: string
          id?: string
          legal_name: string
          updated_at?: string | null
        }
        Update: {
          cnpj?: string
          created_at?: string | null
          dba_name?: string
          id?: string
          legal_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          bairro: string | null
          celular: string
          cidade: string | null
          complemento: string | null
          created_at: string | null
          data_nascimento: string | null
          id: string
          latitude: number | null
          logradouro: string | null
          longitude: number | null
          nome: string
          numero: string | null
          status: string | null
          tipo: string
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          celular: string
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome: string
          numero?: string | null
          status?: string | null
          tipo: string
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          celular?: string
          cidade?: string | null
          complemento?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          id?: string
          latitude?: number | null
          logradouro?: string | null
          longitude?: number | null
          nome?: string
          numero?: string | null
          status?: string | null
          tipo?: string
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_events: {
        Row: {
          created_at: string | null
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
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
      customer_segments: {
        Row: {
          created_at: string | null
          customer_id: string
          last_calculated_at: string | null
          segment_type: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          last_calculated_at?: string | null
          segment_type: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          last_calculated_at?: string | null
          segment_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_segments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_segments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "mv_customer_segmentation_kpis"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_segments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "v_customer_stats"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_kpis: {
        Row: {
          average_ticket: number
          calculated_at: string | null
          id: string
          period_end: string
          period_start: string
          total_revenue: number
          total_sales: number
        }
        Insert: {
          average_ticket: number
          calculated_at?: string | null
          id?: string
          period_end: string
          period_start: string
          total_revenue: number
          total_sales: number
        }
        Update: {
          average_ticket?: number
          calculated_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          total_revenue?: number
          total_sales?: number
        }
        Relationships: []
      }
      delivery_tracking: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          photo_url: string | null
          sale_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
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
            referencedRelation: "v_sales_with_profit"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          movement_type: string | null
          new_stock_quantity: number
          previous_stock: number
          product_id: string
          quantity_change: number
          reason: string | null
          related_sale_id: string | null
          sale_id: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          movement_type?: string | null
          new_stock_quantity: number
          previous_stock: number
          product_id: string
          quantity_change: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum: Database["public"]["Enums"]["movement_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          movement_type?: string | null
          new_stock_quantity?: number
          previous_stock?: number
          product_id?: string
          quantity_change?: number
          reason?: string | null
          related_sale_id?: string | null
          sale_id?: string | null
          type_enum?: Database["public"]["Enums"]["movement_type"]
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
            referencedRelation: "v_sales_with_profit"
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
            foreignKeyName: "inventory_movements_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sales_with_profit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          pdf_url: string | null
          sale_id: string | null
          status: string
          updated_at: string | null
          xml_url: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          pdf_url?: string | null
          sale_id?: string | null
          status: string
          updated_at?: string | null
          xml_url?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          pdf_url?: string | null
          sale_id?: string | null
          status?: string
          updated_at?: string | null
          xml_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_logs_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          }
        ]
      },
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
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
          min_stock_level: number | null
          minimum_stock: number | null
          name: string
          package_units: number | null
          price: number
          stock_packages: number
          stock_quantity: number
          stock_units_loose: number
          supplier_id: string | null
          units_per_package: number | null
          updated_at: string | null
          ncm: string | null
          cest: string | null
          cfop: string | null
          origin: string | null
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
          min_stock_level?: number | null
          minimum_stock?: number | null
          name: string
          package_units?: number | null
          price?: number
          stock_packages?: number
          stock_quantity?: number
          stock_units_loose?: number
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
          min_stock_level?: number | null
          minimum_stock?: number | null
          name?: string
          package_units?: number | null
          price?: number
          stock_packages?: number
          stock_quantity?: number
          stock_units_loose?: number
          supplier_id?: string | null
          units_per_package?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          created_at: string | null
          id: string
          package_units: number | null
          product_id: string
          quantity: number
          sale_id: string
          sale_type: string | null
          unit_price: number
          units_sold: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          package_units?: number | null
          product_id: string
          quantity: number
          sale_id: string
          sale_type?: string | null
          unit_price: number
          units_sold?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          package_units?: number | null
          product_id?: string
          quantity?: number
          sale_id?: string
          sale_type?: string | null
          unit_price?: number
          units_sold?: number | null
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
            referencedRelation: "v_sales_with_profit"
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
          delivery_fee: number | null
          delivery_person_id: string | null
          delivery_status: string | null
          delivery_type: string | null
          discount_amount: number | null
          final_amount: number
          id: string
          notes: string | null
          payment_method: string
          payment_status: string
          status: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_person_id?: string | null
          delivery_status?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          final_amount: number
          id?: string
          notes?: string | null
          payment_method: string
          payment_status?: string
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_fee?: number | null
          delivery_person_id?: string | null
          delivery_status?: string | null
          delivery_type?: string | null
          discount_amount?: number | null
          final_amount?: number
          id?: string
          notes?: string | null
          payment_method?: string
          payment_status?: string
          status?: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount?: number
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
            foreignKeyName: "sales_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          id: string
          created_at: string | null
          updated_at: string | null
          environment: string
          business_name: string | null
          trade_name: string | null
          cnpj: string | null
          ie: string | null
          address_street: string | null
          address_number: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_city: string | null
          address_state: string | null
          address_zip_code: string | null
          crt: string | null
        }
        Insert: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          environment?: string
          business_name?: string | null
          trade_name?: string | null
          cnpj?: string | null
          ie?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          crt?: string | null
        }
        Update: {
          id?: string
          created_at?: string | null
          updated_at?: string | null
          environment?: string
          business_name?: string | null
          trade_name?: string | null
          cnpj?: string | null
          ie?: string | null
          address_street?: string | null
          address_number?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_city?: string | null
          address_state?: string | null
          address_zip_code?: string | null
          crt?: string | null
        }
        Relationships: []
      },
      suppliers: {
        Row: {
          contact_info: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mv_customer_segmentation_kpis: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          days_since_last_purchase: number | null
          last_purchase_date: string | null
          purchase_frequency_days: number | null
          segment_type: string | null
          total_orders: number | null
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
      v_customer_stats: {
        Row: {
          avg_ticket: number | null
          customer_id: string | null
          customer_name: string | null
          first_purchase: string | null
          last_purchase: string | null
          total_discount: number | null
          total_orders: number | null
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
      v_sales_with_profit: {
        Row: {
          created_at: string | null
          customer_id: string | null
          delivery: boolean | null
          delivery_fee: number | null
          discount_amount: number | null
          final_amount: number | null
          final_amount_clean: number | null
          id: string | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          status: Database["public"]["Enums"]["sales_status_enum"] | null
          total_amount: number | null
          total_cost: number | null
          total_profit: number | null
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
    }
    Functions: {
      calculate_dashboard_kpis: {
        Args: {
          p_period_start: string
          p_period_end: string
        }
        Returns: Json
      }
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
      create_sale_with_items: {
        Args: {
          p_customer_id: string
          p_items: Json
          p_user_id: string
          p_total_amount: number
          p_payment_method: string
        }
        Returns: Json
      }
      delete_sale_with_items: {
        Args: {
          p_sale_id: string
        }
        Returns: undefined
      }
      get_dashboard_data: {
        Args: {
          p_start_date: string
          p_end_date: string
          p_previous_start_date: string
          p_previous_end_date: string
        }
        Returns: Json
      }
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_sales_by_period: {
        Args: {
          period_type: string
        }
        Returns: Json[]
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
      update_product_stock: {
        Args: {
          p_product_id: string
          p_quantity_change: number
          p_type: Database["public"]["Enums"]["movement_type"]
          p_reason: string
        }
        Returns: Json
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
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
