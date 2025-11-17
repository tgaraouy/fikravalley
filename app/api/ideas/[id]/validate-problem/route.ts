/**
 * API: Validate Problem ("I have this problem too")
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

    // Check if already validated (by IP)
    const { data: existing } = await supabase
      .from('marrai_problem_validations')
      .select('id')
      .eq('idea_id', ideaId)
      .eq('validator_ip', ip)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already validated' },
        { status: 400 }
      );
    }

    // Create validation
    const { error } = await supabase.from('marrai_problem_validations').insert({
      id: randomUUID(),
      idea_id: ideaId,
      validator_ip: ip,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error creating validation:', error);
      return NextResponse.json(
        { error: 'Failed to validate problem' },
        { status: 500 }
      );
    }

    // Update idea's pain score (increment)
    await supabase.rpc('increment_pain_score', { idea_id: ideaId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in validate-problem API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

