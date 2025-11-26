-- ============================================
-- CORRECTIONS À APPLIQUER AU SQL DES USE CASES
-- ============================================

-- ERREUR 1: workshop_conversation → workshop
-- Remplacer toutes les occurrences de:
--   submitted_via, 'workshop_conversation'
-- Par:
--   submitted_via, 'workshop'

-- ERREUR 2: currentrole → current_role
-- Remplacer toutes les occurrences de:
--   currentrole,
-- Par:
--   current_role,

-- ERREUR 3: ON CONFLICT (id) DO NULL → DO NOTHING
-- Remplacer toutes les occurrences de:
--   ON CONFLICT (id) DO NULL;
-- Par:
--   ON CONFLICT (id) DO NOTHING;

-- ERREUR 4: submitter_type invalides
-- Remplacer:
--   'cooperative_leader' → 'entrepreneur'
--   'farmer' → 'entrepreneur'
--   'community_leader' → 'entrepreneur'

-- ERREUR 5: max_cofund_amount format
-- Remplacer toutes les occurrences de:
--   max_cofund_amount, '75000 EUR'
-- Par:
--   max_cofund_amount, 75000.00
-- (ou NULL si pas de montant)

-- ERREUR 6: current_role est TEXT, pas TEXT[]
-- Dans marrai_mentors, utiliser:
--   current_role TEXT
-- Pas:
--   current_role ARRAY['CEO', 'Cooperative Founder']
-- Utiliser la première valeur seulement ou concaténer

