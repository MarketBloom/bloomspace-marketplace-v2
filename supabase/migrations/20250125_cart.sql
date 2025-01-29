-- Create cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    size_id UUID REFERENCES product_sizes(id) ON DELETE SET NULL,
    customizations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, product_id, size_id)
);

-- Add RLS policies for cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only view their own cart items
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Create function to merge cart items when user signs in
CREATE OR REPLACE FUNCTION merge_anonymous_cart()
RETURNS TRIGGER AS $$
BEGIN
    -- If there are items in the anonymous cart (stored in local storage),
    -- they will be merged with the user's cart through the client-side code
    -- using the cart store's addItem function, which handles duplicates
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to merge cart items on user sign in
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION merge_anonymous_cart();
