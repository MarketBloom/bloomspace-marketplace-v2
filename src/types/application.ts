export interface Application {
  id: string;
  full_name: string;
  email: string;
  store_name: string | null;
  created_at: string;
  status: string;
  about_business: string | null;
  years_experience: number | null;
  specialties: string[] | null;
}

export interface FloristApplicationsTable {
  Row: {
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
    status: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    full_name: string;
    email: string;
    phone?: string | null;
    store_name?: string | null;
    address?: string | null;
    about_business?: string | null;
    years_experience?: number | null;
    website_url?: string | null;
    instagram_url?: string | null;
    portfolio_urls?: string[] | null;
    specialties?: string[] | null;
    average_order_value?: number | null;
    weekly_order_capacity?: number | null;
    has_physical_store?: boolean | null;
    delivery_capabilities?: string | null;
    status?: string | null;
    admin_notes?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<FloristApplicationsTable['Insert']>;
}