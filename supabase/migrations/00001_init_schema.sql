-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Custom types
CREATE TYPE store_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE delivery_slot_info AS (
    name TEXT,
    start_time TIME,
    end_time TIME,
    available BOOLEAN,
    reason TEXT
);

-- Base profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'florist', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{10,15}$')
);

-- Florist profiles
CREATE TABLE florist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL CHECK (char_length(store_name) >= 2 AND char_length(store_name) <= 100),
    store_status store_status NOT NULL DEFAULT 'pending',
    about_text TEXT CHECK (about_text IS NULL OR char_length(about_text) <= 500),
    contact_email TEXT NOT NULL CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    contact_phone TEXT NOT NULL CHECK (contact_phone ~ '^\+?[0-9]{10,15}$'),
    website_url TEXT CHECK (website_url IS NULL OR website_url ~* '^https?://.*$'),
    
    -- Media
    banner_url TEXT,
    logo_url TEXT,
    
    -- Location
    location GEOGRAPHY(POINT),
    address_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_zones geometry(POLYGON, 4326)[],
    
    -- Business settings
    business_settings JSONB NOT NULL DEFAULT '{
        "delivery": {
            "radius_km": 10,
            "fee": 0,
            "minimum_order": 0,
            "same_day_cutoff": "14:00",
            "next_day_cutoff": null,
            "next_day_cutoff_enabled": false
        },
        "hours": {
            "monday": {"open": "09:00", "close": "17:00", "closed": false},
            "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
            "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
            "thursday": {"open": "09:00", "close": "17:00", "closed": false},
            "friday": {"open": "09:00", "close": "17:00", "closed": false},
            "saturday": {"open": "09:00", "close": "17:00", "closed": false},
            "sunday": {"open": "09:00", "close": "17:00", "closed": true}
        },
        "delivery_slots": {
            "weekdays": {
                "slots": [
                    {"name": "morning", "start": "09:00", "end": "12:00", "enabled": true},
                    {"name": "afternoon", "start": "12:00", "end": "15:00", "enabled": true},
                    {"name": "evening", "start": "15:00", "end": "18:00", "enabled": true}
                ]
            },
            "weekends": {
                "slots": [
                    {"name": "morning", "start": "10:00", "end": "13:00", "enabled": true},
                    {"name": "afternoon", "start": "13:00", "end": "16:00", "enabled": true}
                ]
            }
        }
    }'::jsonb,
    
    -- Social and commission
    social_links JSONB DEFAULT '{}'::jsonb,
    commission_rate DECIMAL NOT NULL DEFAULT 10.0,
    
    -- Setup tracking
    setup_progress INTEGER NOT NULL DEFAULT 0,
    setup_completed_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT unique_user_id UNIQUE(user_id)
);

-- Utility function for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_florist_profiles_updated_at
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indices for better query performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

CREATE INDEX idx_florist_profiles_user_id ON florist_profiles(user_id);
CREATE INDEX idx_florist_profiles_store_status ON florist_profiles(store_status);
CREATE INDEX idx_florist_profiles_location ON florist_profiles USING GIST(location);
CREATE INDEX idx_florist_profiles_delivery_zones ON florist_profiles USING GIST(delivery_zones);
CREATE INDEX idx_florist_profiles_address_suburb ON florist_profiles USING GIN((address_details->'suburb'));
CREATE INDEX idx_florist_profiles_address_state ON florist_profiles USING GIN((address_details->'state'));
CREATE INDEX idx_florist_profiles_address_postcode ON florist_profiles USING GIN((address_details->'postcode')); 