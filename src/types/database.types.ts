import { Json } from './supabase'

export type UserRole = 'customer' | 'florist' | 'admin'
export type StoreStatus = 'pending' | 'active' | 'inactive' | 'suspended'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tables['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      florist_profiles: {
        Row: {
          id: string
          user_id: string
          store_name: string
          store_status: StoreStatus
          about_text: string | null
          contact_email: string
          contact_phone: string
          website_url: string | null
          banner_url: string | null
          logo_url: string | null
          address_details: Json
          business_settings: Json
          social_links: Json | null
          commission_rate: number
          setup_progress: number
          setup_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['florist_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tables['florist_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: {
          id: string
          florist_id: string
          title: string
          description: string | null
          price: number
          category: string
          occasion: string[]
          images: string[]
          status: 'active' | 'inactive' | 'deleted'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Tables['products']['Row'], 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
} 