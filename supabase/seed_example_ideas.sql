-- ============================================
-- FIKRA VALLEY - 3 IDÉES EXEMPLAIRES
-- Dataset pour démonstration et formation
-- ============================================
-- Ces idées sont des exemples parfaits montrant différents niveaux de qualité
-- Idée #1: EXCEPTIONAL (34/40) - RFID Hospitalier
-- Idée #2: QUALIFIÉ (29/40) - Plateforme Darija Éducation
-- Idée #3: QUALIFIÉ (27/40) - Réseau Agriculteurs-Restaurants

-- ============================================
-- PRÉREQUIS: Ajouter la colonne alignment si elle n'existe pas
-- ============================================
-- IMPORTANT: Décommentez et exécutez ces lignes AVANT les INSERT si la colonne n'existe pas
-- OU exécutez d'abord: supabase/scripts/add_alignment_column.sql
--
-- NOTE: Les valeurs estimated_cost utilisent '10K+' pour respecter la contrainte CHECK
-- Si vous préférez des valeurs détaillées, exécutez d'abord:
-- supabase/scripts/remove_estimated_cost_constraint.sql
--
-- IMPORTANT: Exécutez d'abord la migration pour ajouter la colonne visible:
-- supabase/migrations/005_add_visible_column.sql

ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS alignment JSONB DEFAULT '{"moroccoPriorities": [], "sdgTags": [], "sdgAutoTagged": false, "sdgConfidence": {}}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_priorities 
  ON marrai_ideas USING gin((alignment->'moroccoPriorities'));

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_alignment_sdgs 
  ON marrai_ideas USING gin((alignment->'sdgTags'));

-- ============================================
-- IDÉE #1: TRACEUR RFID POUR MATÉRIEL HOSPITALIER
-- Score: 34/40 (EXCEPTIONAL) 🏆
-- ============================================

INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  digitization_opportunity,
  category,
  location,
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
  visible,
  opt_in_public,
  submitted_via,
  alignment,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Traceur RFID pour Matériel Hospitalier Mobile',
  'Les infirmières du CHU Ibn Sina à Rabat perdent en moyenne 4 heures par équipe de 8 heures à chercher du matériel médical mobile (défibrillateurs, pompes à perfusion, moniteurs de signes vitaux, chariots d''urgence). Chaque infirmière effectue environ 6-8 recherches par shift. Sur un service de 30 infirmières, cela représente 180-240 recherches par jour. Le système actuel utilise un cahier papier où l''équipement est supposé être enregistré lorsqu''il change de service, mais 50% des mouvements ne sont pas enregistrés. Quand il y a une urgence, personne ne prend le temps d''écrire. L''équipement se déplace entre les 8 étages sans traçabilité. Les patients attendent pendant que les infirmières cherchent. Le stress et la frustration montent. 450 infirmières et médecins du CHU sont directement affectés, et 2,500 patients par jour reçoivent des soins plus lents.',
  'Un système de localisation en temps réel du matériel médical mobile utilisant la technologie RFID (Radio-Frequency Identification) avec interface web/mobile simple. Chaque équipement reçoit un tag RFID passif (autocollant, 2×3 cm). Des lecteurs RFID sont installés à des points stratégiques (8 par étage). Quand équipement passe près d''un lecteur, position enregistrée automatiquement. Infirmière ouvre app mobile ou web, cherche équipement par nom/type, voit emplacement exact: "Étage 3, Chambre 302, il y a 4 minutes", va directement récupérer l''équipement. Tags RFID ne nécessitent pas de batterie (vs GPS actif coûteux). Aucune action manuelle requise (vs scan manuel). Interface familière style "Find My iPhone" pour équipement. 50 DH par équipement (vs 500 DH systèmes GPS). Développé localement, maintenance locale, données au Maroc.',
  '1. Besoin d''équipement (2 min) - Infirmière identifie le besoin médical, va au poste de soins. 2. Consultation du cahier (5 min) - Cherche dans le cahier papier, informations souvent périmées ou illisibles, 60% du temps l''information est incorrecte. 3. Appels téléphoniques (10 min) - Appelle 3-4 services différents, souvent personne ne répond (occupé avec patients), information contradictoire entre services. 4. Recherche physique (30 min) - Monte/descend les escaliers entre étages, vérifie chambres, couloirs, salles de soins, demande à d''autres collègues. 5. Résolution ou abandon (15 min) - Trouve l''équipement (40% des cas), utilise équipement de secours moins adapté (30%), retarde le soin en attendant disponibilité (20%), transfère patient à autre service (10%). Temps total moyen: 62 minutes par recherche. Coût: 27,900 DH/jour en temps perdu, 6,975,000 DH/an. Matériel "perdu" temporairement: 12 équipements en moyenne (valeur 180,000 DH immobilisée). Retards de soins: Impact sur satisfaction patients (score 6.2/10).',
  'Temps économisé: Avant 62 minutes par recherche, Après 2 minutes (scan QR + voir emplacement), Réduction 97% (60 minutes économisées), Impact: 180 recherches × 60 min = 10,800 min/jour = 180 heures/jour récupérées. Coût économisé: Avant 27,900 DH/jour en temps perdu, Après 1,200 DH/jour (coût système: maintenance + support), Économie: 26,700 DH/jour = 6,675,000 DH/an, ROI: Système payé en 2.3 jours. Qualité des soins améliorée: Temps de réponse aux urgences: -30 minutes (moyenne), Satisfaction patients: 6.2/10 → 8.7/10 (objectif), Stress infirmières: Réduction de 65% (mesuré par enquête), Taux de disponibilité équipement: 45% → 95%. Optimisation matériel: Taux d''utilisation équipement: +40%, Besoin d''achat nouveau matériel: -30%, Durée de vie matériel: +20% (meilleure traçabilité → meilleure maintenance).',
  'health',
  'rabat',
  'multiple_daily',
  ARRAY['RFID readers', 'Mobile app', 'Web dashboard', 'Equipment database'],
  ARRAY['Hospital WiFi network', 'Existing server infrastructure'],
  ARRAY['Real-time location tracking', 'Pattern analysis', 'Predictive equipment placement'],
  180.0, -- heures/jour économisées
  600000.0, -- EUR/an économisés (6,675,000 DH/an ≈ 600,000 EUR)
  '10K+', -- 117,180 DH ≈ 10,000+ EUR
  'Ahmed Benali',
  'ahmed.benali@example.com',
  '212612345678',
  'entrepreneur',
  ARRAY['RFID technology', 'Healthcare systems', 'IoT', 'Project management'],
  'analyzed',
  'exceptional',
  true, -- visible
  true, -- opt_in_public
  'web',
  '{
    "moroccoPriorities": ["digital_morocco", "health_system"],
    "sdgTags": [3, 9],
    "sdgAutoTagged": true,
    "sdgConfidence": {"3": 0.95, "9": 0.90}
  }'::jsonb,
  NOW() - INTERVAL '15 days'
);

-- Insert clarity and decision scores for Idea #1
INSERT INTO marrai_clarity_scores (
  idea_id,
  problem_statement,
  as_is_analysis,
  benefit_statement,
  operational_needs,
  total,
  average,
  qualified,
  qualification_reason,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  10.0,
  9.5,
  10.0,
  10.0,
  39.5, -- total (10.0 + 9.5 + 10.0 + 10.0)
  9.9, -- average (39.5 / 4)
  true, -- qualified (≥6/10)
  'Excellent clarity across all criteria',
  NOW() - INTERVAL '14 days'
);

INSERT INTO marrai_decision_scores (
  idea_id,
  strategic_fit,
  feasibility,
  differentiation,
  evidence_of_demand,
  total,
  qualification_tier,
  break_even_months,
  intilaka_eligible,
  created_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  5.0,
  4.7,
  4.5,
  5.0,
  19.2, -- total (5.0 + 4.7 + 4.5 + 5.0)
  'exceptional',
  3.2,
  true, -- intilaka_eligible (≤24 months)
  NOW() - INTERVAL '14 days'
);

