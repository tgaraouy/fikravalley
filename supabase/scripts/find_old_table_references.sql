-- ============================================
-- Find Code References to Old Table Names
-- ============================================
-- This helps identify where to update code
-- Note: This searches database objects, not application code

-- Find views that reference old table names
SELECT 
  table_name AS view_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND (
  view_definition LIKE '%clarity_scores%'
  OR view_definition LIKE '%decision_scores%'
  OR view_definition LIKE '%secure_users%'
  OR view_definition LIKE '%idea_receipts%'
  OR view_definition LIKE '%self_ask%'
  OR view_definition LIKE '%funding_applications%'
  OR view_definition LIKE '%idea_upvotes%'
  OR view_definition LIKE '%problem_validations%'
  OR view_definition LIKE '%mentors%'
  OR view_definition LIKE '%consents%'
  OR view_definition LIKE '%deletion_requests%'
  OR view_definition LIKE '%export_requests%'
  OR view_definition LIKE '%admin_actions%'
  OR view_definition LIKE '%audit_logs%'
);

-- Find functions that reference old table names
SELECT 
  routine_name AS function_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
  routine_definition LIKE '%clarity_scores%'
  OR routine_definition LIKE '%decision_scores%'
  OR routine_definition LIKE '%secure_users%'
);

-- Find triggers on old table names (shouldn't exist, but check)
SELECT 
  trigger_name,
  event_object_table AS table_name,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table NOT LIKE 'marrai_%'
AND event_object_table IN (
  'clarity_scores',
  'decision_scores',
  'secure_users',
  'idea_receipts',
  'self_ask_questions',
  'self_ask_responses',
  'funding_applications',
  'idea_upvotes',
  'problem_validations',
  'mentors',
  'mentor_matches',
  'consents',
  'deletion_requests',
  'export_requests',
  'admin_actions',
  'audit_logs'
);

