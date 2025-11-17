import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendAccessRequestConfirmation } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, organization, user_type, reason, how_heard } = body;

    // Validation
    if (!name || !email || !user_type || !reason) {
      return NextResponse.json(
        { error: 'Les champs nom, email, type et raison sont requis' },
        { status: 400 }
      );
    }

    // Check if email already has a pending or approved request
    const { data: existingRequest } = await supabase
      .from('marrai_access_requests')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .in('status', ['pending', 'approved'])
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'Vous avez déjà une demande en attente. Veuillez patienter.' },
          { status: 400 }
        );
      }
      if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { error: 'Votre accès a déjà été approuvé. Vérifiez votre email pour le lien d\'activation.' },
          { status: 400 }
        );
      }
    }

    // Insert access request
    const { data, error } = await supabase
      .from('marrai_access_requests')
      .insert({
        email: email.toLowerCase(),
        name,
        organization: organization || null,
        user_type,
        reason,
        how_heard: how_heard || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting access request:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de la demande' },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    sendAccessRequestConfirmation(data.email, data.name).catch((err) => {
      console.error('Error sending confirmation email:', err);
      // Don't fail the request if email fails
    });

    // TODO: Send email notification to admin

    return NextResponse.json(
      {
        success: true,
        message: 'Demande soumise avec succès',
        request_id: data.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in access-requests POST:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement de la demande' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'pending';
    const email = searchParams.get('email');

    let query = supabase
      .from('marrai_access_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (email) {
      query = query.eq('email', email.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching access requests:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Error in access-requests GET:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

