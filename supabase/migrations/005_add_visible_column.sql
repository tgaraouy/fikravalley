-- Add visible column to marrai_ideas table
-- Replaces the problematic "public" reserved word column

-- Add visible column if it doesn't exist
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT false;

-- Add index for visible queries
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_visible 
  ON marrai_ideas(visible) WHERE visible = true;

-- Add comment
COMMENT ON COLUMN marrai_ideas.visible IS 'Whether the idea is visible in public search (replaces public column)';

-- If you had a "public" column, you can migrate data:
-- UPDATE marrai_ideas SET visible = "public" WHERE "public" IS NOT NULL;
-- Then drop the old column:
-- ALTER TABLE marrai_ideas DROP COLUMN IF EXISTS "public";

