/**
 * API: Top Ideas
 *
 * GET /api/ideas/top
 * Returns top N ideas by engagement_score
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    const supabase = await createClient();

    // Join engagement view with ideas to get full idea data
    // Filter for visible ideas only and engagement_score > 0
    const { data, error } = await (supabase as any)
      .from('marrai_idea_engagement')
      .select(`
        idea_id,
        engagement_score,
        upvotes,
        receipts,
        claims,
        marrai_ideas!inner(
          id,
          title,
          title_darija,
          problem_statement,
          proposed_solution,
          category,
          location,
          created_at,
          visible,
          moroccan_priorities,
          budget_tier,
          location_type,
          complexity,
          sdg_alignment,
          adoption_count
        )
      `)
      .eq('marrai_ideas.visible', true)
      .gt('engagement_score', 0)
      .order('engagement_score', { ascending: false })
      .limit(limit);

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching top ideas:', error);
      }
      return NextResponse.json(
        { error: 'Failed to fetch top ideas' },
        { status: 500 }
      );
    }

    // Flatten response and include categorization fields
    const items = (data || []).map((row: any) => {
      const idea = row.marrai_ideas;
      return {
        id: idea.id,
        title: idea.title,
        title_darija: idea.title_darija,
        problem_statement: idea.problem_statement,
        proposed_solution: idea.proposed_solution,
        category: idea.category,
        location: idea.location,
        created_at: idea.created_at,
        engagement_score: row.engagement_score,
        upvote_count: row.upvotes,
        receipt_count: row.receipts,
        claim_count: row.claims,
        moroccan_priorities: idea.moroccan_priorities || [],
        budget_tier: idea.budget_tier,
        location_type: idea.location_type,
        complexity: idea.complexity,
        sdg_alignment: idea.sdg_alignment,
        adoption_count: idea.adoption_count || 0,
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/ideas/top:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


