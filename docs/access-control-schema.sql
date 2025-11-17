-- Fikra Labs Access Control Database Schema
-- Run this in your Supabase SQL editor

-- Access Requests Table
CREATE TABLE IF NOT EXISTS marrai_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN (
    'workshop_attendee',
    'student',
    'professional',
    'diaspora',
    'government',
    'entrepreneur',
    'other'
  )),
  reason TEXT NOT NULL,
  how_heard TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  activation_token TEXT,
  activation_expires_at TIMESTAMP,
  activated_at TIMESTAMP,
  UNIQUE(email, status) WHERE status = 'pending'
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON marrai_access_requests(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON marrai_access_requests(status);
CREATE INDEX IF NOT EXISTS idx_access_requests_created_at ON marrai_access_requests(created_at DESC);

-- Workshop Codes Table (for workshop participant verification)
CREATE TABLE IF NOT EXISTS marrai_workshop_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  workshop_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workshop_codes_code ON marrai_workshop_codes(code);
CREATE INDEX IF NOT EXISTS idx_workshop_codes_workshop_id ON marrai_workshop_codes(workshop_id);

-- Add visibility column to ideas table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_ideas' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE marrai_ideas 
    ADD COLUMN visibility TEXT DEFAULT 'workshop' 
    CHECK (visibility IN ('public', 'workshop', 'private'));
  END IF;
END $$;

-- RLS Policies (Row Level Security)
-- Enable RLS on access_requests
ALTER TABLE marrai_access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own access requests"
  ON marrai_access_requests
  FOR SELECT
  USING (auth.uid()::text = email OR auth.jwt() ->> 'role' = 'admin');

-- Policy: Anyone can create access requests
CREATE POLICY "Anyone can create access requests"
  ON marrai_access_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can update access requests
CREATE POLICY "Admins can update access requests"
  ON marrai_access_requests
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Enable RLS on workshop_codes
ALTER TABLE marrai_workshop_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view/manage workshop codes
CREATE POLICY "Admins can manage workshop codes"
  ON marrai_workshop_codes
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

