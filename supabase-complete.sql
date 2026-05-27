-- ============================================
-- COMPLETE DATABASE SETUP - Run this in Supabase SQL Editor
-- This script is idempotent (safe to run multiple times)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SITE SETTINGS TABLE (Theme & Content)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings
DROP POLICY IF EXISTS "Public read site_settings" ON site_settings;
CREATE POLICY "Public read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Only admins can modify
DROP POLICY IF EXISTS "Admin modify site_settings" ON site_settings;
CREATE POLICY "Admin modify site_settings" ON site_settings
  FOR ALL USING (public.is_admin());

-- Insert defaults if not exist
INSERT INTO site_settings (key, value) VALUES 
  ('theme', '{
    "brandName": "Lumina",
    "logoUrl": "",
    "faviconUrl": "",
    "paletteId": "indigo",
    "primaryColor": "#4f46e5",
    "primaryHoverColor": "#4338ca",
    "secondaryColor": "#0f172a",
    "accentColor": "#f59e0b",
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingFontFamily": "Inter, system-ui, sans-serif",
    "borderRadius": "lg",
    "footerText": "© 2024 Lumina. All rights reserved.",
    "socialLinks": {},
    "supportEmail": "support@lumina.com"
  }'::jsonb),
  ('content', '{
    "hero": {
      "headline": "Discover Premium Products",
      "subheadline": "Curated collection of modern essentials for elevated living",
      "ctaText": "Shop Now",
      "ctaLink": "/shop",
      "overlayOpacity": 0.4
    },
    "sections": [],
    "announcement": {
      "enabled": false,
      "message": "Free shipping on orders over $100",
      "backgroundColor": "#4f46e5",
      "textColor": "#ffffff"
    }
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  source TEXT DEFAULT 'website',
  is_active BOOLEAN DEFAULT true
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Only admins can view all subscribers
DROP POLICY IF EXISTS "Admin view subscribers" ON newsletter_subscribers;
CREATE POLICY "Admin view subscribers" ON newsletter_subscribers
  FOR SELECT USING (public.is_admin());

-- ============================================
-- 3. CARTS TABLE (Persistent carts for logged-in users)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  items JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- Enable RLS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own cart
DROP POLICY IF EXISTS "Users manage own cart" ON carts;
CREATE POLICY "Users manage own cart" ON carts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 4. ENSURE ADMIN CAN VIEW ALL PROFILES
-- ============================================
-- Drop and recreate policy to ensure admin can view all customers
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin() OR auth.uid() = id);

-- ============================================
-- 5. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add slug to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'slug') THEN
    ALTER TABLE products ADD COLUMN slug TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
  END IF;
END $$;

-- Add seo_metadata to products if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'seo_metadata') THEN
    ALTER TABLE products ADD COLUMN seo_metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- 6. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for site_settings
DROP TRIGGER IF EXISTS site_settings_updated_at ON site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for carts
DROP TRIGGER IF EXISTS carts_updated_at ON carts;
CREATE TRIGGER carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. VERIFY is_admin FUNCTION EXISTS
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION: Run these to check setup
-- ============================================
-- SELECT * FROM site_settings;
-- SELECT * FROM newsletter_subscribers;
-- SELECT public.is_admin();
