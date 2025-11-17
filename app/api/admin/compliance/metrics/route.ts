/**
 * Admin API: Compliance Metrics
 * 
 * Returns privacy and compliance metrics for dashboard
 * Requires privacy_officer permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess } from '@/lib/privacy/admin-auth';

/**
 * GET /api/admin/compliance/metrics
 * Get compliance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Check for privacy_officer permission
    // For now, just check admin

    const supabase = await createClient();
    const now = new Date().toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Total users
    const { count: totalUsers } = await supabase
      .from('marrai_secure_users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Users with active consent
    const { data: consents } = await supabase
      .from('marrai_consents')
      .select('user_id, consent_type, granted, created_at')
      .eq('granted', true)
      .order('created_at', { ascending: false });

    const usersWithConsent = new Set(
      consents?.filter((c) => c.consent_type === 'submission').map((c) => c.user_id) || []
    );

    // Users pending deletion
    const { count: pendingDeletions } = await supabase
      .from('marrai_deletion_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Data retention breakdown
    const { data: users } = await supabase
      .from('marrai_secure_users')
      .select('data_retention_expiry, created_at')
      .is('deleted_at', null);

    const retentionBreakdown = {
      expired: 0,
      expires30Days: 0,
      expires90Days: 0,
      expires180Days: 0,
      expiresLater: 0,
    };

    users?.forEach((user) => {
      const expiry = new Date(user.data_retention_expiry);
      const daysUntilExpiry = Math.floor((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) {
        retentionBreakdown.expired++;
      } else if (daysUntilExpiry <= 30) {
        retentionBreakdown.expires30Days++;
      } else if (daysUntilExpiry <= 90) {
        retentionBreakdown.expires90Days++;
      } else if (daysUntilExpiry <= 180) {
        retentionBreakdown.expires180Days++;
      } else {
        retentionBreakdown.expiresLater++;
      }
    });

    // Consent withdrawal rate
    const { data: withdrawals } = await supabase
      .from('marrai_consents')
      .select('created_at')
      .eq('granted', false)
      .gte('created_at', thirtyDaysAgo);

    const { data: totalConsents } = await supabase
      .from('marrai_consents')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo);

    const withdrawalRate =
      totalConsents && totalConsents.length > 0
        ? (withdrawals?.length || 0) / totalConsents.length
        : 0;

    // Export requests (last 30 days)
    const { count: exportRequests } = await supabase
      .from('marrai_export_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    // Deletion requests (last 30 days)
    const { count: deletionRequests } = await supabase
      .from('marrai_deletion_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    // Average data retention period
    const { data: retentionConsents } = await supabase
      .from('marrai_consents')
      .select('metadata')
      .eq('consent_type', 'data_retention')
      .eq('granted', true)
      .not('metadata', 'is', null);

    const retentionDays = retentionConsents
      ?.map((c) => (c.metadata as any)?.retentionDays)
      .filter((d) => typeof d === 'number') || [];

    const avgRetention =
      retentionDays.length > 0
        ? retentionDays.reduce((sum, d) => sum + d, 0) / retentionDays.length
        : 90;

    // Expired data not yet deleted
    const { count: expiredNotDeleted } = await supabase
      .from('marrai_secure_users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .lte('data_retention_expiry', now);

    // Consent rates over time (last 30 days)
    const { data: consentHistory } = await supabase
      .from('marrai_consents')
      .select('created_at, granted, consent_type')
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: true });

    // Group by date
    const consentByDate: Record<string, { granted: number; total: number }> = {};
    consentHistory?.forEach((consent) => {
      const date = consent.created_at.split('T')[0];
      if (!consentByDate[date]) {
        consentByDate[date] = { granted: 0, total: 0 };
      }
      consentByDate[date].total++;
      if (consent.granted) {
        consentByDate[date].granted++;
      }
    });

    const consentTrend = Object.entries(consentByDate).map(([date, data]) => ({
      date,
      rate: data.total > 0 ? (data.granted / data.total) * 100 : 0,
      granted: data.granted,
      total: data.total,
    }));

    // Privacy requests trends
    const { data: privacyRequests } = await supabase
      .from('marrai_audit_logs')
      .select('timestamp, action')
      .in('action', ['export_requested', 'deletion_requested', 'consent_withdrawn'])
      .gte('timestamp', thirtyDaysAgo)
      .order('timestamp', { ascending: true });

    const requestsByDate: Record<string, { exports: number; deletions: number; withdrawals: number }> = {};
    privacyRequests?.forEach((req) => {
      const date = req.timestamp.split('T')[0];
      if (!requestsByDate[date]) {
        requestsByDate[date] = { exports: 0, deletions: 0, withdrawals: 0 };
      }
      if (req.action === 'export_requested') requestsByDate[date].exports++;
      if (req.action === 'deletion_requested') requestsByDate[date].deletions++;
      if (req.action === 'consent_withdrawn') requestsByDate[date].withdrawals++;
    });

    const privacyTrend = Object.entries(requestsByDate).map(([date, data]) => ({
      date,
      ...data,
      total: data.exports + data.deletions + data.withdrawals,
    }));

    // Calculate compliance score (0-100)
    let complianceScore = 100;
    if (expiredNotDeleted && expiredNotDeleted > 0) complianceScore -= 20;
    if (withdrawalRate > 0.1) complianceScore -= 10;
    if (pendingDeletions && pendingDeletions > 7) complianceScore -= 10;
    complianceScore = Math.max(0, complianceScore);

    return NextResponse.json({
      metrics: {
        totalUsers: totalUsers || 0,
        usersWithConsent: usersWithConsent.size,
        pendingDeletions: pendingDeletions || 0,
        retentionBreakdown,
        withdrawalRate: Math.round(withdrawalRate * 100) / 100,
        exportRequests: exportRequests || 0,
        deletionRequests: deletionRequests || 0,
        avgRetentionDays: Math.round(avgRetention),
        expiredNotDeleted: expiredNotDeleted || 0,
        complianceScore,
      },
      trends: {
        consentRates: consentTrend,
        privacyRequests: privacyTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching compliance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

