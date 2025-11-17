/**
 * Admin API: Batch Delete Expired Data
 * 
 * Deletes all expired user data
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/privacy/admin-auth';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';

/**
 * POST /api/admin/compliance/batch-delete
 * Delete all expired data
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const { isAdmin } = await checkAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storage = new SecureUserStorage();
    const deletedCount = await storage.cleanupExpiredData(false);

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `${deletedCount} utilisateur(s) supprimé(s)`,
    });
  } catch (error) {
    console.error('Error in batch delete:', error);
    return NextResponse.json(
      { error: 'Failed to delete expired data' },
      { status: 500 }
    );
  }
}

