-- Create profile for existing user
-- Replace the ID and EMAIL with your actual values from the auth.users table

-- First, let's see what users exist
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Then create the profile (replace YOUR_USER_ID and YOUR_EMAIL)
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  '0210caa9-3b5b-47bf-97c4-56f0393496d1',  -- Replace with your user ID
  'your-email@deksia.com',                   -- Replace with your email
  'Your Name',                                -- Replace with your name
  'admin'                                     -- Make yourself admin immediately
)
ON CONFLICT (id)
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Verify it was created
SELECT * FROM profiles;
