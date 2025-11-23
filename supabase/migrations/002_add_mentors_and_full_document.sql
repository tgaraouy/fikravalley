-- ============================================
-- Migration: Add Mentors Table and Full Document Support
-- ============================================
-- Adds mentors table and full_document JSONB column to ideas
-- Supabase supports documents via JSONB columns

-- ============================================
-- MENTORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT, -- Current location
  moroccan_city TEXT, -- Origin city in Morocco
  
  -- Expertise
  expertise TEXT[] DEFAULT '{}', -- ['healthcare', 'education', 'tech', 'finance']
  skills TEXT[] DEFAULT '{}', -- Specific technical skills
  years_experience INT,
  current_role TEXT, -- Current job title/role
  company TEXT,
  bio TEXT, -- Mentor biography
  
  -- Engagement preferences
  willing_to_mentor BOOLEAN DEFAULT false,
  willing_to_cofund BOOLEAN DEFAULT false,
  max_cofund_amount NUMERIC(10,2), -- Maximum co-funding amount in EUR
  available_hours_per_month INT,
  
  -- Workshop/community participation
  attended_kenitra BOOLEAN DEFAULT false,
  mgl_member BOOLEAN DEFAULT false,
  chapter TEXT, -- health, education, innovation, women, etc.
  
  -- Stats (updated via triggers)
  ideas_matched INT DEFAULT 0,
  ideas_funded INT DEFAULT 0,
  total_cofunded_eur NUMERIC(10,2) DEFAULT 0,
  
  -- Additional metadata
  linkedin_url TEXT,
  website_url TEXT,
  languages TEXT[] DEFAULT '{}', -- Languages spoken
  timezone TEXT
);

-- Indexes for mentors
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_email ON marrai_mentors(email);
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_willing_to_mentor ON marrai_mentors(willing_to_mentor) WHERE willing_to_mentor = true;
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_expertise ON marrai_mentors USING gin(expertise);
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_location ON marrai_mentors(location);
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_moroccan_city ON marrai_mentors(moroccan_city);

-- ============================================
-- MENTOR MATCHES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_mentor_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES marrai_mentors(id) ON DELETE CASCADE,
  
  -- Matching details
  match_score NUMERIC(3,2), -- 0.00 to 1.00
  match_reason TEXT, -- Why this mentor was matched
  matched_by TEXT, -- admin_id or 'auto' for AI matching
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'
  )),
  mentor_response TEXT, -- Mentor's response message
  mentor_responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement tracking
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN, -- true if mentorship led to funding/success
  
  -- Notes
  admin_notes TEXT,
  mentor_notes TEXT,
  
  -- Unique constraint: one match per idea-mentor pair
  CONSTRAINT unique_idea_mentor_match UNIQUE (idea_id, mentor_id)
);

-- Indexes for mentor matches
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_idea_id ON marrai_mentor_matches(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_mentor_id ON marrai_mentor_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_status ON marrai_mentor_matches(status);
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_match_score ON marrai_mentor_matches(match_score DESC);

-- ============================================
-- ADD FULL DOCUMENT SUPPORT TO IDEAS
-- ============================================
-- Supabase supports documents via JSONB columns
-- This allows storing complete structured documents for each idea

ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS full_document JSONB;

-- Index for full_document queries (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_full_document ON marrai_ideas USING gin(full_document);

-- Add comment explaining the column
COMMENT ON COLUMN marrai_ideas.full_document IS 'Complete structured document for the idea. Can store agent outputs, analysis results, validation data, and any other structured information as JSON.';

-- ============================================
-- TRIGGERS FOR MENTOR STATS
-- ============================================

-- Function to update mentor stats when matches are created/updated
CREATE OR REPLACE FUNCTION update_mentor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment ideas_matched when new match is created
    UPDATE marrai_mentors
    SET ideas_matched = ideas_matched + 1
    WHERE id = NEW.mentor_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update ideas_funded and total_cofunded_eur when status changes
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.success = true THEN
      UPDATE marrai_mentors
      SET 
        ideas_funded = ideas_funded + 1,
        total_cofunded_eur = total_cofunded_eur + COALESCE(NEW.match_score * 1000, 0) -- Example calculation
      WHERE id = NEW.mentor_id;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update mentor stats
DROP TRIGGER IF EXISTS trigger_update_mentor_stats ON marrai_mentor_matches;
CREATE TRIGGER trigger_update_mentor_stats
  AFTER INSERT OR UPDATE ON marrai_mentor_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on mentors table
ALTER TABLE marrai_mentors ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active mentors (willing to mentor)
CREATE POLICY "Public can read active mentors"
  ON marrai_mentors
  FOR SELECT
  USING (willing_to_mentor = true AND deleted_at IS NULL);

-- Policy: Service role can manage all mentors
CREATE POLICY "Service role can manage mentors"
  ON marrai_mentors
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable RLS on mentor_matches table
ALTER TABLE marrai_mentor_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active matches
CREATE POLICY "Public can read active matches"
  ON marrai_mentor_matches
  FOR SELECT
  USING (status IN ('active', 'completed'));

-- Policy: Service role can manage all matches
CREATE POLICY "Service role can manage mentor matches"
  ON marrai_mentor_matches
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE marrai_mentors IS 'Mentor profiles for matching with ideas. Mentors can provide guidance, co-funding, or both.';
COMMENT ON TABLE marrai_mentor_matches IS 'Matches between ideas and mentors. Tracks the matching process, mentor responses, and outcomes.';
COMMENT ON COLUMN marrai_ideas.full_document IS 'Complete structured document (JSONB) for the idea. Stores agent outputs, analysis, validation data, and any structured information. Supabase JSONB supports full document storage and querying.';

