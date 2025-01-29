-- Create helper functions
CREATE OR REPLACE FUNCTION format_phone(phone text)
RETURNS text AS $$
BEGIN
    -- Remove all non-numeric characters
    phone := regexp_replace(phone, '[^0-9]', '', 'g');
    
    -- Add Australian format
    IF length(phone) = 10 AND left(phone, 1) = '0' THEN
        RETURN phone;
    ELSIF length(phone) = 9 AND left(phone, 1) != '0' THEN
        RETURN '0' || phone;
    ELSIF length(phone) = 11 AND left(phone, 2) = '61' THEN
        RETURN '0' || substring(phone from 3);
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION format_address(addr jsonb)
RETURNS jsonb AS $$
DECLARE
    formatted_addr jsonb;
BEGIN
    formatted_addr := jsonb_build_object(
        'street_number', COALESCE(addr->>'street_number', ''),
        'street_name', COALESCE(addr->>'street_name', ''),
        'unit_number', NULLIF(addr->>'unit_number', ''),
        'suburb', COALESCE(addr->>'suburb', ''),
        'state', COALESCE(upper(addr->>'state'), ''),
        'postcode', COALESCE(addr->>'postcode', ''),
        'coordinates', CASE 
            WHEN addr ? 'coordinates' THEN addr->'coordinates'
            WHEN addr ? 'lat' AND addr ? 'lng' THEN 
                jsonb_build_object('lat', (addr->>'lat')::float, 'lng', (addr->>'lng')::float)
            ELSE NULL
        END,
        'formatted_address', COALESCE(addr->>'formatted_address', NULL)
    );

    -- Validate state
    IF NOT formatted_addr->>'state' = ANY(ARRAY['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']) THEN
        RAISE EXCEPTION 'Invalid state code: %', formatted_addr->>'state';
    END IF;

    -- Validate postcode format
    IF NOT formatted_addr->>'postcode' ~ '^\d{4}$' THEN
        RAISE EXCEPTION 'Invalid postcode format: %', formatted_addr->>'postcode';
    END IF;

    RETURN formatted_addr;
END;
$$ LANGUAGE plpgsql;

-- Backup existing data
CREATE TABLE IF NOT EXISTS florist_profiles_backup AS SELECT * FROM florist_profiles;
CREATE TABLE IF NOT EXISTS products_backup AS SELECT * FROM products;
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;
CREATE TABLE IF NOT EXISTS order_items_backup AS SELECT * FROM order_items;

-- Begin transaction
BEGIN;

-- Migrate florist profiles data
INSERT INTO florist_profiles (
    id,
    user_id,
    store_name,
    store_status,
    about_text,
    contact_email,
    contact_phone,
    website_url,
    address,
    business_settings,
    created_at,
    updated_at
)
SELECT 
    id,
    user_id,
    -- Ensure store name meets length requirements
    CASE 
        WHEN length(store_name) < 2 THEN store_name || ' Shop'
        WHEN length(store_name) > 100 THEN substring(store_name from 1 for 97) || '...'
        ELSE store_name
    END as store_name,
    COALESCE(store_status, 'pending'),
    -- Truncate about_text if too long
    CASE 
        WHEN length(about_text) > 500 THEN substring(about_text from 1 for 497) || '...'
        ELSE about_text
    END,
    -- Ensure valid email
    CASE 
        WHEN contact_email IS NULL OR contact_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
        THEN user_id || '@placeholder.com'
        ELSE contact_email
    END,
    -- Format phone number
    COALESCE(format_phone(contact_phone), '0400000000'),
    -- Validate website URL
    CASE 
        WHEN website_url IS NULL OR website_url !~ '^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$'
        THEN NULL
        ELSE website_url
    END,
    -- Format address
    format_address(COALESCE(address, '{}'::jsonb)),
    -- Ensure valid business settings
    jsonb_build_object(
        'delivery', COALESCE(
            (business_settings->>'delivery')::jsonb,
            jsonb_build_object(
                'radius_km', LEAST(COALESCE((delivery_settings->>'radius_km')::numeric, 10), 100),
                'fee', LEAST(COALESCE((delivery_settings->>'fee')::numeric, 0), 100),
                'minimum_order', LEAST(COALESCE((delivery_settings->>'minimum_order')::numeric, 0), 1000),
                'same_day_cutoff', COALESCE(
                    CASE 
                        WHEN (delivery_settings->>'same_day_cutoff') ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
                        THEN delivery_settings->>'same_day_cutoff'
                        ELSE '14:00'
                    END,
                    '14:00'
                )
            )
        ),
        'hours', COALESCE(
            (business_settings->>'hours')::jsonb,
            jsonb_build_object(
                'monday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'tuesday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'wednesday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'thursday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'friday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'saturday', jsonb_build_object('open', '09:00', 'close', '17:00'),
                'sunday', jsonb_build_object('open', '09:00', 'close', '17:00')
            )
        )
    ),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM florist_profiles_backup;

