export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'employee' | 'delivery';

export type PaymentStatus = 'pending' | 'paid' | 'cancelled';
export type SaleStatus = 'completed' | 'cancelled' | 'returned';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock_quantity: number
          minimum_stock: number
          supplier: string | null
          cost_price: number | null
          margin_percent: number | null
          category: string
          vintage: number | null
          producer: string | null
          country: string | null
          region: string | null
          alcohol_content: number | null
          volume: number | null
          unit_type: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock_quantity?: number
          minimum_stock?: number
          supplier?: string | null
          cost_price?: number | null
          margin_percent?: number | null
          category: string
          vintage?: number | null
          producer?: string | null
          country?: string | null
          region?: string | null
          alcohol_content?: number | null
          volume?: number | null
          unit_type?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock_quantity?: number
          minimum_stock?: number
          supplier?: string | null
          cost_price?: number | null
          margin_percent?: number | null
          category?: string
          vintage?: number | null
          producer?: string | null
          country?: string | null
          region?: string | null
          alcohol_content?: number | null
          volume?: number | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: Json | null
          birthday: string | null
          contact_preference: string | null
          contact_permission: boolean
          first_purchase_date: string | null
          last_purchase_date: string | null
          purchase_frequency: string | null
          lifetime_value: number
          favorite_category: string | null
          favorite_product: string | null
          segment: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          birthday?: string | null
          contact_preference?: string | null
          contact_permission?: boolean
          first_purchase_date?: string | null
          last_purchase_date?: string | null
          purchase_frequency?: string | null
          lifetime_value?: number
          favorite_category?: string | null
          favorite_product?: string | null
          segment?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: Json | null
          birthday?: string | null
          contact_preference?: string | null
          contact_permission?: boolean
          first_purchase_date?: string | null
          last_purchase_date?: string | null
          purchase_frequency?: string | null
          lifetime_value?: number
          favorite_category?: string | null
          favorite_product?: string | null
          segment?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          icon: string | null
          is_active: boolean
          display_order: number
          created_at: string
          updated_at: string
          created_by: string | null
          default_min_stock: number | null
          default_min_stock_packages: number | null
          default_min_stock_units: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          default_min_stock?: number | null
          default_min_stock_packages?: number | null
          default_min_stock_units?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          icon?: string | null
          is_active?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
          default_min_stock?: number | null
        }
      }
      customer_insights: {
        Row: {
          id: string
          customer_id: string
          insight_type: string
          insight_value: string
          confidence: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          insight_type: string
          insight_value: string
          confidence: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          insight_type?: string
          insight_value?: string
          confidence?: number
          is_active?: boolean
          created_at?: string
        }
      }
      customer_interactions: {
        Row: {
          id: string
          customer_id: string
          interaction_type: string
          description: string
          associated_sale_id: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          interaction_type: string
          description: string
          associated_sale_id?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          interaction_type?: string
          description?: string
          associated_sale_id?: string | null
          created_by?: string
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          user_id: string
          seller_id: string | null
          total_amount: number
          discount_amount: number
          final_amount: number
          payment_method: string
          payment_status: 'pending' | 'paid' | 'cancelled'
          status: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered' | 'returned'
          delivery: boolean | null
          delivery_address: Json | null
          delivery_user_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id?: string | null
          user_id: string
          seller_id?: string | null
          total_amount: number
          discount_amount?: number
          final_amount?: number
          payment_method: string
          payment_status?: 'pending' | 'paid' | 'cancelled'
          status?: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered' | 'returned'
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_user_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string | null
          user_id?: string
          seller_id?: string | null
          total_amount?: number
          discount_amount?: number
          final_amount?: number
          payment_method?: string
          payment_status?: 'pending' | 'paid' | 'cancelled'
          status?: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered' | 'returned'
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_user_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_movements: {
        Row: {
          id: string
          date: string
          type?: 'in' | 'out'
          product_id: string
          quantity?: number
          reason: string | null
          user_id: string | null
          related_sale_id: string | null
          quantity_change: number
          type_enum: string
          metadata: Json
          new_stock_quantity: number
          customer_id: string | null
          sale_id: string | null
        }
        Insert: {
          id?: string
          date?: string
          type?: 'in' | 'out'
          product_id: string
          quantity?: number
          reason?: string | null
          user_id?: string | null
          related_sale_id?: string | null
          quantity_change: number
          type_enum: string
          metadata?: Json
          new_stock_quantity?: number
          customer_id?: string | null
          sale_id?: string | null
        }
        Update: {
          id?: string
          date?: string
          type?: 'in' | 'out'
          product_id?: string
          quantity?: number
          reason?: string | null
          user_id?: string | null
          related_sale_id?: string | null
          quantity_change?: number
          type_enum?: string
          metadata?: Json
          new_stock_quantity?: number
          customer_id?: string | null
          sale_id?: string | null
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      automation_logs: {
        Row: {
          id: string
          customer_id: string
          workflow_id: string
          workflow_name: string
          trigger_event: string
          result: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          workflow_id: string
          workflow_name: string
          trigger_event: string
          result: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          workflow_id?: string
          workflow_name?: string
          trigger_event?: string
          result?: string
          details?: Json | null
          created_at?: string
        }
      }
    }
  }
} 