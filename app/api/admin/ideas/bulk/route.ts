/**
 * API: Bulk Actions on Ideas
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { action, ideaIds } = await request.json();

    if (!action || !ideaIds || !Array.isArray(ideaIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update ideas based on action
    const updates: Record<string, any> = {};
    if (action === 'approve') {
      updates.status = 'approved';
    } else if (action === 'reject') {
      updates.status = 'rejected';
    } else if (action === 'flag') {
      updates.status = 'flagged';
    }

    const { error } = await (supabase as any)
      .from('marrai_ideas')
      .update(updates)
      .in('id', ideaIds);

    if (error) {
      throw error;
    }

    // Log audit entry
    await (supabase as any).from('admin_audit_log').insert({
      id: randomUUID(),
      action: `bulk_${action}`,
      admin_email: 'admin@fikravalley.com', // Get from session
      target_type: 'ideas',
      target_id: ideaIds.join(','),
      details: `Bulk ${action} on ${ideaIds.length} ideas`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}

