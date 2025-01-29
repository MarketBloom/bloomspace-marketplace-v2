-- Create the florist_profiles table
CREATE TABLE IF NOT EXISTS florist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_status TEXT NOT NULL DEFAULT 'pending' CHECK (store_status IN ('active', 'inactive', 'pending')),
    about_text TEXT,
    banner_url TEXT,
    logo_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    website_url TEXT,
    social_links JSONB,
    location GEOGRAPHY(POINT),
    address_details JSONB NOT NULL DEFAULT '{
        "street_number": "",
        "street_name": "",
        "suburb": "",
        "state": "",
        "postcode": ""
    }',
    delivery_settings JSONB DEFAULT '{
        "distance_type": "radius",
        "max_distance_km": 5,
        "same_day_cutoff": {
            "default": "14:00",
            "monday": null,
            "tuesday": null,
            "wednesday": null,
            "thursday": null,
            "friday": null,
            "saturday": null,
            "sunday": null
        },
        "next_day_cutoff_enabled": false,
        "next_day_cutoff": {
            "default": "18:00",
            "monday": null,
            "tuesday": null,
            "wednesday": null,
            "thursday": null,
            "friday": null,
            "saturday": null,
            "sunday": null
        },
        "minimum_order": 0,
        "delivery_fee": 0,
        "special_events": {
            "valentines_day": {
                "enabled": false,
                "cutoff_time": "12:00",
                "delivery_fee_multiplier": 1.5,
                "minimum_order_multiplier": 1.2
            },
            "mothers_day": {
                "enabled": false,
                "cutoff_time": "12:00",
                "delivery_fee_multiplier": 1.5,
                "minimum_order_multiplier": 1.2
            }
        }
    }',
    business_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "17:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
        "thursday": {"open": "09:00", "close": "17:00", "closed": false},
        "friday": {"open": "09:00", "close": "17:00", "closed": false},
        "saturday": {"open": "09:00", "close": "17:00", "closed": false},
        "sunday": {"open": "09:00", "close": "17:00", "closed": true}
    }',
    delivery_slots JSONB DEFAULT '{
        "weekdays": {
            "slots": [
                {"name": "morning", "start": "09:00", "end": "12:00", "enabled": true, "max_orders": 10, "premium_fee": 0},
                {"name": "afternoon", "start": "12:00", "end": "15:00", "enabled": true, "max_orders": 10, "premium_fee": 0},
                {"name": "evening", "start": "15:00", "end": "18:00", "enabled": true, "max_orders": 10, "premium_fee": 0}
            ]
        },
        "weekends": {
            "slots": [
                {"name": "morning", "start": "09:00", "end": "12:00", "enabled": true, "max_orders": 8, "premium_fee": 5},
                {"name": "afternoon", "start": "12:00", "end": "15:00", "enabled": true, "max_orders": 8, "premium_fee": 5},
                {"name": "evening", "start": "15:00", "end": "18:00", "enabled": true, "max_orders": 8, "premium_fee": 5}
            ]
        },
        "special_events": {
            "valentines_day": {
                "slots": [
                    {"name": "early_morning", "start": "07:00", "end": "10:00", "enabled": true, "max_orders": 5, "premium_fee": 15},
                    {"name": "morning", "start": "10:00", "end": "13:00", "enabled": true, "max_orders": 8, "premium_fee": 10},
                    {"name": "afternoon", "start": "13:00", "end": "16:00", "enabled": true, "max_orders": 8, "premium_fee": 10}
                ]
            },
            "mothers_day": {
                "slots": [
                    {"name": "early_morning", "start": "07:00", "end": "10:00", "enabled": true, "max_orders": 5, "premium_fee": 15},
                    {"name": "morning", "start": "10:00", "end": "13:00", "enabled": true, "max_orders": 8, "premium_fee": 10},
                    {"name": "afternoon", "start": "13:00", "end": "16:00", "enabled": true, "max_orders": 8, "premium_fee": 10}
                ]
            }
        }
    }',
    setup_progress JSONB DEFAULT '{"completed_steps": []}',
    setup_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE florist_profiles ENABLE ROW LEVEL SECURITY;

-- Allow florists to read their own profile
CREATE POLICY "Florists can view their own profile"
    ON florist_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Allow florists to update their own profile
CREATE POLICY "Florists can update their own profile"
    ON florist_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow florists to insert their own profile
CREATE POLICY "Florists can insert their own profile"
    ON florist_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER set_florist_profiles_updated_at
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
