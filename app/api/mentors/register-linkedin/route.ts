/**
 * API: Register Mentor from LinkedIn
 * 
 * Registers mentor using LinkedIn profile data
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

/**
 * POST /api/mentors/register-linkedin
 * Register mentor from LinkedIn data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentorData, additionalData } = body;

    if (!mentorData || !mentorData.email) {
      return NextResponse.json(
        { error: 'Données LinkedIn manquantes' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check if mentor already exists
    const { data: existing } = await (supabase as any)
      .from('marrai_mentors')
      .select('id')
      .eq('email', mentorData.email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Un mentor avec cet email existe déjà' },
        { status: 400 }
      );
    }

    // Prepare mentor data
    const insertData = {
      name: mentorData.name,
      email: mentorData.email,
      phone: additionalData?.phone || null,
      location: mentorData.location || null,
      moroccan_city: mentorData.moroccan_city || null,
      currentrole: mentorData.currentrole || [],
      company: mentorData.company || null,
      years_experience: mentorData.years_experience || 0,
      expertise: mentorData.expertise || [],
      skills: mentorData.skills || [],
      bio: mentorData.bio || null,
      willing_to_mentor: true,
      willing_to_cofund: additionalData?.willing_to_cofund || false,
      max_cofund_amount: additionalData?.max_cofund_amount || null,
      available_hours_per_month: additionalData?.available_hours_per_month || 5, // Default 5 hours
      linkedin_url: mentorData.linkedin_url || null,
      website_url: additionalData?.website_url || null,
      chapter: additionalData?.chapter || null,
      mgl_member: additionalData?.chapter ? true : false,
    };

    // Insert mentor
    const { data: mentor, error } = await (supabase as any)
      .from('marrai_mentors')
      .insert(insertData)
      .select('id, name, email')
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error registering LinkedIn mentor:', error);
      }
      return NextResponse.json(
        { error: 'Erreur lors de l\'inscription', details: error.message },
        { status: 500 }
      );
    }

    // Clear session data
    const cookieStore = await cookies();
    cookieStore.delete('linkedin_mentor_data');

    return NextResponse.json({
      success: true,
      message: 'Inscription réussie! Nous vous contacterons bientôt.',
      mentor: {
        id: mentor.id,
        name: mentor.name,
        email: mentor.email
      }
    }, { status: 201 });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in LinkedIn mentor registration:', error);
    }
    return NextResponse.json(
      {
        error: 'Erreur serveur interne',
        message: error.message || 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

