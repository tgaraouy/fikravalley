/**
 * API: Admin Receipts List
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const flagged = searchParams.get('flagged') === 'true';

    const supabase = await createClient();

    let query = supabase
      .from('marrai_idea_receipts')
      .select('*, marrai_ideas(title, submitter_name)')
      .order('created_at', { ascending: false });

    if (flagged) {
      query = query.eq('flagged', true);
    } else {
      query = query.eq('verified', false);
    }

    const { data: receipts, error } = await query;

    if (error) {
      throw error;
    }

    const processedReceipts = (receipts || []).map((receipt: any) => ({
      id: receipt.id,
      idea_id: receipt.idea_id,
      idea_title: receipt.marrai_ideas?.title || 'Unknown',
      type: receipt.type,
      proof_url: receipt.proof_url,
      amount: receipt.amount,
      verified: receipt.verified,
      flagged: receipt.flagged,
      flagged_reason: receipt.flagged_reason,
      created_at: receipt.created_at,
      submitter_name: receipt.marrai_ideas?.submitter_name,
    }));

    return NextResponse.json({ receipts: processedReceipts });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    );
  }
}

