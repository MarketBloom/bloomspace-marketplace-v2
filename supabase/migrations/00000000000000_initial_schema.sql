-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL CHECK (role IN ('customer', 'florist', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create florist_profiles table
CREATE TABLE IF NOT EXISTS florist_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id),
    store_name TEXT NOT NULL,
    store_status TEXT NOT NULL DEFAULT 'draft' CHECK (store_status IN ('draft', 'active', 'inactive')),
    about_text TEXT,
    street_address TEXT NOT NULL,
    suburb TEXT,
    state TEXT,
    postcode TEXT,
    coordinates POINT,
    banner_url TEXT,
    logo_url TEXT,
    delivery_radius NUMERIC,
    delivery_fee NUMERIC DEFAULT 0,
    minimum_order_amount NUMERIC DEFAULT 0,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    delivery_days TEXT[],
    delivery_time_frames JSONB DEFAULT '{}'::jsonb,
    setup_progress INTEGER DEFAULT 0,
    setup_completed_at TIMESTAMP WITH TIME ZONE,
    social_links JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE florist_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Florist profiles policies
CREATE POLICY "Anyone can view active florist profiles"
    ON florist_profiles FOR SELECT
    USING (store_status = 'active');

CREATE POLICY "Florists can view their own profile regardless of status"
    ON florist_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Florists can update their own profile"
    ON florist_profiles FOR UPDATE
    USING (auth.uid() = id);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_florist_profiles_updated_at
    BEFORE UPDATE ON florist_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, role)
    VALUES (NEW.id, 'customer');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE handle_new_user();
