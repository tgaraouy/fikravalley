/**
 * API: Validation Payment Tracking
 * 
 * Tracks 3-DH validation payments for ideas
 * Assembly over Addition: Simple payment tracking, no complex checkout flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateValidationPaymentLink } from '@/lib/payments/mobile-money';

/**
 * POST - Create payment link for idea validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea_id, customer_name, amount = 3 } = body;

    if (!idea_id) {
      return NextResponse.json({ error: 'idea_id is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch idea
    const { data: idea, error: ideaError } = await (supabase as any)
      .from('marrai_ideas')
      .select('id, title')
      .eq('id', idea_id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Generate payment link
    const paymentLink = generateValidationPaymentLink(
      idea_id,
      idea.title,
      customer_name,
      amount
    );

    // Extract payment reference from link
    const paymentRefMatch = paymentLink.link.match(/ref=([^&]+)/);
    const paymentRef = paymentRefMatch ? paymentRefMatch[1] : `FV-${idea_id.substring(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

    // Store payment record (for tracking)
    // Note: Table may not exist yet, so we'll handle the error gracefully
    let paymentRecord = null;
    try {
      const { data, error: paymentError } = await (supabase as any)
        .from('marrai_idea_validation_payments')
        .insert({
          idea_id,
          amount,
          payment_provider: paymentLink.provider,
          payment_reference: paymentRef,
          payment_link: paymentLink.link,
          customer_name: customer_name || null,
          status: 'pending',
        })
        .select()
        .single();

      if (!paymentError) {
        paymentRecord = data;
      } else if (process.env.NODE_ENV === 'development') {
        console.error('Error storing payment record (table may not exist yet):', paymentError);
      }
    } catch (err) {
      // Table doesn't exist yet - that's okay, payment link still works
      if (process.env.NODE_ENV === 'development') {
        console.log('Payment tracking table not found - run migration 010_add_validation_payments.sql');
      }
    }

    return NextResponse.json({
      success: true,
      paymentLink: paymentLink.link,
      paymentInstructions: paymentLink.instructions,
      qrCodeData: paymentLink.qr_code_data,
      provider: paymentLink.provider,
      amount,
      payment_id: (paymentRecord as any)?.id || null,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating payment link:', error);
    }
    return NextResponse.json(
      { error: 'Failed to create payment link', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET - Get payment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const payment_id = searchParams.get('payment_id');
    const idea_id = searchParams.get('idea_id');

    if (!payment_id && !idea_id) {
      return NextResponse.json({ error: 'payment_id or idea_id required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Try to fetch payment, but handle if table doesn't exist
    let payment = null;
    try {
      let query = (supabase as any).from('marrai_idea_validation_payments').select('*');

      if (payment_id) {
        query = query.eq('id', payment_id);
      } else if (idea_id) {
        query = query.eq('idea_id', idea_id).order('created_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();
      if (!error && data) {
        payment = data;
      } else {
        // Payment not found
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }
    } catch (err) {
      // Table doesn't exist yet or other error
      if (process.env.NODE_ENV === 'development') {
        console.log('Payment tracking table not found or error:', err);
      }
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching payment:', error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch payment', details: error.message },
      { status: 500 }
    );
  }
}

