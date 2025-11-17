-- ============================================
-- MarrAI Idea Bank - Complete Database Schema
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- Comprehensive schema for idea bank with scoring, receipts, funding, mentors, and privacy

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption functions

-- ============================================
-- DROP EXISTING NON-PREFIXED TABLES (if they exist)
-- ============================================
-- Run this section first if you have existing tables without marrai_ prefix
-- WARNING: This will delete all data in these tables!

-- DROP existing tables if they exist (in reverse dependency order)
DROP VIEW IF EXISTS idea_scores CASCADE; -- View (if exists)
DROP VIEW IF EXISTS marrai_idea_scores CASCADE; -- View (if exists)
DROP TABLE IF EXISTS marrai_problem_validations CASCADE;
DROP TABLE IF EXISTS marrai_idea_comments CASCADE;
DROP TABLE IF EXISTS marrai_idea_upvotes CASCADE;
DROP TABLE IF EXISTS marrai_funding_applications CASCADE;
DROP TABLE IF EXISTS marrai_self_ask_responses CASCADE;
DROP TABLE IF EXISTS marrai_self_ask_questions CASCADE;
DROP TABLE IF EXISTS marrai_idea_receipts CASCADE;
DROP TABLE IF EXISTS marrai_decision_scores CASCADE;
DROP TABLE IF EXISTS marrai_clarity_scores CASCADE;
DROP TABLE IF EXISTS marrai_mentor_matches CASCADE;
DROP TABLE IF EXISTS marrai_mentors CASCADE;
DROP TABLE IF EXISTS marrai_export_requests CASCADE;
DROP TABLE IF EXISTS marrai_deletion_requests CASCADE;
DROP TABLE IF EXISTS marrai_consents CASCADE;
DROP TABLE IF EXISTS marrai_admin_actions CASCADE;
DROP TABLE IF EXISTS marrai_audit_logs CASCADE;
DROP TABLE IF EXISTS marrai_secure_users CASCADE;
-- Also drop old non-prefixed tables if they exist
DROP TABLE IF EXISTS problem_validations CASCADE;
DROP TABLE IF EXISTS idea_comments CASCADE;
DROP TABLE IF EXISTS idea_upvotes CASCADE;
DROP TABLE IF EXISTS funding_applications CASCADE;
DROP TABLE IF EXISTS self_ask_responses CASCADE;
DROP TABLE IF EXISTS self_ask_questions CASCADE;
DROP TABLE IF EXISTS idea_receipts CASCADE;
DROP TABLE IF EXISTS decision_scores CASCADE;
DROP TABLE IF EXISTS clarity_scores CASCADE;
DROP TABLE IF EXISTS mentor_matches CASCADE;
DROP TABLE IF EXISTS mentors CASCADE;
DROP TABLE IF EXISTS export_requests CASCADE;
DROP TABLE IF EXISTS deletion_requests CASCADE;
DROP TABLE IF EXISTS consents CASCADE;
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS secure_users CASCADE;
-- Note: marrai_ideas should already exist and be kept

-- ============================================
-- USERS (Privacy-First)
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_secure_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Privacy-first storage
  phone_hash TEXT NOT NULL UNIQUE, -- bcrypt hash (one-way)
  encrypted_name TEXT NOT NULL, -- AES-256-GCM encrypted
  name_iv TEXT NOT NULL, -- Initialization vector
  name_tag TEXT NOT NULL, -- Authentication tag
  anonymous_email TEXT NOT NULL UNIQUE, -- {uuid}@anonymous.fikravalley.com
  
  -- Consent & retention
  consent BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  data_retention_expiry TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_marrai_secure_users_phone_hash ON marrai_secure_users(phone_hash);
CREATE INDEX IF NOT EXISTS idx_marrai_secure_users_retention_expiry ON marrai_secure_users(data_retention_expiry);
CREATE INDEX IF NOT EXISTS idx_marrai_secure_users_anonymous_email ON marrai_secure_users(anonymous_email);
CREATE INDEX IF NOT EXISTS idx_marrai_secure_users_created_at ON marrai_secure_users(created_at);
CREATE INDEX IF NOT EXISTS idx_marrai_secure_users_deleted_at ON marrai_secure_users(deleted_at) WHERE deleted_at IS NOT NULL;

