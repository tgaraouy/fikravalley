/**
 * API: Generate and Send Mentor Digest
 * 
 * Assembly over Addition: ONE weekly email, not a dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMentorDigest, sendMentorDigestEmail } from '@/lib/ai/mentor-digest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mentor_id } = body;

    if (!mentor_id) {
      return NextResponse.json({ error: 'mentor_id is required' }, { status: 400 });
    }

    // Generate digest
    const digest = await generateMentorDigest(mentor_id);

    if (!digest || digest.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches found for this mentor',
        digest: null,
      });
    }

    // Send email
    const emailSent = await sendMentorDigestEmail(digest);

    return NextResponse.json({
      success: true,
      message: 'Digest generated and sent',
      digest: {
        mentor_id: digest.mentor_id,
        total_matches: digest.total_matches,
        items: digest.items.map((item) => ({
          idea_id: item.idea_id,
          idea_title: item.idea_title,
          adopter_name: item.adopter_name,
          blocker: item.blocker,
        })),
      },
      email_sent: emailSent,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating mentor digest:', error);
    }
    return NextResponse.json(
      { error: 'Failed to generate digest', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Generate digest for a mentor (for testing)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mentor_id = searchParams.get('mentor_id');

    if (!mentor_id) {
      return NextResponse.json({ error: 'mentor_id is required' }, { status: 400 });
    }

    const digest = await generateMentorDigest(mentor_id);

    if (!digest) {
      return NextResponse.json({ error: 'No digest found' }, { status: 404 });
    }

    return NextResponse.json({ digest });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching mentor digest:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch digest', details: error.message },
      { status: 500 }
    );
  }
}

