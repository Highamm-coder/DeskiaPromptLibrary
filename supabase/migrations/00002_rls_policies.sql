-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a resource
CREATE OR REPLACE FUNCTION is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN resource_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

-- Allow users to read all profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- Allow system to insert profiles (via trigger on auth.users)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- =============================================
-- CATEGORIES TABLE POLICIES
-- =============================================

-- Allow everyone to read categories
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

-- Allow admins to insert categories
CREATE POLICY "Admins can create categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

-- Allow admins to update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

-- Allow admins to delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- =============================================
-- PROMPTS TABLE POLICIES
-- =============================================

-- Allow users to read public prompts and their own prompts
CREATE POLICY "Users can view public prompts and own prompts"
  ON prompts FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR is_admin()
  );

-- Allow authenticated users to create prompts
CREATE POLICY "Authenticated users can create prompts"
  ON prompts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

-- Allow users to update their own prompts
CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (created_by = auth.uid());

-- Allow admins to update any prompt
CREATE POLICY "Admins can update any prompt"
  ON prompts FOR UPDATE
  USING (is_admin());

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (created_by = auth.uid());

-- Allow admins to delete any prompt
CREATE POLICY "Admins can delete any prompt"
  ON prompts FOR DELETE
  USING (is_admin());

-- =============================================
-- ADDITIONAL SECURITY
-- =============================================

-- Ensure @deksia.com email validation at database level
ALTER TABLE profiles ADD CONSTRAINT check_deksia_email
  CHECK (email LIKE '%@deksia.com');

-- Create a function to validate email on user creation
CREATE OR REPLACE FUNCTION validate_deksia_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@deksia.com' THEN
    RAISE EXCEPTION 'Only @deksia.com email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate email on profile creation
CREATE TRIGGER validate_email_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_deksia_email();

-- Add trigger to validate email on profile update
CREATE TRIGGER validate_email_on_update
  BEFORE UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_deksia_email();
