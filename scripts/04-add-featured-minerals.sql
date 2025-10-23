-- =====================================================
-- MIGRATION: Add Featured Minerals Functionality
-- Description: Adds featured column to minerals table
--              with constraint to limit max 3 featured
--              and ensure only published minerals can be featured
-- Date: 2025-10-23
-- =====================================================

-- Step 1: Add the featured column to minerals table
ALTER TABLE minerals 
ADD COLUMN featured BOOLEAN NOT NULL DEFAULT false;

-- Add column documentation
COMMENT ON COLUMN minerals.featured IS 'Whether this mineral is featured on the homepage (max 3 allowed, only published minerals)';

-- Step 2: Create function to enforce the 3-featured limit AND published status
CREATE OR REPLACE FUNCTION check_featured_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if we're trying to set featured to true
  IF NEW.featured = true THEN
    -- First check: Only published minerals can be featured
    IF NEW.status != 'published' THEN
      RAISE EXCEPTION 'Only published minerals can be featured. Please publish the mineral first.';
    END IF;
    
    -- Second check: Check if we already have 3 featured minerals (excluding the current one being updated)
    IF (SELECT COUNT(*) FROM minerals WHERE featured = true AND id != NEW.id) >= 3 THEN
      RAISE EXCEPTION 'Cannot feature more than 3 minerals. Please unfeature another mineral first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add function documentation
COMMENT ON FUNCTION check_featured_limit() IS 'Trigger function that ensures no more than 3 minerals can be featured at once and only published minerals can be featured';

-- Step 3: Create trigger to enforce the limit
DROP TRIGGER IF EXISTS enforce_featured_limit ON minerals;
CREATE TRIGGER enforce_featured_limit
  BEFORE INSERT OR UPDATE ON minerals
  FOR EACH ROW
  EXECUTE FUNCTION check_featured_limit();

-- Add trigger documentation
COMMENT ON TRIGGER enforce_featured_limit ON minerals IS 'Enforces max 3 featured minerals constraint and published status requirement';

-- Step 4: Add a check constraint to ensure featured minerals are published
ALTER TABLE minerals 
ADD CONSTRAINT check_featured_published 
CHECK (featured = false OR status = 'published');

-- Add constraint documentation
COMMENT ON CONSTRAINT check_featured_published ON minerals IS 'Ensures only published minerals can be featured';

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- View current featured minerals
-- SELECT id, title, featured FROM minerals WHERE featured = true ORDER BY title;

-- Count featured minerals
-- SELECT COUNT(*) as featured_count FROM minerals WHERE featured = true;

