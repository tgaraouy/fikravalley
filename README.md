# Fikra Valley - Morocco's Valley of Ideas

Where Moroccan ideas grow. Plateforme de collecte et d'analyse des idées Fikra Valley.

## Description

Fikra Valley est une plateforme qui permet de collecter, analyser et financer des idées d'innovation pour le Maroc. La plateforme utilise l'intelligence artificielle (Claude) pour générer des architectures d'agents IA personnalisées pour chaque idée soumise.

## Fonctionnalités

- **Soumission d'idées** : Formulaire complet pour soumettre des problèmes locaux
- **Analyse IA** : Génération automatique d'architectures d'agents IA avec Claude
- **Tableau de bord** : Visualisation des statistiques et analyses
- **Matching diaspora** : Appariement avec des profils de la diaspora marocaine
- **Commentaires** : Système de commentaires pour chaque idée
- **Export PDF** : Génération de rapports détaillés

## Technologies

- Next.js 16
- React 19
- TypeScript
- Supabase (PostgreSQL + Realtime)
- Anthropic Claude API
- Tailwind CSS
- Recharts

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env.local` avec :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Structure

- `app/` - Pages Next.js (App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires et clients (Supabase, Anthropic)
- `app/api/` - Routes API

## Licence

Propriétaire - Fikra Valley 2025

