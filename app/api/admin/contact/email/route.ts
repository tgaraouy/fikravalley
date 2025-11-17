/**
 * POST /api/admin/contact/email
 * 
 * Send email to idea submitter and record contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, to, subject, body: emailBody, method } = body;

    if (!ideaId || !to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: In production, integrate with email service (SendGrid, Resend, etc.)
    // For now, we'll just log and update the database
    console.log('Email to send:', { to, subject, body: emailBody });

    // Update idea with contact information
    const { error: updateError } = await supabase
      .from('marrai_ideas')
      .update({
        last_contacted_at: new Date().toISOString(),
        contact_method: method || 'email',
        follow_up_status: 'contacted',
        contact_attempts: supabase.raw('COALESCE(contact_attempts, 0) + 1'),
        next_follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      })
      .eq('id', ideaId);

    if (updateError) {
      console.error('Error updating idea:', updateError);
      return NextResponse.json(
        { error: 'Failed to update contact record' },
        { status: 500 }
      );
    }

    // TODO: Actually send email using your email service
    // Example with a hypothetical email service:
    // await sendEmail({ to, subject, body: emailBody });

    return NextResponse.json({ 
      success: true,
      message: 'Email sent and contact recorded' 
    });
  } catch (error) {
    console.error('Error in contact email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

