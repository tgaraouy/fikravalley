/**
 * API: Reviews for Idea
 * 
 * GET: Get all reviews for an idea (with stats)
 * POST: Create a new review
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

    // Get all approved reviews for this idea
    const { data: reviews, error } = await supabase
      .from('marrai_idea_reviews')
      .select('*')
      .eq('idea_id', ideaId)
      .eq('approved', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalReviews = reviews?.length || 0;
    const averageRating = totalReviews > 0
      ? (reviews || []).reduce((sum, r: any) => sum + ((r.rating || 0) as number), 0) / totalReviews
      : 0;
    
    const ratingDistribution = {
      5: (reviews || []).filter((r: any) => r.rating === 5).length || 0,
      4: (reviews || []).filter((r: any) => r.rating === 4).length || 0,
      3: (reviews || []).filter((r: any) => r.rating === 3).length || 0,
      2: (reviews || []).filter((r: any) => r.rating === 2).length || 0,
      1: (reviews || []).filter((r: any) => r.rating === 1).length || 0,
    };

    return NextResponse.json({
      reviews: reviews || [],
      stats: {
        total: totalReviews,
        average: Math.round(averageRating * 10) / 10,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error('Error in reviews GET API:', error);
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
    const { rating, title, review_text, review_type, reviewer_name } = body;

    // Validate required fields
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating is required and must be between 1 and 5' },
        { status: 400 }
      );
    }

    const validTypes = ['feasibility', 'impact', 'market', 'technical', 'general'];
    const reviewType = review_type || 'general';
    if (!validTypes.includes(reviewType)) {
      return NextResponse.json(
        { error: `review_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (review_text && review_text.length > 2000) {
      return NextResponse.json(
        { error: 'Review text is too long (max 2000 characters)' },
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
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if user already reviewed (by IP or user_id)
    // For now, allow multiple reviews from same IP (could be different people)
    // But if user_id exists, enforce uniqueness
    const { data: existing } = await supabase
      .from('marrai_idea_reviews')
      .select('id')
      .eq('idea_id', ideaId)
      .is('user_id', null) // Only check for anonymous reviews
      .eq('reviewer_ip', ip)
      .is('deleted_at', null)
      .maybeSingle();

    if (existing) {
      // Update existing review instead of creating duplicate
      const { data: updated, error: updateError } = await (supabase as any)
        .from('marrai_idea_reviews')
        .update({
          rating,
          title: title?.trim() || null,
          review_text: review_text?.trim() || null,
          review_type: reviewType,
          reviewer_name: reviewer_name?.trim() || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', (existing as any).id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating review:', updateError);
        return NextResponse.json(
          { error: 'Failed to update review' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        review: updated,
        message: 'Review updated successfully',
      });
    } else {
      // Create new review
      const { data: review, error: insertError } = await supabase
        .from('marrai_idea_reviews')
        .insert({
          idea_id: ideaId,
          rating,
          title: title?.trim() || null,
          review_text: review_text?.trim() || null,
          review_type: reviewType,
          reviewer_name: reviewer_name?.trim() || null,
          reviewer_ip: ip,
          reviewer_user_agent: userAgent,
        } as any)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting review:', insertError);
        return NextResponse.json(
          { error: 'Failed to create review', details: insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        review,
        message: 'Review added successfully',
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in reviews POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

