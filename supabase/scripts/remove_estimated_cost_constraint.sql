-- Remove estimated_cost CHECK constraint if it exists
-- This constraint may have been added from an old schema

DO $$
BEGIN
  -- Drop the constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'marrai_ideas'::regclass 
    AND conname = 'marrai_ideas_estimated_cost_check'
  ) THEN
    ALTER TABLE marrai_ideas 
    DROP CONSTRAINT marrai_ideas_estimated_cost_check;
    
    RAISE NOTICE 'Constraint marrai_ideas_estimated_cost_check removed';
  ELSE
    RAISE NOTICE 'Constraint marrai_ideas_estimated_cost_check does not exist';
  END IF;
END $$;

