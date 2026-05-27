-- ============================================
-- LUMINA COMMERCE - SUPABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  image_url TEXT,
  images TEXT[],
  inventory INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(10,2),
  colors TEXT[],
  sizes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ============================================
-- 2. PROFILES TABLE (syncs with auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer', -- 'admin' or 'customer'
  phone TEXT,
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT,
  customer_email TEXT,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  items JSONB, -- Storing cart items as JSON
  shipping_address TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- ============================================
-- 4. STORAGE BUCKET FOR PRODUCT IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Everyone can view, only Admin can modify
CREATE POLICY "Public Read Products" ON products
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin Insert Products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admin Update Products" ON products
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admin Delete Products" ON products
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- PROFILES: Users can read/edit their own profile, Admins can read all
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ORDERS: Users view their own orders, Admins view all
CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin view all orders" ON orders
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Users create order" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- STORAGE: Product images policies
CREATE POLICY "Public Read Product Images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admin Upload Product Images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

CREATE POLICY "Admin Delete Product Images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  );

-- ============================================
-- 6. FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. SEED DATA: Initial Products
-- ============================================
INSERT INTO products (name, description, price, category, image_url, images, inventory, rating, review_count, is_new, is_sale, sale_price, colors, sizes)
VALUES
  (
    'Minimalist Chronograph',
    'A sleek, modern timepiece designed for the urban professional. Features a genuine leather strap, sapphire crystal glass, and a water-resistant casing up to 50 meters.',
    199.00,
    'Accessories',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800',
    ARRAY['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&q=80&w=800'],
    45, 4.8, 124, TRUE, FALSE, NULL,
    ARRAY['#000000', '#8B4513'],
    ARRAY['One Size']
  ),
  (
    'Noise-Cancelling Headphones',
    'Immerse yourself in pure sound with our premium wireless headphones. 30-hour battery life, adaptive noise cancellation, and plush memory foam ear cups.',
    349.00,
    'Electronics',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'],
    20, 4.9, 89, FALSE, TRUE, 299.00,
    ARRAY['#000000', '#CCCCCC'],
    ARRAY['One Size']
  ),
  (
    'Ergonomic Office Chair',
    'Designed for comfort and productivity. Fully adjustable lumbar support, breathable mesh back, and premium castors that glide smoothly on any surface.',
    499.00,
    'Furniture',
    'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
    ARRAY['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?auto=format&fit=crop&q=80&w=800'],
    12, 4.7, 56, FALSE, FALSE, NULL,
    ARRAY['#333333', '#808080'],
    ARRAY['Standard', 'Large']
  ),
  (
    'Ceramic Pour-Over Set',
    'Brew the perfect cup every morning. Handcrafted ceramic dripper with a sustainable bamboo stand. The minimalist design looks beautiful on any counter.',
    85.00,
    'Home',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    NULL,
    60, 4.6, 32, FALSE, FALSE, NULL,
    ARRAY['#FFFFFF', '#000000'],
    ARRAY['One Size']
  ),
  (
    'Leather Weekend Bag',
    'The perfect companion for short trips. Full-grain leather that ages beautifully with time. Features a dedicated shoe compartment and laptop sleeve.',
    245.00,
    'Travel',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    NULL,
    15, 4.9, 210, TRUE, FALSE, NULL,
    ARRAY['#8B4513', '#000000'],
    ARRAY['40L', '60L']
  ),
  (
    'Mechanical Keyboard',
    'Tactile switches and customizable RGB lighting in a compact 60% form factor. Aluminium chassis for durability and a premium typing experience.',
    129.00,
    'Electronics',
    'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800',
    NULL,
    30, 4.5, 45, FALSE, FALSE, NULL,
    ARRAY['#000000', '#FFFFFF', '#FFB6C1'],
    ARRAY['60%', 'TKL', 'Full']
  );

-- ============================================
-- DONE! Your database is ready.
-- ============================================
