/**
 * One-Click Reply API
 * 
 * Handles one-click accept/reject from email links
 * Low friction: Just email + action
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get('match_id'); // This is actually idea_id
    const action = searchParams.get('action'); // 'accept' or 'reject'
    const email = searchParams.get('email');

    if (!matchId || !action || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters: match_id, action, email' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "accept" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find mentor by email
    const { data: mentor, error: mentorError } = await (supabase as any)
      .from('marrai_mentors')
      .select('id')
      .eq('email', email)
      .single();

    if (mentorError || !mentor) {
      return NextResponse.redirect(
        new URL(`/become-mentor?error=mentor_not_found`, request.url)
      );
    }

    // Find match by idea_id and mentor_id
    const { data: match, error: matchError } = await (supabase as any)
      .from('marrai_mentor_matches')
      .select('id, status')
      .eq('idea_id', matchId)
      .eq('mentor_id', mentor.id)
      .single();

    if (matchError || !match) {
      // Match doesn't exist yet - create it first
      // This can happen if email was sent before match was created
      return NextResponse.redirect(
        new URL(`/matching?mode=mentor&email=${encodeURIComponent(email)}&message=match_not_found`, request.url)
      );
    }

    // Update match status
    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    const { error: updateError } = await (supabase as any)
      .from('marrai_mentor_matches')
      .update({
        status: newStatus,
        mentor_responded_at: new Date().toISOString(),
      })
      .eq('id', match.id);

    if (updateError) {
      console.error('Error updating match:', updateError);
      return NextResponse.redirect(
        new URL(`/matching?mode=mentor&email=${encodeURIComponent(email)}&error=update_failed`, request.url)
      );
    }

    // Redirect to matching page with success message
    const message = action === 'accept' 
      ? 'match_accepted' 
      : 'match_rejected';

    return NextResponse.redirect(
      new URL(`/matching?mode=mentor&email=${encodeURIComponent(email)}&message=${message}`, request.url)
    );
  } catch (error: any) {
    console.error('Error in one-click reply:', error);
    return NextResponse.redirect(
      new URL(`/matching?error=server_error`, request.url)
    );
  }
}