-- Migrate products data
INSERT INTO products (
    id,
    florist_id,
    name,
    description,
    price,
    status,
    images,
    created_at,
    updated_at
)
SELECT 
    id,
    florist_id,
    -- Ensure name meets length requirements
    CASE 
        WHEN length(name) < 2 THEN name || ' Product'
        WHEN length(name) > 100 THEN substring(name from 1 for 97) || '...'
        ELSE name
    END as name,
    -- Truncate description if too long
    CASE 
        WHEN length(description) > 500 THEN substring(description from 1 for 497) || '...'
        ELSE description
    END,
    -- Ensure price is valid
    GREATEST(COALESCE(price, 0), 0) as price,
    COALESCE(status, 'active'),
    COALESCE(images, '[]'::jsonb),
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM products_backup;

-- Migrate orders data
INSERT INTO orders (
    id,
    customer_id,
    florist_id,
    status,
    total_amount,
    delivery_fee,
    delivery_address,
    delivery_date,
    delivery_time_slot,
    created_at,
    updated_at
)
SELECT 
    id,
    customer_id,
    florist_id,
    COALESCE(status, 'pending'),
    GREATEST(COALESCE(total_amount, 0), 0) as total_amount,
    GREATEST(COALESCE(delivery_fee, 0), 0) as delivery_fee,
    format_address(COALESCE(delivery_address, '{}'::jsonb)),
    GREATEST(COALESCE(delivery_date, CURRENT_DATE), CURRENT_DATE) as delivery_date,
    COALESCE(
        CASE 
            WHEN delivery_time_slot ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
            THEN delivery_time_slot
            ELSE '09:00-10:00'
        END,
        '09:00-10:00'
    ) as delivery_time_slot,
    COALESCE(created_at, NOW()),
    COALESCE(updated_at, NOW())
FROM orders_backup;

-- Migrate order items data
INSERT INTO order_items (
    id,
    order_id,
    product_id,
    quantity,
    price_at_time,
    created_at
)
SELECT 
    id,
    order_id,
    product_id,
    GREATEST(COALESCE(quantity, 1), 1) as quantity,
    GREATEST(COALESCE(price_at_time, 0), 0) as price_at_time,
    COALESCE(created_at, NOW())
FROM order_items_backup;

-- Set up RLS policies
ALTER TABLE florist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Florist profile policies
CREATE POLICY "Users can view all active florist profiles"
    ON florist_profiles FOR SELECT
    USING (store_status = 'active');

CREATE POLICY "Users can manage their own florist profile"
    ON florist_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Product policies
CREATE POLICY "Users can view active products"
    ON products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Florists can manage their own products"
    ON products FOR ALL
    USING (
        auth.uid() IN (
            SELECT user_id FROM florist_profiles WHERE id = products.florist_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM florist_profiles WHERE id = products.florist_id
        )
    );

-- Order policies
CREATE POLICY "Customers can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Florists can view orders for their store"
    ON orders FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM florist_profiles WHERE id = orders.florist_id
        )
    );

CREATE POLICY "Customers can create orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = customer_id);

-- Order items policies
CREATE POLICY "Users can view their order items"
    ON order_items FOR SELECT
    USING (
        auth.uid() IN (
            SELECT customer_id FROM orders WHERE id = order_items.order_id
        ) OR
        auth.uid() IN (
            SELECT user_id 
            FROM florist_profiles fp 
            JOIN orders o ON fp.id = o.florist_id 
            WHERE o.id = order_items.order_id
        )
    );

CREATE POLICY "Customers can create order items"
    ON order_items FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT customer_id FROM orders WHERE id = order_items.order_id
        )
    );

COMMIT;
