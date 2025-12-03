/**
 * LinkedIn OAuth Callback
 * 
 * Handles callback from LinkedIn OAuth
 */

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchLinkedInProfile } from '@/lib/integrations/linkedin-oauth';
import { parseLinkedInProfile } from '@/lib/integrations/linkedin-parser';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/auth/linkedin/callback
 * Handle LinkedIn OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/become-mentor?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/become-mentor?error=missing_code_or_state', request.url)
      );
    }

    // Verify state (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get('linkedin_oauth_state')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/become-mentor?error=invalid_state', request.url)
      );
    }

    // Clear state cookie
    cookieStore.delete('linkedin_oauth_state');

    // Exchange code for access token
    const tokenResponse = await exchangeCodeForToken(code);

    // Fetch LinkedIn profile
    const linkedinProfile = await fetchLinkedInProfile(tokenResponse.access_token);

    // Fetch email (separate API call)
    let email = '';
    try {
      // Try OpenID Connect userinfo first (includes email)
      const userinfoResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      if (userinfoResponse.ok) {
        const userinfo = await userinfoResponse.json();
        email = userinfo.email || '';
      }

      // Fallback: Try v2 email endpoint
      if (!email) {
        const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            'X-Restli-Protocol-Version': '2.0.0',
          },
        });

        if (emailResponse.ok) {
          const emailData = await emailResponse.json();
          if (emailData.elements && emailData.elements.length > 0) {
            email = emailData.elements[0]['handle~']?.emailAddress || '';
          }
        }
      }
    } catch (emailError) {
      // Email is optional, continue without it
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not fetch LinkedIn email:', emailError);
      }
    }

    // Build LinkedIn URL
    const linkedinUrl = `https://www.linkedin.com/in/${linkedinProfile.id}`;

    // Parse profile to mentor data
    const mentorData = parseLinkedInProfile(linkedinProfile, email, linkedinUrl);

    // Store mentor data in session/cookie for confirmation page
    const sessionData = {
      ...mentorData,
      linkedin_id: linkedinProfile.id,
      source: 'linkedin',
    };

    cookieStore.set('linkedin_mentor_data', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Redirect to confirmation page
    return NextResponse.redirect(
      new URL('/become-mentor?linkedin=success', request.url)
    );
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in LinkedIn callback:', error);
    }
    return NextResponse.redirect(
      new URL(`/become-mentor?error=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}

