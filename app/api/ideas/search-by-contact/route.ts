/**
 * API: Search Ideas by Contact Info
 * 
 * Allows users to find their ideas by email or phone
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone } = body;

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email ou téléphone requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build query
    let query = (supabase as any)
      .from('marrai_ideas')
      .select('id, title, tracking_code, created_at, status, submitter_name')
      .order('created_at', { ascending: false });

    // Filter by email or phone
    if (email) {
      query = query.eq('submitter_email', email);
    }
    
    if (phone) {
      query = query.eq('submitter_phone', phone);
    }

    const { data: ideas, error } = await query;

    if (error) {
      console.error('Error searching ideas:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ideas: ideas || [],
      count: ideas?.length || 0,
    });
  } catch (error) {
    console.error('Error in search-by-contact API:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur interne',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

