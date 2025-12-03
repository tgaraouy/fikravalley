/**
 * Get LinkedIn Mentor Data from Session
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/linkedin/data
 * Get LinkedIn mentor data from session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const mentorDataStr = cookieStore.get('linkedin_mentor_data')?.value;

    if (!mentorDataStr) {
      return NextResponse.json(
        { error: 'No LinkedIn data found' },
        { status: 404 }
      );
    }

    const mentorData = JSON.parse(mentorDataStr);

    return NextResponse.json(mentorData);
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting LinkedIn data:', error);
    }
    return NextResponse.json(
      { error: 'Failed to get LinkedIn data', details: error.message },
      { status: 500 }
    );
  }
}

