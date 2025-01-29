-- Drop old columns that are now part of JSONB fields
ALTER TABLE florist_profiles
  DROP COLUMN IF EXISTS street_address,
  DROP COLUMN IF EXISTS suburb,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS postcode,
  DROP COLUMN IF EXISTS coordinates,
  DROP COLUMN IF EXISTS delivery_radius,
  DROP COLUMN IF EXISTS delivery_fee,
  DROP COLUMN IF EXISTS minimum_order_amount,
  DROP COLUMN IF EXISTS operating_hours,
  DROP COLUMN IF EXISTS delivery_days,
  DROP COLUMN IF EXISTS delivery_time_frames,
  DROP COLUMN IF EXISTS setup_progress;

-- Update store_status values
UPDATE florist_profiles 
SET store_status = 'pending' 
WHERE store_status = 'draft';

-- Update store_status constraint
ALTER TABLE florist_profiles 
  DROP CONSTRAINT IF EXISTS florist_profiles_store_status_check,
  ADD CONSTRAINT florist_profiles_store_status_check 
    CHECK (store_status IN ('active', 'inactive', 'pending'));

-- Add setup_progress as JSONB with proper structure
ALTER TABLE florist_profiles
  ADD COLUMN IF NOT EXISTS setup_progress jsonb DEFAULT '{"completed_steps": []}'::jsonb;

-- Update RLS policies
DROP POLICY IF EXISTS "Anyone can view active florist profiles" ON florist_profiles;
DROP POLICY IF EXISTS "Florists can view their own profile regardless of status" ON florist_profiles;
DROP POLICY IF EXISTS "Florists can update their own profile" ON florist_profiles;

CREATE POLICY "Public can view active florist profiles"
  ON florist_profiles FOR SELECT
  USING (store_status = 'active');

CREATE POLICY "Owners can view their own florist profile"
  ON florist_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can update their own florist profile"
  ON florist_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their own florist profile"
  ON florist_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Add missing indices
CREATE INDEX IF NOT EXISTS idx_florist_profiles_user_id ON florist_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_store_name ON florist_profiles (store_name);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_created_at ON florist_profiles (created_at);

-- Update validation function to be more robust
CREATE OR REPLACE FUNCTION validate_florist_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate complete data for active profiles
  IF NEW.store_status = 'active' THEN
    -- Validate address_details
    IF NOT (NEW.address_details ? 'street_number' AND 
            NEW.address_details ? 'street_name' AND 
            NEW.address_details ? 'suburb' AND 
            NEW.address_details ? 'state' AND 
            NEW.address_details ? 'postcode')
      OR 
      NEW.address_details->>'street_number' = '' OR
      NEW.address_details->>'street_name' = '' OR
      NEW.address_details->>'suburb' = '' OR
      NEW.address_details->>'state' = '' OR
      NEW.address_details->>'postcode' = ''
    THEN
      RAISE EXCEPTION 'Active profiles must have complete address details';
    END IF;

    -- Validate delivery_settings
    IF NOT (NEW.delivery_settings ? 'distance_type' AND 
            NEW.delivery_settings ? 'max_distance_km' AND
            NEW.delivery_settings ? 'same_day_cutoff' AND
            NEW.delivery_settings ? 'minimum_order' AND
            NEW.delivery_settings ? 'delivery_fee')
      OR
      NOT NEW.delivery_settings->>'distance_type' = ANY(ARRAY['radius', 'driving'])
    THEN
      RAISE EXCEPTION 'Active profiles must have valid delivery settings';
    END IF;

    -- Validate business_hours
    IF NOT (NEW.business_hours ? 'monday' AND 
            NEW.business_hours ? 'tuesday' AND 
            NEW.business_hours ? 'wednesday' AND 
            NEW.business_hours ? 'thursday' AND 
            NEW.business_hours ? 'friday' AND 
            NEW.business_hours ? 'saturday' AND 
            NEW.business_hours ? 'sunday')
    THEN
      RAISE EXCEPTION 'Active profiles must have complete business hours';
    END IF;
  END IF;

  -- Always ensure address_details and location are properly structured
  IF NEW.address_details IS NOT NULL AND NOT jsonb_typeof(NEW.address_details) = 'object' THEN
    RAISE EXCEPTION 'address_details must be a JSON object';
  END IF;

  IF NEW.location IS NOT NULL AND NOT (
    NEW.location ? 'type' AND 
    NEW.location ? 'coordinates' AND 
    NEW.location->>'type' = 'Point' AND 
    jsonb_array_length(NEW.location->'coordinates') = 2
  ) THEN
    RAISE EXCEPTION 'location must be a valid Point geometry';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
