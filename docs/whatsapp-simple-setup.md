# Simple WhatsApp Integration Setup Guide

This guide will help you set up a simple WhatsApp integration for idea submission. Users will submit ideas via WhatsApp, then receive a magic link to complete their submission on the website.

## Prerequisites

- A WhatsApp Business API account (any provider that supports WhatsApp Business API)
- Node.js and npm installed
- A JWT secret key for generating secure magic links

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install axios jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

## Step 2: Set Up WhatsApp Business API

1. **Choose a WhatsApp Business API Provider**
   - Any provider that supports WhatsApp Business API
   - Common options include: Meta Business API, Twilio, or other third-party providers
   - Follow your chosen provider's documentation for account setup

2. **Get Your API Credentials**
   - Navigate to your provider's dashboard
   - Find your **API Key** (or Access Token) and **Phone Number ID**
   - Note your API endpoint URL (format varies by provider)

3. **Configure Webhook**
   - In your provider's dashboard, set up a webhook URL
   - Use: `https://your-domain.com/api/whatsapp/webhook`
   - For local development, use [ngrok](https://ngrok.com) to expose your server
   - Configure webhook to receive `messages` and `message_status` events

## Step 3: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and add your credentials:

   ```env
   # WhatsApp Business API
   WHATSAPP_API_URL=https://your-provider-api-endpoint.com/v1
   WHATSAPP_API_KEY=your_api_key_here
   WHATSAPP_PHONE_NUMBER=your_whatsapp_phone_number

   # JWT Secret (generate a strong random string)
   JWT_SECRET=your_very_secure_random_string_here

   # Application URL
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Generate a JWT Secret:**
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Or use an online generator
   # Make sure it's at least 32 characters long
   ```

## Step 4: Create WhatsApp Webhook Endpoint

Create an API route to handle incoming WhatsApp messages:

```typescript
// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature (if your provider requires it)
    // const signature = request.headers.get('x-hub-signature-256');
    // verifySignature(body, signature);

    // Extract message data (format depends on your provider)
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) {
      return NextResponse.json({ status: 'ok' });
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || '';
    const messageId = message.id;

    // Create magic link with JWT token
    const token = jwt.sign(
      { 
        phone: phoneNumber,
        messageId,
        timestamp: Date.now()
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/submit?token=${token}`;

    // Save idea draft to database
    const supabase = await createClient();
    const { error } = await supabase
      .from('marrai_ideas')
      .insert({
        phone_number: phoneNumber,
        raw_message: messageText,
        status: 'draft',
        source: 'whatsapp',
        metadata: { messageId, token }
      });

    if (error) {
      console.error('Error saving idea:', error);
    }

    // Send response with magic link
    await sendWhatsAppMessage(
      phoneNumber,
      `Merci pour votre idée! Cliquez sur ce lien pour compléter votre soumission: ${magicLink}`
    );

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const axios = require('axios');
  
  try {
    await axios.post(
      `${process.env.WHATSAPP_API_URL}/messages`,
      {
        to,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}
```

## Step 5: Create WhatsApp Service Utility

Create a reusable service for sending WhatsApp messages:

```typescript
// lib/whatsapp-service.ts
import axios from 'axios';

interface SendMessageOptions {
  to: string;
  message: string;
  type?: 'text' | 'template';
}

export async function sendWhatsAppMessage({
  to,
  message,
  type = 'text'
}: SendMessageOptions): Promise<void> {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const apiKey = process.env.WHATSAPP_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error('WhatsApp API credentials not configured');
  }

  try {
    const payload = {
      to,
      type,
      ...(type === 'text' 
        ? { text: { body: message } }
        : { template: { name: message, language: { code: 'fr' } } }
      )
    };

    await axios.post(`${apiUrl}/messages`, payload, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('WhatsApp API error:', error);
    throw error;
  }
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming Morocco +212)
  if (cleaned.length === 9 && cleaned.startsWith('6') || cleaned.startsWith('7')) {
    return `212${cleaned}`;
  }
  
  return cleaned;
}
```

## Step 6: Update Submit Page to Handle Magic Links

Update your submit page to handle the JWT token from WhatsApp:

```typescript
// app/submit/page.tsx (excerpt)
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default function SubmitPage() {
  const searchParams = useSearchParams();
  const [whatsappData, setWhatsappData] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || '') as any;
        setWhatsappData(decoded);
        
        // Pre-fill form with WhatsApp message if available
        // ... your form logic here
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
  }, [searchParams]);

  // ... rest of your component
}
```

## Step 7: Configure Webhook in Provider Dashboard

1. **Get your webhook URL:**
   - For production: `https://your-domain.com/api/whatsapp/webhook`
   - For local development, use ngrok:
     ```bash
     ngrok http 3000
     # Use the HTTPS URL provided
     ```

2. **Set up webhook in your provider's dashboard:**
   - Go to your provider's dashboard
   - Navigate to Webhook settings
   - Enter your webhook URL
   - Select events: `messages`, `message_status`
   - Save configuration
   - Note: The exact webhook payload format may vary by provider - adjust the webhook handler accordingly

## Step 8: Test the Integration

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Expose local server (if testing locally):**
   ```bash
   ngrok http 3000
   ```

3. **Send a test WhatsApp message:**
   - Send a message to your WhatsApp Business number
   - You should receive a response with a magic link
   - Click the link to verify it redirects to your submit page

## Workflow Overview

1. **User sends idea via WhatsApp** → Message received by webhook
2. **System creates draft idea** → Saves to database with status 'draft'
3. **System generates magic link** → JWT token with phone number and message ID
4. **System sends magic link** → WhatsApp message with link to complete submission
5. **User clicks link** → Redirected to submit page with pre-filled form
6. **User completes submission** → Idea status updated to 'submitted'

## Security Considerations

1. **Verify Webhook Signatures**
   - Always verify webhook signatures from your provider
   - Prevents unauthorized requests

2. **JWT Token Expiration**
   - Set reasonable expiration times (24 hours recommended)
   - Include timestamp in token payload

3. **Rate Limiting**
   - Implement rate limiting on webhook endpoint
   - Prevent abuse and spam

4. **Phone Number Validation**
   - Validate phone numbers before processing
   - Sanitize input data

## Troubleshooting

### Common Issues

1. **"Webhook not receiving messages"**
   - Verify webhook URL is publicly accessible
   - Check webhook configuration in provider dashboard
   - Ensure HTTPS is used (required by WhatsApp)

2. **"JWT verification failed"**
   - Check that `JWT_SECRET` matches in both webhook and frontend
   - Verify token hasn't expired
   - Ensure token format is correct

3. **"WhatsApp API error"**
   - Verify API credentials are correct
   - Check phone number format (include country code)
   - Ensure API key has proper permissions

4. **"Magic link not working"**
   - Check `NEXT_PUBLIC_APP_URL` is set correctly
   - Verify JWT secret is accessible in frontend (if needed)
   - Check browser console for errors

## Next Steps

- Add message templates for common responses
- Implement conversation state management
- Add analytics and logging
- Create admin dashboard for WhatsApp messages
- Add support for media messages (images, documents)
- Implement message queuing for high volume

## Resources

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [JWT.io](https://jwt.io/) - JWT token debugger
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Provider-Specific Notes

The webhook payload format and API endpoints may vary by provider. Common differences:

- **Meta Business API**: Uses Graph API format with `entry`, `changes`, `value` structure
- **Third-party providers**: May use different payload structures
- **API endpoints**: Format may be `/v1/messages`, `/messages`, or provider-specific paths

Adjust the webhook handler code in Step 4 to match your provider's specific payload format.

