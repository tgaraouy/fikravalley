# 🌱 GUIDE : GÉNÉRATION D'IDÉES GENZ (200-300)

**Script pour générer des idées complètes et validées qui intéressent GenZ**

---

## 🎯 OBJECTIF

Générer **200-300 idées** complètes et validées pour :
- ✅ Remplir la base de données Supabase
- ✅ Intéresser la génération Z (18-28 ans)
- ✅ Montrer des exemples concrets aux utilisateurs
- ✅ Réduire la peur du vol d'idées (voir exemples publics)

---

## 📋 PRÉREQUIS

### 1. Variables d'Environnement

Assurez-vous d'avoir dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 2. Installation

```bash
npm install
```

---

## 🚀 UTILISATION

### Option 1 : Génération Complète (250 idées)

```bash
npx tsx scripts/generate-genz-ideas.ts
```

**Durée estimée :** 15-20 minutes (génération par lots de 50)

### Option 2 : Génération Personnalisée

Modifiez dans `scripts/generate-genz-ideas.ts` :

```typescript
const totalTarget = 250; // Changez ce nombre (200-300)
const batchSize = 50;    // Idées par batch
```

---

## 🎨 THÈMES GENZ PRIORITAIRES

Le script génère des idées autour de :

1. **🌱 Climat & Durabilité**
   - Énergies renouvelables
   - Recyclage et économie circulaire
   - Agriculture durable
   - Réduction carbone

2. **💚 Impact Social**
   - Inclusion et égalité
   - Accès à l'éducation
   - Santé mentale
   - Justice sociale

3. **📱 Tech & Innovation**
   - Applications mobiles
   - IA et automatisation
   - Plateformes communautaires
   - Fintech

4. **🎓 Éducation & Formation**
   - Accès à l'éducation
   - Nouvelles compétences
   - Apprentissage en ligne
   - Certification

5. **💰 Finance & Inclusion**
   - Microfinance
   - Accès au crédit
   - Épargne et investissement
   - Fintech inclusive

6. **🏥 Santé & Bien-être**
   - Télémédecine
   - Santé mentale
   - Prévention
   - Accès aux soins

7. **🏙️ Villes Intelligentes**
   - Mobilité
   - Services urbains
   - Qualité de vie
   - Durabilité urbaine

---

## 📊 STRUCTURE DES IDÉES GÉNÉRÉES

Chaque idée contient :

✅ **Titre** (accrocheur pour GenZ)
✅ **Problem Statement** (problème réel vécu par GenZ)
✅ **Proposed Solution** (solution innovante avec IA/tech)
✅ **Category** (tech, health, education, etc.)
✅ **Location** (ville marocaine spécifique)
✅ **Current Manual Process** (processus actuel)
✅ **Digitization Opportunity** (comment tech/IA aide)
✅ **Frequency** (multiple_daily, daily, weekly, etc.)
✅ **Data Sources** (sources de données)
✅ **Integration Points** (APIs/services)
✅ **AI Capabilities Needed** (capacités IA)
✅ **Automation Potential** (high, medium, low)
✅ **Agent Type** (workflow_agent, data_agent, etc.)
✅ **Human In Loop** (true/false)
✅ **Estimated Cost** (<1K, 1K-3K, etc.)
✅ **Submitter Skills** (compétences nécessaires)

---

## 🌐 IDÉES PUBLIQUES POUR GENZ

**Important :** Toutes les idées générées sont :
- ✅ **Publiques** (`visible = true`) - **Intentionnellement publiques**
- ✅ **Complètes et validées**
- ✅ **Prêtes pour analyse IA**
- ✅ **Partageables** - GenZ peut les voir et s'en inspirer

**Objectif :** Ces idées sont générées pour être **partagées publiquement** et permettre à GenZ de :
- Découvrir des opportunités
- S'inspirer pour créer leur propre startup
- Voir des exemples concrets d'idées validées
- Comprendre ce qui fonctionne au Maroc

**Note :** Les idées des utilisateurs réels restent **privées par défaut**. Seules les idées générées par le script sont publiques.

---

## 📈 PROCESSUS DE GÉNÉRATION

### Étape 1 : Génération par LLM

```
Claude API → Génère 50 idées par batch
           → Valide la structure
           → Enrichit avec détails marocains
```

### Étape 2 : Validation

```
Vérifie que chaque idée a :
- Tous les champs requis
- Format correct
- Contenu réaliste
```

### Étape 3 : Insertion

