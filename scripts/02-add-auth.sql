-- Mineral Map CMS - Authentication Migration Script
-- Run this script in your Supabase SQL Editor to enable authentication
-- This will update RLS policies to allow PUBLIC READ access, but require authentication for WRITE operations

-- ===========================================
-- DROP EXISTING PUBLIC WRITE POLICIES
-- ===========================================

-- Drop existing public WRITE policies for tags (keep read access)
DROP POLICY IF EXISTS "Allow public insert on tags" ON tags;
DROP POLICY IF EXISTS "Allow public update on tags" ON tags;
DROP POLICY IF EXISTS "Allow public delete on tags" ON tags;

-- Drop existing public WRITE policies for minerals (keep read access)
DROP POLICY IF EXISTS "Allow public insert on minerals" ON minerals;
DROP POLICY IF EXISTS "Allow public update on minerals" ON minerals;
DROP POLICY IF EXISTS "Allow public delete on minerals" ON minerals;

-- Drop existing public WRITE policies for storage (keep read access)
DROP POLICY IF EXISTS "Allow public upload on mineral images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on mineral images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on mineral images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload on mineral videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update on mineral videos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete on mineral videos" ON storage.objects;

-- ===========================================
-- CREATE AUTHENTICATED-ONLY WRITE POLICIES
-- ===========================================
-- Note: Public READ policies from initial setup remain intact for your other web app

-- Tags policies - Public read (already exists from 01-initial-setup.sql), authenticated write
CREATE POLICY "Authenticated users can insert tags" ON tags
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tags" ON tags
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete tags" ON tags
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Minerals policies - Public read (already exists from 01-initial-setup.sql), authenticated write
CREATE POLICY "Authenticated users can insert minerals" ON minerals
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update minerals" ON minerals
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete minerals" ON minerals
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Storage policies - Public read (already exists from 01-initial-setup.sql), authenticated write
-- Mineral Images Bucket
CREATE POLICY "Authenticated users can upload mineral images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'mineral-images' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can update mineral images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'mineral-images' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can delete mineral images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'mineral-images' AND
        auth.uid() IS NOT NULL
    );

-- Mineral Videos Bucket
CREATE POLICY "Authenticated users can upload mineral videos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'mineral-videos' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can update mineral videos" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'mineral-videos' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Authenticated users can delete mineral videos" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'mineral-videos' AND
        auth.uid() IS NOT NULL
    );

-- ===========================================
-- CREATE DEFAULT CMS ADMIN USER
-- ===========================================

-- Create the default admin user
-- Email: dmmineralmap@gmail.com
-- Password: supersecret123
-- NOTE: Change this password immediately after first login!

DO $$
DECLARE
    new_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists
    SELECT EXISTS (
        SELECT 1 FROM auth.users WHERE email = 'dmmineralmap@gmail.com'
    ) INTO user_exists;

    IF user_exists THEN
        -- User exists, update password
        UPDATE auth.users
        SET encrypted_password = crypt('supersecret123', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW()
        WHERE email = 'dmmineralmap@gmail.com'
        RETURNING id INTO new_user_id;

        RAISE NOTICE 'Updated existing admin user: dmmineralmap@gmail.com';
    ELSE
        -- User doesn't exist, create new
        new_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'dmmineralmap@gmail.com',
            crypt('supersecret123', gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );

        -- Insert identity record
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        )
        VALUES (
            gen_random_uuid(),
            new_user_id,
            jsonb_build_object(
                'sub', new_user_id::text,
                'email', 'dmmineralmap@gmail.com'
            ),
            'email',
            NOW(),
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Created new admin user: dmmineralmap@gmail.com';
    END IF;

    RAISE NOTICE 'Email: dmmineralmap@gmail.com';
    RAISE NOTICE 'Password: supersecret123';
    RAISE NOTICE 'IMPORTANT: Change this password immediately after first login!';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not create user automatically. Please create manually in Supabase Dashboard.';
        RAISE NOTICE 'Email: dmmineralmap@gmail.com';
        RAISE NOTICE 'Password: supersecret123';
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- ===========================================
-- OPTIONAL: CREATE USER ROLES TABLE
-- ===========================================
-- Uncomment this section if you want to implement role-based access control

/*
-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own role
CREATE POLICY "Users can read their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Only admins can manage roles (you'll need to manually set the first admin)
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Function to check user role
CREATE OR REPLACE FUNCTION check_user_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND (
            role = required_role OR
            (required_role = 'editor' AND role = 'admin') OR
            (required_role = 'viewer' AND role IN ('admin', 'editor'))
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example: Update mineral policies to check for editor role
-- Uncomment and modify as needed
-- DROP POLICY "Authenticated users can insert minerals" ON minerals;
-- CREATE POLICY "Editors can insert minerals" ON minerals
--     FOR INSERT WITH CHECK (check_user_role('editor'));
*/

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Authentication Migration Complete!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'RLS Policies Updated:';
    RAISE NOTICE '- Public READ access: Enabled (for your other web app)';
    RAISE NOTICE '- Authenticated WRITE access: Required (CMS only)';
    RAISE NOTICE '- Storage: Public read, authenticated write';
    RAISE NOTICE '';
    RAISE NOTICE 'Admin User Setup:';
    RAISE NOTICE '- Email: dmmineralmap@gmail.com';
    RAISE NOTICE '- Password: supersecret123';
    RAISE NOTICE '- CHANGE PASSWORD AFTER FIRST LOGIN!';
    RAISE NOTICE '';
    RAISE NOTICE 'If automatic user creation failed:';
    RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
    RAISE NOTICE '2. Click "Add User" button';
    RAISE NOTICE '3. Enter email: dmmineralmap@gmail.com';
    RAISE NOTICE '4. Enter password: supersecret123';
    RAISE NOTICE '5. Uncheck "Send user a confirmation email"';
    RAISE NOTICE '6. Click "Create User"';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Log in to the CMS at /login';
    RAISE NOTICE '2. Your other web app can READ data without authentication';
    RAISE NOTICE '3. (Optional) Uncomment user_roles section for RBAC';
    RAISE NOTICE '===========================================';
END $$;
