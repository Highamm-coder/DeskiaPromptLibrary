-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_role enum type
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_role CHECK (role IN ('admin', 'user'))
);

-- Create index on email for faster lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#FF6B35',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index on name for faster lookups
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_created_by ON categories(created_by);

-- =============================================
-- PROMPTS TABLE
-- =============================================
CREATE TABLE prompts (
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

-- Create indexes for better query performance
CREATE INDEX idx_prompts_title ON prompts(title);
CREATE INDEX idx_prompts_category_id ON prompts(category_id);
CREATE INDEX idx_prompts_created_by ON prompts(created_by);
CREATE INDEX idx_prompts_is_public ON prompts(is_public);
CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX idx_prompts_usage_count ON prompts(usage_count DESC);

-- Full text search index
CREATE INDEX idx_prompts_search ON prompts USING GIN(
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

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update updated_at on prompts
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- SEED DATA (Optional - Create default categories)
-- =============================================

-- Note: You'll need to replace 'YOUR_ADMIN_USER_ID' with an actual admin user ID
-- after creating the first admin user through Supabase Auth

-- Insert default categories (uncomment and update after creating admin user)
-- INSERT INTO categories (name, description, color, created_by) VALUES
--   ('General', 'General purpose prompts', '#FF6B35', 'YOUR_ADMIN_USER_ID'),
--   ('Code Review', 'Prompts for code review and analysis', '#3B82F6', 'YOUR_ADMIN_USER_ID'),
--   ('Documentation', 'Prompts for writing documentation', '#10B981', 'YOUR_ADMIN_USER_ID'),
--   ('Testing', 'Prompts for test generation and QA', '#8B5CF6', 'YOUR_ADMIN_USER_ID'),
--   ('Debugging', 'Prompts for debugging assistance', '#EF4444', 'YOUR_ADMIN_USER_ID');
