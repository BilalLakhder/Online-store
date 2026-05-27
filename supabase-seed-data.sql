-- ============================================
-- SEED DATA - Run AFTER supabase-complete.sql
-- Populates all tables with realistic mock data
-- ============================================

-- ============================================
-- 1. PRODUCTS (20 products across 4 categories)
-- ============================================
INSERT INTO products (id, name, description, price, category, image_url, images, inventory, rating, review_count, is_new, is_sale, sale_price, colors, sizes, slug) VALUES

-- ELECTRONICS (5 products)
('11111111-1111-1111-1111-111111111111', 
 'Wireless Noise-Canceling Headphones', 
 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for work, travel, and everyday listening.',
 299.00, 'Electronics',
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800'],
 45, 4.8, 234, true, false, NULL,
 ARRAY['#000000', '#FFFFFF', '#333333'], ARRAY['One Size'],
 'wireless-noise-canceling-headphones'),

('22222222-2222-2222-2222-222222222222',
 'Minimalist Smart Watch',
 'Elegant smartwatch with health tracking, notifications, and 7-day battery. Seamlessly blends technology with timeless design.',
 349.00, 'Electronics',
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
 32, 4.6, 189, true, true, 279.00,
 ARRAY['#000000', '#C0C0C0', '#FFD700'], ARRAY['40mm', '44mm'],
 'minimalist-smart-watch'),

('33333333-3333-3333-3333-333333333333',
 'Portable Bluetooth Speaker',
 'Compact waterproof speaker with 360° sound, 12-hour playtime, and rugged design for outdoor adventures.',
 129.00, 'Electronics',
 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800'],
 78, 4.5, 156, false, false, NULL,
 ARRAY['#000000', '#556B2F', '#000080'], ARRAY['One Size'],
 'portable-bluetooth-speaker'),

('44444444-4444-4444-4444-444444444444',
 'Wireless Charging Pad',
 'Fast 15W wireless charger with sleek aluminum design. Compatible with all Qi-enabled devices.',
 49.00, 'Electronics',
 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=800'],
 120, 4.4, 98, false, false, NULL,
 ARRAY['#FFFFFF', '#000000'], ARRAY['One Size'],
 'wireless-charging-pad'),

('55555555-5555-5555-5555-555555555555',
 'Mechanical Keyboard',
 'Premium mechanical keyboard with customizable RGB backlighting, hot-swappable switches, and aluminum frame.',
 179.00, 'Electronics',
 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800'],
 25, 4.7, 145, true, false, NULL,
 ARRAY['#000000', '#FFFFFF'], ARRAY['One Size'],
 'mechanical-keyboard'),

-- FURNITURE (5 products)
('66666666-6666-6666-6666-666666666666',
 'Mid-Century Modern Armchair',
 'Iconic design meets modern comfort. Solid walnut frame with premium upholstery in your choice of colors.',
 599.00, 'Furniture',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?auto=format&fit=crop&q=80&w=800'],
 12, 4.9, 87, false, true, 479.00,
 ARRAY['#333333', '#8B4513', '#556B2F'], ARRAY['One Size'],
 'mid-century-modern-armchair'),

('77777777-7777-7777-7777-777777777777',
 'Minimalist Desk Lamp',
 'Adjustable LED desk lamp with touch dimming, USB charging port, and sleek Scandinavian design.',
 89.00, 'Furniture',
 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'],
 65, 4.6, 112, true, false, NULL,
 ARRAY['#FFFFFF', '#000000', '#FFD700'], ARRAY['One Size'],
 'minimalist-desk-lamp'),

('88888888-8888-8888-8888-888888888888',
 'Floating Wall Shelves Set',
 'Set of 3 solid oak floating shelves. Clean lines and invisible mounting for a modern look.',
 149.00, 'Furniture',
 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=800'],
 40, 4.5, 78, false, false, NULL,
 ARRAY['#8B4513', '#000000', '#FFFFFF'], ARRAY['One Size'],
 'floating-wall-shelves-set'),

('99999999-9999-9999-9999-999999999999',
 'Ergonomic Office Chair',
 'Full mesh ergonomic chair with lumbar support, adjustable armrests, and breathable design for all-day comfort.',
 449.00, 'Furniture',
 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800'],
 18, 4.7, 203, false, true, 379.00,
 ARRAY['#000000', '#808080'], ARRAY['One Size'],
 'ergonomic-office-chair'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
 'Coffee Table with Storage',
 'Modern coffee table with hidden storage compartment. Tempered glass top and solid wood base.',
 329.00, 'Furniture',
 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800'],
 22, 4.4, 56, false, false, NULL,
 ARRAY['#8B4513', '#000000'], ARRAY['One Size'],
 'coffee-table-with-storage'),