```
Supabase → Insert par chunks de 25
         → Gère les erreurs
         → Logs de progression
```

### Étape 4 : Analyse (Optionnel)

```
API Analyze → Déclenche analyse IA pour chaque idée
            → Calcule scores
            → Génère recommandations
```

---

## 🎯 EXEMPLES D'IDÉES GENZ

### Exemple 1 : Climat

**Titre :** EcoTrack - Traçabilité Carbone pour Startups

**Problème :** Les jeunes entrepreneurs veulent mesurer leur impact carbone mais n'ont pas d'outils accessibles.

**Solution :** App mobile avec IA qui calcule automatiquement l'empreinte carbone, suggère des réductions, et génère des rapports ESG.

### Exemple 2 : Inclusion

**Titre :** AccessMap - Cartographie de l'Accessibilité

**Problème :** Les personnes à mobilité réduite ne savent pas quels lieux sont accessibles à Casablanca.

**Solution :** App collaborative avec IA qui cartographie l'accessibilité des lieux publics et suggère des itinéraires accessibles.

### Exemple 3 : Éducation

**Titre :** SkillSwap - Échange de Compétences entre Étudiants

**Problème :** Les étudiants ont des compétences complémentaires mais ne se connectent pas.

**Solution :** Plateforme avec matching IA qui connecte étudiants pour échanger compétences (coding, design, langues).

---

## ✅ VALIDATION POST-GÉNÉRATION

### Vérifier les Idées Générées

```sql
-- Compter les idées générées
SELECT COUNT(*) 
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';

-- Vérifier la complétude
SELECT 
  COUNT(*) as total,
  COUNT(problem_statement) as has_problem,
  COUNT(proposed_solution) as has_solution,
  COUNT(category) as has_category,
  COUNT(location) as has_location
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com';

-- Vérifier la diversité des catégories
SELECT category, COUNT(*) 
FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
GROUP BY category;
```

### Analyser les Idées

```bash
# Déclencher l'analyse pour toutes les idées générées
# (Optionnel - peut être fait manuellement après)
```

---

## 🐛 DÉPANNAGE

### Erreur : "Missing Supabase configuration"

**Solution :** Vérifiez vos variables d'environnement dans `.env.local`

### Erreur : "Anthropic API key not found"

**Solution :** Ajoutez `ANTHROPIC_API_KEY` dans `.env.local`

### Erreur : "Rate limit exceeded"

**Solution :** Le script inclut des délais automatiques. Si l'erreur persiste, réduisez `batchSize` à 25.

### Erreur : "Invalid category"

**Solution :** Vérifiez que les catégories générées correspondent aux valeurs autorisées dans la base de données.

---

## 📊 MÉTRIQUES DE SUCCÈS

Après génération, vous devriez avoir :

- ✅ **200-300 idées** complètes
- ✅ **Diversité** : Toutes les catégories représentées
- ✅ **Localisation** : Idées de différentes villes marocaines
- ✅ **Qualité** : Toutes les idées ont tous les champs requis
- ✅ **Privacy** : Toutes les idées sont privées par défaut

---

## 🎯 PROCHAINES ÉTAPES

### 1. Valider avec Utilisateurs

- Montrer des exemples aux GenZ
- Collecter du feedback
- Ajuster les idées si nécessaire

### 2. Rendre Publiques (Optionnel)

- Sélectionner les meilleures idées
- Obtenir validation
- Rendre publiques pour inspiration

### 3. Analyser avec IA

- Déclencher l'analyse pour toutes les idées
- Calculer les scores
- Identifier les meilleures opportunités

---

## 📝 NOTES IMPORTANTES

### Idées Publiques pour Inspiration

**Les idées générées par ce script sont PUBLIQUES.** C'est intentionnel pour :
- ✅ Permettre à GenZ de découvrir des opportunités
- ✅ Montrer des exemples concrets d'idées validées
- ✅ Inspirer les entrepreneurs
- ✅ Créer un effet de réseau positif

**Important :** Les idées des utilisateurs réels restent **privées par défaut**. Seules les idées générées par le script (`submitter_email = 'genz-research@fikravalley.com'`) sont publiques.

### Qualité > Quantité

**Mieux vaut 200 idées complètes que 300 incomplètes.**

Le script valide chaque idée avant insertion.

### Diversité

**Le script génère des idées variées :**
- Différentes catégories
- Différentes villes
- Différents niveaux de complexité
- Différents types d'impact

---

**Prêt à générer 200-300 idées GenZ complètes et validées ! 🚀**

