-- ============================================
-- MarrAI Idea Bank - Complete Database Schema
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- Supports: Idea submission, Agentic AI analysis, Live conversation capture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES: Main Idea Bank
-- ============================================

-- Main ideas table (from forms + promoted conversation ideas)
CREATE TABLE marrai_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Basic Info
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  proposed_solution TEXT,
  category TEXT CHECK (category IN (
    'health', 'education', 'agriculture', 'tech', 
    'infrastructure', 'administration', 'logistics',
    'finance', 'customer_service', 'inclusion', 'other'
  )),
  location TEXT CHECK (location IN (
    'casablanca', 'rabat', 'marrakech', 'kenitra', 
    'tangier', 'agadir', 'fes', 'meknes', 'oujda', 'other'
  )),
  
  -- Digitization-specific fields
  current_manual_process TEXT,
  digitization_opportunity TEXT,
  frequency TEXT CHECK (frequency IN (
    'multiple_daily', 'daily', 'weekly', 'monthly', 'occasional'
  )),
  
  -- Data & Integration
  data_sources TEXT[], -- ['excel', 'database', 'email', 'pdf', 'photos', etc.]
  integration_points TEXT[], -- systems to connect
  ai_capabilities_needed TEXT[], -- ['nlp', 'vision', 'prediction', 'generation']
  
  -- Agent architecture
  automation_potential TEXT CHECK (automation_potential IN ('high', 'medium', 'low')),
  agent_type TEXT CHECK (agent_type IN (
    'workflow_agent', 'data_agent', 'decision_agent', 
    'interface_agent', 'hybrid_agent'
  )),
  human_in_loop BOOLEAN DEFAULT TRUE,
  
  -- Cost estimates
  estimated_cost TEXT CHECK (estimated_cost IN ('<1K', '1K-3K', '3K-5K', '5K-10K', '10K+', 'unknown')),
  
  -- ROI metrics
  roi_time_saved_hours NUMERIC,
  roi_cost_saved_eur NUMERIC,
  
  -- Submitter info
  submitter_name TEXT,
  submitter_email TEXT,
  submitter_phone TEXT,
  submitter_type TEXT CHECK (submitter_type IN (
    'student', 'professional', 'diaspora', 'entrepreneur', 
    'government', 'researcher', 'other'
  )),
  submitter_skills TEXT[],
  
  -- AI Analysis results
  ai_feasibility_score NUMERIC(3,1), -- 0.0 to 10.0
  ai_analysis JSONB, -- full structured analysis from Claude
  ai_category_suggested TEXT,
  ai_cost_estimate TEXT,
  ai_impact_score NUMERIC(3,1),
  analysis_completed_at TIMESTAMP,
  
  -- Matching
  matched_diaspora UUID[], -- array of diaspora_profile IDs
  matching_score NUMERIC(3,1),
  matched_at TIMESTAMP,
  
  -- Status tracking
  status TEXT DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'analyzing', 'analyzed', 'matched', 
    'funded', 'in_progress', 'completed', 'rejected'
  )),
  featured BOOLEAN DEFAULT FALSE,
  priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Workshop-specific
  workshop_session TEXT, -- which session it was submitted/captured in
  submitted_via TEXT DEFAULT 'web' CHECK (submitted_via IN (
    'web', 'whatsapp', 'workshop_form', 'workshop_conversation'
  )),
  
  -- Admin fields
  admin_notes TEXT,
  rejected_reason TEXT
);

