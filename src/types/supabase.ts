export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'employee' | 'delivery';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
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
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          customer_id: string | null
          user_id: string
          total_amount: number
          payment_method: string
          status: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered'
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
          total_amount: number
          payment_method: string
          status?: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered'
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
          total_amount?: number
          payment_method?: string
          status?: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered'
          delivery?: boolean | null
          delivery_address?: Json | null
          delivery_user_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
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
    }
  }
} 