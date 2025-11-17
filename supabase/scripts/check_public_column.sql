-- Check if public column exists in marrai_ideas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'marrai_ideas'
AND column_name = 'public';

-- If it doesn't exist, show all columns to see what we have
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'marrai_ideas'
ORDER BY ordinal_position;

