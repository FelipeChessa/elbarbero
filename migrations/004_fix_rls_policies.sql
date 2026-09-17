-- Migration: Fix RLS policies to use auth.uid() instead of auth.role()
-- This fixes the authentication issue

-- Drop old policies first
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can manage profile" ON profile;
DROP POLICY IF EXISTS "Authenticated users can manage messages" ON messages;
DROP POLICY IF EXISTS "Service role can manage messages" ON messages;

-- Create new policies using auth.uid() for authenticated users
CREATE POLICY "Authenticated users can manage properties"
ON properties FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage profile"
ON profile FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage messages"
ON messages FOR ALL
USING (auth.uid() IS NOT NULL);

-- Allow service role full access (for server-side operations)
CREATE POLICY "Service role full access on properties"
ON properties FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access on profile"
ON profile FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role full access on messages"
ON messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure anon key has basic read access for profile (needed for public site)
CREATE POLICY "Anon can view profile"
ON profile FOR SELECT
TO anon
USING (true);
