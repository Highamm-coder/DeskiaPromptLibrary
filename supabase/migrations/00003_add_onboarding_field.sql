-- Add onboarding_completed field to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update existing users to have onboarding_completed as false
UPDATE profiles
SET onboarding_completed = false
WHERE onboarding_completed IS NULL;

-- Add comment
COMMENT ON COLUMN profiles.onboarding_completed IS 'Tracks whether user has completed the onboarding tutorial';
