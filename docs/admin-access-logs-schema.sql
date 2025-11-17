-- ============================================
-- Admin Access Logs Schema
-- ============================================
-- Tracks all admin access to sensitive user data
-- Required for GDPR transparency and audit compliance

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMIN ACCESS LOGS TABLE
-- ============================================
-- Logs every access to sensitive user data by admins

CREATE TABLE IF NOT EXISTS admin_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Admin who accessed data
  admin_id TEXT NOT NULL, -- Admin email or ID
  
  -- User whose data was accessed (null for bulk operations)
  user_id UUID,
  
  -- Action performed
  action TEXT NOT NULL, -- e.g., 'user_detail_viewed', 'user_data_deleted', 'retention_extended'
  
  -- Reason for access (required for transparency)
  reason TEXT NOT NULL,
  
  -- Context (IP, user agent)
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp of access
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Additional metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for admin access logs
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin_id 
  ON admin_access_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_user_id 
  ON admin_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_action 
  ON admin_access_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_timestamp 
  ON admin_access_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_access_logs_admin_user 
  ON admin_access_logs(admin_id, user_id);

-- Enable RLS
ALTER TABLE admin_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access admin access logs
CREATE POLICY "Service role can manage admin_access_logs"
  ON admin_access_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE admin_access_logs IS 'Logs all admin access to sensitive user data - required for GDPR transparency';
COMMENT ON COLUMN admin_access_logs.admin_id IS 'Admin email or ID who accessed data';
COMMENT ON COLUMN admin_access_logs.user_id IS 'User whose data was accessed (null for bulk operations)';
COMMENT ON COLUMN admin_access_logs.action IS 'Action performed (user_detail_viewed, user_data_deleted, etc.)';
COMMENT ON COLUMN admin_access_logs.reason IS 'Reason for access - visible to user for transparency';
COMMENT ON COLUMN admin_access_logs.ip_address IS 'IP address when access occurred';
COMMENT ON COLUMN admin_access_logs.user_agent IS 'User agent when access occurred';
COMMENT ON COLUMN admin_access_logs.metadata IS 'Additional context (password required, days extended, etc.)';

