import { NextRequest, NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

/**
 * POST /api/comments
 * Create a new comment for an idea
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea_id, author_name, author_email, comment_text, comment_type } = body;

    // Validate required fields
    if (!idea_id || typeof idea_id !== 'string') {
      return NextResponse.json(
        { error: 'idea_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (!author_name || typeof author_name !== 'string' || author_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'author_name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!comment_text || typeof comment_text !== 'string' || comment_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'comment_text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const validTypes = ['suggestion', 'question', 'concern', 'support', 'technical'];
    if (!comment_type || !validTypes.includes(comment_type)) {
      return NextResponse.json(
        { error: `comment_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email if provided
    if (author_email && typeof author_email === 'string' && author_email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(author_email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Verify idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('marrai_ideas')
      .select('id')
      .eq('id', idea_id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('marrai_idea_comments')
      .insert({
        idea_id,
        author_name: author_name.trim(),
        author_email: author_email?.trim() || null,
        comment_text: comment_text.trim(),
        comment_type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting comment:', insertError);
      return NextResponse.json(
        { error: 'Failed to create comment', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Commentaire ajouté avec succès',
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in comments API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/comments?idea_id=xxx
 * Fetch comments for an idea
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ideaId = searchParams.get('idea_id');

    if (!ideaId) {
      return NextResponse.json(
        { error: 'idea_id query parameter is required' },
        { status: 400 }
      );
    }

    const { data: comments, error: fetchError } = await supabase
      .from('marrai_idea_comments')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching comments:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        comments: comments || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in comments GET API route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

