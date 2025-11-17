-- ============================================
-- WhatsApp Conversations Schema
-- ============================================
-- Stores encrypted conversation state for WhatsApp privacy handler

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WHATSAPP CONVERSATIONS TABLE
-- ============================================
-- Stores conversation state with encrypted data

CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User reference (nullable until user created)
  user_id UUID,
  
  -- Phone hash for lookup (bcrypt)
  phone_hash TEXT NOT NULL,
  
  -- Conversation stage
  stage TEXT NOT NULL CHECK (stage IN (
    'need_consent',
    'collecting_name',
    'collecting_problem',
    'collecting_location',
    'collecting_analysis_consent',
    'collecting_retention',
    'completed',
    'deletion_requested',
    'export_requested',
    'help_requested',
    'stopped'
  )),
  
  -- Encrypted conversation data (AES-256-GCM)
  encrypted_data TEXT NOT NULL,
  data_iv TEXT NOT NULL,
  data_tag TEXT NOT NULL,
  
  -- Tracking
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INT DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone_hash 
  ON whatsapp_conversations(phone_hash);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_user_id 
  ON whatsapp_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_stage 
  ON whatsapp_conversations(stage);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_updated_at 
  ON whatsapp_conversations(updated_at);

-- Enable RLS
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access
CREATE POLICY "Service role can manage whatsapp_conversations"
  ON whatsapp_conversations
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE whatsapp_conversations IS 'Encrypted WhatsApp conversation state for privacy-compliant data collection';
COMMENT ON COLUMN whatsapp_conversations.phone_hash IS 'bcrypt hash of phone number (never store plain phone)';
COMMENT ON COLUMN whatsapp_conversations.encrypted_data IS 'AES-256-GCM encrypted conversation data (name, problem, etc.)';
COMMENT ON COLUMN whatsapp_conversations.data_iv IS 'Initialization vector for data encryption';
COMMENT ON COLUMN whatsapp_conversations.data_tag IS 'Authentication tag for data encryption';
COMMENT ON COLUMN whatsapp_conversations.stage IS 'Current conversation stage (need_consent, collecting_name, etc.)';