-- ACCESSORIES (5 products)
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 'Premium Leather Wallet',
 'Handcrafted full-grain leather bifold wallet with RFID blocking. Ages beautifully over time.',
 79.00, 'Accessories',
 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
 85, 4.8, 167, false, false, NULL,
 ARRAY['#8B4513', '#000000', '#333333'], ARRAY['One Size'],
 'premium-leather-wallet'),

('cccccccc-cccc-cccc-cccc-cccccccccccc',
 'Canvas Tote Bag',
 'Durable organic cotton canvas tote with leather handles. Perfect for daily errands or weekend trips.',
 65.00, 'Accessories',
 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
 92, 4.5, 89, true, false, NULL,
 ARRAY['#F5F5DC', '#000000', '#556B2F'], ARRAY['One Size'],
 'canvas-tote-bag'),

('dddddddd-dddd-dddd-dddd-dddddddddddd',
 'Polarized Sunglasses',
 'Classic aviator style with polarized lenses and lightweight titanium frame. UV400 protection.',
 159.00, 'Accessories',
 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'],
 55, 4.6, 134, false, true, 119.00,
 ARRAY['#FFD700', '#C0C0C0', '#000000'], ARRAY['One Size'],
 'polarized-sunglasses'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
 'Minimalist Card Holder',
 'Slim aluminum card holder with quick-access mechanism. Holds up to 6 cards securely.',
 35.00, 'Accessories',
 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800'],
 150, 4.4, 78, true, false, NULL,
 ARRAY['#000000', '#C0C0C0', '#FFD700'], ARRAY['One Size'],
 'minimalist-card-holder'),

('ffffffff-ffff-ffff-ffff-ffffffffffff',
 'Leather Belt',
 'Full-grain Italian leather belt with brushed metal buckle. Timeless design for any occasion.',
 89.00, 'Accessories',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'],
 70, 4.7, 92, false, false, NULL,
 ARRAY['#8B4513', '#000000'], ARRAY['S', 'M', 'L', 'XL'],
 'leather-belt'),

-- LIFESTYLE (5 products)
('11111111-aaaa-aaaa-aaaa-111111111111',
 'Ceramic Pour-Over Set',
 'Japanese-inspired pour-over coffee set with ceramic dripper, carafe, and 40 paper filters.',
 85.00, 'Lifestyle',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'],
 48, 4.8, 145, true, false, NULL,
 ARRAY['#FFFFFF', '#000000', '#8B4513'], ARRAY['One Size'],
 'ceramic-pour-over-set'),

('22222222-bbbb-bbbb-bbbb-222222222222',
 'Linen Throw Blanket',
 'Luxuriously soft stonewashed linen throw. Perfect for cozy nights or as a stylish accent.',
 129.00, 'Lifestyle',
 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=800'],
 35, 4.6, 67, false, false, NULL,
 ARRAY['#F5F5DC', '#D3D3D3', '#556B2F'], ARRAY['One Size'],
 'linen-throw-blanket'),

('33333333-cccc-cccc-cccc-333333333333',
 'Aromatherapy Diffuser',
 'Ultrasonic essential oil diffuser with ambient LED lighting and whisper-quiet operation.',
 69.00, 'Lifestyle',
 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800'],
 60, 4.5, 98, false, true, 49.00,
 ARRAY['#FFFFFF', '#8B4513'], ARRAY['One Size'],
 'aromatherapy-diffuser'),

('44444444-dddd-dddd-dddd-444444444444',
 'Leather Journal',
 'Hand-bound leather journal with 200 pages of premium cotton paper. A timeless companion for thoughts.',
 55.00, 'Lifestyle',
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'],
 88, 4.9, 156, true, false, NULL,
 ARRAY['#8B4513', '#333333', '#F5DEB3'], ARRAY['One Size'],
 'leather-journal'),

('55555555-eeee-eeee-eeee-555555555555',
 'Stainless Steel Water Bottle',
 'Double-wall vacuum insulated bottle. Keeps drinks cold 24hrs or hot 12hrs. BPA-free.',
 39.00, 'Lifestyle',
 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800',
 ARRAY['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800'],
 200, 4.7, 234, false, false, NULL,
 ARRAY['#000000', '#FFFFFF', '#000080', '#556B2F'], ARRAY['500ml', '750ml', '1L'],
 'stainless-steel-water-bottle')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  images = EXCLUDED.images,
  inventory = EXCLUDED.inventory,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  is_new = EXCLUDED.is_new,
  is_sale = EXCLUDED.is_sale,
  sale_price = EXCLUDED.sale_price,
  colors = EXCLUDED.colors,
  sizes = EXCLUDED.sizes,
  slug = EXCLUDED.slug;