-- ============================================
-- IDEAS
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Basic info
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  proposed_solution TEXT,
  current_manual_process TEXT,
  digitization_opportunity TEXT,
  
  -- Classification
  category TEXT CHECK (category IN (
    'health', 'education', 'agriculture', 'tech', 
    'infrastructure', 'administration', 'logistics',
    'finance', 'customer_service', 'inclusion', 'other'
  )),
  location TEXT CHECK (location IN (
    'casablanca', 'rabat', 'marrakech', 'kenitra', 
    'tangier', 'agadir', 'fes', 'meknes', 'oujda', 'other'
  )),
  frequency TEXT CHECK (frequency IN (
    'multiple_daily', 'daily', 'weekly', 'monthly', 'occasional'
  )),
  
  -- Data & integration
  data_sources TEXT[] DEFAULT '{}',
  integration_points TEXT[] DEFAULT '{}',
  ai_capabilities_needed TEXT[] DEFAULT '{}',
  
  -- ROI & benefits
  roi_time_saved_hours NUMERIC,
  roi_cost_saved_eur NUMERIC,
  estimated_cost TEXT,
  
  -- Submitter info (encrypted in production)
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  submitter_type TEXT CHECK (submitter_type IN (
    'student', 'professional', 'diaspora', 'entrepreneur', 
    'government', 'researcher', 'other'
  )),
  submitter_skills TEXT[] DEFAULT '{}',
  
  -- User reference
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  -- Status & visibility
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'analyzing', 'analyzed', 'qualified', 'rejected'
  )),
  qualification_tier TEXT CHECK (qualification_tier IN (
    'exceptional', 'qualified', 'needs_work'
  )),
  featured BOOLEAN DEFAULT false,
  public BOOLEAN DEFAULT false, -- Publicly searchable
  opt_in_public BOOLEAN DEFAULT false,
  
  -- Submission method
  submitted_via TEXT DEFAULT 'web' CHECK (submitted_via IN (
    'web', 'whatsapp', 'workshop'
  )),
  workshop_session TEXT,
  
  -- Intilaka PDF
  intilaka_pdf_generated BOOLEAN DEFAULT false,
  intilaka_pdf_url TEXT,
  intilaka_pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Admin
  admin_notes TEXT,
  rejected_reason TEXT
);

-- Indexes for ideas
CREATE INDEX IF NOT EXISTS idx_ideas_status ON marrai_ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_category ON marrai_ideas(category);
CREATE INDEX IF NOT EXISTS idx_ideas_location ON marrai_ideas(location);
CREATE INDEX IF NOT EXISTS idx_ideas_qualification_tier ON marrai_ideas(qualification_tier);
CREATE INDEX IF NOT EXISTS idx_ideas_public ON marrai_ideas(public) WHERE public = true;
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON marrai_ideas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON marrai_ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_deleted_at ON marrai_ideas(deleted_at) WHERE deleted_at IS NOT NULL;

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_ideas_search ON marrai_ideas 
  USING gin(to_tsvector('french', title || ' ' || COALESCE(problem_statement, '') || ' ' || COALESCE(proposed_solution, '')));

-- ============================================
-- SCORING
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_clarity_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL UNIQUE REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Stage 1: Clarity scores (0-10 each)
  problem_statement NUMERIC(3,1) NOT NULL CHECK (problem_statement >= 0 AND problem_statement <= 10),
  as_is_analysis NUMERIC(3,1) NOT NULL CHECK (as_is_analysis >= 0 AND as_is_analysis <= 10),
  benefit_statement NUMERIC(3,1) NOT NULL CHECK (benefit_statement >= 0 AND benefit_statement <= 10),
  operational_needs NUMERIC(3,1) NOT NULL CHECK (operational_needs >= 0 AND operational_needs <= 10),
  
  -- Total
  total NUMERIC(4,1) NOT NULL, -- Sum (0-40)
  average NUMERIC(3,1) NOT NULL, -- Average (0-10)
  
  -- Qualification
  qualified BOOLEAN DEFAULT false, -- ≥6/10 average
  qualification_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_clarity_scores_qualified ON marrai_clarity_scores(qualified);