-- Diaspora profiles (for matching)
CREATE TABLE marrai_diaspora_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Basic info
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  location TEXT, -- current country/city
  moroccan_city TEXT, -- origin city in Morocco
  
  -- Expertise
  expertise TEXT[], -- ['healthcare', 'education', 'tech', 'finance']
  skills TEXT[], -- specific technical skills
  years_experience INT,
  currentrole TEXT[],
  company TEXT,
  
  -- Engagement preferences
  willing_to_mentor BOOLEAN DEFAULT FALSE,
  willing_to_cofund BOOLEAN DEFAULT FALSE,
  max_cofund_amount TEXT,
  available_hours_per_month INT,
  
  -- Workshop participation
  attended_kenitra BOOLEAN DEFAULT FALSE,
  mgl_member BOOLEAN DEFAULT FALSE,
  chapter TEXT, -- 'health', 'education', 'innovation', 'women', etc.
  
  -- Matching history
  ideas_matched INT DEFAULT 0,
  ideas_funded INT DEFAULT 0,
  total_cofunded_eur NUMERIC DEFAULT 0
);

-- Votes (community validation)
CREATE TABLE marrai_idea_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  voter_email TEXT,
  voter_name TEXT,
  vote TEXT CHECK (vote IN ('feasible', 'not_feasible', 'maybe')),
  comment TEXT,
  expertise_relevance TEXT CHECK (expertise_relevance IN ('expert', 'familiar', 'layperson')),
  
  UNIQUE(idea_id, voter_email)
);

-- ============================================
-- AGENTIC AI TABLES
-- ============================================

-- Agent solution architectures
CREATE TABLE marrai_agent_solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  
  -- Agent design
  agent_name TEXT NOT NULL,
  agent_description TEXT,
  agent_type TEXT CHECK (agent_type IN (
    'workflow', 'data', 'decision', 'interface', 'hybrid'
  )),
  
  -- Technical specification
  triggers TEXT[], -- ['daily_schedule', 'email_received', 'threshold_breach']
  actions TEXT[], -- ['send_sms', 'update_database', 'generate_report']
  tools_needed TEXT[], -- ['email_api', 'database_access', 'llm_api']
  
  -- Architecture details
  architecture_diagram_url TEXT,
  pseudocode TEXT,
  sample_prompt TEXT, -- if using LLM
  workflow_description TEXT,
  
  -- Implementation
  complexity TEXT CHECK (complexity IN ('simple', 'moderate', 'complex')),
  estimated_dev_time TEXT, -- '2-4 weeks'
  estimated_cost TEXT, -- '€3,500'
  tech_stack JSONB, -- {backend: 'Python', database: 'Supabase', etc.}
  monthly_operating_cost TEXT,
  
  -- Phased roadmap
  phase_1_mvp TEXT,
  phase_2_automation TEXT,
  phase_3_full_agent TEXT,
  
  -- Impact metrics
  automation_percentage NUMERIC, -- 0-100
  monthly_time_saved NUMERIC,
  monthly_cost_saved NUMERIC,
  payback_period TEXT, -- '4 months'
  annual_roi_percentage NUMERIC,
  
  -- Scalability
  replicability TEXT CHECK (replicability IN ('high', 'medium', 'low')),
  market_size TEXT,
  potential_revenue TEXT,
  
  -- Generated artifacts
  code_samples JSONB, -- can store code snippets
  api_specs JSONB,
  deployment_guide TEXT
);

-- ============================================
-- LIVE CONVERSATION CAPTURE TABLES
-- ============================================

-- Workshop sessions
CREATE TABLE marrai_workshop_sessions (
  id TEXT PRIMARY KEY, -- 'session_1_opening', 'session_2_health'
  created_at TIMESTAMP DEFAULT NOW(),
  
  name TEXT NOT NULL,
  name_french TEXT,
  date DATE,
  start_time TIME,
  end_time TIME,
  room TEXT,
  moderator TEXT,
  
  -- Participants
  expected_attendees INT,
  actual_attendees INT,
  key_speakers TEXT[],
  
  -- Recording metadata
  recording_started BOOLEAN DEFAULT FALSE,
  recording_stopped BOOLEAN DEFAULT FALSE,
  recording_url TEXT,
  recording_duration_minutes INT,
  
  -- Transcript stats
  transcript_word_count INT DEFAULT 0,
  transcript_language_breakdown JSONB, -- {french: 60, arabic: 30, english: 10}
  
  -- Idea extraction stats
  ideas_detected INT DEFAULT 0,
  ideas_validated INT DEFAULT 0,
  ideas_rejected INT DEFAULT 0,
  ideas_pending INT DEFAULT 0,
  
  -- Session notes
  session_summary TEXT,
  key_topics TEXT[],
  notable_moments TEXT[]
);

