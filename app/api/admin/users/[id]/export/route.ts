/**
 * Admin API: Export User Data (GDPR Data Portability)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess, logAdminAccess } from '@/lib/privacy/admin-auth';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';
import { ConsentManager } from '@/lib/privacy/consent';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/users/[id]/export
 * Export all user data in GDPR-compliant format
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    const { isAdmin, email } = await checkAdminAccess();
    if (!isAdmin || !email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = id;
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    // Log export
    await logAdminAccess(
      email,
      userId,
      'user_data_exported',
      'GDPR data portability request',
      ipAddress || null,
      userAgent || null
    );

    // Get user data
    const storage = new SecureUserStorage();
    const userData = await storage.getUserData(userId);

    // Get consent history
    const consentManager = new ConsentManager();
    const consents = await consentManager.getConsents(userId);

    // Get submissions
    const supabase = await createClient();
    const { data: submissions } = await supabase
      .from('marrai_ideas')
      .select('*')
      .eq('submitter_email', userData.anonymousEmail);

    // Get access logs
    const { data: accessLogs } = await supabase
      .from('admin_access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    // Compile export data
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userData.id,
      userData: {
        name: userData.name,
        anonymousEmail: userData.anonymousEmail,
        consentDate: userData.consentDate.toISOString(),
        dataRetentionExpiry: userData.dataRetentionExpiry.toISOString(),
      },
      consents: consents.map((c) => ({
        type: c.consentType,
        granted: c.granted,
        version: c.consentVersion,
        method: c.consentMethod,
        date: c.createdAt.toISOString(),
      })),
      submissions: submissions || [],
      accessLogs: accessLogs?.map((log) => ({
        action: log.action,
        reason: log.reason,
        timestamp: log.timestamp,
        adminId: log.admin_id,
      })) || [],
    };

    // Return as JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

