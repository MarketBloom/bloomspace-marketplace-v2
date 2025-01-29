-- Drop any existing functions we'll be replacing
DROP FUNCTION IF EXISTS can_deliver_to_location(uuid, double precision, double precision, date, time);
DROP FUNCTION IF EXISTS is_within_delivery_radius(float, float, uuid, float);
DROP FUNCTION IF EXISTS get_available_delivery_slots(uuid, date);
DROP FUNCTION IF EXISTS validate_florist_profile();

-- Create type for delivery slot result
CREATE TYPE delivery_slot_info AS (
  name text,
  start_time time,
  end_time time,
  available boolean,
  reason text
);

-- Function to validate time format
CREATE OR REPLACE FUNCTION is_valid_time(time_str text)
RETURNS boolean AS $$
BEGIN
  RETURN time_str ~ '^([0-1][0-9]|2[0-3]):[0-5][0-9]$';
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Enhanced validation function
CREATE OR REPLACE FUNCTION validate_florist_profile()
RETURNS TRIGGER AS $$
DECLARE
  day text;
  slot jsonb;
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
  IF (NEW.delivery_settings->>'max_distance_km')::float <= 0 THEN
    RAISE EXCEPTION 'max_distance_km must be positive';
  END IF;

  -- Validate same_day_cutoff format
  IF NOT is_valid_time(NEW.delivery_settings->>'same_day_cutoff') THEN
    RAISE EXCEPTION 'same_day_cutoff must be in HH:MM format';
  END IF;

  -- Validate next_day_cutoff if enabled
  IF (NEW.delivery_settings->>'next_day_cutoff_enabled')::boolean AND 
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
    IF NOT (NEW.business_hours->day->>'closed')::boolean AND
       (NEW.business_hours->day->>'open')::time >= (NEW.business_hours->day->>'close')::time THEN
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

    IF (slot->>'start')::time >= (slot->>'end')::time THEN
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

    IF (slot->>'start')::time >= (slot->>'end')::time THEN
      RAISE EXCEPTION 'slot start time must be before end time';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a florist can deliver to a location
CREATE OR REPLACE FUNCTION can_deliver_to_location(
  florist_id uuid,
  customer_lat double precision,
  customer_lng double precision,
  delivery_date date DEFAULT CURRENT_DATE,
  delivery_time time DEFAULT CURRENT_TIME
) RETURNS TABLE (
  can_deliver boolean,
  reason text,
  estimated_distance double precision,
  estimated_duration integer
) AS $$
DECLARE
  florist_record record;
  distance_km double precision;
  day_of_week text;
  is_weekend boolean;
BEGIN
  -- Get florist details
  SELECT * INTO florist_record
  FROM florist_profiles
  WHERE id = florist_id;

  -- Check if florist is active
  IF florist_record.store_status != 'active' THEN
    RETURN QUERY SELECT false, 'Florist is not currently active'::text, NULL::double precision, NULL::integer;
    RETURN;
  END IF;

  -- Calculate distance using PostGIS
  SELECT ST_Distance(
    florist_record.location::geography,
    ST_SetSRID(ST_MakePoint(customer_lng, customer_lat), 4326)::geography
  ) / 1000 INTO distance_km;

  -- Check if within delivery distance
  IF distance_km > (florist_record.delivery_settings->>'max_distance_km')::float THEN
    RETURN QUERY SELECT 
      false,
      format('Location is too far (%.1f km, max is %s km)', 
             distance_km, 
             florist_record.delivery_settings->>'max_distance_km')::text,
      distance_km,
      NULL::integer;
    RETURN;
  END IF;

  -- Get day of week and check if weekend
  SELECT to_char(delivery_date, 'day') INTO day_of_week;
  day_of_week := trim(lower(day_of_week));
  is_weekend := day_of_week IN ('saturday', 'sunday');

  -- Check if florist is open on delivery date
  IF (florist_record.business_hours->day_of_week->>'closed')::boolean THEN
    RETURN QUERY SELECT 
      false,
      format('Florist is closed on %s', initcap(day_of_week))::text,
      distance_km,
      NULL::integer;
    RETURN;
  END IF;

  -- Check delivery time is within business hours
  IF delivery_time < (florist_record.business_hours->day_of_week->>'open')::time OR
     delivery_time > (florist_record.business_hours->day_of_week->>'close')::time THEN
    RETURN QUERY SELECT 
      false,
      format('Delivery time is outside business hours (%s - %s)',
             florist_record.business_hours->day_of_week->>'open',
             florist_record.business_hours->day_of_week->>'close')::text,
      distance_km,
      NULL::integer;
    RETURN;
  END IF;

  -- Check same-day delivery cutoff
  IF delivery_date = CURRENT_DATE AND 
     CURRENT_TIME > (florist_record.delivery_settings->>'same_day_cutoff')::time THEN
    RETURN QUERY SELECT 
      false,
      format('Past same-day delivery cutoff time (%s)',
             florist_record.delivery_settings->>'same_day_cutoff')::text,
      distance_km,
      NULL::integer;
    RETURN;
  END IF;

  -- Check next-day cutoff if enabled
  IF delivery_date = CURRENT_DATE + 1 AND
     (florist_record.delivery_settings->>'next_day_cutoff_enabled')::boolean AND
     CURRENT_TIME > (florist_record.delivery_settings->>'next_day_cutoff')::time THEN
    RETURN QUERY SELECT 
      false,
      format('Past next-day delivery cutoff time (%s)',
             florist_record.delivery_settings->>'next_day_cutoff')::text,
      distance_km,
      NULL::integer;
    RETURN;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT 
    true,
    'Available for delivery'::text,
    distance_km,
    (distance_km * 2)::integer; -- Rough estimate of delivery duration in minutes
