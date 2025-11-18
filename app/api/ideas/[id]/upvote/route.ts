/**
 * API: Upvote Idea
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ideaId = id;
    const supabase = await createClient();

    // Get user IP for anonymous tracking
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check if already upvoted (by IP)
    const { data: existing } = await supabase
      .from('marrai_idea_upvotes')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('voter_ip', ip)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already upvoted' },
        { status: 400 }
      );
    }

    // Create upvote
    const { error } = await (supabase as any).from('marrai_idea_upvotes').insert({
      id: randomUUID(),
      idea_id: ideaId,
      voter_ip: ip,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating upvote:', error);
      return NextResponse.json(
        { error: 'Failed to upvote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in upvote API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

