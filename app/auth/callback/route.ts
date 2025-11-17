import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

/**
 * Auth callback route for Supabase
 * Handles OAuth redirects and email confirmation links
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to the requested page or home
  return NextResponse.redirect(new URL(next, request.url));
}

