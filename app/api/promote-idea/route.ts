import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type IdeaInsert = Database['public']['Tables']['marrai_ideas']['Insert'];
type ConversationIdeaUpdate = Database['public']['Tables']['marrai_conversation_ideas']['Update'];

/**
 * POST /api/promote-idea
 * Promotes a validated conversation idea to the main marrai_ideas table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_idea_id } = body;

    if (!conversation_idea_id || typeof conversation_idea_id !== 'string') {
      return NextResponse.json(
        { error: 'conversation_idea_id is required and must be a string' },
        { status: 400 }
      );
    }

    // Fetch the conversation idea
    const { data: conversationIdea, error: fetchError } = await supabase
      .from('marrai_conversation_ideas')
      .select('*')
      .eq('id', conversation_idea_id)
      .single();

    if (fetchError || !conversationIdea) {
      console.error('Error fetching conversation idea:', fetchError);
      return NextResponse.json(
        { error: 'Conversation idea not found' },
        { status: 404 }
      );
    }

    // Verify status is 'speaker_validated'
    if (conversationIdea.status !== 'speaker_validated') {
      return NextResponse.json(
        {
          error: 'Conversation idea must be validated before promotion',
          currentStatus: conversationIdea.status,
        },
        { status: 400 }
      );
    }

    // Check if already promoted
    if (conversationIdea.promoted_to_idea_id) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already promoted',
          ideaId: conversationIdea.promoted_to_idea_id,
        },
        { status: 200 }
      );
    }

    // Create idea in main table
    const ideaData: IdeaInsert = {
      title: conversationIdea.problem_title,
      problem_statement: conversationIdea.problem_statement,
      proposed_solution: conversationIdea.proposed_solution || null,
      current_manual_process: conversationIdea.current_manual_process || null,
      category: (conversationIdea.category as any) || null,
      digitization_opportunity: conversationIdea.digitization_opportunity || null,
      workshop_session: conversationIdea.session_id || null,
      submitted_via: 'workshop_conversation',
      submitter_name: conversationIdea.speaker_context || null,
      status: 'submitted', // Will be changed to 'analyzing' by analyze-idea API
    };

    const { data: newIdea, error: insertError } = await supabase
      .from('marrai_ideas')
      .insert(ideaData)
      .select('id')
      .single();

    if (insertError || !newIdea) {
      console.error('Error inserting idea:', insertError);
      return NextResponse.json(
        { error: 'Failed to promote idea to main table' },
        { status: 500 }
      );
    }

    // Update conversation idea with promotion info
    const updateData: ConversationIdeaUpdate = {
      promoted_to_idea_id: newIdea.id,
      promoted_at: new Date().toISOString(),
      status: 'promoted_to_idea',
    };

    const { error: updateError } = await supabase
      .from('marrai_conversation_ideas')
      .update(updateData)
      .eq('id', conversation_idea_id);

    if (updateError) {
      console.error('Error updating conversation idea:', updateError);
      // Don't fail the request, idea was already created
    }

    // Trigger analysis for the new idea (non-blocking)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-idea`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: newIdea.id }),
    }).catch((err) => console.error('Error triggering analysis:', err));

    return NextResponse.json(
      {
        success: true,
        message: 'Idea promoted successfully',
        ideaId: newIdea.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in promote-idea API route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

