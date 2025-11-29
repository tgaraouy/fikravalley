# 🌐 Script Multi-Provider pour Génération d'Idées GenZ

**Génération progressive avec support de 4 providers : Anthropic, OpenAI, Gemini, OpenRouter**

---

## ✅ Fonctionnalités

### 1. **Support Multi-Provider**
- ✅ **Anthropic** (Claude Sonnet 4)
- ✅ **OpenAI** (GPT-4o-mini)
- ✅ **Gemini** (Gemini 1.5 Flash)
- ✅ **OpenRouter** (Claude 3.5 Sonnet)

### 2. **Rotation Automatique**
- Rotation entre providers pour éviter les rate limits
- Fallback automatique si un provider échoue
- Retry avec un autre provider en cas d'erreur

### 3. **Sauvegarde de Progression**
- Fichier `scripts/genz-ideas-progress.json`
- Reprise automatique après interruption
- Suivi du nombre d'idées générées

### 4. **Génération Progressive**
- Batches de 15 idées (petits lots)
- Délai de 10 secondes entre batches
- Évite les rate limits

---

## 🔧 Configuration

### Variables d'Environnement

Ajoutez dans `.env.local` :

```env
# Supabase (requis)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Au moins UN provider requis :
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
```

**Note :** Vous pouvez configurer un ou plusieurs providers. Le script utilisera tous ceux disponibles.

---

## 🚀 Utilisation

### Génération Complète (250 idées)

```bash
npx tsx scripts/generate-genz-ideas.ts
```

**Comportement :**
- Génère 250 idées en batches de 15
- Rotation automatique entre providers
- Sauvegarde progression après chaque batch
- Reprise automatique si interruption

### Reprendre après Interruption

Le script détecte automatiquement la progression :

```bash
npx tsx scripts/generate-genz-ideas.ts
```

**Message affiché :**
```
📂 Resuming from previous session: 45 ideas already generated
```

---

## 📊 Progression

### Fichier de Progression

`scripts/genz-ideas-progress.json` :

```json
{
  "generated": 45,
  "lastBatch": 3,
  "timestamp": "2025-11-28T05:00:00.000Z"
}
```

### Supprimer la Progression

Pour recommencer depuis le début :

```bash
rm scripts/genz-ideas-progress.json
```

---

## 🔄 Rotation des Providers

### Ordre de Priorité

1. **Provider spécifié** (si fourni)
2. **Anthropic** (si disponible)
3. **OpenAI** (si disponible)
4. **Gemini** (si disponible)
5. **OpenRouter** (si disponible)

### Exemple de Rotation

```
Batch 1: Anthropic ✅
Batch 2: OpenAI ✅
Batch 3: Gemini ✅
Batch 4: OpenRouter ✅
Batch 5: Anthropic ✅ (retour au début)
```

### Fallback Automatique

Si un provider échoue (rate limit, erreur) :
- Le script essaie automatiquement le suivant
- Attente de 2 secondes avant de changer de provider
- Continue jusqu'à ce qu'un provider réussisse

---

## 📈 Stratégie Progressive

### Option 3 : Génération sur Plusieurs Jours

**Jour 1 :**
```bash
npx tsx scripts/generate-genz-ideas.ts
# Génère ~50 idées, puis s'arrête (rate limits)
```

**Jour 2 :**
```bash
npx tsx scripts/generate-genz-ideas.ts
# Reprend automatiquement, génère ~50 idées de plus
```

**Jour 3-5 :**
```bash
# Répéter jusqu'à atteindre 250 idées
```

**Avantages :**
- ✅ Évite les rate limits
- ✅ Répartit les coûts
- ✅ Permet validation progressive
- ✅ Reprise automatique

---

## 🎯 Résultat

### Idées Générées

- ✅ **Publiques** (`visible = true`)
- ✅ **Complètes** (tous les champs requis)
- ✅ **Validées** (structure vérifiée)
- ✅ **Partageables** (GenZ peut les voir)

### Identification

Toutes les idées générées ont :
- `submitter_email = 'genz-research@fikravalley.com'`
- `visible = true`

**Query pour vérifier :**
```sql
SELECT COUNT(*) FROM marrai_ideas 
WHERE submitter_email = 'genz-research@fikravalley.com'
AND visible = true;
```

---

## 🐛 Dépannage

### Erreur : "No API providers configured"

**Solution :** Ajoutez au moins une clé API dans `.env.local`

### Erreur : "Rate limit exceeded"

**Solution :** Le script bascule automatiquement sur un autre provider. Attendez quelques minutes si tous les providers sont en rate limit.

### Erreur : "JSON parse error"

**Solution :** Le script essaie automatiquement de récupérer le JSON. Si cela échoue, il passe au provider suivant.

### Progression perdue

**Solution :** Vérifiez `scripts/genz-ideas-progress.json`. Si le fichier existe, le script reprendra automatiquement.

---

## 📝 Notes

- **Batches petits** : 15 idées par batch pour éviter les rate limits
- **Délais** : 10 secondes entre batches
- **Rotation** : Change de provider à chaque batch
- **Sauvegarde** : Après chaque batch réussi
- **Reprise** : Automatique au prochain lancement

---

**Le script est prêt pour une génération progressive sur plusieurs jours ! 🚀**

