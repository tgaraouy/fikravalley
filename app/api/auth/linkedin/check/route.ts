/**
 * API: Check if LinkedIn OAuth is configured
 * 
 * GET /api/auth/linkedin/check
 * 
 * Returns whether LinkedIn OAuth is properly configured
 */

import { NextRequest, NextResponse } from 'next/server';
import { isLinkedInConfigured } from '@/lib/integrations/linkedin-oauth';

export async function GET(request: NextRequest) {
  const configured = isLinkedInConfigured();
  
  // Always return 200 - this is a check endpoint, not an error
  // Return configured status in the response body
  return NextResponse.json({
    configured: configured,
    message: configured 
      ? 'LinkedIn OAuth is configured and ready'
      : 'LinkedIn OAuth is not configured',
    details: configured 
      ? undefined
      : 'LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables are required. Please configure LinkedIn OAuth or use the manual registration form.',
  });
}

