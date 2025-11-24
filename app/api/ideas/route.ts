import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';
import { moderateContent, sanitizeContent, checkRateLimit } from '@/lib/moderation/content-moderation';

type IdeaInsert = Database['public']['Tables']['marrai_ideas']['Insert'];

/**
 * POST /api/ideas
 * Creates a new idea submission
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Rate limiting (use IP or user ID)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(ip, 10, 60000); // 10 requests per minute
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter avant de soumettre à nouveau.' },
        { status: 429 }
      );
    }

    // Content moderation
    const contentToModerate = [
      body.title,
      body.problem_statement,
      body.proposed_solution,
      body.current_manual_process,
      body.digitization_opportunity
    ].filter(Boolean).join(' ');

    const moderation = moderateContent(contentToModerate, {
      type: 'idea',
      strict: true
    });

    if (!moderation.allowed) {
      return NextResponse.json(
        {
          error: 'Contenu inapproprié détecté',
          reason: moderation.reason,
          flaggedWords: moderation.flaggedWords,
          suggestions: moderation.suggestions
        },
        { status: 400 }
      );
    }

    // Sanitize content
    const sanitizedBody = {
      ...body,
      title: sanitizeContent(body.title || ''),
      problem_statement: sanitizeContent(body.problem_statement || ''),
      proposed_solution: body.proposed_solution ? sanitizeContent(body.proposed_solution) : null,
      current_manual_process: body.current_manual_process ? sanitizeContent(body.current_manual_process) : null,
      digitization_opportunity: body.digitization_opportunity ? sanitizeContent(body.digitization_opportunity) : null,
    };

    // Validate required fields
    if (!sanitizedBody.title || !sanitizedBody.problem_statement) {
      return NextResponse.json(
        { error: 'Les champs titre et description du problème sont requis' },
        { status: 400 }
      );
    }

    // For voice submissions, allow missing fields (they will be analyzed by AI agents later)
    const isVoiceSubmission = body.submitted_via === 'voice' || body.submitted_via === 'voice_guided';
    
    if (!isVoiceSubmission) {
      // For non-voice submissions, require more fields
      if (!sanitizedBody.current_manual_process) {
        return NextResponse.json(
          { error: 'Le champ processus manuel est requis' },
          { status: 400 }
        );
      }

      if (!body.category || !body.location) {
        return NextResponse.json(
          { error: 'Les champs catégorie et localisation sont requis' },
          { status: 400 }
        );
      }
    } else {
      // For voice submissions, set defaults if missing
      if (!body.category) body.category = 'other';
      if (!body.location) body.location = 'other';
    }

    if (!body.submitter_name || !body.submitter_email || !body.submitter_type) {
      return NextResponse.json(
        { error: 'Les champs nom, email et type de profil sont requis' },
        { status: 400 }
      );
    }

    // Prepare insert data (using sanitized content)
    const ideaData: IdeaInsert = {
      title: sanitizedBody.title,
      problem_statement: sanitizedBody.problem_statement,
      proposed_solution: sanitizedBody.proposed_solution,
      category: body.category,
      location: body.location,
      current_manual_process: sanitizedBody.current_manual_process,
      digitization_opportunity: sanitizedBody.digitization_opportunity,
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

    // Fetch the created idea to get the tracking code (generated by trigger)
    const { data: createdIdea, error: fetchError } = await (supabase as any)
      .from('marrai_ideas')
      .select('id, tracking_code, created_at')
      .eq('id', insertedIdea.id)
      .single();

    if (fetchError || !createdIdea) {
      console.error('Error fetching tracking code:', fetchError);
      // Still return success, tracking code can be retrieved later
    }

    // Get total idea count for idea number (sequential) - only non-deleted ideas
    const { count: totalIdeas } = await (supabase as any)
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // TODO: Send confirmation email/SMS with tracking code
    // This would be done via a background job or webhook

    return NextResponse.json(
      {
        success: true,
        message: 'Idée soumise avec succès',
        id: insertedIdea.id,
        tracking_code: createdIdea?.tracking_code || null,
        idea_number: totalIdeas || 128, // Sequential number for reward screen
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

