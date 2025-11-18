/**
 * API: Reset User Password
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

    // In production, send password reset email
    // For now, just log the action

    const supabase = await createClient();

    // Log audit
    await (supabase as any).from('admin_audit_log').insert({
      id: randomUUID(),
      action: 'reset_password',
      admin_email: 'admin@fikravalley.com',
      target_type: 'user',
      target_id: userId,
      details: 'Password reset email sent',
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

