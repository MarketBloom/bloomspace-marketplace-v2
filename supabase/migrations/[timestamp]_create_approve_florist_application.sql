CREATE OR REPLACE FUNCTION approve_florist_application(
  p_application_id UUID,
  p_admin_notes TEXT DEFAULT '',
  p_commission_rate NUMERIC DEFAULT 10
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Start transaction
  BEGIN
    -- 1. Update application status
    UPDATE florist_applications
    SET 
      status = 'approved',
      admin_notes = p_admin_notes,
      updated_at = NOW()
    WHERE id = p_application_id;

    -- 2. Get application data
    WITH app AS (
      SELECT * FROM florist_applications WHERE id = p_application_id
    )
    -- 3. Update or create florist profile
    INSERT INTO florist_profiles (
      user_id,
      store_name,
      store_status,
      about_text,
      contact_email,
      contact_phone,
      address_details,
      social_links,
      commission_rate,
      business_settings,
      setup_progress
    )
    SELECT
      (SELECT id FROM auth.users WHERE email = app.email),
      app.store_name,
      'active',
      app.about_business,
      app.email,
      app.phone,
      app.address_details,
      app.social_links,
      p_commission_rate,
      jsonb_build_object(
        'delivery', jsonb_build_object(
          'radius_km', 10,
          'fee', 0,
          'minimum_order', 0,
          'same_day_cutoff', '14:00',
          'next_day_cutoff_enabled', false
        ),
        'hours', jsonb_build_object(
          'monday', '{"open":"09:00","close":"17:00","closed":false}',
          'tuesday', '{"open":"09:00","close":"17:00","closed":false}',
          'wednesday', '{"open":"09:00","close":"17:00","closed":false}',
          'thursday', '{"open":"09:00","close":"17:00","closed":false}',
          'friday', '{"open":"09:00","close":"17:00","closed":false}',
          'saturday', '{"open":"09:00","close":"17:00","closed":false}',
          'sunday', '{"open":"09:00","close":"17:00","closed":true}'
        )::jsonb
      ),
      0
    FROM app;

    -- 4. Update user role
    UPDATE auth.users
    SET raw_user_meta_data = raw_user_meta_data || 
        jsonb_build_object('role', 'florist')
    WHERE email = (SELECT email FROM florist_applications WHERE id = p_application_id);

  EXCEPTION
    WHEN OTHERS THEN
      ROLLBACK;
      RAISE;
  END;
END;
$$; 