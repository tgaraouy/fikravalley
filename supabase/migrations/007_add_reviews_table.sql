-- ============================================
-- REVIEWS TABLE
-- ============================================
-- Add reviews/ratings table for ideas

CREATE TABLE IF NOT EXISTS marrai_idea_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars
  title TEXT, -- Optional review title
  review_text TEXT, -- Optional detailed review
  
  -- Review categories
  review_type TEXT CHECK (review_type IN (
    'feasibility', -- How feasible is this idea?
    'impact', -- How impactful would this be?
    'market', -- Market potential
    'technical', -- Technical assessment
    'general' -- General review
  )) DEFAULT 'general',
  
  -- Moderation
  approved BOOLEAN DEFAULT true,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by TEXT,
  
  -- Anonymous reviews (no user_id)
  reviewer_ip TEXT,
  reviewer_user_agent TEXT,
  reviewer_name TEXT -- Optional name for anonymous reviews
);

CREATE INDEX IF NOT EXISTS idx_marrai_idea_reviews_idea_id ON marrai_idea_reviews(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_reviews_user_id ON marrai_idea_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_reviews_approved ON marrai_idea_reviews(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_marrai_idea_reviews_created_at ON marrai_idea_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_reviews_rating ON marrai_idea_reviews(rating);

-- Unique constraint: one review per user per idea (if user_id exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_marrai_idea_reviews_unique_user 
  ON marrai_idea_reviews(idea_id, user_id) 
  WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Add RLS policies
ALTER TABLE marrai_idea_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON marrai_idea_reviews
  FOR SELECT
  USING (approved = true AND deleted_at IS NULL);

-- Policy: Service role can manage all reviews
CREATE POLICY "Service role can manage all reviews"
  ON marrai_idea_reviews
  FOR ALL
  USING (auth.role() = 'service_role');

