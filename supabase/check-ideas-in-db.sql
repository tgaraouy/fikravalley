-- ============================================
-- Vérifier les Idées dans Supabase
-- ============================================
-- Script de diagnostic pour vérifier les idées dans la base de données

-- 1. Compter le total d'idées
SELECT 
  COUNT(*) as total_ideas,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_ideas,
  COUNT(CASE WHEN visible = false THEN 1 END) as private_ideas,
  COUNT(CASE WHEN visible IS NULL THEN 1 END) as null_visible
FROM marrai_ideas;

-- 2. Voir les idées par submitter_email
SELECT 
  submitter_email,
  COUNT(*) as count,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_count,
  COUNT(CASE WHEN visible = false THEN 1 END) as private_count
FROM marrai_ideas
GROUP BY submitter_email
ORDER BY count DESC;

-- 3. Voir les idées GenZ (genz-research@fikravalley.com)
SELECT 
  COUNT(*) as genz_ideas_total,
  COUNT(CASE WHEN visible = true THEN 1 END) as genz_ideas_public,
  COUNT(CASE WHEN visible = false THEN 1 END) as genz_ideas_private,
  MIN(created_at) as first_idea_date,
  MAX(created_at) as last_idea_date
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';

-- 4. Voir quelques exemples d'idées GenZ
SELECT 
  id,
  title,
  category,
  location,
  visible,
  status,
  created_at,
  submitter_email
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Voir toutes les idées récentes (toutes sources)
SELECT 
  id,
  title,
  category,
  location,
  visible,
  status,
  submitter_email,
  created_at
FROM marrai_ideas 
ORDER BY created_at DESC
LIMIT 20;

-- 6. Vérifier si la colonne 'visible' existe
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'marrai_ideas'
AND column_name = 'visible';

-- 7. Voir les idées par catégorie
SELECT 
  category,
  COUNT(*) as count,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_count
FROM marrai_ideas
GROUP BY category
ORDER BY count DESC;

-- 8. Voir les idées par localisation
SELECT 
  location,
  COUNT(*) as count,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_count
FROM marrai_ideas
GROUP BY location
ORDER BY count DESC;

-- 9. Vérifier les idées sans colonne visible (si elle n'existe pas)
SELECT 
  COUNT(*) as total_without_visible_check
FROM marrai_ideas
WHERE visible IS NULL OR visible = true;

-- 10. Voir les dernières idées créées (avec tous les détails)
SELECT 
  id,
  title,
  problem_statement,
  category,
  location,
  visible,
  status,
  submitter_name,
  submitter_email,
  created_at
FROM marrai_ideas 
ORDER BY created_at DESC
LIMIT 5;

