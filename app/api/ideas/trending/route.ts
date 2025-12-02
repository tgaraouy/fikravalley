/**
 * API: Trending Ideas
 *
 * GET /api/ideas/trending
 * Returns top ideas by engagement_score (view marrai_idea_engagement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6', 10);

    const supabase = await createClient();

    // Try to query engagement view, fallback to direct table queries if view doesn't exist
    let engagementData: any[] = [];
    let engagementError: any = null;

    // First, try the view
    // Note: Supabase PostgREST may need the view to be exposed via RLS
    const viewResult = await (supabase as any)
      .from('marrai_idea_engagement')
      .select('idea_id, engagement_score, upvotes, receipts, claims')
      .order('engagement_score', { ascending: false })
      .limit(limit * 2);

    if (viewResult.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Engagement view error:', JSON.stringify(viewResult.error, null, 2));
      }
      // View query failed - return empty array gracefully
      return NextResponse.json({ items: [] });
    }
    
    engagementData = (viewResult.data || []).filter((row: any) => (row.engagement_score || 0) > 0);

    if (!engagementData || engagementData.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Get idea IDs
    const ideaIds = engagementData.map((row: any) => row.idea_id).filter((id: any) => id);

    if (ideaIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Fetch full idea data for these IDs
    const { data: ideas, error: ideasError } = await supabase
      .from('marrai_ideas')
      .select('id, title, title_darija, problem_statement, proposed_solution, category, location, created_at, visible, moroccan_priorities, budget_tier, location_type, complexity, sdg_alignment, adoption_count')
      .in('id', ideaIds)
      .eq('visible', true);

    if (ideasError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching ideas:', JSON.stringify(ideasError, null, 2));
      }
      // Return empty array instead of 500 if ideas query fails
      return NextResponse.json({ items: [] });
    }

    if (!ideas || ideas.length === 0) {
      return NextResponse.json({ items: [] });
    }

    // Combine engagement data with idea data
    const engagementMap = new Map(
      engagementData.map((row: any) => [row.idea_id, row])
    );

    const items = (ideas || [])
      .map((idea: any) => {
        const engagement: any = engagementMap.get(idea.id);
        if (!engagement) return null;

        return {
          id: idea.id,
          title: idea.title,
          title_darija: idea.title_darija,
          problem_statement: idea.problem_statement,
          proposed_solution: idea.proposed_solution,
          category: idea.category,
          location: idea.location,
          created_at: idea.created_at,
          engagement_score: engagement?.engagement_score || 0,
          upvote_count: engagement?.upvotes || 0,
          receipt_count: engagement?.receipts || 0,
          claim_count: engagement?.claims || 0,
          moroccan_priorities: idea.moroccan_priorities || [],
          budget_tier: idea.budget_tier,
          location_type: idea.location_type,
          complexity: idea.complexity,
          sdg_alignment: idea.sdg_alignment,
          adoption_count: idea.adoption_count || 0,
        };
      })
      .filter((item: any) => item !== null)
      .sort((a: any, b: any) => b.engagement_score - a.engagement_score)
      .slice(0, limit);

    return NextResponse.json({ items });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/ideas/trending:', error);
      console.error('Error stack:', error?.stack);
    }
    // Return empty array instead of 500 to prevent UI breakage
    return NextResponse.json({ items: [] });
  }
}


