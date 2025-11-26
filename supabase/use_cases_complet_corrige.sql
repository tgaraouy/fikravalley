-- ============================================
-- USE CASES COMPLET CORRIGÉ - 10 Cas d'Usage Marocains
-- ============================================
-- Corrections appliquées:
-- 1. workshop_conversation → workshop
-- 2. currentrole → current_role
-- 3. ON CONFLICT DO NULL → DO NOTHING
-- 4. submitter_type invalides → entrepreneur
-- 5. max_cofund_amount format (NUMERIC)
-- 6. current_role format (TEXT, pas ARRAY)
-- 7. phone_hash uniques pour chaque utilisateur
-- ============================================

-- USE CASE 1: Argan Oil Fair Trade (Agadir)
-- Phone: +212661234567
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('10000000-0000-0000-0000-000000000001', '$2b$12$QBK8zJA9D99Jt/qWip3OWuzVY7sjAd0tqZwAeDmiVLKUBoYSRLhTi', 'Amina_El_Hassani_enc', 'iv_amina', 'tag_amina', 'coop.amina@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('10000000-0000-0000-0000-000000000001', 'Plateforme de Commerce Équitable pour l''Argan des Femmes', 'Les femmes productrices d''huile d''argan dans les montagnes de l''Atlas gagnent seulement 2-3 DH par kilo alors que le produit se vend 300 DH en Europe. Les intermédiaires absorbent 90% de la marge, maintenant un cycle d''exploitation séculaire malgré la certification BIO et l''AOC.', 'Blockchain pour tracer chaque noix depuis la coopérative jusqu''à la vente. Application mobile pour les femmes avec paiement direct via mobile money, prix transparents, et certification numérique de l''authenticité. Intégration avec Shopify pour vente directe.', 'agriculture', 'agadir', 'Vente manuelle aux collecteurs avec prix imposés, pas de traçabilité, paiement en cash retardé.', 'Smart contracts Ethereum, API Mobile Money (M-Pesa/Maroc Telecom), scanner QR code pour traçabilité, intégration Shopify API.', 'monthly', ARRAY['production_data', 'cooperative_records', 'market_prices'], ARRAY['Mobile Money API', 'Shopify API', 'Blockchain Node'], ARRAY['blockchain', 'qr_code', 'mobile_payment'], 8.0, 250.00, '5K-10K', 'Amina El Hassani', 'coop.amina@example.com', '+212661234567', 'entrepreneur', ARRAY['agriculture', 'femmes'], 'analyzed', 'exceptional', true, false, 'web', '{"moroccoPriorities": ["agriculture_modernization", "inclusion"], "sdgTags": ["SDG_1", "SDG_5", "SDG_8"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_1": 0.92, "SDG_5": 0.95, "SDG_8": 0.88}}'::jsonb, 'high', 'hybrid_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('10000000-0000-0000-0000-000000000001', 9.5, 9.0, 9.5, 8.5, 36.5, 9.125, true, 'Problème social majeur, solution blockchain innovante')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('10000000-0000-0000-0000-000000000001', 5.0, 4.0, 5.0, 4.5, 18.5, 14, true, true, 'exceptional', ARRAY['argan', 'femmes', 'montagne'], 0.9)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('10000000-0000-0000-0000-000000000001', 'Fatima Zahra Bennis', 'f.bennis@diaspora.fr', '+336723456789', 'Lyon, France', 'Agadir', ARRAY['agriculture', 'inclusion'], ARRAY['blockchain', 'supply_chain', 'femmes'], 12, ARRAY['CEO'], 'BioCoop France', true, true, 75000.00, 15, true, true, 'agriculture', 8, 3, 50000.00)
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
-- Phone: +212661234568
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('20000000-0000-0000-0000-000000000001', '$2b$12$9yI3dw4lYnKPCwNEMz8a3ejMVQup85cMlEDZk8YfuphWsy.59YR8e', 'Karim_Blil_enc', 'iv_karim', 'tag_karim', 'karim.bil@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('20000000-0000-0000-0000-000000000001', 'Certification Digitale des Guides Touristiques Marrakech', 'Les faux guides détruisent l''expérience touristique à Marrakesh, extorquant 500-1000 DH aux touristes pour des visites sans valeur. Pas de moyen de vérifier l''authenticité des guides agréés.', 'Badge NFC intégré à la carte professionnelle des guides agréés. Application touriste scanne le badge, vérifie en temps réel via API du ministère du Tourisme. IA détecte les guides non certifiés par reconnaissance faciale dans les zones touristiques.', 'customer_service', 'marrakech', 'Contrôle manuel aléatoire par la police touristique, pas de vérification en temps réel, cartes facilement falsifiables.', 'NFC API, Ministère Tourisme API, IA reconnaissance faciale, base de données nationales des guides.', 'daily', ARRAY['ministry_records', 'tourist_complaints', 'police_reports'], ARRAY['API Ministère Tourisme', 'NFC Reader', 'ML Vision API'], ARRAY['nfc', 'computer_vision', 'facial_recognition'], 6.0, 200.00, '10K+', 'Karim Bil', 'karim.bil@example.com', '+212661234568', 'professional', ARRAY['tourisme', 'technologie'], 'analyzed', 'qualified', false, false, 'web', '{"moroccoPriorities": ["tourism_strategy"], "sdgTags": ["SDG_8", "SDG_12"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_8": 0.75, "SDG_12": 0.80}}'::jsonb, 'medium', 'hybrid_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('20000000-0000-0000-0000-000000000001', 8.0, 7.5, 8.5, 7.0, 31.0, 7.75, true, 'Problème touristique majeur avec solution technique viable')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('20000000-0000-0000-0000-000000000001', 4.5, 3.5, 4.5, 4.0, 16.5, 20, true, true, 'qualified', ARRAY['guide', 'touriste', 'marrakech'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('20000000-0000-0000-0000-000000000001', 'Younes Lamrani', 'younes.lamrani@diaspora.es', '+34612345678', 'Barcelona, Spain', 'Marrakech', ARRAY['tourism', 'tech'], ARRAY['nfc', 'mobile_apps', 'tourism'], 14, ARRAY['Head of Product'], 'TravelTech Europe', true, false, NULL, 10, true, true, 'tourism', 6, 2, 15000.00)
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
('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Ce problème détruit la réputation du tourisme marocain', 'concern')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 3: Digital Souk for Artisans (Fes)
-- Phone: +212661234569
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('30000000-0000-0000-0000-000000000001', '$2b$12$IuYctcPPYZDtlXBTZmhv7u6A1goOG6fSpR0LQvMHADn53SHfn2Rq.', 'Mohamed_Benchekroun_enc', 'iv_mohamed', 'tag_mohamed', 'm.benchekroun@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '180 days')
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
('30000000-0000-0000-0000-000000000001', 'Nadia Berrada', 'nadia.berrada@diaspora.ca', '+14165551234', 'Toronto, Canada', 'Fes', ARRAY['ecommerce', 'artisanat'], ARRAY['shopify', 'marketing', 'logistics'], 11, ARRAY['E-commerce Director'], 'Artisan Digital Canada', true, true, 50000.00, 12, true, true, 'inclusion', 7, 3, 40000.00)
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

-- USE CASE 4: Zakat Management (Casablanca)
-- Phone: +212661234570
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('40000000-0000-0000-0000-000000000001', '$2b$12$VMXqEbFDEsE//dJnmjrKTetpRHi0KM./Ki2T4ZdjHL7WYvk4Nij6G', 'Hicham_Touissi_enc', 'iv_hicham', 'tag_hicham', 'h.touissi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('40000000-0000-0000-0000-000000000001', 'Zakat Connect - Distribution Transparente de l''Aumône', 'La zakat ramadan est collectée via des boîtes physiques sans traçabilité. 30% des fonds disparaissent avant d''atteindre les bénéficiaires. Pas de ciblage efficace des familles nécessiteuses.', 'Plateforme digitale de collecte et distribution de zakat avec smart contracts sur blockchain. IA cible les familles via données anonymisées (revenu, enfants). QR code pour retrait sécurisé chez partenaires (Marjane, Attijariwafa).', 'finance', 'casablanca', 'Collecte manuelle en espèces, distribution sans traçabilité, risque de détournement.', 'Blockchain, IA de ciblage, paiement QR, API banques partenaires.', 'occasional', ARRAY['census_data', 'banking_data', 'social_services'], ARRAY['API Attijariwafa', 'API Marjane', 'Blockchain API'], ARRAY['blockchain', 'nlp', 'anonymization'], 12.0, 500.00, '10K+', 'Hicham Touissi', 'hicham.touissi@example.com', '+212661234570', 'entrepreneur', ARRAY['finance', 'blockchain'], 'analyzed', 'qualified', true, false, 'whatsapp', '{"moroccoPriorities": ["inclusion"], "sdgTags": ["SDG_1", "SDG_10"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_1": 0.93, "SDG_10": 0.85}}'::jsonb, 'high', 'decision_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('40000000-0000-0000-0000-000000000001', 8.5, 7.0, 9.0, 6.5, 31.0, 7.75, true, 'Problème sociétal majeur avec solution blockchain pertinente')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('40000000-0000-0000-0000-000000000001', 5.0, 3.0, 5.0, 4.5, 17.5, 18, false, true, 'qualified', ARRAY['zakat', 'ramadan', 'aide'], 0.8)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('40000000-0000-0000-0000-000000000001', 'Omar Fassi-Fihri', 'omar.fassifihri@diaspora.fr', '+33698765432', 'Paris, France', 'Casablanca', ARRAY['finance', 'blockchain'], ARRAY['fintech', 'smart_contracts', 'compliance'], 8, ARRAY['CTO'], 'DeFi France', true, true, 100000.00, 20, true, true, 'finance', 5, 2, 75000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 0.94, 'Expert blockchain finance islamique avec réseau bancaire', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('40000000-0000-0000-0000-000000000001', 'La zakat à la mosquée, on sait jamais où ça va. Ma femme a reçu de la famille mais 20% était déjà pris.', 'Bénévole mosquée - Casablanca', 'benevole@mosquee.com', 'Transparence Zakat', 'Manque de transparence dans la collecte et distribution de la zakat ramadan.', 'Collecte manuelle sans traçabilité.', 'Plateforme blockchain transparente.', 'finance', 'Blockchain, smart contracts', 0.84, 'Problème financier religieux avec solution technologique adaptée', false, NULL, 'promoted_to_idea', '40000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '41.142.156.90', 'WhatsApp/2.21.5', 'J''ai vu des histoires de détournement à la mosquée de mon quartier')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Révolutionner la transparence de la zakat au Maroc', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 5: Casablanca Traffic Optimization
-- Phone: +212661234571
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('50000000-0000-0000-0000-000000000001', '$2b$12$.jwKJVNRJfVR/p8KNxJ8quVDTCwZZvbAuZTlwU84Ue/wjEt6nVlca', 'Sara_Benjelloun_enc', 'iv_sara', 'tag_sara', 's.benjelloun@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('50000000-0000-0000-0000-000000000001', 'TrafficFlow Casa - Intelligence Artificielle pour le Trafic Casablancais', 'Les automobilistes casablancais perdent 3 heures/jour dans les embouteillages. Les feux de signalisation sont fixes et ne s''adaptent pas au flux. Le tramway crée des points de blocage imprévisibles.', 'IA qui analyse le flux en temps réel via caméras existantes et ajuste dynamiquement les feux. Prédiction des embouteillages via ML. Application mobile pour proposer des itinéraires alternatifs. Intégration avec le système du tramway.', 'infrastructure', 'casablanca', 'Feux de signalisation fixes, centre de contrôle manuel, pas de prédictions.', 'Vision par ordinateur, ML de série temporelle, API feux de signalisation, application mobile.', 'multiple_daily', ARRAY['traffic_cameras', 'gps_data', 'tramway_logs'], ARRAY['API Ville Casablanca', 'Google Maps API', 'Caméra RTSP'], ARRAY['computer_vision', 'time_series', 'optimization'], 7.0, 180.00, '5K-10K', 'Sara Benjelloun', 'sara.benjelloun@example.com', '+212661234571', 'professional', ARRAY['smart_city', 'ia'], 'analyzed', 'qualified', true, false, 'whatsapp', '{"moroccoPriorities": ["infrastructure"], "sdgTags": ["SDG_11"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_11": 0.88}}'::jsonb, 'high', 'decision_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('50000000-0000-0000-0000-000000000001', 9.0, 8.5, 8.5, 8.0, 34.0, 8.5, true, 'Problème urbain majeur avec solution IA pragmatique')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('50000000-0000-0000-0000-000000000001', 4.5, 4.0, 4.5, 5.0, 18.0, 18, true, true, 'qualified', ARRAY['trafic', 'casablanca', 'voiture'], 0.6)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('50000000-0000-0000-0000-000000000001', 'Reda Benchemsi', 'reda.benchemsi@diaspora.fr', '+33687654321', 'Paris, France', 'Casablanca', ARRAY['infrastructure', 'tech'], ARRAY['computer_vision', 'smart_city', 'ml'], 9, ARRAY['VP Engineering'], 'CityAI France', true, true, 50000.00, 15, true, true, 'tech', 8, 3, 60000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 0.93, 'Expert smart city avec expérience Casablanca', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('50000000-0000-0000-0000-000000000001', 'Casablanca c''est l''horreur tous les jours. J''perds 2h dans mon trajet Anfa-Maarif. Les feux sont débiles.', 'Chauffeur Uber - Casablanca', 'driver.uber@example.com', 'Embouteillages Casa', 'Trafic congestionné à Casablanca avec pertes de temps majeures.', 'Feux fixes et centre de contrôle réactif.', 'IA pour optimiser les feux en temps réel.', 'infrastructure', 'Vision IA, ML, application mobile', 0.88, 'Problème quotidien avec données de terrain précises', false, NULL, 'promoted_to_idea', '50000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '196.217.156.91', 'Chrome/95.0', 'Je perds 3h/jour, ça coûte cher en essence!')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Intégrer les données du BRT aussi', 'suggestion')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 6: Saffron Traceability (Taliouine)
-- Phone: +212661234572
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('60000000-0000-0000-0000-000000000001', '$2b$12$iHv3T4WjSWBsU4DR6/MrbO.CJyuFiq16Vqa/1Xg6XRNY1q7xzjXKe', 'Abdelali_El_Guerrab_enc', 'iv_abdelali', 'tag_abdelali', 'a.elguerrab@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('60000000-0000-0000-0000-000000000001', 'SaffronChain - Traçabilité du Safran de Taliouine', 'Le safran de Taliouine (précieux à 35 000 DH/kg) est fréquemment coupé avec du paprika ou du curcuma. Les exportateurs malhonnêtes gagnent 200% de marge en vendant du faux safran aux épiciers européens. Les agriculteurs certifiés perdent leur réputation.', 'IoT capteurs dans les champs suivant chaque fleur depuis la floraison. QR code sur chaque boîte avec analyse spectroscopique NFT (Near-InfraRed). Smart contracts pour paiement conditionnel à la certification. Marketplace B2B pour vente directe.', 'agriculture', 'other', 'Certification papier facilement contrefaite, pas de validation chimique en temps réel, accès limité aux marchés européens.', 'IoT, spectroscopie NIR, blockchain, smart contracts, marketplace B2B.', 'weekly', ARRAY['iot_sensors', 'spectroscopy_data', 'export_docs'], ARRAY['IoT Hub', 'NIR API', 'EU Customs API'], ARRAY['iot', 'computer_vision', 'blockchain'], 6.0, 800.00, '10K+', 'Abdelali El Guerrab', 'abdelali.elguerrab@example.com', '+212661234572', 'entrepreneur', ARRAY['agriculture', 'export'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["agriculture_modernization"], "sdgTags": ["SDG_1", "SDG_8"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_1": 0.88, "SDG_8": 0.90}}'::jsonb, 'medium', 'data_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('60000000-0000-0000-0000-000000000001', 9.0, 8.5, 9.5, 8.0, 35.0, 8.75, true, 'Problème de fraude alimentaire avec solution IoT sophistiquée')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('60000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.0, 18.5, 22, false, true, 'exceptional', ARRAY['zafrane', 'taliouine', 'faux'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('60000000-0000-0000-0000-000000000001', 'Yasmine Kabbaj', 'yasmine.kabbaj@diaspora.de', '+4915112345678', 'Berlin, Germany', 'Ouarzazate', ARRAY['agriculture', 'tech'], ARRAY['iot', 'food_safety', 'export'], 10, ARRAY['Head of AgTech'], 'AgriTech EU', true, true, 60000.00, 14, true, true, 'agriculture', 6, 2, 45000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 0.89, 'Expert IoT agriculture avec expérience export UE', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('60000000-0000-0000-0000-000000000001', 'On nous vend du faux zafrane à 35 000 DH/kg! Les clients allemands ont détecté du curcuma dans le dernier container. C''est une catastrophe.', 'Coopérative Taliouine - Exportateur', 'export.taliouine@example.com', 'Fraude Safran Taliouine', 'Contamination systématique du safran de Taliouine avec épices moins chères.', 'Certification visuelle uniquement, pas de test chimique.', 'IoT + spectroscopie + blockchain pour garantir pureté.', 'agriculture', 'IoT, NIR, blockchain', 0.90, 'Problème spécifique avec données financières et solution technique', false, NULL, 'promoted_to_idea', '60000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '196.217.156.92', 'WhatsApp/2.21.5', 'Confirmé, mon oncle exportateur a perdu un contrat à cause de ça')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('60000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Protéger la réputation du safran marocain est vital', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 7: Water Management for Khettaras (Ouarzazate)
-- Phone: +212661234573
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('70000000-0000-0000-0000-000000000001', '$2b$12$tYXr8O1.kK7NsSMpp2TmluRHwyqs89i2l.h2b9J76/ICS4MohPYzq', 'Mohammed_El_Bakkali_enc', 'iv_mohammed', 'tag_mohammed', 'm.elbakkali@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('70000000-0000-0000-0000-000000000001', 'KhettaraFlow - Gestion Numérique des Systèmes Hydrauliques Oasiens', 'Les khettaras (systèmes hydrauliques ancestraux) de Ouarzazate tombent en ruine faute de maintenance. 2000 familles dépendent de l''eau mais les fuites sont invisibles jusqu''à ce que tout s''écroule.', 'Capteurs IoT de pression et débit dans les galeries souterraines. IA détecte les fuites par variations de pression. Drone thermique pour cartographie. Application alerte les villageois et la commune pour intervention rapide. Smart contracts pour finance participative des réparations.', 'infrastructure', 'other', 'Inspection visuelle occasionnelle, réparation quand c''est critique, pas de surveillance continue.', 'IoT sous-terrain, IA détection anomalie, drones thermiques, crowdfunding blockchain.', 'weekly', ARRAY['archival_maps', 'village_reports', 'satellite_imagery'], ARRAY['LoRaWAN Network', 'Drone API', 'Blockchain'], ARRAY['iot', 'computer_vision', 'blockchain'], 4.0, 100.00, '3K-5K', 'Mohammed El Bakkali', 'mohammed.elbakkali@example.com', '+212661234573', 'entrepreneur', ARRAY['agriculture', 'eau'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["infrastructure", "green_economy"], "sdgTags": ["SDG_6", "SDG_13"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_6": 0.95, "SDG_13": 0.80}}'::jsonb, 'medium', 'data_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('70000000-0000-0000-0000-000000000001', 9.5, 8.0, 9.5, 7.5, 34.5, 8.625, true, 'Problème patrimonial majeur avec solution IoT innovante')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('70000000-0000-0000-0000-000000000001', 5.0, 4.0, 5.0, 4.0, 18.0, 24, true, true, 'exceptional', ARRAY['khettara', 'eau', 'ouarzazate'], 0.8)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('70000000-0000-0000-0000-000000000001', 'Jamal Laalou', 'jamal.laalou@diaspora.it', '+393331234567', 'Milano, Italy', 'Ouarzazate', ARRAY['infrastructure', 'agriculture'], ARRAY['iot', 'water_management', 'drones'], 13, ARRAY['Lead Engineer'], 'WaterTech Italia', true, true, 40000.00, 16, true, true, 'infrastructure', 5, 1, 30000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 0.92, 'Expert hydraulique avec expérience khettaras', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('70000000-0000-0000-0000-000000000001', 'Notre khettara fuit depuis 3 mois, personne sait où. 300 familles ont plus d''eau. On a besoin de technologie pour voir sous terre.', 'Chef village - Ouarzazate', 'chef.village@ouarzazate.com', 'Khettara en Ruine', 'Système hydraulique ancestral en dégradation sans moyen de détection précoce.', 'Inspection visuelle rare, rupture totale quand ça casse.', 'IoT + drones pour surveillance continue.', 'infrastructure', 'IoT, drones, blockchain crowdfunding', 0.85, 'Problème technique précis avec dimension sociale et culturelle', false, NULL, 'promoted_to_idea', '70000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', '196.217.156.93', 'Mozilla/5.0', 'Mon village a le même problème, 2 khettaras mortes en 2022')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('70000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'Les khettaras sont notre patrimoine, il faut les sauver', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 8: Darija Language Learning App
-- Phone: +212661234574
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('80000000-0000-0000-0000-000000000001', '$2b$12$gl825z756dG5ZX/Lr4Yyg.S51VtMtYwfT70JeYPTyT65lRIon/AKG', 'Leila_Marrakchi_enc', 'iv_leila', 'tag_leila', 'l.marrakchi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('80000000-0000-0000-0000-000000000001', 'DarijaMaster - Apprendre le Darija Marocain aux MRE', 'Les MRE (3 millions) ne comprennent pas leurs enfants qui parlent darija. Les applications existantes enseignent l''arabe classique ou le tunisien. Pas de solution pour le darija marocain avec ses 3 dialectes (Riffain, Chleuh, Hassani).', 'GPT fine-tuné sur corpus darija (YouTube, séries marocaines). Speech-to-text reconnaît l''accent. Exercices interactifs avec IA générant des dialogues typiques (souks, famille). Intégration WhatsApp pour pratiquer avec chatbot.', 'education', 'rabat', 'Cours d''arabe classique inadaptés, pas d''app darija, enfants parlent darija/français, parents perdent lien culturel.', 'NLP darija, STT, TTS fine-tuned, chatbot WhatsApp, gamification.', 'daily', ARRAY['corpora_darija', 'youtube_videos', 'whatsapp_chats'], ARRAY['WhatsApp API', 'GPT API', 'Speech API'], ARRAY['nlp', 'speech_recognition', 'chatbot'], 5.0, 50.00, '1K-3K', 'Leila Marrakchi', 'leila.marrakchi@example.com', '+212661234574', 'entrepreneur', ARRAY['education', 'IA'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["human_capital", "digital_transformation"], "sdgTags": ["SDG_4", "SDG_10"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_4": 0.90, "SDG_10": 0.85}}'::jsonb, 'medium', 'interface_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('80000000-0000-0000-0000-000000000001', 9.0, 8.5, 9.0, 8.0, 34.5, 8.625, true, 'Problème culturel unique avec solution NLP différenciante')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('80000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.5, 19.0, 12, true, true, 'exceptional', ARRAY['darija', 'mre', 'enfant'], 0.9)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('80000000-0000-0000-0000-000000000001', 'Samir Bennis', 'samir.bennis@diaspora.fr', '+33623456789', 'Paris, France', 'Rabat', ARRAY['education', 'tech'], ARRAY['nlp', 'arabic', 'diaspora'], 8, ARRAY['Founder'], 'Diaspora EdTech France', true, false, NULL, 20, true, true, 'education', 4, 1, 12000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 0.94, 'Expert NLP arabe/darija avec réseau MRE', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('80000000-0000-0000-0000-000000000001', 'Mes enfants parlent darija et moi je comprends rien. Les apps d''arabe c''est pas ça. J''ai besoin d''apprendre VRAIMENT le darija.', 'MRE - Paris', 'mre.paris@example.com', 'Apprentissage Darija MRE', 'MRE ne comprennent pas le darija parlé par leurs enfants.', 'Apps d''arabe classique inadaptées.', 'App darija avec IA et chatbot WhatsApp.', 'education', 'NLP darija, WhatsApp chatbot', 0.85, 'Problème diaspora précis avec marché identifié', false, NULL, 'promoted_to_idea', '80000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '41.142.156.90', 'WhatsApp/2.21.5', 'Exact! Mes enfants me parlent en darija je comprends la moitié')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('80000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- USE CASE 9: Moussem Festival Ticketing
-- Phone: +212661234575
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('90000000-0000-0000-0000-000000000001', '$2b$12$MKUUJvgrqZCJLLYCqwyhSu1hHWJT43.vcDtnKxgU0bZUrihqpntgi', 'Nadia_Charkaoui_enc', 'iv_nadia', 'tag_nadia', 'n.charkaoui@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('90000000-0000-0000-0000-000000000001', 'MoussemPass - Billetterie Digitale pour Festivals Souss', 'Le Moussem de Tan-Tan (UNESCO) attire 50 000 visiteurs mais la billetterie est manuelle avec des billets papier. Contrefaçon massive (30% des billets), files d''attente de 4h, pas de data sur les visiteurs.', 'NFT ticketing sur blockchain pour garantir authenticité. QR codes dynamiques qui changent toutes les 30s. IA analyse les patterns d''achat pour optimiser la billetterie. Paiement Mobile Money intégré.', 'tech', 'tangier', 'Billets papier vendus en main propre, contrefaçon facile, pas de traçabilité, longues files.', 'NFT blockchain, QR dynamiques, Mobile Money API, analytics IA.', 'occasional', ARRAY['visitor_data', 'sales_history', 'security_reports'], ARRAY['API Mobile Money', 'Blockchain', 'NFT Minting API'], ARRAY['blockchain', 'mobile_payment', 'analytics'], 5.0, 300.00, '3K-5K', 'Nadia Charkaoui', 'nadia.charkaoui@example.com', '+212661234575', 'professional', ARRAY['events', 'blockchain'], 'analyzed', 'qualified', false, false, 'web', '{"moroccoPriorities": ["digital_transformation"], "sdgTags": ["SDG_8", "SDG_11"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_8": 0.85, "SDG_11": 0.82}}'::jsonb, 'high', 'workflow_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('90000000-0000-0000-0000-000000000001', 8.5, 8.0, 8.5, 7.5, 32.5, 8.125, true, 'Problème événementiel avec solution NFT innovante')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('90000000-0000-0000-0000-000000000001', 4.5, 4.0, 4.5, 4.0, 17.0, 14, true, true, 'qualified', ARRAY['moussem', 'festival', 'ticket'], 0.5)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('90000000-0000-0000-0000-000000000001', 'Rachid Berrada', 'rachid.berrada@diaspora.be', '+32477123456', 'Bruxelles, Belgium', 'Tangier', ARRAY['tech', 'events'], ARRAY['blockchain', 'nft', 'mobile'], 7, ARRAY['Event Tech Lead'], 'FestTech EU', true, true, 30000.00, 12, true, true, 'tech', 7, 2, 25000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', 0.87, 'Expert événements NFT avec réseau Afrique', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('90000000-0000-0000-0000-000000000001', 'Le Moussem c''est magnifique mais l''année dernière il y avait 4h de queue. Beaucoup de billets faux circulaient.', 'Organisateur Moussem - Tan-Tan', 'org.moussem@example.com', 'Billetterie Moussem', 'Problème de contrefaçon et de gestion des entrées au Moussem de Tan-Tan.', 'Billets papier avec contrôle manuel.', 'NFT ticketing avec QR dynamiques.', 'tech', 'Blockchain, NFT, Mobile Money', 0.82, 'Problème événementiel précis avec solution digitale', false, NULL, 'promoted_to_idea', '90000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001', '196.217.156.94', 'Chrome/95.0', 'J''ai attendu 3h l''année dernière, c''était infernal')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('90000000-0000-0000-0000-000000000001', '90000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- USE CASE 10: Fishing Quota Management (Essaouira)
-- Phone: +212661234576
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('a0000000-0000-0000-0000-000000000001', '$2b$12$u16aP.AkfAdi0ypVIamx9O6zBJdhGUgFRdhEmzIee2WR.Kkf.9fAS', 'Hassan_Essaouiri_enc', 'iv_hassan', 'tag_hassan', 'h.essaouiri@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('a0000000-0000-0000-0000-000000000001', 'SeaGuard - Gestion des Quotas de Pêche Atlantique', 'Les pêcheurs artisanaux d''Essaouira pêchent 40% de plus que les quotas légaux faute de suivi. Les thons rouges sont en voie d''extinction. L''administration maritime ne peut pas surveiller 500 bateaux.', 'IoT balises GPS sur chaque bateau. IA analyse les trajectoires et détecte la pêche illégale en temps réel. Application pour pêcheurs voit leurs quotas restants. Drones pour surveillance maritime. Données envoyées à l''administration pour contrôle ciblé.', 'logistics', 'other', 'Surveillance visuelle aléatoire, déclarations spontanées, non-respect des quotas.', 'IoT maritime, IA de trajectoire, drones de surveillance, API administration.', 'daily', ARRAY['boat_positions', 'catch_reports', 'satellite_imagery'], ARRAY['Maritime IoT Network', 'Drone API', 'Administration API'], ARRAY['iot', 'computer_vision', 'optimization'], 12.0, 300.00, '3K-5K', 'Hassan Essaouiri', 'hassan.essaouiri@example.com', '+212661234576', 'professional', ARRAY['fishing', 'environment'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["green_economy"], "sdgTags": ["SDG_14", "SDG_12"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_14": 0.96, "SDG_12": 0.85}}'::jsonb, 'medium', 'decision_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('a0000000-0000-0000-0000-000000000001', 9.5, 8.5, 9.0, 8.0, 35.0, 8.75, true, 'Problème environnemental urgent avec solution IoT maritime')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('a0000000-0000-0000-0000-000000000001', 5.0, 4.0, 4.5, 4.5, 18.0, 20, true, true, 'exceptional', ARRAY['hout', 'peche', 'quota'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('a0000000-0000-0000-0000-000000000001', 'Karim Zariouh', 'karim.zariouh@diaspora.es', '+34678123456', 'Madrid, Spain', 'Essaouira', ARRAY['logistics', 'environment'], ARRAY['iot', 'maritime', 'drones'], 11, ARRAY['Marine Tech Director'], 'BlueTech Spain', true, true, 70000.00, 18, true, true, 'logistics', 7, 1, 50000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 0.91, 'Expert pêche durable avec expérience IoT maritime', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'On pêche trop, le thon rouge il reste plus rien. Mais la marine peut pas surveiller tout le monde. Il faut de la technologie.', 'Pêcheur - Essaouira', 'pecheur@essaouira.com', 'Surpêche Thon Rouge', 'Surpêche illégale du thon rouge avec quotas non respectés.', 'Surveillance maritime limitée, déclarations non vérifiées.', 'IoT et drones pour surveillance temps réel.', 'logistics', 'IoT maritime, drones, IA', 0.87, 'Problème environnemental précis avec solution technique adéquate', false, NULL, 'promoted_to_idea', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '196.217.156.95', 'WhatsApp/2.21.5', 'Le thon rouge c''est fini si on change rien')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Critique pour la biodiversité marine marocaine', 'concern')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count
FROM marrai_ideas
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
)
UNION ALL
SELECT 
  'marrai_mentors',
  COUNT(*)
FROM marrai_mentors
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
)
UNION ALL
SELECT 
  'marrai_conversation_ideas',
  COUNT(*)
FROM marrai_conversation_ideas
WHERE id IN (
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000001',
  '60000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000001',
  '80000000-0000-0000-0000-000000000001',
  '90000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001'
);

