# Guide: Insérer les 3 Idées Exemplaires

## Fichier SQL

**Location:** `supabase/seed_example_ideas.sql`

## Instructions d'Insertion

### Méthode 1: Supabase Dashboard (Recommandé)

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrir SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu gauche
   - Cliquez sur "New query"

3. **Copier le Script**
   - Ouvrez `supabase/seed_example_ideas.sql`
   - Copiez tout le contenu (Ctrl+A, Ctrl+C)

4. **Exécuter**
   - Collez dans l'éditeur SQL
   - Cliquez sur "Run" ou appuyez sur Ctrl+Enter
   - Attendez la confirmation "Success"

### Méthode 2: Via psql (Ligne de commande)

```bash
# Récupérer les credentials Supabase
# Project Settings → Database → Connection string

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/seed_example_ideas.sql
```

### Méthode 3: Via Supabase CLI

```bash
# Si vous avez Supabase CLI installé
supabase db reset  # ⚠️ ATTENTION: Efface toutes les données!
# Puis exécuter les migrations
supabase db push
# Puis exécuter le seed
psql $(supabase db url) -f supabase/seed_example_ideas.sql
```

## Vérification

### 1. Vérifier les Idées

```sql
SELECT 
  id, 
  title, 
  qualification_tier, 
  status,
  submitter_name,
  submitter_email
FROM marrai_ideas 
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY created_at DESC;
```

**Résultat attendu:** 3 lignes

### 2. Vérifier les Scores

```sql
SELECT 
  i.title,
  cs.weighted_score as clarity_score,
  ds.weighted_score as decision_score,
  ds.qualification_tier,
  ds.break_even_months
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
WHERE i.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
ORDER BY ds.weighted_score DESC;
```

**Résultat attendu:**
- RFID: 9.8 clarity, 34.2 decision, exceptional, 3.2 mois
- Darija: 8.2 clarity, 29.1 decision, qualified, 8.5 mois
- Agri: 7.8 clarity, 27.4 decision, qualified, 11.0 mois

### 3. Vérifier les Reçus

```sql
SELECT 
  i.title,
  COUNT(r.id) as receipt_count,
  COUNT(r.id) FILTER (WHERE r.verified = true) as verified_count,
  SUM(r.amount) as total_amount
FROM marrai_ideas i
LEFT JOIN marrai_idea_receipts r ON r.idea_id = i.id
WHERE i.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
)
GROUP BY i.id, i.title
ORDER BY receipt_count DESC;
```

**Résultat attendu:**
- RFID: 243 reçus, 243 vérifiés, 729 DH
- Darija: 127 reçus, 127 vérifiés, 381 DH
- Agri: 89 reçus, 89 vérifiés, 267 DH

### 4. Vérifier l'Alignement Stratégique

```sql
SELECT 
  i.title,
  i.alignment->>'moroccoPriorities' as morocco_priorities,
  i.alignment->>'sdgTags' as sdg_tags
FROM marrai_ideas i
WHERE i.id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);
```

**Résultat attendu:** JSON avec priorités marocaines et SDGs

## Utilisation dans l'Application

### Admin Dashboard

1. Aller sur `/admin`
2. Onglet "Ideas"
3. Vous devriez voir les 3 idées avec leurs scores
4. Cliquer sur chaque idée pour voir les détails complets

### Public Idea Bank

1. Aller sur `/ideas`
2. Rechercher par titre ou catégorie
3. Les idées apparaîtront avec leurs scores et reçus
4. Cliquer pour voir les pages de détail

### Follow-up Dashboard

1. Aller sur `/admin` → Onglet "Follow-up"
2. Les idées qualifiées apparaîtront dans la liste
3. Vous pouvez contacter les soumissionnaires directement

## Dépannage

### Erreur: "duplicate key value"

**Cause:** Les idées existent déjà

**Solution:**
```sql
-- Supprimer d'abord les reçus
DELETE FROM marrai_idea_receipts 
WHERE idea_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333'
);

-- Supprimer les scores
DELETE FROM marrai_decision_scores WHERE idea_id IN (...);
DELETE FROM marrai_clarity_scores WHERE idea_id IN (...);

-- Supprimer les idées
DELETE FROM marrai_ideas WHERE id IN (...);

-- Puis ré-exécuter le script
```

### Erreur: "column does not exist"

**Cause:** Migration pas encore exécutée

**Solution:**
1. Exécuter d'abord `supabase/migrations/001_complete_idea_bank_schema.sql`
2. Puis exécuter `supabase/seed_example_ideas.sql`

### Erreur: "foreign key constraint"

**Cause:** Tables dépendantes manquantes

**Solution:**
Vérifier que toutes les migrations ont été exécutées:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%'
ORDER BY tablename;
```

## Personnalisation

### Modifier les Scores

Éditez les valeurs dans les `INSERT INTO marrai_clarity_scores` et `marrai_decision_scores`.

### Modifier les Reçus

Changez le nombre dans `generate_series(1, 243)` pour chaque idée.

### Ajouter Plus d'Idées

Copiez la structure d'une idée existante et modifiez:
- UUID (générer nouveau)
- Tous les champs de contenu
- Scores correspondants
- Nombre de reçus

## Notes Importantes

⚠️ **Les emails sont factices** (`@example.com`)
⚠️ **Les numéros de téléphone sont factices** (format 212612345678)
⚠️ **Les URLs de reçus sont factices** (`https://example.com/receipts/...`)
⚠️ **Les timestamps sont relatifs** (NOW() - INTERVAL)

Pour production, remplacez par de vraies données.

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs Supabase
2. Vérifiez que toutes les migrations sont appliquées
3. Vérifiez les contraintes de clés étrangères
4. Consultez `docs/example-ideas-dataset.md` pour plus de détails

