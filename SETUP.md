# Deksia Prompt Library - Setup Guide

This guide will walk you through setting up the Deksia Prompt Library from scratch.

## Step 1: Supabase Project Setup

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "deksia-prompt-library"
   - Generate a strong database password
   - Select a region close to your users
   - Click "Create new project"

2. **Wait for project provisioning** (takes 1-2 minutes)

## Step 2: Database Configuration

1. **Run Schema Migration**
   - Navigate to SQL Editor in Supabase dashboard
   - Copy entire contents of `supabase/migrations/00001_initial_schema.sql`
   - Paste into SQL Editor
   - Click "Run" or press Cmd/Ctrl + Enter
   - Verify all tables were created (profiles, categories, prompts)

2. **Apply RLS Policies**
   - Still in SQL Editor, click "New query"
   - Copy entire contents of `supabase/migrations/00002_rls_policies.sql`
   - Paste and run
   - Verify policies were applied

3. **Verify Setup**
   - Go to "Table Editor" in Supabase
   - You should see three tables: profiles, categories, prompts
   - Click on each table to verify structure

## Step 3: Get API Credentials

1. **Find your Project URL and Keys**
   - Go to Settings > API in Supabase dashboard
   - Copy "Project URL"
   - Copy "anon/public" key (this is safe for client-side use)

## Step 4: Configure Application

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Add Credentials**
   Edit `.env` file:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Start Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:5173](http://localhost:5173)

## Step 7: Create Your First User

1. **Register an Account**
   - Click "Sign up" on the login page
   - Enter your @deksia.com email
   - Choose a strong password (min 8 characters)
   - Click "Create Account"
   - Check your email for confirmation link

2. **Confirm Your Email**
   - Click the confirmation link in your email
   - You'll be redirected back to the app

## Step 8: Set Up Admin User

1. **Get Your User ID**
   - Go to Supabase dashboard > Authentication > Users
   - Find your user in the list
   - Copy the UUID (e.g., `a1b2c3d4-...`)

2. **Promote to Admin**
   - Go to SQL Editor
   - Run this query (replace `YOUR_USER_ID`):
     ```sql
     UPDATE profiles
     SET role = 'admin'
     WHERE id = 'YOUR_USER_ID';
     ```
   - Click "Run"

3. **Verify Admin Access**
   - Log out and log back in
   - You should now see "Admin Panel" in the user menu
   - Click it to access admin features

## Step 9: Create Categories (Optional)

You can create categories through the Admin Panel UI, or use SQL:

```sql
-- Replace YOUR_ADMIN_USER_ID with your user ID
INSERT INTO categories (name, description, color, created_by) VALUES
  ('General', 'General purpose prompts', '#FF6B35', 'YOUR_ADMIN_USER_ID'),
  ('Code Review', 'Prompts for code review', '#3B82F6', 'YOUR_ADMIN_USER_ID'),
  ('Documentation', 'Prompts for writing docs', '#10B981', 'YOUR_ADMIN_USER_ID'),
  ('Testing', 'Prompts for test generation', '#8B5CF6', 'YOUR_ADMIN_USER_ID'),
  ('Debugging', 'Prompts for debugging', '#EF4444', 'YOUR_ADMIN_USER_ID');
```

## Step 10: Test the Application

1. **Create a Prompt**
   - Click "New Prompt" in the header
   - Fill in the form
   - Click "Create Prompt"

2. **Test Search**
   - Type in the search bar
   - Results should filter in real-time

3. **Test Categories**
   - Click different categories in sidebar
   - Prompts should filter accordingly

4. **Test Admin Features** (if admin)
   - Go to Admin Panel
   - Try creating/editing categories
   - Try changing user roles

## Troubleshooting

### Issue: "Missing Supabase environment variables"
**Solution**:
- Make sure `.env` file exists in project root
- Verify variables are named correctly (start with `VITE_`)
- Restart dev server after creating `.env`

### Issue: Can't register with non-@deksia.com email
**Solution**:
- This is by design
- Use a @deksia.com email address
- Or temporarily modify validation in `src/lib/utils.ts` for testing

### Issue: "Email confirmation required"
**Solution**:
- Check your spam folder
- In Supabase dashboard, go to Authentication > Settings
- Under "Email Auth", disable "Confirm email" for testing
- Don't forget to re-enable for production!

### Issue: RLS policy errors
**Solution**:
- Verify both migration files were run successfully
- Check Supabase logs: Database > Logs
- Ensure user is authenticated before accessing data

### Issue: Prompts not showing
**Solution**:
- Check browser console for errors
- Verify Supabase connection
- Ensure RLS policies allow reading prompts
- Try creating a public prompt first

## Production Deployment Checklist

Before deploying to production:

- [ ] Enable email confirmation in Supabase
- [ ] Configure custom email templates
- [ ] Set up proper error logging
- [ ] Add rate limiting
- [ ] Review RLS policies
- [ ] Update CORS settings if needed
- [ ] Set up database backups
- [ ] Configure monitoring/alerts
- [ ] Test all user roles and permissions
- [ ] Review security best practices

## Next Steps

1. Invite team members to register
2. Create useful prompt categories
3. Start building your prompt library
4. Customize colors and branding if needed
5. Set up automated backups
6. Monitor usage and performance

## Need Help?

- Check the main README.md for detailed documentation
- Review Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Contact Deksia development team for support
