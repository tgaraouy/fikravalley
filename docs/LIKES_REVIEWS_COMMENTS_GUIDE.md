# Guide: Système de Likes, Reviews et Comments

## 📋 Vue d'ensemble

Le système complet de likes, reviews et comments a été créé pour permettre aux utilisateurs d'interagir avec les idées.

---

## 🗄️ Base de données

### Table: `marrai_idea_reviews`

Nouvelle table pour stocker les avis/notes sur les idées.

**Colonnes principales :**
- `id` (UUID)
- `idea_id` (UUID) - Référence à `marrai_ideas`
- `rating` (INTEGER) - Note de 1 à 5 étoiles
- `title` (TEXT) - Titre optionnel de l'avis
- `review_text` (TEXT) - Texte détaillé optionnel
- `review_type` (TEXT) - Type: `feasibility`, `impact`, `market`, `technical`, `general`
- `reviewer_name` (TEXT) - Nom optionnel pour avis anonymes
- `reviewer_ip` (TEXT) - IP pour tracking anonyme
- `approved` (BOOLEAN) - Modération
- `created_at`, `updated_at`, `deleted_at`

**Migration SQL :**
```sql
-- Exécuter dans Supabase SQL Editor
-- Fichier: supabase/migrations/007_add_reviews_table.sql
```

---

## 🔌 API Endpoints

### 1. Likes

**GET `/api/ideas/[id]/likes`**
- Récupère le nombre de likes et le statut de l'utilisateur
- **Response:**
  ```json
  {
    "count": 42,
    "isLiked": true
  }
  ```

**POST `/api/ideas/[id]/likes`**
- Toggle like/unlike
- **Response:**
  ```json
  {
    "success": true,
    "isLiked": true,
    "count": 43
  }
  ```

---

### 2. Comments

**GET `/api/ideas/[id]/comments`**
- Récupère tous les commentaires approuvés
- **Response:**
  ```json
  {
    "comments": [...],
    "count": 5
  }
  ```

**POST `/api/ideas/[id]/comments`**
- Crée un nouveau commentaire
- **Body:**
  ```json
  {
    "content": "Great idea!",
    "comment_type": "support",
    "author_name": "John Doe",
    "author_email": "john@example.com"
  }
  ```
- **Types de commentaires:** `suggestion`, `question`, `concern`, `support`, `technical`

---

### 3. Reviews

**GET `/api/ideas/[id]/reviews`**
- Récupère tous les avis approuvés avec statistiques
- **Response:**
  ```json
  {
    "reviews": [...],
    "stats": {
      "total": 10,
      "average": 4.5,
      "distribution": {
        "5": 6,
        "4": 3,
        "3": 1,
        "2": 0,
        "1": 0
      }
    }
  }
  ```

**POST `/api/ideas/[id]/reviews`**
- Crée un nouvel avis
- **Body:**
  ```json
  {
    "rating": 5,
    "title": "Excellent idea",
    "review_text": "This would solve a real problem...",
    "review_type": "feasibility",
    "reviewer_name": "Jane Doe"
  }
  ```
- **Types d'avis:** `feasibility`, `impact`, `market`, `technical`, `general`

---

## 🎨 Composants UI

### 1. `LikeButton`

**Fichier:** `components/ideas/LikeButton.tsx`

**Props:**
- `ideaId` (string) - ID de l'idée
- `initialCount` (number) - Nombre initial de likes
- `initialIsLiked` (boolean) - Statut initial
- `onLikeChange` (callback) - Callback quand le like change

**Usage:**
```tsx
<LikeButton 
  ideaId={idea.id}
  initialCount={likes}
  initialIsLiked={isLiked}
  onLikeChange={(count, isLiked) => {
    setLikes(count);
    setIsLiked(isLiked);
  }}
/>
```

---

### 2. `CommentsSection`

**Fichier:** `components/ideas/CommentsSection.tsx`

**Props:**
- `ideaId` (string) - ID de l'idée

**Fonctionnalités:**
- Affiche tous les commentaires
- Formulaire pour ajouter un commentaire
- Types de commentaires sélectionnables
- Formatage des dates (relative)
- Limite de 2000 caractères

**Usage:**
```tsx
<CommentsSection ideaId={idea.id} />
```

---

### 3. `ReviewsSection`

**Fichier:** `components/ideas/ReviewsSection.tsx`

**Props:**
- `ideaId` (string) - ID de l'idée

**Fonctionnalités:**
- Affiche tous les avis avec notes étoiles
- Statistiques (moyenne, distribution)
- Formulaire pour ajouter un avis
- Notation interactive (1-5 étoiles)
- Types d'avis sélectionnables
- Limite de 2000 caractères

**Usage:**
```tsx
<ReviewsSection ideaId={idea.id} />
```

---

## 📍 Intégration

### Page de détail d'idée

Les composants sont intégrés dans `app/ideas/[id]/page.tsx` :

1. **LikeButton** - Remplace l'ancien bouton like
2. **CommentsSection** - Ajouté après les tabs
3. **ReviewsSection** - Ajouté après les commentaires

### Carte d'idée

Le composant `IdeaCard` utilise maintenant `LikeButton` au lieu du bouton statique.

---

## ✅ Checklist de déploiement

- [ ] Exécuter la migration SQL dans Supabase
  ```sql
  -- Copier le contenu de supabase/migrations/007_add_reviews_table.sql
  -- et l'exécuter dans Supabase SQL Editor
  ```

- [ ] Vérifier que les tables existent :
  - `marrai_idea_upvotes` (déjà existante)
  - `marrai_idea_comments` (déjà existante)
  - `marrai_idea_reviews` (nouvelle)

- [ ] Tester les endpoints API :
  - `/api/ideas/[id]/likes`
  - `/api/ideas/[id]/comments`
  - `/api/ideas/[id]/reviews`

- [ ] Tester l'interface utilisateur :
  - Cliquer sur le bouton like
  - Ajouter un commentaire
  - Ajouter un avis avec note

- [ ] Vérifier la modération :
  - Les commentaires/avis sont approuvés par défaut
  - Les admins peuvent modérer via Supabase

---

## 🔒 Sécurité

### Row-Level Security (RLS)

- **Likes:** Lecture publique, écriture via service role
- **Comments:** Lecture publique (approuvés uniquement), écriture via service role
- **Reviews:** Lecture publique (approuvés uniquement), écriture via service role

### Tracking anonyme

- Utilise l'IP pour éviter les doublons
- Support pour utilisateurs authentifiés (via `user_id`)
- Limite de 1 avis par IP par idée (pour reviews)

---

## 🎯 Prochaines améliorations possibles

1. **Authentification utilisateur**
   - Connecter avec `user_id` au lieu de IP
   - Permettre la modification/suppression de ses propres commentaires

2. **Modération**
   - Interface admin pour modérer les commentaires/avis
   - Filtrage automatique de contenu inapproprié

3. **Notifications**
   - Notifier le créateur d'idée quand quelqu'un commente
   - Notifier quand un avis est ajouté

4. **Statistiques avancées**
   - Graphiques de distribution des notes
   - Tendances temporelles

---

## 📝 Notes

- Les commentaires et avis sont limités à 2000 caractères
- Les dates sont formatées en relatif (ex: "2h ago", "3d ago")
- Les animations utilisent Framer Motion
- Le système supporte les utilisateurs anonymes et authentifiés

---

**✅ Système complet et prêt à l'emploi !**

