# 📍 Où Trouver les Idées GenZ dans Supabase

**Guide pour localiser et vérifier les 250 idées publiques générées**

---

## 🎯 Emplacement dans Supabase

### Table : `marrai_ideas`

**Identifiant :** `submitter_email = 'genz-research@fikravalley.com'`

**Visibilité :** `visible = true` (toutes sont publiques)

---

## 🔍 Requêtes SQL pour Vérifier

### 1. Compter le Total

```sql
SELECT COUNT(*) as total_ideas
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true;
```

**Résultat attendu :** 250

---

### 2. Voir Toutes les Idées

```sql
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
ORDER BY created_at DESC;
```

---

### 3. Par Catégorie

```sql
SELECT 
  category,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
GROUP BY category
ORDER BY count DESC;
```

**Résultat attendu :** Répartition par catégories (tech, health, education, etc.)

---

### 4. Par Localisation

```sql
SELECT 
  location,
  COUNT(*) as count
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true
GROUP BY location
ORDER BY count DESC;
```

**Résultat attendu :** Répartition par villes marocaines

---

### 5. Vérifier la Complétude

```sql
SELECT 
  COUNT(*) as total,
  COUNT(problem_statement) as has_problem,
  COUNT(proposed_solution) as has_solution,
  COUNT(category) as has_category,
  COUNT(location) as has_location
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true;
```

**Résultat attendu :** Tous les champs doivent être remplis (250 pour chaque)

---

## 🌐 Accès via l'Interface Supabase

### Étape 1 : Ouvrir Supabase Dashboard

1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Ouvrez **Table Editor**

### Étape 2 : Filtrer les Idées

1. Sélectionnez la table **`marrai_ideas`**
2. Cliquez sur **Filter**
3. Ajoutez un filtre :
   - **Column :** `submitter_email`
   - **Operator :** `=`
   - **Value :** `genz-research@fikravalley.com`
4. Ajoutez un deuxième filtre :
   - **Column :** `visible`
   - **Operator :** `=`
   - **Value :** `true`

### Étape 3 : Voir les Résultats

Vous devriez voir **250 idées** avec :
- Titre
- Catégorie
- Localisation
- Problème
- Solution
- Tous les autres champs

---

## 📊 Statistiques Attendues

### Répartition par Catégorie (estimée)

- **Tech** : ~30-40 idées
- **Health** : ~20-30 idées
- **Education** : ~25-35 idées
- **Agriculture** : ~15-25 idées
- **Finance** : ~20-30 idées
- **Infrastructure** : ~15-25 idées
- **Inclusion** : ~20-30 idées
- **Other** : ~30-40 idées

### Répartition par Localisation (estimée)

- **Casablanca** : ~30-40 idées
- **Rabat** : ~20-30 idées
- **Marrakech** : ~15-25 idées
- **Tanger** : ~10-20 idées
- **Agadir** : ~10-20 idées
- **Fès** : ~10-20 idées
- **Other** : ~100-150 idées

---

## 🔗 Accès via l'Application

### Page des Idées Publiques

Les idées sont visibles sur :
- **`/ideas`** - Page de liste des idées
- Filtre : `visible = true`
- Recherche par catégorie, localisation, etc.

### API Endpoint

```bash
GET /api/ideas?visible=true&submitter_email=genz-research@fikravalley.com
```

---

## ✅ Checklist de Vérification

- [ ] 250 idées dans Supabase
- [ ] Toutes avec `visible = true`
- [ ] Toutes avec `submitter_email = 'genz-research@fikravalley.com'`
- [ ] Tous les champs requis remplis
- [ ] Diversité des catégories
- [ ] Diversité des localisations
- [ ] Visibles sur la page `/ideas`

---

## 🐛 Dépannage

### Si vous ne voyez pas les idées :

1. **Vérifiez le filtre :**
   ```sql
   SELECT COUNT(*) FROM marrai_ideas 
   WHERE submitter_email = 'genz-research@fikravalley.com';
   ```

2. **Vérifiez la visibilité :**
   ```sql
   SELECT COUNT(*) FROM marrai_ideas 
   WHERE submitter_email = 'genz-research@fikravalley.com'
   AND visible = true;
   ```

3. **Vérifiez les dates :**
   ```sql
   SELECT MIN(created_at), MAX(created_at), COUNT(*)
   FROM marrai_ideas 
   WHERE submitter_email = 'genz-research@fikravalley.com';
   ```

---

**Les 250 idées sont dans la table `marrai_ideas` avec `submitter_email = 'genz-research@fikravalley.com'` et `visible = true` ! 🎉**

