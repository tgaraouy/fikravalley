/**
 * API: Verify Receipt
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
    const receiptId = id;
    const { verified } = await request.json();

    const supabase = await createClient();

    const { error } = await supabase
      .from('marrai_idea_receipts')
      .update({ verified, verified_at: new Date().toISOString() })
      .eq('id', receiptId);

    if (error) {
      throw error;
    }

    // Log audit
    await supabase.from('admin_audit_log').insert({
      id: randomUUID(),
      action: verified ? 'verify_receipt' : 'reject_receipt',
      admin_email: 'admin@fikravalley.com',
      target_type: 'receipt',
      target_id: receiptId,
      details: `Receipt ${verified ? 'verified' : 'rejected'}`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying receipt:', error);
    return NextResponse.json(
      { error: 'Failed to verify receipt' },
      { status: 500 }
    );
  }
}

