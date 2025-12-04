/**
 * API Route: Lean Canvas Operations
 * 
 * GET: Get canvas for an idea
 * POST: Generate/create canvas for an idea
 * PUT: Update canvas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateLeanCanvas } from '@/lib/ai/lean-canvas-generator';
import { scoreCanvas } from '@/lib/ai/canvas-scorer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const ideaId = id;

    // Get latest canvas for idea
    const { data: canvas, error: canvasError } = await (supabase as any)
      .from('marrai_lean_canvas')
      .select('*')
      .eq('idea_id', ideaId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (canvasError && canvasError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is OK
      throw canvasError;
    }

    if (!canvas) {
      return NextResponse.json(
        { error: 'No canvas found for this idea' },
        { status: 404 }
      );
    }

    // Get latest scores for canvas
    const { data: scores, error: scoresError } = await (supabase as any)
      .from('marrai_canvas_scores')
      .select('*')
      .eq('canvas_id', canvas.id)
      .order('scored_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      canvas: {
        id: canvas.id,
        version: canvas.version,
        canvas_data: canvas.canvas_data,
        created_at: canvas.created_at,
        updated_at: canvas.updated_at,
      },
      scores: scores || null,
    });
  } catch (error: any) {
    console.error('Error fetching canvas:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch canvas' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const ideaId = id;

    // Get idea data
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

    // Check if canvas already exists
    const { data: existingCanvas } = await (supabase as any)
      .from('marrai_lean_canvas')
      .select('id, version')
      .eq('idea_id', ideaId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = existingCanvas ? existingCanvas.version + 1 : 1;

    // Generate canvas from idea
    const canvasData = await generateLeanCanvas({
      title: idea.title,
      problem_statement: idea.problem_statement,
      proposed_solution: idea.proposed_solution,
      category: idea.category,
      location: idea.location,
      target_customers: idea.target_customers || null,
      market_size: idea.market_size || null,
      revenue_model: idea.revenue_model || null,
      moroccan_priorities: idea.moroccan_priorities || null,
      budget_tier: idea.budget_tier || null,
    });

    // Create canvas record
    const { data: canvas, error: canvasError } = await (supabase as any)
      .from('marrai_lean_canvas')
      .insert({
        idea_id: ideaId,
        version: nextVersion,
        canvas_data: canvasData,
      })
      .select()
      .single();

    if (canvasError) {
      throw canvasError;
    }

    // Score the canvas
    const scores = await scoreCanvas(canvasData, idea.title);

    // Save scores
    const { data: savedScores, error: scoresError } = await (supabase as any)
      .from('marrai_canvas_scores')
      .insert({
        canvas_id: canvas.id,
        ...scores,
        scored_by: 'ai',
      })
      .select()
      .single();

    if (scoresError) {
      console.error('Error saving scores:', scoresError);
      // Don't fail if scores can't be saved
    }

    // Update idea with canvas reference
    const overallScore = savedScores?.overall_score || 
      (scores.clarity_score + scores.desirability_score + scores.viability_score + 
       scores.feasibility_score + scores.timing_score + scores.defensibility_score + 
       scores.mission_alignment_score) / 7;

    await (supabase as any)
      .from('marrai_ideas')
      .update({
        current_canvas_id: canvas.id,
        canvas_score: Math.round(overallScore * 10) / 10,
      })
      .eq('id', ideaId);

    return NextResponse.json({
      canvas: {
        id: canvas.id,
        version: canvas.version,
        canvas_data: canvas.canvas_data,
        created_at: canvas.created_at,
      },
      scores: savedScores || {
        ...scores,
        overall_score: overallScore,
      },
    });
  } catch (error: any) {
    console.error('Error generating canvas:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate canvas' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    await params; // Await params even if not used
    const { canvas_id, canvas_data } = await request.json();

    if (!canvas_id || !canvas_data) {
      return NextResponse.json(
        { error: 'canvas_id and canvas_data are required' },
        { status: 400 }
      );
    }

    // Update canvas
    const { data: canvas, error: canvasError } = await (supabase as any)
      .from('marrai_lean_canvas')
      .update({
        canvas_data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', canvas_id)
      .select()
      .single();

    if (canvasError) {
      throw canvasError;
    }

    // Re-score the updated canvas
    const scores = await scoreCanvas(canvas_data, canvas.idea_id);

    // Save new scores
    const { data: savedScores } = await (supabase as any)
      .from('marrai_canvas_scores')
      .insert({
        canvas_id: canvas.id,
        ...scores,
        scored_by: 'ai',
      })
      .select()
      .single();

    return NextResponse.json({
      canvas,
      scores: savedScores,
    });
  } catch (error: any) {
    console.error('Error updating canvas:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update canvas' },
      { status: 500 }
    );
  }
}

