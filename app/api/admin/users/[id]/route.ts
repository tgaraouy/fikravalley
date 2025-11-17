/**
 * Admin API: Get User Details
 * 
 * Requires password re-entry and access reason
 * Logs all access for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess, logAdminAccess } from '@/lib/privacy/admin-auth';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';
import { ConsentManager } from '@/lib/privacy/consent';

/**
 * POST /api/admin/users/[id]
 * Get user details (requires password and reason)
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

    const { password, reason } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Access reason required' }, { status: 400 });
    }

    // TODO: Verify password (implement proper password verification)
    // For now, we'll just check admin access

    const { id } = await params;
    const userId = id;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Log access
    await logAdminAccess(
      email,
      userId,
      'user_detail_viewed',
      reason,
      ipAddress || null,
      userAgent || null,
      { requiresPassword: true }
    );

    // Get user data
    const storage = new SecureUserStorage();
    const userData = await storage.getUserData(userId);

    // Get submission count
    const supabase = await createClient();
    const { data: submissions } = await supabase
      .from('marrai_ideas')
      .select('id')
      .eq('submitter_email', userData.anonymousEmail);

    // Get consent history
    const consentManager = new ConsentManager();
    const consents = await consentManager.getConsents(userId);

    // Get access logs
    const { data: accessLogs } = await supabase
      .from('admin_access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    return NextResponse.json({
      id: userData.id,
      name: userData.name,
      phone: '***', // Never expose full phone in API response
      anonymousEmail: userData.anonymousEmail,
      submissionCount: submissions?.length || 0,
      consentHistory: consents.map((c) => ({
        id: c.id,
        consentType: c.consentType,
        granted: c.granted,
        consentVersion: c.consentVersion,
        consentMethod: c.consentMethod,
        createdAt: c.createdAt.toISOString(),
      })),
      accessLogs: accessLogs?.map((log) => ({
        id: log.id,
        adminId: log.admin_id,
        action: log.action,
        reason: log.reason,
        timestamp: log.timestamp,
      })) || [],
      dataRetentionExpiry: userData.dataRetentionExpiry.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user data (requires reason)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const { isAdmin, email } = await checkAdminAccess();
    if (!isAdmin || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Deletion reason required' }, { status: 400 });
    }

    const { id } = await params;
    const userId = id;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Log deletion
    await logAdminAccess(
      email,
      userId,
      'user_data_deleted',
      reason,
      ipAddress || null,
      userAgent || null,
      { deletionReason: reason }
    );

    // Delete user data
    const storage = new SecureUserStorage();
    await storage.deleteUserData(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

