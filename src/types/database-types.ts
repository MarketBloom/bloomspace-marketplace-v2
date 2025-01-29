export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      florist_profiles: {
        Row: {
          id: string;
          user_id: string;
          store_name: string;
          store_status: 'pending' | 'active' | 'inactive';
          about_text: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          website_url: string | null;
          address: Json;
          location: unknown | null;
          business_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          store_name: string;
          store_status?: 'pending' | 'active' | 'inactive';
          about_text?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          address?: Json;
          location?: unknown | null;
          business_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          store_name?: string;
          store_status?: 'pending' | 'active' | 'inactive';
          about_text?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          website_url?: string | null;
          address?: Json;
          location?: unknown | null;
          business_settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          florist_id: string;
          name: string;
          description: string | null;
          price: number;
          status: 'active' | 'inactive' | 'deleted';
          images: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          florist_id: string;
          name: string;
          description?: string | null;
          price: number;
          status?: 'active' | 'inactive' | 'deleted';
          images?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          florist_id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          status?: 'active' | 'inactive' | 'deleted';
          images?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          florist_id: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_fee: number;
          delivery_address: Json;
          delivery_date: string;
          delivery_time_slot: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          florist_id: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          total_amount: number;
          delivery_fee: number;
          delivery_address: Json;
          delivery_date: string;
          delivery_time_slot: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          florist_id?: string;
          status?: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
          total_amount?: number;
          delivery_fee?: number;
          delivery_address?: Json;
          delivery_date?: string;
          delivery_time_slot?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price_at_time: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price_at_time?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      find_florists_within_radius: {
        Args: {
          lat: number;
          lng: number;
          radius_km: number;
        };
        Returns: {
          id: string;
          store_name: string;
          distance_km: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