-- ============================================
-- 2. SAMPLE ORDERS (8 orders with varying statuses)
-- ============================================

-- Note: These orders use NULL user_id (guest orders) since we don't have auth users yet
-- Once you have real users, you can update user_id to reference them

INSERT INTO orders (id, user_id, customer_name, customer_email, items, total, status, shipping_address, created_at) VALUES

('a0000001-0001-0001-0001-000000000001', NULL,
 'John Smith', 'john.smith@email.com',
 '[{"id": "11111111-1111-1111-1111-111111111111", "name": "Wireless Noise-Canceling Headphones", "price": 299, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"}, {"id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "name": "Premium Leather Wallet", "price": 79, "quantity": 2, "imageUrl": "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800"}]'::jsonb,
 457.00, 'delivered',
 '123 Main Street, New York, NY 10001',
 NOW() - INTERVAL '15 days'),

('a0000002-0002-0002-0002-000000000002', NULL,
 'Sarah Johnson', 'sarah.j@email.com',
 '[{"id": "66666666-6666-6666-6666-666666666666", "name": "Mid-Century Modern Armchair", "price": 479, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", "isSale": true, "salePrice": 479}]'::jsonb,
 479.00, 'shipped',
 '456 Oak Avenue, Los Angeles, CA 90001',
 NOW() - INTERVAL '5 days'),

('a0000003-0003-0003-0003-000000000003', NULL,
 'Michael Chen', 'mchen@email.com',
 '[{"id": "22222222-2222-2222-2222-222222222222", "name": "Minimalist Smart Watch", "price": 279, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", "isSale": true, "salePrice": 279}, {"id": "11111111-aaaa-aaaa-aaaa-111111111111", "name": "Ceramic Pour-Over Set", "price": 85, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800"}]'::jsonb,
 364.00, 'processing',
 '789 Pine Road, Chicago, IL 60601',
 NOW() - INTERVAL '2 days'),

('a0000004-0004-0004-0004-000000000004', NULL,
 'Emily Davis', 'emily.d@email.com',
 '[{"id": "cccccccc-cccc-cccc-cccc-cccccccccccc", "name": "Canvas Tote Bag", "price": 65, "quantity": 2, "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"}, {"id": "44444444-dddd-dddd-dddd-444444444444", "name": "Leather Journal", "price": 55, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800"}]'::jsonb,
 185.00, 'pending',
 '321 Elm Street, Austin, TX 78701',
 NOW() - INTERVAL '1 day'),

('a0000005-0005-0005-0005-000000000005', NULL,
 'Robert Wilson', 'rwilson@email.com',
 '[{"id": "55555555-5555-5555-5555-555555555555", "name": "Mechanical Keyboard", "price": 179, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800"}, {"id": "77777777-7777-7777-7777-777777777777", "name": "Minimalist Desk Lamp", "price": 89, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"}, {"id": "44444444-4444-4444-4444-444444444444", "name": "Wireless Charging Pad", "price": 49, "quantity": 2, "imageUrl": "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?auto=format&fit=crop&q=80&w=800"}]'::jsonb,
 366.00, 'delivered',
 '555 Maple Drive, Seattle, WA 98101',
 NOW() - INTERVAL '20 days'),

('a0000006-0006-0006-0006-000000000006', NULL,
 'Jessica Brown', 'jbrown@email.com',
 '[{"id": "99999999-9999-9999-9999-999999999999", "name": "Ergonomic Office Chair", "price": 379, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800", "isSale": true, "salePrice": 379}]'::jsonb,
 379.00, 'shipped',
 '777 Cedar Lane, Miami, FL 33101',
 NOW() - INTERVAL '4 days'),

('a0000007-0007-0007-0007-000000000007', NULL,
 'David Martinez', 'dmartinez@email.com',
 '[{"id": "55555555-eeee-eeee-eeee-555555555555", "name": "Stainless Steel Water Bottle", "price": 39, "quantity": 3, "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=800"}, {"id": "dddddddd-dddd-dddd-dddd-dddddddddddd", "name": "Polarized Sunglasses", "price": 119, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800", "isSale": true, "salePrice": 119}]'::jsonb,
 236.00, 'processing',
 '999 Birch Road, Denver, CO 80201',
 NOW() - INTERVAL '1 day'),

