-- Add alignment field to marrai_ideas table
-- Stores Morocco priorities and auto-tagged SDGs

-- Add alignment JSONB column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_ideas' 
    AND column_name = 'alignment'
  ) THEN
    ALTER TABLE marrai_ideas 
    ADD COLUMN alignment JSONB DEFAULT '{
      "moroccoPriorities": [],
      "sdgTags": [],
      "sdgAutoTagged": false,
      "sdgConfidence": {}
    }'::jsonb;
  END IF;
END $$;

-- Add index for alignment queries
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_priorities 
  ON marrai_ideas USING gin((alignment->'moroccoPriorities'));

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_sdgs 
  ON marrai_ideas USING gin((alignment->'sdgTags'));

-- Add comment
COMMENT ON COLUMN marrai_ideas.alignment IS 'Strategic alignment: Morocco priorities (primary) and SDG tags (secondary, auto-tagged)';

