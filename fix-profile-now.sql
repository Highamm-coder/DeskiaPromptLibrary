-- Quick fix: Create your profile immediately
-- Run this in Supabase SQL Editor

-- First check what users exist
SELECT
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Create profile for the most recent user
-- (modify the values below if needed)
INSERT INTO profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'User'),
  'admin'  -- Making you admin immediately
FROM auth.users
WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1)
ON CONFLICT (id)
DO UPDATE SET
  role = 'admin',
  updated_at = NOW();

-- Verify the profile was created
SELECT
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;

SELECT 'Profile created/updated successfully! Now refresh your browser.' as message;
