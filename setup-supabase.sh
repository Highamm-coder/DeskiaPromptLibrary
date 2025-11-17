#!/bin/bash

# Deksia Prompt Library - Database Setup Script
# This script will execute the SQL setup on your Supabase project

echo "🚀 Setting up Deksia Prompt Library database..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Installing..."
    brew install supabase/tap/supabase
fi

# Read the SQL file
SQL_FILE="setup-database.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: setup-database.sql not found!"
    exit 1
fi

echo "📄 Reading SQL setup file..."
echo ""

# Project details
PROJECT_REF="kghndcfajqmmuyameuka"
PROJECT_URL="https://${PROJECT_REF}.supabase.co"

echo "🔗 Project URL: $PROJECT_URL"
echo ""
echo "📋 To complete setup, please:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
echo "2. Copy the contents of setup-database.sql"
echo "3. Paste into the SQL Editor"
echo "4. Click 'Run' (or press Cmd+Enter)"
echo ""
echo "Or run this command if you have Supabase CLI configured:"
echo ""
echo "  supabase db push --project-ref ${PROJECT_REF}"
echo ""

# Open Supabase dashboard
read -p "Would you like to open the Supabase SQL Editor now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
    echo "✅ Opened SQL Editor in your browser"
fi

echo ""
echo "✨ After running the SQL, your database will be ready!"
