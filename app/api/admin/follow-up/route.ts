/**
 * GET /api/admin/follow-up
 * 
 * Get ideas that need follow-up contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'pending';

    // Build query based on filter
    let query = supabase
      .from('marrai_ideas')
      .select('id, title, submitter_name, submitter_email, submitter_phone, qualification_tier, status, follow_up_status, last_contacted_at, next_follow_up_date, contact_attempts, created_at')
      .not('submitter_email', 'is', null)
      .order('created_at', { ascending: false });

    // Apply filter
    if (filter === 'pending') {
      query = query.or('follow_up_status.is.null,follow_up_status.eq.pending');
    } else if (filter === 'contacted') {
      query = query.eq('follow_up_status', 'contacted');
    }
    // 'all' shows everything

    // Only show ideas that should be followed up
    // - Qualified or exceptional ideas
    // - Ideas needing clarification
    // - Ideas with receipts pending verification
    query = query.or('qualification_tier.eq.exceptional,qualification_tier.eq.qualified,qualification_tier.eq.needs_work');

    const { data: ideas, error } = await query;

    if (error) {
      console.error('Error fetching follow-up ideas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ideas' },
        { status: 500 }
      );
    }

    // Get scores for each idea
    const ideaIds = ideas?.map(i => i.id) || [];
    if (ideaIds.length > 0) {
      const { data: scores } = await supabase
        .from('marrai_idea_scores')
        .select('idea_id, total_score, clarity_score')
        .in('idea_id', ideaIds);

      // Merge scores into ideas
      const scoresMap = new Map(scores?.map(s => [s.idea_id, s]) || []);
      ideas?.forEach(idea => {
        const score = scoresMap.get(idea.id);
        if (score) {
          (idea as any).total_score = score.total_score;
          (idea as any).clarity_score = score.clarity_score;
        }
      });
    }

    return NextResponse.json({ ideas: ideas || [] });
  } catch (error) {
    console.error('Error in follow-up API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

