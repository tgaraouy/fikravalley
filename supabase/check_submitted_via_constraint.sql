-- Script pour vérifier la contrainte CHECK sur submitted_via
-- Exécutez ce script dans Supabase SQL Editor pour voir la contrainte réelle

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'marrai_ideas'::regclass
  AND conname LIKE '%submitted_via%';

-- Alternative: Vérifier directement la définition de la table
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'marrai_ideas'
  AND column_name = 'submitted_via';


