-- ============================================
-- PHASE 2: Agency Features Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SITE SETTINGS TABLE (for Theme & Content CMS)
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site settings (for theme/content)
CREATE POLICY "Public Read Site Settings" ON site_settings
  FOR SELECT USING (TRUE);

-- Only admins can modify site settings
CREATE POLICY "Admin Update Site Settings" ON site_settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Insert Site Settings" ON site_settings
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Delete Site Settings" ON site_settings
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 2. ADD SEO FIELDS TO PRODUCTS TABLE
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS seo_metadata JSONB;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- ============================================
-- 3. SEED DEFAULT THEME & CONTENT
-- ============================================
INSERT INTO site_settings (key, value) VALUES 
(
  'theme',
  '{
    "brandName": "Lumina",
    "logoUrl": "",
    "faviconUrl": "",
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
  }'::jsonb
),
(
  'content',
  '{
    "hero": {
      "headline": "Designed for those who demand more.",
      "subheadline": "Premium essentials crafted with attention to every detail. Elevate your everyday with our curated selection.",
      "ctaText": "Shop Now",
      "ctaLink": "/shop",
      "overlayOpacity": 0.4
    },
    "sections": [
      {
        "id": "featured-products",
        "title": "Featured Products",
        "subtitle": "Our most popular items",
        "type": "products",
        "productIds": [],
        "enabled": true,
        "order": 1
      }
    ],
    "announcement": {
      "enabled": false,
      "message": "Free shipping on orders over $100",
      "backgroundColor": "#4f46e5",
      "textColor": "#ffffff"
    }
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. UPDATE EXISTING PRODUCTS WITH SLUGS
-- ============================================
UPDATE products 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- ============================================
-- DONE! Phase 2 schema is ready.
-- ============================================
