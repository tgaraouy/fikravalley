import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAccessApprovalEmail } from '@/lib/email-service';
import crypto from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = id;

    // Update request status to approved
    const { data, error } = await (supabase
      .from('marrai_access_requests') as any)
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        // TODO: Set reviewed_by from Supabase auth session when available
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      console.error('Error approving access request:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'approbation' },
        { status: 500 }
      );
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    // Store token in database (create activation_tokens table or use existing)
    // For now, we'll store it in the access request
    await (supabase
      .from('marrai_access_requests') as any)
      .update({
        activation_token: token,
        activation_expires_at: expiresAt.toISOString(),
      })
      .eq('id', requestId);

    // Generate magic link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/auth/activate?token=${token}&email=${encodeURIComponent(data.email)}`;

    // Send approval email with magic link
    sendAccessApprovalEmail(data.email, data.name, magicLink).catch((err) => {
      console.error('Error sending approval email:', err);
      // Don't fail the request if email fails
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Demande approuvée avec succès',
        request: data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in approve route:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

