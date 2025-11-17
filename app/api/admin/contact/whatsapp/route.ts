/**
 * POST /api/admin/contact/whatsapp
 * 
 * Send WhatsApp message to idea submitter and record contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ideaId, phone, message, method } = body;

    if (!ideaId || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update idea with contact information
    const { error: updateError } = await supabase
      .from('marrai_ideas')
      .update({
        last_contacted_at: new Date().toISOString(),
        contact_method: method || 'whatsapp',
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

    // Note: WhatsApp message should already be sent by the calling component
    // This endpoint just records the contact in the database

    return NextResponse.json({ 
      success: true,
      message: 'WhatsApp contact recorded' 
    });
  } catch (error) {
    console.error('Error in contact WhatsApp API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

