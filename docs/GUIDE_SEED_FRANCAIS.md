# 📋 Guide: Seed Complet en Français

## Vue d'Ensemble

Ce guide explique comment utiliser le script de seed complet en français pour peupler toutes les tables de la base de données.

## Fichiers

1. **`supabase/truncate_all_tables.sql`** - Vide toutes les tables marrai_*
2. **`supabase/seed_complet_francais.sql`** - Données de test complètes en français

## Procédure

### Étape 1: Vider les Tables

Exécutez dans Supabase SQL Editor:

```sql
-- Exécuter: supabase/truncate_all_tables.sql
```

Ou manuellement:

```sql
TRUNCATE TABLE marrai_idea_comments CASCADE;
TRUNCATE TABLE marrai_idea_upvotes CASCADE;
TRUNCATE TABLE marrai_problem_validations CASCADE;
TRUNCATE TABLE marrai_funding_applications CASCADE;
TRUNCATE TABLE marrai_self_ask_responses CASCADE;
TRUNCATE TABLE marrai_self_ask_questions CASCADE;
TRUNCATE TABLE marrai_idea_receipts CASCADE;
TRUNCATE TABLE marrai_decision_scores CASCADE;
TRUNCATE TABLE marrai_clarity_scores CASCADE;
TRUNCATE TABLE marrai_mentor_matches CASCADE;
TRUNCATE TABLE marrai_conversation_ideas CASCADE;
TRUNCATE TABLE marrai_ideas CASCADE;
TRUNCATE TABLE marrai_mentors CASCADE;
TRUNCATE TABLE marrai_export_requests CASCADE;
TRUNCATE TABLE marrai_deletion_requests CASCADE;
TRUNCATE TABLE marrai_consents CASCADE;
TRUNCATE TABLE marrai_admin_actions CASCADE;
TRUNCATE TABLE marrai_audit_logs CASCADE;
TRUNCATE TABLE marrai_secure_users CASCADE;
TRUNCATE TABLE marrai_pods CASCADE;
```

### Étape 2: Vérifier les Migrations

Assurez-vous que toutes les migrations sont exécutées:

- ✅ `001_complete_idea_bank_schema.sql`
- ✅ `002_add_mentors_and_full_document.sql`
- ✅ `003_add_alignment_field.sql`
- ✅ `003_add_tracking_code_and_verification.sql`
- ✅ `004_add_conversation_ideas_insert_policy.sql`
- ✅ `004_add_followup_tracking.sql`
- ✅ `005_add_visible_column.sql`
- ✅ `006_allow_custom_categories_locations.sql`
- ✅ `20250101000000_create_pods_table.sql`

### Étape 3: Exécuter le Seed

Exécutez dans Supabase SQL Editor:

```sql
-- Exécuter: supabase/seed_complet_francais.sql
```

## Données Incluses

### 1. Utilisateurs (3)
- Utilisateurs sécurisés avec données chiffrées de test
- Consentements et rétention de données

### 2. Idées (5)
- **Assistant IA pour Réunions** (tech, Casablanca)
- **Gestion Intelligente des Emails** (tech, Rabat)
- **Diagnostic Médical IA** (health, Casablanca)
- **Tuteur IA Personnalisé** (education, Fes)
- **Détection de Fraude Financière** (finance, Casablanca)

**Tous les champs inclus:**
- ✅ `visible = true` (toutes visibles)
- ✅ `featured = true` (toutes featured)
- ✅ `alignment` (JSONB avec priorités Maroc et SDGs)
- ✅ `automation_potential`, `agent_type`
- ✅ `priority` (high, critical)
- ✅ `qualification_tier` (exceptional, qualified)
- ✅ ROI, coûts, compétences
- ✅ Tous les champs requis

### 3. Scores (5 idées)
- **Scores de Clarté** (Stage 1): 31.0 à 36.5 / 40
- **Scores de Décision** (Stage 2): 16.5 à 19.5 / 20
- Tous qualifiés pour Intilaka (≤24 mois)

### 4. Mentors (3)
- **Dr. Amine El Fassi** (Santé, Paris)
- **Sofia Benkirane** (Éducation, New York)
- **Mehdi Alaoui** (Finance, Casablanca)

**Champs inclus:**
- Expertise, compétences, expérience
- Disponibilité, co-funding
- Participation workshops, MGL

### 5. Matches (3)
- Match automatique mentor-idée avec scores
- Statut: pending (en attente d'approbation admin)

### 6. Idées de Conversation (2)
- **Nettoyage Intelligent des Rues** (promoted)
- **Marché Digital pour Artisanat** (speaker_contacted)

### 7. Engagement
- **Validations de problèmes** (3)
- **Upvotes** (4)
- **Commentaires** (2)

## Vérification

Après l'exécution, vérifiez avec:

```sql
-- Compter les données
SELECT 
  'marrai_ideas' as table_name,
  COUNT(*) as count
FROM marrai_ideas
UNION ALL
SELECT 'marrai_mentors', COUNT(*) FROM marrai_mentors
UNION ALL
SELECT 'marrai_mentor_matches', COUNT(*) FROM marrai_mentor_matches
UNION ALL
SELECT 'marrai_conversation_ideas', COUNT(*) FROM marrai_conversation_ideas;

-- Vérifier les idées visibles
SELECT 
  id,
  title,
  category,
  visible,
  featured,
  qualification_tier
FROM marrai_ideas
WHERE visible = true;
```

## Résultat Attendu

- ✅ 5 idées visibles dans `/ideas`
- ✅ 3 mentors disponibles pour matching
- ✅ 3 matches en attente d'approbation
- ✅ Scores complets pour toutes les idées
- ✅ Données d'engagement (upvotes, commentaires)

## Notes

- Toutes les données sont en **français**
- Toutes les idées ont `visible = true`
- Tous les champs requis sont remplis
- Les relations (foreign keys) sont respectées
- Les contraintes CHECK sont respectées

## Problèmes Courants

### Erreur: Foreign Key Constraint

**Cause**: Tables non vidées dans le bon ordre

**Solution**: Utilisez `truncate_all_tables.sql` qui gère les dépendances

### Erreur: Column doesn't exist

**Cause**: Migration manquante

**Solution**: Exécutez toutes les migrations avant le seed

### 0 idées visibles

**Cause**: `visible = false` par défaut

**Solution**: Le script seed définit `visible = true` pour toutes les idées

