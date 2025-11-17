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
    const { data: idea, error: ideaError } = await supabase
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

    // Fetch scores
    const { data: scores } = await supabase
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
    const totalScore = scores?.stage2_total || scores?.stage1_total || 0;
    let qualificationTier: 'exceptional' | 'qualified' | 'developing' | undefined;
    if (totalScore >= 30) qualificationTier = 'exceptional';
    else if (totalScore >= 25) qualificationTier = 'qualified';
    else if (totalScore >= 15) qualificationTier = 'developing';

    return NextResponse.json({
      id: idea.id,
      title: idea.title,
      title_darija: idea.title_darija,
      problem_statement: idea.problem_statement,
      proposed_solution: idea.proposed_solution,
      current_manual_process: idea.current_manual_process,
      location: idea.location,
      category: idea.category,
      total_score: totalScore,
      stage1_total: scores?.stage1_total,
      stage2_total: scores?.stage2_total,
      stage1_breakdown: scores ? {
        problemStatement: scores.stage1_problem || 0,
        asIsAnalysis: scores.stage1_as_is || 0,
        benefitStatement: scores.stage1_benefits || 0,
        operationalNeeds: scores.stage1_operations || 0,
      } : undefined,
      stage2_breakdown: scores ? {
        strategicFit: scores.stage2_strategic || 0,
        feasibility: scores.stage2_feasibility || 0,
        differentiation: scores.stage2_differentiation || 0,
        evidenceOfDemand: scores.stage2_evidence || 0,
      } : undefined,
      receipt_count: receiptCount || 0,
      upvote_count: upvoteCount || 0,
      problem_validation_count: validationCount || 0,
      sdg_alignment: idea.sdg_alignment || [],
      funding_status: idea.funding_status,
      qualification_tier: qualificationTier,
      created_at: idea.created_at,
      submitter_name: idea.submitter_name,
      break_even_months: scores?.break_even_months,
    });
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

