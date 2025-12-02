-- ============================================
-- PRE-SEED EVALUATION FRAMEWORK
-- ============================================
-- Concept Ventures-inspired pre-seed evaluation system
-- Focuses on founder narrative over hard metrics

-- 1. Pre-Seed Evaluations Table
CREATE TABLE IF NOT EXISTS marrai_preseed_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  evaluated_by UUID REFERENCES marrai_mentors(id), -- Mentor/Investor who evaluated
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Phase 1: Idea Selection Lens (1-5 scores)
  problem_sharpness_score INTEGER CHECK (problem_sharpness_score BETWEEN 1 AND 5),
  problem_sharpness_notes TEXT,
  
  founder_market_fit_score INTEGER CHECK (founder_market_fit_score BETWEEN 1 AND 5),
  founder_market_fit_notes TEXT,
  unfair_insight TEXT, -- What is their "earned secret"?
  
  asymmetry_wedge_score INTEGER CHECK (asymmetry_wedge_score BETWEEN 1 AND 5),
  asymmetry_wedge_notes TEXT,
  beachhead_customer TEXT, -- Specific customer definition
  wedge_description TEXT, -- Distribution channel, regulatory quirk, workflow insight
  
  evidence_of_pull_score INTEGER CHECK (evidence_of_pull_score BETWEEN 1 AND 5),
  evidence_of_pull_notes TEXT,
  loi_count INTEGER DEFAULT 0,
  pilot_count INTEGER DEFAULT 0,
  discovery_calls_count INTEGER DEFAULT 0,
  
  scale_story_score INTEGER CHECK (scale_story_score BETWEEN 1 AND 5),
  scale_story_notes TEXT,
  path_to_100m TEXT, -- Rough sketch of expansion path
  
  -- Phase 2: Founder Assessment (1-5 scores per trait)
  drive_resilience_score INTEGER CHECK (drive_resilience_score BETWEEN 1 AND 5),
  drive_resilience_notes TEXT,
  
  learning_speed_score INTEGER CHECK (learning_speed_score BETWEEN 1 AND 5),
  learning_speed_notes TEXT,
  
  ownership_candour_score INTEGER CHECK (ownership_candour_score BETWEEN 1 AND 5),
  ownership_candour_notes TEXT,
  
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  focus_notes TEXT,
  
  emotional_stability_score INTEGER CHECK (emotional_stability_score BETWEEN 1 AND 5),
  emotional_stability_notes TEXT,
  
  team_dynamics_score INTEGER CHECK (team_dynamics_score BETWEEN 1 AND 5),
  team_dynamics_notes TEXT,
  
  -- Phase 3: Decision Grid
  overall_founder_score NUMERIC(3,2), -- Average of founder traits (1-5)
  overall_idea_score NUMERIC(3,2), -- Average of idea lens scores (1-5)
  decision_category TEXT CHECK (decision_category IN ('strong_founders_strong_idea', 'strong_founders_weak_idea', 'weak_founders_strong_idea')),
  recommendation TEXT CHECK (recommendation IN ('invest', 'pivot', 'pass', 'de-risk')),
  recommendation_rationale TEXT,
  
  -- Metadata
  evaluation_version TEXT DEFAULT '1.0', -- Framework version
  is_ai_generated BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3,2), -- How confident is the evaluation? (0-1)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_preseed_evaluations_idea_id ON marrai_preseed_evaluations(idea_id);
CREATE INDEX IF NOT EXISTS idx_preseed_evaluations_evaluated_by ON marrai_preseed_evaluations(evaluated_by);
CREATE INDEX IF NOT EXISTS idx_preseed_evaluations_decision_category ON marrai_preseed_evaluations(decision_category);
CREATE INDEX IF NOT EXISTS idx_preseed_evaluations_overall_scores ON marrai_preseed_evaluations(overall_founder_score, overall_idea_score);

-- 2. Extend marrai_ideas with pre-seed specific fields
ALTER TABLE marrai_ideas
ADD COLUMN IF NOT EXISTS beachhead_customer TEXT,
ADD COLUMN IF NOT EXISTS wedge_description TEXT,
ADD COLUMN IF NOT EXISTS unfair_insight TEXT,
ADD COLUMN IF NOT EXISTS loi_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pilot_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discovery_calls_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS path_to_100m TEXT;

-- Comments
COMMENT ON TABLE marrai_preseed_evaluations IS 'Pre-seed evaluation framework scores and notes. Based on Concept Ventures philosophy: founder narrative over metrics.';
COMMENT ON COLUMN marrai_preseed_evaluations.decision_category IS 'Categorizes evaluation: strong_founders_strong_idea (invest), strong_founders_weak_idea (pivot), weak_founders_strong_idea (pass)';
COMMENT ON COLUMN marrai_preseed_evaluations.recommendation IS 'Action recommendation: invest, pivot (refine idea), pass, de-risk (run experiments)';

