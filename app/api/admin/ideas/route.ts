/**
 * API: Admin Ideas List
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const qualificationTier = searchParams.get('qualificationTier') || '';

    const supabase = await createClient();

    let query = supabase
      .from('marrai_ideas')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,problem_statement.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: ideas, error } = await query;

    if (error) {
      throw error;
    }

    // Fetch scores separately (PostgREST can't auto-join views)
    const ideaIds = (ideas || []).map((idea: any) => idea.id);
    let scoresMap: Record<string, any> = {};
    
    if (ideaIds.length > 0) {
      const { data: scores } = await supabase
        .from('marrai_idea_scores')
        .select('*')
        .in('idea_id', ideaIds);
      
      (scores || []).forEach((score: any) => {
        scoresMap[score.idea_id] = score;
      });
    }

    // Process ideas
    const processedIdeas = (ideas || []).map((idea: any) => {
      const scores = scoresMap[idea.id] || {};
      const totalScore = scores.total_score || scores.stage2_total || scores.stage1_total || 0;

      let qualificationTier: 'exceptional' | 'qualified' | 'developing' | 'pending' | undefined;
      if (totalScore >= 30) qualificationTier = 'exceptional';
      else if (totalScore >= 25) qualificationTier = 'qualified';
      else if (totalScore >= 15) qualificationTier = 'developing';
      else qualificationTier = 'pending';

      return {
        id: idea.id,
        title: idea.title,
        submitter_name: idea.submitter_name,
        location: idea.location,
        category: idea.category,
        stage1_total: scores.stage1_total,
        stage2_total: scores.stage2_total,
        total_score: totalScore,
        qualification_tier: qualificationTier,
        receipt_count: idea.receipt_count || 0,
        upvote_count: idea.upvote_count || 0,
        funding_status: idea.funding_status,
        created_at: idea.created_at,
        status: idea.status || 'pending',
      };
    });

    // Filter by qualification tier if specified
    let filtered = processedIdeas;
    if (qualificationTier) {
      filtered = processedIdeas.filter((i) => i.qualification_tier === qualificationTier);
    }

    return NextResponse.json({ ideas: filtered });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

