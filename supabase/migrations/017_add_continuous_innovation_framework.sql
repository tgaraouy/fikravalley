-- Migration: Add Continuous Innovation Framework (Ash Maurya)
-- Phase 1: MVP - Lean Canvas + Scoring

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Lean Canvas Table
CREATE TABLE IF NOT EXISTS marrai_lean_canvas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  canvas_data JSONB NOT NULL, -- Stores all 9 blocks: problem, solution, key_metrics, uvp, unfair_advantage, channels, customer_segments, cost_structure, revenue_streams
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(idea_id, version)
);

-- 7-Dimension Scores
CREATE TABLE IF NOT EXISTS marrai_canvas_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES marrai_lean_canvas(id) ON DELETE CASCADE,
  clarity_score NUMERIC(3,1) CHECK (clarity_score >= 0 AND clarity_score <= 10),
  desirability_score NUMERIC(3,1) CHECK (desirability_score >= 0 AND desirability_score <= 10),
  viability_score NUMERIC(3,1) CHECK (viability_score >= 0 AND viability_score <= 10),
  feasibility_score NUMERIC(3,1) CHECK (feasibility_score >= 0 AND feasibility_score <= 10),
  timing_score NUMERIC(3,1) CHECK (timing_score >= 0 AND timing_score <= 10),
  defensibility_score NUMERIC(3,1) CHECK (defensibility_score >= 0 AND defensibility_score <= 10),
  mission_alignment_score NUMERIC(3,1) CHECK (mission_alignment_score >= 0 AND mission_alignment_score <= 10),
  overall_score NUMERIC(3,1) GENERATED ALWAYS AS (
    (clarity_score + desirability_score + viability_score + feasibility_score + 
     timing_score + defensibility_score + mission_alignment_score) / 7
  ) STORED,
  scored_by TEXT DEFAULT 'ai', -- 'ai' or 'mentor' or 'founder'
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation Cycles (90-Day Cycles)
CREATE TABLE IF NOT EXISTS marrai_validation_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  cycle_number INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE GENERATED ALWAYS AS (start_date + INTERVAL '90 days') STORED,
  current_week INTEGER DEFAULT 1 CHECK (current_week >= 1 AND current_week <= 12),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  canvas_id UUID REFERENCES marrai_lean_canvas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, cycle_number)
);

-- Experiments
CREATE TABLE IF NOT EXISTS marrai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES marrai_validation_cycles(id) ON DELETE CASCADE,
  week_number INTEGER CHECK (week_number >= 1 AND week_number <= 12),
  experiment_type TEXT NOT NULL, -- 'problem_validation', 'solution_validation', 'demand_validation', 'value_delivery'
  hypothesis TEXT NOT NULL,
  experiment_description TEXT,
  metrics JSONB, -- { "metric_name": "value", "target": "value" }
  result TEXT, -- 'validated', 'invalidated', 'inconclusive'
  learnings TEXT,
  decision TEXT CHECK (decision IN ('persevere', 'pivot', 'pause')),
  canvas_changes JSONB, -- What changed in the canvas as a result
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Weekly Sprint Reviews
CREATE TABLE IF NOT EXISTS marrai_sprint_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES marrai_validation_cycles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  review_date DATE NOT NULL,
  progress_summary TEXT,
  experiments_completed INTEGER DEFAULT 0,
  key_learnings TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('persevere', 'pivot', 'pause')),
  decision_reasoning TEXT,
  next_steps TEXT,
  canvas_version_before INTEGER,
  canvas_version_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(cycle_id, week_number)
);

