-- ============================================
-- Migration: Add Tracking Code and Verification
-- ============================================
-- Adds tracking_code to ideas and verification system

-- ============================================
-- ADD TRACKING CODE TO IDEAS
-- ============================================

ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_tracking_code ON marrai_ideas(tracking_code);

-- Create index for email lookups (for "my ideas" page)
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_submitter_email ON marrai_ideas(submitter_email);

-- Create index for phone lookups
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_submitter_phone ON marrai_ideas(submitter_phone) WHERE submitter_phone IS NOT NULL;

-- ============================================
-- VERIFICATION TOKENS TABLE
-- ============================================
-- For email/SMS verification links

CREATE TABLE IF NOT EXISTS marrai_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- What we're verifying
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('email', 'sms', 'ownership_claim')),
  
  -- Contact info
  email TEXT,
  phone TEXT,
  
  -- Token
  token TEXT NOT NULL UNIQUE, -- 6-digit code or UUID
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON marrai_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_idea_id ON marrai_verification_tokens(idea_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON marrai_verification_tokens(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verification_tokens_phone ON marrai_verification_tokens(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON marrai_verification_tokens(expires_at);

-- ============================================
-- FUNCTION: Generate Tracking Code
-- ============================================

CREATE OR REPLACE FUNCTION generate_tracking_code(category TEXT)
RETURNS TEXT AS $$
DECLARE
  category_code TEXT;
  random_word TEXT;
  sequence_num INT;
  code TEXT;
BEGIN
  -- Map category to code
  category_code := CASE LOWER(category)
    WHEN 'education' THEN 'EDU'
    WHEN 'health' THEN 'HLT'
    WHEN 'tech' THEN 'TEC'
    WHEN 'finance' THEN 'FIN'
    WHEN 'food' THEN 'FOOD'
    WHEN 'agriculture' THEN 'AGR'
    WHEN 'tourism' THEN 'TRS'
    ELSE 'OTH'
  END;
  
  -- Random word from bank
  random_word := (ARRAY['SMIT', 'KHBZ', 'MA', 'BIN', 'DDAR', 'CLE', 'IDEA', 'STEP'])[
    FLOOR(RANDOM() * 8 + 1)
  ];
  
  -- Get next sequence number for this category
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_code FROM '(\d+)$') AS INT)), 0) + 1
  INTO sequence_num
  FROM marrai_ideas
  WHERE tracking_code LIKE 'FKR-' || category_code || '-%';
  
  -- Generate code
  code := 'FKR-' || category_code || '-' || random_word || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate tracking code
-- ============================================

CREATE OR REPLACE FUNCTION set_tracking_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_code IS NULL THEN
    NEW.tracking_code := generate_tracking_code(COALESCE(NEW.category, 'other'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_tracking_code ON marrai_ideas;
CREATE TRIGGER trigger_set_tracking_code
  BEFORE INSERT ON marrai_ideas
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_code();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Verification tokens: public can read unexpired tokens
ALTER TABLE marrai_verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read unexpired tokens"
  ON marrai_verification_tokens
  FOR SELECT
  USING (expires_at > NOW());

-- Service role can manage all tokens
CREATE POLICY "Service role can manage tokens"
  ON marrai_verification_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