('a0000008-0008-0008-0008-000000000008', NULL,
 'Amanda Taylor', 'ataylor@email.com',
 '[{"id": "22222222-bbbb-bbbb-bbbb-222222222222", "name": "Linen Throw Blanket", "price": 129, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=800"}, {"id": "33333333-cccc-cccc-cccc-333333333333", "name": "Aromatherapy Diffuser", "price": 49, "quantity": 1, "imageUrl": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800", "isSale": true, "salePrice": 49}]'::jsonb,
 178.00, 'pending',
 '111 Walnut Street, Boston, MA 02101',
 NOW())

ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  customer_email = EXCLUDED.customer_email,
  items = EXCLUDED.items,
  total = EXCLUDED.total,
  status = EXCLUDED.status,
  shipping_address = EXCLUDED.shipping_address;

-- ============================================
-- 3. NEWSLETTER SUBSCRIBERS (10 subscribers)
-- ============================================
INSERT INTO newsletter_subscribers (email, source, subscribed_at, is_active) VALUES
('newsletter.fan1@email.com', 'website', NOW() - INTERVAL '30 days', true),
('promo.lover@email.com', 'website', NOW() - INTERVAL '25 days', true),
('deals.hunter@email.com', 'website', NOW() - INTERVAL '20 days', true),
('style.seeker@email.com', 'checkout', NOW() - INTERVAL '15 days', true),
('home.decor@email.com', 'website', NOW() - INTERVAL '12 days', true),
('tech.enthusiast@email.com', 'website', NOW() - INTERVAL '10 days', true),
('minimalist.life@email.com', 'footer', NOW() - INTERVAL '7 days', true),
('quality.first@email.com', 'website', NOW() - INTERVAL '5 days', true),
('modern.living@email.com', 'popup', NOW() - INTERVAL '3 days', true),
('curious.shopper@email.com', 'website', NOW() - INTERVAL '1 day', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. UPDATE SITE SETTINGS with better defaults
-- ============================================
UPDATE site_settings SET value = '{
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
  "footerText": "© 2024 Lumina. Premium goods for modern living.",
  "socialLinks": {
    "instagram": "https://instagram.com/lumina",
    "twitter": "https://twitter.com/lumina"
  },
  "supportEmail": "hello@lumina.store"
}'::jsonb
WHERE key = 'theme';

UPDATE site_settings SET value = '{
  "hero": {
    "headline": "Elevate Your Everyday",
    "subheadline": "Discover our curated collection of premium products designed for modern living",
    "ctaText": "Shop Collection",
    "ctaLink": "/shop",
    "backgroundImage": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2000",
    "overlayOpacity": 0.4
  },
  "sections": [
    {
      "id": "featured-products",
      "title": "Featured Products",
      "subtitle": "Handpicked favorites from our collection",
      "type": "products",
      "productIds": ["11111111-1111-1111-1111-111111111111", "66666666-6666-6666-6666-666666666666", "11111111-aaaa-aaaa-aaaa-111111111111", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"],
      "enabled": true,
      "order": 1
    },
    {
      "id": "new-arrivals",
      "title": "New Arrivals",
      "subtitle": "Fresh additions to our collection",
      "type": "products",
      "productIds": ["22222222-2222-2222-2222-222222222222", "55555555-5555-5555-5555-555555555555", "cccccccc-cccc-cccc-cccc-cccccccccccc", "44444444-dddd-dddd-dddd-444444444444"],
      "enabled": true,
      "order": 2
    }
  ],
  "announcement": {
    "enabled": true,
    "message": "✨ Free shipping on orders over $50 + Easy 30-day returns",
    "link": "/shop",
    "backgroundColor": "#4f46e5",
    "textColor": "#ffffff"
  }
}'::jsonb
WHERE key = 'content';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- SELECT COUNT(*) as product_count FROM products;
-- SELECT COUNT(*) as order_count FROM orders;
-- SELECT COUNT(*) as subscriber_count FROM newsletter_subscribers;
-- SELECT * FROM site_settings;

-- Summary output
DO $$
DECLARE
  product_count INTEGER;
  order_count INTEGER;
  subscriber_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO product_count FROM products;
  SELECT COUNT(*) INTO order_count FROM orders;
  SELECT COUNT(*) INTO subscriber_count FROM newsletter_subscribers;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA INSERTED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Products: %', product_count;
  RAISE NOTICE 'Orders: %', order_count;
  RAISE NOTICE 'Newsletter Subscribers: %', subscriber_count;
  RAISE NOTICE '========================================';
END $$;
