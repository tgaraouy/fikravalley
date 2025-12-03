/**
 * API: Get Ideas by Founder
 * 
 * GET /api/founder/[identifier]/ideas
 * 
 * Returns all ideas associated with a founder:
 * - Ideas they created (submitter)
 * - Ideas they claimed
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
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decodedIdentifier = decodeURIComponent(identifier);
    const supabase = getSupabase();

    // Try to find by email first, then by name
    const isEmail = decodedIdentifier.includes('@');

    let ideas: any[] = [];

    if (isEmail) {
      // Find ideas where user is submitter
      const { data: submittedIdeas, error: submitterError } = await supabase
        .from('marrai_ideas')
        .select('id, title, problem_statement, category, location, created_at, visible')
        .eq('submitter_email', decodedIdentifier)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!submitterError && submittedIdeas) {
        ideas.push(...submittedIdeas.map((idea: any) => ({ ...idea, source: 'created' })));
      }

      // Find ideas where user is claimer
      const { data: claims, error: claimsError } = await supabase
        .from('marrai_idea_claims')
        .select('idea_id, created_at')
        .eq('claimer_email', decodedIdentifier)
        .is('deleted_at', null);

      if (!claimsError && claims && claims.length > 0) {
        const claimedIdeaIds = claims.map((c: any) => c.idea_id);
        
        const { data: claimedIdeas, error: claimedError } = await supabase
          .from('marrai_ideas')
          .select('id, title, problem_statement, category, location, created_at, visible')
          .in('id', claimedIdeaIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!claimedError && claimedIdeas) {
          ideas.push(...claimedIdeas.map((idea: any) => ({ ...idea, source: 'claimed' })));
        }
      }
    } else {
      // Find by name (submitter_name)
      const { data: submittedIdeas, error: submitterError } = await supabase
        .from('marrai_ideas')
        .select('id, title, problem_statement, category, location, created_at, visible')
        .eq('submitter_name', decodedIdentifier)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (!submitterError && submittedIdeas) {
        ideas.push(...(submittedIdeas as any[]).map((idea: any) => ({ ...idea, source: 'created' })));
      }

      // Find by claimer_name
      const { data: claims, error: claimsError } = await supabase
        .from('marrai_idea_claims')
        .select('idea_id, created_at')
        .eq('claimer_name', decodedIdentifier)
        .is('deleted_at', null);

      if (!claimsError && claims && claims.length > 0) {
        const claimedIdeaIds = (claims as any[]).map((c: any) => c.idea_id);
        
        const { data: claimedIdeas, error: claimedError } = await supabase
          .from('marrai_ideas')
          .select('id, title, problem_statement, category, location, created_at, visible')
          .in('id', claimedIdeaIds)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (!claimedError && claimedIdeas) {
          ideas.push(...(claimedIdeas as any[]).map((idea: any) => ({ ...idea, source: 'claimed' })));
        }
      }
    }

    // Remove duplicates (same idea might be both created and claimed)
    const uniqueIdeas = Array.from(
      new Map(ideas.map(idea => [idea.id, idea])).values()
    );

    return NextResponse.json({
      founder: {
        identifier: decodedIdentifier,
        ideaCount: uniqueIdeas.length,
      },
      ideas: uniqueIdeas,
    });
  } catch (error: any) {
    console.error('Error in GET /api/founder/[identifier]/ideas:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

