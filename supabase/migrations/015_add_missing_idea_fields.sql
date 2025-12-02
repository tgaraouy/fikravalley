-- ============================================
-- ADD MISSING FIELDS TO marrai_ideas TABLE
-- ============================================
-- Adds fields that are referenced in the codebase but missing from the table

-- Add funding_status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'funding_status'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN funding_status TEXT CHECK (funding_status IN (
        'draft',
        'seeking_funding',
        'funded',
        'launched',
        'completed',
        'paused'
      ));
  END IF;
END $$;

-- Add has_receipts column (boolean flag for whether idea has receipts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'has_receipts'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN has_receipts BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add target_audience column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'target_audience'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN target_audience TEXT;
  END IF;
END $$;

-- Add adoption_count column (tracks how many times idea was adopted/claimed)
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

-- Add visible column if it doesn't exist (replaces 'public' column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'visible'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN visible BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add pre-seed fields (from migration 014, but adding here for safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'beachhead_customer'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN beachhead_customer TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'wedge_description'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN wedge_description TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'unfair_insight'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN unfair_insight TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'loi_count'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN loi_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'pilot_count'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN pilot_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'discovery_calls_count'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN discovery_calls_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'path_to_100m'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN path_to_100m TEXT;
  END IF;
END $$;

-- Create index on funding_status
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_funding_status 
  ON marrai_ideas(funding_status) 
  WHERE funding_status IS NOT NULL;

-- Create index on has_receipts
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_has_receipts 
  ON marrai_ideas(has_receipts) 
  WHERE has_receipts = true;

-- Create index on adoption_count
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_adoption_count 
  ON marrai_ideas(adoption_count DESC);

-- Update has_receipts based on existing receipts
UPDATE marrai_ideas
SET has_receipts = true
WHERE id IN (
  SELECT DISTINCT idea_id 
  FROM marrai_idea_receipts
);

-- Update adoption_count based on existing claims
UPDATE marrai_ideas
SET adoption_count = (
  SELECT COUNT(*) 
  FROM marrai_idea_claims 
  WHERE marrai_idea_claims.idea_id = marrai_ideas.id
);

-- Comments
COMMENT ON COLUMN marrai_ideas.funding_status IS 'Current funding status: draft, seeking_funding, funded, launched, completed, paused';
COMMENT ON COLUMN marrai_ideas.has_receipts IS 'Boolean flag indicating if idea has validation receipts';
COMMENT ON COLUMN marrai_ideas.target_audience IS 'Description of target audience for the idea';
COMMENT ON COLUMN marrai_ideas.adoption_count IS 'Number of times this idea has been claimed/adopted by users';

-- Add deleted_at column if it doesn't exist (for soft deletes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'marrai_ideas'
      AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE marrai_ideas
      ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create index on deleted_at for soft delete queries
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_deleted_at 
  ON marrai_ideas(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- Note: submitter_phone_hash doesn't exist - the column is actually submitter_phone
-- If you need phone_hash, it should be stored separately or computed

