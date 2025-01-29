-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES auth.users(id),
    florist_id UUID NOT NULL REFERENCES florist_profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    delivery_address JSONB NOT NULL,
    delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    delivery_time_slot TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10,2) NOT NULL CHECK (price_at_time >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_florist_id ON orders(florist_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add RLS policies for orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
CREATE POLICY "Customers can view their own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());

-- Florists can view orders for their business
CREATE POLICY "Florists can view their business orders"
    ON orders FOR SELECT
    TO authenticated
    USING (florist_id IN (
        SELECT id FROM florist_profiles WHERE owner_id = auth.uid()
    ));

-- Only the system can insert orders (via function)
CREATE POLICY "System can insert orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Only florists can update their business orders
CREATE POLICY "Florists can update their business orders"
    ON orders FOR UPDATE
    TO authenticated
    USING (florist_id IN (
        SELECT id FROM florist_profiles WHERE owner_id = auth.uid()
    ))
    WITH CHECK (
        florist_id IN (
            SELECT id FROM florist_profiles WHERE owner_id = auth.uid()
        )
        AND (
            NEW.status IN ('confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')
            AND OLD.status != 'delivered'
            AND OLD.status != 'cancelled'
        )
    );

-- Add RLS policies for order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view their own order items
CREATE POLICY "Customers can view their own order items"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM orders WHERE customer_id = auth.uid()
        )
    );

-- Florists can view order items for their business
CREATE POLICY "Florists can view their business order items"
    ON order_items FOR SELECT
    TO authenticated
    USING (
        order_id IN (
            SELECT id FROM orders WHERE florist_id IN (
                SELECT id FROM florist_profiles WHERE owner_id = auth.uid()
            )
        )
    );

-- Only the system can insert order items (via function)
CREATE POLICY "System can insert order items"
    ON order_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