-- Insert receipts for Idea #1 (243 receipts)
INSERT INTO marrai_idea_receipts (
  idea_id,
  user_id,
  type,
  proof_url,
  amount,
  verified,
  verified_at,
  created_at
) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  NULL,
  'barid_cash',
  'https://example.com/receipts/rfid-' || s.series,
  3.00,
  true,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
FROM generate_series(1, 243) AS s(series);

-- ============================================
-- IDÉE #2: PLATEFORME DARIJA POUR COURS EN LIGNE
-- Score: 29/40 (QUALIFIÉ) ✅
-- ============================================

INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  digitization_opportunity,
  category,
  location,
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
  visible,
  opt_in_public,
  submitted_via,
  alignment,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Plateforme Darija pour Cours en Ligne - Lycée Marocain',
  'Les lycéens marocains (16-18 ans) en zones rurales et semi-urbaines qui n''ont pas accès à des cours de soutien de qualité en sciences (maths, physique, SVT). 78% des lycéens ruraux n''ont jamais eu de cours particulier (vs 45% en zones urbaines). Période critique: 9 mois avant le Baccalauréat. Solution actuelle: Cours en classe uniquement (45 élèves par classe en moyenne), YouTube en français/anglais (incompréhensible pour beaucoup), Cahiers de révision achetés (statiques, pas d''explications), Demander aide à famille (souvent non qualifiée). Pourquoi ça ne marche pas: Classes surchargées (prof ne peut pas aider individuellement), YouTube étranger (Explications en français académique ou arabe classique, pas Darija), Cahiers (Pas d''interactivité, questions sans réponses), Famille (Niveau d''éducation insuffisant - 68% parents niveau primaire), Coût cours particuliers (200-300 DH/h impossible pour familles rurales). 280,000 lycéens ruraux au Maroc sont directement affectés. Taux réussite Bac: 62% rural vs 78% urbain.',
  'Une plateforme web/mobile de cours de soutien vidéo INTÉGRALEMENT EN DARIJA pour matières scientifiques du lycée marocain (programme officiel). Élève s''inscrit (smartphone ou ordinateur), choisit niveau (1ère Bac, 2ème Bac) et filière (Sciences Maths, SVT, PC), accède bibliothèque de 500+ vidéos courtes (5-15 min). Chaque vidéo: Un concept expliqué en Darija par prof marocain. Exercices interactifs après chaque vidéo, quiz de validation, suivi progression personnalisé. 100% Darija (Première plateforme éducative complète en Darija marocaine), Programme marocain (Suit exact programme Ministère Éducation), Pédagogie locale (Exemples culturels: souk, football, famille marocaine), Prix accessible (50 DH/mois vs 200 DH/h cours particuliers), Offline (Téléchargement vidéos pour zones connexion limitée).',
  'Processus actuel (étudiant bloqué sur exercice): 1. Blocage sur exercice (instant) - Ne comprend pas concept en cours, Exercice de physique ou maths impossible à résoudre. 2. Recherche d''aide (30 minutes) - Demande à camarades (souvent aussi bloqués), Cherche sur YouTube en français (incompréhensible), Essaie de lire manuel (trop académique). 3. Frustration et abandon (variable) - 65% abandonnent l''exercice, 25% copient réponse sans comprendre, 10% trouvent aide (famille, ami brillant). 4. Accumulation de lacunes - Concepts non compris s''accumulent, Perte de confiance progressive, Stress avant examens, Échec potentiel au Bac. Temps total perdu: 2-3 heures/semaine en recherches infructueuses. Coût actuel: Échec Bac (Redoublement: coût famille + État: 12,000 DH/élève/an), Stress familial (Inestimable), Opportunités perdues (Élèves brillants ruraux n''atteignent pas potentiel), Inégalité éducative (Écart urbain-rural se creuse).',
  'Temps apprentissage: Avant 30 min recherche + abandon frustré, Après 5 min vidéo Darija = compréhension, Gain 25 minutes + réduction frustration + concept maîtrisé. Coût éducation: Cours particuliers 200 DH/h × 4h/mois = 800 DH/mois, Notre plateforme 50 DH/mois (illimité), Économie 750 DH/mois = 9,000 DH/an par élève. Taux de réussite Bac: Actuel rural 62%, Objectif (avec plateforme) 72% (+10 points), Impact 28,000 élèves supplémentaires réussissent annuellement. Équité éducative: Réduction écart urbain-rural de 16 points à 8 points, Élèves ruraux talentueux identifiés et soutenus, Accès égal à éducation de qualité. Confiance et bien-être: Réduction stress avant examens, Augmentation confiance élèves, Réduction décrochage scolaire (objectif: -30%).',
  'education',
  'other',
  'daily',
  ARRAY['Video content library', 'Student progress data', 'Exercise submissions', 'Quiz results'],
  ARRAY['Ministry of Education curriculum database', 'Payment gateways'],
  ARRAY['Personalized learning paths', 'Difficulty assessment', 'Progress tracking'],
  2.5, -- heures/semaine économisées par élève
  800.0, -- EUR/an économisés par élève (9,000 DH/an ≈ 800 EUR)
  '10K+', -- 194,700 DH ≈ 18,000 EUR
  'Fatima Alami',
  'fatima.alami@example.com',
  '212612345679',
  'professional',
  ARRAY['Education technology', 'Pedagogy', 'Video production', 'Darija language'],
  'analyzed',
  'qualified',
  true, -- visible
  true, -- opt_in_public
  'web',
  '{
    "moroccoPriorities": ["education_quality", "rural_development", "digital_morocco", "youth_employment"],
    "sdgTags": [4, 10],
    "sdgAutoTagged": true,
    "sdgConfidence": {"4": 0.95, "10": 0.88}
  }'::jsonb,
  NOW() - INTERVAL '12 days'
);

