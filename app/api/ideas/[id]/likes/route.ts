/**
 * API: Like/Unlike Idea
 * 
 * GET: Get like count and user's like status
 * POST: Toggle like (like if not liked, unlike if liked)
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

    // Get total like count
    const { count, error: countError } = await supabase
      .from('marrai_idea_upvotes')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId);

    if (countError) {
      console.error('Error counting likes:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch likes' },
        { status: 500 }
      );
    }

    // Check if current user has liked (if authenticated)
    // For now, we'll use IP-based tracking for anonymous users
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const { data: userLike } = await supabase
      .from('marrai_idea_upvotes')
      .select('id')
      .eq('idea_id', ideaId)
      .or(`voter_ip.eq.${ip},user_id.is.null`)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      count: count || 0,
      isLiked: !!userLike,
    });
  } catch (error) {
    console.error('Error in likes GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = id;
    const supabase = await createClient();

    // Get user IP for anonymous tracking
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if already liked (by IP or user_id)
    const { data: existing } = await supabase
      .from('marrai_idea_upvotes')
      .select('id')
      .eq('idea_id', ideaId)
      .or(`voter_ip.eq.${ip},user_id.is.null`)
      .maybeSingle();

    if (existing) {
      // Unlike: Delete the upvote
      const { error: deleteError } = await supabase
        .from('marrai_idea_upvotes')
        .delete()
        .eq('id', (existing as any).id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove like' },
          { status: 500 }
        );
      }

      // Get updated count
      const { count } = await supabase
        .from('marrai_idea_upvotes')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', ideaId);

      return NextResponse.json({
        success: true,
        isLiked: false,
        count: count || 0,
      });
    } else {
      // Like: Create new upvote
      const { error: insertError } = await supabase
        .from('marrai_idea_upvotes')
        .insert({
          idea_id: ideaId,
          voter_ip: ip,
          voter_user_agent: userAgent,
        } as any);

      if (insertError) {
        console.error('Error creating like:', insertError);
        return NextResponse.json(
          { error: 'Failed to like idea' },
          { status: 500 }
        );
      }

      // Get updated count
      const { count } = await supabase
        .from('marrai_idea_upvotes')
        .select('*', { count: 'exact', head: true })
        .eq('idea_id', ideaId);

      return NextResponse.json({
        success: true,
        isLiked: true,
        count: count || 0,
      });
    }
  } catch (error) {
    console.error('Error in likes POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

