-- ============================================
-- Quick Fix: Add qualification_tier Column
-- ============================================
-- Run this if qualification_tier is missing from marrai_decision_scores

-- Check current status
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'marrai_decision_scores' 
      AND column_name = 'qualification_tier'
    ) THEN 'Column already exists ✓'
    ELSE 'Column missing - will add it now...'
  END AS status;

-- Add the column
ALTER TABLE marrai_decision_scores 
ADD COLUMN IF NOT EXISTS qualification_tier TEXT CHECK (qualification_tier IN (
  'exceptional', 'qualified', 'needs_work'
));

-- Verify it was added
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'marrai_decision_scores'
AND column_name = 'qualification_tier';

-- Recreate the view
DROP VIEW IF EXISTS marrai_idea_scores CASCADE;

CREATE OR REPLACE VIEW marrai_idea_scores AS
SELECT 
  i.id AS idea_id,
  COALESCE(cs.problem_statement, 0) AS stage1_problem,
  COALESCE(cs.as_is_analysis, 0) AS stage1_as_is,
  COALESCE(cs.benefit_statement, 0) AS stage1_benefits,
  COALESCE(cs.operational_needs, 0) AS stage1_operations,
  COALESCE(cs.total, 0) AS stage1_total,
  COALESCE(cs.average, 0) AS stage1_average,
  COALESCE(ds.strategic_fit, 0) AS stage2_strategic,
  COALESCE(ds.feasibility, 0) AS stage2_feasibility,
  COALESCE(ds.differentiation, 0) AS stage2_differentiation,
  COALESCE(ds.evidence_of_demand, 0) AS stage2_evidence,
  COALESCE(ds.total, 0) AS stage2_total,
  COALESCE(cs.total, 0) + COALESCE(ds.total, 0) AS total_score,
  ds.break_even_months,
  ds.intilaka_eligible,
  COALESCE(ds.qualification_tier, i.qualification_tier) AS qualification_tier
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id;

-- Final verification
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'marrai_decision_scores' 
      AND column_name = 'qualification_tier'
    ) THEN '✓ SUCCESS: qualification_tier column added successfully'
    ELSE '✗ ERROR: Column still missing'
  END AS result;

