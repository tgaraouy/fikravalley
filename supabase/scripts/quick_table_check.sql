-- ============================================
-- Quick MarrAI Tables Check
-- ============================================
-- Quick diagnostic - shows table names and basic info

-- List all marrai_ tables with row counts
SELECT 
  t.tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(t.tablename)::regclass)) AS size,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.tablename) AS column_count,
  (SELECT COUNT(*) FROM pg_indexes 
   WHERE tablename = t.tablename) AS index_count
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.tablename LIKE 'marrai_%'
ORDER BY t.tablename;

-- Check for missing qualification_tier column
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'marrai_decision_scores' 
      AND column_name = 'qualification_tier'
    ) THEN '✓ qualification_tier exists in marrai_decision_scores'
    ELSE '✗ qualification_tier MISSING in marrai_decision_scores'
  END AS check_result;

