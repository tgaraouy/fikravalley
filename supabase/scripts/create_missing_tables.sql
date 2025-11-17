-- ============================================
-- Create Missing Tables - Diagnostic & Fix
-- ============================================
-- This script checks what tables exist and creates missing ones

-- First, let's see what marrai_ tables actually exist
SELECT 
  tablename AS existing_tables
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%'
ORDER BY tablename;

-- ============================================
-- Create marrai_decision_scores if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_decision_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL UNIQUE REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Stage 2: Decision scores (1-5 each)
  strategic_fit NUMERIC(2,1) NOT NULL CHECK (strategic_fit >= 1 AND strategic_fit <= 5),
  feasibility NUMERIC(2,1) NOT NULL CHECK (feasibility >= 1 AND feasibility <= 5),
  differentiation NUMERIC(2,1) NOT NULL CHECK (differentiation >= 1 AND differentiation <= 5),
  evidence_of_demand NUMERIC(2,1) NOT NULL CHECK (evidence_of_demand >= 1 AND evidence_of_demand <= 5),
  
  -- Total
  total NUMERIC(3,1) NOT NULL, -- Sum (4-20)
  
  -- Break-even analysis
  break_even_months INT,
  intilaka_eligible BOOLEAN DEFAULT false, -- ≤24 months
  
  -- Qualification
  qualified BOOLEAN DEFAULT false, -- ≥25/40 total (Stage 1 + Stage 2)
  qualification_tier TEXT CHECK (qualification_tier IN (
    'exceptional', 'qualified', 'needs_work'
  )),
  
  -- Darija detection
  darija_keywords TEXT[] DEFAULT '{}',
  darija_score NUMERIC(3,2) -- 0-1
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_qualified ON marrai_decision_scores(qualified);
CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_total ON marrai_decision_scores(total DESC);
CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_intilaka_eligible ON marrai_decision_scores(intilaka_eligible) WHERE intilaka_eligible = true;

-- ============================================
-- Create marrai_clarity_scores if it doesn't exist
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_clarity_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL UNIQUE REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Stage 1: Clarity scores (0-10 each)
  problem_statement NUMERIC(3,1) NOT NULL CHECK (problem_statement >= 0 AND problem_statement <= 10),
  as_is_analysis NUMERIC(3,1) NOT NULL CHECK (as_is_analysis >= 0 AND as_is_analysis <= 10),
  benefit_statement NUMERIC(3,1) NOT NULL CHECK (benefit_statement >= 0 AND benefit_statement <= 10),
  operational_needs NUMERIC(3,1) NOT NULL CHECK (operational_needs >= 0 AND operational_needs <= 10),
  
  -- Total
  total NUMERIC(4,1) NOT NULL, -- Sum (0-40)
  average NUMERIC(3,1) NOT NULL, -- Average (0-10)
  
  -- Qualification
  qualified BOOLEAN DEFAULT false, -- ≥6/10 average
  qualification_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_clarity_scores_qualified ON marrai_clarity_scores(qualified);
CREATE INDEX IF NOT EXISTS idx_marrai_clarity_scores_total ON marrai_clarity_scores(total DESC);

-- ============================================
-- Enable RLS
-- ============================================

ALTER TABLE marrai_decision_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_clarity_scores ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage scores" ON marrai_decision_scores;
DROP POLICY IF EXISTS "Service role can manage scores" ON marrai_clarity_scores;

-- Create policies
CREATE POLICY "Service role can manage scores" ON marrai_decision_scores
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scores" ON marrai_clarity_scores
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Create/Recreate the view
-- ============================================

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

-- ============================================
-- Verify tables were created
-- ============================================

SELECT 
  tablename AS table_name,
  CASE 
    WHEN tablename = 'marrai_decision_scores' THEN '✓ Created'
    WHEN tablename = 'marrai_clarity_scores' THEN '✓ Created'
    ELSE 'Already existed'
  END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('marrai_decision_scores', 'marrai_clarity_scores')
ORDER BY tablename;

-- Verify columns
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('marrai_decision_scores', 'marrai_clarity_scores')
ORDER BY table_name, ordinal_position;

