import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type IdeaInsert = Database['public']['Tables']['marrai_ideas']['Insert'];

const SAMPLE_IDEAS: IdeaInsert[] = [
  {
    title: 'Suivi des équipements hospitaliers',
    problem_statement:
      "Les hôpitaux publics de Casablanca suivent les équipements médicaux sur des fichiers Excel séparés, ce qui provoque des pertes et des retards de maintenance.",
    current_manual_process:
      "Inventaire mensuel manuel sur tableur et appels téléphoniques entre le service biomédical et les départements.",
    category: 'health',
    location: 'casablanca',
    digitization_opportunity:
      "Plateforme centralisée de suivi avec codes QR, notifications automatiques et rapports en temps réel.",
    estimated_cost: '5K-10K',
    roi_time_saved_hours: 120,
    roi_cost_saved_eur: 3000,
    automation_potential: 'high',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Dr. Ahmed Benali',
    submitter_email: 'ahmed.benali@example.ma',
    submitter_type: 'professional',
    data_sources: ['Excel', 'Paper'],
    integration_points: ['Hospital ERP'],
    ai_capabilities_needed: ['Vision', 'Classification'],
    human_in_loop: true,
  },
  {
    title: 'Planification des rendez-vous patients',
    problem_statement:
      "Au CHU de Rabat, les patients attendent plusieurs heures car la prise de rendez-vous reste manuelle et dépend de carnets papier.",
    current_manual_process:
      "Les secrétaires reçoivent les appels, notent les rendez-vous sur des registres papier et confirment par téléphone.",
    category: 'health',
    location: 'rabat',
    digitization_opportunity:
      "Portail de réservation en ligne avec rappels SMS en français/arabe et gestion de files d'attente.",
    estimated_cost: '3K-5K',
    roi_time_saved_hours: 90,
    roi_cost_saved_eur: 2200,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'daily',
    submitted_via: 'web',
    submitter_name: 'Fatima Alami',
    submitter_email: 'fatima.alami@example.ma',
    submitter_type: 'government',
    data_sources: ['Paper', 'Phone'],
    integration_points: ['Calendar', 'SMS/WhatsApp'],
    ai_capabilities_needed: ['NLP', 'Text Generation'],
    human_in_loop: true,
  },
  {
    title: "Suivi de l'assiduité scolaire",
    problem_statement:
      "Les collèges publics de Marrakech consignent l'assiduité des élèves sur des cahiers qui sont saisis en fin de trimestre.",
    current_manual_process:
      "Chaque professeur remplit un cahier quotidien, remis à l'administration qui saisit les données sous Excel.",
    category: 'education',
    location: 'marrakech',
    digitization_opportunity:
      "Application mobile pour saisir les présences en classe avec synchronisation Supabase et alertes parents.",
    estimated_cost: '1K-3K',
    roi_time_saved_hours: 75,
    roi_cost_saved_eur: 1500,
    automation_potential: 'high',
    status: 'submitted',
    frequency: 'daily',
    submitted_via: 'web',
    submitter_name: 'Mohamed Tazi',
    submitter_email: 'm.tazi@example.ma',
    submitter_type: 'professional',
    data_sources: ['Paper', 'Excel'],
    integration_points: ['SMS/WhatsApp'],
    ai_capabilities_needed: ['Classification'],
    human_in_loop: true,
  },
  {
    title: 'Bulletins et notes en ligne',
    problem_statement:
      "Les lycées de Fès impriment encore les bulletins et rédigent des courriers à la main pour informer les parents.",
    current_manual_process:
      "Saisie des notes sur Excel, impression, signatures et distribution physique aux élèves.",
    category: 'education',
    location: 'fes',
    digitization_opportunity:
      "Portail web sécurisé avec génération automatique de bulletins PDF et notifications par SMS.",
    estimated_cost: '3K-5K',
    roi_time_saved_hours: 110,
    roi_cost_saved_eur: 2600,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'monthly',
    submitted_via: 'web',
    submitter_name: 'Aicha Idrissi',
    submitter_email: 'a.idrissi@example.ma',
    submitter_type: 'professional',
    data_sources: ['Excel', 'Paper'],
    integration_points: ['SMS/WhatsApp'],
    ai_capabilities_needed: ['Text Generation'],
    human_in_loop: true,
  },
  {
    title: 'Détection des maladies des cultures agrumes',
    problem_statement:
      "Les coopératives d'agrumes à Agadir inspectent manuellement les vergers pour repérer les maladies, entraînant des pertes tardivement détectées.",
    current_manual_process:
      "Tournées hebdomadaires à pied des techniciens, photos sur WhatsApp et rapports papier.",
    category: 'agriculture',
    location: 'agadir',
    digitization_opportunity:
      "Application mobile avec capture photo, IA de détection et tableau de bord pour interventions rapides.",
    estimated_cost: '5K-10K',
    roi_time_saved_hours: 140,
    roi_cost_saved_eur: 4200,
    automation_potential: 'high',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Hassan Amrani',
    submitter_email: 'h.amrani@example.ma',
    submitter_type: 'entrepreneur',
    data_sources: ['Photos', 'SMS/WhatsApp', 'Paper'],
    integration_points: ['SMS/WhatsApp'],
    ai_capabilities_needed: ['Vision', 'Classification'],
    human_in_loop: true,
  },
  {
    title: "Gestion d'irrigation intelligente",
    problem_statement:
      "Les agriculteurs de la région de Meknès irriguent selon un calendrier fixe sans tenir compte de l'humidité du sol.",
    current_manual_process:
      "Lecture manuelle des pluviomètres et discussions informelles entre agriculteurs.",
    category: 'agriculture',
    location: 'meknes',
    digitization_opportunity:
      "Plateforme IoT abordable qui agrège capteurs, météo et propose des alertes SMS en darija.",
    estimated_cost: '3K-5K',
    roi_time_saved_hours: 65,
    roi_cost_saved_eur: 1800,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Khadija Berrada',
    submitter_email: 'k.berrada@example.ma',
    submitter_type: 'entrepreneur',
    data_sources: ['Sensors'],
    integration_points: ['SMS/WhatsApp'],
    ai_capabilities_needed: ['Prediction', 'Anomaly Detection'],
    human_in_loop: false,
  },
  {
    title: 'Dématérialisation des permis commerciaux',
    problem_statement:
      "À Tanger, les commerçants doivent se déplacer plusieurs fois à la municipalité pour déposer et suivre leurs dossiers de permis.",
    current_manual_process:
      "Formulaires papier, scans sur clé USB et signatures en présentiel auprès de différents guichets.",
    category: 'administration',
    location: 'tangier',
    digitization_opportunity:
      "Portail unique avec upload sécurisé, signatures électroniques et suivi en ligne des étapes.",
    estimated_cost: '5K-10K',
    roi_time_saved_hours: 160,
    roi_cost_saved_eur: 3500,
    automation_potential: 'high',
    status: 'submitted',
    frequency: 'monthly',
    submitted_via: 'web',
    submitter_name: 'Omar El Fassi',
    submitter_email: 'o.elfassi@example.ma',
    submitter_type: 'government',
    data_sources: ['Paper', 'PDF', 'Forms'],
    integration_points: ['Government DB'],
    ai_capabilities_needed: ['Vision', 'NLP'],
    human_in_loop: true,
  },
  {
    title: 'Vérification des documents administratifs',
    problem_statement:
      "Les agents de la province de Kenitra vérifient à la main les copies de CIN, quittances et certificats pour les dossiers sociaux.",
    current_manual_process:
      "Comparaison visuelle avec des modèles imprimés, appels téléphoniques et tampons physiques.",
    category: 'administration',
    location: 'kenitra',
    digitization_opportunity:
      "Service web avec OCR, base de modèles et workflow de validation multi-niveaux.",
    estimated_cost: '3K-5K',
    roi_time_saved_hours: 95,
    roi_cost_saved_eur: 2400,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Laila Bensaid',
    submitter_email: 'l.bensaid@example.ma',
    submitter_type: 'government',
    data_sources: ['Paper', 'PDF', 'Photos'],
    integration_points: ['Government DB'],
    ai_capabilities_needed: ['Vision', 'OCR'],
    human_in_loop: true,
  },
  {
    title: 'Suivi des livraisons artisanales',
    problem_statement:
      "Les coopératives artisanales de Oujda gèrent leurs livraisons via WhatsApp et perdent la traçabilité des colis exportés.",
    current_manual_process:
      "Groupes WhatsApp, feuilles de route papier et confirmations téléphoniques des transporteurs.",
    category: 'logistics',
    location: 'oujda',
    digitization_opportunity:
      "Interface web/mobile avec suivi GPS, codes QR pour les colis et alertes de livraison.",
    estimated_cost: '1K-3K',
    roi_time_saved_hours: 80,
    roi_cost_saved_eur: 1700,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Youssef Alaoui',
    submitter_email: 'y.alaoui@example.ma',
    submitter_type: 'entrepreneur',
    data_sources: ['SMS/WhatsApp', 'Paper'],
    integration_points: ['WhatsApp Business'],
    ai_capabilities_needed: ['NLP'],
    human_in_loop: true,
  },
  {
    title: 'Gestion des stocks de pièces automobiles',
    problem_statement:
      "Les garages de Casablanca suivent les pièces détachées sur des carnets, provoquant des ruptures fréquentes.",
    current_manual_process:
      "Inventaire papier et appels urgents aux fournisseurs, sans visibilité consolidée.",
    category: 'logistics',
    location: 'casablanca',
    digitization_opportunity:
      "Application de gestion de stock avec alertes seuils, intégration fournisseurs et tableau de bord simple.",
    estimated_cost: '3K-5K',
    roi_time_saved_hours: 105,
    roi_cost_saved_eur: 2800,
    automation_potential: 'medium',
    status: 'submitted',
    frequency: 'weekly',
    submitted_via: 'web',
    submitter_name: 'Rachid Chraibi',
    submitter_email: 'r.chraibi@example.ma',
    submitter_type: 'entrepreneur',
    data_sources: ['Paper', 'Phone'],
    integration_points: ['E-commerce'],
    ai_capabilities_needed: ['Prediction'],
    human_in_loop: true,
  },
  {
    title: 'Plateforme de microfinance pour artisans',
    problem_statement:
      "Les artisans de Marrakech ont du mal à accéder au crédit car les banques exigent des dossiers complexes et des garanties importantes.",
    current_manual_process:
      "Dossiers papier multiples, déplacements répétés aux banques, attentes longues pour les réponses.",
    category: 'finance',
    location: 'marrakech',
    digitization_opportunity:
      "Application mobile simple pour demander des microcrédits avec évaluation automatique basée sur l'historique de vente.",
    estimated_cost: '5K-10K',
    roi_time_saved_hours: 130,
    roi_cost_saved_eur: 3200,
    automation_potential: 'high',
    status: 'submitted',
    frequency: 'monthly',
    submitted_via: 'web',
    submitter_name: 'Sanae El Ouazzani',
    submitter_email: 's.elouazzani@example.ma',
    submitter_type: 'entrepreneur',
    data_sources: ['Paper', 'Forms'],
    integration_points: ['Billing'],
    ai_capabilities_needed: ['Prediction', 'Classification'],
    human_in_loop: true,
  },
];

