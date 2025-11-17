-- =============================================
-- DEKSIA PROMPT LIBRARY - COMPLETE DATABASE SETUP
-- Run this entire file in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#FF6B35',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);

-- =============================================
-- PROMPTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  prompt_content TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prompts_title ON prompts(title);
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON prompts(is_public);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_usage_count ON prompts(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_search ON prompts USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || prompt_content)
);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_usage_count(prompt_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE prompts
  SET usage_count = usage_count + 1
  WHERE id = prompt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS validate_email_on_insert ON profiles;
DROP TRIGGER IF EXISTS validate_email_on_update ON profiles;

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Admins can create categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

DROP POLICY IF EXISTS "Users can view public prompts and own prompts" ON prompts;
DROP POLICY IF EXISTS "Authenticated users can create prompts" ON prompts;
DROP POLICY IF EXISTS "Users can update own prompts" ON prompts;
DROP POLICY IF EXISTS "Admins can update any prompt" ON prompts;
DROP POLICY IF EXISTS "Users can delete own prompts" ON prompts;
DROP POLICY IF EXISTS "Admins can delete any prompt" ON prompts;

-- Helper Functions for RLS
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

CREATE OR REPLACE FUNCTION is_owner(resource_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN resource_user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- PROFILES TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- =============================================
-- CATEGORIES TABLE POLICIES
-- =============================================

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can create categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- =============================================
-- PROMPTS TABLE POLICIES
-- =============================================

CREATE POLICY "Users can view public prompts and own prompts"
  ON prompts FOR SELECT
  USING (
    is_public = true
    OR created_by = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Authenticated users can create prompts"
  ON prompts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can update any prompt"
  ON prompts FOR UPDATE
  USING (is_admin());

CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (created_by = auth.uid());

CREATE POLICY "Admins can delete any prompt"
  ON prompts FOR DELETE
  USING (is_admin());

-- =============================================
-- EMAIL VALIDATION
-- =============================================

-- Ensure @deksia.com email validation
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_deksia_email;
ALTER TABLE profiles ADD CONSTRAINT check_deksia_email
  CHECK (email LIKE '%@deksia.com');

-- Email validation function
CREATE OR REPLACE FUNCTION validate_deksia_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email NOT LIKE '%@deksia.com' THEN
    RAISE EXCEPTION 'Only @deksia.com email addresses are allowed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Email validation triggers
CREATE TRIGGER validate_email_on_insert
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_deksia_email();

CREATE TRIGGER validate_email_on_update
  BEFORE UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_deksia_email();

-- =============================================
-- DONE!
-- =============================================

SELECT 'Database setup completed successfully!' as message;

-- View all tables
SELECT
    'Tables created:' as info,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'categories', 'prompts');
