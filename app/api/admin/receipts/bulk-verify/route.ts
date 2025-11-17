/**
 * API: Bulk Verify Receipts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { receiptIds, verified } = await request.json();

    if (!receiptIds || !Array.isArray(receiptIds)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('marrai_idea_receipts')
      .update({ verified, verified_at: new Date().toISOString() })
      .in('id', receiptIds);

    if (error) {
      throw error;
    }

    // Log audit
    await supabase.from('admin_audit_log').insert({
      id: randomUUID(),
      action: `bulk_${verified ? 'verify' : 'reject'}_receipts`,
      admin_email: 'admin@fikravalley.com',
      target_type: 'receipts',
      target_id: receiptIds.join(','),
      details: `Bulk ${verified ? 'verified' : 'rejected'} ${receiptIds.length} receipts`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error bulk verifying receipts:', error);
    return NextResponse.json(
      { error: 'Failed to bulk verify receipts' },
      { status: 500 }
    );
  }
}

