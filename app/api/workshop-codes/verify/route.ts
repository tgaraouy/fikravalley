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
    const { data: workshopCode, error } = await supabase
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

    // Check if code is expired
    if (workshopCode.expires_at && new Date(workshopCode.expires_at) < new Date()) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Ce code a expiré',
        },
        { status: 200 }
      );
    }

    // Check if code already used
    if (workshopCode.used) {
      return NextResponse.json(
        {
          valid: false,
          message: 'Ce code a déjà été utilisé',
        },
        { status: 200 }
      );
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('marrai_workshop_codes')
      .update({
        used: true,
        used_at: new Date().toISOString(),
        // TODO: Set used_by from Supabase auth session when available
      })
      .eq('id', workshopCode.id);

    if (updateError) {
      console.error('Error updating workshop code:', updateError);
      // Still return success, but log error
    }

    // Auto-approve access request for this email if provided
    if (workshopCode.email) {
      const { data: accessRequest } = await supabase
        .from('marrai_access_requests')
        .select('*')
        .eq('email', workshopCode.email.toLowerCase())
        .eq('status', 'pending')
        .single();

      if (accessRequest) {
        // Auto-approve and activate
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await supabase
          .from('marrai_access_requests')
          .update({
            status: 'approved',
            activation_token: token,
            activation_expires_at: expiresAt.toISOString(),
            activated_at: new Date().toISOString(),
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', accessRequest.id);
      }
    }

    return NextResponse.json(
      {
        valid: true,
        workshop_id: workshopCode.workshop_id,
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

