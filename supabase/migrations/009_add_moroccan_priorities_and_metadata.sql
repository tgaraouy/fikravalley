-- ============================================
-- Add Moroccan Priorities & Related Metadata
-- ============================================

-- moroccan_priorities: JSONB array of priority codes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'moroccan_priorities'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN moroccan_priorities JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- sdg_alignment: keep SDG alignment but make it secondary (JSONB array)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'sdg_alignment'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN sdg_alignment JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- budget_tier: rough budget requirement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'budget_tier'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN budget_tier TEXT CHECK (budget_tier IN ('<1K', '1K-5K', '5K-10K', '10K+'));
  END IF;
END $$;

-- location_type: urban / rural / both
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'location_type'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN location_type TEXT CHECK (location_type IN ('urban', 'rural', 'both'));
  END IF;
END $$;

-- complexity: skill level for implementation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'complexity'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced'));
  END IF;
END $$;

-- Mentor fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'mentor_1_id'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN mentor_1_id UUID REFERENCES marrai_mentors(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'mentor_2_id'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN mentor_2_id UUID REFERENCES marrai_mentors(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'mentor_1_status'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN mentor_1_status TEXT DEFAULT 'pending' CHECK (mentor_1_status IN ('pending', 'confirmed', 'declined'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'mentor_2_status'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN mentor_2_status TEXT DEFAULT 'pending' CHECK (mentor_2_status IN ('pending', 'confirmed', 'declined'));
  END IF;
END $$;

-- adoption_count: how many teams/people have picked up the idea
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'adoption_count'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN adoption_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ideas_moroccan_priorities ON marrai_ideas USING GIN(moroccan_priorities);
CREATE INDEX IF NOT EXISTS idx_ideas_budget_tier ON marrai_ideas(budget_tier);
CREATE INDEX IF NOT EXISTS idx_ideas_location_type ON marrai_ideas(location_type);
CREATE INDEX IF NOT EXISTS idx_ideas_complexity ON marrai_ideas(complexity);


