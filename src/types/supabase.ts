export type UserType = 'buyer' | 'seller'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  email: string
  user_type: UserType
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
      // ... other tables
    }
  }
} 