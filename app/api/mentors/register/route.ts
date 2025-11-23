/**
 * API: Register Mentor
 * 
 * Allows mentors to register for mentorship program
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Nom et email sont requis' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if mentor already exists
    const { data: existing } = await (supabase as any)
      .from('marrai_mentors')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Un mentor avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Insert mentor
    const { data: mentor, error } = await (supabase as any)
      .from('marrai_mentors')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        location: body.location || null,
        moroccan_city: body.moroccan_city || null,
        current_role: body.current_role || null,
        company: body.company || null,
        years_experience: body.years_experience || 0,
        expertise: body.expertise || [],
        skills: body.skills || [],
        bio: body.bio || null,
        willing_to_mentor: body.willing_to_mentor || true,
        willing_to_cofund: body.willing_to_cofund || false,
        max_cofund_amount: body.max_cofund_amount || null,
        available_hours_per_month: body.available_hours_per_month || 0,
        linkedin_url: body.linkedin_url || null,
        website_url: body.website_url || null,
        chapter: body.chapter || null,
        mgl_member: body.chapter ? true : false,
      })
      .select('id, name, email')
      .single();

    if (error) {
      console.error('Error registering mentor:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'inscription' },
        { status: 500 }
      );
    }

    // TODO: Send welcome email
    // TODO: Notify admin of new mentor registration

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie! Nous vous contacterons bientôt.',
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in mentor registration:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur interne',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