-- Insert clarity and decision scores for Idea #2
INSERT INTO marrai_clarity_scores (
  idea_id,
  problem_statement,
  as_is_analysis,
  benefit_statement,
  operational_needs,
  total,
  average,
  qualified,
  qualification_reason,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  8.5,
  7.5,
  8.5,
  8.5,
  33.0, -- total (8.5 + 7.5 + 8.5 + 8.5)
  8.3, -- average (33.0 / 4)
  true, -- qualified (≥6/10)
  'Good clarity with minor improvements needed',
  NOW() - INTERVAL '11 days'
);

INSERT INTO marrai_decision_scores (
  idea_id,
  strategic_fit,
  feasibility,
  differentiation,
  evidence_of_demand,
  total,
  qualification_tier,
  break_even_months,
  intilaka_eligible,
  created_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  4.8,
  4.3,
  4.5,
  4.0,
  17.6, -- total (4.8 + 4.3 + 4.5 + 4.0)
  'qualified',
  8.5,
  true, -- intilaka_eligible (≤24 months)
  NOW() - INTERVAL '11 days'
);

-- Insert receipts for Idea #2 (127 receipts)
INSERT INTO marrai_idea_receipts (
  idea_id,
  user_id,
  type,
  proof_url,
  amount,
  verified,
  verified_at,
  created_at
) 
SELECT 
  '22222222-2222-2222-2222-222222222222',
  NULL,
  'barid_cash',
  'https://example.com/receipts/darija-' || s.series,
  3.00,
  true,
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
FROM generate_series(1, 127) AS s(series);

-- ============================================
-- IDÉE #3: RÉSEAU AGRICULTEURS-RESTAURANTS DIRECTS
-- Score: 27/40 (QUALIFIÉ) ✅
-- ============================================

INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  digitization_opportunity,
  category,
  location,
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
  visible,
  opt_in_public,
  submitted_via,
  alignment,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Réseau Agriculteurs-Restaurants Directs - Circuit Court Fès-Meknès',
  'Deux groupes affectés: 1. Petits agriculteurs (5-15 hectares) région Saïs (Fès-Meknès) qui cultivent légumes frais. 2. Restaurants locaux (50-200 couverts/jour) à Fès et Meknès. Fréquence: Quotidienne. Agriculteurs cherchent acheteurs chaque récolte. Restaurants achètent légumes 6 jours/semaine. Solution actuelle côté agriculteurs: Vendent au souk hebdomadaire (1× semaine), Passent par intermédiaires (3-4 niveaux), Acceptent prix imposé (pas de négociation). Solution actuelle côté restaurants: Achètent au marché de gros (Marché Central Fès), Qualité variable origine inconnue, Prix fluctuants (±40% selon jour). Pourquoi ça ne marche pas: Agriculteurs perdent - Prix divisé par 4 (intermédiaires prennent 75%), Tomates vendues 2 DH/kg reçoivent 0.50 DH/kg, Invendus perdus (pas de chambre froide), Dépendance totale aux intermédiaires. Restaurants frustration - Qualité inconsistante (légumes pas frais), Prix instables (difficulté planification), Origine douteuse (traçabilité zéro), Gaspillage (30% legumes jetés). 1,200 petits agriculteurs région Saïs et 350 restaurants Fès-Meknès sont affectés.',
  'Plateforme web/mobile qui connecte agriculteurs et restaurants pour vente directe avec livraison le jour même. Côté agriculteur (matinée): Ouvre app à 6h (après récolte), Photographie produits disponibles, Indique quantités + prix, Valide publication. Côté restaurant (matin): Consulte catalogue agriculteurs proches, Voit photos quantités prix profil agriculteur, Commande en 2 clics, Paiement sécurisé (facturation). Livraison (après-midi): Notre camionnette passe chez 5-10 agriculteurs (circuit), Collecte commandes, Livre aux 8-15 restaurants (circuit), Tout livré avant 18h (service du soir). Prix: Agriculteur vend 2.50 DH/kg (5× mieux qu''avant), Restaurant paie 3.00 DH/kg (25% moins cher qu''avant), Notre marge 0.50 DH/kg (commission). Circuit court (Récolte matin → livré après-midi), Traçabilité (Restaurant sait qui a cultivé), Gagnant-gagnant (Agriculteur + restaurant gagnent), Simple (App facile pour agriculteurs peu tech), Local (Fès-Meknès densité optimale).',
  'Chaîne actuelle (agriculteur → restaurant): 1. Agriculteur récolte (6h du matin) - 100 kg tomates fraîches. 2. Transport au souk (1h + 50 DH essence) - Vend à collecteur: 0.50 DH/kg, Reçoit: 50 DH (- 50 DH transport = 0 DH net!). 3. Collecteur → Grossiste (Fès) - Revend 1.20 DH/kg, Marge: 70 DH. 4. Grossiste → Demi-grossiste - Revend 2.50 DH/kg, Marge: 130 DH. 5. Demi-grossiste → Restaurant - Prix: 4.00 DH/kg, Marge: 150 DH. 6. Restaurant reçoit (lendemain matin) - Paie: 400 DH pour 100kg, Fraîcheur: 24-36h après récolte, Qualité: 30% déjà abîmés. Résultat absurde: Agriculteur 0 DH (perd argent!), Intermédiaires 350 DH (88%), Restaurant paie 400 DH pour légumes pas frais. Coût système actuel: Pour agriculteur (mensuel) - Revenu 1,500 DH/mois (5 tonnes × 0 DH net), Sous seuil pauvreté (2,500 DH), Endettement croissant. Pour restaurant (mensuel) - Achats légumes 25,000 DH, Gaspillage 30%: 7,500 DH jeté, Coût réel 32,500 DH.',
  'Revenus agriculteurs: Avant 0-0.50 DH/kg (avec intermédiaires), Après 2.50 DH/kg (vente directe), Augmentation +400% (2.00 DH/kg supplémentaires), Impact 5 tonnes/mois = +10,000 DH/mois par agriculteur. Coût restaurants: Avant 4.00 DH/kg + 30% gaspillage = 5.20 DH/kg effectif, Après 3.00 DH/kg + 10% gaspillage = 3.30 DH/kg effectif, Économie 37% (-1.90 DH/kg), Impact 5 tonnes/mois = -9,500 DH/mois. Qualité fraîcheur: Avant 24-36h après récolte, Après 6-12h après récolte (livraison jour même), Gaspillage 30% → 10%, Satisfaction clients +45% (enquête prévue). Impact environnemental: Transport réduit 200 km → 30 km (circuit court), Émissions CO2 -85%, Pesticides Traçabilité → Réduction progressive, Emballages Caisses réutilisables vs plastique. Équité & développement: Revenus agriculteurs × 5, Fixation population rurale (jeunes restent), Restaurants Image "produits locaux" (marketing), Création emplois logistique. ROI: Agriculteur +10,000 DH/mois, Restaurant -9,500 DH/mois, Total valeur créée 19,500 DH/mois par binôme, Annuel 234,000 DH.',
  'agriculture',
  'fes',
  'daily',
  ARRAY['Farmer product listings', 'Restaurant orders', 'Delivery routes', 'Payment transactions'],
  ARRAY['Mobile payment systems', 'Mapping services'],
  ARRAY['Route optimization', 'Demand forecasting', 'Price optimization'],
  0.0, -- Pas de temps économisé directement, mais valeur créée
  21000.0, -- EUR/an valeur créée par binôme (234,000 DH/an ≈ 21,000 EUR)
  '10K+', -- 196,300 DH ≈ 18,000 EUR
  'Hassan Tazi',
  'hassan.tazi@example.com',
  '212612345680',
  'entrepreneur',
  ARRAY['Agriculture', 'Logistics', 'E-commerce', 'Supply chain'],
  'analyzed',
  'qualified',
  true, -- visible
  true, -- opt_in_public
  'web',
  '{
    "moroccoPriorities": ["rural_development", "green_morocco", "youth_employment"],
    "sdgTags": [2, 12, 8],
    "sdgAutoTagged": true,
    "sdgConfidence": {"2": 0.90, "12": 0.88, "8": 0.85}
  }'::jsonb,
  NOW() - INTERVAL '10 days'
);

