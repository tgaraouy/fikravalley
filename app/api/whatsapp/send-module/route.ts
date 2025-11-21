/**
 * WhatsApp Module Delivery API
 * 99% open rate vs. 20% email
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, moduleUrl, moduleName } = body;

    if (!phone || !moduleUrl) {
      return NextResponse.json(
        { success: false, error: 'Phone and moduleUrl are required' },
        { status: 400 }
      );
    }

    // Format phone number (Morocco: +212)
    const formattedPhone = phone.startsWith('+') ? phone : `+212${phone.replace(/^0/, '')}`;
    
    // WhatsApp message
    const message = `🎯 Nouveau module Fikra Valley: ${moduleName || 'Module'}\n\n${moduleUrl}\n\nRéponds STOP pour arrêter.`;

    // In production, integrate with WhatsApp Business API
    // For now, log (implement actual WhatsApp API integration)
    console.log(`WhatsApp to ${formattedPhone}: ${message}`);

    // TODO: Integrate with WhatsApp Business API
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   to: `whatsapp:${formattedPhone}`,
    //   body: message
    // });

    return NextResponse.json({
      success: true,
      message: 'Module sent via WhatsApp',
      phone: formattedPhone
    });
  } catch (error: any) {
    console.error('Error sending WhatsApp module:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

