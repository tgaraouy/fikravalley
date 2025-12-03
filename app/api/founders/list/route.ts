/**
 * API: Get List of Founders
 * 
 * GET /api/founders/list
 * 
 * Returns list of founders with:
 * - Name
 * - City
 * - Idea count
 * - Link to founder letter
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

interface Founder {
  name: string;
  city?: string;
  email?: string;
  ideaCount: number;
  identifier: string; // email or name for linking
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const foundersMap = new Map<string, Founder>();

    // Get all submitters (creators)
    const { data: ideas, error: ideasError } = await supabase
      .from('marrai_ideas')
      .select('submitter_name, submitter_email, location')
      .is('deleted_at', null)
      .not('submitter_name', 'is', null);

    if (!ideasError && ideas) {
      for (const idea of ideas as any[]) {
        if (!idea.submitter_name) continue;

        const identifier = idea.submitter_email || idea.submitter_name;  
        const existing = foundersMap.get(identifier);
        
        if (existing) {
          existing.ideaCount += 1;
        } else {
          foundersMap.set(identifier, {
            name: idea.submitter_name,
            city: idea.location || undefined,
            email: idea.submitter_email || undefined,
            ideaCount: 1,
            identifier,
          });
        }
      }
    }

    // Get all claimers (founders who picked up ideas)
    const { data: claims, error: claimsError } = await supabase
      .from('marrai_idea_claims')
      .select('claimer_name, claimer_email, claimer_city')
      .is('deleted_at', null);

    if (!claimsError && claims) {
      for (const claim of claims as any[]) {
        if (!claim.claimer_name) continue;
        
        const identifier = claim.claimer_email || claim.claimer_name;
        const existing = foundersMap.get(identifier);
        
        if (existing) {
          existing.ideaCount += 1;
        } else {
          foundersMap.set(identifier, {
            name: claim.claimer_name,
            city: claim.claimer_city || undefined,
            email: claim.claimer_email || undefined,
            ideaCount: 1,
            identifier,
          });
        }
      }
    }

    // Convert map to array and sort by idea count (descending)
    const founders = Array.from(foundersMap.values()).sort(
      (a, b) => b.ideaCount - a.ideaCount
    );

    return NextResponse.json({
      founders,
      total: founders.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/founders/list:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

