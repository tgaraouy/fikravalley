/**
 * Admin API: Extend Data Retention
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess, logAdminAccess } from '@/lib/privacy/admin-auth';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';

/**
 * POST /api/admin/users/[id]/retention
 * Extend data retention period
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const { isAdmin, email } = await checkAdminAccess();
    if (!isAdmin || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days, reason } = await request.json();

    if (!days || days < 0) {
      return NextResponse.json({ error: 'Valid days required' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    }

    const { id } = await params;
    const userId = id;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Log extension
    await logAdminAccess(
      email,
      userId,
      'retention_extended',
      reason,
      ipAddress || null,
      userAgent || null,
      { days }
    );

    // Extend retention
    const storage = new SecureUserStorage();
    await storage.setDataRetention(userId, days);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error extending retention:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

