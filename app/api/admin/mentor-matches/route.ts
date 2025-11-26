/**
 * Admin API: Mentor Matches Management
 * 
 * GET: Fetch pending mentor matches grouped by idea
 * POST: Approve/reject matches (bulk operations)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const serviceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Fetch pending mentor matches grouped by idea
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const ideaId = searchParams.get('idea_id');

    // Build query
    let query = supabase
      .from('marrai_mentor_matches')
      .select(`
        *,
        idea:marrai_ideas (
          id,
          title,
          problem_statement,
          proposed_solution,
          category,
          location,
          status
        ),
        mentor:marrai_mentors (
          id,
          name,
          email,
          phone,
          location,
          moroccan_city,
          expertise,
          skills,
          years_experience,
          company,
          willing_to_mentor,
          willing_to_cofund,
          ideas_matched,
          ideas_funded
        )
      `)
      .eq('status', status)
      .order('match_score', { ascending: false });

    if (ideaId) {
      query = query.eq('idea_id', ideaId);
    }

    const { data: matches, error } = await query;

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching mentor matches:', error);
      }
      return NextResponse.json(
        { error: 'Failed to fetch matches', details: error.message },
        { status: 500 }
      );
    }

    // Group by idea_id
    type MatchWithRelations = {
      idea_id: string;
      idea: any;
      [key: string]: any;
    };
    
    const groupedByIdea = (matches || []).reduce((acc, match: MatchWithRelations) => {
      const ideaId = match.idea_id;
      if (!acc[ideaId]) {
        acc[ideaId] = {
          idea: match.idea,
          matches: [],
        };
      }
      acc[ideaId].matches.push(match);
      return acc;
    }, {} as Record<string, { idea: any; matches: any[] }>);

    // Convert to array and sort by idea title
    const result = Object.values(groupedByIdea).map((group) => ({
      idea: group.idea,
      matches: group.matches.sort((a, b) => 
        (b.match_score || 0) - (a.match_score || 0)
      ),
    }));

    return NextResponse.json({ matches: result });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in GET /api/admin/mentor-matches:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST: Approve/reject mentor matches
 * Body: { action: 'approve' | 'reject', match_ids: string[], idea_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, match_ids, idea_id } = body;

    if (!action || !match_ids || !Array.isArray(match_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields: action, match_ids' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    const updatedAt = new Date().toISOString();

    // Update matches
    const { data: updated, error: updateError } = await supabase
      .from('marrai_mentor_matches')
      // @ts-expect-error - Supabase type inference issue with .update() and .in() chaining
      .update({
        status: newStatus,
        updated_at: updatedAt,
      })
      .in('id', match_ids)
      .select();

    if (updateError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating matches:', updateError);
      }
      return NextResponse.json(
        { error: 'Failed to update matches', details: updateError.message },
        { status: 500 }
      );
    }

    // If approving, update idea status to 'matched' if not already
    if (action === 'approve' && idea_id) {
      const { error: ideaUpdateError } = await supabase
        .from('marrai_ideas')
        // @ts-expect-error - Supabase type inference issue with .update() and .eq() chaining
        .update({ status: 'matched' })
        .eq('id', idea_id)
        .eq('status', 'analyzed'); // Only update if still in analyzed state

      if (ideaUpdateError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Warning: Failed to update idea status:', ideaUpdateError);
        }
        // Don't fail the request, just log
      }
    }

    return NextResponse.json({
      success: true,
      updated: updated?.length || 0,
      action,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in POST /api/admin/mentor-matches:', error);
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

