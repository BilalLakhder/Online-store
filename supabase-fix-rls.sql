-- ============================================
-- FIX: RLS Policy Infinite Recursion
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin Insert Products" ON products;
DROP POLICY IF EXISTS "Admin Update Products" ON products;
DROP POLICY IF EXISTS "Admin Delete Products" ON products;
DROP POLICY IF EXISTS "Admin view all orders" ON orders;
DROP POLICY IF EXISTS "Admin update orders" ON orders;

-- ============================================
-- Create a security definer function to check admin role
-- This bypasses RLS and prevents recursion
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
-- PROFILES POLICIES (Fixed)
-- ============================================

-- Users can always view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PRODUCTS POLICIES (Fixed - use is_admin function)
-- ============================================

CREATE POLICY "Admin Insert Products" ON products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admin Update Products" ON products
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admin Delete Products" ON products
  FOR DELETE USING (public.is_admin());

-- ============================================
-- ORDERS POLICIES (Fixed)
-- ============================================

CREATE POLICY "Admin view all orders" ON orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admin update orders" ON orders
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- Now ensure your admin profile exists
-- ============================================

-- Check if profile exists, if not create it
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin' 
FROM auth.users 
WHERE email = 'admin@lumina.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Verify the fix worked
SELECT id, email, role FROM profiles;
