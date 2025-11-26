-- Quick fix: Make all existing ideas visible
-- Run this in Supabase SQL Editor to fix the "0 ideas found" issue

-- Update all ideas to be visible
UPDATE marrai_ideas 
SET visible = true 
WHERE visible IS NULL OR visible = false;

-- Verify the update
SELECT 
  COUNT(*) FILTER (WHERE visible = true) as visible_count,
  COUNT(*) FILTER (WHERE visible = false OR visible IS NULL) as hidden_count,
  COUNT(*) as total_count
FROM marrai_ideas;

-- Show a sample of visible ideas
SELECT 
  id,
  title,
  visible,
  status,
  category
FROM marrai_ideas
WHERE visible = true
ORDER BY created_at DESC
LIMIT 10;

