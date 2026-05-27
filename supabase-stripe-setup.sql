-- =====================================================
-- STRIPE INTEGRATION SQL SETUP
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add payment tracking columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_intent_id text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipping_address text;

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent 
ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;

-- Function to decrement product inventory (called by webhook)
CREATE OR REPLACE FUNCTION decrement_inventory(product_id uuid, quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products 
  SET inventory = GREATEST(0, inventory - quantity)
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon (for edge functions)
GRANT EXECUTE ON FUNCTION decrement_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_inventory TO anon;

-- =====================================================
-- EDGE FUNCTION SECRETS SETUP
-- =====================================================
-- You need to add these secrets in Supabase Dashboard:
-- Project Settings → Edge Functions → Secrets
--
-- STRIPE_SECRET_KEY: sk_test_... (from Stripe dashboard)
-- STRIPE_WEBHOOK_SECRET: whsec_... (from Stripe webhooks)
-- =====================================================

-- =====================================================
-- STRIPE WEBHOOK ENDPOINT SETUP
-- =====================================================
-- 1. Go to Stripe Dashboard → Developers → Webhooks
-- 2. Add endpoint: https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
-- 3. Select events:
--    - payment_intent.succeeded
--    - payment_intent.payment_failed
--    - charge.refunded
-- 4. Copy the signing secret (whsec_...) to Supabase secrets
-- =====================================================
