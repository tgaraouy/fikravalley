-- Add visible column and update existing ideas
-- Run this in Supabase SQL Editor

-- Step 1: Add visible column if it doesn't exist
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT false;

-- Step 2: Create index for visible queries
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_visible 
  ON marrai_ideas(visible) WHERE visible = true;

-- Step 3: Update all existing ideas to be visible
UPDATE marrai_ideas 
SET visible = true;

-- Or update only the example ideas:
-- UPDATE marrai_ideas 
-- SET visible = true 
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- );

-- Step 4: Verify the update
SELECT 
  id,
  title,
  visible,
  status,
  qualification_tier
FROM marrai_ideas
ORDER BY created_at DESC
LIMIT 10;

