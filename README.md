# Deksia Prompt Library

A professional prompt sharing platform for Deksia team members, built with React, TypeScript, and Supabase. Features Anthropic-inspired design with role-based access control.

## Features

- **Authentication & Access Control**
  - Email/password authentication via Supabase Auth
  - Restricted to @deksia.com email addresses
  - Role-based access (Admin/User)
  - Password reset functionality

- **Prompt Management**
  - Create, read, update, and delete prompts
  - Rich text editing with preview mode
  - Category organization with color coding
  - Tag-based filtering and search
  - Public/private prompt visibility
  - Usage tracking and analytics
  - Copy to clipboard functionality

- **Search & Discovery**
  - Full-text search across titles, descriptions, and content
  - Filter by categories and tags
  - Sort by newest, usage count, etc.
  - Real-time search results

- **Admin Panel** (Admin users only)
  - User management with role assignment
  - Category creation and management
  - System-wide analytics

- **Modern UI/UX**
  - Anthropic-inspired design system
  - Responsive mobile-first layout
  - Clean, minimal interface
  - Smooth animations and transitions

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   cd "Deskia Prompt Library"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new Supabase project at [https://supabase.com](https://supabase.com)

   b. Run the database migrations in order:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and execute `supabase/migrations/00001_initial_schema.sql`
   - Copy and execute `supabase/migrations/00002_rls_policies.sql`

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Visit [http://localhost:5173](http://localhost:5173)

### First-Time Setup

1. **Create your admin user**
   - Register with your @deksia.com email
   - Go to Supabase dashboard > Authentication > Users
   - Note your user ID

2. **Set admin role**
   - Go to SQL Editor
   - Run:
     ```sql
     UPDATE profiles SET role = 'admin' WHERE id = 'your_user_id';
     ```

3. **Create default categories** (optional)
   - Uncomment the seed data section in `00001_initial_schema.sql`
   - Replace `YOUR_ADMIN_USER_ID` with your user ID
   - Run the seed data SQL

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard layout components
│   ├── prompts/           # Prompt management components
│   ├── admin/             # Admin panel components
│   └── shared/            # Shared/reusable components
├── hooks/                 # Custom React hooks
│   └── useAuth.tsx        # Authentication context & hook
├── lib/
│   ├── supabase.ts        # Supabase client & helpers
│   └── utils.ts           # Utility functions
├── pages/                 # Page components
│   ├── Dashboard.tsx
│   └── AdminPanel.tsx
├── types/
│   └── database.types.ts  # TypeScript types for database
├── styles/
│   └── index.css          # Global styles & Tailwind
├── App.tsx                # Root component
├── main.tsx               # App entry point
└── routes.tsx             # Route configuration

supabase/
└── migrations/            # Database migration files
    ├── 00001_initial_schema.sql
    └── 00002_rls_policies.sql
```

## Database Schema

### Tables

- **profiles**: User profiles with roles
- **categories**: Prompt categories with colors
- **prompts**: Prompt content with metadata

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic profile creation on user signup
- Email validation for @deksia.com domain
- Automatic timestamp updates
- Full-text search indexes

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Deploy to Netlify

1. Push your code to GitHub
2. Create new site from Git
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

## Security Considerations

- All authentication is handled by Supabase Auth
- Row Level Security (RLS) policies protect data access
- Email domain validation at database level
- XSS protection through React's built-in escaping
- Input sanitization and validation with Zod
- Admin-only routes protected by role checks

## Customization

### Colors

Edit `tailwind.config.js` to customize the color palette:
```javascript
colors: {
  primary: {
    500: '#FF6B35', // Main brand color
    // ... other shades
  }
}
```

### Features

- Add new database tables in `supabase/migrations/`
- Update TypeScript types in `src/types/database.types.ts`
- Add helper functions in `src/lib/supabase.ts`

## Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists with correct values
- Restart dev server after changing `.env`

### "Only @deksia.com email addresses are allowed"
- Check the email validation in `supabase/migrations/00002_rls_policies.sql`
- Verify RLS policies are applied correctly

### Authentication not working
- Verify Supabase project URL and anon key
- Check Supabase dashboard > Authentication settings
- Ensure email confirmation is configured

## License

Proprietary - Deksia Internal Use Only

## Support

For issues or questions, contact the Deksia development team.
