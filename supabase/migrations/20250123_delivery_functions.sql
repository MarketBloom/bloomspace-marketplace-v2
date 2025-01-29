-- Function to check if a florist can deliver to a location
CREATE OR REPLACE FUNCTION can_deliver_to_location(
    florist_id UUID,
    customer_lat DOUBLE PRECISION,
    customer_lng DOUBLE PRECISION,
    delivery_date DATE DEFAULT CURRENT_DATE,
    delivery_time TIME DEFAULT CURRENT_TIME
) RETURNS TABLE (
    can_deliver BOOLEAN,
    reason TEXT,
    estimated_distance DOUBLE PRECISION,
    estimated_duration INTEGER
) AS $$
DECLARE
    florist_record RECORD;
    distance_km DOUBLE PRECISION;
    day_of_week TEXT;
    is_weekend BOOLEAN;
BEGIN
    -- Get florist details
    SELECT * INTO florist_record
    FROM florist_profiles
    WHERE id = florist_id;

    -- Check if florist is active
    IF florist_record.store_status != 'active' THEN
        RETURN QUERY SELECT 
            FALSE, 
            'Florist is not currently active'::TEXT, 
            NULL::DOUBLE PRECISION, 
            NULL::INTEGER;
        RETURN;
    END IF;

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
    IF distance_km > (florist_record.delivery_settings->>'max_distance_km')::FLOAT THEN
        RETURN QUERY SELECT 
            FALSE,
            format('Location is too far (%.1f km, max is %s km)', 
                   distance_km, 
                   florist_record.delivery_settings->>'max_distance_km')::TEXT,
            distance_km,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Get day of week and check if weekend
    SELECT to_char(delivery_date, 'day') INTO day_of_week;
    day_of_week := trim(lower(day_of_week));
    is_weekend := day_of_week IN ('saturday', 'sunday');

    -- Check if florist is open on delivery date
    IF (florist_record.business_hours->day_of_week->>'closed')::BOOLEAN THEN
        RETURN QUERY SELECT 
            FALSE,
            format('Florist is closed on %s', initcap(day_of_week))::TEXT,
            distance_km,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Check delivery time is within business hours
    IF delivery_time < (florist_record.business_hours->day_of_week->>'open')::TIME OR
       delivery_time > (florist_record.business_hours->day_of_week->>'close')::TIME THEN
        RETURN QUERY SELECT 
            FALSE,
            format('Delivery time is outside business hours (%s - %s)',
                   florist_record.business_hours->day_of_week->>'open',
                   florist_record.business_hours->day_of_week->>'close')::TEXT,
            distance_km,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Check same-day delivery cutoff
    IF delivery_date = CURRENT_DATE AND 
       CURRENT_TIME > (florist_record.delivery_settings->>'same_day_cutoff')::TIME THEN
        RETURN QUERY SELECT 
            FALSE,
            format('Past same-day delivery cutoff time (%s)',
                   florist_record.delivery_settings->>'same_day_cutoff')::TEXT,
            distance_km,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Check next-day cutoff if enabled
    IF delivery_date = CURRENT_DATE + 1 AND
       (florist_record.delivery_settings->>'next_day_cutoff_enabled')::BOOLEAN AND
       CURRENT_TIME > (florist_record.delivery_settings->>'next_day_cutoff')::TIME THEN
        RETURN QUERY SELECT 
            FALSE,
            format('Past next-day delivery cutoff time (%s)',
                   florist_record.delivery_settings->>'next_day_cutoff')::TEXT,
            distance_km,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- All checks passed
    RETURN QUERY SELECT 
        TRUE,
        'Available for delivery'::TEXT,
        distance_km,
        (distance_km * 2)::INTEGER; -- Rough estimate of delivery duration in minutes
END;
$$ LANGUAGE plpgsql;

