-- Migration: Allow custom categories and locations
-- This removes the CHECK constraints to allow users to add custom values

-- Remove CHECK constraint on category
ALTER TABLE marrai_ideas
DROP CONSTRAINT IF EXISTS marrai_ideas_category_check;

-- Remove CHECK constraint on location  
ALTER TABLE marrai_ideas
DROP CONSTRAINT IF EXISTS marrai_ideas_location_check;

-- Add comments to document the change
COMMENT ON COLUMN marrai_ideas.category IS 'Category of the idea. Can be a predefined value or custom user-defined value.';
COMMENT ON COLUMN marrai_ideas.location IS 'Location/city of the idea. Can be a predefined value or custom user-defined value.';

