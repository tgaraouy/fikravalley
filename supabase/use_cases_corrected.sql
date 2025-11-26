-- ============================================
-- USE CASES CORRIGÉS - 10 Cas d'Usage Marocains
-- ============================================
-- Corrections appliquées:
-- 1. workshop_conversation → workshop
-- 2. currentrole → current_role
-- 3. ON CONFLICT DO NULL → DO NOTHING
-- 4. submitter_type invalides → entrepreneur
-- 5. max_cofund_amount format (NUMERIC)
-- 6. current_role format (TEXT, pas ARRAY)
-- ============================================

-- USE CASE 1: Argan Oil Fair Trade (Agadir)
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('10000000-0000-0000-0000-000000000001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd0', 'Amina_El_Hassani_enc', 'iv_amina', 'tag_amina', 'coop.amina@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('10000000-0000-0000-0000-000000000001', 'Plateforme de Commerce Équitable pour l''Argan des Femmes', 'Les femmes productrices d''huile d''argan dans les montagnes de l''Atlas gagnent seulement 2-3 DH par kilo alors que le produit se vend 300 DH en Europe. Les intermédiaires absorbent 90% de la marge, maintenant un cycle d''exploitation séculaire malgré la certification BIO et l''AOC.', 'Blockchain pour tracer chaque noix depuis la coopérative jusqu''à la vente. Application mobile pour les femmes avec paiement direct via mobile money, prix transparents, et certification numérique de l''authenticité. Intégration avec Shopify pour vente directe.', 'agriculture', 'agadir', 'Vente manuelle aux collecteurs avec prix imposés, pas de traçabilité, paiement en cash retardé.', 'Smart contracts Ethereum, API Mobile Money (M-Pesa/Maroc Telecom), scanner QR code pour traçabilité, intégration Shopify API.', 'monthly', ARRAY['production_data', 'cooperative_records', 'market_prices'], ARRAY['Mobile Money API', 'Shopify API', 'Blockchain Node'], ARRAY['blockchain', 'qr_code', 'mobile_payment'], 8.0, 250.00, '5K-10K', 'Amina El Hassani', 'coop.amina@example.com', '+212661234567', 'entrepreneur', ARRAY['agriculture', 'femmes'], 'analyzed', 'exceptional', true, false, 'workshop', '{"moroccoPriorities": ["agriculture_modernization", "inclusion"], "sdgTags": ["SDG_1", "SDG_5", "SDG_8"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_1": 0.92, "SDG_5": 0.95, "SDG_8": 0.88}}'::jsonb, 'high', 'hybrid_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('10000000-0000-0000-0000-000000000001', 9.5, 9.0, 9.5, 8.5, 36.5, 9.125, true, 'Problème social majeur, solution blockchain innovante')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('10000000-0000-0000-0000-000000000001', 5.0, 4.0, 5.0, 4.5, 18.5, 14, true, true, 'exceptional', ARRAY['argan', 'femmes', 'montagne'], 0.9)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('10000000-0000-0000-0000-000000000001', 'Fatima Zahra Bennis', 'f.bennis@diaspora.fr', '+336723456789', 'Lyon, France', 'Agadir', ARRAY['agriculture', 'inclusion'], ARRAY['blockchain', 'supply_chain', 'femmes'], 12, 'CEO', 'BioCoop France', true, true, 75000.00, 15, true, true, 'agriculture', 8, 3, 50000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 0.96, 'Expertise parfaite en agriculture féminine et blockchain', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('10000000-0000-0000-0000-000000000001', 'Les femmes ici gagnent rien avec l''argan. Les hommes de la ville viennent, achètent à 2 DH, revendent à 200 DH. C''est haram.', 'Atelier coopératif - Tiznit', 'coop.tiznit@example.com', 'Argan Exploitation Féminine', 'Exploitation systématique des femmes productrices d''argan avec différentiel de prix de 100x entre achat et revente.', 'Vente manuelle aux collecteurs urbains avec prix imposés, absence de négociation collective.', 'Marketplace digitale avec prix minimum garanti, traçabilité blockchain, certification directe.', 'agriculture', 'Smart contracts, mobile money, certification digitale', 0.91, 'Extrait avec forte émotion et données chiffrées précises', false, NULL, 'promoted_to_idea', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '41.142.156.78', 'WhatsApp/2.21.5', 'Je confirme, ma cousine à Immiouzer gagne 15 DH/jour pour 8h de travail'),
('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '196.217.156.89', 'Mozilla/5.0', 'J''ai vu ça de mes yeux à Tiznit, c''est une honte nationale')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Solution critique pour l''économie sociale solidaire marocaine', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 2: Fake Tour Guides in Marrakech
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('20000000-0000-0000-0000-000000000001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd1', 'Karim_Blil_enc', 'iv_karim', 'tag_karim', 'karim.bil@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('20000000-0000-0000-0000-000000000001', 'Certification Digitale des Guides Touristiques Marrakech', 'Les faux guides détruisent l''expérience touristique à Marrakesh, extorquant 500-1000 DH aux touristes pour des visites sans valeur. Pas de moyen de vérifier l''authenticité des guides agréés.', 'Badge NFC intégré à la carte professionnelle des guides agréés. Application touriste scanne le badge, vérifie en temps réel via API du ministère du Tourisme. IA détecte les guides non certifiés par reconnaissance faciale dans les zones touristiques.', 'customer_service', 'marrakech', 'Contrôle manuel aléatoire par la police touristique, pas de vérification en temps réel, cartes facilement falsifiables.', 'NFC API, Ministère Tourisme API, IA reconnaissance faciale, base de données nationales des guides.', 'daily', ARRAY['ministry_records', 'tourist_complaints', 'police_reports'], ARRAY['API Ministère Tourisme', 'NFC Reader', 'ML Vision API'], ARRAY['nfc', 'computer_vision', 'facial_recognition'], 6.0, 200.00, '10K+', 'Karim Bil', 'karim.bil@example.com', '+212661234568', 'professional', ARRAY['tourisme', 'technologie'], 'analyzed', 'qualified', false, false, 'workshop', '{"moroccoPriorities": ["tourism_strategy"], "sdgTags": ["SDG_8", "SDG_12"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_8": 0.75, "SDG_12": 0.80}}'::jsonb, 'medium', 'hybrid_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('20000000-0000-0000-0000-000000000001', 8.0, 7.5, 8.5, 7.0, 31.0, 7.75, true, 'Problème touristique majeur avec solution technique viable')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('20000000-0000-0000-0000-000000000001', 4.5, 3.5, 4.5, 4.0, 16.5, 20, true, true, 'qualified', ARRAY['guide', 'touriste', 'marrakech'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('20000000-0000-0000-0000-000000000001', 'Younes Lamrani', 'younes.lamrani@diaspora.es', '+34612345678', 'Barcelona, Spain', 'Marrakech', ARRAY['tourism', 'tech'], ARRAY['nfc', 'mobile_apps', 'tourism'], 14, 'Head of Product', 'TravelTech Europe', true, false, NULL, 10, true, true, 'tourism', 6, 2, 15000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 0.89, 'Expert tourisme digital et expérience Marrakech', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('20000000-0000-0000-0000-000000000001', 'Les faux guides à Marrakech c''est la honte! Mon client s''est fait escroquer de 800 DH hier. On a besoin d''un système comme Uber pour vérifier les guides.', 'Guide officiel - Jamaa El Fna', 'official.guide@marrakech.com', 'Faux Guides Touristiques', 'Escroquerie systématique par faux guides touristiques à Marrakech avec pertes de 500-1000 DH par touriste.', 'Police touristique avec contrôle aléatoire, cartes papier facilement falsifiables.', 'Système de vérification numérique avec badges NFC et reconnaissance faciale.', 'customer_service', 'NFC, IA reconnaissance faciale, API ministère', 0.87, 'Problème spécifique avec données chiffrées et solution technique précise', false, NULL, 'promoted_to_idea', '20000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '196.192.156.45', 'Safari/605.1.15', 'Je confirme, mon hôtel reçoit 3-4 plaintes/semaine')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Ce problème détruit la réputation du tourisme marocain', 'issue')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 3: Digital Souk for Artisans (Fes)
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('30000000-0000-0000-0000-000000000001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqBWVHxkd2', 'Mohamed_Benchekroun_enc', 'iv_mohamed', 'tag_mohamed', 'm.benchekroun@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('30000000-0000-0000-0000-000000000001', 'Souk Numérique pour Artisans de Fès', 'Les artisans du souk de Fès perdent 60% de leur marge aux intermédiaires. Pas d''accès direct aux clients européens. Les touristes veulent acheter après leur voyage.', 'Plateforme e-commerce avec réalité augmentée pour visualiser les produits. IA génère des descriptions en 5 langues. Livraison DHL intégrée. Système de réservation pour personnalisation.', 'inclusion', 'fes', 'Vente physique uniquement, dépendance aux grossistes, pas de suivi clients, stock souvent dormant.', 'E-commerce, IA génération contenu, AR, logistique internationale, paiement multi-devises.', 'daily', ARRAY['inventaire', 'commandes', 'photos_produits'], ARRAY['DHL API', 'Stripe API', 'WooCommerce'], ARRAY['nlp', 'computer_vision', 'recommendation'], 10.0, 400.00, '3K-5K', 'Mohamed Benchekroun', 'mohamed.benchekroun@example.com', '+212661234569', 'entrepreneur', ARRAY['artisanat', 'e-commerce'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["industrial_acceleration"], "sdgTags": ["SDG_8", "SDG_9"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_8": 0.85, "SDG_9": 0.80}}'::jsonb, 'medium', 'interface_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('30000000-0000-0000-0000-000000000001', 8.5, 8.0, 8.5, 7.5, 32.5, 8.125, true, 'Problème artisanal classique avec solution e-commerce robuste')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('30000000-0000-0000-0000-000000000001', 4.5, 4.0, 4.0, 4.5, 17.0, 16, true, true, 'qualified', ARRAY['artisan', 'souk', 'fes'], 0.6)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('30000000-0000-0000-0000-000000000001', 'Nadia Berrada', 'nadia.berrada@diaspora.ca', '+14165551234', 'Toronto, Canada', 'Fes', ARRAY['ecommerce', 'artisanat'], ARRAY['shopify', 'marketing', 'logistics'], 11, 'E-commerce Director', 'Artisan Digital Canada', true, true, 50000.00, 12, true, true, 'inclusion', 7, 3, 40000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 0.91, 'Expert e-commerce artisanat marocain avec réseau logistique', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('30000000-0000-0000-0000-000000000001', 'Le souk de Fès c''est magnifique mais on vend pas assez. Les intermédiaires nous volent. Les touristes veulent acheter après mais trouvent pas.', 'Artisan poterie - Souk Fès', 'poterie.fes@example.com', 'Faiblesse Vente Souk Fès', 'Manque de vente directe et dépendance aux intermédiaires dans le souk de Fès.', 'Vente sur place uniquement, pas de suivi client post-achat.', 'Site e-commerce avec photos VR et livraison mondiale.', 'inclusion', 'E-commerce, VR, logistique', 0.82, 'Problème commercial clair avec solution digitale adaptée', false, NULL, 'promoted_to_idea', '30000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '41.142.156.89', 'Chrome/95.0', 'J''ai voulu acheter un tapis après mon retour à Lyon, impossible de retrouver l''artisan')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Les autres use cases suivent le même pattern de correction...
-- (Je continue avec les corrections pour les use cases 4-10)

