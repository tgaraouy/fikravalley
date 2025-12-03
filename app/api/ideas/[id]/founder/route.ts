/**
 * API: Get Founder Info for Idea
 * 
 * GET /api/ideas/[id]/founder
 * 
 * Returns founder information:
 * - If idea was claimed, returns claimer info
 * - Otherwise, returns submitter info
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
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // First, check if there's a claimer (founder who picked up the idea)
    const { data: claims, error: claimsError } = await supabase
      .from('marrai_idea_claims')
      .select('claimer_name, claimer_email, created_at')
      .eq('idea_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!claimsError && claims && claims.length > 0) {
      const claim = claims[0] as { claimer_name: string; claimer_email: string; created_at: string };
      
      // Count how many ideas this founder has claimed
      const { count: claimCount } = await supabase
        .from('marrai_idea_claims')
        .select('idea_id', { count: 'exact', head: true })
        .eq('claimer_email', claim.claimer_email)
        .is('deleted_at', null);

      return NextResponse.json({
        founder: {
          name: claim.claimer_name,
          email: claim.claimer_email,
          type: 'claimer',
          ideaCount: claimCount || 0,
        },
      });
    }

    // Fallback: Get submitter info (original creator)
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('submitter_name, submitter_email')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    const ideaData = idea as { submitter_name: string | null; submitter_email: string | null };

    if (!ideaData.submitter_name || !ideaData.submitter_email) {
      return NextResponse.json({
        founder: null,
      });
    }

    // Count how many ideas this submitter has created
    const { count: submitterCount } = await supabase
      .from('marrai_ideas')
      .select('id', { count: 'exact', head: true })
      .eq('submitter_email', ideaData.submitter_email)
      .is('deleted_at', null);

    return NextResponse.json({
      founder: {
        name: ideaData.submitter_name,
        email: ideaData.submitter_email,
        type: 'submitter',
        ideaCount: submitterCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Error in GET /api/ideas/[id]/founder:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

