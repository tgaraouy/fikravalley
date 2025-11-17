-- ============================================
-- Privacy Incidents Schema
-- ============================================
-- Tracks privacy breaches and incidents for GDPR compliance

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRIVACY INCIDENTS TABLE
-- ============================================
-- Tracks privacy breaches and incidents

CREATE TABLE IF NOT EXISTS privacy_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Incident details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN (
    'investigating',
    'contained',
    'resolved',
    'closed'
  )),
  
  -- Affected users
  affected_users UUID[] DEFAULT '{}',
  affected_count INT DEFAULT 0,
  
  -- GDPR 72-hour notification requirement
  discovered_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notification_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  notified_at TIMESTAMP WITH TIME ZONE,
  notified_to TEXT[], -- Regulatory bodies notified
  
  -- Remediation
  remediation_steps TEXT[],
  notes TEXT,
  
  -- Tracking
  created_by TEXT NOT NULL,
  updated_by TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_status 
  ON privacy_incidents(status);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_severity 
  ON privacy_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_notification_deadline 
  ON privacy_incidents(notification_deadline);
CREATE INDEX IF NOT EXISTS idx_privacy_incidents_created_at 
  ON privacy_incidents(created_at);

-- Enable RLS
ALTER TABLE privacy_incidents ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage privacy_incidents"
  ON privacy_incidents
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE privacy_incidents IS 'Tracks privacy breaches and incidents for GDPR compliance';
COMMENT ON COLUMN privacy_incidents.notification_deadline IS 'GDPR requires notification within 72 hours of discovery';
COMMENT ON COLUMN privacy_incidents.affected_users IS 'Array of user IDs affected by the incident';
COMMENT ON COLUMN privacy_incidents.notified_to IS 'Regulatory bodies that were notified (e.g., CNDP, CNIL)';

