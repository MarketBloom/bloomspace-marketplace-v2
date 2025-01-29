-- Update products table with new columns and constraints
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sale_price numeric,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS occasion text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add check constraints for status and stock_status
ALTER TABLE products
  ADD CONSTRAINT products_status_check 
    CHECK (status IN ('draft', 'published', 'archived')),
  ADD CONSTRAINT products_stock_status_check
    CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock'));

-- Update product_sizes table with new columns
ALTER TABLE product_sizes
  ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

-- Add function to update stock status based on quantity
CREATE OR REPLACE FUNCTION update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity <= 0 THEN
    NEW.stock_status := 'out_of_stock';
  ELSIF NEW.stock_quantity <= NEW.low_stock_threshold THEN
    NEW.stock_status := 'low_stock';
  ELSE
    NEW.stock_status := 'in_stock';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update stock status
DROP TRIGGER IF EXISTS update_stock_status_trigger ON products;
CREATE TRIGGER update_stock_status_trigger
  BEFORE INSERT OR UPDATE OF stock_quantity
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_status();

-- Add function to ensure only one default size per product
CREATE OR REPLACE FUNCTION ensure_single_default_size()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE product_sizes
    SET is_default = false
    WHERE product_id = NEW.product_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for default size management
DROP TRIGGER IF EXISTS ensure_single_default_size_trigger ON product_sizes;
CREATE TRIGGER ensure_single_default_size_trigger
  BEFORE INSERT OR UPDATE OF is_default
  ON product_sizes
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_size();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_florist_id_status ON products(florist_id, status);

-- Add RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = florist_id);

CREATE POLICY "Enable update for product owners only"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = florist_id)
  WITH CHECK (auth.uid() = florist_id);

CREATE POLICY "Enable delete for product owners only"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = florist_id);

-- Add similar RLS policies for product_sizes
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON product_sizes FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for product owners only"
  ON product_sizes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_sizes.product_id
      AND florist_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for product owners only"
  ON product_sizes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_sizes.product_id
      AND florist_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_sizes.product_id
      AND florist_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for product owners only"
  ON product_sizes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE id = product_sizes.product_id
      AND florist_id = auth.uid()
    )
  );
