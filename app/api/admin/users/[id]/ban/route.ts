/**
 * API: Ban/Unban User
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
    const userId = id;
    const { ban } = await request.json();

    const supabase = await createClient();

    // In production, update user table
    // For now, log the action

    // Log audit
    await (supabase as any).from('admin_audit_log').insert({
      id: randomUUID(),
      action: ban ? 'ban_user' : 'unban_user',
      admin_email: 'admin@fikravalley.com',
      target_type: 'user',
      target_id: userId,
      details: `User ${ban ? 'banned' : 'unbanned'}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

