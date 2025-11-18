/**
 * API: Get Idea by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = id;
    const supabase = await createClient();

    // Fetch idea
    const { data: idea, error: ideaError } = await (supabase as any)
      .from('marrai_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    const ideaData = idea as any;

    // Fetch scores
    const { data: scores } = await (supabase as any)
      .from('marrai_idea_scores')
      .select('*')
      .eq('idea_id', ideaId)
      .single();

    // Fetch receipts count
    const { count: receiptCount } = await supabase
      .from('marrai_idea_receipts')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .eq('verified', true);

    // Fetch upvotes count
    const { count: upvoteCount } = await supabase
      .from('marrai_idea_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    // Fetch problem validations count
    const { count: validationCount } = await supabase
      .from('marrai_problem_validations')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    // Determine qualification tier
    const scoresData = scores as any;
    const totalScore = scoresData?.stage2_total || scoresData?.stage1_total || 0;
    let qualificationTier: 'exceptional' | 'qualified' | 'developing' | undefined;
    if (totalScore >= 30) qualificationTier = 'exceptional';
    else if (totalScore >= 25) qualificationTier = 'qualified';
    else if (totalScore >= 15) qualificationTier = 'developing';

    return NextResponse.json({
      id: ideaData.id,
      title: ideaData.title,
      title_darija: ideaData.title_darija,
      problem_statement: ideaData.problem_statement,
      proposed_solution: ideaData.proposed_solution,
      current_manual_process: ideaData.current_manual_process,
      location: ideaData.location,
      category: ideaData.category,
      total_score: totalScore,
      stage1_total: scoresData?.stage1_total,
      stage2_total: scoresData?.stage2_total,
      stage1_breakdown: scoresData ? {
        problemStatement: scoresData.stage1_problem || 0,
        asIsAnalysis: scoresData.stage1_as_is || 0,
        benefitStatement: scoresData.stage1_benefits || 0,
        operationalNeeds: scoresData.stage1_operations || 0,
      } : undefined,
      stage2_breakdown: scoresData ? {
        strategicFit: scoresData.stage2_strategic || 0,
        feasibility: scoresData.stage2_feasibility || 0,
        differentiation: scoresData.stage2_differentiation || 0,
        evidenceOfDemand: scoresData.stage2_evidence || 0,
      } : undefined,
      receipt_count: receiptCount || 0,
      upvote_count: upvoteCount || 0,
      problem_validation_count: validationCount || 0,
      sdg_alignment: ideaData.sdg_alignment || [],
      funding_status: ideaData.funding_status,
      qualification_tier: qualificationTier,
      created_at: ideaData.created_at,
      submitter_name: ideaData.submitter_name,
      break_even_months: scoresData?.break_even_months,
    });
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

