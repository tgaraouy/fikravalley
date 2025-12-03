# 🚀 Plan d'Amélioration des Flux de Participation

**Objectif:** Réduire drastiquement la saisie de données pour les fondateurs et les mentors

**Principe:** "Assembly over Addition" - Utiliser les données existantes et l'IA pour inférer plutôt que demander

---

## 📋 TABLE DES MATIÈRES

1. [Flux Fondateurs (Founders)](#flux-fondateurs-founders)
2. [Flux Mentors](#flux-mentors)
3. [Architecture Technique](#architecture-technique)
4. [Plan d'Implémentation](#plan-dimplémentation)
5. [Métriques de Succès](#métriques-de-succès)

---

## 🎯 FLUX FONDATEURS (FOUNDERS)

### Problème Actuel

**Champs Requis:**
- `submitter_name` (obligatoire)
- `submitter_email` (obligatoire)
- `submitter_type` (obligatoire)
- `category` (obligatoire)
- `location` (obligatoire)
- `title` (obligatoire)
- `problem_statement` (obligatoire)

**Friction:**
- 7 champs à remplir manuellement
- Catégorie et localisation souvent difficiles à choisir
- Type de profil pas toujours clair

---

### Solution Proposée: "Voice-First + Auto-Inference"

#### **Étape 1: Soumission Vocale Simplifiée**

**Nouveau Flow:**
```
1. Utilisateur clique "Parler" ou "Écrire"
   ↓
2. Enregistre/écrit son idée (libre format)
   ↓
3. IA extrait automatiquement:
   - Titre (première phrase ou résumé)
   - Problème (énoncé complet)
   - Solution (si mentionnée)
   - Catégorie (inférence depuis le texte)
   - Localisation (inférence depuis le texte)
   - Type de profil (inférence depuis le texte)
   ↓
4. Contact et Consentement:
   - Email (requis)
   - Téléphone mobile (requis)
   - Nom (optionnel, peut être "Utilisateur Vocal")
   - Consentement PDPL (checkbox requis)
   - Visibilité publique (toggle: visible/public)
   ↓
5. Génération automatique:
   - Code de suivi unique (FKR-CAT-WORD-####)
   - Tracking code pour ownership
   ↓
6. Soumission automatique avec consentement enregistré
```

**Réduction:** 7 champs → 3 champs (email, téléphone, consentement) + toggle visibilité

---

#### **Étape 2: Auto-Détection Intelligente**

**Utiliser `lib/ai/auto-detect-capacity.ts` existant + extensions:**

```typescript
// Inférer depuis la voix/texte
- submitter_type: depuis le contexte ("je suis étudiant" → student)
- category: depuis mots-clés ("santé", "hôpital" → health)
- location: depuis mentions géographiques ("Casablanca", "Rabat")
- budget_tier: depuis submitter_type + location
- complexity: depuis nombre d'idées précédentes
```

**Nouveau Utilitaire:** `lib/ai/extract-idea-metadata.ts`

```typescript
interface ExtractedMetadata {
  title: string;
  problem_statement: string;
  proposed_solution?: string;
  category: string; // auto-détecté
  location: string; // auto-détecté
  submitter_type: string; // auto-détecté
  moroccan_priorities?: string[]; // auto-détecté
  keywords?: string[]; // pour matching
}
```

---

#### **Étape 3: Progressive Enhancement**

**Si l'utilisateur revient:**
- Détecter email/téléphone existant
- Pré-remplir automatiquement
- Suggérer catégories basées sur historique
- Auto-complétion intelligente

**Si première soumission:**
- Mode "découverte" avec suggestions
- Pas de pression sur les détails

---

### Implémentation Technique

#### **1. Nouveau Composant: `components/submission/UltraSimpleSubmit.tsx`**

```typescript
// Interface ultra-simple
- Un seul champ: Email OU Téléphone
- Bouton "Parler" ou "Écrire"
- Transcription automatique
- Extraction IA automatique
- Soumission en 1 clic
```

#### **2. Nouvelle API: `app/api/ideas/extract-metadata/route.ts`**

```typescript
POST /api/ideas/extract-metadata
Body: { transcript: string }
Response: {
  title: string;
  problem_statement: string;
  category: string;
  location: string;
  submitter_type: string;
  confidence: number;
}
```

#### **3. Extension: `lib/ai/extract-idea-metadata.ts`**

```typescript
// Utilise LLM pour extraire:
- Titre (première phrase ou résumé intelligent)
- Catégorie (mapping intelligent)
- Localisation (détection géographique)
- Type de profil (étudiant, entrepreneur, etc.)
- Priorités marocaines (auto-alignement)
```

---

## 👨‍🏫 FLUX MENTORS

### Problème Actuel

**Champs Requis (15+):**
- name, email, phone, location, moroccan_city
- currentrole, company, years_experience
- expertise, skills, bio
- available_hours_per_month
- willing_to_cofund, max_cofund_amount
- linkedin_url, website_url, chapter

**Friction:**
- Formulaire très long (467 lignes)
- Beaucoup de champs optionnels mais présentés comme importants
- Pas de pré-remplissage intelligent

---

### Solution Proposée: "LinkedIn-First + Progressive"

#### **Étape 1: LinkedIn Import (Option 1)**

**Nouveau Flow:**
```
1. Utilisateur clique "S'inscrire avec LinkedIn"
   ↓
2. OAuth LinkedIn
   ↓
3. Extraction automatique:
   - Nom, Email, Photo
   - Poste actuel, Entreprise
   - Années d'expérience (calculé)
   - Localisation
   - Compétences (skills)
   - Bio (summary)
   - URL LinkedIn
   ↓
4. Vérification/Correction (optionnel):
   - Domaine d'expertise (suggéré depuis skills)
   - Heures disponibles (suggéré: 5h/mois par défaut)
   - Co-financement (optionnel, pas obligatoire)
   ↓
5. Soumission en 1 clic
```

**Réduction:** 15+ champs → 0-2 champs (expertise + heures si besoin)

---

#### **Étape 2: Voice/Text Registration (Option 2)**

**Pour ceux sans LinkedIn:**
```
1. Utilisateur clique "Parler de mon expérience"
   ↓
2. Enregistre/écrit:
   "Je suis CTO chez TechCorp à Casablanca, 
    10 ans d'expérience en développement web,
    spécialisé en React et Node.js.
    Je veux aider les startups tech marocaines."
   ↓
3. IA extrait automatiquement:
   - Nom (si fourni, sinon "Mentor")
   - Poste: CTO
   - Entreprise: TechCorp
   - Localisation: Casablanca
   - Années: 10
   - Skills: React, Node.js
   - Expertise: technology
   - Bio: auto-généré depuis le texte
   ↓
4. Contact minimal:
   - Email (obligatoire pour notifications)
   ↓
5. Soumission automatique
```

**Réduction:** 15+ champs → 1 champ (email)

---

#### **Étape 3: Progressive Enhancement**

**Après inscription:**
- Profil peut être complété progressivement
- Pas de pression pour tout remplir d'un coup
- Suggestions basées sur l'activité (matches acceptés, etc.)

---

### Implémentation Technique

#### **1. LinkedIn OAuth Integration**

**Nouveau:** `app/api/auth/linkedin/route.ts`

```typescript
// OAuth flow LinkedIn
- Redirect vers LinkedIn
- Callback avec code
- Exchange pour access_token
- Fetch profile data
- Parse et map vers schema mentor
```

**Nouveau:** `lib/integrations/linkedin-parser.ts`

```typescript
interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  headline?: string; // "CTO at TechCorp"
  location?: { name: string };
  positions?: Array<{
    title: string;
    company: string;
    startDate: { year: number };
    endDate?: { year: number };
  }>;
  skills?: Array<{ name: string }>;
  summary?: string;
}

function parseLinkedInProfile(profile: LinkedInProfile): MentorData {
  // Extraction intelligente
  // Calcul années d'expérience
  // Mapping skills → expertise
  // Génération bio depuis summary
}
```

#### **2. Voice/Text Mentor Registration**

**Nouveau:** `components/mentors/VoiceMentorRegistration.tsx`

```typescript
// Interface similaire à SimpleVoiceSubmit
- Enregistrement vocal ou texte libre
- Extraction IA automatique
- Email seulement requis
- Soumission en 1 clic
```

**Nouveau:** `lib/ai/extract-mentor-profile.ts`

```typescript
// Utilise LLM pour extraire:
- Poste actuel
- Entreprise
- Années d'expérience (calculé)
- Localisation
- Skills/Expertise
- Bio (généré)
```

#### **3. API Simplifiée**

**Modifier:** `app/api/mentors/register/route.ts`

```typescript
// Accepter soit:
- LinkedIn OAuth data (profil complet)
- Voice/Text extraction (profil partiel)
- Formulaire classique (fallback)

// Champs obligatoires réduits:
- email (obligatoire)
- name OU currentrole (au moins un)
- expertise (peut être inféré depuis skills)
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Nouveaux Fichiers à Créer

```
lib/ai/
  ├── extract-idea-metadata.ts      # Extraction métadonnées idée
  ├── extract-mentor-profile.ts     # Extraction profil mentor
  └── infer-submitter-type.ts       # Inférence type profil

lib/integrations/
  ├── linkedin-oauth.ts             # OAuth LinkedIn
  ├── linkedin-parser.ts            # Parse profil LinkedIn
  └── linkedin-types.ts             # Types LinkedIn API

components/submission/
  ├── UltraSimpleSubmit.tsx         # Soumission ultra-simple
  └── IdeaMetadataExtractor.tsx     # UI extraction métadonnées

components/mentors/
  ├── LinkedInMentorRegistration.tsx # Inscription LinkedIn
  ├── VoiceMentorRegistration.tsx    # Inscription vocale
  └── MentorProfilePreview.tsx       # Aperçu profil avant soumission

app/api/
  ├── ideas/extract-metadata/route.ts    # API extraction métadonnées
  ├── mentors/extract-profile/route.ts   # API extraction profil mentor
  └── auth/linkedin/route.ts             # OAuth LinkedIn
```

---

### Modifications Fichiers Existants

```
app/submit-voice/page.tsx
  └── Intégrer UltraSimpleSubmit comme option par défaut

app/become-mentor/page.tsx
  └── Ajouter options LinkedIn + Voice en haut du formulaire

app/api/ideas/route.ts
  └── Accepter soumissions avec métadonnées auto-extraites

app/api/mentors/register/route.ts
  └── Accepter profils LinkedIn + Voice en plus du formulaire

lib/ai/auto-detect-capacity.ts
  └── Étendre pour inférer plus de champs
```

---

## 📅 PLAN D'IMPLÉMENTATION

### Phase 1: Fondateurs - Extraction Métadonnées (Semaine 1)

**Objectif:** Réduire de 7 champs à 1 champ (email)

**Tâches:**
1. ✅ Créer `lib/ai/extract-idea-metadata.ts`
   - Utilise LLM pour extraire titre, catégorie, localisation, type
   - Retourne métadonnées avec score de confiance

2. ✅ Créer `app/api/ideas/extract-metadata/route.ts`
   - Endpoint POST pour extraction métadonnées
   - Cache les résultats pour éviter appels répétés

3. ✅ Créer `components/submission/UltraSimpleSubmit.tsx`
   - Interface: Email/Téléphone + Voice/Text
   - Appelle extraction métadonnées automatiquement
   - Soumission en 1 clic

4. ✅ Modifier `app/submit-voice/page.tsx`
   - Intégrer UltraSimpleSubmit comme option par défaut
   - Garder SimpleVoiceSubmit comme fallback

5. ✅ Modifier `app/api/ideas/route.ts`
   - Accepter soumissions avec métadonnées auto-extraites
   - Validation souple (catégorie/location peuvent être "other")

**Résultat:** Fondateurs peuvent soumettre avec seulement email

---

### Phase 2: Mentors - LinkedIn OAuth (Semaine 2)

**Objectif:** Réduire de 15+ champs à 0-2 champs (LinkedIn)

**Tâches:**
1. ✅ Créer `lib/integrations/linkedin-oauth.ts`
   - OAuth flow complet
   - Gestion tokens, refresh

2. ✅ Créer `lib/integrations/linkedin-parser.ts`
   - Parse profil LinkedIn
   - Map vers schema mentor
   - Calcul années d'expérience
   - Mapping skills → expertise

3. ✅ Créer `app/api/auth/linkedin/route.ts`
   - Routes OAuth (initiate, callback)
   - Exchange tokens
   - Fetch profile

4. ✅ Créer `components/mentors/LinkedInMentorRegistration.tsx`
   - Bouton "S'inscrire avec LinkedIn"
   - Aperçu profil avant soumission
   - Vérification/Correction optionnelle

5. ✅ Modifier `app/become-mentor/page.tsx`
   - Ajouter option LinkedIn en haut
   - Garder formulaire comme fallback

**Résultat:** Mentors peuvent s'inscrire avec LinkedIn (0 champs)

---

### Phase 3: Mentors - Voice Registration (Semaine 3)

**Objectif:** Alternative pour mentors sans LinkedIn

**Tâches:**
1. ✅ Créer `lib/ai/extract-mentor-profile.ts`
   - Utilise LLM pour extraire profil depuis texte/voix
   - Poste, entreprise, expérience, skills, bio

2. ✅ Créer `app/api/mentors/extract-profile/route.ts`
   - Endpoint POST pour extraction profil
   - Retourne profil structuré

3. ✅ Créer `components/mentors/VoiceMentorRegistration.tsx`
   - Interface similaire à SimpleVoiceSubmit
   - Extraction automatique
   - Email seulement requis

4. ✅ Modifier `app/become-mentor/page.tsx`
   - Ajouter option Voice/Text
   - Trois options: LinkedIn, Voice, Formulaire

**Résultat:** Mentors peuvent s'inscrire avec voix (1 champ: email)

---

### Phase 4: Progressive Enhancement (Semaine 4)

**Objectif:** Améliorer l'expérience pour utilisateurs récurrents

**Tâches:**
1. ✅ Détection utilisateur existant
   - Cookie/localStorage pour email/téléphone
   - Pré-remplissage automatique

2. ✅ Suggestions intelligentes
   - Catégories basées sur historique
   - Auto-complétion localisation
   - Suggestions expertise mentors

3. ✅ Profils progressifs
   - Permettre complétion progressive
   - Pas de pression pour tout remplir

4. ✅ Tests & Optimisation
   - Tests A/B (formulaire vs ultra-simple)
   - Mesure taux de conversion
   - Optimisation prompts LLM

**Résultat:** Expérience fluide pour tous les types d'utilisateurs

---

## 📊 MÉTRIQUES DE SUCCÈS

### Métriques Fondateurs

**Avant:**
- Temps moyen de soumission: 5-7 minutes
- Taux d'abandon: 40%
- Champs remplis: 7/7

**Après (Objectif):**
- Temps moyen de soumission: 1-2 minutes
- Taux d'abandon: <10%
- Champs remplis: 1/7 (email seulement)

**KPIs:**
- Taux de conversion (visite → soumission): +200%
- Temps de soumission: -70%
- Satisfaction utilisateur: >4.5/5

---

### Métriques Mentors

**Avant:**
- Temps moyen d'inscription: 10-15 minutes
- Taux d'abandon: 60%
- Champs remplis: 15/15

**Après (Objectif):**
- Temps moyen d'inscription: 2-3 minutes (LinkedIn) / 3-5 minutes (Voice)
- Taux d'abandon: <20%
- Champs remplis: 0-2/15 (LinkedIn) / 1/15 (Voice)

**KPIs:**
- Taux de conversion (visite → inscription): +300%
- Temps d'inscription: -75%
- Adoption LinkedIn: >50% des mentors
- Adoption Voice: >30% des mentors

---

## 🔧 DÉTAILS TECHNIQUES

### Extraction Métadonnées Idée

**Prompt LLM:**
```
Analyse ce texte d'idée entrepreneuriale et extrais:
1. Titre (max 100 caractères)
2. Énoncé du problème (complet)
3. Solution proposée (si mentionnée)
4. Catégorie (health, education, tech, agriculture, finance, etc.)
5. Localisation (casablanca, rabat, marrakech, etc. ou "other")
6. Type de profil (student, entrepreneur, professional, unemployed)

Texte: "{transcript}"

Retourne JSON avec ces champs + score de confiance (0-1).
```

**Fallback:**
- Si extraction échoue → valeurs par défaut ("other", "other", "entrepreneur")
- Toujours permettre soumission même si extraction partielle

---

### Extraction Profil Mentor

**Prompt LLM:**
```
Analyse ce texte de présentation mentor et extrais:
1. Nom complet
2. Poste actuel
3. Entreprise
4. Années d'expérience (calculer depuis dates ou mentions)
5. Localisation actuelle
6. Ville d'origine (Maroc)
7. Domaines d'expertise (healthcare, technology, finance, etc.)
8. Compétences techniques (React, Python, IoT, etc.)
9. Bio (résumé professionnel)

Texte: "{transcript}"

Retourne JSON avec ces champs + score de confiance.
```

**Fallback:**
- Si extraction échoue → demander confirmation manuelle
- Permettre complétion progressive

---

### LinkedIn OAuth Flow

**Étapes:**
1. Redirect vers LinkedIn OAuth
2. User autorise
3. Callback avec code
4. Exchange code → access_token
5. Fetch profile avec access_token
6. Parse et map vers schema
7. Afficher aperçu pour confirmation
8. Soumission

**Scopes LinkedIn:**
- `r_liteprofile` (nom, photo, headline)
- `r_emailaddress` (email)
- `r_fullprofile` (positions, skills, summary) - si disponible

**Alternative:** LinkedIn API v2 (si OAuth complexe)
- Utiliser LinkedIn Profile API
- Require API key (moins idéal mais plus simple)

---

## 🎯 PRIORISATION

### Must-Have (MVP)
1. ✅ Extraction métadonnées idée (Phase 1)
2. ✅ UltraSimpleSubmit pour fondateurs (Phase 1)
3. ✅ LinkedIn OAuth pour mentors (Phase 2)

### Should-Have
4. ✅ Voice registration pour mentors (Phase 3)
5. ✅ Progressive enhancement (Phase 4)

### Nice-to-Have
6. Auto-complétion intelligente
7. Suggestions basées sur historique
8. Profils progressifs avec gamification

---

## 🚀 PROCHAINES ÉTAPES IMMÉDIATES

1. **Créer `lib/ai/extract-idea-metadata.ts`**
   - Fonction d'extraction avec LLM
   - Tests unitaires

2. **Créer `components/submission/UltraSimpleSubmit.tsx`**
   - Interface minimale
   - Intégration extraction automatique

3. **Modifier `app/submit-voice/page.tsx`**
   - Utiliser UltraSimpleSubmit par défaut

4. **Tester avec utilisateurs réels**
   - Mesurer temps de soumission
   - Collecter feedback

---

**Dernière mise à jour:** Décembre 2025  
**Status:** Plan prêt pour implémentation

