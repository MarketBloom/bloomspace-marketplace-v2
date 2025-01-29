import { Database } from './database-types';

// Base Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
export type Address = {
  street_number: string;
  street_name: string;
  unit_number?: string;
  suburb: string;
  state: string;
  postcode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  formatted_address?: string;
};

export type BusinessHours = {
  open: string;
  close: string;
  closed?: boolean;
};

export type DeliverySettings = {
  radius_km: number;
  fee: number;
  minimum_order: number;
  same_day_cutoff: string;
  next_day_cutoff?: string;
};

export type BusinessSettings = {
  delivery: DeliverySettings;
  hours: {
    monday: BusinessHours;
    tuesday: BusinessHours;
    wednesday: BusinessHours;
    thursday: BusinessHours;
    friday: BusinessHours;
    saturday: BusinessHours;
    sunday: BusinessHours;
  };
};

// Database Types
export type FloristProfile = {
  id: string;
  user_id: string;
  store_name: string;
  store_status: 'pending' | 'active' | 'inactive';
  about_text?: string;
  contact_email: string;
  contact_phone: string;
  website_url?: string;
  address: Address;
  business_settings: BusinessSettings;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  florist_id: string;
  name: string;
  description?: string;
  price: number;
  status: 'active' | 'inactive' | 'deleted';
  images: string[];
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  florist_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  delivery_fee: number;
  delivery_address: Address;
  delivery_date: string;
  delivery_time_slot: string;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  created_at: string;
};

// Form Types
export type FloristProfileFormData = Omit<FloristProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type ProductFormData = Omit<Product, 'id' | 'florist_id' | 'created_at' | 'updated_at'>;

export type OrderFormData = {
  delivery_date: Date;
  delivery_time_slot: string;
  delivery_address: Address;
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
};
