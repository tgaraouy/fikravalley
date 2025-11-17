-- ============================================
-- Privacy-First User Storage Schema
-- ============================================
-- Run this in Supabase SQL Editor
-- Creates tables for encrypted user storage and audit logging

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SECURE USERS TABLE
-- ============================================
-- Stores encrypted user data with phone number hashing

CREATE TABLE IF NOT EXISTS secure_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Phone number (bcrypt hash, one-way)
  phone_hash TEXT NOT NULL,
  
  -- Encrypted name (AES-256-GCM)
  encrypted_name TEXT NOT NULL,
  name_iv TEXT NOT NULL, -- Initialization vector
  name_tag TEXT NOT NULL, -- Authentication tag
  
  -- Anonymous email
  anonymous_email TEXT NOT NULL UNIQUE,
  
  -- Consent information
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Data retention
  data_retention_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Indexes for performance
  CONSTRAINT secure_users_phone_hash_unique UNIQUE (phone_hash)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_secure_users_retention_expiry 
  ON secure_users(data_retention_expiry);
CREATE INDEX IF NOT EXISTS idx_secure_users_anonymous_email 
  ON secure_users(anonymous_email);
CREATE INDEX IF NOT EXISTS idx_secure_users_created_at 
  ON secure_users(created_at);

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================
-- Never delete audit logs - permanent record of all data access

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User being accessed
  user_id UUID NOT NULL,
  
  -- Action performed
  action TEXT NOT NULL, -- e.g., 'user_created', 'user_data_accessed', 'user_data_deleted'
  
  -- Who performed the action
  actor TEXT NOT NULL, -- 'system', user_id, admin_id, etc.
  
  -- Timestamp (can be different from created_at for historical imports)
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Additional metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action 
  ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp 
  ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor 
  ON audit_logs(actor);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Enable RLS for both tables

ALTER TABLE secure_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access secure_users
-- Adjust these policies based on your access control needs
CREATE POLICY "Service role can manage secure_users"
  ON secure_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Only service role can access audit_logs
CREATE POLICY "Service role can manage audit_logs"
  ON audit_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Enable RLS for consents
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access consents
CREATE POLICY "Service role can manage consents"
  ON consents
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- CONSENTS TABLE
-- ============================================
-- GDPR-compliant consent records (immutable)

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference
  user_id UUID NOT NULL,
  
  -- Phone hash for lookup (bcrypt, same as secure_users)
  phone_hash TEXT NOT NULL,
  
  -- Consent details
  consent_type TEXT NOT NULL CHECK (consent_type IN ('submission', 'marketing', 'analysis', 'data_retention')),
  granted BOOLEAN NOT NULL,
  
  -- Policy version tracking
  consent_version TEXT NOT NULL DEFAULT '1.0.0',
  
  -- How consent was given
  consent_method TEXT NOT NULL CHECK (consent_method IN ('whatsapp', 'web', 'email', 'phone', 'in_person', 'other')),
  
  -- GDPR Article 7: Must be able to prove consent
  -- Store context of consent (IP, user agent, etc.)
  ip_address TEXT,
  user_agent TEXT,
  
  -- Optional expiry date
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for consents
CREATE INDEX IF NOT EXISTS idx_consents_user_id 
  ON consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_phone_hash 
  ON consents(phone_hash);
CREATE INDEX IF NOT EXISTS idx_consents_type 
  ON consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_consents_created_at 
  ON consents(created_at);
CREATE INDEX IF NOT EXISTS idx_consents_user_type 
  ON consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_consents_expires_at 
  ON consents(expires_at) WHERE expires_at IS NOT NULL;

-- Foreign key to secure_users (optional, for referential integrity)
-- ALTER TABLE consents ADD CONSTRAINT fk_consents_user_id 
--   FOREIGN KEY (user_id) REFERENCES secure_users(id) ON DELETE CASCADE;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on secure_users
CREATE TRIGGER update_secure_users_updated_at
  BEFORE UPDATE ON secure_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE secure_users IS 'Encrypted user data storage with phone number hashing';
COMMENT ON TABLE consents IS 'GDPR-compliant consent records - immutable (never update, only add new)';
COMMENT ON TABLE audit_logs IS 'Permanent audit trail of all data access - never delete';
COMMENT ON COLUMN secure_users.phone_hash IS 'bcrypt hash of phone number (one-way, never store plain phone)';
COMMENT ON COLUMN secure_users.encrypted_name IS 'AES-256-GCM encrypted name';
COMMENT ON COLUMN secure_users.name_iv IS 'Initialization vector for name encryption';
COMMENT ON COLUMN secure_users.name_tag IS 'Authentication tag for name encryption';
COMMENT ON COLUMN secure_users.anonymous_email IS 'Anonymous email: {uuid}@anonymous.fikravalley.com';
COMMENT ON COLUMN secure_users.data_retention_expiry IS 'Date when user data should be automatically deleted';
COMMENT ON COLUMN consents.consent_version IS 'Policy version at time of consent - used to detect when re-consent is needed';
COMMENT ON COLUMN consents.consent_method IS 'How consent was given (whatsapp, web, email, etc.)';
COMMENT ON COLUMN consents.ip_address IS 'IP address when consent was given (for GDPR Article 7 compliance)';
COMMENT ON COLUMN consents.user_agent IS 'User agent when consent was given (for GDPR Article 7 compliance)';
COMMENT ON COLUMN consents.granted IS 'True if consent granted, false if denied/withdrawn';

