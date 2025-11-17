-- Quick script to add alignment column before running seed_example_ideas.sql
-- Run this FIRST if you haven't run migration 003_add_alignment_field.sql

-- Add alignment column
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS alignment JSONB DEFAULT '{"moroccoPriorities": [], "sdgTags": [], "sdgAutoTagged": false, "sdgConfidence": {}}'::jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_priorities 
  ON marrai_ideas USING gin((alignment->'moroccoPriorities'));

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_sdgs 
  ON marrai_ideas USING gin((alignment->'sdgTags'));

-- Add comment
COMMENT ON COLUMN marrai_ideas.alignment IS 'Strategic alignment: Morocco priorities (primary) and SDG tags (secondary, auto-tagged)';

