-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'preparing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'ready_for_pickup',
  'picked_up',
  'cancelled',
  'refunded'
);

CREATE TYPE store_status AS ENUM (
  'pending',
  'active',
  'paused',
  'inactive'
);

CREATE TYPE delivery_type AS ENUM (
  'delivery',
  'pickup',
  'both'
);

-- Create or update florist_profiles table
CREATE TABLE IF NOT EXISTS florist_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name VARCHAR(100) NOT NULL,
    store_status store_status DEFAULT 'pending',
    about_text TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    website_url VARCHAR(255),
    address JSONB NOT NULL DEFAULT '{}',
    business_settings JSONB NOT NULL DEFAULT '{
        "delivery": {
            "radius_km": 10,
            "fee": 10,
            "minimum_order": 50,
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
    }',
    delivery_zones geometry(POLYGON, 4326)[],
    setup_progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (contact_phone ~ '^\+?[0-9]{10,15}$'),
    CONSTRAINT valid_url CHECK (website_url IS NULL OR website_url ~* '^https?://.*$')
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    florist_id UUID REFERENCES florist_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    sale_price DECIMAL(10,2) CHECK (sale_price >= 0 AND sale_price <= price),
    status VARCHAR(20) DEFAULT 'active',
    stock_status VARCHAR(20) DEFAULT 'in_stock',
    images JSONB DEFAULT '[]',
    categories JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create product_sizes table
CREATE TABLE IF NOT EXISTS product_sizes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    price_adjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    florist_id UUID REFERENCES florist_profiles(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    delivery_type delivery_type NOT NULL,
    delivery_address JSONB,
    delivery_instructions TEXT,
    delivery_date DATE,
    delivery_time_slot VARCHAR(50),
    customer_notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_delivery_address CHECK (
        delivery_type = 'pickup' OR 
        (delivery_address IS NOT NULL AND delivery_address ? 'street_address' AND delivery_address ? 'suburb')
    )
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_size_id UUID REFERENCES product_sizes(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL CHECK (price_at_time >= 0),
    customizations JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order_status_history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status order_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    florist_id UUID REFERENCES florist_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_items_sold INTEGER DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    delivery_orders INTEGER DEFAULT 0,
    pickup_orders INTEGER DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    popular_products JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(florist_id, date)
);

-- Add RLS policies
ALTER TABLE florist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- Florist profiles policies
CREATE POLICY "Florists can view their own profile"
    ON florist_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Florists can update their own profile"
    ON florist_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (status = 'active');

CREATE POLICY "Florists can manage their own products"
    ON products FOR ALL
    USING (auth.uid() IN (
        SELECT user_id FROM florist_profiles WHERE id = florist_id
    ));

-- Orders policies
CREATE POLICY "Florists can view their own orders"
    ON orders FOR SELECT
    USING (florist_id IN (
        SELECT id FROM florist_profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Florists can update their own orders"
    ON orders FOR UPDATE
    USING (florist_id IN (
        SELECT id FROM florist_profiles WHERE user_id = auth.uid()
    ))
    WITH CHECK (florist_id IN (
        SELECT id FROM florist_profiles WHERE user_id = auth.uid()
    ));

-- Analytics policies
CREATE POLICY "Florists can view their own analytics"
    ON analytics_daily FOR SELECT
    USING (florist_id IN (
        SELECT id FROM florist_profiles WHERE user_id = auth.uid()
    ));

-- Create functions
CREATE OR REPLACE FUNCTION calculate_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert daily analytics
    INSERT INTO analytics_daily (
        florist_id,
        date,
        total_orders,
        total_revenue,
        total_items_sold,
        average_order_value,
        delivery_orders,
        pickup_orders,
        cancelled_orders,
        popular_products
    )
    SELECT
        o.florist_id,
        DATE(o.created_at),
        COUNT(DISTINCT o.id),
        SUM(o.total),
        SUM(oi.quantity),
        AVG(o.total),
        COUNT(DISTINCT CASE WHEN o.delivery_type = 'delivery' THEN o.id END),
        COUNT(DISTINCT CASE WHEN o.delivery_type = 'pickup' THEN o.id END),
        COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN o.id END),
        (
            SELECT json_agg(p)
            FROM (
                SELECT 
                    p.id,
                    p.name,
                    SUM(oi.quantity) as quantity_sold
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = o.id
                GROUP BY p.id, p.name
                ORDER BY quantity_sold DESC
                LIMIT 5
            ) p
        )
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE o.florist_id = NEW.florist_id
    AND DATE(o.created_at) = DATE(NEW.created_at)
    GROUP BY o.florist_id, DATE(o.created_at)
    ON CONFLICT (florist_id, date) DO UPDATE
    SET
        total_orders = EXCLUDED.total_orders,
        total_revenue = EXCLUDED.total_revenue,
        total_items_sold = EXCLUDED.total_items_sold,
        average_order_value = EXCLUDED.average_order_value,
        delivery_orders = EXCLUDED.delivery_orders,
        pickup_orders = EXCLUDED.pickup_orders,
        cancelled_orders = EXCLUDED.cancelled_orders,
        popular_products = EXCLUDED.popular_products,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER orders_analytics_trigger
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_daily_analytics();

-- Create indexes
CREATE INDEX idx_products_florist_id ON products(florist_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_florist_id ON orders(florist_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_analytics_daily_florist_date ON analytics_daily(florist_id, date);
