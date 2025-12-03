-- ============================================
-- FOUNDER PROFILES & LETTERS
-- ============================================
-- Stores founder profiles with PR/pitch letters
-- Used to build trust, authenticity, competence, and consistency
-- For mentors and VCs interested in helping

CREATE TABLE IF NOT EXISTS marrai_founder_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Founder identifier (email preferred, name as fallback)
  founder_email TEXT,
  founder_name TEXT NOT NULL,
  
  -- Location
  founder_city TEXT,
  
  -- PR/Pitch Letter (free-form text)
  founder_letter TEXT,
  
  -- Additional profile info
  founder_bio TEXT,
  founder_linkedin TEXT,
  founder_website TEXT,
  
  -- Stats (denormalized for quick access)
  total_ideas INTEGER DEFAULT 0,
  created_ideas_count INTEGER DEFAULT 0,
  claimed_ideas_count INTEGER DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_founder_profiles_email ON marrai_founder_profiles(founder_email) WHERE founder_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_founder_profiles_name ON marrai_founder_profiles(founder_name);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_public ON marrai_founder_profiles(is_public) WHERE is_public = true;

-- Unique constraints (using partial indexes for NULL handling)
CREATE UNIQUE INDEX IF NOT EXISTS unique_founder_email ON marrai_founder_profiles(founder_email) WHERE founder_email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_founder_name ON marrai_founder_profiles(founder_name) WHERE founder_name IS NOT NULL;

-- Function to update founder stats
CREATE OR REPLACE FUNCTION update_founder_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stats when ideas are created or claimed
  -- This is called from triggers on marrai_ideas and marrai_idea_claims
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE marrai_founder_profiles IS 'Founder profiles with PR/pitch letters for building trust with mentors and VCs';
COMMENT ON COLUMN marrai_founder_profiles.founder_letter IS 'Free-form PR/pitch letter that builds trust, authenticity, competence, and consistency';