END;
$$ LANGUAGE plpgsql;

-- Function to get available delivery slots for a date
CREATE OR REPLACE FUNCTION get_available_delivery_slots(
  florist_id uuid,
  delivery_date date
) RETURNS SETOF delivery_slot_info AS $$
DECLARE
  florist_record record;
  day_of_week text;
  is_weekend boolean;
  slot_record record;
  is_same_day boolean;
  is_next_day boolean;
  current_cutoff time;
BEGIN
  -- Get florist details
  SELECT * INTO florist_record
  FROM florist_profiles
  WHERE id = florist_id;

  -- Get day of week and check if weekend
  SELECT to_char(delivery_date, 'day') INTO day_of_week;
  day_of_week := trim(lower(day_of_week));
  is_weekend := day_of_week IN ('saturday', 'sunday');

  -- Check if same day or next day
  is_same_day := delivery_date = CURRENT_DATE;
  is_next_day := delivery_date = CURRENT_DATE + 1;

  -- Get relevant cutoff time
  IF is_same_day THEN
    current_cutoff := (florist_record.delivery_settings->>'same_day_cutoff')::time;
  ELSIF is_next_day AND (florist_record.delivery_settings->>'next_day_cutoff_enabled')::boolean THEN
    current_cutoff := (florist_record.delivery_settings->>'next_day_cutoff')::time;
  ELSE
    current_cutoff := NULL;
  END IF;

  -- Return slots based on weekday/weekend
  IF is_weekend THEN
    FOR slot_record IN 
      SELECT *
      FROM jsonb_array_elements(florist_record.delivery_slots->'weekends'->'slots')
    LOOP
      RETURN NEXT (
        slot_record->>'name',
        (slot_record->>'start')::time,
        (slot_record->>'end')::time,
        CASE
          WHEN NOT (slot_record->>'enabled')::boolean THEN false
          WHEN (florist_record.business_hours->day_of_week->>'closed')::boolean THEN false
          WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN false
          WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN false
          ELSE true
        END,
        CASE
          WHEN NOT (slot_record->>'enabled')::boolean THEN 'Slot is disabled'
          WHEN (florist_record.business_hours->day_of_week->>'closed')::boolean THEN 'Florist is closed'
          WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN 'Past same-day cutoff'
          WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN 'Past next-day cutoff'
          ELSE 'Available'
        END
      )::delivery_slot_info;
    END LOOP;
  ELSE
    FOR slot_record IN 
      SELECT *
      FROM jsonb_array_elements(florist_record.delivery_slots->'weekdays'->'slots')
    LOOP
      RETURN NEXT (
        slot_record->>'name',
        (slot_record->>'start')::time,
        (slot_record->>'end')::time,
        CASE
          WHEN NOT (slot_record->>'enabled')::boolean THEN false
          WHEN (florist_record.business_hours->day_of_week->>'closed')::boolean THEN false
          WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN false
          WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN false
          ELSE true
        END,
        CASE
          WHEN NOT (slot_record->>'enabled')::boolean THEN 'Slot is disabled'
          WHEN (florist_record.business_hours->day_of_week->>'closed')::boolean THEN 'Florist is closed'
          WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN 'Past same-day cutoff'
          WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN 'Past next-day cutoff'
          ELSE 'Available'
        END
      )::delivery_slot_info;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create indices for better query performance
CREATE INDEX IF NOT EXISTS idx_florist_profiles_location ON florist_profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_status ON florist_profiles (store_status);
CREATE INDEX IF NOT EXISTS idx_florist_profiles_suburb ON florist_profiles ((address_details->>'suburb'));
CREATE INDEX IF NOT EXISTS idx_florist_profiles_postcode ON florist_profiles ((address_details->>'postcode'));

-- Create trigger for validation
DROP TRIGGER IF EXISTS trg_validate_florist_profile ON florist_profiles;
CREATE TRIGGER trg_validate_florist_profile
  BEFORE INSERT OR UPDATE ON florist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_florist_profile();

-- Create functions for searching florists
CREATE OR REPLACE FUNCTION search_florists_by_location(
  lat double precision,
  lng double precision,
  max_distance double precision DEFAULT 50,
  delivery_date date DEFAULT CURRENT_DATE,
  delivery_time time DEFAULT CURRENT_TIME
) RETURNS TABLE (
  id uuid,
  store_name text,
  distance double precision,
  can_deliver boolean,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  WITH nearby_florists AS (
    SELECT 
      f.id,
      f.store_name,
      ST_Distance(
        f.location::geography,
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
      ) / 1000 as distance
    FROM florist_profiles f
    WHERE f.store_status = 'active'
    AND ST_DWithin(
      f.location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      max_distance * 1000  -- Convert km to meters
    )
  )
  SELECT 
    f.id,
    f.store_name,
    f.distance,
    d.can_deliver,
    d.reason
  FROM nearby_florists f
  CROSS JOIN LATERAL can_deliver_to_location(f.id, lat, lng, delivery_date, delivery_time) d
  ORDER BY f.distance;
END;
$$ LANGUAGE plpgsql;
