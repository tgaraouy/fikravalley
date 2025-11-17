-- ============================================
-- Add Follow-up Tracking Fields to Ideas
-- ============================================
-- Migration: 004_add_followup_tracking.sql
-- Adds fields to track follow-up communication with idea submitters

-- Add follow-up tracking columns to marrai_ideas
ALTER TABLE marrai_ideas
ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_method TEXT CHECK (contact_method IN ('email', 'whatsapp', 'phone', 'in_person')),
ADD COLUMN IF NOT EXISTS follow_up_status TEXT DEFAULT 'pending' CHECK (follow_up_status IN (
  'pending',           -- Not yet contacted
  'contacted',         -- Initial contact made
  'responded',         -- Submitter responded
  'no_response',       -- No response after follow-up
  'declined',          -- Submitter declined further contact
  'completed'          -- Follow-up completed successfully
)),
ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS follow_up_notes TEXT,
ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_marrai_ideas_follow_up_status 
ON marrai_ideas(follow_up_status) 
WHERE follow_up_status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_next_follow_up_date 
ON marrai_ideas(next_follow_up_date) 
WHERE next_follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_last_contacted_at 
ON marrai_ideas(last_contacted_at) 
WHERE last_contacted_at IS NOT NULL;

-- Add comment
COMMENT ON COLUMN marrai_ideas.last_contacted_at IS 'Timestamp of last contact attempt with submitter';
COMMENT ON COLUMN marrai_ideas.contact_method IS 'Method used for last contact (email, whatsapp, phone, in_person)';
COMMENT ON COLUMN marrai_ideas.follow_up_status IS 'Current status of follow-up communication';
COMMENT ON COLUMN marrai_ideas.next_follow_up_date IS 'Scheduled date for next follow-up attempt';
COMMENT ON COLUMN marrai_ideas.follow_up_notes IS 'Internal notes about follow-up communication';
COMMENT ON COLUMN marrai_ideas.contact_attempts IS 'Number of contact attempts made';