-- Transcript chunks
CREATE TABLE marrai_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  session_id TEXT REFERENCES marrai_workshop_sessions(id) ON DELETE CASCADE,
  
  -- Content
  text TEXT NOT NULL,
  text_cleaned TEXT, -- preprocessed for analysis
  word_count INT,
  
  -- Timing
  timestamp_in_session INTERVAL, -- 00:15:30 = 15min 30sec into session
  duration_seconds INT,
  
  -- Language detection
  language TEXT, -- 'french', 'arabic', 'english', 'mixed'
  language_confidence NUMERIC(3,2),
  
  -- Speaker identification
  speaker_identified TEXT, -- 'Dr. Amine', 'Unknown Speaker 1', null
  speaker_confidence NUMERIC(3,2),
  
  -- Processing status
  processed BOOLEAN DEFAULT FALSE,
  contains_idea BOOLEAN DEFAULT FALSE,
  analysis_attempted BOOLEAN DEFAULT FALSE,
  
  -- Technical metadata
  audio_chunk_url TEXT,
  transcription_service TEXT, -- 'whisper', 'assemblyai', 'otter'
  transcription_confidence NUMERIC(3,2)
);

-- Conversation-extracted ideas (before validation)
CREATE TABLE marrai_conversation_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Source tracking
  session_id TEXT REFERENCES marrai_workshop_sessions(id),
  transcript_ids UUID[], -- which transcript chunks this came from
  mentioned_at_timestamp INTERVAL, -- when in session this was mentioned
  
  -- Speaker info
  speaker_quote TEXT NOT NULL, -- exact quote from transcript
  speaker_context TEXT, -- 'Dr. Amine, healthcare expert from Berlin'
  speaker_email TEXT, -- if we can identify
  
  -- Extracted idea content
  problem_title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  current_manual_process TEXT,
  proposed_solution TEXT,
  category TEXT,
  digitization_opportunity TEXT,
  
  -- AI extraction metadata
  confidence_score NUMERIC(3,2), -- 0.00 to 1.00
  extraction_reasoning TEXT, -- why AI thinks this is an idea
  needs_clarification BOOLEAN DEFAULT FALSE,
  validation_question TEXT, -- question to ask speaker
  
  -- Validation workflow
  status TEXT DEFAULT 'pending_validation' CHECK (status IN (
    'pending_validation',
    'speaker_contacted',
    'speaker_validated',
    'speaker_rejected',
    'needs_refinement',
    'promoted_to_idea'
  )),
  
  validated_by TEXT, -- email/name
  validated_at TIMESTAMP,
  validation_method TEXT, -- 'qr_scan', 'verbal_confirmation', 'email'
  validation_notes TEXT,
  refinement_notes TEXT,
  
  -- Promotion to main ideas table
  promoted_to_idea_id UUID REFERENCES marrai_ideas(id),
  promoted_at TIMESTAMP,
  
  -- Admin workflow
  flagged_for_review BOOLEAN DEFAULT FALSE,
  admin_notes TEXT
);

-- ============================================
-- SUPPORTING TABLES
-- ============================================

-- Comments/discussions on ideas
CREATE TABLE marrai_idea_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  commenter_name TEXT,
  commenter_email TEXT,
  comment TEXT NOT NULL,
  comment_type TEXT CHECK (comment_type IN (
    'suggestion', 'question', 'concern', 'support', 'technical'
  ))
);

-- Activity log (for audit trail)
CREATE TABLE marrai_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW(),
  
  entity_type TEXT, -- 'idea', 'conversation_idea', 'diaspora_profile'
  entity_id UUID,
  action TEXT, -- 'created', 'updated', 'validated', 'matched', 'funded'
  actor TEXT, -- who did it
  details JSONB,
  ip_address TEXT
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

