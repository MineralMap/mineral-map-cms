# Database Scripts

This folder contains SQL scripts for setting up and maintaining the Mineral Map CMS database.

## Scripts

### `01-initial-setup.sql`
Complete initial database setup including:
- Tables (minerals, tags)
- Storage buckets (mineral-images, mineral-videos)
- RLS policies
- Functions and triggers
- Sample data
- Performance indexes

**Usage:** Run this script in Supabase SQL Editor to set up the entire database from scratch.

**Note:** The script automatically creates storage buckets - no manual bucket creation required!

## Running Scripts

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the script content
4. Run the script
5. Check the output messages for confirmation

## Script Naming Convention

Scripts are numbered in the order they should be run:
- `01-` = Initial setup
- `02-` = Migrations/updates
- `03-` = Additional features
- etc.