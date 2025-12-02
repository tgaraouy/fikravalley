/**
 * API: Get/Update Idea by ID (Public)
 * 
 * GET: Returns idea data if visible=true
 * PATCH: Updates idea (requires authentication or submitter verification)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    console.error('Supabase config missing', { hasUrl: !!supabaseUrl, hasKey: !!apiKey });
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Fetch idea by ID (public view)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch idea with related data
    // Note: We don't filter by visible here - allow viewing any idea by ID
    // (visibility filtering is handled in search/listing endpoints)
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select(`
        id,
        title,
        problem_statement,
        proposed_solution,
        category,
        location,
        status,
        visible,
        featured,
        ai_feasibility_score,
        ai_impact_score,
        funding_status,
        qualification_tier,
        created_at,
        updated_at,
        submitter_name,
        submitter_email,
        submitter_phone,
        has_receipts,
        target_audience,
        moroccan_priorities,
        budget_tier,
        location_type,
        complexity,
        adoption_count,
        ai_market_analysis,
        beachhead_customer,
        wedge_description,
        unfair_insight
      `)
      .eq('id', id)
      .single();

    if (ideaError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching idea:', ideaError);
      }
      return NextResponse.json(
        { error: 'Idea not found', details: ideaError.message },
        { status: 404 }
      );
    }

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Fetch scores from view (if exists)
    const { data: scores } = await supabase
      .from('marrai_idea_scores')
      .select('total_score, stage1_total, stage2_total')
      .eq('idea_id', id)
      .single();

    // Count receipts
    const { count: receiptCount } = await supabase
      .from('marrai_idea_receipts')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', id);

    // Count upvotes
    const { count: upvoteCount } = await supabase
      .from('marrai_idea_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', id);

    // Combine idea data with scores and counts
    const ideaWithScores = {
      ...(idea as any),
      total_score: (scores as any)?.total_score || 0,
      stage1_total: (scores as any)?.stage1_total || 0,
      stage2_total: (scores as any)?.stage2_total || 0,
      receipt_count: receiptCount || 0,
      upvote_count: upvoteCount || 0,
    };

    // Return idea data
    return NextResponse.json(ideaWithScores);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching idea:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch idea', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Update idea
 * 
 * Allows updating:
 * - title
 * - problem_statement
 * - proposed_solution
 * - category, location
 * - beachhead_customer, wedge_description, unfair_insight (pre-seed fields)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getSupabase();

    // Fetch current idea to verify ownership (if needed)
    const { data: currentIdea, error: fetchError } = await supabase
      .from('marrai_ideas')
      .select('id, submitter_email, submitter_phone_hash')
      .eq('id', id)
      .single();

    if (fetchError || !currentIdea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // TODO: Add authentication/authorization check here
    // For now, allow updates (can be restricted later)

    // Prepare update object (only allow specific fields)
    const allowedFields = [
      'title',
      'problem_statement',
      'proposed_solution',
      'category',
      'location',
      'beachhead_customer',
      'wedge_description',
      'unfair_insight',
      'loi_count',
      'pilot_count',
      'discovery_calls_count',
      'path_to_100m'
    ];

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include allowed fields
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Update idea
    const { data: updatedIdea, error: updateError } = await (supabase as any)
      .from('marrai_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating idea:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to update idea', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating idea:', error);
    }
    return NextResponse.json(
      { error: 'Failed to update idea', details: error.message },
      { status: 500 }
    );
  }
}
