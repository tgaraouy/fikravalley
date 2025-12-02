-- ============================================
-- CHECK AND RESTORE IDEAS DATA
-- ============================================
-- Run this in Supabase SQL Editor to diagnose and restore ideas

-- 1. COUNT TOTAL IDEAS
SELECT COUNT(*) as total_ideas FROM marrai_ideas;

-- 2. COUNT VISIBLE IDEAS
SELECT COUNT(*) as visible_ideas FROM marrai_ideas WHERE visible = true;

-- 3. COUNT HIDDEN IDEAS
SELECT COUNT(*) as hidden_ideas FROM marrai_ideas WHERE visible = false OR visible IS NULL;

-- 4. CHECK FOR IDEAS WITH MISSING DATA
SELECT 
  COUNT(*) as total,
  COUNT(title) as with_title,
  COUNT(problem_statement) as with_problem,
  COUNT(proposed_solution) as with_solution,
  COUNT(category) as with_category,
  COUNT(location) as with_location
FROM marrai_ideas;

-- 5. SHOW SAMPLE OF IDEAS (to verify data exists)
SELECT 
  id,
  title,
  LEFT(problem_statement, 50) as problem_preview,
  category,
  location,
  visible,
  created_at
FROM marrai_ideas
ORDER BY created_at DESC
LIMIT 10;

-- 6. CHECK IF IDEAS ARE SOFT-DELETED
SELECT COUNT(*) as soft_deleted FROM marrai_ideas WHERE deleted_at IS NOT NULL;

-- ============================================
-- RESTORE VISIBILITY (UNCOMMENT TO RUN)
-- ============================================
-- ⚠️ WARNING: Only run this if ideas were accidentally hidden!
-- This sets ALL ideas to visible=true

-- UPDATE marrai_ideas 
-- SET visible = true 
-- WHERE visible = false OR visible IS NULL;

-- ============================================
-- RESTORE FROM SOFT DELETE (if needed)
-- ============================================
-- If ideas were soft-deleted, restore them:

-- UPDATE marrai_ideas 
-- SET deleted_at = NULL 
-- WHERE deleted_at IS NOT NULL;

-- ============================================
-- CHECK RECENT CHANGES (audit trail)
-- ============================================
-- If you have an audit log table, check recent changes:

-- SELECT * FROM marrai_audit_logs 
-- WHERE table_name = 'marrai_ideas' 
-- ORDER BY created_at DESC 
-- LIMIT 20;

