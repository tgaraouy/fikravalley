/**
 * Cron Job API Route: Cleanup Expired User Data
 * 
 * This endpoint is called by a scheduled cron job to automatically
 * delete expired user data based on data retention policies.
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * Schedule: Run daily (recommended: 2 AM UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SecureUserStorage } from '@/lib/privacy/secure-storage';

/**
 * Verify cron request is authorized
 * 
 * Supports:
 * - Vercel Cron (trusts x-vercel-cron header - only set by Vercel infrastructure)
 * - External cron services (requires Authorization: Bearer <secret> or ?secret= param)
 */
function verifyCronSecret(request: NextRequest): boolean {
  // Check if this is a Vercel Cron request (most secure - header only set by Vercel)
  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    return true; // Vercel Cron is trusted
  }

  // For external cron services, require CRON_SECRET
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('CRON_SECRET environment variable is not set');
    return false;
  }

  // Check Authorization header: Bearer <secret> (for external cron services)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return token === cronSecret;
  }

  // Check secret query parameter (for manual testing and external services)
  const secretParam = request.nextUrl.searchParams.get('secret');
  if (secretParam && secretParam === cronSecret) {
    return true;
  }

  return false;
}

/**
 * GET handler for manual testing
 * POST handler for cron services
 */
export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize storage
    const storage = new SecureUserStorage();

    // Run cleanup (without email notifications for now)
    const deletedCount = await storage.cleanupExpiredData(false);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed successfully`,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron job error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

