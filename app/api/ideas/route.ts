import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type IdeaInsert = Database['public']['Tables']['marrai_ideas']['Insert'];

/**
 * POST /api/ideas
 * Creates a new idea submission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.problem_statement || !body.current_manual_process) {
      return NextResponse.json(
        { error: 'Les champs titre, description du problème et processus manuel sont requis' },
        { status: 400 }
      );
    }

    if (!body.category || !body.location || !body.frequency) {
      return NextResponse.json(
        { error: 'Les champs catégorie, localisation et fréquence sont requis' },
        { status: 400 }
      );
    }

    if (!body.digitization_opportunity || !body.proposed_solution) {
      return NextResponse.json(
        { error: 'Les champs opportunité de numérisation et solution proposée sont requis' },
        { status: 400 }
      );
    }

    if (!body.submitter_name || !body.submitter_email || !body.submitter_type) {
      return NextResponse.json(
        { error: 'Les champs nom, email et type de profil sont requis' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const ideaData: IdeaInsert = {
      title: body.title,
      problem_statement: body.problem_statement,
      proposed_solution: body.proposed_solution,
      category: body.category,
      location: body.location,
      current_manual_process: body.current_manual_process,
      digitization_opportunity: body.digitization_opportunity,
      frequency: body.frequency,
      data_sources: body.data_sources || [],
      integration_points: body.integration_points || [],
      ai_capabilities_needed: body.ai_capabilities_needed || [],
      human_in_loop: body.human_in_loop !== undefined ? body.human_in_loop : true,
      estimated_cost: body.estimated_cost || null,
      roi_time_saved_hours: body.roi_time_saved_hours || null,
      roi_cost_saved_eur: body.roi_cost_saved_eur || null,
      priority: body.urgency || null,
      submitter_name: body.submitter_name,
      submitter_email: body.submitter_email,
      submitter_phone: body.submitter_phone || null,
      submitter_type: body.submitter_type,
      submitter_skills: body.submitter_skills || [],
      status: body.status || 'submitted',
      submitted_via: body.submitted_via || 'web',
    };

    // Insert into database
    const { data: insertedIdea, error: insertError } = await (supabase as any)
      .from('marrai_ideas')
      .insert(ideaData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting idea:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'insertion de l\'idée dans la base de données' },
        { status: 500 }
      );
    }

    if (!insertedIdea) {
      return NextResponse.json(
        { error: 'Aucune idée n\'a été créée' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Idée soumise avec succès',
        id: insertedIdea.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in ideas API route:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur interne',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