CREATE INDEX IF NOT EXISTS idx_marrai_clarity_scores_total ON marrai_clarity_scores(total DESC);

CREATE TABLE IF NOT EXISTS marrai_decision_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL UNIQUE REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Stage 2: Decision scores (1-5 each)
  strategic_fit NUMERIC(2,1) NOT NULL CHECK (strategic_fit >= 1 AND strategic_fit <= 5),
  feasibility NUMERIC(2,1) NOT NULL CHECK (feasibility >= 1 AND feasibility <= 5),
  differentiation NUMERIC(2,1) NOT NULL CHECK (differentiation >= 1 AND differentiation <= 5),
  evidence_of_demand NUMERIC(2,1) NOT NULL CHECK (evidence_of_demand >= 1 AND evidence_of_demand <= 5),
  
  -- Total
  total NUMERIC(3,1) NOT NULL, -- Sum (4-20)
  
  -- Break-even analysis
  break_even_months INT,
  intilaka_eligible BOOLEAN DEFAULT false, -- ≤24 months
  
  -- Qualification
  qualified BOOLEAN DEFAULT false, -- ≥25/40 total (Stage 1 + Stage 2)
  qualification_tier TEXT CHECK (qualification_tier IN (
    'exceptional', 'qualified', 'needs_work'
  )),
  
  -- Darija detection
  darija_keywords TEXT[] DEFAULT '{}',
  darija_score NUMERIC(3,2) -- 0-1
);

CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_qualified ON marrai_decision_scores(qualified);
CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_total ON marrai_decision_scores(total DESC);
CREATE INDEX IF NOT EXISTS idx_marrai_decision_scores_intilaka_eligible ON marrai_decision_scores(intilaka_eligible) WHERE intilaka_eligible = true;

-- Ensure qualification_tier column exists (in case table was created before)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marrai_decision_scores' 
    AND column_name = 'qualification_tier'
  ) THEN
    ALTER TABLE marrai_decision_scores 
    ADD COLUMN qualification_tier TEXT CHECK (qualification_tier IN (
      'exceptional', 'qualified', 'needs_work'
    ));
  END IF;
END $$;

-- Combined scores view (for convenience)
CREATE OR REPLACE VIEW marrai_idea_scores AS
SELECT 
  i.id AS idea_id,
  COALESCE(cs.problem_statement, 0) AS stage1_problem,
  COALESCE(cs.as_is_analysis, 0) AS stage1_as_is,
  COALESCE(cs.benefit_statement, 0) AS stage1_benefits,
  COALESCE(cs.operational_needs, 0) AS stage1_operations,
  COALESCE(cs.total, 0) AS stage1_total,
  COALESCE(cs.average, 0) AS stage1_average,
  COALESCE(ds.strategic_fit, 0) AS stage2_strategic,
  COALESCE(ds.feasibility, 0) AS stage2_feasibility,
  COALESCE(ds.differentiation, 0) AS stage2_differentiation,
  COALESCE(ds.evidence_of_demand, 0) AS stage2_evidence,
  COALESCE(ds.total, 0) AS stage2_total,
  COALESCE(cs.total, 0) + COALESCE(ds.total, 0) AS total_score,
  ds.break_even_months,
  ds.intilaka_eligible,
  COALESCE(ds.qualification_tier, i.qualification_tier) AS qualification_tier
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id;

-- ============================================
-- RECEIPTS (Proof of Demand)
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_idea_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  -- Receipt details
  type TEXT NOT NULL CHECK (type IN ('photo', 'barid_cash', 'other')),
  proof_url TEXT NOT NULL,
  amount NUMERIC(5,2) DEFAULT 3.00, -- 3 DH validation payment
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT, -- admin_id
  verification_notes TEXT,
  
  -- Fraud detection
  flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  fraud_score NUMERIC(3,2) -- 0-1
);

