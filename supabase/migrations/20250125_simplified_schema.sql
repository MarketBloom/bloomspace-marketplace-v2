-- Enable PostGIS for location-based queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS florist_profiles;

-- Create the florist_profiles table
CREATE TABLE florist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users NOT NULL,
    store_name TEXT NOT NULL CHECK (char_length(store_name) >= 2 AND char_length(store_name) <= 100),
    store_status TEXT NOT NULL DEFAULT 'pending',
    about_text TEXT CHECK (about_text IS NULL OR char_length(about_text) <= 500),
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    website_url TEXT,
    
    -- Address as JSONB for flexibility
    address JSONB NOT NULL,
    
    -- Business Settings
    business_settings JSONB NOT NULL DEFAULT '{
        "delivery": {
            "radius_km": 10,
            "fee": 0,
            "minimum_order": 0,
            "same_day_cutoff": "14:00"
        },
        "hours": {
            "monday": {"open": "09:00", "close": "17:00"},
            "tuesday": {"open": "09:00", "close": "17:00"},
            "wednesday": {"open": "09:00", "close": "17:00"},
            "thursday": {"open": "09:00", "close": "17:00"},
            "friday": {"open": "09:00", "close": "17:00"},
            "saturday": {"open": "09:00", "close": "17:00"},
            "sunday": {"open": "09:00", "close": "17:00"}
        }
    }'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_store_status CHECK (store_status IN ('pending', 'active', 'inactive')),
    CONSTRAINT valid_email CHECK (
        contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT valid_phone CHECK (
        contact_phone ~* '^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$'
    ),
    CONSTRAINT valid_website CHECK (
        website_url IS NULL OR 
        website_url ~* '^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$'
    ),
    CONSTRAINT valid_address CHECK (
        jsonb_typeof(address) = 'object' AND
        address ? 'street_number' AND
        address ? 'street_name' AND
        address ? 'suburb' AND
        address ? 'state' AND
        address ? 'postcode'
    ),
    CONSTRAINT valid_business_settings CHECK (
        jsonb_typeof(business_settings) = 'object' AND
        business_settings ? 'delivery' AND
        business_settings ? 'hours' AND
        (business_settings->>'delivery')::jsonb ? 'radius_km' AND
        (business_settings->>'delivery')::jsonb ? 'fee' AND
        (business_settings->>'delivery')::jsonb ? 'minimum_order' AND
        (business_settings->>'delivery')::jsonb ? 'same_day_cutoff'
    )
);

-- Create indexes
CREATE INDEX idx_florist_profiles_user_id ON florist_profiles(user_id);
CREATE INDEX idx_florist_profiles_store_status ON florist_profiles(store_status);
CREATE INDEX idx_florist_profiles_location ON florist_profiles USING GIST(ST_SetSRID(ST_Point(
    (address->>'coordinates'->>'lng')::float,
    (address->>'coordinates'->>'lat')::float
), 4326));

-- Create the products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    florist_id UUID REFERENCES florist_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status TEXT NOT NULL DEFAULT 'active',
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_product_status CHECK (status IN ('active', 'inactive', 'deleted')),
    CONSTRAINT valid_images CHECK (jsonb_typeof(images) = 'array')
);

-- Create indexes for products
CREATE INDEX idx_products_florist_id ON products(florist_id);
CREATE INDEX idx_products_status ON products(status);

-- Create the orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES auth.users NOT NULL,
    florist_id UUID REFERENCES florist_profiles(id) ON DELETE RESTRICT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    delivery_fee DECIMAL(10,2) NOT NULL CHECK (delivery_fee >= 0),
    delivery_address JSONB NOT NULL,
    delivery_date DATE NOT NULL CHECK (delivery_date >= CURRENT_DATE),
    delivery_time_slot TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_order_status CHECK (
        status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
    ),
    CONSTRAINT valid_delivery_address CHECK (
        jsonb_typeof(delivery_address) = 'object' AND
        delivery_address ? 'street_number' AND
        delivery_address ? 'street_name' AND
        delivery_address ? 'suburb' AND
        delivery_address ? 'state' AND
        delivery_address ? 'postcode'
    ),
    CONSTRAINT valid_delivery_time_slot CHECK (
        delivery_time_slot ~ '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
    )
);

-- Create indexes for orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_florist_id ON orders(florist_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);

-- Create the order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for order_items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_florist_profiles_updated_at
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to find florists within radius
CREATE OR REPLACE FUNCTION find_florists_within_radius(
    lat double precision,
    lng double precision,
    radius_km double precision
) RETURNS TABLE (
    id UUID,
    store_name TEXT,
    distance_km double precision
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        fp.id,
        fp.store_name,
        ST_Distance(
            ST_SetSRID(ST_Point(lng, lat), 4326)::geography,
            ST_SetSRID(ST_Point(
                (fp.address->>'coordinates'->>'lng')::float,
                (fp.address->>'coordinates'->>'lat')::float
            ), 4326)::geography
        ) / 1000 AS distance_km
    FROM florist_profiles fp
    WHERE
        fp.store_status = 'active'
        AND ST_DWithin(
            ST_SetSRID(ST_Point(lng, lat), 4326)::geography,
            ST_SetSRID(ST_Point(
                (fp.address->>'coordinates'->>'lng')::float,
                (fp.address->>'coordinates'->>'lat')::float
            ), 4326)::geography,
            radius_km * 1000  -- Convert km to meters
        )
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
