/**
 * LinkedIn OAuth Routes
 * 
 * Handles LinkedIn OAuth flow for mentor registration
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInAuthUrl, generateState, exchangeCodeForToken, fetchLinkedInProfile, isLinkedInConfigured } from '@/lib/integrations/linkedin-oauth';
import { parseLinkedInProfile } from '@/lib/integrations/linkedin-parser';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/linkedin
 * Initiate LinkedIn OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    // Check if LinkedIn OAuth is configured
    if (!isLinkedInConfigured()) {
      return NextResponse.json(
        { 
          error: 'LinkedIn OAuth is not configured',
          details: 'LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables are required. Please configure LinkedIn OAuth in your environment variables or use the manual registration form instead.'
        },
        { status: 503 }
      );
    }

    // Generate state for CSRF protection
    const state = generateState();
    
    // Store state in cookie (httpOnly, secure in production)
    const cookieStore = await cookies();
    cookieStore.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Get authorization URL
    const authUrl = getLinkedInAuthUrl(state);

    // Redirect to LinkedIn
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error initiating LinkedIn OAuth:', error);
    }
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn authentication', details: error.message },
      { status: 500 }
    );
  }
}

