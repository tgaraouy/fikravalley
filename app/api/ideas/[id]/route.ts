/**
 * API: Get Idea by ID (Public)
 * 
 * Returns idea data if visible=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    console.error('Supabase config missing', { hasUrl: !!supabaseUrl, hasKey: !!apiKey });
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Fetch idea by ID (public view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch idea with related data
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select(`
        id,
        title,
        problem_statement,
        proposed_solution,
        category,
        location,
        status,
        visible,
        featured,
        ai_feasibility_score,
        ai_impact_score,
        roi_time_saved_hours,
        roi_cost_saved_eur,
        alignment,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if idea is visible (public)
    if (!(idea as any).visible) {
      return NextResponse.json(
        { error: 'Idea is not publicly visible' },
        { status: 403 }
      );
    }

    // Count problem validations
    const { count: validationCount } = await supabase
      .from('marrai_problem_validations')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', id);

    // Count mentor matches (accepted)
    const { count: mentorCount } = await supabase
      .from('marrai_mentor_matches')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', id)
      .eq('status', 'accepted');

    return NextResponse.json({
      ...(idea as any),
      validation_count: validationCount || 0,
      mentor_count: mentorCount || 0,
    });
  } catch (error: any) {
    console.error('Error in GET /api/ideas/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
