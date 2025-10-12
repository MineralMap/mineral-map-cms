# Database Setup Scripts

This directory contains SQL scripts to set up and configure your Supabase database for the Mineral Map CMS.

## Setup Order

Run these scripts **in order** in your Supabase SQL Editor:

### 1. Initial Database Setup (`01-initial-setup.sql`)

Complete initial database setup including:
- Creates `minerals` and `tags` tables
- Sets up storage buckets (mineral-images, mineral-videos)
- Adds RLS policies with public access (temporary)
- Creates utility functions and triggers
- Adds sample data for testing
- Performance indexes

**Usage:** Run this script in Supabase SQL Editor to set up the entire database from scratch.

**Note:** The script automatically creates storage buckets - no manual bucket creation required!

### 2. Authentication Setup (`02-add-auth.sql`)

Enables authentication and restricts write access:
- **Keeps public READ access** (for your other web app to consume data)
- **Requires authentication for WRITE operations** (INSERT, UPDATE, DELETE)
- Keeps storage buckets publicly readable (so images/videos can be displayed)
- **Automatically creates default admin user:**
  - Email: `dmmineralmap@gmail.com`
  - Password: `supersecret123`
  - **IMPORTANT:** Change password after first login!
- Includes optional role-based access control (RBAC) setup

**Usage:** Run after completing the initial setup to enable authentication.

## Running Scripts

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the script content
5. Click **"Run"** or press Cmd/Ctrl + Enter
6. Check the output messages for confirmation

## Default Admin User

The `02-add-auth.sql` script attempts to automatically create a default admin user:

- **Email:** `dmmineralmap@gmail.com`
- **Password:** `supersecret123`

**IMPORTANT:** Change this password immediately after your first login!

### If Automatic Creation Fails

If the script cannot create the user automatically (due to database permissions), create it manually:

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"**
3. Enter:
   - Email: `dmmineralmap@gmail.com`
   - Password: `supersecret123`
4. **Uncheck** "Send user a confirmation email"
5. Click **"Create User"**

You can then log in with these credentials at `/login` once you've started your development server.

## Creating Additional Users

To create additional CMS users:

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"**
4. Enter email and password
5. **Important:** Disable email confirmation or manually confirm after creation
6. Click **"Create User"**

### Option 2: Sign Up in Application (Optional)

The AuthContext includes a `signUp()` method. You can create a sign-up page if you want users to self-register.

## Access Control Summary

After running both scripts, your database will have the following access control:

### Read Access (Public - No Authentication Required)
- ✅ Your other web app can read all minerals data
- ✅ Your other web app can read all tags data
- ✅ Anyone can view images/videos from storage buckets

### Write Access (Authenticated - CMS Only)
- 🔒 Creating, updating, deleting minerals requires authentication
- 🔒 Creating, updating, deleting tags requires authentication
- 🔒 Uploading, updating, deleting files requires authentication

This setup allows your public-facing web app to consume data while keeping content management secure.

## Troubleshooting

### Issue: "New row violates row-level security policy"
**Solution:** Ensure you've run `02-add-auth.sql` and you're logged in through the CMS application.

### Issue: Can't access images/videos from public web app
**Solution:** Verify storage buckets are set to public in Storage settings and the public read policies exist.

### Issue: Can't login with default credentials
**Solution:** Verify the `02-add-auth.sql` script ran successfully and check for any errors in the output.

## Verifying Setup

After setup, verify:
- ✅ Tables exist: `minerals`, `tags`
- ✅ Storage buckets exist: `mineral-images`, `mineral-videos`
- ✅ At least one user exists in Authentication
- ✅ You can log in at `/login`
- ✅ Protected routes work correctly

## Script Naming Convention

Scripts are numbered in the order they should be run:
- `01-` = Initial setup
- `02-` = Authentication & migrations
- `03-` = Future features