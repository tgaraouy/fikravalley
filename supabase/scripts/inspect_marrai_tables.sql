-- ============================================
-- Inspect MarrAI Tables - Diagnostic Script
-- ============================================
-- Run this in Supabase SQL Editor to see current table definitions
-- Useful for debugging and understanding current schema state

-- ============================================
-- 1. LIST ALL MARRAI TABLES
-- ============================================

SELECT 
  tablename AS table_name,
  schemaname AS schema_name
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%'
ORDER BY tablename;

-- ============================================
-- 2. TABLE STRUCTURE (Columns, Types, Constraints)
-- ============================================

SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.character_maximum_length,
  c.is_nullable,
  c.column_default,
  CASE 
    WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
    WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY → ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
    WHEN uq.column_name IS NOT NULL THEN 'UNIQUE'
    ELSE ''
  END AS constraints
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku 
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON pk.table_name = c.table_name AND pk.column_name = c.column_name
LEFT JOIN (
  SELECT 
    ku.table_name,
    ku.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku 
    ON tc.constraint_name = ku.constraint_name
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON fk.table_name = c.table_name AND fk.column_name = c.column_name
LEFT JOIN (
  SELECT ku.table_name, ku.column_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage ku 
    ON tc.constraint_name = ku.constraint_name
  WHERE tc.constraint_type = 'UNIQUE'
  AND tc.constraint_name NOT IN (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'PRIMARY KEY'
  )
) uq ON uq.table_name = c.table_name AND uq.column_name = c.column_name
WHERE t.table_schema = 'public'
AND t.table_name LIKE 'marrai_%'
ORDER BY t.table_name, c.ordinal_position;

-- ============================================
-- 3. CHECK CONSTRAINTS (CHECK clauses)
-- ============================================

SELECT 
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name LIKE 'marrai_%'
AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================
-- 4. FOREIGN KEY RELATIONSHIPS
-- ============================================

SELECT 
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  tc.constraint_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name LIKE 'marrai_%'
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 5. INDEXES
-- ============================================

SELECT 
  tablename AS table_name,
  indexname AS index_name,
  indexdef AS index_definition
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
ORDER BY tablename, indexname;

-- ============================================
-- 6. TRIGGERS
-- ============================================

SELECT 
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_timing AS timing,
  action_statement AS trigger_function
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table LIKE 'marrai_%'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
ORDER BY tablename, policyname;

-- ============================================
-- 8. RLS ENABLED STATUS
-- ============================================

SELECT 
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
ORDER BY tablename;

-- ============================================
-- 9. VIEWS
-- ============================================

SELECT 
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'marrai_%'
ORDER BY table_name;

-- ============================================
-- 10. TABLE COMMENTS (Documentation)
-- ============================================

SELECT 
  t.tablename AS table_name,
  obj_description(c.oid, 'pg_class') AS table_comment
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.schemaname = 'public'
AND t.tablename LIKE 'marrai_%'
ORDER BY t.tablename;

-- ============================================
-- 11. COLUMN COMMENTS
-- ============================================

SELECT 
  t.table_name,
  c.column_name,
  col_description(
    (SELECT oid FROM pg_class WHERE relname = t.table_name),
    c.ordinal_position
  ) AS column_comment
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
AND t.table_name LIKE 'marrai_%'
AND col_description(
  (SELECT oid FROM pg_class WHERE relname = t.table_name),
  c.ordinal_position
) IS NOT NULL
ORDER BY t.table_name, c.ordinal_position;

-- ============================================
-- 12. TABLE ROW COUNTS
-- ============================================

DO $$
DECLARE
  r RECORD;
  row_count BIGINT;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename LIKE 'marrai_%'
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', r.tablename) INTO row_count;
    RAISE NOTICE 'Table: % | Rows: %', r.tablename, row_count;
  END LOOP;
END $$;

-- ============================================
-- 13. MISSING COLUMNS CHECK
-- ============================================
-- Check if expected columns exist in key tables

SELECT 
  'marrai_decision_scores' AS table_name,
  'qualification_tier' AS expected_column,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'marrai_decision_scores' 
      AND column_name = 'qualification_tier'
    ) THEN 'EXISTS ✓'
    ELSE 'MISSING ✗'
  END AS status
UNION ALL
SELECT 
  'marrai_ideas',
  'qualification_tier',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'marrai_ideas' 
      AND column_name = 'qualification_tier'
    ) THEN 'EXISTS ✓'
    ELSE 'MISSING ✗'
  END
UNION ALL
SELECT 
  'marrai_secure_users',
  'phone_hash',
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'marrai_secure_users' 
      AND column_name = 'phone_hash'
    ) THEN 'EXISTS ✓'
    ELSE 'MISSING ✗'
  END;

-- ============================================
-- 14. GENERATE CREATE TABLE STATEMENTS
-- ============================================
-- This generates approximate CREATE TABLE statements
-- (Useful for documentation, but may not be 100% accurate)

SELECT 
  'CREATE TABLE ' || table_name || ' (' || E'\n' ||
  string_agg(
    '  ' || column_name || ' ' || 
    CASE 
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
      WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
      WHEN data_type = 'ARRAY' THEN 'TEXT[]'
      ELSE UPPER(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
    CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
    ',' || E'\n'
    ORDER BY ordinal_position
  ) || E'\n' || ');' AS create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name LIKE 'marrai_%'
GROUP BY table_name
ORDER BY table_name;

-- ============================================
-- 15. SUMMARY STATISTICS
-- ============================================

SELECT 
  'Total marrai_ tables' AS metric,
  COUNT(*)::TEXT AS value
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
UNION ALL
SELECT 
  'Total marrai_ indexes',
  COUNT(*)::TEXT
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%'
UNION ALL
SELECT 
  'Total marrai_ foreign keys',
  COUNT(*)::TEXT
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name LIKE 'marrai_%'
AND constraint_type = 'FOREIGN KEY'
UNION ALL
SELECT 
  'Total marrai_ triggers',
  COUNT(*)::TEXT
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table LIKE 'marrai_%'
UNION ALL
SELECT 
  'Total marrai_ RLS policies',
  COUNT(*)::TEXT
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'marrai_%';