-- Ideas indexes
CREATE INDEX idx_ideas_status ON marrai_ideas(status);
CREATE INDEX idx_ideas_category ON marrai_ideas(category);
CREATE INDEX idx_ideas_created_at ON marrai_ideas(created_at DESC);
CREATE INDEX idx_ideas_featured ON marrai_ideas(featured) WHERE featured = TRUE;
CREATE INDEX idx_ideas_workshop_session ON marrai_ideas(workshop_session);
CREATE INDEX idx_ideas_automation_potential ON marrai_ideas(automation_potential);

-- Conversation ideas indexes
CREATE INDEX idx_conversation_ideas_session ON marrai_conversation_ideas(session_id);
CREATE INDEX idx_conversation_ideas_status ON marrai_conversation_ideas(status);
CREATE INDEX idx_conversation_ideas_confidence ON marrai_conversation_ideas(confidence_score DESC);

-- Transcripts indexes
CREATE INDEX idx_transcripts_session ON marrai_transcripts(session_id);
CREATE INDEX idx_transcripts_processed ON marrai_transcripts(processed);
CREATE INDEX idx_transcripts_contains_idea ON marrai_transcripts(contains_idea) WHERE contains_idea = TRUE;

-- Diaspora profiles indexes
CREATE INDEX idx_diaspora_email ON marrai_diaspora_profiles(email);
CREATE INDEX idx_diaspora_attended ON marrai_diaspora_profiles(attended_kenitra) WHERE attended_kenitra = TRUE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE marrai_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_diaspora_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_agent_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_conversation_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_idea_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE marrai_activity_log ENABLE ROW LEVEL SECURITY;

-- Public read policies (for demo/workshop - adjust for production)
CREATE POLICY "Public can read ideas" ON marrai_ideas FOR SELECT USING (true);
CREATE POLICY "Public can insert ideas" ON marrai_ideas FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read diaspora profiles" ON marrai_diaspora_profiles FOR SELECT USING (true);
CREATE POLICY "Public can vote" ON marrai_idea_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read votes" ON marrai_idea_votes FOR SELECT USING (true);
CREATE POLICY "Public can read agent solutions" ON marrai_agent_solutions FOR SELECT USING (true);
CREATE POLICY "Public can read sessions" ON marrai_workshop_sessions FOR SELECT USING (true);
CREATE POLICY "Public can read conversation ideas" ON marrai_conversation_ideas FOR SELECT USING (true);
CREATE POLICY "Public can read comments" ON marrai_idea_comments FOR SELECT USING (true);
CREATE POLICY "Public can insert comments" ON marrai_idea_comments FOR INSERT WITH CHECK (true);

-- Admin-only policies (update/delete - requires authentication in production)
-- For workshop demo, we'll keep it open. Lock down later.
CREATE POLICY "Anyone can update ideas" ON marrai_ideas FOR UPDATE USING (true);
CREATE POLICY "Anyone can update conversation ideas" ON marrai_conversation_ideas FOR UPDATE USING (true);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE marrai_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE marrai_conversation_ideas;
ALTER PUBLICATION supabase_realtime ADD TABLE marrai_transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE marrai_idea_votes;

-- ============================================
-- MATERIALIZED VIEWS (for dashboards)
-- ============================================

-- Overall statistics
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT
  -- Ideas stats
  COUNT(*) FILTER (WHERE status = 'submitted') as ideas_submitted,
  COUNT(*) FILTER (WHERE status = 'analyzed') as ideas_analyzed,
  COUNT(*) FILTER (WHERE status = 'matched') as ideas_matched,
  COUNT(*) FILTER (WHERE status = 'funded') as ideas_funded,
  
  -- Automation potential
  COUNT(*) FILTER (WHERE automation_potential = 'high') as high_automation_count,
  COUNT(*) FILTER (WHERE automation_potential = 'medium') as medium_automation_count,
  COUNT(*) FILTER (WHERE automation_potential = 'low') as low_automation_count,
  
  -- ROI metrics
  SUM(roi_time_saved_hours) as total_hours_saveable,
  SUM(roi_cost_saved_eur) as total_eur_saveable,
  AVG(ai_feasibility_score) as avg_feasibility_score,
  AVG(ai_impact_score) as avg_impact_score,
  
  -- Categories
  COUNT(DISTINCT category) as categories_covered,
  COUNT(DISTINCT location) as cities_covered,
  
  -- Agent types
  COUNT(DISTINCT agent_type) as agent_types_identified
