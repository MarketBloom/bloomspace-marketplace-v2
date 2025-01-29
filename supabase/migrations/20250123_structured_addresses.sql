-- Add structured address fields to florist_profiles table
ALTER TABLE florist_profiles
ADD COLUMN IF NOT EXISTS coordinates geography(POINT),
ADD COLUMN IF NOT EXISTS geocoded_address jsonb,
ADD COLUMN IF NOT EXISTS street_number text,
ADD COLUMN IF NOT EXISTS street_name text,
ADD COLUMN IF NOT EXISTS unit_number text,
ADD COLUMN IF NOT EXISTS formatted_address text GENERATED ALWAYS AS (
  CASE 
    WHEN unit_number IS NOT NULL THEN
      unit_number || '/' || street_number || ' ' || street_name || ', ' || suburb || ', ' || state || ' ' || postcode
    ELSE
      street_number || ' ' || street_name || ', ' || suburb || ', ' || state || ' ' || postcode
  END
) STORED;

-- Create index for spatial queries
CREATE INDEX IF NOT EXISTS idx_florist_profiles_coordinates 
ON florist_profiles USING GIST (coordinates);

-- Add check constraints for required fields
ALTER TABLE florist_profiles
ADD CONSTRAINT chk_street_number_required CHECK (street_number IS NOT NULL),
ADD CONSTRAINT chk_street_name_required CHECK (street_name IS NOT NULL),
ADD CONSTRAINT chk_suburb_required CHECK (suburb IS NOT NULL),
ADD CONSTRAINT chk_state_required CHECK (state IS NOT NULL),
ADD CONSTRAINT chk_postcode_required CHECK (postcode IS NOT NULL);

-- Function to update coordinates from HERE API response
CREATE OR REPLACE FUNCTION update_florist_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geocoded_address IS NOT NULL THEN
    NEW.coordinates = ST_SetSRID(
      ST_MakePoint(
        (NEW.geocoded_address->>'longitude')::float,
        (NEW.geocoded_address->>'latitude')::float
      ),
      4326
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update coordinates when geocoded_address changes
DROP TRIGGER IF EXISTS trg_update_florist_coordinates ON florist_profiles;
CREATE TRIGGER trg_update_florist_coordinates
BEFORE INSERT OR UPDATE OF geocoded_address ON florist_profiles
FOR EACH ROW
EXECUTE FUNCTION update_florist_coordinates();

-- Function to calculate delivery radius
CREATE OR REPLACE FUNCTION is_within_delivery_radius(
  customer_lat float,
  customer_lng float,
  florist_id uuid,
  max_distance float DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  florist_radius float;
  distance float;
BEGIN
  -- Get florist's delivery radius if max_distance not specified
  IF max_distance IS NULL THEN
    SELECT delivery_radius INTO florist_radius
    FROM florist_profiles
    WHERE id = florist_id;
    
    max_distance := florist_radius;
  END IF;
  
  -- Calculate distance using PostGIS
  SELECT ST_Distance(
    ST_SetSRID(ST_MakePoint(customer_lng, customer_lat), 4326)::geography,
    coordinates::geography
  ) / 1000 -- Convert to kilometers
  INTO distance
  FROM florist_profiles
  WHERE id = florist_id;
  
  RETURN distance <= max_distance;
END;
$$ LANGUAGE plpgsql;

-- Create the address type
CREATE TYPE address_type AS (
  place_id TEXT,
  description TEXT,
  formatted_address TEXT,
  coordinates JSONB,
  address_components JSONB
);

-- Add address columns to florists table
ALTER TABLE florists
ADD COLUMN address JSONB;

-- Function to validate address format
CREATE OR REPLACE FUNCTION validate_address(addr JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    addr ? 'placeId' AND
    addr ? 'description' AND
    addr ? 'formattedAddress' AND
    addr ? 'coordinates' AND
    addr->'coordinates' ? 'lat' AND
    addr->'coordinates' ? 'lng' AND
    addr ? 'addressComponents'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update address coordinates
CREATE OR REPLACE FUNCTION update_address_coordinates(
  florist_id UUID,
  new_address JSONB
) RETURNS VOID AS $$
BEGIN
  -- Validate address format
  IF NOT validate_address(new_address) THEN
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

-- Function to get florist's coordinates
CREATE OR REPLACE FUNCTION get_florist_coordinates(
  florist_id UUID
) RETURNS JSONB AS $$
DECLARE
  coords JSONB;
BEGIN
  SELECT address->'coordinates' INTO coords
  FROM florists
  WHERE id = florist_id;
  
  RETURN coords;
END;
$$ LANGUAGE plpgsql;
