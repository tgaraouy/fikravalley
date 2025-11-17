-- ============================================
-- Admin Dashboard Schema
-- ============================================
-- Tables for admin functionality

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMIN AUDIT LOG TABLE
-- ============================================
-- Tracks all admin actions for accountability

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action details
  action TEXT NOT NULL, -- 'approve_idea', 'ban_user', 'verify_receipt', etc.
  admin_email TEXT NOT NULL,
  
  -- Target
  target_type TEXT NOT NULL, -- 'idea', 'user', 'receipt', etc.
  target_id TEXT NOT NULL,
  
  -- Details
  details TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- IP address for security
  ip_address TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action 
  ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin 
  ON admin_audit_log(admin_email);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created 
  ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target 
  ON admin_audit_log(target_type, target_id);

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage admin_audit_log"
  ON admin_audit_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- MENTOR MATCHES TABLE
-- ============================================
-- Tracks mentor-idea matches

CREATE TABLE IF NOT EXISTS mentor_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL, -- References mentors table (to be created)
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  matched_by TEXT, -- Admin email
  
  -- Metrics
  success_metrics JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mentor_matches_idea_id 
  ON mentor_matches(idea_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_mentor_id 
  ON mentor_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_matches_status 
  ON mentor_matches(status);

-- Enable RLS
ALTER TABLE mentor_matches ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage mentor_matches"
  ON mentor_matches
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- IDEA UPVOTES TABLE
-- ============================================
-- Tracks upvotes on ideas (if not already exists)

CREATE TABLE IF NOT EXISTS idea_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Anonymous tracking
  ip_address TEXT,
  user_agent TEXT,
  
  -- Prevent duplicate upvotes
  UNIQUE(idea_id, ip_address)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_idea_upvotes_idea_id 
  ON idea_upvotes(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_upvotes_created 
  ON idea_upvotes(created_at DESC);

-- Enable RLS
ALTER TABLE idea_upvotes ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert, service role can read
CREATE POLICY "Public can upvote ideas"
  ON idea_upvotes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read upvotes"
  ON idea_upvotes
  FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================
-- PROBLEM VALIDATIONS TABLE
-- ============================================
-- Tracks "I have this problem too" validations

CREATE TABLE IF NOT EXISTS problem_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- References
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Anonymous tracking
  ip_address TEXT,
  user_agent TEXT,
  
  -- Optional comment
  comment TEXT,
  
  -- Prevent duplicate validations
  UNIQUE(idea_id, ip_address)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_problem_validations_idea_id 
  ON problem_validations(idea_id);
CREATE INDEX IF NOT EXISTS idx_problem_validations_created 
  ON problem_validations(created_at DESC);

-- Enable RLS
ALTER TABLE problem_validations ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert, service role can read
CREATE POLICY "Public can validate problems"
  ON problem_validations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read validations"
  ON problem_validations
  FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE admin_audit_log IS 'Tracks all admin actions for accountability and compliance';
COMMENT ON TABLE mentor_matches IS 'Tracks mentor-idea matches for mentorship program';
COMMENT ON TABLE idea_upvotes IS 'Tracks upvotes on ideas (anonymous)';
COMMENT ON TABLE problem_validations IS 'Tracks "I have this problem too" validations';

