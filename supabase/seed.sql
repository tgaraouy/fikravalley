-- ============================================
-- MarrAI Idea Bank - Seed Data
-- ============================================
-- Test data for development and testing
-- Run after migrations

-- ============================================
-- SAMPLE USERS
-- ============================================

-- Note: In production, use actual bcrypt hashes and encrypted data
-- These are placeholders for testing

INSERT INTO secure_users (
  id,
  phone_hash,
  encrypted_name,
  name_iv,
  name_tag,
  anonymous_email,
  consent,
  consent_date,
  data_retention_expiry
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0', -- bcrypt hash of "212612345678"
  'encrypted_name_1',
  'iv_1',
  'tag_1',
  'user1@anonymous.fikravalley.com',
  true,
  NOW(),
  NOW() + INTERVAL '90 days'
),
(
  '00000000-0000-0000-0000-000000000002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd1',
  'encrypted_name_2',
  'iv_2',
  'tag_2',
  'user2@anonymous.fikravalley.com',
  true,
  NOW(),
  NOW() + INTERVAL '180 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE IDEAS
-- ============================================

INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  category,
  location,
  frequency,
  user_id,
  status,
  qualification_tier,
  public,
  submitted_via
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Digitisation des dossiers médicaux',
  'Les hôpitaux utilisent encore des dossiers papier. Les médecins perdent du temps à chercher les dossiers, et il y a des risques de perte ou d''erreur.',
  'Système numérique centralisé avec recherche rapide, historique complet, et accès sécurisé.',
  'Le médecin doit chercher le dossier physique dans les archives, le transporter, le remplir manuellement, et le remettre en archive.',
  'health',
  'casablanca',
  'daily',
  '00000000-0000-0000-0000-000000000001',
  'qualified',
  'qualified',
  true,
  'web'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Plateforme de suivi des étudiants',
  'Les parents ne savent pas comment leurs enfants progressent à l''école. Les enseignants passent beaucoup de temps à remplir des rapports manuels.',
  'Application mobile pour les parents avec notifications en temps réel, bulletins numériques, et communication directe avec les enseignants.',
  'Les enseignants remplissent des bulletins papier, les parents doivent venir à l''école pour les récupérer, pas de suivi continu.',
  'education',
  'rabat',
  'weekly',
  '00000000-0000-0000-0000-000000000001',
  'qualified',
  'exceptional',
  true,
  'web'
),
(
  '10000000-0000-0000-0000-000000000003',
  'Système de gestion des récoltes',
  'Les agriculteurs ne savent pas quand récolter, comment optimiser leurs rendements, ou où vendre leurs produits au meilleur prix.',
  'Application avec prévisions météo, conseils agricoles personnalisés, et marketplace pour connecter agriculteurs et acheteurs.',
  'Les agriculteurs se fient à l''expérience, pas de données, pas de prévisions, vente au marché local uniquement.',
  'agriculture',
  'marrakech',
  'monthly',
  '00000000-0000-0000-0000-000000000002',
  'analyzed',
  'needs_work',
  false,
  'whatsapp'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE SCORES
-- ============================================

INSERT INTO clarity_scores (
  idea_id,
  problem_statement,
  as_is_analysis,
  benefit_statement,
  operational_needs,
  total,
  average,
  qualified,
  qualification_reason
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  8.5,
  7.0,
  8.0,
  7.5,
  31.0,
  7.75,
  true,
  'Strong problem statement with clear current process and benefits'
),
(
  '10000000-0000-0000-0000-000000000002',
  9.0,
  8.5,
  9.0,
  8.0,
  34.5,
  8.625,
  true,
  'Exceptional clarity across all criteria'
),
(
  '10000000-0000-0000-0000-000000000003',
  6.0,
  5.5,
  6.0,
  5.0,
  22.5,
  5.625,
  false,
  'Needs more detail on current process and operational requirements'
)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO decision_scores (
  idea_id,
  strategic_fit,
  feasibility,
  differentiation,
  evidence_of_demand,
  total,
  break_even_months,
  intilaka_eligible,
  qualified,
  qualification_tier,
  darija_keywords,
  darija_score
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  4.5,
  4.0,
  3.5,
  3.0,
  15.0,
  18,
  true,
  true,
  'qualified',
  ARRAY['mochkil', 'wa9t', 'bzaf'],
  0.7
),
(
  '10000000-0000-0000-0000-000000000002',
  5.0,
  4.5,
  4.5,
  4.0,
  18.0,
  12,
  true,
  true,
  'exceptional',
  ARRAY['mochkil', 'khlass'],
  0.8
),
(
  '10000000-0000-0000-0000-000000000003',
  3.5,
  3.0,
  3.0,
  2.5,
  12.0,
  30,
  false,
  false,
  'needs_work',
  ARRAY['mochkil'],
  0.5
)
ON CONFLICT (idea_id) DO NOTHING;

-- ============================================
-- SAMPLE RECEIPTS
-- ============================================

INSERT INTO idea_receipts (
  idea_id,
  user_id,
  type,
  proof_url,
  amount,
  verified,
  verified_at,
  verified_by
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'barid_cash',
  'https://storage.supabase.co/receipts/receipt1.jpg',
  3.00,
  true,
  NOW(),
  'admin1'
),
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'photo',
  'https://storage.supabase.co/receipts/receipt2.jpg',
  3.00,
  true,
  NOW(),
  'admin1'
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'barid_cash',
  'https://storage.supabase.co/receipts/receipt3.jpg',
  3.00,
  true,
  NOW(),
  'admin1'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE UPVOTES
-- ============================================

INSERT INTO idea_upvotes (idea_id, user_id) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE COMMENTS
-- ============================================

INSERT INTO idea_comments (
  idea_id,
  user_id,
  content,
  comment_type,
  approved
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Excellente idée! J''ai vécu ce problème dans plusieurs hôpitaux.',
  'support',
  true
),
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'Comment garantir la sécurité des données des étudiants?',
  'question',
  true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE MENTORS
-- ============================================

INSERT INTO mentors (
  id,
  name,
  email,
  location,
  moroccan_city,
  expertise,
  skills,
  years_experience,
  willing_to_mentor,
  willing_to_cofund,
  available_hours_per_month,
  mgl_member
) VALUES
(
  '20000000-0000-0000-0000-000000000001',
  'Dr. Amine Benali',
  'amine.benali@example.com',
  'Berlin, Germany',
  'casablanca',
  ARRAY['health', 'medical_devices'],
  ARRAY['healthcare IT', 'telemedicine', 'data security'],
  15,
  true,
  true,
  10,
  true
),
(
  '20000000-0000-0000-0000-000000000002',
  'Fatima Zahra Idrissi',
  'fatima@example.com',
  'Paris, France',
  'rabat',
  ARRAY['education', 'inclusion'],
  ARRAY['edtech', 'pedagogy', 'accessibility'],
  12,
  true,
  false,
  8,
  true
),
(
  '20000000-0000-0000-0000-000000000003',
  'Omar Alami',
  'omar@example.com',
  'Frankfurt, Germany',
  'marrakech',
  ARRAY['agriculture', 'tech'],
  ARRAY['IoT', 'sensors', 'data analytics'],
  10,
  true,
  true,
  6,
  false
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE MENTOR MATCHES
-- ============================================

INSERT INTO mentor_matches (
  idea_id,
  mentor_id,
  match_score,
  match_reason,
  matched_by,
  status
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  0.95,
  'Perfect match: Healthcare expertise, medical devices experience',
  'auto',
  'accepted'
),
(
  '10000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000002',
  0.90,
  'Strong match: Education expertise, edtech background',
  'auto',
  'pending'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE CONSENTS
-- ============================================

INSERT INTO consents (
  user_id,
  phone_hash,
  consent_type,
  granted,
  consent_version,
  consent_method,
  ip_address,
  user_agent
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0',
  'submission',
  true,
  '1.0.0',
  'web',
  '192.168.1.1',
  'Mozilla/5.0...'
),
(
  '00000000-0000-0000-0000-000000000001',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0',
  'analysis',
  true,
  '1.0.0',
  'web',
  '192.168.1.1',
  'Mozilla/5.0...'
),
(
  '00000000-0000-0000-0000-000000000002',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd1',
  'submission',
  true,
  '1.0.0',
  'whatsapp',
  NULL,
  NULL
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE SELF-ASK RESPONSES
-- ============================================

INSERT INTO self_ask_responses (
  idea_id,
  user_id,
  question_id,
  original_text,
  extracted_data,
  entities,
  sentiment,
  confidence,
  language_detected
) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'q1',
  'L-fellahin w l-m7asla kaykhdaw bzaf dyal wa9t',
  '{"segmentSize": 5000, "segment": "farmers and agricultural workers"}',
  '{"locations": ["marrakech"], "numbers": [5000]}',
  'neutral',
  0.85,
  'darija'
),
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'q2',
  'Khlass dfa3 50 dh kol shahar',
  '{"amount": 50, "currency": "MAD", "frequency": "monthly"}',
  '{"prices": [50], "currencies": ["MAD"]}',
  'positive',
  0.90,
  'darija'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check counts
SELECT 
  'Users' AS table_name, COUNT(*) AS count FROM secure_users
UNION ALL
SELECT 'Ideas', COUNT(*) FROM marrai_ideas
UNION ALL
SELECT 'Clarity Scores', COUNT(*) FROM clarity_scores
UNION ALL
SELECT 'Decision Scores', COUNT(*) FROM decision_scores
UNION ALL
SELECT 'Receipts', COUNT(*) FROM idea_receipts
UNION ALL
SELECT 'Upvotes', COUNT(*) FROM idea_upvotes
UNION ALL
SELECT 'Comments', COUNT(*) FROM idea_comments
UNION ALL
SELECT 'Mentors', COUNT(*) FROM mentors
UNION ALL
SELECT 'Mentor Matches', COUNT(*) FROM mentor_matches
UNION ALL
SELECT 'Consents', COUNT(*) FROM consents
UNION ALL
SELECT 'Self-Ask Responses', COUNT(*) FROM self_ask_responses;