CREATE INDEX IF NOT EXISTS idx_marrai_idea_receipts_idea_id ON marrai_idea_receipts(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_receipts_verified ON marrai_idea_receipts(verified);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_receipts_flagged ON marrai_idea_receipts(flagged) WHERE flagged = true;

-- ============================================
-- SELF-ASK CHAIN
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_self_ask_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  question_id TEXT NOT NULL, -- q1, q2, etc.
  question_order INT NOT NULL,
  question_text TEXT NOT NULL, -- Darija version
  
  status TEXT NOT NULL DEFAULT 'asked' CHECK (status IN ('asked', 'answered', 'skipped')),
  asked_at TIMESTAMP WITH TIME ZONE,
  answered_at TIMESTAMP WITH TIME ZONE,
  
  follow_up_count INT DEFAULT 0,
  last_follow_up_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_questions_idea_id ON marrai_self_ask_questions(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_questions_status ON marrai_self_ask_questions(status);
CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_questions_idea_status ON marrai_self_ask_questions(idea_id, status);

CREATE TABLE IF NOT EXISTS marrai_self_ask_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  question_id TEXT NOT NULL,
  
  -- Original response
  original_text TEXT NOT NULL, -- Darija/French/Arabic
  
  -- Extracted data
  extracted_data JSONB DEFAULT '{}'::jsonb,
  entities JSONB DEFAULT '{}'::jsonb, -- {prices: [], names: [], locations: []}
  
  -- Analysis
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  confidence NUMERIC(3,2) DEFAULT 0.5, -- 0-1
  language_detected TEXT, -- darija, french, arabic, mixed
  processing_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_responses_idea_id ON marrai_self_ask_responses(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_responses_question_id ON marrai_self_ask_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_responses_confidence ON marrai_self_ask_responses(confidence);
CREATE INDEX IF NOT EXISTS idx_marrai_self_ask_responses_idea_question ON marrai_self_ask_responses(idea_id, question_id);

-- ============================================
-- FUNDING APPLICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_funding_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Application type
  type TEXT DEFAULT 'intilaka' CHECK (type IN ('intilaka', 'other')),
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'approved', 'rejected'
  )),
  
  -- PDF generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  pdf_version TEXT,
  
  -- Application data (snapshot)
  application_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Submission
  submitted_at TIMESTAMP WITH TIME ZONE,
  submitted_by TEXT,
  
  -- Review
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT,
  review_notes TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  funding_amount NUMERIC(10,2)
);

CREATE INDEX IF NOT EXISTS idx_marrai_funding_applications_idea_id ON marrai_funding_applications(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_funding_applications_status ON marrai_funding_applications(status);
CREATE INDEX IF NOT EXISTS idx_marrai_funding_applications_type ON marrai_funding_applications(type);

-- ============================================
-- ENGAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_idea_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  -- Anonymous upvotes (no user_id)
  voter_ip TEXT,
  voter_user_agent TEXT,
  
  UNIQUE(idea_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_marrai_idea_upvotes_idea_id ON marrai_idea_upvotes(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_upvotes_created_at ON marrai_idea_upvotes(created_at DESC);

CREATE TABLE IF NOT EXISTS marrai_idea_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES marrai_secure_users(id) ON DELETE SET NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  comment_type TEXT CHECK (comment_type IN (
    'suggestion', 'question', 'concern', 'support', 'technical'
  )),
  
  -- Moderation
  approved BOOLEAN DEFAULT true,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_idea_comments_idea_id ON marrai_idea_comments(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_idea_comments_approved ON marrai_idea_comments(approved) WHERE approved = true;
CREATE INDEX IF NOT EXISTS idx_marrai_idea_comments_created_at ON marrai_idea_comments(created_at DESC);

CREATE TABLE IF NOT EXISTS marrai_problem_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Anonymous validation ("I have this problem too")
  validator_ip TEXT,
  validator_user_agent TEXT,
  
  -- Optional comment
  comment TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_problem_validations_idea_id ON marrai_problem_validations(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_problem_validations_created_at ON marrai_problem_validations(created_at DESC);

-- ============================================
-- MENTORS
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT, -- Current location
  moroccan_city TEXT, -- Origin city
  
  -- Expertise
  expertise TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  years_experience INT,
  current_role TEXT[] DEFAULT '{}',
  company TEXT,
  
  -- Engagement
  willing_to_mentor BOOLEAN DEFAULT false,
  willing_to_cofund BOOLEAN DEFAULT false,
  max_cofund_amount TEXT,
  available_hours_per_month INT,
  
  -- Workshop participation
  attended_kenitra BOOLEAN DEFAULT false,
  mgl_member BOOLEAN DEFAULT false,
  chapter TEXT,
  
  -- Stats
  ideas_matched INT DEFAULT 0,
  ideas_funded INT DEFAULT 0,
  total_cofunded_eur NUMERIC(10,2) DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_marrai_mentors_email ON marrai_mentors(email);
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_willing_to_mentor ON marrai_mentors(willing_to_mentor) WHERE willing_to_mentor = true;
CREATE INDEX IF NOT EXISTS idx_marrai_mentors_expertise ON marrai_mentors USING gin(expertise);

CREATE TABLE IF NOT EXISTS marrai_mentor_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  idea_id UUID NOT NULL REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL REFERENCES marrai_mentors(id) ON DELETE CASCADE,
  
  -- Matching details
  match_score NUMERIC(3,2), -- 0-1
  match_reason TEXT,
  matched_by TEXT, -- admin_id or 'auto'
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'rejected', 'active', 'completed'
  )),
  mentor_response TEXT,
  mentor_responded_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  success BOOLEAN, -- true if mentorship led to funding/success
  
  UNIQUE(idea_id, mentor_id)
);

CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_idea_id ON marrai_mentor_matches(idea_id);
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_mentor_id ON marrai_mentor_matches(mentor_id);
CREATE INDEX IF NOT EXISTS idx_marrai_mentor_matches_status ON marrai_mentor_matches(status);

-- ============================================
-- PRIVACY & CONSENT
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID NOT NULL REFERENCES marrai_secure_users(id) ON DELETE CASCADE,
  phone_hash TEXT NOT NULL,
  
  -- Consent details
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'submission', 'marketing', 'analysis', 'data_retention'
  )),
  granted BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL DEFAULT '1.0.0',
  consent_method TEXT NOT NULL CHECK (consent_method IN (
    'whatsapp', 'web', 'email', 'phone', 'in_person', 'other'
  )),
  
  -- GDPR Article 7: Provable consent
  ip_address TEXT,
  user_agent TEXT,
  
  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_marrai_consents_user_id ON marrai_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_marrai_consents_phone_hash ON marrai_consents(phone_hash);
