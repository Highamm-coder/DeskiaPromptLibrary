# Quick Start Guide

Your Deksia Prompt Library is ready to use! Follow these steps:

## Step 1: Set Up the Database

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/kghndcfajqmmuyameuka

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Setup SQL**
   - Open the file `setup-database.sql` in this project
   - Copy ALL the content
   - Paste into the Supabase SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for it to complete (should take 2-3 seconds)
   - You should see "Database setup completed successfully!"

## Step 2: Create Your First User

1. **Open the app**
   - The app is already running at: http://localhost:5174/
   - Click "Sign up"

2. **Register**
   - Use your @deksia.com email address
   - Choose a strong password
   - Fill in your full name
   - Click "Create Account"

3. **Check your email**
   - Look for the confirmation email from Supabase
   - Click the confirmation link
   - You'll be redirected back to the app

## Step 3: Make Yourself an Admin

1. **Get your User ID**
   - Go to Supabase Dashboard > Authentication > Users
   - Find your user and copy the UUID

2. **Run this SQL** (replace YOUR_USER_ID with the UUID you copied):
   ```sql
   UPDATE profiles
   SET role = 'admin'
   WHERE id = 'YOUR_USER_ID';
   ```

3. **Log out and log back in** to see admin features

## Step 4: Create Categories (Optional)

You can create categories through the Admin Panel in the app, or run this SQL:

```sql
-- Replace YOUR_USER_ID with your actual user ID
INSERT INTO categories (name, description, color, created_by) VALUES
  ('General', 'General purpose prompts', '#FF6B35', 'YOUR_USER_ID'),
  ('Code Review', 'Code review and analysis prompts', '#3B82F6', 'YOUR_USER_ID'),
  ('Documentation', 'Documentation writing prompts', '#10B981', 'YOUR_USER_ID'),
  ('Testing', 'Test generation and QA prompts', '#8B5CF6', 'YOUR_USER_ID'),
  ('Debugging', 'Debugging assistance prompts', '#EF4444', 'YOUR_USER_ID');
```

## You're Done!

Start creating and sharing prompts with your team!

### Key Features:

- **Create Prompts**: Click "New Prompt" in the header
- **Search**: Use the search bar to find prompts instantly
- **Filter**: Click categories or tags in the sidebar
- **Copy**: Click the copy icon on any prompt card
- **Admin Panel**: Access via user menu (admins only)

### Troubleshooting:

- **Can't register?** Make sure you're using a @deksia.com email
- **Tables not created?** Make sure you ran the entire `setup-database.sql` file
- **Not seeing admin features?** Make sure you updated your role to 'admin' and logged back in

### Project Structure:

```
/src
  /components     # All React components
  /hooks          # Custom hooks (authentication)
  /lib            # Supabase client and utilities
  /pages          # Main page components
  /types          # TypeScript type definitions
  /styles         # Global CSS and Tailwind config

/supabase
  /migrations     # Individual SQL migration files
  setup-database.sql  # Combined setup file (use this!)
```

### Need Help?

Check the main README.md for detailed documentation or SETUP.md for comprehensive setup instructions.
