-- Migration: Convert tags to categories (multi-select to single-select)
-- This script:
-- 1. Renames the 'tags' table to 'categories'
-- 2. Converts minerals.tags from TEXT[] to TEXT (single value)
-- 3. Migrates existing data (preserves first tag value as category)
-- 4. Updates RLS policies for renamed table

BEGIN;

-- Step 1: Rename the tags table to categories
ALTER TABLE IF EXISTS tags RENAME TO categories;

-- Step 2: Add new category column (TEXT) to minerals table
ALTER TABLE minerals ADD COLUMN IF NOT EXISTS category TEXT;

-- Step 3: Migrate data - set category to first tag value (or NULL if no tags)
UPDATE minerals
SET category = (
  CASE
    WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN tags[1]
    ELSE NULL
  END
);

-- Step 4: Drop the old tags column
ALTER TABLE minerals DROP COLUMN IF EXISTS tags;

-- Step 5: Update RLS policies (they should still work with renamed table, but verify)
-- RLS policies are already enabled on the table, just renamed
-- Verify policies exist:
-- SELECT * FROM pg_policies WHERE tablename = 'categories';

-- Step 6: Add comment for documentation
COMMENT ON TABLE categories IS 'Categories for classifying minerals (formerly tags table)';
COMMENT ON COLUMN minerals.category IS 'Single category classification (formerly tags array)';

COMMIT;

-- Rollback script (run separately if needed):
-- BEGIN;
-- ALTER TABLE categories RENAME TO tags;
-- ALTER TABLE minerals ADD COLUMN tags TEXT[] DEFAULT '{}';
-- UPDATE minerals SET tags = CASE WHEN category IS NOT NULL THEN ARRAY[category] ELSE '{}' END;
-- ALTER TABLE minerals DROP COLUMN category;
-- COMMIT;
