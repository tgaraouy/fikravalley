import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * GET: List ideas with Morocco-first categorization fields
 * POST: Bulk update categorization fields (moroccan_priorities, budget, etc.)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    const supabase = await createClient();

    let query = supabase
      .from('marrai_ideas')
      .select(
        `
        id,
        title,
        problem_statement,
        proposed_solution,
        category,
        location,
        moroccan_priorities,
        sdg_alignment,
        budget_tier,
        location_type,
        complexity,
        adoption_count,
        created_at
      `
      )
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,problem_statement.ilike.%${search}%,proposed_solution.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ ideas: data || [] });
  } catch (error: any) {
    console.error('Error in GET /api/admin/ideas/categorize:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas for categorization', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaIds, moroccan_priorities, budget_tier, location_type, complexity } = body || {};

    if (!Array.isArray(ideaIds) || ideaIds.length === 0) {
      return NextResponse.json(
        { error: 'ideaIds array is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updatePayload: any = {};

    if (Array.isArray(moroccan_priorities)) {
      updatePayload.moroccan_priorities = moroccan_priorities;
    }
    if (budget_tier) {
      updatePayload.budget_tier = budget_tier;
    }
    if (location_type) {
      updatePayload.location_type = location_type;
    }
    if (complexity) {
      updatePayload.complexity = complexity;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('marrai_ideas')
      // @ts-expect-error – Supabase type inference is too strict for partial updates
      .update(updatePayload)
      .in('id', ideaIds);

    if (error) {
      console.error('Error updating ideas categorization:', error);
      return NextResponse.json(
        { error: 'Failed to update ideas', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in POST /api/admin/ideas/categorize:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}


