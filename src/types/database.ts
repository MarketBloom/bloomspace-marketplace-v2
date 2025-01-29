import { OrderItemsTable, OrdersTable } from './order';
import { ProductSizesTable, ProductsTable } from './product';
import { ReviewsTable } from './review';
import { FloristApplicationsTable } from './application';
import { FloristProfilesTable } from './florist';
import { ProfilesTable } from './profile';

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
      florist_applications: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          store_name: string | null
          address: string | null
          about_business: string | null
          years_experience: number | null
          website_url: string | null
          instagram_url: string | null
          portfolio_urls: string[] | null
          specialties: string[] | null
          average_order_value: number | null
          weekly_order_capacity: number | null
          has_physical_store: boolean | null
          delivery_capabilities: string | null
          status: string
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone?: string | null
          store_name?: string | null
          address?: string | null
          about_business?: string | null
          years_experience?: number | null
          website_url?: string | null
          instagram_url?: string | null
          portfolio_urls?: string[] | null
          specialties?: string[] | null
          average_order_value?: number | null
          weekly_order_capacity?: number | null
          has_physical_store?: boolean | null
          delivery_capabilities?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          store_name?: string | null
          address?: string | null
          about_business?: string | null
          years_experience?: number | null
          website_url?: string | null
          instagram_url?: string | null
          portfolio_urls?: string[] | null
          specialties?: string[] | null
          average_order_value?: number | null
          weekly_order_capacity?: number | null
          has_physical_store?: boolean | null
          delivery_capabilities?: string | null
          status?: string
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      florist_profiles: {
        Row: {
          id: string;
          store_name: string;
          street_address: string;
          about_text: string | null;
          operating_hours: Record<string, any> | null;
          delivery_cutoff: string | null;
          is_premium: boolean | null;
          premium_since: string | null;
          verified: boolean | null;
          commission_rate: number | null;
          created_at: string;
          updated_at: string;
          delivery_start_time: string | null;
          delivery_end_time: string | null;
          delivery_slot_duration: string | null;
          logo_url: string | null;
          banner_url: string | null;
          social_links: Record<string, any> | null;
          delivery_fee: number | null;
          delivery_radius: number | null;
          minimum_order_amount: number | null;
          setup_progress: number | null;
          store_status: string | null;
          setup_completed_at: string | null;
          delivery_days: string[] | null;
          pickup_only_days: string[] | null;
          delivery_cutoff_times: Record<string, any> | null;
          same_day_enabled: boolean | null;
          delivery_time_frames: Record<string, any> | null;
          coordinates: any | null;
          geocoded_address: Record<string, any> | null;
          delivery_distance_km: number | null;
          suburb: string | null;
          state: string | null;
          postcode: string | null;
        };
        Insert: {
          id: string;
          store_name: string;
          street_address: string;
          about_text?: string | null;
          operating_hours?: Record<string, any> | null;
          delivery_cutoff?: string | null;
          is_premium?: boolean | null;
          premium_since?: string | null;
          verified?: boolean | null;
          commission_rate?: number | null;
          created_at?: string;
          updated_at?: string;
          delivery_start_time?: string | null;
          delivery_end_time?: string | null;
          delivery_slot_duration?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          social_links?: Record<string, any> | null;
          delivery_fee?: number | null;
          delivery_radius?: number | null;
          minimum_order_amount?: number | null;
          setup_progress?: number | null;
          store_status?: string | null;
          setup_completed_at?: string | null;
          delivery_days?: string[] | null;
          pickup_only_days?: string[] | null;
          delivery_cutoff_times?: Record<string, any> | null;
          same_day_enabled?: boolean | null;
          delivery_time_frames?: Record<string, any> | null;
          coordinates?: any | null;
          geocoded_address?: Record<string, any> | null;
          delivery_distance_km?: number | null;
          suburb?: string | null;
          state?: string | null;
          postcode?: string | null;
        };
        Update: {
          id?: string;
          store_name?: string;
          street_address?: string;
          about_text?: string | null;
          operating_hours?: Record<string, any> | null;
          delivery_cutoff?: string | null;
          is_premium?: boolean | null;
          premium_since?: string | null;
          verified?: boolean | null;
          commission_rate?: number | null;
          created_at?: string;
          updated_at?: string;
          delivery_start_time?: string | null;
          delivery_end_time?: string | null;
          delivery_slot_duration?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          social_links?: Record<string, any> | null;
          delivery_fee?: number | null;
          delivery_radius?: number | null;
          minimum_order_amount?: number | null;
          setup_progress?: number | null;
          store_status?: string | null;
          setup_completed_at?: string | null;
          delivery_days?: string[] | null;
          pickup_only_days?: string[] | null;
          delivery_cutoff_times?: Record<string, any> | null;
          same_day_enabled?: boolean | null;
          delivery_time_frames?: Record<string, any> | null;
          coordinates?: any | null;
          geocoded_address?: Record<string, any> | null;
          delivery_distance_km?: number | null;
          suburb?: string | null;
          state?: string | null;
          postcode?: string | null;
        };
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          customizations: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          customizations?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          customizations?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          florist_id: string
          status: string
          payment_status: string
          subtotal: number
          delivery_fee: number
          total: number
          delivery_details: Json
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          florist_id: string
          status?: string
          payment_status?: string
          subtotal: number
          delivery_fee: number
          total: number
          delivery_details: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          florist_id?: string
          status?: string
          payment_status?: string
          subtotal?: number
          delivery_fee?: number
          total?: number
          delivery_details?: Json
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      product_sizes: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string;
          florist_id: string | null;
          title: string;
          description: string | null;
          price: number;
          images: string[] | null;
          active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          florist_id?: string | null;
          title: string;
          description?: string | null;
          price: number;
          images?: string[] | null;
          active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          florist_id?: string | null;
          title?: string;
          description?: string | null;
          price?: number;
          images?: string[] | null;
          active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          role: string
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          role?: string
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          customer_id: string
          florist_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          customer_id: string
          florist_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          customer_id?: string
          florist_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type UserRole = 'customer' | 'florist' | 'admin'
export type StoreStatus = 'pending' | 'active' | 'inactive' | 'suspended'
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface FloristProfile {
  id: string
  user_id: string
  store_name: string
  store_status: StoreStatus
  about_text?: string
  contact_email: string
  contact_phone: string
  website_url?: string
  banner_url?: string
  logo_url?: string
  location?: {
    type: 'Point'
    coordinates: [number, number]
  }
  address_details: AddressDetails
  delivery_zones?: {
    type: 'Polygon'
    coordinates: [number, number][]
  }[]
  business_settings: BusinessSettings
  social_links?: SocialLinks
  commission_rate: number
  setup_progress: number
  setup_completed_at?: string
  created_at: string
  updated_at: string
}

export interface AddressDetails {
  street_number: string
  street_name: string
  unit_number?: string
  suburb: string
  state: string
  postcode: string
}

export interface BusinessSettings {
  delivery: {
    radius_km: number
    fee: number
    minimum_order: number
    same_day_cutoff: {
      default: string
      monday?: string | null
      tuesday?: string | null
      wednesday?: string | null
      thursday?: string | null
      friday?: string | null
      saturday?: string | null
      sunday?: string | null
    }
    next_day_cutoff_enabled: boolean
    next_day_cutoff: {
      default: string
      monday?: string | null
      tuesday?: string | null
      wednesday?: string | null
      thursday?: string | null
      friday?: string | null
      saturday?: string | null
      sunday?: string | null
    }
    special_events: {
      valentines_day: SpecialEventSettings
      mothers_day: SpecialEventSettings
    }
  }
  hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  delivery_slots: {
    weekdays: {
      slots: DeliverySlot[]
    }
    weekends: {
      slots: DeliverySlot[]
    }
    special_events: {
      valentines_day: {
        slots: DeliverySlot[]
      }
      mothers_day: {
        slots: DeliverySlot[]
      }
    }
  }
}

export interface SpecialEventSettings {
  enabled: boolean
  cutoff_time: string
  delivery_fee_multiplier: number
  minimum_order_multiplier: number
}

export interface DeliverySlot {
  name: string
  start: string
  end: string
  enabled: boolean
  max_orders: number
  premium_fee: number
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
}

// Database table types
export interface Tables {
  profiles: {
    Row: Profile
    Insert: Omit<Profile, 'created_at' | 'updated_at'>
    Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
  }
  florist_profiles: {
    Row: FloristProfile
    Insert: Omit<FloristProfile, 'id' | 'created_at' | 'updated_at'>
    Update: Partial<Omit<FloristProfile, 'id' | 'created_at' | 'updated_at'>>
  }
}