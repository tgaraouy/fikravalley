-- ============================================
-- Vérification des Données de Seed
-- ============================================
-- Exécutez ce script pour vérifier que toutes les données ont été insérées correctement
-- ============================================

-- 1. Compter toutes les données
SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE visible = true) as visible_count
FROM marrai_ideas
UNION ALL
SELECT 
  'marrai_mentors',
  COUNT(*),
  COUNT(*) FILTER (WHERE willing_to_mentor = true) as willing_count
FROM marrai_mentors
UNION ALL
SELECT 
  'marrai_mentor_matches',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count
FROM marrai_mentor_matches
UNION ALL
SELECT 
  'marrai_conversation_ideas',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'promoted_to_idea') as promoted_count
FROM marrai_conversation_ideas
UNION ALL
SELECT 
  'marrai_clarity_scores',
  COUNT(*),
  COUNT(*) FILTER (WHERE qualified = true) as qualified_count
FROM marrai_clarity_scores
UNION ALL
SELECT 
  'marrai_decision_scores',
  COUNT(*),
  COUNT(*) FILTER (WHERE intilaka_eligible = true) as intilaka_eligible_count
FROM marrai_decision_scores
UNION ALL
SELECT 
  'marrai_secure_users',
  COUNT(*),
  COUNT(*) FILTER (WHERE consent = true) as consented_count
FROM marrai_secure_users
UNION ALL
SELECT 
  'marrai_problem_validations',
  COUNT(*),
  NULL
FROM marrai_problem_validations
UNION ALL
SELECT 
  'marrai_idea_upvotes',
  COUNT(*),
  NULL
FROM marrai_idea_upvotes
UNION ALL
SELECT 
  'marrai_idea_comments',
  COUNT(*),
  NULL
FROM marrai_idea_comments;

-- 2. Vérifier les idées visibles
SELECT 
  '=== IDÉES VISIBLES ===' as section;
  
SELECT 
  id,
  title,
  category,
  location,
  status,
  qualification_tier,
  visible,
  featured,
  priority
FROM marrai_ideas
WHERE visible = true
ORDER BY created_at DESC;

-- 3. Vérifier les mentors
SELECT 
  '=== MENTORS ===' as section;
  
SELECT 
  id,
  name,
  email,
  location,
  moroccan_city,
  expertise,
  willing_to_mentor,
  willing_to_cofund
FROM marrai_mentors
ORDER BY created_at DESC;

-- 4. Vérifier les matches
SELECT 
  '=== MATCHES MENTORS-IDÉES ===' as section;
  
SELECT 
  mm.id,
  i.title as idea_title,
  m.name as mentor_name,
  mm.match_score,
  mm.status,
  mm.match_reason
FROM marrai_mentor_matches mm
JOIN marrai_ideas i ON i.id = mm.idea_id
JOIN marrai_mentors m ON m.id = mm.mentor_id
ORDER BY mm.match_score DESC;

-- 5. Vérifier les scores
SELECT 
  '=== SCORES DES IDÉES ===' as section;
  
SELECT 
  i.title,
  cs.total as clarity_score,
  ds.total as decision_score,
  (cs.total + ds.total) as total_score,
  ds.qualification_tier,
  ds.intilaka_eligible
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
WHERE i.visible = true
ORDER BY (cs.total + ds.total) DESC;

-- 6. Vérifier l'engagement
SELECT 
  '=== ENGAGEMENT ===' as section;
  
SELECT 
  'Upvotes' as type,
  COUNT(*) as count
FROM marrai_idea_upvotes
UNION ALL
SELECT 
  'Commentaires',
  COUNT(*)
FROM marrai_idea_comments
UNION ALL
SELECT 
  'Validations de problèmes',
  COUNT(*)
FROM marrai_problem_validations;

