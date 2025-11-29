/**
 * API: Claim Idea (GenZ picks up an idea)
 *
 * POST /api/ideas/[id]/claim
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
    console.error('Supabase config missing for claim API', {
      hasUrl: !!supabaseUrl,
      hasKey: !!apiKey,
    });
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const body = await request.json();
    const {
      claimer_name,
      claimer_email,
      claimer_city,
      claimer_type = 'solo',
      engagement_level = 'exploring',
      motivation,
      notes,
    } = body || {};

    if (!claimer_name || typeof claimer_name !== 'string' || claimer_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'claimer_name is required' },
        { status: 400 }
      );
    }

    const validTypes = ['solo', 'team', 'community', 'university_club', 'other'];
    if (claimer_type && !validTypes.includes(claimer_type)) {
      return NextResponse.json(
        { error: `claimer_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const validLevels = ['exploring', 'validating', 'prototyping', 'launching'];
    if (engagement_level && !validLevels.includes(engagement_level)) {
      return NextResponse.json(
        { error: `engagement_level must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify idea exists & is visible
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id, title, visible')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    if (!(idea as any).visible) {
      return NextResponse.json(
        { error: 'Idea is not publicly visible' },
        { status: 403 }
      );
    }

    // Insert claim
    const { data: claim, error: insertError } = await (supabase as any)
      .from('marrai_idea_claims')
      .insert({
        idea_id: id,
        claimer_name: claimer_name.trim(),
        claimer_email: claimer_email?.trim() || null,
        claimer_city: claimer_city?.trim() || null,
        claimer_type,
        engagement_level,
        motivation: motivation?.trim() || null,
        notes: notes?.trim() || null,
      } as any)
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error inserting idea claim:', insertError);
      return NextResponse.json(
        { error: 'Failed to create idea claim' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        claim,
        message: 'Merci ! Ton équipe GenZ a officiellement pris cette idée en main.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in POST /api/ideas/[id]/claim:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


