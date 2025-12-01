-- ============================================
-- Add AI Market Analysis Column
-- ============================================
-- Stores LLM-generated market research and potentiality analysis

-- ai_market_analysis: JSONB for structured market research data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'ai_market_analysis'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN ai_market_analysis JSONB DEFAULT NULL;
  END IF;
END $$;

-- Add GIN index for efficient JSONB queries
CREATE INDEX IF NOT EXISTS idx_ideas_ai_market_analysis 
  ON marrai_ideas USING GIN(ai_market_analysis);

-- Add index on analysis timestamp (if stored in JSONB)
-- This allows filtering by when analysis was performed
CREATE INDEX IF NOT EXISTS idx_ideas_ai_market_analysis_analyzed_at 
  ON marrai_ideas((ai_market_analysis->>'analyzed_at')) 
  WHERE ai_market_analysis IS NOT NULL;

COMMENT ON COLUMN marrai_ideas.ai_market_analysis IS 'LLM-generated market research and potentiality analysis. Structure: { analyzed_at, market_size, competitors, trends, potential, risks, opportunities, sources, confidence_score }';