-- AI Assistant Memory (Vector-Encoded Context)
CREATE TABLE IF NOT EXISTS marrai_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('canvas_change', 'experiment', 'decision', 'learning', 'pivot')),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB, -- { "cycle_id": "...", "week_number": 1, "canvas_version": 1 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lean_canvas_idea_id ON marrai_lean_canvas(idea_id);
CREATE INDEX IF NOT EXISTS idx_lean_canvas_version ON marrai_lean_canvas(idea_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_scores_canvas_id ON marrai_canvas_scores(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_scores_overall ON marrai_canvas_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_validation_cycles_idea_id ON marrai_validation_cycles(idea_id);
CREATE INDEX IF NOT EXISTS idx_validation_cycles_status ON marrai_validation_cycles(status);
CREATE INDEX IF NOT EXISTS idx_validation_cycles_active ON marrai_validation_cycles(idea_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_experiments_cycle_id ON marrai_experiments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_experiments_week_number ON marrai_experiments(cycle_id, week_number);
CREATE INDEX IF NOT EXISTS idx_sprint_reviews_cycle_id ON marrai_sprint_reviews(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_idea_id ON marrai_ai_memory(idea_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON marrai_ai_memory(idea_id, memory_type);

-- Vector similarity index for AI memory (HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_ai_memory_embedding ON marrai_ai_memory 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Update marrai_ideas table
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS active_cycle_id UUID REFERENCES marrai_validation_cycles(id),
ADD COLUMN IF NOT EXISTS current_canvas_id UUID REFERENCES marrai_lean_canvas(id),
ADD COLUMN IF NOT EXISTS canvas_score NUMERIC(3,1); -- Latest overall score

-- Create indexes on marrai_ideas for cycle/canvas lookups
CREATE INDEX IF NOT EXISTS idx_ideas_active_cycle ON marrai_ideas(active_cycle_id) WHERE active_cycle_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ideas_current_canvas ON marrai_ideas(current_canvas_id) WHERE current_canvas_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ideas_canvas_score ON marrai_ideas(canvas_score DESC) WHERE canvas_score IS NOT NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_lean_canvas_updated_at
    BEFORE UPDATE ON marrai_lean_canvas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_cycles_updated_at
    BEFORE UPDATE ON marrai_validation_cycles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get latest canvas for an idea
CREATE OR REPLACE FUNCTION get_latest_canvas(p_idea_id UUID)
RETURNS TABLE (
  id UUID,
  version INTEGER,
  canvas_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT lc.id, lc.version, lc.canvas_data, lc.created_at
  FROM marrai_lean_canvas lc
  WHERE lc.idea_id = p_idea_id
  ORDER BY lc.version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest scores for a canvas
CREATE OR REPLACE FUNCTION get_latest_scores(p_canvas_id UUID)
RETURNS TABLE (
  clarity_score NUMERIC,
  desirability_score NUMERIC,
  viability_score NUMERIC,
  feasibility_score NUMERIC,
  timing_score NUMERIC,
  defensibility_score NUMERIC,
  mission_alignment_score NUMERIC,
  overall_score NUMERIC,
  scored_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cs.clarity_score,
    cs.desirability_score,
    cs.viability_score,
    cs.feasibility_score,
    cs.timing_score,
    cs.defensibility_score,
    cs.mission_alignment_score,
    cs.overall_score,
    cs.scored_at
  FROM marrai_canvas_scores cs
  WHERE cs.canvas_id = p_canvas_id
  ORDER BY cs.scored_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to search AI memory by similarity
CREATE OR REPLACE FUNCTION search_ai_memory(
  p_idea_id UUID,
  p_query_embedding vector(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    am.id,
    am.memory_type,
    am.content,
    am.metadata,
    1 - (am.embedding <=> p_query_embedding) AS similarity,
    am.created_at
  FROM marrai_ai_memory am
  WHERE am.idea_id = p_idea_id
    AND am.embedding IS NOT NULL
  ORDER BY am.embedding <=> p_query_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE marrai_lean_canvas IS 'Stores Lean Canvas versions for each idea (9 blocks: problem, solution, key_metrics, uvp, unfair_advantage, channels, customer_segments, cost_structure, revenue_streams)';
COMMENT ON TABLE marrai_canvas_scores IS 'Scores each canvas across 7 dimensions: clarity, desirability, viability, feasibility, timing, defensibility, mission_alignment';
COMMENT ON TABLE marrai_validation_cycles IS '90-day validation cycles with 12 weekly sprints (Business Model Design → Demand Validation → Value Delivery)';
COMMENT ON TABLE marrai_experiments IS 'Experiments run during validation cycles to test hypotheses';
COMMENT ON TABLE marrai_sprint_reviews IS 'Weekly sprint reviews with Persevere/Pivot/Pause decisions';
COMMENT ON TABLE marrai_ai_memory IS 'Vector-encoded memory for AI assistant context retrieval (RAG)';

