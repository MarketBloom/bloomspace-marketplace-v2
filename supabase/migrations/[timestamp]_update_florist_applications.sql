-- Update the florist_applications table structure
ALTER TABLE florist_applications
  ADD COLUMN IF NOT EXISTS address_details jsonb,
  ADD COLUMN IF NOT EXISTS social_links jsonb,
  ADD COLUMN IF NOT EXISTS business_capabilities jsonb,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS instagram_url,
  DROP COLUMN IF EXISTS portfolio_urls;

-- Add validation checks
ALTER TABLE florist_applications
  ADD CONSTRAINT valid_address_details 
  CHECK (jsonb_typeof(address_details) = 'object' 
    AND address_details ? 'street_number' 
    AND address_details ? 'street_name' 
    AND address_details ? 'suburb' 
    AND address_details ? 'state' 
    AND address_details ? 'postcode');

-- Update existing rows (if needed)
UPDATE florist_applications
SET address_details = jsonb_build_object(
  'street_number', '',
  'street_name', address,
  'suburb', '',
  'state', '',
  'postcode', ''
)
WHERE address_details IS NULL AND address IS NOT NULL; 