-- Insert clarity and decision scores for Idea #3
INSERT INTO marrai_clarity_scores (
  idea_id,
  problem_statement,
  as_is_analysis,
  benefit_statement,
  operational_needs,
  total,
  average,
  qualified,
  qualification_reason,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  8.0,
  7.5,
  8.0,
  7.5,
  31.0, -- total (8.0 + 7.5 + 8.0 + 7.5)
  7.8, -- average (31.0 / 4)
  true, -- qualified (≥6/10)
  'Good clarity, well-structured idea',
  NOW() - INTERVAL '9 days'
);

INSERT INTO marrai_decision_scores (
  idea_id,
  strategic_fit,
  feasibility,
  differentiation,
  evidence_of_demand,
  total,
  qualification_tier,
  break_even_months,
  intilaka_eligible,
  created_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  4.5,
  3.8,
  4.5,
  3.0,
  15.8, -- total (4.5 + 3.8 + 4.5 + 3.0)
  'qualified',
  11.0, -- Note: 11 mois break-even
  true, -- intilaka_eligible (11.0 < 24 months threshold)
  NOW() - INTERVAL '9 days'
);

-- Insert receipts for Idea #3 (89 receipts)
INSERT INTO marrai_idea_receipts (
  idea_id,
  user_id,
  type,
  proof_url,
  amount,
  verified,
  verified_at,
  created_at
) 
SELECT 
  '33333333-3333-3333-3333-333333333333',
  NULL,
  'barid_cash',
  'https://example.com/receipts/agri-' || s.series,
  3.00,
  true,
  NOW() - INTERVAL '16 days',
  NOW() - INTERVAL '16 days'
FROM generate_series(1, 89) AS s(series);

-- ============================================
-- UPDATE IDEA SCORES VIEW (if needed)
-- ============================================

-- The marrai_idea_scores view will automatically show these scores
-- No need to insert separately as it's a view that joins clarity and decision scores

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check all 3 ideas were inserted
-- SELECT id, title, qualification_tier, status FROM marrai_ideas WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- );

-- Check scores
-- SELECT idea_id, weighted_score, qualification_tier FROM marrai_decision_scores WHERE idea_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- );

-- Check receipts count
-- SELECT idea_id, COUNT(*) as receipt_count FROM marrai_idea_receipts WHERE idea_id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- ) GROUP BY idea_id;

