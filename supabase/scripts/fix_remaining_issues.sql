-- ============================================
-- Fix Remaining Issues
-- ============================================

-- 1. Enable RLS on marrai_secure_users
ALTER TABLE marrai_secure_users ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DROP POLICY IF EXISTS "Service role can manage all" ON marrai_secure_users;
CREATE POLICY "Service role can manage all" ON marrai_secure_users
  FOR ALL USING (auth.role() = 'service_role');

-- 2. Create alias views for backward compatibility (temporary)
-- This allows old code to work while you update it
DROP VIEW IF EXISTS idea_scores CASCADE;
CREATE VIEW idea_scores AS
SELECT * FROM marrai_idea_scores;

-- Note: Supabase PostgREST doesn't support table aliases directly
-- You'll need to update the code to use marrai_idea_scores
-- But the view alias above will work for direct SQL queries

-- Verify
SELECT 
  'marrai_secure_users RLS' AS check_item,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'marrai_secure_users' 
    AND rowsecurity = true
  ) THEN '✓ Enabled' ELSE '✗ Still Disabled' END AS status
UNION ALL
SELECT 
  'idea_scores view (alias)',
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_name = 'idea_scores'
  ) THEN '✓ Created' ELSE '✗ Missing' END;

