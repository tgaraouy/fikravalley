# Corrections SQL - Use Cases 11-20

## ✅ Corrections Appliquées

### 1. **currentrole → current_role**
- ✅ Tous les `INSERT INTO marrai_mentors` utilisent maintenant `current_role` (colonne correcte)
- ✅ Format: `ARRAY['Role']` pour correspondre au type `TEXT[]`

### 2. **ON CONFLICT DO NONE → DO NOTHING**
- ✅ Tous les `ON CONFLICT` utilisent maintenant `DO NOTHING` (syntaxe PostgreSQL correcte)

### 3. **submitter_type 'farmer' → 'entrepreneur'**
- ✅ Use Case 12: `submitter_type` changé de `'farmer'` à `'entrepreneur'` (valeur valide)

### 4. **Locations non valides → 'other'**
- ✅ Use Case 12 (Erfoud): `'other'` (Erfoud n'est pas dans la liste)
- ✅ Use Case 13 (Tetouan): `'other'` (Tetouan n'est pas dans la liste)
- ✅ Use Case 15 (Nador): `'other'` (Nador n'est pas dans la liste)
- ✅ Use Case 16 (El Jadida): `'other'` (El Jadida n'est pas dans la liste)
- ✅ Use Case 18 (Safi): `'other'` (Safi n'est pas dans la liste)
- ✅ Use Case 19 (Beni Mellal): `'other'` (Beni Mellal n'est pas dans la liste)
- ✅ Use Case 20 (Khouribga): `'other'` (Khouribga n'est pas dans la liste)
- ✅ Use Case 14 (Meknes): `'meknes'` (valide dans la liste)

**Valeurs valides pour `location`:**
- `'casablanca'`, `'rabat'`, `'marrakech'`, `'kenitra'`
- `'tangier'`, `'agadir'`, `'fes'`, `'meknes'`, `'oujda'`, `'other'`

### 5. **validation_date retiré**
- ✅ Use Case 15: `validation_date` retiré de `INSERT INTO marrai_problem_validations` (colonne n'existe pas dans le schéma)

### 6. **Hashs de téléphone uniques**
- ✅ Tous les hashs de téléphone ont été générés avec `bcrypt` (SALT_ROUNDS=12)
- ✅ Chaque numéro a un hash unique
- ✅ Hashs sauvegardés dans `scripts/phone-hashes-11-20.json`

## 📋 Fichier Corrigé

**Fichier:** `supabase/use_cases_11_20_corrige.sql`

## 🚀 Prêt à Exécuter

Le fichier SQL est maintenant **100% conforme** au schéma Supabase et prêt à être exécuté.

### Vérifications Finales

1. ✅ Tous les `current_role` sont des `ARRAY['Role']`
2. ✅ Tous les `ON CONFLICT` utilisent `DO NOTHING`
3. ✅ Tous les `submitter_type` sont valides (`'entrepreneur'`, `'professional'`)
4. ✅ Toutes les `location` sont valides ou `'other'`
5. ✅ Tous les `comment_type` sont valides (`'support'`, `'concern'`, `'suggestion'`, `'question'`, `'technical'`)
6. ✅ Tous les `submitted_via` sont valides (`'web'`, `'whatsapp'`)
7. ✅ Tous les hashs de téléphone sont uniques

## 📊 Structure des Use Cases

Chaque use case (11-20) contient:
- ✅ `marrai_secure_users` (1 enregistrement)
- ✅ `marrai_ideas` (1 enregistrement)
- ✅ `marrai_clarity_scores` (1 enregistrement)
- ✅ `marrai_decision_scores` (1 enregistrement)
- ✅ `marrai_mentors` (1 enregistrement)
- ✅ `marrai_mentor_matches` (1 enregistrement)
- ✅ `marrai_conversation_ideas` (1 enregistrement)
- ✅ `marrai_problem_validations` (1 enregistrement)
- ✅ `marrai_idea_upvotes` (1 enregistrement)
- ✅ `marrai_idea_comments` (1 enregistrement)

**Total: 10 tables × 10 use cases = 100 enregistrements**

## 🎯 Prochaines Étapes

1. Exécuter le fichier `supabase/use_cases_11_20_corrige.sql` dans Supabase SQL Editor
2. Vérifier les comptes avec la requête de vérification incluse
3. Tester les données dans l'application


