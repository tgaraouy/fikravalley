import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code d\'atelier requis' },
        { status: 400 }
      );
    }

    // Find workshop code
    const { data: workshopCode, error } = await (supabase as any)
      .from('marrai_workshop_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !workshopCode) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Code d\'atelier invalide',
        },
        { status: 200 }
      );
    }

    const workshopCodeData = workshopCode as any;

    // Check if code is expired
    if (workshopCodeData.expires_at && new Date(workshopCodeData.expires_at) < new Date()) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Ce code a expiré',
        },
        { status: 200 }
      );
    }

    // Check if code already used
    if (workshopCodeData.used) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Ce code a déjà été utilisé',
        },
        { status: 200 }
      );
    }

    // Mark code as used
    const { error: updateError } = await ((supabase as any)
      .from('marrai_workshop_codes'))
      .update({
        used: true,
        used_at: new Date().toISOString(),
        // TODO: Set used_by from Supabase auth session when available
      })
      .eq('id', workshopCodeData.id);

    if (updateError) {
      console.error('Error updating workshop code:', updateError);
      // Still return success, but log error
    }

    // Auto-approve access request for this email if provided
    if (workshopCodeData.email) {
      const { data: accessRequest } = await (supabase as any)
        .from('marrai_access_requests')
        .select('*')
        .eq('email', workshopCodeData.email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (accessRequest) {
        const accessRequestData = accessRequest as any;
        // Auto-approve and activate
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await (supabase
          .from('marrai_access_requests') as any)
          .update({
            status: 'approved',
            activation_token: token,
            activation_expires_at: expiresAt.toISOString(),
            activated_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', accessRequestData.id);
      }
    }

    return NextResponse.json(
      {
        valid: true,
        workshop_id: workshopCodeData.workshop_id,
        message: 'Code validé avec succès! Votre accès a été activé.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in workshop code verification:', error);
    return NextResponse.json(
      {
        valid: false,
        message: 'Erreur lors de la vérification du code',
      },
      { status: 500 }
    );
  }
}

