/**
 * Mentor API: View and manage matches
 * 
 * GET: Fetch matches for a mentor (by email or phone)
 * POST: Accept/reject a match
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Fetch matches for a mentor
 * Query params: email or phone
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const status = searchParams.get('status') || 'active'; // Default to active matches

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Missing required parameter: email or phone' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Find mentor by email or phone
    let mentorQuery = supabase
      .from('marrai_mentors')
      .select('id, name, email, phone')
      .limit(1);

    if (email) {
      mentorQuery = mentorQuery.eq('email', email);
    } else if (phone) {
      mentorQuery = mentorQuery.eq('phone', phone);
    }

    const { data: mentors, error: mentorError } = await mentorQuery;

    if (mentorError || !mentors || mentors.length === 0) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    const mentor = mentors[0];

    // Fetch matches for this mentor
    const { data: matches, error: matchesError } = await supabase
      .from('marrai_mentor_matches')
      .select(`
        *,
        idea:marrai_ideas (
          id,
          title,
          problem_statement,
          proposed_solution,
          category,
          location,
          status,
          ai_feasibility_score,
          ai_impact_score,
          roi_time_saved_hours,
          roi_cost_saved_eur,
          alignment,
          created_at
        )
      `)
      .eq('mentor_id', (mentor as any).id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (matchesError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching matches:', matchesError);
      }
      return NextResponse.json(
        { error: 'Failed to fetch matches', details: matchesError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      mentor: {
        id: (mentor as any).id,
        name: (mentor as any).name,
        email: (mentor as any).email,
        phone: (mentor as any).phone,
      },
      matches: matches || [],
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/mentor/matches:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Accept or reject a match
 * Body: { action: 'accept' | 'reject', match_id: string, mentor_response?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, match_id, mentor_response, mentor_email, mentor_phone } = body;

    if (!action || !match_id) {
      return NextResponse.json(
        { error: 'Missing required fields: action, match_id' },
        { status: 400 }
      );
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Verify mentor identity
    if (!mentor_email && !mentor_phone) {
      return NextResponse.json(
        { error: 'Missing mentor identification: email or phone' },
        { status: 400 }
      );
    }

    // Get match to verify mentor
    const { data: match, error: matchError } = await supabase
      .from('marrai_mentor_matches')
      .select('mentor_id, idea_id, status')
      .eq('id', match_id)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Verify mentor
    let mentorQuery = supabase
      .from('marrai_mentors')
      .select('id')
      .eq('id', (match as any).mentor_id)
      .limit(1);

    if (mentor_email) {
      mentorQuery = mentorQuery.eq('email', mentor_email);
    } else if (mentor_phone) {
      mentorQuery = mentorQuery.eq('phone', mentor_phone);
    }

    const { data: mentors, error: mentorError } = await mentorQuery;

    if (mentorError || !mentors || mentors.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized: Mentor identity mismatch' },
        { status: 403 }
      );
    }

    // Update match status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const updatedAt = new Date().toISOString();

    const updateData: any = {
      status: newStatus,
      mentor_responded_at: updatedAt,
      updated_at: updatedAt,
    };

    if (mentor_response) {
      updateData.mentor_response = mentor_response;
    }

    if (action === 'accept') {
      updateData.started_at = updatedAt;
    }

    const { data: updated, error: updateError } = await supabase
      .from('marrai_mentor_matches')
      // @ts-ignore - Supabase type inference issue with .update() chaining
      .update(updateData)
      .eq('id', match_id)
      .select()
      .single();

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating match:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to update match', details: updateError.message },
        { status: 500 }
      );
    }

    // If accepted, update idea status to 'funded' if all matches are accepted
    if (action === 'accept') {
      // Check if this is the first accepted match for this idea
      const { data: acceptedMatches, error: acceptedError } = await supabase
        .from('marrai_mentor_matches')
        .select('id')
        .eq('idea_id', (match as any).idea_id)
        .eq('status', 'accepted');

      if (!acceptedError && acceptedMatches && acceptedMatches.length > 0) {
        // Update idea status to 'funded' if at least one match is accepted
        const { error: ideaUpdateError } = await supabase
          .from('marrai_ideas')
          // @ts-ignore - Supabase type inference issue with .update() chaining
          .update({ status: 'funded' })
          .eq('id', (match as any).idea_id)
          .in('status', ['matched', 'analyzed']); // Only update if still in these states

        if (ideaUpdateError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Warning: Failed to update idea status:', ideaUpdateError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      match: updated,
      action,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/mentor/matches:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

