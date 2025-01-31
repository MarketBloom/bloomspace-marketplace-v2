import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'florist' | 'admin';

export interface UserMetadata {
  role: UserRole;
  full_name?: string;
  phone?: string;
}

export interface AuthUser extends User {
  user_metadata: UserMetadata;
}

export interface AuthState {
  user: AuthUser | null;
  session: {
    access_token: string | null;
    refresh_token: string | null;
    expires_at?: number;
  } | null;
  loading: boolean;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ 
    data: { user: AuthUser | null; session: AuthState['session'] } | null; 
    error: Error | null 
  }>;
  signUp: (email: string, password: string, metadata: Partial<UserMetadata>) => Promise<{
    data: { user: AuthUser | null; session: AuthState['session'] } | null;
    error: Error | null
  }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserMetadata>) => Promise<{
    data: UserMetadata | null;
    error: Error | null;
  }>;
  isAuthorized: (requiredRoles?: UserRole[]) => boolean;
  refreshSession: () => Promise<void>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  role: UserRole;
}

export interface CustomerProfile extends BaseUser {
  role: 'customer';
  delivery_addresses?: DeliveryAddress[];
}

export interface FloristProfile extends BaseUser {
  role: 'florist';
  store_name: string;
  store_status: 'pending' | 'active' | 'inactive';
  address_details: AddressDetails;
  delivery_settings: DeliverySettings;
  business_hours: BusinessHours;
  delivery_slots: DeliverySlots;
  commission_rate: number;
  setup_progress: number;
  setup_completed_at?: string;
}

export interface AddressDetails {
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
}

export interface DeliverySettings {
  distance_type: 'radius';
  max_distance_km: number;
  same_day_cutoff: string;
  next_day_cutoff_enabled: boolean;
  next_day_cutoff: string | null;
  minimum_order: number;
  delivery_fee: number;
}

export interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    closed: boolean;
  };
}

export interface DeliverySlots {
  weekdays: {
    slots: TimeSlot[];
  };
  weekends: {
    slots: TimeSlot[];
  };
}

export interface TimeSlot {
  name: string;
  start: string;
  end: string;
  enabled: boolean;
}

export interface DeliveryAddress {
  id: string;
  user_id: string;
  is_default: boolean;
  address_details: AddressDetails;
}
