/**
 * API: Admin Authentication Check
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');

    if (!adminToken) {
      return NextResponse.json({ authenticated: false });
    }

    // In production, verify JWT token
    // For now, simple check
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = await createClient();

    // Get user from token (simplified)
    // In production, decode JWT and verify

    return NextResponse.json({
      authenticated: true,
      user: {
        email: 'admin@fikravalley.com',
        role: 'admin',
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}

