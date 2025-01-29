-- Enable PostGIS if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing constraints and triggers that might conflict
ALTER TABLE florist_profiles
DROP CONSTRAINT IF EXISTS chk_street_number_required,
DROP CONSTRAINT IF EXISTS chk_street_name_required,
DROP CONSTRAINT IF EXISTS chk_suburb_required,
DROP CONSTRAINT IF EXISTS chk_state_required,
DROP CONSTRAINT IF EXISTS chk_postcode_required;

DROP TRIGGER IF EXISTS trg_update_florist_coordinates ON florist_profiles;
DROP FUNCTION IF EXISTS update_florist_coordinates();
DROP FUNCTION IF EXISTS is_within_delivery_radius();

-- Restructure the florist_profiles table
ALTER TABLE florist_profiles
  -- Remove old columns
  DROP COLUMN IF EXISTS formatted_address,
  DROP COLUMN IF EXISTS coordinates,
  DROP COLUMN IF EXISTS geocoded_address,
  
  -- Add new structured columns
  ADD COLUMN IF NOT EXISTS location geography(POINT),
  ADD COLUMN IF NOT EXISTS address_details jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_settings jsonb DEFAULT '{
    "distance_type": "radius",
    "max_distance_km": 5,
    "same_day_cutoff": "14:00",
    "next_day_cutoff_enabled": false,
    "next_day_cutoff": null,
    "minimum_order": 0,
    "delivery_fee": 0
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
    "thursday": {"open": "09:00", "close": "17:00", "closed": false},
    "friday": {"open": "09:00", "close": "17:00", "closed": false},
    "saturday": {"open": "09:00", "close": "17:00", "closed": false},
    "sunday": {"open": "09:00", "close": "17:00", "closed": true}
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS delivery_slots jsonb DEFAULT '{
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
  }'::jsonb;

-- Add validation functions
CREATE OR REPLACE FUNCTION validate_florist_profile()
RETURNS TRIGGER AS $$
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

  -- Validate business_hours
  IF NOT (NEW.business_hours ? 'monday' AND 
          NEW.business_hours ? 'tuesday' AND 
          NEW.business_hours ? 'wednesday' AND 
          NEW.business_hours ? 'thursday' AND 
          NEW.business_hours ? 'friday' AND 
          NEW.business_hours ? 'saturday' AND 
          NEW.business_hours ? 'sunday') THEN
    RAISE EXCEPTION 'business_hours must contain all days of the week';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation
DROP TRIGGER IF EXISTS trg_validate_florist_profile ON florist_profiles;
CREATE TRIGGER trg_validate_florist_profile
  BEFORE INSERT OR UPDATE ON florist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_florist_profile();

-- Function to check if a florist can deliver to a location
CREATE OR REPLACE FUNCTION can_deliver_to_location(
  florist_id uuid,
  customer_lat double precision,
  customer_lng double precision,
  delivery_date date DEFAULT CURRENT_DATE,
  delivery_time time DEFAULT CURRENT_TIME
) RETURNS boolean AS $$
DECLARE
  florist_record record;
  distance_km double precision;
BEGIN
  -- Get florist details
  SELECT * INTO florist_record
  FROM florist_profiles
  WHERE id = florist_id;

  -- Calculate distance based on distance_type
  IF florist_record.delivery_settings->>'distance_type' = 'radius' THEN
    -- Use PostGIS for radius calculation
    SELECT ST_Distance(
      florist_record.location::geography,
      ST_SetSRID(ST_MakePoint(customer_lng, customer_lat), 4326)::geography
    ) / 1000 INTO distance_km;
  ELSE
    -- For driving distance, we'll use the HERE API in the application layer
    -- Here we just use radius as a fallback
    SELECT ST_Distance(
      florist_record.location::geography,
      ST_SetSRID(ST_MakePoint(customer_lng, customer_lat), 4326)::geography
    ) / 1000 INTO distance_km;
  END IF;

  -- Check if within delivery distance
  IF distance_km > (florist_record.delivery_settings->>'max_distance_km')::float THEN
    RETURN false;
  END IF;

  -- Check same-day delivery cutoff
  IF delivery_date = CURRENT_DATE AND 
     delivery_time::time > (florist_record.delivery_settings->>'same_day_cutoff')::time THEN
    RETURN false;
  END IF;

  -- Check next-day cutoff if enabled
  IF delivery_date = CURRENT_DATE + 1 AND 
     (florist_record.delivery_settings->>'next_day_cutoff_enabled')::boolean AND
     delivery_time::time > (florist_record.delivery_settings->>'next_day_cutoff')::time THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_florist_profiles_location ON florist_profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_status ON florist_profiles (store_status);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_suburb ON florist_profiles ((address_details->>'suburb'));
CREATE INDEX IF NOT EXISTS idx_florist_profiles_postcode ON florist_profiles ((address_details->>'postcode'));

-- Create the florists table with Google Places address structure
CREATE TABLE florists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  address JSONB NOT NULL,
  delivery_radius DOUBLE PRECISION NOT NULL DEFAULT 10,
  minimum_order DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for spatial queries
CREATE INDEX florists_coordinates_idx ON florists USING GIN ((address->'coordinates'));

-- Function to validate florist address
CREATE OR REPLACE FUNCTION validate_florist_address(addr JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    addr ? 'placeId' AND
    addr ? 'description' AND
    addr ? 'formattedAddress' AND
    addr ? 'coordinates' AND
    addr->'coordinates' ? 'lat' AND
    addr->'coordinates' ? 'lng' AND
    addr ? 'addressComponents' AND
    addr->'addressComponents' ? 'streetNumber' AND
    addr->'addressComponents' ? 'route' AND
    addr->'addressComponents' ? 'locality' AND
    addr->'addressComponents' ? 'state' AND
    addr->'addressComponents' ? 'postalCode'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update florist location
CREATE OR REPLACE FUNCTION update_florist_location(
  florist_id UUID,
  new_address JSONB
) RETURNS VOID AS $$
BEGIN
  -- Validate address format
  IF NOT validate_florist_address(new_address) THEN
    RAISE EXCEPTION 'Invalid address format';
  END IF;

  -- Update the address
  UPDATE florists
  SET 
    address = new_address,
    updated_at = NOW()
  WHERE id = florist_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby florists
CREATE OR REPLACE FUNCTION get_nearby_florists(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50
) RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  address JSONB,
  delivery_radius DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.description,
    f.address,
    f.delivery_radius,
    earth_distance(
      ll_to_earth(lat, lng),
      ll_to_earth(
        ((f.address->>'coordinates')::jsonb->>'lat')::DOUBLE PRECISION,
        ((f.address->>'coordinates')::jsonb->>'lng')::DOUBLE PRECISION
      )
    ) / 1000 AS distance_km
  FROM florists f
  WHERE 
    f.status = 'active' AND
    earth_box(
      ll_to_earth(lat, lng),
      radius_km * 1000
    ) @> ll_to_earth(
      ((f.address->>'coordinates')::jsonb->>'lat')::DOUBLE PRECISION,
      ((f.address->>'coordinates')::jsonb->>'lng')::DOUBLE PRECISION
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
