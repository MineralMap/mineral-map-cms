-- Mineral Map CMS - Complete Supabase Setup Script
-- Run this script in your Supabase SQL Editor to set up the entire database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE mineral_status AS ENUM ('draft', 'published', 'archived');

-- ===========================================
-- TABLES
-- ===========================================

-- Tags table for mineral categories
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#6B7280', -- Default gray color
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Minerals table with simplified schema
CREATE TABLE minerals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT, -- Rich text content from TinyMCE
    video_url TEXT, -- URL for embedded videos
    tags TEXT[] DEFAULT '{}', -- Array of tag names
    images JSONB DEFAULT '[]', -- Array of image metadata objects
    status mineral_status DEFAULT 'draft',
    meta_title TEXT, -- SEO title
    meta_description TEXT, -- SEO description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- STORAGE BUCKETS
-- ===========================================

-- Create storage buckets for media files
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('mineral-images', 'mineral-images', true),
    ('mineral-videos', 'mineral-videos', true)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================

-- Enable RLS on tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE minerals ENABLE ROW LEVEL SECURITY;

-- Tags policies - Allow public read access for now (since auth is out of scope)
CREATE POLICY "Allow public read access on tags" ON tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on tags" ON tags
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on tags" ON tags
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on tags" ON tags
    FOR DELETE USING (true);

-- Minerals policies - Allow public access for now (since auth is out of scope)
CREATE POLICY "Allow public read access on minerals" ON minerals
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on minerals" ON minerals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on minerals" ON minerals
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete on minerals" ON minerals
    FOR DELETE USING (true);

-- Storage policies for buckets
CREATE POLICY "Allow public read access on mineral images" ON storage.objects
    FOR SELECT USING (bucket_id = 'mineral-images');

CREATE POLICY "Allow public upload on mineral images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mineral-images');

CREATE POLICY "Allow public update on mineral images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'mineral-images');

CREATE POLICY "Allow public delete on mineral images" ON storage.objects
    FOR DELETE USING (bucket_id = 'mineral-images');

CREATE POLICY "Allow public read access on mineral videos" ON storage.objects
    FOR SELECT USING (bucket_id = 'mineral-videos');

CREATE POLICY "Allow public upload on mineral videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mineral-videos');

CREATE POLICY "Allow public update on mineral videos" ON storage.objects
    FOR UPDATE USING (bucket_id = 'mineral-videos');

CREATE POLICY "Allow public delete on mineral videos" ON storage.objects
    FOR DELETE USING (bucket_id = 'mineral-videos');

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_minerals_updated_at
    BEFORE UPDATE ON minerals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ language 'plpgsql';

-- Function to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.title);

        -- Ensure uniqueness by appending number if needed
        WHILE EXISTS (SELECT 1 FROM minerals WHERE slug = NEW.slug AND id != COALESCE(NEW.id, uuid_generate_v4())) LOOP
            NEW.slug = NEW.slug || '-' || extract(epoch from now())::text;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-generate slug
CREATE TRIGGER auto_generate_mineral_slug
    BEFORE INSERT OR UPDATE ON minerals
    FOR EACH ROW EXECUTE FUNCTION auto_generate_slug();

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Indexes for better query performance
CREATE INDEX idx_minerals_status ON minerals(status);
CREATE INDEX idx_minerals_slug ON minerals(slug);
CREATE INDEX idx_minerals_created_at ON minerals(created_at DESC);
CREATE INDEX idx_minerals_tags ON minerals USING GIN(tags);
CREATE INDEX idx_tags_name ON tags(name);

-- Full text search index on mineral content
CREATE INDEX idx_minerals_search ON minerals USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- ===========================================
-- SAMPLE DATA (OPTIONAL)
-- ===========================================

-- Insert some sample tags
INSERT INTO tags (name, color, description) VALUES
    ('Silicates', '#3B82F6', 'Minerals containing silicon and oxygen'),
    ('Oxides', '#EF4444', 'Minerals composed of metal and oxygen'),
    ('Carbonates', '#10B981', 'Minerals containing carbonate ion'),
    ('Sulfides', '#F59E0B', 'Minerals containing sulfur'),
    ('Halides', '#8B5CF6', 'Minerals containing halogen elements'),
    ('Sulfates', '#06B6D4', 'Minerals containing sulfate ion'),
    ('Phosphates', '#84CC16', 'Minerals containing phosphate ion'),
    ('Elements', '#6B7280', 'Native elements and alloys')
ON CONFLICT (name) DO NOTHING;

-- Insert a sample mineral
INSERT INTO minerals (
    title,
    slug,
    description,
    tags,
    status,
    meta_title,
    meta_description
) VALUES (
    'Sample Mineral',
    'sample-mineral',
    '<p>This is a sample mineral entry created during database setup. You can edit or delete this entry from your CMS.</p>',
    ARRAY['Silicates'],
    'draft',
    'Sample Mineral - Mineral Database',
    'A sample mineral entry for testing the CMS functionality.'
) ON CONFLICT (slug) DO NOTHING;

-- ===========================================
-- HELPFUL VIEWS
-- ===========================================

-- View for published minerals with tag details
CREATE OR REPLACE VIEW published_minerals AS
SELECT
    m.*,
    (
        SELECT json_agg(
            json_build_object('name', t.name, 'color', t.color)
        )
        FROM tags t
        WHERE t.name = ANY(m.tags)
    ) as tag_details
FROM minerals m
WHERE m.status = 'published';

-- ===========================================
-- UTILITY FUNCTIONS FOR CMS
-- ===========================================

-- Function to get mineral by slug
CREATE OR REPLACE FUNCTION get_mineral_by_slug(mineral_slug TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT to_json(pm.*) INTO result
    FROM published_minerals pm
    WHERE pm.slug = mineral_slug;

    RETURN result;
END;
$$ language 'plpgsql';

-- Function to search minerals
CREATE OR REPLACE FUNCTION search_minerals(
    search_term TEXT DEFAULT '',
    filter_tags TEXT[] DEFAULT '{}',
    limit_count INT DEFAULT 50,
    offset_count INT DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    slug TEXT,
    description TEXT,
    tags TEXT[],
    status mineral_status,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.title,
        m.slug,
        m.description,
        m.tags,
        m.status,
        m.created_at,
        m.updated_at,
        CASE
            WHEN search_term = '' THEN 1.0
            ELSE ts_rank(
                to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')),
                plainto_tsquery('english', search_term)
            )
        END as relevance
    FROM minerals m
    WHERE
        (search_term = '' OR to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')) @@ plainto_tsquery('english', search_term))
        AND (array_length(filter_tags, 1) IS NULL OR m.tags && filter_tags)
    ORDER BY relevance DESC, m.updated_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ language 'plpgsql';

-- ===========================================
-- COMPLETION MESSAGE
-- ===========================================

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Mineral Map CMS Database Setup Complete!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Created tables: tags, minerals';
    RAISE NOTICE 'Created storage buckets: mineral-images, mineral-videos';
    RAISE NOTICE 'Set up RLS policies for public access';
    RAISE NOTICE 'Added search and utility functions';
    RAISE NOTICE 'Inserted sample data';
    RAISE NOTICE '';
    RAISE NOTICE 'Your CMS is ready to use!';
    RAISE NOTICE '===========================================';
END $$;