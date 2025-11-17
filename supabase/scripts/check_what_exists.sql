-- ============================================
-- Check What MarrAI Tables Actually Exist
-- ============================================
-- Run this first to see what you have

-- List all marrai_ tables
SELECT 
  tablename AS table_name,
  'EXISTS' AS status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%'
ORDER BY tablename;

-- Check for specific tables we expect
SELECT 
  'marrai_ideas' AS expected_table,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'marrai_ideas'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END AS status
UNION ALL
SELECT 
  'marrai_decision_scores',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'marrai_decision_scores'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END
UNION ALL
SELECT 
  'marrai_clarity_scores',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'marrai_clarity_scores'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END
UNION ALL
SELECT 
  'marrai_secure_users',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename = 'marrai_secure_users'
    ) THEN '✓ EXISTS'
    ELSE '✗ MISSING'
  END;

-- Count total marrai_ tables
SELECT 
  COUNT(*) AS total_marrai_tables
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%';

