import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAccessRejectionEmail } from '@/lib/email-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = id;
    const body = await request.json();
    const { reason } = body;

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Une raison de rejet est requise' },
        { status: 400 }
      );
    }

    // Update request status to rejected
    const { data, error } = await (supabase
      .from('marrai_access_requests') as any)
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        // TODO: Set reviewed_by from session
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error rejecting access request:', error);
      return NextResponse.json(
        { error: 'Erreur lors du rejet' },
        { status: 500 }
      );
    }

    // Send rejection email with reason
    sendAccessRejectionEmail(data.email, data.name, reason).catch((err) => {
      console.error('Error sending rejection email:', err);
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande rejetée',
        request: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reject route:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

