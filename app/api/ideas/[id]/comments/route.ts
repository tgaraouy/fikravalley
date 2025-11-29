/**
 * API: Comments for Idea
 * 
 * GET: Get all comments for an idea
 * POST: Create a new comment
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

    // Get all approved comments for this idea
    const { data: comments, error } = await supabase
      .from('marrai_idea_comments')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('approved', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      comments: comments || [],
      count: comments?.length || 0,
    });
  } catch (error) {
    console.error('Error in comments GET API:', error);
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
    const body = await request.json();
    const { content, comment_type, author_name, author_email } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    const validTypes = ['suggestion', 'question', 'concern', 'support', 'technical'];
    const commentType = comment_type || 'support';
    if (!validTypes.includes(commentType)) {
      return NextResponse.json(
        { error: `comment_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id')
      .eq('id', ideaId)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Get user IP for anonymous tracking
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Insert comment
    // Note: The schema uses 'content' not 'comment_text', and 'comment_type' not 'comment_type'
    const { data: comment, error: insertError } = await supabase
      .from('marrai_idea_comments')
      .insert({
        idea_id: ideaId,
        content: content.trim(),
        comment_type: commentType,
        // For anonymous comments, we can store name/email if provided
        // but the schema might need adjustment
      } as any)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error in comments POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

