import { Json } from './database';
import { Address, Coordinates } from './address';
import { User } from '@supabase/supabase-js';

// Shared enums and simple types
export type StoreStatus = 'pending' | 'active' | 'inactive' | 'suspended';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ProductStatus = 'active' | 'inactive';
export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

// Shared interfaces
export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperatingHours {
  [key: string]: DayHours;
}

export interface DeliverySlot {
  name: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface DeliverySettings {
  radius_km: number;
  fee: number;
  minimum_order: number;
  same_day_cutoff: string;
  next_day_cutoff_enabled: boolean;
  next_day_cutoff?: string;
  delivery_slots: {
    weekdays: { slots: DeliverySlot[] };
    weekends: { slots: DeliverySlot[] };
  };
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][];
}

export interface AddressDetails extends Address {
  formatted_address?: string;
  coordinates?: Coordinates;
}

export interface DeliveryDetails {
  address: AddressDetails;
  instructions?: string;
  preferred_time?: string;
  contact_name: string;
  contact_phone: string;
}

// Database types (exact match with Supabase schema)
export interface FloristProfileRecord {
  id: string;
  user_id: string;
  store_name: string;
  store_status: StoreStatus;
  about_text: string | null;
  contact_email: string;
  contact_phone: string;
  website_url: string | null;
  banner_url: string | null;
  logo_url: string | null;
  location: GeoPoint;
  address_details: AddressDetails;
  delivery_zones: GeoPolygon[] | null;
  business_settings: {
    delivery: DeliverySettings;
    hours: OperatingHours;
  };
  social_links: SocialLinks | null;
  commission_rate: number;
  setup_progress: number;
  setup_completed_at: string | null;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface FloristApplicationRecord {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  store_name: string | null;
  address: string | null;
  about_business: string | null;
  years_experience: number | null;
  website_url: string | null;
  instagram_url: string | null;
  portfolio_urls: string[] | null;
  specialties: string[] | null;
  average_order_value: number | null;
  weekly_order_capacity: number | null;
  has_physical_store: boolean | null;
  delivery_capabilities: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Database table types
export interface FloristProfilesTable {
  Row: FloristProfileRecord;
  Insert: Omit<FloristProfileRecord, 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<FloristProfileRecord, 'id' | 'created_at' | 'updated_at'>>;
}

export interface FloristApplicationsTable {
  Row: FloristApplicationRecord;
  Insert: Omit<FloristApplicationRecord, 'id' | 'created_at' | 'updated_at'>;
  Update: Partial<Omit<FloristApplicationRecord, 'id' | 'created_at' | 'updated_at'>>;
}

// Frontend types (what components use)
export interface FloristProduct {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  images: string[];
  category?: string;
  categories?: string[];
  occasion?: string;
  tags?: string[];
  status: ProductStatus;
  stock_status: StockStatus;
}

export interface FloristAvailability {
  available: boolean;
  reason?: string;
}

// Frontend profile type (combines database record with frontend-specific fields)
export type FloristProfile = Omit<FloristProfileRecord, 'metadata'> & {
  metadata?: Record<string, unknown>;
  products?: FloristProduct[];
  distance?: number;
  availability?: FloristAvailability;
};

// Helper types for components
export interface FloristSearchResult {
  id: string;
  store_name: string;
  banner_url?: string;
  logo_url?: string;
  rating?: number;
  total_reviews?: number;
  distance?: number;
  delivery_fee?: number;
  minimum_order?: number;
  availability: FloristAvailability;
}

// Auth types
export type FloristUser = User & {
  role: 'florist';
  profile: FloristProfile;
};

// Order types
export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  customizations?: Record<string, unknown>;
}

export interface Order {
  id: string;
  customer_id: string;
  florist_id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_details: DeliveryDetails;
  created_at: string;
  updated_at: string;
}