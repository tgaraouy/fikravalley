-- ============================================
-- IDEA CLAIMS & ENGAGEMENT SUPPORT
-- ============================================
-- Tracks when a GenZ (or group) picks up an idea to launch it
-- And provides indexes to support trending / top ideas queries

-- 1) IDEA CLAIMS TABLE

CREATE TABLE IF NOT EXISTS marrai_idea_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,

  -- Basic info about claimer (can be anonymous / group)
  claimer_name TEXT NOT NULL,
  claimer_email TEXT,
  claimer_city TEXT,
  claimer_type TEXT CHECK (claimer_type IN (
    'solo',
    'team',
    'community',
    'university_club',
    'other'
  )) DEFAULT 'solo',

  -- Engagement level in the journey
  engagement_level TEXT CHECK (engagement_level IN (
    'exploring',
    'validating',
    'prototyping',
    'launching'
  )) DEFAULT 'exploring',

  -- Optional context
  motivation TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_idea_claims_idea_id ON marrai_idea_claims(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_claims_created_at ON marrai_idea_claims(created_at DESC);

-- Simple helper view for engagement (claims + receipts + upvotes)
-- This is optional but helps for trending queries

CREATE OR REPLACE VIEW marrai_idea_engagement AS
SELECT
  i.id AS idea_id,
  COALESCE(i.upvote_count, 0) AS upvotes,
  COALESCE(i.receipt_count, 0) AS receipts,
  COALESCE(c.claim_count, 0) AS claims,
  (
    COALESCE(i.upvote_count, 0) * 0.4 +
    COALESCE(i.receipt_count, 0) * 0.3 +
    COALESCE(c.claim_count, 0) * 0.3
  )::NUMERIC(10,2) AS engagement_score
FROM marrai_ideas i
LEFT JOIN (
  SELECT idea_id, COUNT(*)::INT AS claim_count
  FROM marrai_idea_claims
  WHERE deleted_at IS NULL
  GROUP BY idea_id
) c ON c.idea_id = i.id;


