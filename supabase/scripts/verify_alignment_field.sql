-- ============================================
-- Verify Alignment Field
-- ============================================
-- Run this to check if the alignment field exists and is properly indexed

-- Check if alignment column exists
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'marrai_ideas'
AND column_name = 'alignment';

-- Check indexes on alignment field
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'marrai_ideas'
AND indexname LIKE '%alignment%';

-- Sample query to test alignment field
SELECT 
  id,
  title,
  alignment->'moroccoPriorities' as morocco_priorities,
  alignment->'sdgTags' as sdg_tags,
  alignment->'sdgAutoTagged' as sdg_auto_tagged
FROM marrai_ideas
WHERE alignment IS NOT NULL
LIMIT 5;

-- Count ideas with alignment data
SELECT 
  COUNT(*) as total_ideas,
  COUNT(alignment) as ideas_with_alignment,
  COUNT(CASE WHEN alignment->'moroccoPriorities' != '[]'::jsonb THEN 1 END) as ideas_with_priorities,
  COUNT(CASE WHEN alignment->'sdgTags' != '[]'::jsonb THEN 1 END) as ideas_with_sdgs
FROM marrai_ideas;

