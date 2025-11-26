# 🚀 Guide d'Exécution: Use Cases SQL

## ✅ Fichier Prêt

Le fichier `supabase/use_cases_complet_corrige.sql` est prêt à être exécuté avec:
- ✅ 10 use cases complets
- ✅ Toutes les corrections appliquées
- ✅ Hashs de téléphone uniques
- ✅ Toutes les contraintes respectées

## 📋 Étapes d'Exécution

### Option 1: Supabase Dashboard (Recommandé)

1. **Ouvrez Supabase Dashboard**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Ouvrez SQL Editor**
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New query"

3. **Copiez le contenu du fichier**
   ```bash
   # Ouvrez le fichier
   supabase/use_cases_complet_corrige.sql
   ```
   - Sélectionnez tout (Ctrl+A)
   - Copiez (Ctrl+C)

4. **Collez dans SQL Editor**
   - Collez le SQL dans l'éditeur
   - Cliquez sur "Run" ou appuyez sur Ctrl+Enter

5. **Vérifiez les résultats**
   - Vous devriez voir "Success. No rows returned" ou un message de succès
   - Vérifiez qu'il n'y a pas d'erreurs

### Option 2: Supabase CLI

```bash
# Si vous avez Supabase CLI installé
supabase db execute --file supabase/use_cases_complet_corrige.sql
```

### Option 3: psql (PostgreSQL direct)

```bash
# Si vous avez accès direct à la base de données
psql -h your-db-host -U postgres -d postgres -f supabase/use_cases_complet_corrige.sql
```

## 🔍 Vérification Après Exécution

### Vérifier les données insérées

Exécutez ce SQL dans Supabase SQL Editor:

```sql
-- Compter les idées
SELECT COUNT(*) as total_ideas FROM marrai_ideas 
WHERE id LIKE '10000000-%' OR id LIKE '20000000-%' OR id LIKE '30000000-%'
   OR id LIKE '40000000-%' OR id LIKE '50000000-%' OR id LIKE '60000000-%'
   OR id LIKE '70000000-%' OR id LIKE '80000000-%' OR id LIKE '90000000-%'
   OR id LIKE 'a0000000-%';
-- Devrait retourner: 10

-- Compter les mentors
SELECT COUNT(*) as total_mentors FROM marrai_mentors 
WHERE id LIKE '10000000-%' OR id LIKE '20000000-%' OR id LIKE '30000000-%'
   OR id LIKE '40000000-%' OR id LIKE '50000000-%' OR id LIKE '60000000-%'
   OR id LIKE '70000000-%' OR id LIKE '80000000-%' OR id LIKE '90000000-%'
   OR id LIKE 'a0000000-%';
-- Devrait retourner: 10

-- Compter les matches
SELECT COUNT(*) as total_matches FROM marrai_mentor_matches 
WHERE id LIKE '10000000-%' OR id LIKE '20000000-%' OR id LIKE '30000000-%'
   OR id LIKE '40000000-%' OR id LIKE '50000000-%' OR id LIKE '60000000-%'
   OR id LIKE '70000000-%' OR id LIKE '80000000-%' OR id LIKE '90000000-%'
   OR id LIKE 'a0000000-%';
-- Devrait retourner: 10

-- Vérifier les hashs uniques
SELECT COUNT(DISTINCT phone_hash) as unique_hashes 
FROM marrai_secure_users 
WHERE id LIKE '10000000-%' OR id LIKE '20000000-%' OR id LIKE '30000000-%'
   OR id LIKE '40000000-%' OR id LIKE '50000000-%' OR id LIKE '60000000-%'
   OR id LIKE '70000000-%' OR id LIKE '80000000-%' OR id LIKE '90000000-%'
   OR id LIKE 'a0000000-%';
-- Devrait retourner: 10 (tous uniques)
```

## ⚠️ En Cas d'Erreur

### Erreur: "duplicate key value violates unique constraint"

**Cause:** Les données existent déjà dans la base.

**Solution:** 
1. Truncate les tables d'abord:
   ```sql
   -- Exécutez d'abord
   -- supabase/truncate_all_tables.sql
   ```

2. Puis exécutez le fichier use cases.

### Erreur: "relation does not exist"

**Cause:** Les tables n'existent pas.

**Solution:**
1. Exécutez d'abord les migrations:
   ```sql
   -- Exécutez les migrations dans l'ordre
   -- supabase/migrations/001_complete_idea_bank_schema.sql
   -- supabase/migrations/002_add_mentors_and_full_document.sql
   -- etc.
   ```

### Erreur: "column does not exist"

**Cause:** Le schéma ne correspond pas.

**Solution:**
1. Vérifiez que toutes les migrations sont appliquées
2. Vérifiez le schéma avec:
   ```sql
   \d marrai_ideas
   \d marrai_mentors
   -- etc.
   ```

## 📊 Contenu Inséré

Le script insère:

- ✅ **10 utilisateurs sécurisés** (`marrai_secure_users`)
- ✅ **10 idées** (`marrai_ideas`)
- ✅ **10 scores de clarté** (`marrai_clarity_scores`)
- ✅ **10 scores de décision** (`marrai_decision_scores`)
- ✅ **10 mentors** (`marrai_mentors`)
- ✅ **10 matches mentors-idées** (`marrai_mentor_matches`)
- ✅ **10 conversations** (`marrai_conversation_ideas`)
- ✅ **Validations, upvotes, commentaires** (varie selon use case)

## 🎯 Use Cases Inclus

1. **Argan Oil Fair Trade** (Agadir) - Commerce équitable blockchain
2. **Fake Tour Guides** (Marrakech) - Certification digitale guides
3. **Digital Souk** (Fes) - E-commerce artisans
4. **Zakat Management** (Casablanca) - Distribution transparente
5. **Traffic Optimization** (Casablanca) - IA pour trafic
6. **Saffron Traceability** (Taliouine) - Traçabilité IoT
7. **Khettara Water Management** (Ouarzazate) - Gestion hydraulique
8. **Darija Learning App** (Rabat) - Apprentissage langue
9. **Moussem Ticketing** (Tangier) - Billetterie NFT
10. **Fishing Quota Management** (Essaouira) - Gestion quotas pêche

## ✅ Checklist

- [ ] Fichier SQL ouvert
- [ ] Contenu copié dans Supabase SQL Editor
- [ ] SQL exécuté sans erreur
- [ ] Vérification des données effectuée
- [ ] 10 idées visibles dans `/ideas`
- [ ] 10 mentors dans la base
- [ ] 10 matches créés

---

**🎉 Bonne chance avec l'exécution!**


