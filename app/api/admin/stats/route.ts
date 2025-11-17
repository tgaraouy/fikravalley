/**
 * API: Admin Stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { MOROCCO_PRIORITIES } from '@/lib/idea-bank/scoring/morocco-priorities';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Total ideas
    const { count: totalIdeas } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true });

    // Ideas by tier - fetch scores separately
    const { data: ideas } = await supabase
      .from('marrai_ideas')
      .select('id');

    const ideaIds = (ideas || []).map((idea: any) => idea.id);
    let scoresMap: Record<string, any> = {};
    
    if (ideaIds.length > 0) {
      const { data: scores } = await supabase
        .from('marrai_idea_scores')
        .select('idea_id, total_score')
        .in('idea_id', ideaIds);
      
      (scores || []).forEach((score: any) => {
        scoresMap[score.idea_id] = score;
      });
    }

    const ideasByTier = {
      exceptional: 0,
      qualified: 0,
      developing: 0,
      pending: 0,
    };

    ideas?.forEach((idea: any) => {
      const score = scoresMap[idea.id]?.total_score || 0;
      if (score >= 30) ideasByTier.exceptional++;
      else if (score >= 25) ideasByTier.qualified++;
      else if (score >= 15) ideasByTier.developing++;
      else ideasByTier.pending++;
    });

    // Receipts
    const { count: totalReceipts } = await supabase
      .from('marrai_idea_receipts')
      .select('*', { count: 'exact', head: true });

    const { count: verifiedReceipts } = await supabase
      .from('marrai_idea_receipts')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    // Funding success (simplified)
    const { count: fundedIdeas } = await supabase
      .from('marrai_ideas')
      .select('*', { count: 'exact', head: true })
      .eq('funding_status', 'funded');

    const fundingSuccessRate = totalIdeas
      ? ((fundedIdeas || 0) / totalIdeas) * 100
      : 0;

    // Users
    const { count: totalUsers } = await supabase
      .from('marrai_secure_users')
      .select('*', { count: 'exact', head: true });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers } = await supabase
      .from('marrai_secure_users')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', thirtyDaysAgo.toISOString());

    // Upvotes
    const { count: totalUpvotes } = await supabase
      .from('marrai_idea_upvotes')
      .select('*', { count: 'exact', head: true });

    // Problem validations
    const { count: problemValidations } = await supabase
      .from('marrai_problem_validations')
      .select('*', { count: 'exact', head: true });

    // Morocco Priority Stats
    const { data: allIdeas } = await supabase
      .from('marrai_ideas')
      .select('id, alignment');

    const priorityCounts: Record<string, number> = {};
    const sdgSet = new Set<number>();
    let totalIdeasWithAlignment = 0;

    (allIdeas || []).forEach((idea: any) => {
      let alignment = null;
      if (idea.alignment) {
        if (typeof idea.alignment === 'string') {
          try {
            alignment = JSON.parse(idea.alignment);
          } catch {
            alignment = null;
          }
        } else {
          alignment = idea.alignment;
        }
      }

      if (alignment && alignment.moroccoPriorities) {
        totalIdeasWithAlignment++;
        alignment.moroccoPriorities.forEach((priorityId: string) => {
          priorityCounts[priorityId] = (priorityCounts[priorityId] || 0) + 1;
        });
      }

      // Collect SDGs
      if (alignment && alignment.sdgTags) {
        alignment.sdgTags.forEach((sdg: number) => {
          sdgSet.add(sdg);
        });
      }
    });

    // Calculate priority stats with percentages
    const priorityStats = MOROCCO_PRIORITIES.map((priority) => {
      const count = priorityCounts[priority.id] || 0;
      const percentage = totalIdeasWithAlignment > 0
        ? (count / totalIdeasWithAlignment) * 100
        : 0;
      return {
        id: priority.id,
        name: priority.name,
        count,
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      };
    }).sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json({
      totalIdeas: totalIdeas || 0,
      ideasByTier,
      totalReceipts: totalReceipts || 0,
      verifiedReceipts: verifiedReceipts || 0,
      fundingSuccessRate,
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalUpvotes: totalUpvotes || 0,
      problemValidations: problemValidations || 0,
      priorityStats,
      sdgCoverage: {
        uniqueSDGsCovered: sdgSet.size,
        totalSDGs: 17,
        coveredSDGs: Array.from(sdgSet).sort((a, b) => a - b),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

