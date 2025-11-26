# Agent 6: Notification & Sharing Agent - Implementation Complete ✅

## Overview

Agent 6 handles notifications to mentors and generates social share content when ideas become visible or featured. All actions respect human-in-the-loop requirements.

## Implementation Files

- **Core Agent**: `lib/agents/notification-agent.ts`
- **API Endpoint**: `app/api/agents/notification/route.ts`

## Features Implemented

### ✅ 1. Mentor Notifications

**Trigger**: When `marrai_ideas.visible = true` OR `featured = true`

**Actions**:
- ✅ Fetches all `pending` mentor matches for the idea
- ✅ Sends WhatsApp message (primary method) using existing `sendWhatsAppMessage` function
- ✅ Updates match status from `pending` → `active` after successful notification
- ✅ Email fallback (placeholder - can be integrated with SendGrid)
- ✅ Rate limiting: Max 1 WhatsApp message per mentor per day

**Message Format (Darija)**:
```
مرحبا {mentor.name},

فكرة جديدة ت-match مع خبرتك: {idea.title}

مشكل: {idea.problem_statement}

Score: {idea.matching_score}/10

شوف التفاصيل: https://fikravalley.com/idea/{idea.id}
```

### ✅ 2. Social Share Text Generation

**Twitter** (if featured):
- Auto-generates tweet with idea title, problem statement, URL
- Includes hashtags: `#فكرة_فالوادي #MRE`

**WhatsApp Status**:
- Generates shareable text for users to copy
- Includes idea details and link

### ✅ 3. Mentor Stats Updates

- ✅ Handled via database triggers (already exists in `supabase/migrations/002_add_mentors_and_full_document.sql`)
- ✅ `ideas_matched` incremented when match created
- ✅ `ideas_funded` incremented when match status = 'completed'

### ✅ 4. Human-in-the-Loop Safeguards

- ✅ **Admin Approval Required**: Only notifies if `visible=true` OR `featured=true`
- ✅ **Status Guard**: Checks idea visibility before any action
- ✅ **Rate Limiting**: Prevents spam (1 message per mentor per day)
- ✅ **Error Handling**: Graceful failures, logs errors

### ✅ 5. Safety Checks

- ✅ **PII Protection**: Never exposes email/phone in public view
- ✅ **Admin Approval**: Never sends without admin setting `visible=true`
- ✅ **Rate Limiting**: Enforced per mentor

## API Usage

### Notify Mentors

```typescript
POST /api/agents/notification
{
  "ideaId": "uuid-here",
  "action": "notify"
}

// Response:
{
  "success": true,
  "mentorsNotified": 3,
  "errors": [],
  "socialShareText": {
    "twitter": "...",
    "whatsappStatus": "..."
  }
}
```

### Generate Share Text Only

```typescript
POST /api/agents/notification
{
  "ideaId": "uuid-here",
  "action": "generate_share_text"
}

// Response:
{
  "success": true,
  "socialShareText": {
    "twitter": "...",
    "whatsappStatus": "..."
  }
}
```

## Code Usage

### Direct Function Call

```typescript
import { notifyAboutIdea } from '@/lib/agents/notification-agent';

const result = await notifyAboutIdea(ideaId);
console.log(`Notified ${result.mentorsNotified} mentors`);
```

### Using Agent Class

```typescript
import { NotificationAgent } from '@/lib/agents/notification-agent';

const agent = new NotificationAgent();
const result = await agent.processNotification(ideaId);

// Generate share text only
const shareText = await agent.generateShareText(ideaId);
```

## Integration Points

### When to Call Agent 6

1. **After Admin Sets Idea Visible**:
   ```typescript
   // In admin dashboard when setting visible=true
   await fetch('/api/agents/notification', {
     method: 'POST',
     body: JSON.stringify({ ideaId, action: 'notify' })
   });
   ```

2. **After Idea Becomes Featured**:
   ```typescript
   // When featured=true is set
   await notifyAboutIdea(ideaId);
   ```

3. **Generate Share Text for Dashboard**:
   ```typescript
   // When user wants to share
   const shareText = await notificationAgent.generateShareText(ideaId);
   // Display in UI for user to copy
   ```

## Database Schema

### Required Tables

- `marrai_ideas` (with `visible`, `featured` columns)
- `marrai_mentor_matches` (with `status`, `match_score` columns)
- `marrai_mentors` (with `phone`, `email`, `name` columns)

### Triggers

Mentor stats are updated automatically via database trigger:
- `trigger_update_mentor_stats` (in migration 002)

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `WHATSAPP_API_KEY` (for WhatsApp notifications)
- `WHATSAPP_API_URL` (optional, defaults to 360dialog)

## Future Enhancements

### Email Integration
Currently email fallback is logged but not implemented. To add:

```typescript
import { sendEmail } from '@/lib/email-service';

// In notifyMentors function, after WhatsApp fails:
if (mentor.email) {
  await sendEmail({
    to: mentor.email,
    subject: `New Idea Match: ${idea.title}`,
    html: generateEmailTemplate(mentor, idea)
  });
}
```

### Twitter Auto-Post
Currently generates text only. To auto-post:

```typescript
// Add Twitter API integration
import { TwitterApi } from 'twitter-api-v2';

if (idea.featured && shareText.twitter) {
  await twitterClient.v2.tweet(shareText.twitter);
}
```

### SMS Fallback
For 2G users, add SMS integration:

```typescript
// Add Twilio SMS integration
import twilio from 'twilio';

const client = twilio(accountSid, authToken);
await client.messages.create({
  to: mentor.phone,
  from: twilioNumber,
  body: generateSMSMessage(mentor, idea)
});
```

## Testing

### Test Notification

```bash
curl -X POST http://localhost:3000/api/agents/notification \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "your-idea-id",
    "action": "notify"
  }'
```

### Test Share Text Generation

```bash
curl -X POST http://localhost:3000/api/agents/notification \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "your-idea-id",
    "action": "generate_share_text"
  }'
```

## Status

✅ **Implementation Complete**

All core features from the prompt are implemented:
- ✅ Mentor notifications via WhatsApp
- ✅ Social share text generation
- ✅ Human-in-the-loop safeguards
- ✅ Rate limiting
- ✅ Safety checks
- ✅ Error handling

Ready for production use!

