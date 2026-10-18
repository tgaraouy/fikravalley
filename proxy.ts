/**
 * Read-only freeze (2026-10-17).
 *
 * The app is being rebuilt; this deployment stays up only so existing links
 * resolve. Many API routes write data or call paid AI APIs without an auth
 * check, so: admin surfaces are hidden, and every non-read API call is refused.
 */

import { NextRequest, NextResponse } from 'next/server';

const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return new NextResponse('Not found', { status: 404 });
  }

  if (pathname.startsWith('/api/') && !READ_METHODS.has(request.method)) {
    return NextResponse.json(
      { error: 'Fikra Valley is read-only while it is being rebuilt.' },
      { status: 503 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
