-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create enum for user roles if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'florist', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create or update profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer'::user_role,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[0-9\s-\(\)]+$'),
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Update florist_profiles constraints
ALTER TABLE florist_profiles
    DROP CONSTRAINT IF EXISTS florist_profiles_user_id_fkey,
    ADD CONSTRAINT florist_profiles_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES profiles(id) 
        ON DELETE CASCADE;

-- Add RLS policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
    ON profiles FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON profiles FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
    )
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_role user_role;
BEGIN
    -- Set default role from metadata or default to customer
    default_role := COALESCE(
        (NEW.raw_user_meta_data->>'role')::user_role,
        'customer'::user_role
    );

    -- Create profile
    INSERT INTO profiles (
        id,
        role,
        email,
        full_name,
        phone,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        default_role,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone',
        NOW(),
        NOW()
    );

    -- If user is a florist, create florist profile
    IF default_role = 'florist' THEN
        INSERT INTO florist_profiles (
            user_id,
            store_name,
            store_status,
            contact_email,
            address_details,
            delivery_settings,
            business_hours,
            delivery_slots
        )
        VALUES (
            NEW.id,
            '',
            'pending',
            NEW.email,
            '{
                "street_number": "",
                "street_name": "",
                "suburb": "",
                "state": "",
                "postcode": ""
            }'::jsonb,
            '{
                "distance_type": "radius",
                "max_distance_km": 5,
                "same_day_cutoff": "14:00",
                "next_day_cutoff_enabled": false,
                "next_day_cutoff": null,
                "minimum_order": 0,
                "delivery_fee": 0
            }'::jsonb,
            '{
                "monday": {"open": "09:00", "close": "17:00", "closed": false},
                "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
                "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
                "thursday": {"open": "09:00", "close": "17:00", "closed": false},
                "friday": {"open": "09:00", "close": "17:00", "closed": false},
                "saturday": {"open": "09:00", "close": "17:00", "closed": false},
                "sunday": {"open": "09:00", "close": "17:00", "closed": true}
            }'::jsonb,
            '{
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
            }'::jsonb
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle role transitions
CREATE OR REPLACE FUNCTION handle_role_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- If changing to florist role
    IF NEW.role = 'florist' AND OLD.role != 'florist' THEN
        -- Create florist profile if it doesn't exist
        INSERT INTO florist_profiles (
            user_id,
            store_name,
            store_status,
            contact_email,
            address_details,
            delivery_settings,
            business_hours,
            delivery_slots
        )
        VALUES (
            NEW.id,
            '',
            'pending',
            NEW.email,
            '{
                "street_number": "",
                "street_name": "",
                "suburb": "",
                "state": "",
                "postcode": ""
            }'::jsonb,
            '{
                "distance_type": "radius",
                "max_distance_km": 5,
                "same_day_cutoff": "14:00",
                "next_day_cutoff_enabled": false,
                "next_day_cutoff": null,
                "minimum_order": 0,
                "delivery_fee": 0
            }'::jsonb,
            '{
                "monday": {"open": "09:00", "close": "17:00", "closed": false},
                "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
                "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
                "thursday": {"open": "09:00", "close": "17:00", "closed": false},
                "friday": {"open": "09:00", "close": "17:00", "closed": false},
                "saturday": {"open": "09:00", "close": "17:00", "closed": false},
                "sunday": {"open": "09:00", "close": "17:00", "closed": true}
            }'::jsonb,
            '{
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
            }'::jsonb
        )
        ON CONFLICT (user_id) DO NOTHING;
    END IF;

    -- Update user's JWT claims
    UPDATE auth.users
    SET raw_user_meta_data = 
        jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            to_jsonb(NEW.role::text)
        )
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger for role transitions
DROP TRIGGER IF EXISTS on_role_update ON profiles;
CREATE TRIGGER on_role_update
    AFTER UPDATE OF role ON profiles
    FOR EACH ROW
    WHEN (OLD.role IS DISTINCT FROM NEW.role)
    EXECUTE FUNCTION handle_role_transition();

-- Function to validate profile updates
CREATE OR REPLACE FUNCTION validate_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Set updated_at
    NEW.updated_at = NOW();
    
    -- Validate email format
    IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;

    -- Validate phone format if provided
    IF NEW.phone IS NOT NULL AND NEW.phone !~ '^\+?[0-9\s-\(\)]+$' THEN
        RAISE EXCEPTION 'Invalid phone number format';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_profile_trigger ON profiles;
CREATE TRIGGER validate_profile_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_profile();

-- Function to sync profile changes to auth.users
CREATE OR REPLACE FUNCTION sync_profile_to_auth()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
        'full_name', NEW.full_name,
        'phone', NEW.phone,
        'role', NEW.role
    )
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync profile changes
DROP TRIGGER IF EXISTS sync_profile_changes ON profiles;
CREATE TRIGGER sync_profile_changes
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION sync_profile_to_auth();
