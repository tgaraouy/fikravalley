/**
 * API: Match Mentor to Idea
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { ideaId, mentorId } = await request.json();

    if (!ideaId || !mentorId) {
      return NextResponse.json(
        { error: 'Idea ID and Mentor ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create mentor match
    const { error } = await supabase.from('marrai_mentor_matches').insert({
      id: randomUUID(),
      idea_id: ideaId,
      mentor_id: mentorId,
      created_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }

    // Log audit
    await supabase.from('admin_audit_log').insert({
      id: randomUUID(),
      action: 'match_mentor',
      admin_email: 'admin@fikravalley.com',
      target_type: 'idea',
      target_id: ideaId,
      details: `Matched mentor ${mentorId} to idea ${ideaId}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error matching mentor:', error);
    return NextResponse.json(
      { error: 'Failed to match mentor' },
      { status: 500 }
    );
  }
}

