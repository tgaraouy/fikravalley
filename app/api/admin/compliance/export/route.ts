/**
 * Admin API: Export Compliance Report
 * 
 * Generates PDF or CSV compliance report
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/privacy/admin-auth';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/compliance/export
 * Export compliance report
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'pdf';

    const supabase = await createClient();

    // Get all compliance data
    const [
      { data: users },
      { data: consents },
      { data: deletionRequests },
      { data: exportRequests },
      { data: accessLogs },
    ] = await Promise.all([
      supabase.from('marrai_secure_users').select('id, created_at, data_retention_expiry').is('deleted_at', null),
      supabase.from('marrai_consents').select('*').order('created_at', { ascending: false }),
      supabase.from('marrai_deletion_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('marrai_export_requests').select('*').order('created_at', { ascending: false }),
      supabase
        .from('admin_access_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000),
    ]);

    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: users?.length || 0,
        totalConsents: consents?.length || 0,
        totalDeletionRequests: deletionRequests?.length || 0,
        totalExportRequests: exportRequests?.length || 0,
        totalAccessLogs: accessLogs?.length || 0,
      },
      consents: consents || [],
      deletionRequests: deletionRequests || [],
      exportRequests: exportRequests || [],
      accessLogs: accessLogs || [],
    };

    if (format === 'csv') {
      // Generate CSV
      const csv = generateCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Generate JSON (PDF generation would require additional library)
      return NextResponse.json(reportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="compliance-report-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Error exporting compliance report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV from report data
 */
function generateCSV(data: any): string {
  const lines: string[] = [];

  // Summary
  lines.push('Rapport de Conformité');
  lines.push(`Généré le: ${data.generatedAt}`);
  lines.push('');
  lines.push('Résumé');
  lines.push(`Utilisateurs totaux,${data.summary.totalUsers}`);
  lines.push(`Consentements totaux,${data.summary.totalConsents}`);
  lines.push(`Demandes de suppression,${data.summary.totalDeletionRequests}`);
  lines.push(`Demandes d'export,${data.summary.totalExportRequests}`);
  lines.push(`Logs d'accès,${data.summary.totalAccessLogs}`);
  lines.push('');

  // Consents
  lines.push('Consentements');
  lines.push('ID,User ID,Type,Accordé,Version,Méthode,Date');
  data.consents.forEach((c: any) => {
    lines.push(`${c.id},${c.user_id},${c.consent_type},${c.granted},${c.consent_version},${c.consent_method},${c.created_at}`);
  });
  lines.push('');

  // Deletion requests
  lines.push('Demandes de Suppression');
  lines.push('ID,User ID,Statut,Demandé le,Programmé le');
  data.deletionRequests.forEach((d: any) => {
    lines.push(`${d.id},${d.user_id},${d.status},${d.requested_at},${d.scheduled_deletion_date}`);
  });

  return lines.join('\n');
}

