import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token et email requis' },
        { status: 400 }
      );
    }

    // Find access request with matching token and email
    const { data: accessRequest, error: findError } = await supabase
      .from('marrai_access_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('status', 'approved')
      .eq('activation_token', token)
      .single();

    if (findError || !accessRequest) {
      return NextResponse.json(
        { error: 'Lien d\'activation invalide ou expiré' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (accessRequest.activation_expires_at) {
      const expiresAt = new Date(accessRequest.activation_expires_at);
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Ce lien d\'activation a expiré. Veuillez demander un nouveau lien.' },
          { status: 400 }
        );
      }
    }

    // Check if already activated
    if (accessRequest.activated_at) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Ce compte a déjà été activé',
          alreadyActivated: true,
        },
        { status: 200 }
      );
    }

    // Mark as activated
    const { error: updateError } = await supabase
      .from('marrai_access_requests')
      .update({
        activated_at: new Date().toISOString(),
      })
      .eq('id', accessRequest.id);

    if (updateError) {
      console.error('Error activating account:', updateError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'activation' },
        { status: 500 }
      );
    }

    // TODO: Create user account in Supabase Auth if needed
    // For now, the access request approval is sufficient

    return NextResponse.json(
      {
        success: true,
        message: 'Compte activé avec succès',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in activate route:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

