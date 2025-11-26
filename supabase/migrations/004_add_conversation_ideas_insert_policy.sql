-- Add INSERT policy for marrai_conversation_ideas
-- This allows API routes to insert conversation ideas without service role key

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow inserts" ON marrai_conversation_ideas;

-- Create INSERT policy
CREATE POLICY "Allow inserts" ON marrai_conversation_ideas
  FOR INSERT
  WITH CHECK (true);

-- Also ensure service role can manage (if using service role key)
DROP POLICY IF EXISTS "Service role can manage conversation ideas" ON marrai_conversation_ideas;
CREATE POLICY "Service role can manage conversation ideas" ON marrai_conversation_ideas
  FOR ALL
  USING (auth.role() = 'service_role');

