# Submitter Contact & Follow-up System

## Overview

This document explains how the system tracks idea submitters and enables follow-up communication.

## Current System Architecture

### 1. Contact Information Storage

Each idea submission stores contact information directly in the `marrai_ideas` table:

| Field | Type | Description |
|-------|------|-------------|
| `submitter_name` | TEXT | Full name of the person/group who submitted |
| `submitter_email` | TEXT | Email address for follow-up |
| `submitter_phone` | TEXT | Phone number (optional, for WhatsApp) |
| `submitter_type` | TEXT | Type: student, professional, diaspora, entrepreneur, government, researcher, other |
| `submitter_skills` | TEXT[] | Array of skills/interests |
| `user_id` | UUID | Optional link to authenticated user in `marrai_secure_users` |

### 2. Submission Methods

Ideas can be submitted via:
- **Web form** (`/submit`) - Collects contact info in Step 7
- **WhatsApp** - Phone number from WhatsApp message
- **Workshop sessions** - Speaker email from transcript

### 3. User Linking (Optional)

If a user authenticates (via phone number), their `user_id` is linked to the idea:
- Links to `marrai_secure_users` table
- Enables tracking all ideas from same user
- Provides encrypted contact info

## How to Contact Submitters

### Method 1: Direct Contact (Admin Dashboard)

1. **View Idea Details**
   - Go to `/admin`
   - Navigate to "Idea Management"
   - Click on an idea to view details
   - Contact info is displayed in the "Submitter Information" section

2. **Contact Information Available:**
   ```sql
   SELECT 
     submitter_name,
     submitter_email,
     submitter_phone,
     submitter_type,
     submitter_skills
   FROM marrai_ideas
   WHERE id = 'idea-id';
   ```

### Method 2: Query by Email/Phone

```sql
-- Find all ideas from a specific email
SELECT id, title, created_at, status
FROM marrai_ideas
WHERE submitter_email = 'user@example.com';

-- Find all ideas from a specific phone
SELECT id, title, created_at, status
FROM marrai_ideas
WHERE submitter_phone = '212612345678';
```

### Method 3: Bulk Contact (For Follow-ups)

```sql
-- Get all qualified ideas with contact info
SELECT 
  id,
  title,
  submitter_name,
  submitter_email,
  submitter_phone,
  qualification_tier,
  created_at
FROM marrai_ideas
WHERE qualification_tier IN ('exceptional', 'qualified')
  AND status = 'analyzed'
  AND submitter_email IS NOT NULL
ORDER BY created_at DESC;
```

## Follow-up Workflow

### Step 1: Identify Ideas Needing Follow-up

Ideas that typically need follow-up:
- ✅ **Qualified ideas** (score ≥25/40) - For Intilaka PDF generation
- ✅ **Exceptional ideas** (score ≥32/40) - For immediate funding opportunities
- ✅ **Ideas with receipts** - For validation and mentorship
- ✅ **Ideas needing clarification** - For self-ask chain completion

### Step 2: Contact Methods

#### Email Follow-up
```typescript
// Example: Send follow-up email
const idea = await getIdeaById(ideaId);
await sendEmail({
  to: idea.submitter_email,
  subject: `Votre idée "${idea.title}" a été qualifiée!`,
  body: `Bonjour ${idea.submitter_name},...`
});
```

#### WhatsApp Follow-up
```typescript
// Example: Send WhatsApp message
const idea = await getIdeaById(ideaId);
if (idea.submitter_phone) {
  await sendWhatsAppMessage(
    idea.submitter_phone,
    `Bonjour! Votre idée "${idea.title}" a été analysée. Score: ${idea.score}/40.`
  );
}
```

### Step 3: Track Follow-up Status

Add follow-up tracking to ideas:
- `last_contacted_at` - When we last contacted submitter
- `contact_method` - email, whatsapp, phone
- `follow_up_status` - pending, contacted, responded, no_response
- `next_follow_up_date` - When to follow up again

## Privacy Considerations

### GDPR Compliance

1. **Consent Required**
   - Users must consent to being contacted
   - Consent stored in `marrai_consents` table
   - Check consent before contacting

2. **Data Minimization**
   - Only collect necessary contact info
   - Don't store more than needed
   - Respect data retention policies

3. **Right to Withdraw**
   - Users can request deletion
   - Honor unsubscribe requests
   - Remove from follow-up lists if requested

### Secure Contact Info

For authenticated users:
- Contact info is encrypted in `marrai_secure_users`
- Use decryption functions to access
- Never log plain contact info

## Admin Tools Needed

### 1. Contact Submitter Button

Add to admin idea detail page:
```typescript
<Button onClick={() => contactSubmitter(idea.id)}>
  Contact Submitter
</Button>
```

### 2. Bulk Follow-up Tool

For sending follow-ups to multiple submitters:
- Select ideas by status/tier
- Preview email/WhatsApp message
- Send in batch
- Track delivery status

### 3. Follow-up Dashboard

Show:
- Ideas needing follow-up
- Last contact date
- Response status
- Next follow-up date

## Implementation Checklist

- [ ] Add submitter contact form to Step 7 of submission
- [ ] Create admin "Contact Submitter" component
- [ ] Add follow-up tracking fields to `marrai_ideas`
- [ ] Create bulk follow-up tool
- [ ] Add email templates for follow-ups
- [ ] Add WhatsApp templates for follow-ups
- [ ] Create follow-up dashboard
- [ ] Add consent check before contacting
- [ ] Add unsubscribe mechanism
- [ ] Document follow-up workflows

## Example Queries

### Get All Submitters Needing Follow-up

```sql
SELECT DISTINCT
  submitter_email,
  submitter_name,
  submitter_phone,
  COUNT(*) as idea_count,
  MAX(created_at) as latest_submission
FROM marrai_ideas
WHERE status = 'analyzed'
  AND qualification_tier IN ('exceptional', 'qualified')
  AND submitter_email IS NOT NULL
GROUP BY submitter_email, submitter_name, submitter_phone
ORDER BY latest_submission DESC;
```

### Get Ideas by Submitter

```sql
SELECT 
  id,
  title,
  status,
  qualification_tier,
  created_at
FROM marrai_ideas
WHERE submitter_email = 'user@example.com'
ORDER BY created_at DESC;
```

### Track Follow-up Status

```sql
-- Add these columns to marrai_ideas:
ALTER TABLE marrai_ideas
ADD COLUMN last_contacted_at TIMESTAMP,
ADD COLUMN contact_method TEXT,
ADD COLUMN follow_up_status TEXT,
ADD COLUMN next_follow_up_date TIMESTAMP;
```

## Next Steps

1. **Update Submission Form** - Add contact info collection in Step 7
2. **Create Admin Contact Tool** - Easy way to contact submitters
3. **Add Follow-up Tracking** - Track when and how we contacted
4. **Create Email Templates** - Standardized follow-up messages
5. **Add Consent Checks** - Ensure we have permission to contact

