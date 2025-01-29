-- First, drop the constraints and triggers that are causing issues
ALTER TABLE florist_profiles
DROP CONSTRAINT IF EXISTS chk_street_number_required,
DROP CONSTRAINT IF EXISTS chk_street_name_required,
DROP CONSTRAINT IF EXISTS chk_suburb_required,
DROP CONSTRAINT IF EXISTS chk_state_required,
DROP CONSTRAINT IF EXISTS chk_postcode_required;

DROP TRIGGER IF EXISTS trg_update_florist_coordinates ON florist_profiles;
DROP FUNCTION IF EXISTS update_florist_coordinates();

-- Remove the generated column as it's too rigid
ALTER TABLE florist_profiles 
DROP COLUMN IF EXISTS formatted_address;

-- Update the coordinates to be a simple JSON structure instead of PostGIS
ALTER TABLE florist_profiles
DROP COLUMN IF EXISTS coordinates,
ADD COLUMN IF NOT EXISTS coordinates jsonb;

-- Keep the address fields but make them nullable
ALTER TABLE florist_profiles
ALTER COLUMN street_number DROP NOT NULL,
ALTER COLUMN street_name DROP NOT NULL,
ALTER COLUMN suburb DROP NOT NULL,
ALTER COLUMN state DROP NOT NULL,
ALTER COLUMN postcode DROP NOT NULL;

-- Add a simple text field for the full address
ALTER TABLE florist_profiles
ADD COLUMN IF NOT EXISTS full_address text;

-- Add indices for common queries
CREATE INDEX IF NOT EXISTS idx_florist_profiles_suburb ON florist_profiles (suburb);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_postcode ON florist_profiles (postcode);

-- Update existing rows to have coordinates in the new format
UPDATE florist_profiles
SET coordinates = jsonb_build_object(
  'lat', CASE 
    WHEN geocoded_address->>'latitude' IS NOT NULL 
    THEN (geocoded_address->>'latitude')::float 
    ELSE NULL 
  END,
  'lng', CASE 
    WHEN geocoded_address->>'longitude' IS NOT NULL 
    THEN (geocoded_address->>'longitude')::float 
    ELSE NULL 
  END
)
WHERE geocoded_address IS NOT NULL;

-- Clean up the geocoded_address column since we don't need it anymore
ALTER TABLE florist_profiles
DROP COLUMN IF EXISTS geocoded_address;
