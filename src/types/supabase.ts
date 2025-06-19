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
          type: 'in' | 'out'
          product_id: string
          quantity: number
          reason: string | null
          user_id: string | null
          related_sale_id: string | null
        }
        Insert: {
          id?: string
          date?: string
          type: 'in' | 'out'
          product_id: string
          quantity: number
          reason?: string | null
          user_id?: string | null
          related_sale_id?: string | null
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
        }
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