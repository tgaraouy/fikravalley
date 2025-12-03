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
  
  if (!configured) {
    return NextResponse.json(
      {
        configured: false,
        message: 'LinkedIn OAuth is not configured',
        details: 'LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables are required. Please configure LinkedIn OAuth or use the manual registration form.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    configured: true,
    message: 'LinkedIn OAuth is configured and ready',
  });
}

