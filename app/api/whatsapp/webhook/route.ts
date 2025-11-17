/**
 * WhatsApp Webhook Handler
 * 
 * Receives incoming WhatsApp messages and processes them
 * with full privacy compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppPrivacyHandler } from '@/lib/whatsapp/privacy-handler';

/**
 * POST /api/whatsapp/webhook
 * Handle incoming WhatsApp messages
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract message data (format depends on provider)
    // Adjust based on your WhatsApp provider's webhook format
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (!message) {
      // Not a message event, return OK
      return NextResponse.json({ status: 'ok' });
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;

    // Get IP and user agent for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent') || 'WhatsApp';

    // Create message context
    const context = {
      phone: phoneNumber,
      message: messageText,
      messageId,
      timestamp: new Date(),
      ipAddress: ipAddress || undefined,
      userAgent,
    };

    // Process message with privacy handler
    const handler = new WhatsAppPrivacyHandler();
    await handler.handleMessage(context);

    // Return success (WhatsApp expects 200 OK)
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    // Never log PII in errors
    console.error('WhatsApp webhook error:', 'Error processing message');
    
    // Return OK to WhatsApp (don't expose errors)
    return NextResponse.json({ status: 'ok' });
  }
}

/**
 * GET /api/whatsapp/webhook
 * Webhook verification (for some providers)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Verify webhook (adjust based on your provider)
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  
  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

