-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Base profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'florist', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Florist profiles table
CREATE TABLE florist_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id),
    store_name TEXT NOT NULL,
    store_status TEXT NOT NULL DEFAULT 'pending' CHECK (store_status IN ('pending', 'active', 'inactive')),
    address_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_settings JSONB NOT NULL DEFAULT '{
        "distance_type": "radius",
        "max_distance_km": 5,
        "same_day_cutoff": "14:00",
        "next_day_cutoff_enabled": false,
        "next_day_cutoff": null,
        "minimum_order": 0,
        "delivery_fee": 0
    }'::jsonb,
    business_hours JSONB NOT NULL DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "17:00", "closed": false},
        "sunday": {"open": "09:00", "close": "17:00", "closed": true}
    }'::jsonb,
    delivery_slots JSONB NOT NULL DEFAULT '{
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
    }'::jsonb,
    commission_rate DECIMAL NOT NULL DEFAULT 10.0,
    setup_progress INTEGER NOT NULL DEFAULT 0,
    setup_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery addresses table
CREATE TABLE delivery_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    is_default BOOLEAN NOT NULL DEFAULT false,
    address_details JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
); 