export interface ProfilesTable {
  Row: {
    id: string;
    full_name: string | null;
    phone: string | null;
    role: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    full_name?: string | null;
    phone?: string | null;
    role?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ProfilesTable['Insert']>;
}