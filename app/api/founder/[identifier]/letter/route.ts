/**
 * API: Get/Update Founder Letter
 * 
 * GET: Returns founder letter
 * PUT: Updates founder letter
 * 
 * The founder letter is a PR/pitch letter that builds:
 * - Trust
 * - Authenticity
 * - Competence
 * - Consistency
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';

function getSupabase() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !apiKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * GET: Fetch founder letter
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decodedIdentifier = decodeURIComponent(identifier);
    const supabase = getSupabase();

    const isEmail = decodedIdentifier.includes('@');

    // Find founder profile
    let profile;
    if (isEmail) {
      const { data, error } = await supabase
        .from('marrai_founder_profiles')
        .select('*')
        .eq('founder_email', decodedIdentifier)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      profile = data as any;
    } else {
      const { data, error } = await supabase
        .from('marrai_founder_profiles')
        .select('*')
        .eq('founder_name', decodedIdentifier)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      profile = data as any;
    }

    // If no profile exists, create one from existing data
    if (!profile) {
      // Try to get founder info from ideas/claims
      let founderName = decodedIdentifier;
      let founderEmail = isEmail ? decodedIdentifier : null;
      let founderCity = null;

      if (isEmail) {
        // Get from ideas
        const { data: ideaData } = await supabase
          .from('marrai_ideas')
          .select('submitter_name, submitter_email, location')
          .eq('submitter_email', decodedIdentifier)
          .limit(1)
          .single();

        const idea = ideaData as any;
        if (idea) {
          founderName = idea?.submitter_name || decodedIdentifier;
          founderCity = idea?.location || null;
        }
      } else {
        // Get from ideas or claims
        const { data: ideaData } = await supabase
          .from('marrai_ideas')
          .select('submitter_name, submitter_email, location')
          .eq('submitter_name', decodedIdentifier)
          .limit(1)
          .single();

        const idea = ideaData as any;
        if (idea) {
          founderEmail = idea?.submitter_email || null;
          founderCity = idea?.location || null;
        }
      }

      return NextResponse.json({
        founder: {
          name: founderName,
          email: founderEmail,
          city: founderCity,
        },
        letter: null,
        hasLetter: false,
      });
    }

    return NextResponse.json({
      founder: {
        name: (profile as any).founder_name,
        email: (profile as any).founder_email,
        city: (profile as any).founder_city,
        bio: (profile as any).founder_bio,
        linkedin: (profile as any).founder_linkedin,
        website: (profile as any).founder_website,
      },
      letter: (profile as any).founder_letter,
      hasLetter: !!(profile as any).founder_letter,
    });
  } catch (error: any) {
    console.error('Error in GET /api/founder/[identifier]/letter:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update founder letter
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const decodedIdentifier = decodeURIComponent(identifier);
    const supabase = getSupabase();
    const body = await request.json();

    const {
      letter,
      bio,
      linkedin,
      website,
      city,
    } = body;

    if (!letter || typeof letter !== 'string' || letter.trim().length === 0) {
      return NextResponse.json(
        { error: 'Founder letter is required' },
        { status: 400 }
      );
    }

    const isEmail = decodedIdentifier.includes('@');

    // Get founder name if needed
    let founderName = decodedIdentifier;
    let founderEmail = isEmail ? decodedIdentifier : null;

    if (!isEmail) {
      // Try to get email from ideas
      const { data: ideaData } = await supabase
        .from('marrai_ideas')
        .select('submitter_email')
        .eq('submitter_name', decodedIdentifier)
        .limit(1)
        .single();

      const idea = ideaData as any;
      if (idea?.submitter_email) {
        founderEmail = idea.submitter_email;
      }
    } else {
      // Try to get name from ideas
      const { data: ideaData } = await supabase
        .from('marrai_ideas')
        .select('submitter_name')
        .eq('submitter_email', decodedIdentifier)
        .limit(1)
        .single();

      const idea = ideaData as any;
      if (idea?.submitter_name) {
        founderName = idea.submitter_name;
      }
    }

    // Upsert founder profile
    const { data: profile, error } = await supabase
      .from('marrai_founder_profiles')
      .upsert({
        founder_name: founderName,
        founder_email: founderEmail,
        founder_city: city || null,
        founder_letter: letter.trim(),
        founder_bio: bio?.trim() || null,
        founder_linkedin: linkedin?.trim() || null,
        founder_website: website?.trim() || null,
        updated_at: new Date().toISOString(),
      } as any, {
        onConflict: isEmail ? 'founder_email' : 'founder_name',
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting founder profile:', error);
      return NextResponse.json(
        { error: 'Failed to save founder letter', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      founder: {
        name: (profile as any).founder_name,
        email: (profile as any).founder_email,
        city: (profile as any).founder_city,
      },
      letter: (profile as any).founder_letter,
    });
  } catch (error: any) {
    console.error('Error in PUT /api/founder/[identifier]/letter:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

