-- ============================================
-- GDPR Data Rights Schema
-- ============================================
-- Tables for handling GDPR Articles 17 & 20
-- Right to Erasure and Right to Data Portability

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DELETION REQUESTS TABLE
-- ============================================
-- Tracks user data deletion requests with grace period

CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User requesting deletion
  user_id UUID NOT NULL,
  
  -- Verification
  verification_code TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  
  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  scheduled_deletion_date TIMESTAMP WITH TIME ZONE NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id 
  ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status 
  ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled_date 
  ON deletion_requests(scheduled_deletion_date);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_verification_code 
  ON deletion_requests(verification_code);

-- ============================================
-- EXPORT REQUESTS TABLE
-- ============================================
-- Tracks data export requests with rate limiting

CREATE TABLE IF NOT EXISTS export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User requesting export
  user_id UUID NOT NULL,
  
  -- Verification
  otp TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'failed')),
  
  -- Export format
  format TEXT NOT NULL DEFAULT 'json' CHECK (format IN ('json', 'pdf')),
  
  -- Timing
  completed_at TIMESTAMP WITH TIME ZONE,
  download_count INT DEFAULT 0,
  
  -- Context
  ip_address TEXT,
  user_agent TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_export_requests_user_id 
  ON export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_export_requests_status 
  ON export_requests(status);
CREATE INDEX IF NOT EXISTS idx_export_requests_created_at 
  ON export_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_export_requests_otp 
  ON export_requests(otp);

-- ============================================
-- ADD DELETED_AT TO SECURE_USERS
-- ============================================
-- Soft delete flag for secure_users

ALTER TABLE secure_users 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_secure_users_deleted_at 
  ON secure_users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access deletion_requests
CREATE POLICY "Service role can manage deletion_requests"
  ON deletion_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Only service role can access export_requests
CREATE POLICY "Service role can manage export_requests"
  ON export_requests
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE deletion_requests IS 'GDPR Article 17: Right to erasure requests with 7-day grace period';
COMMENT ON TABLE export_requests IS 'GDPR Article 20: Right to data portability requests with rate limiting';
COMMENT ON COLUMN deletion_requests.verification_code IS 'Code sent to user for verification';
COMMENT ON COLUMN deletion_requests.scheduled_deletion_date IS 'Date when data will actually be deleted (7 days after request)';
COMMENT ON COLUMN deletion_requests.status IS 'pending: waiting for confirmation, confirmed: will be deleted, cancelled: user cancelled, completed: deleted';
COMMENT ON COLUMN export_requests.otp IS 'One-time password for export verification';
COMMENT ON COLUMN export_requests.download_count IS 'Number of times export was downloaded (should be 1)';
COMMENT ON COLUMN secure_users.deleted_at IS 'Soft delete flag - hides user from queries but keeps for audit';

