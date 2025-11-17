# WhatsApp Integration Setup Guide

This guide will help you set up WhatsApp integration using Twilio for your Next.js application.

## Prerequisites

- A Twilio account (sign up at [twilio.com](https://www.twilio.com))
- A Redis instance (local or cloud-based like Redis Cloud, Upstash, etc.)
- Node.js and npm installed

## Step 1: Install Dependencies

Install the required packages:

```bash
npm install twilio redis next-auth
```

## Step 2: Set Up Twilio Account

1. **Create a Twilio Account**
   - Go to [twilio.com](https://www.twilio.com) and sign up
   - Complete the account verification process

2. **Get Your Twilio Credentials**
   - Navigate to the [Twilio Console](https://console.twilio.com)
   - Find your **Account SID** and **Auth Token** on the dashboard
   - Copy these values (you'll need them for your `.env.local` file)

3. **Set Up WhatsApp Sandbox (for testing)**
   - Go to [Twilio Console > Messaging > Try it out > Send a WhatsApp message](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
   - Follow the instructions to join the sandbox
   - Note the sandbox WhatsApp number (format: `whatsapp:+14155238886`)

4. **Request Production WhatsApp Number (optional, for production)**
   - Submit a request for a production WhatsApp number through the Twilio Console
   - This requires business verification and approval

## Step 3: Set Up Redis

### Option A: Local Redis (Development)

1. **Install Redis locally:**
   - **macOS**: `brew install redis`
   - **Windows**: Download from [redis.io](https://redis.io/download) or use WSL
   - **Linux**: `sudo apt-get install redis-server` or `sudo yum install redis`

2. **Start Redis:**
   ```bash
   redis-server
   ```

3. **Use this URL in your `.env.local`:**
   ```
   REDIS_URL=redis://localhost:6379
   ```

### Option B: Cloud Redis (Production/Recommended)

1. **Choose a provider:**
   - [Upstash](https://upstash.com) - Free tier available
   - [Redis Cloud](https://redis.com/try-free/) - Free tier available
   - [AWS ElastiCache](https://aws.amazon.com/elasticache/)
   - [Azure Cache for Redis](https://azure.microsoft.com/en-us/services/cache/)

2. **Create a Redis instance** and copy the connection URL

3. **Use the connection URL in your `.env.local`**

## Step 4: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local`** and add your credentials:

   ```env
   # Twilio WhatsApp Integration
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   WHATSAPP_NUMBER=whatsapp:+14155238886

   # Redis Configuration
   REDIS_URL=redis://localhost:6379
   # Or for cloud: REDIS_URL=rediss://default:password@host:port
   ```

## Step 5: Create WhatsApp Webhook Endpoint

Create an API route to handle incoming WhatsApp messages:

```typescript
// app/api/whatsapp/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from 'redis';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageBody = formData.get('Body') as string;
    const from = formData.get('From') as string;

    // Initialize Redis client
    const redis = createClient({ url: process.env.REDIS_URL });
    await redis.connect();

    // Get or create conversation state
    const conversationKey = `whatsapp:${from}`;
    const state = await redis.get(conversationKey);

    // Process message based on conversation state
    // ... your business logic here ...

    // Update conversation state
    await redis.set(conversationKey, JSON.stringify(newState));

    await redis.disconnect();

    // Send response via Twilio
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('Your response message here');

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Step 6: Configure Twilio Webhook

1. **Get your webhook URL:**
   - For local development, use [ngrok](https://ngrok.com) to expose your local server:
     ```bash
     ngrok http 3000
     ```
   - Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

2. **Set up the webhook in Twilio:**
   - Go to [Twilio Console > Messaging > Settings > WhatsApp Sandbox Settings](https://console.twilio.com/us1/develop/sms/settings/whatsapp-sandbox)
   - In "When a message comes in", enter: `https://your-domain.com/api/whatsapp/webhook`
   - Save the configuration

## Step 7: Test the Integration

1. **Start your Next.js development server:**
   ```bash
   npm run dev
   ```

2. **Send a test message:**
   - Send a WhatsApp message to your Twilio sandbox number
   - You should receive a response from your application

## Troubleshooting

### Common Issues

1. **"Invalid webhook URL"**
   - Ensure your webhook URL is publicly accessible (use ngrok for local dev)
   - Verify the URL is HTTPS (required by Twilio)

2. **"Redis connection failed"**
   - Check that Redis is running: `redis-cli ping` (should return `PONG`)
   - Verify your `REDIS_URL` is correct
   - For cloud Redis, ensure your IP is whitelisted

3. **"Twilio authentication failed"**
   - Double-check your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`
   - Ensure there are no extra spaces in your `.env.local` file

4. **"Message not received"**
   - Verify your webhook is configured in Twilio Console
   - Check your server logs for incoming requests
   - Ensure your webhook endpoint returns valid TwiML

## Next Steps

- Implement conversation state management
- Add message templates for common responses
- Integrate with your existing idea submission system
- Set up message queuing for high-volume scenarios
- Add analytics and logging

## Resources

- [Twilio WhatsApp API Documentation](https://www.twilio.com/docs/whatsapp)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Redis Node.js Client](https://github.com/redis/node-redis)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

