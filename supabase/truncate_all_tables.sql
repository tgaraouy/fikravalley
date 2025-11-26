-- ============================================
-- TRUNCATE TOUTES LES TABLES marrai_*
-- ============================================
-- ⚠️ ATTENTION: Ce script supprime TOUTES les données!
-- Exécutez ce script AVANT de charger les données de seed
-- ============================================

-- Désactiver temporairement les contraintes de clés étrangères
SET session_replication_role = 'replica';

-- Tronquer toutes les tables dans l'ordre (dépendances)
-- Utiliser DO block pour gérer les tables qui pourraient ne pas exister
DO $$
BEGIN
  -- Tables avec dépendances (à tronquer en premier)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_idea_comments') THEN
    TRUNCATE TABLE marrai_idea_comments CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_idea_upvotes') THEN
    TRUNCATE TABLE marrai_idea_upvotes CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_problem_validations') THEN
    TRUNCATE TABLE marrai_problem_validations CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_funding_applications') THEN
    TRUNCATE TABLE marrai_funding_applications CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_self_ask_responses') THEN
    TRUNCATE TABLE marrai_self_ask_responses CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_self_ask_questions') THEN
    TRUNCATE TABLE marrai_self_ask_questions CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_idea_receipts') THEN
    TRUNCATE TABLE marrai_idea_receipts CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_decision_scores') THEN
    TRUNCATE TABLE marrai_decision_scores CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_clarity_scores') THEN
    TRUNCATE TABLE marrai_clarity_scores CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_mentor_matches') THEN
    TRUNCATE TABLE marrai_mentor_matches CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_conversation_ideas') THEN
    TRUNCATE TABLE marrai_conversation_ideas CASCADE;
  END IF;
  
  -- Tables principales
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_ideas') THEN
    TRUNCATE TABLE marrai_ideas CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_mentors') THEN
    TRUNCATE TABLE marrai_mentors CASCADE;
  END IF;
  
  -- Tables de support
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_export_requests') THEN
    TRUNCATE TABLE marrai_export_requests CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_deletion_requests') THEN
    TRUNCATE TABLE marrai_deletion_requests CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_consents') THEN
    TRUNCATE TABLE marrai_consents CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_admin_actions') THEN
    TRUNCATE TABLE marrai_admin_actions CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_audit_logs') THEN
    TRUNCATE TABLE marrai_audit_logs CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_secure_users') THEN
    TRUNCATE TABLE marrai_secure_users CASCADE;
  END IF;
  
  -- Table optionnelle (pods)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'marrai_pods') THEN
    TRUNCATE TABLE marrai_pods CASCADE;
  END IF;
  
  RAISE NOTICE '✅ Toutes les tables marrai_* existantes ont été vidées avec succès!';
END $$;

-- Réactiver les contraintes
SET session_replication_role = 'origin';

-- Vérification: Compter les enregistrements (devrait être 0)
SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count
FROM marrai_ideas
UNION ALL
SELECT 'marrai_mentors', COUNT(*) FROM marrai_mentors
UNION ALL
SELECT 'marrai_secure_users', COUNT(*) FROM marrai_secure_users
UNION ALL
SELECT 'marrai_conversation_ideas', COUNT(*) FROM marrai_conversation_ideas
UNION ALL
SELECT 'marrai_clarity_scores', COUNT(*) FROM marrai_clarity_scores
UNION ALL
SELECT 'marrai_decision_scores', COUNT(*) FROM marrai_decision_scores
UNION ALL
SELECT 'marrai_mentor_matches', COUNT(*) FROM marrai_mentor_matches;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Toutes les tables marrai_* ont été vidées avec succès!';
  RAISE NOTICE 'Vous pouvez maintenant exécuter le script de seed.';
END $$;

