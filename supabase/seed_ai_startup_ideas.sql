-- ============================================
-- AI Startup Ideas Dataset
-- Based on AI startup opportunities analysis
-- ============================================
-- This dataset includes 36 AI startup ideas across:
-- - Productivity & Workflow (6 ideas)
-- - Healthcare & Biotech (8 ideas)
-- - Infrastructure & Tools (2 ideas)
-- - Finance & Business (10 ideas)
-- - Education & Learning (10 ideas)
--
-- All ideas follow the marrai_ideas schema structure
-- ============================================

-- Productivity & Workflow Ideas

INSERT INTO marrai_ideas (
  title,
  problem_statement,
  proposed_solution,
  category,
  location,
  current_manual_process,
  digitization_opportunity,
  submitter_name,
  submitter_email,
  submitter_type,
  submitted_via,
  status,
  visible
) VALUES
-- 1. AI Meeting Assistant
(
  'AI Meeting Assistant - Transcription et Suivi Automatique',
  'Les professionnels perdent des heures à prendre des notes pendant les réunions et à faire le suivi des actions. Les réunions Zoom/Teams génèrent beaucoup de contenu mais peu de valeur actionnable.',
  'Un assistant IA qui rejoint les appels, enregistre, transcrit, résume automatiquement et génère des listes de tâches. Intégration avec Slack/Notion pour créer automatiquement des tickets et rappels.',
  'tech',
  'other',
  'Les participants prennent des notes manuellement, oublient des détails, et doivent faire le suivi manuellement après la réunion.',
  'Utilisation de l''API OpenAI pour transcription + résumé, SDK Zoom/Teams pour intégration, et APIs Slack/Notion pour automatisation des actions.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 2. Email Inbox Copilot
(
  'Email Inbox Copilot - Gestion Intelligente des Emails',
  'Les boîtes de réception débordent et drainent la productivité. Les professionnels passent 2-3 heures par jour à trier et répondre aux emails, avec beaucoup de bruit et peu de signal.',
  'IA qui priorise les emails, rédige des réponses, et route automatiquement vers les bons dossiers. Apprend des patterns de l''utilisateur pour améliorer la pertinence.',
  'tech',
  'other',
  'Tri manuel des emails, rédaction manuelle de réponses, organisation manuelle en dossiers.',
  'NLP pour comprendre le contexte, génération de réponses personnalisées, classification automatique par priorité/urgence.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 3. AI Sales Email Generator
(
  'AI Sales Email Generator - Emails Personnalisés Automatiques',
  'Les commerciaux perdent du temps à rédiger des emails de prospection et de relance. Chaque email doit être personnalisé mais le processus est répétitif et chronophage.',
  'Outil IA qui rédige des emails personnalisés basés sur les données du prospect. Intégration LinkedIn/Gmail pour enrichir automatiquement les profils et générer des messages pertinents.',
  'tech',
  'other',
  'Recherche manuelle sur LinkedIn, rédaction manuelle d''emails personnalisés, suivi manuel des relances.',
  'GPT fine-tuné pour le sales, intégrations LinkedIn/Gmail APIs, templates adaptatifs basés sur le profil du prospect.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 4. AI Knowledge Base Updater
(
  'AI Knowledge Base Updater - Documentation Auto-Mise à Jour',
  'Les bases de connaissances d''entreprise (Confluence, SharePoint) sont obsolètes. Les processus changent mais la documentation ne suit pas, créant de la confusion et des erreurs.',
  'IA qui met à jour automatiquement la documentation, FAQs, et SOPs quand les processus changent. Détecte les changements dans les workflows et suggère des mises à jour.',
  'tech',
  'other',
  'Mise à jour manuelle de la documentation, souvent oubliée ou retardée, créant des incohérences.',
  'GPT pour comprendre les changements, version control pour tracking, APIs des bases de connaissances pour mise à jour automatique.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 5. Voice-to-Action Assistant
(
  'Voice-to-Action Assistant - Capture Vocale d''Idées en Déplacement',
  'Les travailleurs de terrain et managers perdent des idées parce qu''ils ne peuvent pas les capturer en déplacement. Les notes vocales restent non structurées et non actionnables.',
  'Assistant vocal qui convertit les notes vocales en tâches, rappels, et suivis. Intégration calendrier/tâches pour créer automatiquement des actions à partir de la voix.',
  'tech',
  'other',
  'Notes vocales non structurées, transcription manuelle, création manuelle de tâches à partir des notes.',
  'Speech-to-text (Whisper API) + GPT pour parsing de tâches + intégration calendrier/tâches (Google Calendar, Todoist, etc.).',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 6. AI Productivity Analytics Dashboard
(
  'AI Productivity Analytics Dashboard - Analyse des Inefficacités',
  'Les entreprises ne savent pas où les employés perdent le plus de temps. Pas de visibilité sur les patterns de workflow, réunions, et utilisation d''outils.',
  'IA qui analyse les workflows, patterns de réunions, et utilisation d''outils pour suggérer des améliorations d''efficacité. Dashboard avec insights actionnables.',
  'tech',
  'other',
  'Pas de tracking centralisé, analyses manuelles ponctuelles, pas de recommandations automatiques.',
  'ML-based analytics sur données de workflow, intégrations Google Workspace/Slack/Jira, modèles prédictifs pour identifier les bottlenecks.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- Healthcare & Biotech Ideas
-- 7. AI Symptom Checker
(
  'AI Symptom Checker - Diagnostic Préliminaire Intelligent',
  'Les patients se diagnostiquent mal sur Google, créant de l''anxiété et des consultations inutiles. Pas d''outil fiable pour évaluer les symptômes avant de consulter.',
  'Chatbot IA qui évalue les symptômes et fournit des conditions possibles avec conseils de triage. Escalade vers télémédecine si nécessaire.',
  'health',
  'other',
  'Recherche Google non fiable, auto-diagnostic erroné, consultations inutiles ou retardées.',
  'Medical LLMs fine-tunés + app mobile sécurisée + hosting HIPAA-compliant + intégrations télémédecine.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 8. AI Radiology Assistant
(
  'AI Radiology Assistant - Dépistage Préliminaire d''Images Médicales',
  'Les radiologues font face à des charges de travail élevées pour interpréter les radiographies, scanners CT, IRM. Les cas urgents peuvent être retardés.',
  'IA qui pré-examine les images, signale les anomalies, et priorise les cas urgents. Aide le radiologue à se concentrer sur les cas complexes.',
  'health',
  'other',
  'Examen manuel de toutes les images, pas de priorisation automatique, risque de manquer des anomalies subtiles.',
  'Computer vision CNNs + parsing DICOM + intégration PACS hospitalier pour workflow automatisé.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 9. Personalized Treatment Advisor
(
  'Personalized Treatment Advisor - Plans de Traitement Personnalisés',
  'Les plans de traitement sont souvent génériques, pas spécifiques au patient. Pas de combinaison optimale d''historique médical, données génétiques, et guidelines.',
  'IA qui combine historique médical, données génétiques, et guidelines pour suggérer des chemins de traitement personnalisés. Aide les médecins à prendre des décisions éclairées.',
  'health',
  'other',
  'Plans de traitement standardisés, pas de personnalisation basée sur données génétiques, décisions basées sur expérience seule.',
  'LLMs + intégrations EHR + bases de données génomiques pour recommandations personnalisées.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 10. AI Drug Discovery Platform
(
  'AI Drug Discovery Platform - Accélération de la Découverte de Médicaments',
  'Développer de nouveaux médicaments prend des années et coûte des milliards. Le screening de molécules est long et coûteux.',
  'IA qui screen les molécules, prédit les interactions, et réduit les candidats plus rapidement. Accélère la phase de découverte de 10x.',
  'health',
  'other',
  'Screening manuel de milliers de molécules, tests en laboratoire coûteux, processus itératif long.',
  'Deep learning models + simulation moléculaire + cloud compute pour screening virtuel à grande échelle.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 11. Virtual Mental Health Therapist
(
  'Virtual Mental Health Therapist - Thérapie CBT par IA',
  'Pénurie de thérapeutes abordables. Les patients attendent des mois pour un rendez-vous, et les coûts sont élevés.',
  'Chatbot IA de TCC (thérapie cognitive comportementale) qui guide les utilisateurs à travers des exercices, escalade vers un thérapeute humain si nécessaire.',
  'health',
  'other',
  'Attente longue pour rendez-vous, coûts élevés, pas d''accès 24/7.',
  'GPT-based conversation engine + contenu santé mentale + conformité HIPAA + intégrations assurance.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 12. Wearable Health Data Monitor
(
  'Wearable Health Data Monitor - Insights Actionnables des Données',
  'Les wearables collectent des tonnes de données de santé mais peu d''insights. Les utilisateurs ne savent pas quoi faire avec leurs données de fréquence cardiaque, sommeil, glucose.',
  'Dashboard IA qui interprète fréquence cardiaque, sommeil, glucose, et activité en recommandations de santé actionnables. Prédictions et alertes personnalisées.',
  'health',
  'other',
  'Données brutes non interprétées, pas de recommandations, utilisateur doit analyser manuellement.',
  'APIs wearables (Fitbit, Apple Health, Dexcom) + modèles prédictifs analytics pour insights personnalisés.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 13. AI for Insurance Claims
(
  'AI for Insurance Claims - Détection de Fraude et Accélération',
  'Les réclamations frauduleuses et la paperasse ralentissent les compagnies d''assurance. Processus manuel long et coûteux pour vérifier chaque réclamation.',
  'IA qui examine les réclamations, détecte les anomalies, et accélère les approbations. Réduit la fraude et améliore l''expérience client.',
  'finance',
  'other',
  'Examen manuel de chaque réclamation, détection de fraude basée sur règles, processus lent.',
  'NLP pour analyse de réclamations + modèles ML de détection d''anomalies + intégrations APIs assureurs.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 14. AI Clinical Trial Optimizer
(
  'AI Clinical Trial Optimizer - Matching Patients-Trials',
  'Recruter des patients pour les essais cliniques est lent et coûteux. Matching manuel basé sur critères d''éligibilité, beaucoup de temps perdu.',
  'IA qui match les patients avec les essais basé sur EHRs, démographie, et critères d''éligibilité. Accélère le recrutement de 5x.',
  'health',
  'other',
  'Recherche manuelle de patients éligibles, matching basé sur règles simples, beaucoup de faux positifs.',
  'NLP pour critères d''essais + ML pour matching patients + pipeline de données HIPAA-compliant.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 15. Elder Care Companion Bot
(
  'Elder Care Companion Bot - Assistant Vocal pour Seniors',
  'Les populations vieillissantes font face à la solitude et aux défis de gestion de santé. Pas d''assistance 24/7 pour rappels médicaments et compagnie.',
  'Assistant vocal IA qui rappelle les médicaments, surveille les patterns de santé, et fournit de la compagnie. Escalade vers soignants si nécessaire.',
  'health',
  'other',
  'Rappels manuels par famille, pas de monitoring continu, isolement social.',
  'Voice assistant + intégrations santé + monitoring patterns + alertes automatiques aux soignants.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 16. AI-Powered Genomic Analysis
(
  'AI-Powered Genomic Analysis - Analyse de Risques de Santé',
  'Les données de séquençage génomique sont vastes et complexes à interpréter. Les patients reçoivent des données brutes sans insights actionnables.',
  'IA qui interprète les données génomiques brutes pour identifier les risques de santé et actions préventives. Rapports personnalisés pour patients et médecins.',
  'health',
  'other',
  'Analyse manuelle par experts, coûteuse et longue, pas accessible aux patients.',
  'Modèles ML génomiques + pipelines bioinformatiques cloud + rapports direct-to-consumer.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- Finance & Business Ideas
-- 17. AI Fraud Detection System
(
  'AI Fraud Detection System - Détection de Fraude en Temps Réel',
  'La fraude coûte des milliards aux institutions financières chaque année. Détection manuelle lente et inefficace.',
  'Modèles IA qui surveillent les transactions en temps réel, signalent les anomalies et activités frauduleuses. Alertes instantanées et blocage automatique.',
  'finance',
  'other',
  'Détection manuelle basée sur règles, réaction lente, beaucoup de faux positifs.',
  'ML de détection d''anomalies + traitement de flux en temps réel + intégration APIs bancaires.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 18. AI Personal Finance Copilot
(
  'AI Personal Finance Copilot - Gestion Financière Personnelle Intelligente',
  'Les individus ont du mal à budgétiser, épargner et gérer leur dette. Pas de conseils personnalisés accessibles.',
  'App IA qui suit les dépenses, suggère des budgets, et fournit des recommandations d''épargne/investissement. Coaching financier personnalisé 24/7.',
  'finance',
  'other',
  'Suivi manuel sur Excel, pas de conseils, difficulté à comprendre les finances personnelles.',
  'Intégrations APIs bancaires (Plaid) + GPT pour conseiller + app mobile native.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 19. Automated AI Accountant for SMBs
(
  'Automated AI Accountant for SMBs - Comptabilité Automatisée pour PME',
  'Les petites entreprises ne peuvent pas se permettre un comptable à temps plein. La comptabilité manuelle est chronophage et sujette aux erreurs.',
  'IA qui catégorise les dépenses, réconcilie les comptes, et génère des rapports prêts pour les impôts. Automatisation complète de la comptabilité.',
  'finance',
  'other',
  'Comptabilité manuelle, catégorisation manuelle des dépenses, préparation fiscale manuelle.',
  'OCR pour scan de reçus + GPT pour catégorisation + intégrations QuickBooks/Xero APIs.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 20. AI Loan Underwriting Assistant
(
  'AI Loan Underwriting Assistant - Évaluation de Crédit Accélérée',
  'Les approbations de prêts traditionnelles sont lentes et biaisées. Pas d''utilisation de données alternatives pour évaluer la solvabilité.',
  'IA qui évalue la solvabilité plus rapidement en utilisant des données alternatives (historique de transactions, comportement numérique). Réduit les biais et accélère les décisions.',
  'finance',
  'other',
  'Évaluation manuelle basée sur crédit score seul, processus long, biais humains.',
  'Modèles ML prédictifs + outils d''explicabilité (XAI) + modules de conformité réglementaire.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 21. AI-Powered Trading Assistant
(
  'AI-Powered Trading Assistant - Assistant de Trading Intelligent',
  'Les investisseurs particuliers manquent d''insights de niveau professionnel. Pas d''analyse de marché en temps réel et gestion de risque.',
  'IA qui scanne les marchés, suggère des trades, et gère les alertes de risque. Insights professionnels pour investisseurs particuliers.',
  'finance',
  'other',
  'Recherche manuelle, pas d''analyse de marché automatisée, gestion de risque manuelle.',
  'APIs de données de marché + modèles ML pour détection de tendances + intégration plateformes de trading.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 22. AI Contract Review Platform
(
  'AI Contract Review Platform - Révision Automatique de Contrats',
  'Les contrats légaux/financiers prennent du temps à réviser. Identification manuelle des termes clés et risques.',
  'IA qui extrait les termes clés, signale les risques, et suggère des modifications. Révision de contrats en minutes au lieu d''heures.',
  'finance',
  'other',
  'Révision manuelle ligne par ligne, identification manuelle des risques, négociation manuelle.',
  'LLM fine-tuné sur textes légaux/financiers + parseurs Doc/PDF + génération de suggestions.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 23. AI Customer Support Agent for Banks/Fintechs
(
  'AI Customer Support Agent for Banks/Fintechs - Support Client Automatisé',
  'Les centres de support sont coûteux et lents. Pas de disponibilité 24/7 et temps d''attente longs.',
  'Chatbot IA entraîné sur FAQs financières, règles de conformité, et comptes utilisateurs. Support instantané et escalade vers humains si nécessaire.',
  'finance',
  'other',
  'Support humain uniquement, heures limitées, coûts élevés, temps d''attente.',
  'GPT + RAG avec base de connaissances financière + intégrations sécurisées avec systèmes bancaires.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 24. AI Business Intelligence Dashboard
(
  'AI Business Intelligence Dashboard - Tableaux de Bord Intelligents pour PME',
  'Les PME manquent d''insights en temps réel sur leur performance. Pas de vue consolidée des ventes, dépenses, RH, et opérations.',
  'IA qui connecte les données de ventes, dépenses, RH, et opérations pour générer des rapports intelligents. Insights actionnables en langage naturel.',
  'finance',
  'other',
  'Rapports manuels sur Excel, pas de vue consolidée, analyses ponctuelles.',
  'GPT pour Q&A en langage naturel + intégration entrepôt de données + visualisations automatiques.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 25. AI Tax Filing Assistant
(
  'AI Tax Filing Assistant - Assistant de Déclaration Fiscale',
  'La préparation fiscale est confuse et coûteuse. Erreurs fréquentes et peur de mal faire.',
  'IA qui guide les individus et PME à travers la déclaration, détecte les déductions, et réduit les erreurs. Coaching fiscal personnalisé.',
  'finance',
  'other',
  'Préparation manuelle, confusion sur les déductions, peur des erreurs, coûts élevés.',
  'GPT pour Q&A fiscal + APIs gouvernementales fiscales + couches de conformité automatiques.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 26. AI Risk & Compliance Monitor
(
  'AI Risk & Compliance Monitor - Surveillance de Conformité Automatisée',
  'Les entreprises financières font face à des exigences réglementaires strictes. Surveillance manuelle coûteuse et sujette aux erreurs.',
  'IA qui scanne les opérations, communications, et transactions pour détecter les problèmes de conformité. Alertes automatiques et audit trail complet.',
  'finance',
  'other',
  'Surveillance manuelle, audits ponctuels, risque de non-conformité, coûts élevés.',
  'NLP pour textes de conformité + ML de détection d''anomalies + logging d''audit trail.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- Education & Learning Ideas
-- 27. Personalized AI Tutor
(
  'Personalized AI Tutor - Tuteur IA Personnalisé',
  'Les étudiants apprennent à des rythmes différents mais les classes avancent à une seule vitesse. Pas de personnalisation de l''enseignement.',
  'Tuteur IA qui adapte les explications, exemples, et niveaux de difficulté à chaque apprenant. Apprentissage adaptatif en temps réel.',
  'education',
  'other',
  'Enseignement uniforme pour tous, pas d''adaptation au rythme individuel, feedback limité.',
  'GPT fine-tuné pour pédagogie + algorithmes d''apprentissage adaptatif + app mobile/web.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 28. Essay Feedback & Writing Coach
(
  'Essay Feedback & Writing Coach - Coach d''Écriture IA',
  'Les étudiants reçoivent rarement des retours détaillés sur leur écriture. Pas de feedback immédiat sur grammaire, clarté, et logique.',
  'IA qui note les essais, suggère des améliorations, et met en évidence grammaire, clarté, et logique. Feedback instantané et constructif.',
  'education',
  'other',
  'Correction manuelle par enseignants, feedback limité, délais longs.',
  'NLP pour grammaire/structure + GPT pour génération de feedback + analyse de style.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 29. AI Classroom Assistant for Teachers
(
  'AI Classroom Assistant for Teachers - Assistant de Classe pour Enseignants',
  'Les enseignants passent des heures à noter et préparer du matériel. Pas d''automatisation des tâches répétitives.',
  'Outil IA qui génère automatiquement des quiz, plans de cours, et devoirs notés. Libère du temps pour l''enseignement.',
  'education',
  'other',
  'Préparation manuelle de matériel, notation manuelle, pas de réutilisation de contenu.',
  'GPT + intégrations LMS (Canvas, Blackboard, Moodle) + génération de contenu adaptatif.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 30. Adaptive Test Prep Platform
(
  'Adaptive Test Prep Platform - Plateforme de Préparation aux Examens Adaptative',
  'Les étudiants bachotent pour les examens mais ne savent pas sur quoi se concentrer. Pas de personnalisation de la préparation.',
  'IA qui analyse la performance et adapte les questions de pratique aux faiblesses. Préparation ciblée et efficace.',
  'education',
  'other',
  'Bachotage général, pas de focus sur faiblesses, pas de suivi de progression.',
  'ML pour suivi de performance + GPT pour génération de questions + algorithmes adaptatifs.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 31. AI-Powered Language Learning App
(
  'AI-Powered Language Learning App - App d''Apprentissage de Langues IA',
  'Les apps d''apprentissage de langues se concentrent sur le vocabulaire mais pas sur la vraie conversation. Pas de pratique conversationnelle réaliste.',
  'Partenaire de conversation IA qui s''adapte au niveau de compétence et corrige la prononciation. Pratique conversationnelle immersive.',
  'education',
  'other',
  'Apprentissage basé sur vocabulaire seul, pas de pratique conversationnelle, pas de correction de prononciation.',
  'GPT + speech-to-text (Whisper API) + text-to-speech models + évaluation de prononciation.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 32. AI Career & Skills Coach
(
  'AI Career & Skills Coach - Coach de Carrière et Compétences IA',
  'Les étudiants et professionnels ont du mal à choisir le bon chemin de carrière. Pas de guidance basée sur compétences, intérêts, et tendances du marché.',
  'IA qui analyse les compétences, intérêts, et tendances du marché du travail pour recommander des chemins d''apprentissage. Guidance de carrière personnalisée.',
  'education',
  'other',
  'Guidance manuelle limitée, pas d''analyse de marché, décisions basées sur intuition.',
  'LLM + APIs de données du marché du travail + moteur de recommandation adaptatif.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 33. AI Flashcard & Revision Generator
(
  'AI Flashcard & Revision Generator - Générateur de Flashcards et Révision IA',
  'Les étudiants perdent du temps à créer des flashcards manuellement. Pas d''optimisation de la révision basée sur la science de l''apprentissage.',
  'IA qui transforme manuels, notes, et PDFs en flashcards intelligentes. Révision optimisée avec répétition espacée.',
  'education',
  'other',
  'Création manuelle de flashcards, pas d''optimisation, révision non structurée.',
  'OCR + GPT + algorithme de répétition espacée + génération automatique de questions.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 34. Virtual AI Study Group
(
  'Virtual AI Study Group - Groupe d''Étude Virtuel IA',
  'Les étudiants à distance manquent de collaboration et discussions entre pairs. Pas d''interaction sociale pour l''apprentissage.',
  'Groupe d''étude IA qui simule questions de pairs, débats, et résolution de problèmes en groupe. Collaboration virtuelle immersive.',
  'education',
  'other',
  'Étude solitaire, pas de collaboration, manque d''interaction sociale.',
  'Simulations multi-agents GPT + interfaces de chat + modèles de débat et discussion.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 35. AI STEM Lab Simulator
(
  'AI STEM Lab Simulator - Simulateur de Laboratoire STEM IA',
  'Beaucoup d''écoles manquent de ressources pour les laboratoires en physique, chimie, biologie. Pas d''accès à des expériences pratiques.',
  'Laboratoire virtuel alimenté par IA qui permet aux étudiants de simuler des expériences en sécurité en ligne. Expériences guidées et interactives.',
  'education',
  'other',
  'Laboratoires physiques coûteux, ressources limitées, pas d''accès pour tous.',
  'Moteurs de simulation + GPT pour leçons guidées + VR/AR optionnel + physique réaliste.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
),
-- 36. AI Parent Dashboard
(
  'AI Parent Dashboard - Tableau de Bord Parent IA',
  'Les parents n''ont pas d''insight en temps réel sur la progression d''apprentissage de leurs enfants. Pas de visibilité sur forces/faiblesses.',
  'Dashboard IA qui résume la performance, met en évidence forces/faiblesses, et suggère des ressources. Visibilité complète pour les parents.',
  'education',
  'other',
  'Rapports ponctuels, pas de visibilité en temps réel, communication limitée avec enseignants.',
  'GPT pour résumé + intégration LMS étudiant + app mobile parent + recommandations personnalisées.',
  'AI Startup Research',
  'research@fikravalley.com',
  'entrepreneur',
  'web',
  'submitted',
  true
)
ON CONFLICT DO NOTHING;

-- Update all existing ideas to be visible (if they're not already)
UPDATE marrai_ideas 
SET visible = true 
WHERE visible IS NULL OR visible = false;

-- Verify insertion
SELECT 
  COUNT(*) as total_ideas,
  category,
  COUNT(*) FILTER (WHERE category = 'tech') as tech_ideas,
  COUNT(*) FILTER (WHERE category = 'health') as health_ideas,
  COUNT(*) FILTER (WHERE category = 'finance') as finance_ideas,
  COUNT(*) FILTER (WHERE category = 'education') as education_ideas
FROM marrai_ideas
WHERE submitter_email = 'research@fikravalley.com'
GROUP BY category
ORDER BY category;