FROM marrai_ideas;

-- Category breakdown
CREATE MATERIALIZED VIEW category_breakdown AS
SELECT
  category,
  COUNT(*) as idea_count,
  AVG(ai_feasibility_score) as avg_feasibility,
  AVG(ai_impact_score) as avg_impact,
  SUM(roi_cost_saved_eur) as total_cost_savings,
  COUNT(*) FILTER (WHERE automation_potential = 'high') as high_automation_count
FROM marrai_ideas
WHERE status IN ('analyzed', 'matched', 'funded')
GROUP BY category
ORDER BY idea_count DESC;

-- Session statistics
CREATE MATERIALIZED VIEW session_stats AS
SELECT
  ws.id,
  ws.name,
  ws.date,
  ws.ideas_detected,
  ws.ideas_validated,
  ws.transcript_word_count,
  COUNT(DISTINCT ci.id) as total_conversation_ideas,
  COUNT(DISTINCT ci.id) FILTER (WHERE ci.status = 'speaker_validated') as validated_count,
  COUNT(DISTINCT ci.id) FILTER (WHERE ci.status = 'promoted_to_idea') as promoted_count
FROM marrai_workshop_sessions ws
LEFT JOIN marrai_conversation_ideas ci ON ci.session_id = ws.id
GROUP BY ws.id, ws.name, ws.date, ws.ideas_detected, ws.ideas_validated, ws.transcript_word_count;

-- Refresh views function (call periodically)
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_stats;
  REFRESH MATERIALIZED VIEW category_breakdown;
  REFRESH MATERIALIZED VIEW session_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to mark transcripts as processed
