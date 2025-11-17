-- ============================================
-- Verify Complete Schema
-- ============================================
-- Run this to verify all tables, columns, and relationships are correct

-- ============================================
-- 1. COUNT ALL MARRAI TABLES
-- ============================================

SELECT 
  COUNT(*) AS total_marrai_tables,
  'Expected: ~25 tables' AS note
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%';

-- ============================================
-- 2. LIST ALL MARRAI TABLES
-- ============================================

SELECT 
  tablename AS table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(tablename)::regclass)) AS size
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%'
ORDER BY tablename;

-- ============================================
-- 3. CHECK KEY TABLES EXIST
-- ============================================

SELECT 
  'marrai_ideas' AS table_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_ideas') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
UNION ALL
SELECT 'marrai_secure_users', 
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_secure_users') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_clarity_scores',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_clarity_scores') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_decision_scores',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_decision_scores') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_idea_receipts',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_idea_receipts') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_self_ask_responses',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_self_ask_responses') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_funding_applications',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_funding_applications') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_consents',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_consents') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_mentors',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'marrai_mentors') 
    THEN '✓ EXISTS' ELSE '✗ MISSING' END;

-- ============================================
-- 4. CHECK KEY COLUMNS EXIST
-- ============================================

SELECT 
  'marrai_ideas.qualification_tier' AS column_check,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_ideas' AND column_name = 'qualification_tier'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
UNION ALL
SELECT 'marrai_decision_scores.qualification_tier',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_decision_scores' AND column_name = 'qualification_tier'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END
UNION ALL
SELECT 'marrai_secure_users.phone_hash',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_secure_users' AND column_name = 'phone_hash'
  ) THEN '✓ EXISTS' ELSE '✗ MISSING' END;

-- ============================================
-- 5. CHECK FOREIGN KEYS
-- ============================================

SELECT 
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name LIKE 'marrai_%'
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name
LIMIT 20; -- Show first 20

-- ============================================
-- 6. CHECK INDEXES
-- ============================================

SELECT 
  COUNT(*) AS total_indexes,
  COUNT(DISTINCT tablename) AS tables_with_indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%';

-- ============================================
-- 7. CHECK VIEWS
-- ============================================

SELECT 
  table_name AS view_name,
  CASE WHEN table_name = 'marrai_idea_scores' THEN '✓ Main scores view' ELSE 'Other view' END AS description
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'marrai_%';

-- ============================================
-- 8. CHECK RLS ENABLED
-- ============================================

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ RLS Enabled' ELSE '✗ RLS Disabled' END AS rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
AND tablename IN (
  'marrai_secure_users',
  'marrai_ideas',
  'marrai_clarity_scores',
  'marrai_decision_scores',
  'marrai_consents'
)
ORDER BY tablename;

-- ============================================
-- 9. TEST VIEW
-- ============================================

-- Test if the view works (should return empty result if no data, but no error)
SELECT 
  COUNT(*) AS view_test_result,
  'View works if no error' AS note
FROM marrai_idea_scores;

-- ============================================
-- 10. SUMMARY
-- ============================================

SELECT 
  'Schema Verification Complete' AS status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'marrai_%') AS total_tables,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE 'marrai_%') AS total_indexes,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name LIKE 'marrai_%') AS total_views;

