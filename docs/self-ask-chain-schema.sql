-- ============================================
-- Self-Ask Chain Schema
-- ============================================
-- Stores questions and responses for WhatsApp idea refinement

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SELF ASK QUESTIONS TABLE
-- ============================================
-- Tracks which questions have been asked

CREATE TABLE IF NOT EXISTS self_ask_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Idea reference
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Question details
  question_id TEXT NOT NULL, -- 'q1', 'q2', etc.
  question_order INT NOT NULL,
  question_text TEXT NOT NULL, -- Darija version
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'asked' CHECK (status IN ('asked', 'answered', 'skipped')),
  asked_at TIMESTAMP WITH TIME ZONE,
  answered_at TIMESTAMP WITH TIME ZONE,
  
  -- Follow-up tracking
  follow_up_count INT DEFAULT 0,
  last_follow_up_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_self_ask_questions_idea_id 
  ON self_ask_questions(idea_id);
CREATE INDEX IF NOT EXISTS idx_self_ask_questions_status 
  ON self_ask_questions(status);
CREATE INDEX IF NOT EXISTS idx_self_ask_questions_idea_status 
  ON self_ask_questions(idea_id, status);

-- Enable RLS
ALTER TABLE self_ask_questions ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage self_ask_questions"
  ON self_ask_questions
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SELF ASK RESPONSES TABLE
-- ============================================
-- Stores user responses with extracted data

CREATE TABLE IF NOT EXISTS self_ask_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  
  -- Original response
  original_text TEXT NOT NULL, -- Original Darija/French/Arabic
  
  -- Extracted structured data
  extracted_data JSONB DEFAULT '{}'::jsonb,
  
  -- Entities extracted
  entities JSONB DEFAULT '{}'::jsonb, -- {prices: [], names: [], locations: [], numbers: []}
  
  -- Analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence NUMERIC(3,2) DEFAULT 0.5, -- 0.00 to 1.00
  
  -- Metadata
  language_detected TEXT, -- 'darija', 'french', 'arabic', 'mixed'
  processing_notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_self_ask_responses_idea_id 
  ON self_ask_responses(idea_id);
CREATE INDEX IF NOT EXISTS idx_self_ask_responses_question_id 
  ON self_ask_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_self_ask_responses_idea_question 
  ON self_ask_responses(idea_id, question_id);
CREATE INDEX IF NOT EXISTS idx_self_ask_responses_confidence 
  ON self_ask_responses(confidence);

-- Enable RLS
ALTER TABLE self_ask_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage self_ask_responses"
  ON self_ask_responses
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE self_ask_questions IS 'Tracks questions asked during self-ask chain';
COMMENT ON TABLE self_ask_responses IS 'Stores user responses with NLP-extracted data';
COMMENT ON COLUMN self_ask_responses.extracted_data IS 'Structured data parsed from response (varies by question type)';
COMMENT ON COLUMN self_ask_responses.entities IS 'Extracted entities: prices, names, locations, numbers';
COMMENT ON COLUMN self_ask_responses.confidence IS 'Confidence score 0-1 for response quality';