CREATE OR REPLACE FUNCTION mark_transcripts_processed(transcript_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE transcripts
  SET processed = true
  WHERE id = ANY(transcript_ids);
END;
$$ LANGUAGE plpgsql;

-- Function to promote conversation idea to main ideas table
CREATE OR REPLACE FUNCTION promote_conversation_idea(conv_idea_id UUID)
RETURNS UUID AS $$
DECLARE
  new_idea_id UUID;
  conv_idea RECORD;
BEGIN
  -- Get conversation idea
  SELECT * INTO conv_idea FROM marrai_conversation_ideas WHERE id = conv_idea_id;
  
  -- Insert into ideas table
  INSERT INTO ideas (
    title, problem_statement, current_manual_process, proposed_solution,
    category, digitization_opportunity, submitted_via, workshop_session,
    submitter_name, status
  ) VALUES (
    conv_idea.problem_title,
    conv_idea.problem_statement,
    conv_idea.current_manual_process,
    conv_idea.proposed_solution,
    conv_idea.category,
    conv_idea.digitization_opportunity,
    'workshop_conversation',
    conv_idea.session_id,
    conv_idea.speaker_context,
    'analyzing'
  ) RETURNING id INTO new_idea_id;
  
  -- Update conversation idea
  UPDATE conversation_ideas
  SET 
    status = 'promoted_to_idea',
    promoted_to_idea_id = new_idea_id,
    promoted_at = NOW()
  WHERE id = conv_idea_id;
  
  -- Log activity
  INSERT INTO activity_log (entity_type, entity_id, action, details)
  VALUES ('conversation_idea', conv_idea_id, 'promoted', 
          jsonb_build_object('new_idea_id', new_idea_id));
  
  RETURN new_idea_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update session stats
CREATE OR REPLACE FUNCTION update_session_stats(sess_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE workshop_sessions
  SET
    ideas_detected = (SELECT COUNT(*) FROM marrai_conversation_ideas WHERE session_id = sess_id),
    ideas_validated = (SELECT COUNT(*) FROM marrai_conversation_ideas WHERE session_id = sess_id AND status = 'speaker_validated'),
    ideas_rejected = (SELECT COUNT(*) FROM marrai_conversation_ideas WHERE session_id = sess_id AND status = 'speaker_rejected'),
    ideas_pending = (SELECT COUNT(*) FROM marrai_conversation_ideas WHERE session_id = sess_id AND status = 'pending_validation'),
    transcript_word_count = (SELECT SUM(word_count) FROM marrai_transcripts WHERE session_id = sess_id)
  WHERE id = sess_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEED DATA (for testing)
-- ============================================

-- Insert workshop sessions
INSERT INTO marrai_workshop_sessions (id, name, name_french, date, start_time, end_time, room) VALUES
  ('session_1_opening', 'Opening: Vision & Partnerships', 'Session d''ouverture: Vision, Partenariats et Gouvernance', '2025-12-22', '09:00', '10:30', 'Main Hall'),
  ('session_2_health', 'Health & Medicine', 'Session Santé & Médecine', '2025-12-22', '10:45', '12:30', 'Room A'),
  ('session_3_education', 'Education & Inclusion', 'Session Éducation & Inclusion', '2025-12-22', '14:00', '15:30', 'Room B'),
  ('session_4_leadership', 'Leadership & Women', 'Session Leadership, Femmes et Innovation', '2025-12-22', '15:45', '17:15', 'Room C'),
  ('session_5_youth_ai', 'Youth, GenZ & AI', 'Session Jeunesse, Génération Z212 & Intelligence Artificielle', '2025-12-23', '09:00', '11:00', 'Main Hall'),
  ('session_6_closing', 'Closing & Charter Signature', 'Conclusion & Signature symbolique', '2025-12-23', '11:15', '12:30', 'Main Hall');

-- Sample diaspora profiles (add real ones before workshop)
INSERT INTO marrai_diaspora_profiles (name, email, location, moroccan_city, expertise, willing_to_mentor, willing_to_cofund, attended_kenitra, mgl_member) VALUES
  ('Dr. Amine Benali', 'amine.benali@example.com', 'Berlin, Germany', 'casablanca', ARRAY['health', 'medical_devices'], true, true, true, true),
  ('Fatima Zahra Idrissi', 'fatima@example.com', 'Paris, France', 'rabat', ARRAY['education', 'inclusion'], true, false, true, true),
  ('Omar Alami', 'omar@example.com', 'Frankfurt, Germany', 'marrakech', ARRAY['agriculture', 'tech'], true, true, true, false),
  ('Samira El Khatib', 'samira@example.com', 'Amsterdam, Netherlands', 'tangier', ARRAY['tech', 'ai', 'startups'], true, true, true, true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check tables created
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Check realtime enabled
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- ============================================
-- NOTES FOR DEPLOYMENT
-- ============================================

-- 1. Run this entire file in Supabase SQL Editor
-- 2. Verify all tables created: Run verification queries above
-- 3. Check Supabase dashboard -> Database -> Tables to confirm
-- 4. Enable realtime in Supabase dashboard if not auto-enabled
-- 5. Copy your project URL and anon key for Next.js .env.local
-- 6. For production: Tighten RLS policies, add authentication
-- 7. Set up scheduled refresh of materialized views (hourly):
--    SELECT cron.schedule('refresh-dashboard', '0 * * * *', 'SELECT refresh_dashboard_views()');

-- ============================================
-- SUCCESS!
-- ============================================
-- Your database is ready for:
-- ✅ Idea submissions (web forms)
-- ✅ Agentic AI analysis
-- ✅ Live conversation capture
-- ✅ Real-time dashboards
-- ✅ Workshop session tracking
-- ✅ Diaspora matching
-- ✅ ROI calculations
-- ============================================