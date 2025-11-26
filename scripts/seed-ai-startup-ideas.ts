/**
 * Seed AI Startup Ideas Dataset
 * 
 * Based on insights from AI startup opportunities analysis
 * Creates structured ideas for Supabase insertion
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface IdeaSeed {
  title: string;
  problem_statement: string;
  proposed_solution: string;
  category: string;
  location: string;
  current_manual_process?: string;
  digitization_opportunity?: string;
  submitter_name: string;
  submitter_type: string;
  submitted_via: 'web' | 'whatsapp' | 'workshop';
  status: string;
}

const aiStartupIdeas: IdeaSeed[] = [
  // Productivity & Workflow Ideas
  {
    title: 'AI Meeting Assistant - Transcription et Suivi Automatique',
    problem_statement: 'Les professionnels perdent des heures à prendre des notes pendant les réunions et à faire le suivi des actions. Les réunions Zoom/Teams génèrent beaucoup de contenu mais peu de valeur actionnable.',
    proposed_solution: 'Un assistant IA qui rejoint les appels, enregistre, transcrit, résume automatiquement et génère des listes de tâches. Intégration avec Slack/Notion pour créer automatiquement des tickets et rappels.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Les participants prennent des notes manuellement, oublient des détails, et doivent faire le suivi manuellement après la réunion.',
    digitization_opportunity: 'Utilisation de l\'API OpenAI pour transcription + résumé, SDK Zoom/Teams pour intégration, et APIs Slack/Notion pour automatisation des actions.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Email Inbox Copilot - Gestion Intelligente des Emails',
    problem_statement: 'Les boîtes de réception débordent et drainent la productivité. Les professionnels passent 2-3 heures par jour à trier et répondre aux emails, avec beaucoup de bruit et peu de signal.',
    proposed_solution: 'IA qui priorise les emails, rédige des réponses, et route automatiquement vers les bons dossiers. Apprend des patterns de l\'utilisateur pour améliorer la pertinence.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Tri manuel des emails, rédaction manuelle de réponses, organisation manuelle en dossiers.',
    digitization_opportunity: 'NLP pour comprendre le contexte, génération de réponses personnalisées, classification automatique par priorité/urgence.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Sales Email Generator - Emails Personnalisés Automatiques',
    problem_statement: 'Les commerciaux perdent du temps à rédiger des emails de prospection et de relance. Chaque email doit être personnalisé mais le processus est répétitif et chronophage.',
    proposed_solution: 'Outil IA qui rédige des emails personnalisés basés sur les données du prospect. Intégration LinkedIn/Gmail pour enrichir automatiquement les profils et générer des messages pertinents.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Recherche manuelle sur LinkedIn, rédaction manuelle d\'emails personnalisés, suivi manuel des relances.',
    digitization_opportunity: 'GPT fine-tuné pour le sales, intégrations LinkedIn/Gmail APIs, templates adaptatifs basés sur le profil du prospect.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Knowledge Base Updater - Documentation Auto-Mise à Jour',
    problem_statement: 'Les bases de connaissances d\'entreprise (Confluence, SharePoint) sont obsolètes. Les processus changent mais la documentation ne suit pas, créant de la confusion et des erreurs.',
    proposed_solution: 'IA qui met à jour automatiquement la documentation, FAQs, et SOPs quand les processus changent. Détecte les changements dans les workflows et suggère des mises à jour.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Mise à jour manuelle de la documentation, souvent oubliée ou retardée, créant des incohérences.',
    digitization_opportunity: 'GPT pour comprendre les changements, version control pour tracking, APIs des bases de connaissances pour mise à jour automatique.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Voice-to-Action Assistant - Capture Vocale d\'Idées en Déplacement',
    problem_statement: 'Les travailleurs de terrain et managers perdent des idées parce qu\'ils ne peuvent pas les capturer en déplacement. Les notes vocales restent non structurées et non actionnables.',
    proposed_solution: 'Assistant vocal qui convertit les notes vocales en tâches, rappels, et suivis. Intégration calendrier/tâches pour créer automatiquement des actions à partir de la voix.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Notes vocales non structurées, transcription manuelle, création manuelle de tâches à partir des notes.',
    digitization_opportunity: 'Speech-to-text (Whisper API) + GPT pour parsing de tâches + intégration calendrier/tâches (Google Calendar, Todoist, etc.).',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Productivity Analytics Dashboard - Analyse des Inefficacités',
    problem_statement: 'Les entreprises ne savent pas où les employés perdent le plus de temps. Pas de visibilité sur les patterns de workflow, réunions, et utilisation d\'outils.',
    proposed_solution: 'IA qui analyse les workflows, patterns de réunions, et utilisation d\'outils pour suggérer des améliorations d\'efficacité. Dashboard avec insights actionnables.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Pas de tracking centralisé, analyses manuelles ponctuelles, pas de recommandations automatiques.',
    digitization_opportunity: 'ML-based analytics sur données de workflow, intégrations Google Workspace/Slack/Jira, modèles prédictifs pour identifier les bottlenecks.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  // Healthcare & Biotech Ideas
  {
    title: 'AI Symptom Checker - Diagnostic Préliminaire Intelligent',
    problem_statement: 'Les patients se diagnostiquent mal sur Google, créant de l\'anxiété et des consultations inutiles. Pas d\'outil fiable pour évaluer les symptômes avant de consulter.',
    proposed_solution: 'Chatbot IA qui évalue les symptômes et fournit des conditions possibles avec conseils de triage. Escalade vers télémédecine si nécessaire.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Recherche Google non fiable, auto-diagnostic erroné, consultations inutiles ou retardées.',
    digitization_opportunity: 'Medical LLMs fine-tunés + app mobile sécurisée + hosting HIPAA-compliant + intégrations télémédecine.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Radiology Assistant - Dépistage Préliminaire d\'Images Médicales',
    problem_statement: 'Les radiologues font face à des charges de travail élevées pour interpréter les radiographies, scanners CT, IRM. Les cas urgents peuvent être retardés.',
    proposed_solution: 'IA qui pré-examine les images, signale les anomalies, et priorise les cas urgents. Aide le radiologue à se concentrer sur les cas complexes.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Examen manuel de toutes les images, pas de priorisation automatique, risque de manquer des anomalies subtiles.',
    digitization_opportunity: 'Computer vision CNNs + parsing DICOM + intégration PACS hospitalier pour workflow automatisé.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Personalized Treatment Advisor - Plans de Traitement Personnalisés',
    problem_statement: 'Les plans de traitement sont souvent génériques, pas spécifiques au patient. Pas de combinaison optimale d\'historique médical, données génétiques, et guidelines.',
    proposed_solution: 'IA qui combine historique médical, données génétiques, et guidelines pour suggérer des chemins de traitement personnalisés. Aide les médecins à prendre des décisions éclairées.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Plans de traitement standardisés, pas de personnalisation basée sur données génétiques, décisions basées sur expérience seule.',
    digitization_opportunity: 'LLMs + intégrations EHR + bases de données génomiques pour recommandations personnalisées.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Drug Discovery Platform - Accélération de la Découverte de Médicaments',
    problem_statement: 'Développer de nouveaux médicaments prend des années et coûte des milliards. Le screening de molécules est long et coûteux.',
    proposed_solution: 'IA qui screen les molécules, prédit les interactions, et réduit les candidats plus rapidement. Accélère la phase de découverte de 10x.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Screening manuel de milliers de molécules, tests en laboratoire coûteux, processus itératif long.',
    digitization_opportunity: 'Deep learning models + simulation moléculaire + cloud compute pour screening virtuel à grande échelle.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Virtual Mental Health Therapist - Thérapie CBT par IA',
    problem_statement: 'Pénurie de thérapeutes abordables. Les patients attendent des mois pour un rendez-vous, et les coûts sont élevés.',
    proposed_solution: 'Chatbot IA de TCC (thérapie cognitive comportementale) qui guide les utilisateurs à travers des exercices, escalade vers un thérapeute humain si nécessaire.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Attente longue pour rendez-vous, coûts élevés, pas d\'accès 24/7.',
    digitization_opportunity: 'GPT-based conversation engine + contenu santé mentale + conformité HIPAA + intégrations assurance.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Wearable Health Data Monitor - Insights Actionnables des Données',
    problem_statement: 'Les wearables collectent des tonnes de données de santé mais peu d\'insights. Les utilisateurs ne savent pas quoi faire avec leurs données de fréquence cardiaque, sommeil, glucose.',
    proposed_solution: 'Dashboard IA qui interprète fréquence cardiaque, sommeil, glucose, et activité en recommandations de santé actionnables. Prédictions et alertes personnalisées.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Données brutes non interprétées, pas de recommandations, utilisateur doit analyser manuellement.',
    digitization_opportunity: 'APIs wearables (Fitbit, Apple Health, Dexcom) + modèles prédictifs analytics pour insights personnalisés.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI for Insurance Claims - Détection de Fraude et Accélération',
    problem_statement: 'Les réclamations frauduleuses et la paperasse ralentissent les compagnies d\'assurance. Processus manuel long et coûteux pour vérifier chaque réclamation.',
    proposed_solution: 'IA qui examine les réclamations, détecte les anomalies, et accélère les approbations. Réduit la fraude et améliore l\'expérience client.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Examen manuel de chaque réclamation, détection de fraude basée sur règles, processus lent.',
    digitization_opportunity: 'NLP pour analyse de réclamations + modèles ML de détection d\'anomalies + intégrations APIs assureurs.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Clinical Trial Optimizer - Matching Patients-Trials',
    problem_statement: 'Recruter des patients pour les essais cliniques est lent et coûteux. Matching manuel basé sur critères d\'éligibilité, beaucoup de temps perdu.',
    proposed_solution: 'IA qui match les patients avec les essais basé sur EHRs, démographie, et critères d\'éligibilité. Accélère le recrutement de 5x.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Recherche manuelle de patients éligibles, matching basé sur règles simples, beaucoup de faux positifs.',
    digitization_opportunity: 'NLP pour critères d\'essais + ML pour matching patients + pipeline de données HIPAA-compliant.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Elder Care Companion Bot - Assistant Vocal pour Seniors',
    problem_statement: 'Les populations vieillissantes font face à la solitude et aux défis de gestion de santé. Pas d\'assistance 24/7 pour rappels médicaments et compagnie.',
    proposed_solution: 'Assistant vocal IA qui rappelle les médicaments, surveille les patterns de santé, et fournit de la compagnie. Escalade vers soignants si nécessaire.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Rappels manuels par famille, pas de monitoring continu, isolement social.',
    digitization_opportunity: 'Voice assistant + intégrations santé + monitoring patterns + alertes automatiques aux soignants.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  // Infrastructure & Tools (Picks & Shovels)
  {
    title: 'AI Model Monitoring Platform - Surveillance de Modèles en Production',
    problem_statement: 'Les entreprises déploient des modèles IA mais ne savent pas quand ils dérivent ou échouent. Pas de visibilité sur la performance en temps réel.',
    proposed_solution: 'Plateforme qui surveille les modèles IA en production, détecte la dérive, et alerte sur les anomalies. Dashboards avec métriques de performance.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Monitoring manuel ponctuel, pas de détection automatique de dérive, réactions tardives aux problèmes.',
    digitization_opportunity: 'ML-based monitoring + intégrations modèles (TensorFlow, PyTorch) + alerting automatique + analytics temps réel.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Data Labeling Platform - Annotation de Données à Grande Échelle',
    problem_statement: 'Les startups IA ont besoin de données étiquetées pour entraîner leurs modèles, mais le labeling manuel est coûteux et lent. Pas d\'outils efficaces pour scale.',
    proposed_solution: 'Plateforme qui combine labeling humain + IA pour accélérer l\'annotation. Active learning pour prioriser les exemples les plus utiles.',
    category: 'tech',
    location: 'other',
    current_manual_process: 'Labeling manuel complet, coûteux et lent, pas d\'optimisation du processus.',
    digitization_opportunity: 'Active learning algorithms + marketplace de labelers + outils d\'annotation + quality control automatique.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  // Additional Healthcare
  {
    title: 'AI-Powered Genomic Analysis - Analyse de Risques de Santé',
    problem_statement: 'Les données de séquençage génomique sont vastes et complexes à interpréter. Les patients reçoivent des données brutes sans insights actionnables.',
    proposed_solution: 'IA qui interprète les données génomiques brutes pour identifier les risques de santé et actions préventives. Rapports personnalisés pour patients et médecins.',
    category: 'health',
    location: 'other',
    current_manual_process: 'Analyse manuelle par experts, coûteuse et longue, pas accessible aux patients.',
    digitization_opportunity: 'Modèles ML génomiques + pipelines bioinformatiques cloud + rapports direct-to-consumer.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  // Finance & Business Ideas
  {
    title: 'AI Fraud Detection System - Détection de Fraude en Temps Réel',
    problem_statement: 'La fraude coûte des milliards aux institutions financières chaque année. Détection manuelle lente et inefficace.',
    proposed_solution: 'Modèles IA qui surveillent les transactions en temps réel, signalent les anomalies et activités frauduleuses. Alertes instantanées et blocage automatique.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Détection manuelle basée sur règles, réaction lente, beaucoup de faux positifs.',
    digitization_opportunity: 'ML de détection d\'anomalies + traitement de flux en temps réel + intégration APIs bancaires.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Personal Finance Copilot - Gestion Financière Personnelle Intelligente',
    problem_statement: 'Les individus ont du mal à budgétiser, épargner et gérer leur dette. Pas de conseils personnalisés accessibles.',
    proposed_solution: 'App IA qui suit les dépenses, suggère des budgets, et fournit des recommandations d\'épargne/investissement. Coaching financier personnalisé 24/7.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Suivi manuel sur Excel, pas de conseils, difficulté à comprendre les finances personnelles.',
    digitization_opportunity: 'Intégrations APIs bancaires (Plaid) + GPT pour conseiller + app mobile native.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Automated AI Accountant for SMBs - Comptabilité Automatisée pour PME',
    problem_statement: 'Les petites entreprises ne peuvent pas se permettre un comptable à temps plein. La comptabilité manuelle est chronophage et sujette aux erreurs.',
    proposed_solution: 'IA qui catégorise les dépenses, réconcilie les comptes, et génère des rapports prêts pour les impôts. Automatisation complète de la comptabilité.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Comptabilité manuelle, catégorisation manuelle des dépenses, préparation fiscale manuelle.',
    digitization_opportunity: 'OCR pour scan de reçus + GPT pour catégorisation + intégrations QuickBooks/Xero APIs.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Loan Underwriting Assistant - Évaluation de Crédit Accélérée',
    problem_statement: 'Les approbations de prêts traditionnelles sont lentes et biaisées. Pas d\'utilisation de données alternatives pour évaluer la solvabilité.',
    proposed_solution: 'IA qui évalue la solvabilité plus rapidement en utilisant des données alternatives (historique de transactions, comportement numérique). Réduit les biais et accélère les décisions.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Évaluation manuelle basée sur crédit score seul, processus long, biais humains.',
    digitization_opportunity: 'Modèles ML prédictifs + outils d\'explicabilité (XAI) + modules de conformité réglementaire.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI-Powered Trading Assistant - Assistant de Trading Intelligent',
    problem_statement: 'Les investisseurs particuliers manquent d\'insights de niveau professionnel. Pas d\'analyse de marché en temps réel et gestion de risque.',
    proposed_solution: 'IA qui scanne les marchés, suggère des trades, et gère les alertes de risque. Insights professionnels pour investisseurs particuliers.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Recherche manuelle, pas d\'analyse de marché automatisée, gestion de risque manuelle.',
    digitization_opportunity: 'APIs de données de marché + modèles ML pour détection de tendances + intégration plateformes de trading.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Contract Review Platform - Révision Automatique de Contrats',
    problem_statement: 'Les contrats légaux/financiers prennent du temps à réviser. Identification manuelle des termes clés et risques.',
    proposed_solution: 'IA qui extrait les termes clés, signale les risques, et suggère des modifications. Révision de contrats en minutes au lieu d\'heures.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Révision manuelle ligne par ligne, identification manuelle des risques, négociation manuelle.',
    digitization_opportunity: 'LLM fine-tuné sur textes légaux/financiers + parseurs Doc/PDF + génération de suggestions.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Customer Support Agent for Banks/Fintechs - Support Client Automatisé',
    problem_statement: 'Les centres de support sont coûteux et lents. Pas de disponibilité 24/7 et temps d\'attente longs.',
    proposed_solution: 'Chatbot IA entraîné sur FAQs financières, règles de conformité, et comptes utilisateurs. Support instantané et escalade vers humains si nécessaire.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Support humain uniquement, heures limitées, coûts élevés, temps d\'attente.',
    digitization_opportunity: 'GPT + RAG avec base de connaissances financière + intégrations sécurisées avec systèmes bancaires.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Business Intelligence Dashboard - Tableaux de Bord Intelligents pour PME',
    problem_statement: 'Les PME manquent d\'insights en temps réel sur leur performance. Pas de vue consolidée des ventes, dépenses, RH, et opérations.',
    proposed_solution: 'IA qui connecte les données de ventes, dépenses, RH, et opérations pour générer des rapports intelligents. Insights actionnables en langage naturel.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Rapports manuels sur Excel, pas de vue consolidée, analyses ponctuelles.',
    digitization_opportunity: 'GPT pour Q&A en langage naturel + intégration entrepôt de données + visualisations automatiques.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Tax Filing Assistant - Assistant de Déclaration Fiscale',
    problem_statement: 'La préparation fiscale est confuse et coûteuse. Erreurs fréquentes et peur de mal faire.',
    proposed_solution: 'IA qui guide les individus et PME à travers la déclaration, détecte les déductions, et réduit les erreurs. Coaching fiscal personnalisé.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Préparation manuelle, confusion sur les déductions, peur des erreurs, coûts élevés.',
    digitization_opportunity: 'GPT pour Q&A fiscal + APIs gouvernementales fiscales + couches de conformité automatiques.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Risk & Compliance Monitor - Surveillance de Conformité Automatisée',
    problem_statement: 'Les entreprises financières font face à des exigences réglementaires strictes. Surveillance manuelle coûteuse et sujette aux erreurs.',
    proposed_solution: 'IA qui scanne les opérations, communications, et transactions pour détecter les problèmes de conformité. Alertes automatiques et audit trail complet.',
    category: 'finance',
    location: 'other',
    current_manual_process: 'Surveillance manuelle, audits ponctuels, risque de non-conformité, coûts élevés.',
    digitization_opportunity: 'NLP pour textes de conformité + ML de détection d\'anomalies + logging d\'audit trail.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  // Education & Learning Ideas
  {
    title: 'Personalized AI Tutor - Tuteur IA Personnalisé',
    problem_statement: 'Les étudiants apprennent à des rythmes différents mais les classes avancent à une seule vitesse. Pas de personnalisation de l\'enseignement.',
    proposed_solution: 'Tuteur IA qui adapte les explications, exemples, et niveaux de difficulté à chaque apprenant. Apprentissage adaptatif en temps réel.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Enseignement uniforme pour tous, pas d\'adaptation au rythme individuel, feedback limité.',
    digitization_opportunity: 'GPT fine-tuné pour pédagogie + algorithmes d\'apprentissage adaptatif + app mobile/web.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Essay Feedback & Writing Coach - Coach d\'Écriture IA',
    problem_statement: 'Les étudiants reçoivent rarement des retours détaillés sur leur écriture. Pas de feedback immédiat sur grammaire, clarté, et logique.',
    proposed_solution: 'IA qui note les essais, suggère des améliorations, et met en évidence grammaire, clarté, et logique. Feedback instantané et constructif.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Correction manuelle par enseignants, feedback limité, délais longs.',
    digitization_opportunity: 'NLP pour grammaire/structure + GPT pour génération de feedback + analyse de style.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Classroom Assistant for Teachers - Assistant de Classe pour Enseignants',
    problem_statement: 'Les enseignants passent des heures à noter et préparer du matériel. Pas d\'automatisation des tâches répétitives.',
    proposed_solution: 'Outil IA qui génère automatiquement des quiz, plans de cours, et devoirs notés. Libère du temps pour l\'enseignement.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Préparation manuelle de matériel, notation manuelle, pas de réutilisation de contenu.',
    digitization_opportunity: 'GPT + intégrations LMS (Canvas, Blackboard, Moodle) + génération de contenu adaptatif.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Adaptive Test Prep Platform - Plateforme de Préparation aux Examens Adaptative',
    problem_statement: 'Les étudiants bachotent pour les examens mais ne savent pas sur quoi se concentrer. Pas de personnalisation de la préparation.',
    proposed_solution: 'IA qui analyse la performance et adapte les questions de pratique aux faiblesses. Préparation ciblée et efficace.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Bachotage général, pas de focus sur faiblesses, pas de suivi de progression.',
    digitization_opportunity: 'ML pour suivi de performance + GPT pour génération de questions + algorithmes adaptatifs.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI-Powered Language Learning App - App d\'Apprentissage de Langues IA',
    problem_statement: 'Les apps d\'apprentissage de langues se concentrent sur le vocabulaire mais pas sur la vraie conversation. Pas de pratique conversationnelle réaliste.',
    proposed_solution: 'Partenaire de conversation IA qui s\'adapte au niveau de compétence et corrige la prononciation. Pratique conversationnelle immersive.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Apprentissage basé sur vocabulaire seul, pas de pratique conversationnelle, pas de correction de prononciation.',
    digitization_opportunity: 'GPT + speech-to-text (Whisper API) + text-to-speech models + évaluation de prononciation.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Career & Skills Coach - Coach de Carrière et Compétences IA',
    problem_statement: 'Les étudiants et professionnels ont du mal à choisir le bon chemin de carrière. Pas de guidance basée sur compétences, intérêts, et tendances du marché.',
    proposed_solution: 'IA qui analyse les compétences, intérêts, et tendances du marché du travail pour recommander des chemins d\'apprentissage. Guidance de carrière personnalisée.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Guidance manuelle limitée, pas d\'analyse de marché, décisions basées sur intuition.',
    digitization_opportunity: 'LLM + APIs de données du marché du travail + moteur de recommandation adaptatif.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Flashcard & Revision Generator - Générateur de Flashcards et Révision IA',
    problem_statement: 'Les étudiants perdent du temps à créer des flashcards manuellement. Pas d\'optimisation de la révision basée sur la science de l\'apprentissage.',
    proposed_solution: 'IA qui transforme manuels, notes, et PDFs en flashcards intelligentes. Révision optimisée avec répétition espacée.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Création manuelle de flashcards, pas d\'optimisation, révision non structurée.',
    digitization_opportunity: 'OCR + GPT + algorithme de répétition espacée + génération automatique de questions.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'Virtual AI Study Group - Groupe d\'Étude Virtuel IA',
    problem_statement: 'Les étudiants à distance manquent de collaboration et discussions entre pairs. Pas d\'interaction sociale pour l\'apprentissage.',
    proposed_solution: 'Groupe d\'étude IA qui simule questions de pairs, débats, et résolution de problèmes en groupe. Collaboration virtuelle immersive.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Étude solitaire, pas de collaboration, manque d\'interaction sociale.',
    digitization_opportunity: 'Simulations multi-agents GPT + interfaces de chat + modèles de débat et discussion.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI STEM Lab Simulator - Simulateur de Laboratoire STEM IA',
    problem_statement: 'Beaucoup d\'écoles manquent de ressources pour les laboratoires en physique, chimie, biologie. Pas d\'accès à des expériences pratiques.',
    proposed_solution: 'Laboratoire virtuel alimenté par IA qui permet aux étudiants de simuler des expériences en sécurité en ligne. Expériences guidées et interactives.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Laboratoires physiques coûteux, ressources limitées, pas d\'accès pour tous.',
    digitization_opportunity: 'Moteurs de simulation + GPT pour leçons guidées + VR/AR optionnel + physique réaliste.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
  {
    title: 'AI Parent Dashboard - Tableau de Bord Parent IA',
    problem_statement: 'Les parents n\'ont pas d\'insight en temps réel sur la progression d\'apprentissage de leurs enfants. Pas de visibilité sur forces/faiblesses.',
    proposed_solution: 'Dashboard IA qui résume la performance, met en évidence forces/faiblesses, et suggère des ressources. Visibilité complète pour les parents.',
    category: 'education',
    location: 'other',
    current_manual_process: 'Rapports ponctuels, pas de visibilité en temps réel, communication limitée avec enseignants.',
    digitization_opportunity: 'GPT pour résumé + intégration LMS étudiant + app mobile parent + recommandations personnalisées.',
    submitter_name: 'AI Startup Research',
    submitter_type: 'entrepreneur',
    submitted_via: 'web',
    status: 'submitted',
  },
];

async function seedIdeas() {
  console.log(`\n🌱 Seeding ${aiStartupIdeas.length} AI startup ideas...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const idea of aiStartupIdeas) {
    try {
      const { data, error } = await supabase
        .from('marrai_ideas')
        // @ts-ignore - Supabase type inference issue with .insert()
        .insert({
          ...idea,
          submitter_email: 'research@fikravalley.com',
          submitter_phone: null,
        } as any)
        .select('id, title')
        .single();

      if (error) {
        console.error(`❌ Error inserting "${idea.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Inserted: ${idea.title} (ID: ${(data as any).id})`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`❌ Exception inserting "${idea.title}":`, err.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${aiStartupIdeas.length}\n`);
}

// Run if executed directly
if (require.main === module) {
  seedIdeas()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { aiStartupIdeas, seedIdeas };

