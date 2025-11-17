-- ============================================
-- Fix View: Add qualification_tier to marrai_ideas
-- ============================================
-- Quick fix for the view error

-- Add qualification_tier to marrai_ideas if missing
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS qualification_tier TEXT CHECK (qualification_tier IN (
  'exceptional', 'qualified', 'needs_work'
));

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

-- Verify
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'marrai_ideas' 
      AND column_name = 'qualification_tier'
    ) THEN '✓ qualification_tier added to marrai_ideas'
    ELSE '✗ ERROR: Column still missing'
  END AS result;

