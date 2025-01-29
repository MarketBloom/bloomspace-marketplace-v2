-- Drop existing tables and functions that we'll replace
DROP TRIGGER IF EXISTS trg_validate_florist_profile ON florist_profiles;
DROP FUNCTION IF EXISTS validate_florist_profile();
DROP FUNCTION IF EXISTS can_deliver_to_location(uuid, double precision, double precision, date, time);
DROP FUNCTION IF EXISTS is_within_delivery_radius(float, float, uuid, float);
DROP FUNCTION IF EXISTS get_available_delivery_slots(uuid, date);
DROP TYPE IF EXISTS delivery_slot_info;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Clean up existing table
DROP TABLE IF EXISTS florist_profiles CASCADE;

-- Create fresh florist_profiles table
CREATE TABLE florist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    store_name TEXT NOT NULL,
    store_status TEXT NOT NULL DEFAULT 'pending' CHECK (store_status IN ('pending', 'active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Location and address
    location GEOGRAPHY(POINT),
    address_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Business settings
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

    -- Store details
    about_text TEXT,
    banner_url TEXT,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    
    -- Setup tracking
    setup_progress JSONB DEFAULT '{"completed_steps": []}'::jsonb,
    setup_completed_at TIMESTAMPTZ
);

-- Create type for delivery slot info
CREATE TYPE delivery_slot_info AS (
    name TEXT,
    start_time TIME,
    end_time TIME,
    available BOOLEAN,
    reason TEXT
);

-- Function to validate time format
CREATE OR REPLACE FUNCTION is_valid_time(time_str TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN time_str ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$';
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to validate florist profile
CREATE OR REPLACE FUNCTION validate_florist_profile()
RETURNS TRIGGER AS $$
DECLARE
    day TEXT;
    slot JSONB;
BEGIN
    -- Validate address_details
    IF NOT (NEW.address_details ? 'street_number' AND 
            NEW.address_details ? 'street_name' AND 
            NEW.address_details ? 'suburb' AND 
            NEW.address_details ? 'state' AND 
            NEW.address_details ? 'postcode') THEN
        RAISE EXCEPTION 'address_details must contain street_number, street_name, suburb, state, and postcode';
    END IF;

    -- Validate delivery_settings
    IF NOT (NEW.delivery_settings ? 'distance_type' AND 
            NEW.delivery_settings ? 'max_distance_km' AND
            NEW.delivery_settings ? 'same_day_cutoff') THEN
        RAISE EXCEPTION 'delivery_settings must contain distance_type, max_distance_km, and same_day_cutoff';
    END IF;

    -- Validate max_distance_km is positive
    IF (NEW.delivery_settings->>'max_distance_km')::FLOAT <= 0 THEN
        RAISE EXCEPTION 'max_distance_km must be positive';
    END IF;

    -- Validate same_day_cutoff format
    IF NOT is_valid_time(NEW.delivery_settings->>'same_day_cutoff') THEN
        RAISE EXCEPTION 'same_day_cutoff must be in HH:MM format';
    END IF;

    -- Validate next_day_cutoff if enabled
    IF (NEW.delivery_settings->>'next_day_cutoff_enabled')::BOOLEAN AND 
       NOT is_valid_time(NEW.delivery_settings->>'next_day_cutoff') THEN
        RAISE EXCEPTION 'next_day_cutoff must be in HH:MM format when enabled';
    END IF;

    -- Validate business_hours
    FOR day IN 
        SELECT unnest(ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    LOOP
        IF NOT NEW.business_hours ? day THEN
            RAISE EXCEPTION 'business_hours must contain %', day;
        END IF;

        IF NOT is_valid_time(NEW.business_hours->day->>'open') OR
           NOT is_valid_time(NEW.business_hours->day->>'close') THEN
            RAISE EXCEPTION 'business hours for % must be in HH:MM format', day;
        END IF;

        -- Validate open time is before close time when not closed
        IF NOT (NEW.business_hours->day->>'closed')::BOOLEAN AND
           (NEW.business_hours->day->>'open')::TIME >= (NEW.business_hours->day->>'close')::TIME THEN
            RAISE EXCEPTION 'open time must be before close time for %', day;
        END IF;
    END LOOP;

    -- Validate delivery_slots
    IF NOT (NEW.delivery_slots ? 'weekdays' AND NEW.delivery_slots->'weekdays' ? 'slots' AND
            NEW.delivery_slots ? 'weekends' AND NEW.delivery_slots->'weekends' ? 'slots') THEN
        RAISE EXCEPTION 'delivery_slots must contain weekdays.slots and weekends.slots arrays';
    END IF;

    -- Validate weekday slots
    FOR slot IN SELECT * FROM jsonb_array_elements(NEW.delivery_slots->'weekdays'->'slots')
    LOOP
        IF NOT (slot ? 'name' AND slot ? 'start' AND slot ? 'end' AND slot ? 'enabled') THEN
            RAISE EXCEPTION 'each weekday slot must contain name, start, end, and enabled fields';
        END IF;

        IF NOT is_valid_time(slot->>'start') OR NOT is_valid_time(slot->>'end') THEN
            RAISE EXCEPTION 'slot times must be in HH:MM format';
        END IF;

        IF (slot->>'start')::TIME >= (slot->>'end')::TIME THEN
            RAISE EXCEPTION 'slot start time must be before end time';
        END IF;
    END LOOP;

    -- Validate weekend slots
    FOR slot IN SELECT * FROM jsonb_array_elements(NEW.delivery_slots->'weekends'->'slots')
    LOOP
        IF NOT (slot ? 'name' AND slot ? 'start' AND slot ? 'end' AND slot ? 'enabled') THEN
            RAISE EXCEPTION 'each weekend slot must contain name, start, end, and enabled fields';
        END IF;

        IF NOT is_valid_time(slot->>'start') OR NOT is_valid_time(slot->>'end') THEN
            RAISE EXCEPTION 'slot times must be in HH:MM format';
        END IF;

        IF (slot->>'start')::TIME >= (slot->>'end')::TIME THEN
            RAISE EXCEPTION 'slot start time must be before end time';
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
CREATE TRIGGER trg_validate_florist_profile
    BEFORE INSERT OR UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION validate_florist_profile();

-- Create indices for better query performance
CREATE INDEX idx_florist_profiles_location ON florist_profiles USING GIST (location);
CREATE INDEX idx_florist_profiles_status ON florist_profiles (store_status);
CREATE INDEX idx_florist_profiles_suburb ON florist_profiles ((address_details->>'suburb'));
CREATE INDEX idx_florist_profiles_postcode ON florist_profiles ((address_details->>'postcode'));

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_florist_timestamp
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
