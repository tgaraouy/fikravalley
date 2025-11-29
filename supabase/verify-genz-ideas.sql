-- ============================================
-- Vérifier les Idées GenZ Générées
-- ============================================
-- Script pour vérifier les 250 idées publiques générées

-- 1. Compter le total d'idées générées
SELECT 
  COUNT(*) as total_ideas,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_ideas,
  COUNT(CASE WHEN visible = false THEN 1 END) as private_ideas
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';

-- 2. Voir les idées par catégorie
SELECT 
  category,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
GROUP BY category
ORDER BY count DESC;

-- 3. Voir les idées par localisation
SELECT 
  location,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
GROUP BY location
ORDER BY count DESC;

-- 4. Voir quelques exemples d'idées
SELECT 
  id,
  title,
  category,
  location,
  visible,
  status,
  created_at
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
ORDER BY created_at DESC
LIMIT 10;

-- 5. Vérifier la complétude des idées
SELECT 
  COUNT(*) as total,
  COUNT(problem_statement) as has_problem,
  COUNT(proposed_solution) as has_solution,
  COUNT(category) as has_category,
  COUNT(location) as has_location,
  COUNT(data_sources) as has_data_sources,
  COUNT(integration_points) as has_integration_points
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true;

-- 6. Voir les idées les plus récentes
SELECT 
  title,
  category,
  location,
  created_at
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
ORDER BY created_at DESC
LIMIT 20;