CREATE INDEX IF NOT EXISTS idx_marrai_consents_type ON marrai_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_marrai_consents_created_at ON marrai_consents(created_at);
CREATE INDEX IF NOT EXISTS idx_marrai_consents_user_type ON marrai_consents(user_id, consent_type);
CREATE INDEX IF NOT EXISTS idx_marrai_consents_expires_at ON marrai_consents(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS marrai_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID NOT NULL REFERENCES marrai_secure_users(id) ON DELETE CASCADE,
  
  -- Verification
  verification_token TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Grace period
  scheduled_deletion_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 7 days from request
  cancelled BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Execution
  deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deletion_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_marrai_deletion_requests_user_id ON marrai_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_marrai_deletion_requests_verified ON marrai_deletion_requests(verified);
CREATE INDEX IF NOT EXISTS idx_marrai_deletion_requests_scheduled_deletion_at ON marrai_deletion_requests(scheduled_deletion_at);

CREATE TABLE IF NOT EXISTS marrai_export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID NOT NULL REFERENCES marrai_secure_users(id) ON DELETE CASCADE,
  
  -- Verification
  otp_token TEXT UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  
  -- Export
  format TEXT DEFAULT 'json' CHECK (format IN ('json', 'pdf')),
  download_url TEXT,
  download_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 24 hours
  downloaded BOOLEAN DEFAULT false,
  downloaded_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_marrai_export_requests_user_id ON marrai_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_marrai_export_requests_verified ON marrai_export_requests(verified);
CREATE INDEX IF NOT EXISTS idx_marrai_export_requests_expires_at ON marrai_export_requests(expires_at);

-- ============================================
-- ADMIN & AUDIT
-- ============================================

CREATE TABLE IF NOT EXISTS marrai_admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Actor
  admin_id TEXT NOT NULL,
  admin_email TEXT,
  admin_role TEXT, -- admin, privacy_officer, etc.
  
  -- Action
  action TEXT NOT NULL, -- idea_approved, receipt_verified, user_banned, score_override, etc.
  entity_type TEXT, -- idea, user, receipt, etc.
  entity_id UUID,
  
  -- Details
  details JSONB DEFAULT '{}'::jsonb,
  reason TEXT, -- Required for sensitive actions
  ip_address TEXT,
  user_agent TEXT,
  
  -- 2FA (if applicable)
  two_factor_verified BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_marrai_admin_actions_admin_id ON marrai_admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_marrai_admin_actions_action ON marrai_admin_actions(action);
CREATE INDEX IF NOT EXISTS idx_marrai_admin_actions_entity ON marrai_admin_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_marrai_admin_actions_created_at ON marrai_admin_actions(created_at DESC);

CREATE TABLE IF NOT EXISTS marrai_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_marrai_audit_logs_user_id ON marrai_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_marrai_audit_logs_action ON marrai_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_marrai_audit_logs_timestamp ON marrai_audit_logs(timestamp);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marrai_secure_users_updated_at
  BEFORE UPDATE ON marrai_secure_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_ideas_updated_at
  BEFORE UPDATE ON marrai_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_idea_receipts_updated_at
  BEFORE UPDATE ON marrai_idea_receipts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_funding_applications_updated_at
  BEFORE UPDATE ON marrai_funding_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_idea_comments_updated_at
  BEFORE UPDATE ON marrai_idea_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_mentors_updated_at
  BEFORE UPDATE ON marrai_mentors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marrai_mentor_matches_updated_at
  BEFORE UPDATE ON marrai_mentor_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE marrai_secure_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_clarity_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_decision_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_idea_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_self_ask_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_self_ask_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_idea_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_problem_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_mentor_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read policies (for public idea bank)
CREATE POLICY "Public can read public ideas" ON marrai_ideas
  FOR SELECT USING (public = true AND deleted_at IS NULL);

CREATE POLICY "Public can read upvotes" ON marrai_idea_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Public can read approved comments" ON marrai_idea_comments
  FOR SELECT USING (approved = true AND deleted_at IS NULL);

CREATE POLICY "Public can read problem validations" ON marrai_problem_validations
  FOR SELECT USING (true);

-- Service role policies (for backend operations)
CREATE POLICY "Service role can manage all" ON marrai_secure_users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage ideas" ON marrai_ideas
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scores" ON marrai_clarity_scores
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage scores" ON marrai_decision_scores
  FOR ALL USING (auth.role() = 'service_role');

-- Note: Adjust RLS policies based on your authentication setup
-- For production, implement proper user-based policies

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE marrai_secure_users IS 'Privacy-first user storage with encrypted PII and phone number hashing';
COMMENT ON TABLE marrai_ideas IS 'Main ideas table with all submission data';
COMMENT ON TABLE marrai_clarity_scores IS 'Stage 1 scoring: Clarity (0-10 each, 0-40 total)';
COMMENT ON TABLE marrai_decision_scores IS 'Stage 2 scoring: Decision (1-5 each, 4-20 total)';
COMMENT ON TABLE marrai_idea_receipts IS 'Proof of demand: 3 DH validation payments';
COMMENT ON TABLE marrai_self_ask_questions IS 'WhatsApp self-ask chain questions';
COMMENT ON TABLE marrai_self_ask_responses IS 'User responses with NLP-extracted data';
COMMENT ON TABLE marrai_funding_applications IS 'Intilaka and other funding application PDFs';
COMMENT ON TABLE marrai_idea_upvotes IS 'Community upvotes for ideas';
COMMENT ON TABLE marrai_idea_comments IS 'Comments and discussions on ideas';
COMMENT ON TABLE marrai_problem_validations IS 'Anonymous "I have this problem too" validations';
COMMENT ON TABLE marrai_mentors IS 'Mentor profiles for matching';
COMMENT ON TABLE marrai_mentor_matches IS 'Mentor-idea matching records';
COMMENT ON TABLE marrai_consents IS 'GDPR-compliant consent records (immutable)';
COMMENT ON TABLE marrai_deletion_requests IS 'User data deletion requests with 7-day grace period';
COMMENT ON TABLE marrai_export_requests IS 'User data export requests (GDPR Article 20)';
COMMENT ON TABLE marrai_admin_actions IS 'Audit log of all admin actions';
COMMENT ON TABLE marrai_audit_logs IS 'Permanent audit trail of data access';

