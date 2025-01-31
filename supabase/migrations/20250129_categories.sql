-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    gradient TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
CREATE POLICY "Everyone can view active categories"
    ON categories FOR SELECT
    USING (is_active = true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
    ON categories FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name, description, image_url, gradient, slug, display_order) VALUES
('Birthday', 'Make their day special', '/images/categories/birthday.jpg', 'from-pink-500 to-rose-500', 'birthday', 1),
('Anniversary', 'Celebrate love', '/images/categories/anniversary.jpg', 'from-rose-500 to-purple-500', 'anniversary', 2),
('Sympathy', 'Show you care', '/images/categories/sympathy.jpg', 'from-gray-500 to-slate-500', 'sympathy', 3),
('Wedding', 'Perfect for the big day', '/images/categories/wedding.jpg', 'from-pink-500 to-orange-500', 'wedding', 4),
('Get Well', 'Brighten their day', '/images/categories/get-well.jpg', 'from-yellow-500 to-orange-500', 'get-well', 5),
('Just Because', 'No reason needed', '/images/categories/just-because.jpg', 'from-purple-500 to-blue-500', 'just-because', 6),
('Congratulations', 'Celebrate achievements', '/images/categories/congratulations.jpg', 'from-green-500 to-teal-500', 'congratulations', 7),
('Thank You', 'Express gratitude', '/images/categories/thank-you.jpg', 'from-blue-500 to-indigo-500', 'thank-you', 8),
('New Baby', 'Welcome new arrivals', '/images/categories/new-baby.jpg', 'from-pink-500 to-purple-500', 'new-baby', 9),
('Love & Romance', 'Show your affection', '/images/categories/love.jpg', 'from-red-500 to-pink-500', 'love', 10);

-- Add categories column to products table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'category_id'
    ) THEN
        ALTER TABLE products
        ADD COLUMN category_id UUID REFERENCES categories(id);
    END IF;
END $$; 