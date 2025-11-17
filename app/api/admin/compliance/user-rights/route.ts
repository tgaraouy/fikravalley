/**
 * Admin API: User Rights Fulfillment
 * 
 * Tracks pending user rights requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { checkAdminAccess } from '@/lib/privacy/admin-auth';

/**
 * GET /api/admin/compliance/user-rights
 * Get pending user rights requests
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const now = new Date();

    // Pending deletion requests
    const { data: pendingDeletions } = await supabase
      .from('marrai_deletion_requests')
      .select('id, user_id, requested_at, scheduled_deletion_date')
      .eq('status', 'pending')
      .order('requested_at', { ascending: true });

    // Pending export requests
    const { data: pendingExports } = await supabase
      .from('marrai_export_requests')
      .select('id, user_id, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    // Calculate time to fulfillment
    const deletionRequests = pendingDeletions?.map((req) => {
      const requestedAt = new Date(req.requested_at);
      const daysPending = Math.floor((now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: req.id,
        userId: req.user_id,
        type: 'deletion',
        requestedAt: req.requested_at,
        daysPending,
        targetDays: 30,
        onTrack: daysPending < 30,
      };
    }) || [];

    const exportRequests = pendingExports?.map((req) => {
      const requestedAt = new Date(req.created_at);
      const daysPending = Math.floor((now.getTime() - requestedAt.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: req.id,
        userId: req.user_id,
        type: 'export',
        requestedAt: req.created_at,
        daysPending,
        targetDays: 30,
        onTrack: daysPending < 30,
      };
    }) || [];

    // Get overdue requests
    const overdueDeletions = deletionRequests.filter((r) => r.daysPending >= 30);
    const overdueExports = exportRequests.filter((r) => r.daysPending >= 30);

    // Average fulfillment time
    const { data: completedDeletions } = await supabase
      .from('marrai_deletion_requests')
      .select('requested_at, deleted_at')
      .eq('status', 'completed')
      .not('deleted_at', 'is', null)
      .limit(100);

    const { data: completedExports } = await supabase
      .from('marrai_export_requests')
      .select('created_at, completed_at')
      .eq('status', 'completed')
      .not('completed_at', 'is', null)
      .limit(100);

    const avgDeletionTime =
      completedDeletions && completedDeletions.length > 0
        ? completedDeletions.reduce((sum, req) => {
            const requested = new Date(req.requested_at);
            const deleted = new Date(req.deleted_at!);
            return sum + (deleted.getTime() - requested.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / completedDeletions.length
        : 0;

    const avgExportTime =
      completedExports && completedExports.length > 0
        ? completedExports.reduce((sum, req) => {
            const created = new Date(req.created_at);
            const completed = new Date(req.completed_at!);
            return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / completedExports.length
        : 0;

    return NextResponse.json({
      pending: {
        deletions: deletionRequests,
        exports: exportRequests,
      },
      overdue: {
        deletions: overdueDeletions.length,
        exports: overdueExports.length,
      },
      averageFulfillmentTime: {
        deletions: Math.round(avgDeletionTime),
        exports: Math.round(avgExportTime),
      },
      targetDays: 30,
    });
  } catch (error) {
    console.error('Error fetching user rights data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

