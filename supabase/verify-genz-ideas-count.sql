-- ============================================
-- Vérifier les Idées GenZ Spécifiquement
-- ============================================

-- 1. Compter les idées GenZ
SELECT 
  COUNT(*) as genz_ideas_total,
  COUNT(CASE WHEN visible = true THEN 1 END) as genz_ideas_public,
  MIN(created_at) as first_genz_idea,
  MAX(created_at) as last_genz_idea
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';

-- 2. Voir quelques exemples d'idées GenZ
SELECT 
  id,
  title,
  category,
  location,
  visible,
  created_at
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Répartition par catégorie (GenZ)
SELECT 
  category,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
GROUP BY category
ORDER BY count DESC;

-- 4. Répartition par localisation (GenZ)
SELECT 
  location,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
GROUP BY location
ORDER BY count DESC;

-- 5. Toutes les sources d'idées
SELECT 
  submitter_email,
  COUNT(*) as total,
  COUNT(CASE WHEN visible = true THEN 1 END) as public_count
FROM marrai_ideas
GROUP BY submitter_email
ORDER BY total DESC;

