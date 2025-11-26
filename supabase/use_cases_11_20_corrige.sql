-- ============================================
-- USE CASES 11-20 CORRIGÉS - Nouveaux Cas d'Usage Marocains
-- ============================================
-- Corrections appliquées:
-- 1. currentrole → current_role
-- 2. ON CONFLICT DO NONE → DO NOTHING
-- 3. submitter_type 'farmer' → 'entrepreneur'
-- 4. Locations non valides → 'other' (sauf meknes qui est valide)
-- 5. validation_date retiré (colonne n'existe pas)
-- 6. Hashs de téléphone uniques générés
-- 7. UUIDs corrigés: g,h,i,j,k → 0a,0b,0c,0d,0e (caractères hexadécimaux valides)
-- ============================================

-- USE CASE 11: Telemedicine for Rural Areas (Kenitra)
-- Phone: +212661234577
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('b0000000-0000-0000-0000-000000000001', '$2b$12$DqGRRifXxysnfeHpgz7uV.6VCIT8YUG8GXteU2RhupE8y8UZ39uAK', 'Dr_Sofia_Benani_enc', 'iv_sofia', 'tag_sofia', 'dr.sofia@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('b0000000-0000-0000-0000-000000000001', 'TeleMed Rural - Consultations à Distance pour Zones Isolées', 'Les villages autour de Kenitra n''ont qu''un médecin pour 5000 habitants. Les patients parcourent 40km en transport commun pour une consultation. 60% des cas pourraient être résolus par téléconsultation.', 'Plateforme de télémédecine avec IA de triage préliminaire. Kit de diagnostic connecté (tension, glycémie, oxymètre) en pharmacie locale. Vidéo consultation avec spécialistes à Rabat. Paiement via assurance maladie mobile.', 'health', 'kenitra', 'Consultation physique obligatoire, déplacement coûteux, attente de 3-4h.', 'IA de triage, WebRTC, devices IoT médicaux, API assurance maladie.', 'weekly', ARRAY['patient_records', 'pharmacy_data', 'transport_logs'], ARRAY['API CNSS', 'WebRTC', 'IoT Medical Devices'], ARRAY['nlp', 'computer_vision', 'diagnosis'], 8.0, 150.00, '10K+', 'Dr Sofia Benani', 'sofia.benani@example.com', '+212661234577', 'professional', ARRAY['sante', 'telemedecine'], 'analyzed', 'exceptional', true, false, 'web', '{"moroccoPriorities": ["healthcare_improvement"], "sdgTags": ["SDG_3", "SDG_10"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_3": 0.94, "SDG_10": 0.87}}'::jsonb, 'high', 'data_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('b0000000-0000-0000-0000-000000000001', 9.5, 8.5, 9.5, 8.0, 35.5, 8.875, true, 'Problème de santé public majeur avec solution IA pertinente')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('b0000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.5, 19.0, 16, true, true, 'exceptional', ARRAY['docteur', 'village', 'sante'], 0.6)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('b0000000-0000-0000-0000-000000000001', 'Dr. Amine Fassi', 'amine.fassi@diaspora.ca', '+14165559876', 'Montreal, Canada', 'Kenitra', ARRAY['health', 'tech'], ARRAY['telemedicine', 'mobile_health', 'nia'], 15, ARRAY['Chief Medical Officer'], 'HealthTech North America', true, true, 80000.00, 18, true, true, 'health', 5, 2, 65000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 0.93, 'Expert télémédecine avec expérience Afrique', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'Mon fils de 10 ans a attendu 4h pour voir le docteur à Sidi Allal Tazi. Il n''avait qu''une simple infection.', 'Père de famille - Kenitra', 'parent.kenitra@example.com', 'Pénurie Médecins Ruraux', 'Un seul médecin pour 5000 habitants en zone rurale Kenitra.', 'Déplacement 40km, attente 4h, consultation 5min.', 'Télémédecine avec IA de triage.', 'health', 'AI triage, WebRTC, devices IoT', 0.89, 'Problème santé publique avec données personnelles', false, NULL, 'promoted_to_idea', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '41.142.156.99', 'WhatsApp/2.21.5', 'Vrai, ma grand-mère fait 80km aller-retour pour ses médicaments')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Solution vitale pour nos régions rurales', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 12: Date Palm Disease Detection (Erfoud)
-- Phone: +212661234578
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('c0000000-0000-0000-0000-000000000001', '$2b$12$eMiM0i8huMy7xlPtfe7NSuKo3BSIRTf4.9Y1uVzgjRuaXtS9ovW3e', 'Mohamed_Ezzoubi_enc', 'iv_mohamed', 'tag_mohamed', 'm.ezzoubi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '180 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('c0000000-0000-0000-0000-000000000001', 'PalmGuard - Détection du Bayoud par Drone et IA', 'Le bayoud détruit 50 000 palmiers dattiers par an à Erfoud. Les agriculteurs détectent la maladie 2 ans trop tard quand le palmier est déjà mort. Perte de 300M DH/an pour la région.', 'Drones multispectraux survolent les palmeraies mensuellement. IA analyse les images hyperspectrales et détecte le champignon 18 mois avant symptômes. Application alerte l''agriculteur avec GPS précis et protocole de traitement.', 'agriculture', 'other', 'Inspection visuelle annuelle, détection tardive, perte totale du palmier.', 'Drone imaging, ML hyperspectral, GPS tracking, mobile alerts.', 'weekly', ARRAY['drone_imagery', 'disease_history', 'weather_data'], ARRAY['DJI API', 'Satellite Imagery', 'Agri App'], ARRAY['computer_vision', 'ml', 'iot'], 12.0, 800.00, '5K-10K', 'Mohamed Ezzoubi', 'mohamed.ezzoubi@example.com', '+212661234578', 'entrepreneur', ARRAY['agriculture', 'drones'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["agriculture_modernization"], "sdgTags": ["SDG_1", "SDG_2"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_1": 0.90, "SDG_2": 0.88}}'::jsonb, 'high', 'data_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('c0000000-0000-0000-0000-000000000001', 9.0, 8.5, 9.5, 8.0, 35.0, 8.75, true, 'Problème agricole critique avec solution drone-IA avancée')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('c0000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.5, 19.0, 20, true, true, 'exceptional', ARRAY['datte', 'bayoud', 'palmier'], 0.8)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('c0000000-0000-0000-0000-000000000001', 'Ali Berrada', 'ali.berrada@diaspora.fr', '+33674563210', 'Paris, France', 'Erfoud', ARRAY['agriculture', 'tech'], ARRAY['drones', 'precision_agriculture', 'ml'], 9, ARRAY['CTO'], 'AgriDrone EU', true, true, 55000.00, 15, true, false, 'agriculture', 8, 3, 30000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 0.94, 'Expert drones agriculture avec expérience Erfoud', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'J''ai perdu 20 palmiers l''année dernière, on a vu le bayoud quand c''était trop tard. Il faut voir avant.', 'Agriculteur - Erfoud', 'agri.erfoud@example.com', 'Bayoud Dattes', 'Maladie du bayoud détectée trop tard, perte de palmiers.', 'Inspection visuelle annuelle.', 'Drones + IA pour détection précoce.', 'agriculture', 'Drone multispectral, hyperspectral ML', 0.87, 'Problème agricole précis avec solution technique', false, NULL, 'promoted_to_idea', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '196.217.156.98', 'Mozilla/5.0', 'Le bayoud a tué la moitié de ma palmeraie en 2023')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'La filière dattes est notre trésor national', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 13: Carpool for Workers (Tetouan)
-- Phone: +212661234579
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('d0000000-0000-0000-0000-000000000001', '$2b$12$N5oVIySC58HeogO5fIM8RewsEzyigkliHtAaPHn.BSAEju2xJ7Iqq', 'Fatima_El_Khammar_enc', 'iv_fatima', 'tag_fatima', 'f.khammar@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('d0000000-0000-0000-0000-000000000001', 'CasaCovoiturage - Transport Ouvert pour Ouvriers', 'Les ouvriers de Tétouan dépensent 40% de leur salaire (800 DH) en transport vers les zones industrielles. 15 000 ouvriers font le même trajet chaque jour sans mutualisation.', 'Application de covoiturage dédiée aux ouvriers. IA calcule les itinéraires optimisés par zone industrielle. Points de rendez-vous sécurisés. Paiement hebdomadaire via mobile money. Certification employeur.', 'logistics', 'other', 'Transport individuel (bus, taxi), coût élevé, horaires fixes, pas de flexibilité.', 'Carpool algorithm, Mobile Money API, GPS tracking, employer verification.', 'daily', ARRAY['worker_addresses', 'factory_locations', 'transport_costs'], ARRAY['Google Maps API', 'Mobile Money API', 'HR Systems'], ARRAY['optimization', 'mobile', 'geolocation'], 10.0, 320.00, '1K-3K', 'Fatima El Khammar', 'fatima.khammar@example.com', '+212661234579', 'entrepreneur', ARRAY['logistique', 'social'], 'analyzed', 'qualified', true, false, 'whatsapp', '{"moroccoPriorities": ["inclusion", "industrial_acceleration"], "sdgTags": ["SDG_8", "SDG_11"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_8": 0.92, "SDG_11": 0.85}}'::jsonb, 'high', 'workflow_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('d0000000-0000-0000-0000-000000000001', 8.5, 8.0, 9.0, 7.5, 33.0, 8.25, true, 'Problème social urgent avec solution logistique économique')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('d0000000-0000-0000-0000-000000000001', 4.5, 4.0, 4.5, 4.5, 17.5, 14, true, true, 'qualified', ARRAY['ouvrier', 'transport', 'tetouan'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('d0000000-0000-0000-0000-000000000001', 'Sara Martinez', 'sara.martinez@diaspora.es', '+34698765432', 'Barcelona, Spain', 'Tetouan', ARRAY['logistics', 'inclusion'], ARRAY['carpool', 'mobile_apps', 'optimization'], 10, ARRAY['Product Manager'], 'RideShare Europe', true, false, NULL, 12, true, true, 'logistics', 9, 4, 20000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 0.88, 'Expert covoiturage B2B avec expérience Maroc', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('d0000000-0000-0000-0000-000000000001', 'Je dépense 800 DH/mois en taxi pour aller à l''usine. C''est plus que ma contribution famille.', 'Ouvrière textile - Martil', 'ouvriere.martil@example.com', 'Coût Transport Ouvriers', 'Transport représente 40% du salaire des ouvriers de Tétouan.', 'Taxi individuel ou bus long.', 'Covoiturage mutualisé avec paiement mobile.', 'logistics', 'Carpool algorithm, Mobile Money', 0.85, 'Problème économique social avec solution technique adaptée', false, NULL, 'promoted_to_idea', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '41.142.157.00', 'Mozilla/5.0', 'C''est vrai, les transporteurs profitent des ouvriers')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('d0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Impact direct sur le pouvoir d''achat des familles', 'concern')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 14: Halal Certification Blockchain (Meknes)
-- Phone: +212661234580
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('e0000000-0000-0000-0000-000000000001', '$2b$12$sGqGMtt4wsZKBqFZOA8q9.xrJM.gp1dzYzzRpAkwQcoabj6AGC7uq', 'Youssef_El_Habti_enc', 'iv_youssef', 'tag_youssef', 'y.habti@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('e0000000-0000-0000-0000-000000000001', 'HalalChain - Certification Blockchain pour Viande Halal', 'Les consommateurs ne peuvent pas vérifier l''authenticité halal de la viande. 30% des certificats sont faux à Meknès. Les abattoirs non certifiés vendent de la viande "halal" sans contrôle.', 'Blockchain traçant chaque animal depuis l''élevage jusqu''à la boucherie. QR code sur la viande scanné par le consommateur. Smart contracts avec conditions halal (abattage rituels, alimentation). Audit automatique des abattoirs.', 'finance', 'meknes', 'Certificats papier facilement falsifiés, audits rares, pas de traçabilité.', 'Blockchain, smart contracts, QR tracking, audit IoT.', 'monthly', ARRAY['slaughter_data', 'farm_records', 'consumer_complaints'], ARRAY['Blockchain Node', 'QR API', 'Audit Sensors'], ARRAY['blockchain', 'qr_code', 'audit'], 6.0, 200.00, '5K-10K', 'Youssef El Habti', 'youssef.habti@example.com', '+212661234580', 'entrepreneur', ARRAY['halal', 'blockchain'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["industrial_acceleration"], "sdgTags": ["SDG_12", "SDG_16"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_12": 0.90, "SDG_16": 0.85}}'::jsonb, 'medium', 'workflow_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('e0000000-0000-0000-0000-000000000001', 8.0, 7.5, 9.0, 7.0, 31.5, 7.875, true, 'Problème de confiance halal avec solution blockchain robuste')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('e0000000-0000-0000-0000-000000000001', 4.0, 3.5, 5.0, 4.5, 17.0, 22, true, true, 'qualified', ARRAY['halal', 'viande', 'meknes'], 0.5)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('e0000000-0000-0000-0000-000000000001', 'Karim Bennani', 'karim.bennani@diaspora.uk', '+447712345678', 'London, UK', 'Meknes', ARRAY['finance', 'blockchain'], ARRAY['halal', 'supply_chain', 'compliance'], 12, ARRAY['Head of Compliance'], 'HalalVerify UK', true, false, NULL, 14, true, true, 'finance', 6, 2, 35000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 0.90, 'Expert halal blockchain avec réseau Meknès', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'J''ai acheté du "halal" à Meknès, le QR code menait à un site fake. C''est scandaleux!', 'Consommateur - Meknès', 'consommateur@me.com', 'Faux Halal Meknès', 'Contrefaçon massive de certificats halal à Meknès.', 'Certificats papier sans vérification.', 'Blockchain avec QR traçable.', 'finance', 'Blockchain QR, smart contracts', 0.86, 'Problème de fraude alimentaire avec solution technologique', false, NULL, 'promoted_to_idea', 'e0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', '41.142.157.01', 'Chrome/95.0', 'J''ai arrêté d''acheter de la viande à cause de ça')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('e0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Confiance halal est fondamentale pour les Marocains', 'concern')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 15: School Dropout Prediction (Nador)
-- Phone: +212661234581
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('f0000000-0000-0000-0000-000000000001', '$2b$12$5Wt4zOs3giy6VUOx9IOXeuUZKn787vrLYhgPHUQEGGf8sQCsKE612', 'Aicha_Benamar_enc', 'iv_aicha', 'tag_aicha', 'a.benamar@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('f0000000-0000-0000-0000-000000000001', 'SchoolGuard - Prédiction de Décrochage Scolaire à Nador', 'Le taux de décrochage à Nador atteint 18% au collège. Les directeurs ne savent pas identifier les élèves à risque avant qu''ils abandonnent. Pas de système de suivi psychosocial.', 'ML analyse les données scolaires (absences, notes, comportement) et signale les élèves à risque 3 mois avant. Chatbot WhatsApp contacte les parents. Interface pour conseillers pédagogiques. Alertes automatiques aux directeurs.', 'education', 'other', 'Suivi manuel par enseignants, pas de prévention, intervention tardive.', 'ML de prédiction, NLP pour chatbot, dashboard pour conseillers.', 'daily', ARRAY['student_records', 'attendance', 'grades'], ARRAY['WhatsApp API', 'School Management API', 'Analytics Dashboard'], ARRAY['ml', 'nlp', 'chatbot'], 15.0, 0.00, '3K-5K', 'Aicha Benamar', 'aicha.benamar@example.com', '+212661234581', 'professional', ARRAY['education', 'ml'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["human_capital", "education_quality"], "sdgTags": ["SDG_4", "SDG_10"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_4": 0.95, "SDG_10": 0.88}}'::jsonb, 'high', 'decision_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('f0000000-0000-0000-0000-000000000001', 9.5, 8.5, 9.0, 8.5, 35.5, 8.875, true, 'Problème éducation majeur avec solution prédictive IA')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('f0000000-0000-0000-0000-000000000001', 5.0, 4.0, 4.5, 4.5, 18.0, 18, true, true, 'qualified', ARRAY['ecole', 'eleve', 'nador'], 0.6)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('f0000000-0000-0000-0000-000000000001', 'Dr. Nadia Bennis', 'nadia.bennis@diaspora.ca', '+14165558765', 'Toronto, Canada', 'Nador', ARRAY['education', 'tech'], ARRAY['edtech', 'ml', 'psychology'], 13, ARRAY['EdTech Director'], 'LearnAI Canada', true, true, 45000.00, 16, true, true, 'education', 7, 3, 38000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 0.91, 'Expert EdTech ML avec expérience Rif', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('f0000000-0000-0000-0000-000000000001', 'On perd 3-4 élèves par classe en 2ème année sans savoir pourquoi. On le sait quand ils arrêtent, pas avant.', 'Directrice collège - Nador', 'dir.nador@example.com', 'Décrochage Scolaire', 'Décrochage scolaire à 18% sans système de prévention.', 'Suivi manuel après décrochage.', 'ML pour prédiction précoce.', 'education', 'ML, chatbot WhatsApp, dashboard', 0.88, 'Problème éducation avec solution IA prédictive', false, NULL, 'promoted_to_idea', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '41.142.157.02', 'Mozilla/5.0', 'Ma fille a décroché sans que l''école nous prévienne')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('f0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'Prévenir le décrochage c''est sauver des générations', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 16: Port Container Optimization (El Jadida)
-- Phone: +212661234582
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('0a000000-0000-0000-0000-000000000001', '$2b$12$G.MUEO8gadJFEasT4aDbU.LwvF1b6pNJB.UXyXRhLh8cbxJ/rzDFm', 'Ahmed_El_Jadidi_enc', 'iv_ahmed', 'tag_ahmed', 'a.eljadidi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('0a000000-0000-0000-0000-000000000001', 'PortFlow - Optimisation AI du Port El Jadida', 'Le port d''El Jadida a 3 jours de délai de déchargement moyen. Les conteneurs s''entassent faute de planification. Les camions attendent 12h pour charger. Perte de 2M DH/jour.', 'IA optimise le planning de déchargement en temps réel basé sur la file camions. Drones inspectent l''état des conteneurs. Application pour transporteurs avec slot booking. Smart contracts pour paiement automatique.', 'logistics', 'other', 'Planification manuelle par téléphone, pas de visibilité temps réel, files d''attente.', 'AI optimization, drone inspection, smart contracts, slot booking.', 'multiple_daily', ARRAY['container_data', 'truck_queue', 'weather_data'], ARRAY['Port API', 'Truck GPS API', 'Payment Gateway'], ARRAY['optimization', 'computer_vision', 'blockchain'], 20.0, 1500.00, '10K+', 'Ahmed El Jadidi', 'ahmed.eljadidi@example.com', '+212661234582', 'professional', ARRAY['logistique', 'ia'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["infrastructure", "industrial_acceleration"], "sdgTags": ["SDG_9", "SDG_8"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_9": 0.93, "SDG_8": 0.90}}'::jsonb, 'high', 'decision_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('0a000000-0000-0000-0000-000000000001', 9.5, 9.0, 9.5, 8.5, 36.5, 9.125, true, 'Problème logistique majeur avec solution IA haute valeur')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('0a000000-0000-0000-0000-000000000001', 5.0, 5.0, 4.5, 4.5, 19.0, 12, true, true, 'exceptional', ARRAY['port', 'container', 'jadida'], 0.5)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('0a000000-0000-0000-0000-000000000001', 'Sofiane Ziani', 'sofiane.ziani@diaspora.fr', '+33674563210', 'Paris, France', 'El Jadida', ARRAY['logistics', 'tech'], ARRAY['port_operations', 'ai', 'blockchain'], 14, ARRAY['Port Tech Lead'], 'PortAI Europe', true, true, 70000.00, 20, true, true, 'logistics', 8, 3, 55000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('0a000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001', 0.95, 'Expert portuaire AI avec expérience Maroc', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('0a000000-0000-0000-0000-000000000001', 'Mon camion a attendu 14h hier au port. Personne sait quand c''est libre. C''une honte!', 'Transporteur - El Jadida', 'transp.jadida@example.com', 'Congestion Port', 'Congestion portuaire majeure avec attentes de 12h pour les camions.', 'Planning manuel, pas de visibilité.', 'AI pour optimiser le flux portuaire.', 'logistics', 'AI optimization, drones, smart contracts', 0.90, 'Problème logistique avec données chiffrées', false, NULL, 'promoted_to_idea', '0a000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('0a000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001', '196.217.157.03', 'Mozilla/5.0', 'J''ai perdu 3 contrats à cause des délais portuaires')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('0a000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('0a000000-0000-0000-0000-000000000001', '0a000000-0000-0000-0000-000000000001', 'Stratégique pour la compétitivité maritime du Maroc', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 17: Amazigh Language Learning App (Agadir)
-- Phone: +212661234583
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('0b000000-0000-0000-0000-000000000001', '$2b$12$IODuMsbQKnTbD.cPH5lUhO6EM3cYdgkbUHI0cr6gZvJIZWaZ1kiXS', 'Malika_Amzal_enc', 'iv_malika', 'tag_malika', 'm.amzal@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('0b000000-0000-0000-0000-000000000001', 'TamazightMaster - App pour Préserver l''Amazigh', 'L''amazigh (langue officielle) est en danger. 60% des jeunes de Souss ne parlent plus Tashelhit. Pas d''app moderne pour l''apprentissage avec alphabet Tifinagh.', 'Application gamifiée avec reconnaissance vocale amazigh (Tashelhit, Tamazight, Tarifit). IA génère des dialogues avec accent Soussi. Exercices de Tifinagh interactifs. Contenu culturel (poésie, chants) par diaspora.', 'education', 'agadir', 'Pas d''outils numériques modernes, enseignement classique inefficace, perte de la langue.', 'STT amazigh, TTS, gamification, contenu culturel, diaspora contributions.', 'daily', ARRAY['corpus_amazigh', 'youtube_videos', 'cultural_content'], ARRAY['Speech API', 'Tifinagh Font API', 'Diaspora CDN'], ARRAY['nlp', 'speech_recognition', 'gamification'], 3.0, 0.00, '1K-3K', 'Malika Amzal', 'malika.amzal@example.com', '+212661234583', 'entrepreneur', ARRAY['culture', 'education'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["cultural_preservation", "human_capital"], "sdgTags": ["SDG_4"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_4": 0.92}}'::jsonb, 'medium', 'interface_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('0b000000-0000-0000-0000-000000000001', 9.0, 8.0, 9.5, 7.5, 34.0, 8.5, true, 'Problème culturel majeur avec solution éducative IA')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('0b000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.0, 18.5, 15, true, true, 'exceptional', ARRAY['amazigh', 'souss', 'tifinagh'], 0.9)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('0b000000-0000-0000-0000-000000000001', 'Rachid Amrani', 'rachid.amrani@diaspora.ca', '+14165557654', 'Montreal, Canada', 'Agadir', ARRAY['education', 'culture'], ARRAY['amazigh', 'nlp', 'diaspora'], 11, ARRAY['Language Tech Lead'], 'AmazighTech', true, false, NULL, 18, true, true, 'education', 5, 2, 25000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('0b000000-0000-0000-0000-000000000001', '0b000000-0000-0000-0000-000000000001', '0b000000-0000-0000-0000-000000000001', 0.93, 'Expert amazigh technologie avec réseau Souss', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('0b000000-0000-0000-0000-000000000001', 'Mon fils de 15 ans ne parle plus Tashelhit. L''école ne l''apprend pas bien. Il faut une app comme Duolingo.', 'Parent - Agadir', 'parent.agadir@example.com', 'Perte Langue Amazigh', 'Jeunes abandonnent l''amazigh faute d''outils modernes.', 'Enseignement classique non adapté.', 'App gamifiée avec STT amazigh.', 'education', 'NLP amazigh, Tifinagh, gamification', 0.84, 'Problème culturel avec solution tech adaptée', false, NULL, 'promoted_to_idea', '0b000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('0b000000-0000-0000-0000-000000000001', '0b000000-0000-0000-0000-000000000001', '41.142.157.04', 'WhatsApp/2.21.5', 'Mon neveu a oublié le Tashelhit complètement')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('0b000000-0000-0000-0000-000000000001', '0b000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('0b000000-0000-0000-0000-000000000001', '0b000000-0000-0000-0000-000000000001', 'Stratégique pour la diversité culturelle du Maroc', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 18: Rental Housing Platform (Safi)
-- Phone: +212661234584
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('0c000000-0000-0000-0000-000000000001', '$2b$12$sc1N5C3ka0LXjOqrzMsSc.Wkjg56zQdnccjqHOAwpBVbk3XLwDej.', 'Hassan_Belkhadir_enc', 'iv_hassan', 'tag_hassan', 'h.belkhadir@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('0c000000-0000-0000-0000-000000000001', 'SafiLodge - Location Immobilière Sécurisée', 'Les étudiants de Safi perdent 2000 DH en moyenne dans des arnaques immobilières (fausses annonces, proprios fantômes). Pas de contrats officiels, pas de garanties.', 'Plateforme de location vérifiée avec blockchain. Smart contracts pour cautions et loyers. Vérification d''identité propriétaire. Système de notation. Assurance dommages intégrée. Paiement mensuel via virement automatique.', 'customer_service', 'other', 'Annonces orales ou Facebook, arnaques fréquentes, pas de contrats, litiges.', 'Blockchain contracts, KYC, insurance API, automated payments.', 'monthly', ARRAY['rental_ads', 'student_complaints', 'court_records'], ARRAY['Bank API', 'Blockchain', 'Insurance API'], ARRAY['blockchain', 'kyc', 'automation'], 4.0, 200.00, '3K-5K', 'Hassan Belkhadir', 'hassan.belkhadir@example.com', '+212661234584', 'entrepreneur', ARRAY['immobilier', 'blockchain'], 'analyzed', 'qualified', true, false, 'web', '{"moroccoPriorities": ["inclusion", "digital_transformation"], "sdgTags": ["SDG_11", "SDG_16"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_11": 0.85, "SDG_16": 0.90}}'::jsonb, 'medium', 'workflow_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('0c000000-0000-0000-0000-000000000001', 8.0, 7.5, 9.0, 7.0, 31.5, 7.875, true, 'Problème étudiant majeur avec solution blockchain sécurisée')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('0c000000-0000-0000-0000-000000000001', 4.0, 4.0, 4.5, 4.5, 17.0, 16, true, true, 'qualified', ARRAY['location', 'etudiant', 'safi'], 0.5)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('0c000000-0000-0000-0000-000000000001', 'Mounir Benchekroun', 'mounir.benchekroun@diaspora.fr', '+33679876543', 'Paris, France', 'Safi', ARRAY['customer_service', 'tech'], ARRAY['proptech', 'blockchain', 'kyc'], 9, ARRAY['CEO'], 'RentSecure France', true, true, 50000.00, 14, true, true, 'tech', 8, 2, 40000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('0c000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-000000000001', 0.89, 'Expert proptech blockchain avec expérience Safi', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('0c000000-0000-0000-0000-000000000001', 'J''ai payé 1500 DH de caution à un proprio qui a disparu. L''annonce Facebook était fausse.', 'Étudiant - Safi', 'etudiant.safi@example.com', 'Arnaque Location', 'Arnaques immobilières fréquentes à Safi étudiants.', 'Annonces non vérifiées, pas de contrats.', 'Plateforme blockchain avec KYC.', 'customer_service', 'Blockchain, KYC, smart contracts', 0.83, 'Problème étudiant avec solution sécurisée', false, NULL, 'promoted_to_idea', '0c000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('0c000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-000000000001', '41.142.157.05', 'Chrome/95.0', 'Moi aussi j''ai perdu 2000 DH, le proprio a bloqué mon numéro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('0c000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('0c000000-0000-0000-0000-000000000001', '0c000000-0000-0000-0000-000000000001', 'Sécuriser les locations protège les jeunes', 'support')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 19: Waste Management Optimization (Beni Mellal)
-- Phone: +212661234585
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('0d000000-0000-0000-0000-000000000001', '$2b$12$.F32t6IO3xcYv2ekqrRDUOhw.EIhuci7WoKvd9dvIuXCAbMm.mZlO', 'Abdelkader_El_Wardi_enc', 'iv_abdelkader', 'tag_abdelkader', 'a.elwardi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('0d000000-0000-0000-0000-000000000001', 'CleanCity Mellal - Gestion Intelligente des Déchets', 'Beni Mellal produit 200 tonnes de déchets/jour mais la collecte est aléatoire. Les bennes débordent, rats, mauvaises odeurs. Pas d''itinéraire optimisé, gaspillage carburant.', 'Poubelles intelligentes avec capteurs de remplissage IoT. IA calcule les itinéraires optimaux pour camions. Alertes aux citoyens via app. Blockchain pour traçabilité traitement recyclage.', 'infrastructure', 'other', 'Itinéraires fixes, collecte non optimisée, plaintes citoyens.', 'IoT sensors, AI route optimization, mobile app, blockchain tracking.', 'daily', ARRAY['bin_sensors', 'citizen_complaints', 'fuel_costs'], ARRAY['IoT Network', 'GPS API', 'Recycling API'], ARRAY['iot', 'optimization', 'blockchain'], 6.0, 150.00, '3K-5K', 'Abdelkader El Wardi', 'abdelkader.elfassi@example.com', '+212661234585', 'entrepreneur', ARRAY['environnement', 'smart_city'], 'analyzed', 'qualified', false, false, 'whatsapp', '{"moroccoPriorities": ["green_economy", "infrastructure"], "sdgTags": ["SDG_11", "SDG_12"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_11": 0.88, "SDG_12": 0.90}}'::jsonb, 'high', 'workflow_agent', true, 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('0d000000-0000-0000-0000-000000000001', 8.5, 8.0, 8.5, 7.5, 32.5, 8.125, true, 'Problème environnemental urbain avec solution IoT pragmatique')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('0d000000-0000-0000-0000-000000000001', 4.5, 4.0, 4.0, 4.5, 17.0, 16, true, true, 'qualified', ARRAY['dechets', 'beni_mellal', 'ville'], 0.6)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('0d000000-0000-0000-0000-000000000001', 'Yasmine Bouchta', 'yasmine.bouchta@diaspora.nl', '+31612345678', 'Amsterdam, Netherlands', 'Beni Mellal', ARRAY['infrastructure', 'environment'], ARRAY['waste_management', 'iot', 'smart_city'], 8, ARRAY['Sustainability Lead'], 'GreenCity EU', true, true, 45000.00, 12, true, true, 'infrastructure', 7, 2, 30000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('0d000000-0000-0000-0000-000000000001', '0d000000-0000-0000-0000-000000000001', '0d000000-0000-0000-0000-000000000001', 0.87, 'Expert gestion déchets intelligente avec expérience Maroc', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('0d000000-0000-0000-0000-000000000001', 'Les poubelles débordent pendant 3 jours, les rats envahissent notre rue. La commune ne sait pas où aller.', 'Resident - Beni Mellal', 'resident.mellal@example.com', 'Collecte Déchets', 'Collecte inefficace avec débordement et nuisibles.', 'Itinéraires fixes sans optim.', 'IoT + IA pour optimiser collecte.', 'infrastructure', 'Smart bins, AI routes', 0.85, 'Problème urbain avec solution IoT', false, NULL, 'promoted_to_idea', '0d000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('0d000000-0000-0000-0000-000000000001', '0d000000-0000-0000-0000-000000000001', '41.142.157.06', 'WhatsApp/2.21.5', 'C''est insupportable, nos enfants tombent malades')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('0d000000-0000-0000-0000-000000000001', '0d000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('0d000000-0000-0000-0000-000000000001', '0d000000-0000-0000-0000-000000000001', 'Vital pour la santé publique urbaine', 'concern')
ON CONFLICT (id) DO NOTHING;

-- USE CASE 20: Solar Panel Maintenance IoT (Khouribga)
-- Phone: +212661234586
INSERT INTO marrai_secure_users (id, phone_hash, encrypted_name, name_iv, name_tag, anonymous_email, consent, consent_date, data_retention_expiry) VALUES
('0e000000-0000-0000-0000-000000000001', '$2b$12$eLin3UvahGP8Cf2NhqBRNelkrt8JmiVNmS1c/G1mqlHpGk5oCvD5O', 'Khadija_El_Ouafi_enc', 'iv_khadija', 'tag_khadija', 'k.elfassi@anonymous.fikravalley.com', true, NOW(), NOW() + INTERVAL '90 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_ideas (id, title, problem_statement, proposed_solution, category, location, current_manual_process, digitization_opportunity, frequency, data_sources, integration_points, ai_capabilities_needed, roi_time_saved_hours, roi_cost_saved_eur, estimated_cost, submitter_name, submitter_email, submitter_phone, submitter_type, submitter_skills, status, qualification_tier, featured, visible, submitted_via, alignment, automation_potential, agent_type, human_in_loop, priority) VALUES
('0e000000-0000-0000-0000-000000000001', 'SolarGuard - Maintenance Prédictive des Panneaux Solaires', 'La centrale solaire de Khouribga (50MW) perd 12% de rendement faute de nettoyage et maintenance. Les panneaux encrassés ne sont détectés qu''après 3 mois. Pas de surveillance en temps réel.', 'Capteurs IoT sur chaque panneau (température, poussière, production). IA prédit le besoin de nettoyage 2 semaines avant perte. Drones pour inspection visuelle. Smart contracts déclenchent maintenance automatique.', 'infrastructure', 'other', 'Inspection visuelle trimestrielle, perte de rendement invisible, réaction tardive.', 'IoT sensors, predictive ML, drones, smart contracts maintenance.', 'weekly', ARRAY['solar_production', 'weather_data', 'dust_levels'], ARRAY['IoT Solar API', 'Drone API', 'Maintenance API'], ARRAY['iot', 'ml', 'computer_vision'], 8.0, 400.00, '5K-10K', 'Khadija El Ouafi', 'khadija.elfassi@example.com', '+212661234586', 'professional', ARRAY['energie', 'maintenance'], 'analyzed', 'exceptional', false, false, 'web', '{"moroccoPriorities": ["green_economy", "energy_security"], "sdgTags": ["SDG_7", "SDG_13"], "sdgAutoTagged": true, "sdgConfidence": {"SDG_7": 0.96, "SDG_13": 0.88}}'::jsonb, 'high', 'data_agent', true, 'critical')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_clarity_scores (idea_id, problem_statement, as_is_analysis, benefit_statement, operational_needs, total, average, qualified, qualification_reason) VALUES
('0e000000-0000-0000-0000-000000000001', 9.0, 8.5, 9.5, 8.0, 35.0, 8.75, true, 'Problème énergie verte avec solution IoT prédictive')
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_decision_scores (idea_id, strategic_fit, feasibility, differentiation, evidence_of_demand, total, break_even_months, intilaka_eligible, qualified, qualification_tier, darija_keywords, darija_score) VALUES
('0e000000-0000-0000-0000-000000000001', 5.0, 4.5, 5.0, 4.0, 18.5, 20, true, true, 'exceptional', ARRAY['solaire', 'khouribga', 'panneau'], 0.7)
ON CONFLICT (idea_id) DO NOTHING;

INSERT INTO marrai_mentors (id, name, email, phone, location, moroccan_city, expertise, skills, years_experience, current_role, company, willing_to_mentor, willing_to_cofund, max_cofund_amount, available_hours_per_month, attended_kenitra, mgl_member, chapter, ideas_matched, ideas_funded, total_cofunded_eur) VALUES
('0e000000-0000-0000-0000-000000000001', 'Dr. Karim Zniber', 'karim.zniber@diaspora.fr', '+33677665544', 'Paris, France', 'Khouribga', ARRAY['infrastructure', 'green_energy'], ARRAY['solar', 'iot', 'maintenance'], 12, ARRAY['CTO'], 'SolarTech Europe', true, true, 60000.00, 20, true, true, 'infrastructure', 6, 3, 50000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_mentor_matches (id, idea_id, mentor_id, match_score, match_reason, matched_by, status) VALUES
('0e000000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-000000000001', 0.92, 'Expert solaire IoT avec expérience Maroc', 'auto', 'pending')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_conversation_ideas (id, speaker_quote, speaker_context, speaker_email, problem_title, problem_statement, current_manual_process, proposed_solution, category, digitization_opportunity, confidence_score, extraction_reasoning, needs_clarification, validation_question, status, promoted_to_idea_id) VALUES
('0e000000-0000-0000-0000-000000000001', 'On a installé 1000 panneaux mais on ne sait pas lesquels fonctionnent mal. On découvre 3 mois après.', 'Responsable centrale - Khouribga', 'resp.khouribga@example.com', 'Maintenance Solaire', 'Pas de surveillance temps réel des panneaux solaires.', 'Inspection trimestrielle manuelle.', 'IoT + IA pour maintenance prédictive.', 'infrastructure', 'IoT, drones, predictive ML', 0.86, 'Problème énergie avec solution IoT', false, NULL, 'promoted_to_idea', '0e000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_problem_validations (id, idea_id, validator_ip, validator_user_agent, comment) VALUES
('0e000000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-000000000001', '41.142.157.07', 'Mozilla/5.0', 'On perd 10% de production sans le savoir')
ON CONFLICT (id) DO NOTHING;

INSERT INTO marrai_idea_upvotes (idea_id, user_id) VALUES
('0e000000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO marrai_idea_comments (id, idea_id, comment, comment_type) VALUES
('0e000000-0000-0000-0000-000000000001', '0e000000-0000-0000-0000-000000000001', 'Essentiel pour l''efficacité énergétique nationale', 'support')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VÉRIFICATION FINALE CAS 11-20
-- ============================================

SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count
FROM marrai_ideas
WHERE id BETWEEN 'b0000000-0000-0000-0000-000000000001' AND '0e000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'marrai_mentors',
  COUNT(*)
FROM marrai_mentors
WHERE id BETWEEN 'b0000000-0000-0000-0000-000000000001' AND '0e000000-0000-0000-0000-000000000001'
UNION ALL
SELECT 
  'marrai_conversation_ideas',
  COUNT(*)
FROM marrai_conversation_ideas
WHERE id BETWEEN 'b0000000-0000-0000-0000-000000000001' AND '0e000000-0000-0000-0000-000000000001';

-- Afficher les 10 nouvelles idées
SELECT 
  id,
  title,
  category,
  location,
  status,
  qualification_tier
FROM marrai_ideas
WHERE id BETWEEN 'b0000000-0000-0000-0000-000000000001' AND '0e000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;

