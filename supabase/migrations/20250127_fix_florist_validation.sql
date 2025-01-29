-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trg_validate_florist_profile ON florist_profiles;
DROP FUNCTION IF EXISTS validate_florist_profile();

-- Create a more lenient validation function
CREATE OR REPLACE FUNCTION validate_florist_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize NEW.address_details if null
  IF NEW.address_details IS NULL THEN
    NEW.address_details = '{}'::jsonb;
  END IF;

  -- Initialize NEW.delivery_settings if null
  IF NEW.delivery_settings IS NULL THEN
    NEW.delivery_settings = '{
      "distance_type": "radius",
      "max_distance_km": 5,
      "same_day_cutoff": "14:00",
      "next_day_cutoff_enabled": false,
      "next_day_cutoff": null,
      "minimum_order": 0,
      "delivery_fee": 0
    }'::jsonb;
  END IF;

  -- Initialize NEW.business_hours if null
  IF NEW.business_hours IS NULL THEN
    NEW.business_hours = '{
      "monday": {"open": "09:00", "close": "17:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
      "thursday": {"open": "09:00", "close": "17:00", "closed": false},
      "friday": {"open": "09:00", "close": "17:00", "closed": false},
      "saturday": {"open": "09:00", "close": "17:00", "closed": false},
      "sunday": {"open": "09:00", "close": "17:00", "closed": true}
    }'::jsonb;
  END IF;

  -- Only validate address_details if all required fields are being set
  IF (NEW.address_details ? 'street_number' OR 
      NEW.address_details ? 'street_name' OR 
      NEW.address_details ? 'suburb' OR 
      NEW.address_details ? 'state' OR 
      NEW.address_details ? 'postcode') THEN
    
    -- Check if any required field is missing
    IF NOT (NEW.address_details ? 'street_number' AND 
            NEW.address_details ? 'street_name' AND 
            NEW.address_details ? 'suburb' AND 
            NEW.address_details ? 'state' AND 
            NEW.address_details ? 'postcode') THEN
      RAISE EXCEPTION 'When updating address details, all required fields must be provided: street_number, street_name, suburb, state, and postcode';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger for validation
CREATE TRIGGER trg_validate_florist_profile
  BEFORE INSERT OR UPDATE ON florist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_florist_profile();

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Florists can view their own profile" ON florist_profiles;
DROP POLICY IF EXISTS "Florists can update their own profile" ON florist_profiles;
DROP POLICY IF EXISTS "Florists can insert their own profile" ON florist_profiles;

-- Add new RLS policies with proper public access
CREATE POLICY "Public can view active florist profiles"
    ON florist_profiles FOR SELECT
    USING (store_status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Florists can update their own profile"
    ON florist_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Florists can insert their own profile"
    ON florist_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_florist_profiles_store_status 
    ON florist_profiles(store_status);

CREATE INDEX IF NOT EXISTS idx_florist_profiles_address_suburb 
    ON florist_profiles USING GIN ((address_details->'suburb'));

CREATE INDEX IF NOT EXISTS idx_florist_profiles_address_state 
    ON florist_profiles USING GIN ((address_details->'state'));

-- Add function to search florists by location
CREATE OR REPLACE FUNCTION search_florists_by_location(search_terms text[])
RETURNS SETOF florist_profiles AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (fp.id) fp.*
    FROM florist_profiles fp,
         jsonb_array_elements_text(fp.address_details->'suburb') suburb,
         jsonb_array_elements_text(fp.address_details->'state') state
    WHERE fp.store_status = 'active'
    AND (
        EXISTS (
            SELECT 1
            FROM unnest(search_terms) term
            WHERE suburb ILIKE '%' || term || '%'
            OR state ILIKE '%' || term || '%'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
