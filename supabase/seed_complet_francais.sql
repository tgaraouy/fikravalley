-- ============================================
-- MarrAI Idea Bank - Données de Test Complètes (Français)
-- ============================================
-- Ce script crée des données de test complètes pour toutes les tables
-- Toutes les données sont en français
-- 
-- IMPORTANT: Exécutez d'abord toutes les migrations avant ce script
-- ============================================

-- ============================================
-- 1. UTILISATEURS SÉCURISÉS (marrai_secure_users)
-- ============================================

-- Note: Les données réelles utilisent le chiffrement, ici on utilise des valeurs de test
INSERT INTO marrai_secure_users (
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
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0', -- hash de "212612345678"
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
),
(
  '00000000-0000-0000-0000-000000000003',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd2',
  'encrypted_name_3',
  'iv_3',
  'tag_3',
  'user3@anonymous.fikravalley.com',
  true,
  NOW(),
  NOW() + INTERVAL '90 days'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. IDÉES PRINCIPALES (marrai_ideas)
-- ============================================

INSERT INTO marrai_ideas (
  title,
  problem_statement,
  proposed_solution,
  category,
  location,
  current_manual_process,
  digitization_opportunity,
  frequency,
  data_sources,
  integration_points,
  ai_capabilities_needed,
  roi_time_saved_hours,
  roi_cost_saved_eur,
  estimated_cost,
  submitter_name,
  submitter_email,
  submitter_phone,
  submitter_type,
  submitter_skills,
  status,
  qualification_tier,
  featured,
  visible,
  submitted_via,
  alignment,
  automation_potential,
  agent_type,
  human_in_loop,
  priority
) VALUES
-- Idée 1: Assistant IA pour Réunions
(
  'Assistant IA pour Réunions - Transcription et Suivi Automatique',
  'Les professionnels perdent des heures à prendre des notes pendant les réunions et à faire le suivi des actions. Les réunions Zoom/Teams génèrent beaucoup de contenu mais peu de valeur actionnable.',
  'Un assistant IA qui rejoint les appels, enregistre, transcrit, résume automatiquement et génère des listes de tâches. Intégration avec Slack/Notion pour créer automatiquement des tickets et rappels.',
  'tech',
  'casablanca',
  'Les participants prennent des notes manuellement, oublient des détails, et doivent faire le suivi manuellement après la réunion.',
  'Utilisation de l''API OpenAI pour transcription + résumé, SDK Zoom/Teams pour intégration, et APIs Slack/Notion pour automatisation des actions.',
  'daily',
  ARRAY['zoom', 'teams', 'slack', 'notion'],
  ARRAY['Zoom API', 'Microsoft Teams API', 'Slack API', 'Notion API'],
  ARRAY['transcription', 'résumé', 'extraction_tâches'],
  10.5,
  500.00,
  '5K-10K',
  'Ahmed Benali',
  'ahmed.benali@example.com',
  '+212612345678',
  'entrepreneur',
  ARRAY['développement', 'IA', 'productivité'],
  'analyzed',
  'qualified',
  true,
  true,
  'web',
  '{"moroccoPriorities": ["Digital Morocco 2025", "Vision 2030"], "sdgTags": ["SDG 8", "SDG 9"], "sdgAutoTagged": true, "sdgConfidence": {"SDG 8": 0.85, "SDG 9": 0.90}}'::jsonb,
  'high',
  'workflow_agent',
  true,
  'high'
),
-- Idée 2: Gestion Intelligente des Emails
(
  'Gestion Intelligente des Emails - Copilot pour Boîte de Réception',
  'Les boîtes de réception débordent et drainent la productivité. Les professionnels passent 2-3 heures par jour à trier et répondre aux emails, avec beaucoup de bruit et peu de signal.',
  'IA qui priorise les emails, rédige des réponses, et route automatiquement vers les bons dossiers. Apprend des patterns de l''utilisateur pour améliorer la pertinence.',
  'tech',
  'rabat',
  'Tri manuel des emails, rédaction manuelle de réponses, organisation manuelle en dossiers.',
  'NLP pour comprendre le contexte, génération de réponses personnalisées, classification automatique par priorité/urgence.',
  'multiple_daily',
  ARRAY['gmail', 'outlook', 'exchange'],
  ARRAY['Gmail API', 'Microsoft Graph API'],
  ARRAY['nlp', 'génération', 'classification'],
  15.0,
  750.00,
  '3K-5K',
  'Fatima Alami',
  'fatima.alami@example.com',
  '+212612345679',
  'professional',
  ARRAY['productivité', 'automatisation'],
  'analyzed',
  'exceptional',
  true,
  true,
  'web',
  '{"moroccoPriorities": ["Digital Morocco 2025"], "sdgTags": ["SDG 8"], "sdgAutoTagged": true, "sdgConfidence": {"SDG 8": 0.92}}'::jsonb,
  'high',
  'workflow_agent',
  true,
  'critical'
),
-- Idée 3: Diagnostic Médical IA
(
  'Diagnostic Médical IA - Assistant pour Radiologues',
  'Les radiologues font face à des charges de travail élevées pour interpréter les radiographies, scanners CT, IRM. Les cas urgents peuvent être retardés.',
  'IA qui pré-examine les images, signale les anomalies, et priorise les cas urgents. Aide le radiologue à se concentrer sur les cas complexes.',
  'health',
  'casablanca',
  'Examen manuel de toutes les images, pas de priorisation automatique, risque de manquer des anomalies subtiles.',
  'Computer vision CNNs + parsing DICOM + intégration PACS hospitalier pour workflow automatisé.',
  'daily',
  ARRAY['images_dicom', 'pacs', 'ris'],
  ARRAY['PACS', 'RIS', 'DICOM'],
  ARRAY['computer_vision', 'détection_anomalies'],
  20.0,
  2000.00,
  '10K+',
  'Dr. Youssef Idrissi',
  'youssef.idrissi@example.com',
  '+212612345680',
  'professional',
  ARRAY['santé', 'IA', 'imagerie_médicale'],
  'analyzed',
  'exceptional',
  true,
  true,
  'web',
  '{"moroccoPriorities": ["Healthcare Improvement"], "sdgTags": ["SDG 3"], "sdgAutoTagged": true, "sdgConfidence": {"SDG 3": 0.95}}'::jsonb,
  'high',
  'data_agent',
  true,
  'critical'
),
-- Idée 4: Tuteur IA Personnalisé
(
  'Tuteur IA Personnalisé - Apprentissage Adaptatif',
  'Les étudiants apprennent à des rythmes différents mais les classes avancent à une seule vitesse. Pas de personnalisation de l''enseignement.',
  'Tuteur IA qui adapte les explications, exemples, et niveaux de difficulté à chaque apprenant. Apprentissage adaptatif en temps réel.',
  'education',
  'fes',
  'Enseignement uniforme pour tous, pas d''adaptation au rythme individuel, feedback limité.',
  'GPT fine-tuné pour pédagogie + algorithmes d''apprentissage adaptatif + app mobile/web.',
  'daily',
  ARRAY['cours', 'exercices', 'évaluations'],
  ARRAY['LMS', 'SIS'],
  ARRAY['nlp', 'adaptation', 'recommandation'],
  12.0,
  600.00,
  '5K-10K',
  'Aicha Bensaid',
  'aicha.bensaid@example.com',
  '+212612345681',
  'entrepreneur',
  ARRAY['éducation', 'IA', 'pédagogie'],
  'analyzed',
  'qualified',
  true,
  true,
  'web',
  '{"moroccoPriorities": ["Quality Education"], "sdgTags": ["SDG 4"], "sdgAutoTagged": true, "sdgConfidence": {"SDG 4": 0.88}}'::jsonb,
  'medium',
  'interface_agent',
  true,
  'high'
),
-- Idée 5: Détection de Fraude Financière
(
  'Détection de Fraude Financière - Surveillance en Temps Réel',
  'La fraude coûte des milliards aux institutions financières chaque année. Détection manuelle lente et inefficace.',
  'Modèles IA qui surveillent les transactions en temps réel, signalent les anomalies et activités frauduleuses. Alertes instantanées et blocage automatique.',
  'finance',
  'casablanca',
  'Détection manuelle basée sur règles, réaction lente, beaucoup de faux positifs.',
  'ML de détection d''anomalies + traitement de flux en temps réel + intégration APIs bancaires.',
  'multiple_daily',
  ARRAY['transactions', 'logs', 'historique'],
  ARRAY['Core Banking', 'Payment Gateways'],
  ARRAY['ml', 'détection_anomalies', 'temps_réel'],
  18.0,
  1500.00,
  '10K+',
  'Karim Tazi',
  'karim.tazi@example.com',
  '+212612345682',
  'professional',
  ARRAY['finance', 'sécurité', 'IA'],
  'analyzed',
  'exceptional',
  true,
  true,
  'web',
  '{"moroccoPriorities": ["Vision 2030"], "sdgTags": ["SDG 8", "SDG 16"], "sdgAutoTagged": true, "sdgConfidence": {"SDG 8": 0.90, "SDG 16": 0.85}}'::jsonb,
  'high',
  'decision_agent',
  true,
  'critical'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. SCORES DE CLARTÉ (marrai_clarity_scores)
-- ============================================

-- Récupérer les IDs des idées insérées
DO $$
DECLARE
  idea1_id UUID;
  idea2_id UUID;
  idea3_id UUID;
  idea4_id UUID;
  idea5_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO idea1_id FROM marrai_ideas WHERE title LIKE '%Assistant IA pour Réunions%' LIMIT 1;
  SELECT id INTO idea2_id FROM marrai_ideas WHERE title LIKE '%Gestion Intelligente des Emails%' LIMIT 1;
  SELECT id INTO idea3_id FROM marrai_ideas WHERE title LIKE '%Diagnostic Médical IA%' LIMIT 1;
  SELECT id INTO idea4_id FROM marrai_ideas WHERE title LIKE '%Tuteur IA Personnalisé%' LIMIT 1;
  SELECT id INTO idea5_id FROM marrai_ideas WHERE title LIKE '%Détection de Fraude%' LIMIT 1;

  -- Insérer les scores de clarté
  INSERT INTO marrai_clarity_scores (
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
  (idea1_id, 8.5, 7.5, 8.0, 7.0, 31.0, 7.75, true, 'Problème clair, solution bien définie'),
  (idea2_id, 9.0, 8.5, 9.0, 8.0, 34.5, 8.625, true, 'Excellente clarté, bénéfices mesurables'),
  (idea3_id, 9.5, 9.0, 9.5, 8.5, 36.5, 9.125, true, 'Problème critique, solution innovante'),
  (idea4_id, 8.0, 7.0, 8.5, 7.5, 31.0, 7.75, true, 'Bonne définition, impact éducatif clair'),
  (idea5_id, 9.0, 8.0, 9.0, 8.5, 34.5, 8.625, true, 'Problème majeur, solution technique solide')
  ON CONFLICT (idea_id) DO NOTHING;

  -- ============================================
  -- 4. SCORES DE DÉCISION (marrai_decision_scores)
  -- ============================================

  INSERT INTO marrai_decision_scores (
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
  (idea1_id, 4.5, 4.0, 4.0, 4.5, 17.0, 18, true, true, 'qualified', ARRAY['réunion', 'travail'], 0.3),
  (idea2_id, 5.0, 4.5, 4.5, 5.0, 19.0, 12, true, true, 'exceptional', ARRAY['email', 'bureau'], 0.2),
  (idea3_id, 5.0, 4.0, 5.0, 4.5, 18.5, 20, true, true, 'exceptional', ARRAY['santé', 'médecin'], 0.4),
  (idea4_id, 4.5, 4.0, 4.0, 4.0, 16.5, 22, true, true, 'qualified', ARRAY['école', 'étudiant'], 0.3),
  (idea5_id, 5.0, 4.5, 5.0, 5.0, 19.5, 15, true, true, 'exceptional', ARRAY['banque', 'argent'], 0.3)
  ON CONFLICT (idea_id) DO NOTHING;
END $$;

-- ============================================
-- 5. MENTORS (marrai_mentors)
-- ============================================

INSERT INTO marrai_mentors (
  name,
  email,
  phone,
  location,
  moroccan_city,
  expertise,
  skills,
  years_experience,
  current_role,
  company,
  willing_to_mentor,
  willing_to_cofund,
  max_cofund_amount,
  available_hours_per_month,
  attended_kenitra,
  mgl_member,
  chapter,
  ideas_matched,
  ideas_funded,
  total_cofunded_eur
) VALUES
(
  'Dr. Amine El Fassi',
  'amine.elfassi@example.com',
  '+33612345678',
  'Paris, France',
  'Casablanca',
  ARRAY['health', 'tech'],
  ARRAY['IA', 'santé', 'entrepreneuriat'],
  15,
  ARRAY['CTO', 'Co-fondateur'],
  'HealthTech Solutions',
  true,
  true,
  '50000 EUR',
  10,
  true,
  true,
  'health',
  5,
  2,
  45000.00
),
(
  'Sofia Benkirane',
  'sofia.benkirane@example.com',
  '+14161234567',
  'New York, USA',
  'Rabat',
  ARRAY['education', 'tech'],
  ARRAY['edtech', 'IA', 'pédagogie'],
  12,
  ARRAY['VP Product'],
  'EduTech Global',
  true,
  false,
  NULL,
  8,
  false,
  true,
  'education',
  3,
  1,
  15000.00
),
(
  'Mehdi Alaoui',
  'mehdi.alaoui@example.com',
  '+212612345690',
  'Casablanca, Maroc',
  'Casablanca',
  ARRAY['finance', 'tech'],
  ARRAY['fintech', 'sécurité', 'blockchain'],
  10,
  ARRAY['Directeur Technique'],
  'FinTech Morocco',
  true,
  true,
  '30000 EUR',
  12,
  true,
  false,
  'innovation',
  4,
  1,
  20000.00
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 6. MATCHES MENTORS-IDÉES (marrai_mentor_matches)
-- ============================================

DO $$
DECLARE
  idea3_id UUID;
  idea4_id UUID;
  idea5_id UUID;
  mentor1_id UUID;
  mentor2_id UUID;
  mentor3_id UUID;
BEGIN
  -- Récupérer les IDs
  SELECT id INTO idea3_id FROM marrai_ideas WHERE title LIKE '%Diagnostic Médical IA%' LIMIT 1;
  SELECT id INTO idea4_id FROM marrai_ideas WHERE title LIKE '%Tuteur IA Personnalisé%' LIMIT 1;
  SELECT id INTO idea5_id FROM marrai_ideas WHERE title LIKE '%Détection de Fraude%' LIMIT 1;
  SELECT id INTO mentor1_id FROM marrai_mentors WHERE email = 'amine.elfassi@example.com' LIMIT 1;
  SELECT id INTO mentor2_id FROM marrai_mentors WHERE email = 'sofia.benkirane@example.com' LIMIT 1;
  SELECT id INTO mentor3_id FROM marrai_mentors WHERE email = 'mehdi.alaoui@example.com' LIMIT 1;

  -- Insérer les matches
  INSERT INTO marrai_mentor_matches (
    idea_id,
    mentor_id,
    match_score,
    match_reason,
    matched_by,
    status
  ) VALUES
  (idea3_id, mentor1_id, 0.95, 'Expertise parfaite en IA médicale et santé', 'auto', 'pending'),
  (idea4_id, mentor2_id, 0.90, 'Expérience solide en edtech et pédagogie', 'auto', 'pending'),
  (idea5_id, mentor3_id, 0.92, 'Expertise fintech et sécurité financière', 'auto', 'pending')
  ON CONFLICT (idea_id, mentor_id) DO NOTHING;
END $$;

-- ============================================
-- 7. IDÉES DE CONVERSATION (marrai_conversation_ideas)
-- ============================================

INSERT INTO marrai_conversation_ideas (
  speaker_quote,
  speaker_context,
  speaker_email,
  problem_title,
  problem_statement,
  current_manual_process,
  proposed_solution,
  category,
  digitization_opportunity,
  confidence_score,
  extraction_reasoning,
  needs_clarification,
  validation_question,
  status
) VALUES
(
  'Au Maroc, il y a beaucoup de problèmes avec le nettoyage des rues, surtout dans les villes touristiques comme Fez. On veut trouver un moyen digital pour résoudre ce problème.',
  'Participant workshop - Expert environnement',
  'participant1@example.com',
  'Nettoyage Intelligent des Rues',
  'Les rues des villes touristiques marocaines souffrent de problèmes de nettoyage. Manque d''infrastructure et de coordination pour un nettoyage efficace.',
  'Nettoyage manuel avec camions, pas de suivi en temps réel, coordination difficile entre services.',
  'Plateforme digitale qui connecte citoyens, services municipaux et entreprises de nettoyage. Détection automatique des zones sales via IA et optimisation des itinéraires.',
  'infrastructure',
  'IA de vision pour détecter les zones sales, optimisation d''itinéraires, application mobile citoyenne',
  0.88,
  'Problème clairement identifié avec contexte géographique et solution digitale proposée',
  false,
  NULL,
  'promoted_to_idea'
),
(
  'Les femmes dans les montagnes ont du mal à vendre leurs produits artisanaux. Pas d''accès aux marchés.',
  'Artisane de l''Atlas - Workshop Kenitra',
  'artisane1@example.com',
  'Marché Digital pour Artisanat de Montagne',
  'Les artisanes des zones montagneuses n''ont pas accès aux marchés pour vendre leurs produits artisanaux traditionnels.',
  'Vente locale uniquement, pas de visibilité en ligne, difficultés de transport vers les villes.',
  'Plateforme e-commerce spécialisée pour l''artisanat marocain avec livraison et paiement mobile. Formation digitale pour les artisanes.',
  'inclusion',
  'E-commerce, paiement mobile, logistique, formation digitale',
  0.85,
  'Problème social clair avec impact sur l''inclusion économique des femmes',
  true,
  'Quels types de produits artisanaux souhaitez-vous vendre en priorité?',
  'speaker_contacted'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. VALIDATIONS DE PROBLÈMES (marrai_problem_validations)
-- ============================================

DO $$
DECLARE
  idea1_id UUID;
  idea2_id UUID;
BEGIN
  SELECT id INTO idea1_id FROM marrai_ideas WHERE title LIKE '%Assistant IA pour Réunions%' LIMIT 1;
  SELECT id INTO idea2_id FROM marrai_ideas WHERE title LIKE '%Gestion Intelligente des Emails%' LIMIT 1;

  INSERT INTO marrai_problem_validations (
    idea_id,
    validator_ip,
    validator_user_agent,
    comment
  ) VALUES
  (idea1_id, '192.168.1.100', 'Mozilla/5.0...', 'J''ai exactement ce problème dans mon entreprise!'),
  (idea1_id, '192.168.1.101', 'Mozilla/5.0...', 'Très pertinent pour les équipes distantes'),
  (idea2_id, '192.168.1.102', 'Mozilla/5.0...', 'Mon inbox déborde, cette solution serait parfaite')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 9. UPVOTES (marrai_idea_upvotes)
-- ============================================

DO $$
DECLARE
  idea1_id UUID;
  idea2_id UUID;
  idea3_id UUID;
  user1_id UUID;
  user2_id UUID;
BEGIN
  SELECT id INTO idea1_id FROM marrai_ideas WHERE title LIKE '%Assistant IA pour Réunions%' LIMIT 1;
  SELECT id INTO idea2_id FROM marrai_ideas WHERE title LIKE '%Gestion Intelligente des Emails%' LIMIT 1;
  SELECT id INTO idea3_id FROM marrai_ideas WHERE title LIKE '%Diagnostic Médical IA%' LIMIT 1;
  SELECT id INTO user1_id FROM marrai_secure_users WHERE anonymous_email = 'user1@anonymous.fikravalley.com' LIMIT 1;
  SELECT id INTO user2_id FROM marrai_secure_users WHERE anonymous_email = 'user2@anonymous.fikravalley.com' LIMIT 1;

  INSERT INTO marrai_idea_upvotes (
    idea_id,
    user_id
  ) VALUES
  (idea1_id, user1_id),
  (idea1_id, user2_id),
  (idea2_id, user1_id),
  (idea3_id, user2_id)
  ON CONFLICT (idea_id, user_id) DO NOTHING;
END $$;

-- ============================================
-- 10. COMMENTAIRES (marrai_idea_comments)
-- ============================================

DO $$
DECLARE
  idea1_id UUID;
  idea2_id UUID;
  user1_id UUID;
BEGIN
  SELECT id INTO idea1_id FROM marrai_ideas WHERE title LIKE '%Assistant IA pour Réunions%' LIMIT 1;
  SELECT id INTO idea2_id FROM marrai_ideas WHERE title LIKE '%Gestion Intelligente des Emails%' LIMIT 1;
  SELECT id INTO user1_id FROM marrai_secure_users WHERE anonymous_email = 'user1@anonymous.fikravalley.com' LIMIT 1;

  INSERT INTO marrai_idea_comments (
    idea_id,
    comment,
    comment_type
  ) VALUES
  (idea1_id, 'Excellente idée! L''intégration avec Notion serait vraiment utile.', 'support'),
  (idea2_id, 'Question: Est-ce que ça fonctionne avec Gmail et Outlook?', 'question')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Compter les données insérées
SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count
FROM marrai_ideas
UNION ALL
SELECT 
  'marrai_mentors',
  COUNT(*)
FROM marrai_mentors
UNION ALL
SELECT 
  'marrai_mentor_matches',
  COUNT(*)
FROM marrai_mentor_matches
UNION ALL
SELECT 
  'marrai_conversation_ideas',
  COUNT(*)
FROM marrai_conversation_ideas
UNION ALL
SELECT 
  'marrai_clarity_scores',
  COUNT(*)
FROM marrai_clarity_scores
UNION ALL
SELECT 
  'marrai_decision_scores',
  COUNT(*)
FROM marrai_decision_scores
UNION ALL
SELECT 
  'marrai_secure_users',
  COUNT(*)
FROM marrai_secure_users
UNION ALL
SELECT 
  'marrai_problem_validations',
  COUNT(*)
FROM marrai_problem_validations
UNION ALL
SELECT 
  'marrai_idea_upvotes',
  COUNT(*)
FROM marrai_idea_upvotes
UNION ALL
SELECT 
  'marrai_idea_comments',
  COUNT(*)
FROM marrai_idea_comments;

-- Afficher un échantillon des idées visibles
SELECT 
  id,
  title,
  category,
  location,
  status,
  qualification_tier,
  visible,
  featured
FROM marrai_ideas
WHERE visible = true
ORDER BY created_at DESC
LIMIT 10;

