# 🔍 Guide : Vérifier les Idées dans Supabase

## 📋 Problème : "Je ne vois pas les idées dans Supabase"

Ce guide vous aide à diagnostiquer et résoudre le problème.

---

## ✅ Étape 1 : Vérifier avec SQL

### Option A : Utiliser le script SQL de diagnostic

1. **Ouvrez Supabase Dashboard**
   - Allez sur [supabase.com](https://supabase.com)
   - Connectez-vous à votre projet
   - Ouvrez **SQL Editor**

2. **Exécutez le script de diagnostic**
   - Copiez le contenu de `supabase/check-ideas-in-db.sql`
   - Collez dans SQL Editor
   - Cliquez sur **Run**

3. **Vérifiez les résultats**
   - Regardez la première requête : `total_ideas`
   - Si `total_ideas = 0` → Aucune idée n'a été insérée
   - Si `total_ideas > 0` → Les idées sont là, mais peut-être pas visibles

---

### Option B : Requêtes rapides

**Compter toutes les idées :**
```sql
SELECT COUNT(*) as total FROM marrai_ideas;
```

**Voir les idées GenZ :**
```sql
SELECT COUNT(*) 
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';
```

**Voir les idées publiques :**
```sql
SELECT COUNT(*) 
FROM marrai_ideas 
WHERE visible = true;
```

**Voir les 10 dernières idées :**
```sql
SELECT id, title, visible, created_at, submitter_email
FROM marrai_ideas 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🔍 Étape 2 : Vérifier via Table Editor

1. **Ouvrez Table Editor dans Supabase**
   - Allez dans **Table Editor**
   - Sélectionnez la table **`marrai_ideas`**

2. **Vérifiez les filtres**
   - Assurez-vous qu'aucun filtre n'est actif
   - Cliquez sur **Clear filters** si nécessaire

3. **Vérifiez la colonne `visible`**
   - Si la colonne existe, vérifiez les valeurs
   - `true` = idées publiques
   - `false` = idées privées
   - `NULL` = peut causer des problèmes

---

## 🐛 Étape 3 : Diagnostic des problèmes courants

### Problème 1 : Aucune idée dans la base (`COUNT(*) = 0`)

**Causes possibles :**
- Le script de génération n'a pas été exécuté
- Le script a échoué silencieusement
- Erreurs d'insertion non affichées

**Solutions :**
1. Vérifiez les logs du script :
   ```bash
   npx tsx scripts/generate-genz-ideas.ts
   ```
   - Cherchez les messages `✅ Successfully inserted`
   - Cherchez les erreurs `❌ Error inserting`

2. Vérifiez les variables d'environnement :
   ```bash
   # Vérifiez que ces variables existent dans .env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. Vérifiez les permissions RLS :
   ```sql
   -- Vérifier les politiques RLS
   SELECT * FROM pg_policies 
   WHERE tablename = 'marrai_ideas';
   ```

---

### Problème 2 : Idées présentes mais `visible = false` ou `NULL`

**Causes possibles :**
- Le script a inséré avec `visible = false`
- La colonne `visible` n'existe pas
- Valeur par défaut incorrecte

**Solutions :**

1. **Vérifier si la colonne existe :**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'marrai_ideas'
   AND column_name = 'visible';
   ```

2. **Si la colonne n'existe pas, créer la migration :**
   ```sql
   -- Voir supabase/migrations/005_add_visible_column.sql
   ```

3. **Mettre à jour les idées existantes :**
   ```sql
   -- Mettre toutes les idées GenZ en public
   UPDATE marrai_ideas 
   SET visible = true 
   WHERE submitter_email = 'genz-research@fikravalley.com'
   AND (visible = false OR visible IS NULL);
   ```

---

### Problème 3 : Idées présentes mais pas visibles dans l'interface

**Causes possibles :**
- Filtre `visible = true` dans l'API
- Problème de cache
- RLS bloque l'accès

**Solutions :**

1. **Vérifier l'API :**
   - Testez directement : `/api/ideas/search?q=`
   - Vérifiez les logs du serveur

2. **Vérifier RLS :**
   ```sql
   -- Vérifier les politiques
   SELECT * FROM pg_policies 
   WHERE tablename = 'marrai_ideas';
   
   -- Tester l'accès
   SET ROLE anon;
   SELECT COUNT(*) FROM marrai_ideas WHERE visible = true;
   ```

3. **Vider le cache :**
   - Redémarrer le serveur Next.js
   - Vider le cache du navigateur

---

## 🔧 Étape 4 : Solutions rapides

### Solution 1 : Forcer la visibilité des idées GenZ

```sql
-- Mettre toutes les idées GenZ en public
UPDATE marrai_ideas 
SET visible = true 
WHERE submitter_email = 'genz-research@fikravalley.com';
```

### Solution 2 : Vérifier et corriger les idées récentes

```sql
-- Voir les idées récentes avec leur statut
SELECT 
  id,
  title,
  visible,
  status,
  submitter_email,
  created_at
FROM marrai_ideas 
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Solution 3 : Réinsérer les idées manquantes

Si les idées n'ont pas été insérées, relancez le script :
```bash
npx tsx scripts/generate-genz-ideas.ts
```

Le script reprendra automatiquement depuis la dernière progression.

---

## 📊 Étape 5 : Vérification complète

Exécutez cette requête complète pour un diagnostic complet :

```sql
-- Diagnostic complet
SELECT 
  'Total Ideas' as metric,
  COUNT(*)::text as value
FROM marrai_ideas

UNION ALL

SELECT 
  'Public Ideas',
  COUNT(*)::text
FROM marrai_ideas 
WHERE visible = true

UNION ALL

SELECT 
  'Private Ideas',
  COUNT(*)::text
FROM marrai_ideas 
WHERE visible = false

UNION ALL

SELECT 
  'GenZ Ideas',
  COUNT(*)::text
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'

UNION ALL

SELECT 
  'GenZ Public',
  COUNT(*)::text
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true

UNION ALL

SELECT 
  'Last Idea Date',
  MAX(created_at)::text
FROM marrai_ideas;
```

---

## ✅ Checklist de vérification

- [ ] Exécuté le script SQL de diagnostic
- [ ] Vérifié `COUNT(*)` dans `marrai_ideas`
- [ ] Vérifié la colonne `visible` existe
- [ ] Vérifié les idées GenZ (`submitter_email = 'genz-research@fikravalley.com'`)
- [ ] Vérifié les permissions RLS
- [ ] Testé l'API `/api/ideas/search`
- [ ] Vérifié les logs du script de génération

---

## 🆘 Si rien ne fonctionne

1. **Vérifiez les logs du script :**
   - Regardez la sortie de `npx tsx scripts/generate-genz-ideas.ts`
   - Cherchez les erreurs

2. **Vérifiez les variables d'environnement :**
   ```bash
   # Dans .env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. **Testez la connexion Supabase :**
   ```sql
   -- Test simple
   SELECT NOW();
   ```

4. **Contactez le support :**
   - Partagez les résultats du diagnostic SQL
   - Partagez les logs du script

---

**💡 Astuce :** Utilisez toujours le script SQL de diagnostic (`supabase/check-ideas-in-db.sql`) pour un diagnostic complet !

