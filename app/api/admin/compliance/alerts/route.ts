/**
 * Admin API: Compliance Alerts
 * 
 * Returns privacy and compliance alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess } from '@/lib/privacy/admin-auth';

export interface ComplianceAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  count?: number;
  actionRequired: boolean;
  createdAt: string;
}

/**
 * GET /api/admin/compliance/alerts
 * Get compliance alerts
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date().toISOString();
    const alerts: ComplianceAlert[] = [];

    // Check for expired data not deleted
    const { count: expiredCount } = await supabase
      .from('marrai_secure_users')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
      .lte('data_retention_expiry', now);

    if (expiredCount && expiredCount > 0) {
      alerts.push({
        id: 'expired-data',
        type: 'error',
        title: 'Données expirées non supprimées',
        message: `${expiredCount} utilisateur(s) ont des données expirées qui n'ont pas été supprimées.`,
        severity: 'high',
        count: expiredCount,
        actionRequired: true,
        createdAt: now,
      });
    }

    // Check for users without consent
    const { data: allUsers } = await (supabase
      .from('marrai_secure_users') as any)
      .select('id')
      .is('deleted_at', null);

    const { data: usersWithConsent } = await (supabase
      .from('marrai_consents') as any)
      .select('user_id')
      .eq('consent_type', 'submission')
      .eq('granted', true);

    const usersWithConsentSet = new Set((usersWithConsent as any[])?.map((c: any) => c.user_id) || []);
    const usersWithoutConsent = ((allUsers as any[]) || []).filter((u: any) => !usersWithConsentSet.has(u.id));

    if (usersWithoutConsent.length > 0) {
      alerts.push({
        id: 'no-consent',
        type: 'warning',
        title: 'Utilisateurs sans consentement',
        message: `${usersWithoutConsent.length} utilisateur(s) n'ont pas de consentement actif.`,
        severity: 'medium',
        count: usersWithoutConsent.length,
        actionRequired: true,
        createdAt: now,
      });
    }

    // Check for failed deletion jobs
    const { data: failedDeletions } = await supabase
      .from('marrai_deletion_requests')
      .select('id, created_at')
      .eq('status', 'confirmed')
      .lt('scheduled_deletion_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (failedDeletions && failedDeletions.length > 0) {
      alerts.push({
        id: 'failed-deletions',
        type: 'error',
        title: 'Suppressions échouées',
        message: `${failedDeletions.length} demande(s) de suppression confirmée(s) mais non exécutée(s).`,
        severity: 'high',
        count: failedDeletions.length,
        actionRequired: true,
        createdAt: now,
      });
    }

    // Check privacy policy age
    const policyVersion = process.env.CONSENT_VERSION || '1.0.0';
    // Assume version format: YYYY.MM.DD or similar
    // This is a simplified check - adjust based on your version format
    alerts.push({
      id: 'policy-age',
      type: 'info',
      title: 'Version de la politique',
      message: `Version actuelle: ${policyVersion}. Vérifiez si une mise à jour est nécessaire.`,
      severity: 'low',
      actionRequired: false,
      createdAt: now,
    });

    // Check deletion request rate
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentDeletions } = await supabase
      .from('marrai_deletion_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo);

    if (recentDeletions && recentDeletions > 10) {
      alerts.push({
        id: 'high-deletion-rate',
        type: 'warning',
        title: 'Taux de suppression élevé',
        message: `${recentDeletions} demandes de suppression dans les 30 derniers jours.`,
        severity: 'medium',
        count: recentDeletions,
        actionRequired: false,
        createdAt: now,
      });
    }

    // Check for suspicious access patterns
    const { data: recentAccess } = await (supabase
      .from('admin_access_logs') as any)
      .select('admin_id, timestamp, action')
      .gte('timestamp', thirtyDaysAgo)
      .order('timestamp', { ascending: false });

    // Group by admin and check for unusual patterns
    const adminAccessCounts: Record<string, number> = {};
    (recentAccess as any[])?.forEach((access: any) => {
      adminAccessCounts[access.admin_id] = (adminAccessCounts[access.admin_id] || 0) + 1;
    });

    const suspiciousAdmins = Object.entries(adminAccessCounts).filter(
      ([_, count]) => count > 100
    );

    if (suspiciousAdmins.length > 0) {
      alerts.push({
        id: 'suspicious-access',
        type: 'warning',
        title: 'Accès suspects détectés',
        message: `${suspiciousAdmins.length} administrateur(s) avec un nombre élevé d'accès.`,
        severity: 'medium',
        count: suspiciousAdmins.length,
        actionRequired: true,
        createdAt: now,
      });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching compliance alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