-- Function to get available delivery slots for a date
CREATE OR REPLACE FUNCTION get_available_delivery_slots(
    florist_id UUID,
    delivery_date DATE
) RETURNS SETOF delivery_slot_info AS $$
DECLARE
    florist_record RECORD;
    day_of_week TEXT;
    is_weekend BOOLEAN;
    slot_record RECORD;
    is_same_day BOOLEAN;
    is_next_day BOOLEAN;
    current_cutoff TIME;
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
        current_cutoff := (florist_record.delivery_settings->>'same_day_cutoff')::TIME;
    ELSIF is_next_day AND (florist_record.delivery_settings->>'next_day_cutoff_enabled')::BOOLEAN THEN
        current_cutoff := (florist_record.delivery_settings->>'next_day_cutoff')::TIME;
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
                (slot_record->>'start')::TIME,
                (slot_record->>'end')::TIME,
                CASE
                    WHEN NOT (slot_record->>'enabled')::BOOLEAN THEN FALSE
                    WHEN (florist_record.business_hours->day_of_week->>'closed')::BOOLEAN THEN FALSE
                    WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN FALSE
                    WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN FALSE
                    ELSE TRUE
                END,
                CASE
                    WHEN NOT (slot_record->>'enabled')::BOOLEAN THEN 'Slot is disabled'
                    WHEN (florist_record.business_hours->day_of_week->>'closed')::BOOLEAN THEN 'Florist is closed'
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
                (slot_record->>'start')::TIME,
                (slot_record->>'end')::TIME,
                CASE
                    WHEN NOT (slot_record->>'enabled')::BOOLEAN THEN FALSE
                    WHEN (florist_record.business_hours->day_of_week->>'closed')::BOOLEAN THEN FALSE
                    WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN FALSE
                    WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN FALSE
                    ELSE TRUE
                END,
                CASE
                    WHEN NOT (slot_record->>'enabled')::BOOLEAN THEN 'Slot is disabled'
                    WHEN (florist_record.business_hours->day_of_week->>'closed')::BOOLEAN THEN 'Florist is closed'
                    WHEN is_same_day AND CURRENT_TIME > current_cutoff THEN 'Past same-day cutoff'
                    WHEN is_next_day AND current_cutoff IS NOT NULL AND CURRENT_TIME > current_cutoff THEN 'Past next-day cutoff'
                    ELSE 'Available'
                END
            )::delivery_slot_info;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to search for florists by location
CREATE OR REPLACE FUNCTION search_florists_by_location(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    max_distance DOUBLE PRECISION DEFAULT 50,
    delivery_date DATE DEFAULT CURRENT_DATE,
    delivery_time TIME DEFAULT CURRENT_TIME
) RETURNS TABLE (
    id UUID,
    store_name TEXT,
    distance DOUBLE PRECISION,
    can_deliver BOOLEAN,
    reason TEXT
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

-- Calculate delivery distance and check if delivery is possible
CREATE OR REPLACE FUNCTION calculate_delivery_distance(
  florist_id UUID,
  customer_lat DOUBLE PRECISION,
  customer_lng DOUBLE PRECISION
) RETURNS TABLE (
  distance_km DOUBLE PRECISION,
  is_deliverable BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  florist_lat DOUBLE PRECISION;
  florist_lng DOUBLE PRECISION;
  delivery_radius DOUBLE PRECISION;
BEGIN
  -- Get florist location and delivery radius
  SELECT 
    (address->>'coordinates')::jsonb->>'lat',
    (address->>'coordinates')::jsonb->>'lng',
    delivery_radius
  INTO 
    florist_lat,
    florist_lng,
    delivery_radius
  FROM florists
  WHERE id = florist_id;

  -- Calculate straight-line distance as a fallback
  -- The actual driving distance will be calculated using Google Maps Distance Matrix API in the application layer
  distance_km := earth_distance(
    ll_to_earth(florist_lat, florist_lng),
    ll_to_earth(customer_lat, customer_lng)
  ) / 1000;

  -- Check if delivery is possible based on straight-line distance
  -- This is a conservative estimate, actual delivery availability will be determined
  -- by the Google Maps driving distance in the application layer
  is_deliverable := distance_km <= delivery_radius * 1.2; -- Add 20% buffer for driving vs straight-line difference

  RETURN NEXT;
END;
$$;

-- Check if a florist can deliver to a location
CREATE OR REPLACE FUNCTION can_deliver_to(
  florist_id UUID,
  delivery_address JSONB
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  customer_lat DOUBLE PRECISION;
  customer_lng DOUBLE PRECISION;
  distance_result RECORD;
BEGIN
  -- Extract coordinates from delivery address
  customer_lat := (delivery_address->>'coordinates')::jsonb->>'lat';
  customer_lng := (delivery_address->>'coordinates')::jsonb->>'lng';

  -- Calculate distance and check deliverability
  SELECT * INTO distance_result
  FROM calculate_delivery_distance(florist_id, customer_lat, customer_lng);

  RETURN distance_result.is_deliverable;
END;
$$;

-- Get nearby florists
CREATE OR REPLACE FUNCTION get_nearby_florists(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 50,
  limit_count INTEGER DEFAULT 50
) RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  address JSONB,
  delivery_radius DOUBLE PRECISION,
  distance_km DOUBLE PRECISION
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH florist_distances AS (
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
    WHERE f.status = 'active'
  )
  SELECT
    fd.id,
    fd.name,
    fd.description,
    fd.address,
    fd.delivery_radius,
    fd.distance_km
  FROM florist_distances fd
  WHERE fd.distance_km <= radius_km
  ORDER BY fd.distance_km
  LIMIT limit_count;
END;
$$;