const ANALYSIS_API_URL = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-idea`;

export async function POST() {
  try {
    // Validate input - ensure we have ideas to insert
    if (!SAMPLE_IDEAS || SAMPLE_IDEAS.length === 0) {
      return NextResponse.json(
        { error: 'No sample ideas defined' },
        { status: 400 }
      );
    }

    // Insert ideas into marrai_ideas table
    const { data: insertedIdeas, error } = await (supabase as any)
      .from('marrai_ideas')
      .insert(SAMPLE_IDEAS)
      .select('id, title, category, location');

    if (error) {
      console.error('Error inserting sample ideas:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to seed sample ideas',
          details: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    const insertedList = (insertedIdeas as any[]) || [];

    if (insertedList.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No ideas were inserted',
        },
        { status: 500 }
      );
    }

    // Trigger analysis for each inserted idea (non-blocking, background)
    const analysisPromises = insertedList.map((idea: any) =>
      fetch(ANALYSIS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId: idea.id }),
      }).catch((analysisError) => {
        console.error(`Failed to trigger analysis for idea ${idea.id}:`, analysisError);
        return null;
      })
    );

    // Don't await - let analysis run in background
    Promise.all(analysisPromises).catch(() => {
      // Silently handle - analysis is optional
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Sample ideas seeded successfully',
        ideasCreated: insertedList.length,
        ideas: insertedList.map((idea: any) => ({
          id: idea.id,
          title: idea.title,
          category: idea.category,
          location: idea.location,
        })),
        note: 'AI analysis triggered in background for all ideas',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in seed-ideas API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
