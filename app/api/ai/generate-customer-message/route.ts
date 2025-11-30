/**
 * API: Generate Customer Validation Message
 * 
 * Assembly over Addition: Pre-drafts WhatsApp messages for idea validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateCustomerMessage } from '@/lib/ai/whatsapp-message-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idea_id, customer_name, payment_link, amount } = body;

    if (!idea_id) {
      return NextResponse.json({ error: 'idea_id is required' }, { status: 400 });
    }

    // Fetch idea from database
    const { createClient } = await import('@/lib/supabase-server');
    const supabase = await createClient();

    const { data: idea, error } = await (supabase as any)
      .from('marrai_ideas')
      .select('id, title, problem_statement')
      .eq('id', idea_id)
      .single();

    if (error || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Generate message with payment link
    const result = await generateCustomerMessage({
      ideaTitle: idea.title,
      problemStatement: idea.problem_statement,
      customerName: customer_name,
      paymentLink: payment_link,
      amount: amount || 3, // Default to 3 DH for validation
      idea_id: idea_id,
    });

    return NextResponse.json({
      message: result.message,
      paymentLink: result.paymentLink,
      paymentInstructions: result.paymentInstructions,
    });
  } catch (error: any) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error generating customer message:', error);
    }
    return NextResponse.json(
      { error: 'Failed to generate message', details: error.message },
      { status: 500 }
    );
  }
}

