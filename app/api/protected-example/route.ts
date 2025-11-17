import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * Example protected API route
 * Only accessible to authenticated users
 */
export async function GET(request: NextRequest) {
  try {
    // This will redirect to /login if not authenticated
    const user = await requireAuth();

    return NextResponse.json(
      {
        success: true,
        message: 'This is a protected route',
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized',
      },
      { status: 401 }
    );
  }
}

/**
 * Example: Protect with optional auth (returns user if logged in)
 */
export async function POST(request: NextRequest) {
  try {
    const { getCurrentUser } = await import('@/lib/auth-helpers');
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Your protected logic here
    return NextResponse.json(
      {
        success: true,
        message: 'Protected action completed',
        userId: user.id,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

