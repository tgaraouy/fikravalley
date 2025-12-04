/**
 * Weekly Mentor Digest Cron Job
 * 
 * Runs every Monday at 9 AM UTC
 * Sends weekly digest emails to all active mentors
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateMentorDigest, sendMentorDigestEmail } from '@/lib/ai/mentor-digest';

export async function GET(request: NextRequest) {
  // Verify cron request (Vercel Cron or CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';

  if (!isVercelCron && (!authHeader || !cronSecret || authHeader !== `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Get all active mentors (willing to mentor)
    const { data: mentors, error: mentorsError } = await (supabase as any)
      .from('marrai_mentors')
      .select('id, name, email')
      .eq('willing_to_mentor', true)
      .not('email', 'is', null);

    if (mentorsError) {
      console.error('Error fetching mentors:', mentorsError);
      return NextResponse.json(
        { error: 'Failed to fetch mentors', details: mentorsError.message },
        { status: 500 }
      );
    }

    if (!mentors || mentors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active mentors found',
        sent: 0,
        skipped: 0,
      });
    }

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Generate and send digest for each mentor
    for (const mentor of mentors) {
      try {
        const digest = await generateMentorDigest(mentor.id);

        if (!digest || digest.items.length === 0) {
          skipped++;
          continue;
        }

        const emailSent = await sendMentorDigestEmail(digest);

        if (emailSent) {
          sent++;
        } else {
          skipped++;
          errors.push(`Failed to send email to ${mentor.email}`);
        }
      } catch (error: any) {
        skipped++;
        errors.push(`Error processing mentor ${mentor.id}: ${error.message}`);
        console.error(`Error processing mentor ${mentor.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly mentor digests processed',
      total_mentors: mentors.length,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in send-mentor-digests cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Manual trigger (for testing)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const { mentor_id } = body;

  if (mentor_id) {
    // Send digest for single mentor
    try {
      const digest = await generateMentorDigest(mentor_id);

      if (!digest || digest.items.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No matches found for this mentor',
          digest: null,
        });
      }

      const emailSent = await sendMentorDigestEmail(digest);

      return NextResponse.json({
        success: true,
        message: 'Digest sent',
        digest: {
          mentor_id: digest.mentor_id,
          total_matches: digest.total_matches,
        },
        email_sent: emailSent,
      });
    } catch (error: any) {
      return NextResponse.json(
        { error: 'Failed to send digest', details: error.message },
        { status: 500 }
      );
    }
  }

  // Otherwise, process all mentors (requires auth)
  return GET(request);
}

