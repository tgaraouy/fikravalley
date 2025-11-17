# Fikra Labs - Access Control Setup Guide

## Overview

This document explains how to set up and use the access control system for Fikra Labs.

## Database Setup

1. Run the SQL schema in Supabase:
   ```bash
   # Copy contents of docs/access-control-schema.sql
   # Paste into Supabase SQL Editor and execute
   ```

2. Verify tables were created:
   - `marrai_access_requests`
   - `marrai_workshop_codes`

## Access Flow

### For Users (Invitation-Only Phase)

1. User visits `/submit`
2. If no access, sees "Request Access" screen
3. Clicks "Demander l'Accès"
4. Fills out request form:
   - Name
   - Email
   - Organization (optional)
   - User type
   - Reason for participation
   - How they heard about us
5. Request saved to database with status `pending`
6. User sees confirmation message

### For Admins

1. Visit `/admin/access-requests`
2. View pending requests
3. Click "Approve" or "Reject"
4. If rejecting, provide reason
5. User receives email notification (TODO: implement)

### For Approved Users

1. User receives approval email with magic link
2. Clicks link → activates account
3. Can now access `/submit` and submit ideas

## Workshop Code Verification

For workshop attendees:

1. Admin generates workshop codes
2. Codes distributed at registration
3. User enters code on `/verify-workshop-code`
4. Code validated → instant access granted

## API Endpoints

### Access Requests

- `POST /api/access-requests` - Submit access request
- `GET /api/access-requests?status=pending` - Get requests (admin)
- `POST /api/access-requests/[id]/approve` - Approve request
- `POST /api/access-requests/[id]/reject` - Reject request

### Workshop Codes

- `POST /api/workshop-codes/verify` - Verify workshop code
- `GET /api/workshop-codes` - List codes (admin)
- `POST /api/workshop-codes` - Generate codes (admin)

## Environment Variables

Add to `.env.local`:

```env
# Admin emails (comma-separated)
ADMIN_EMAILS=admin1@fikralabs.ma,admin2@fikralabs.ma

# Email service (for sending notifications)
SMTP_HOST=smtp.example.com
SMTP_USER=noreply@fikralabs.ma
SMTP_PASS=your_password
```

## Next Steps

1. ✅ Database schema created
2. ✅ Request access modal implemented
3. ✅ Admin dashboard created
4. ⏳ Email notifications (TODO)
5. ⏳ Workshop code generation UI (TODO)
6. ⏳ Supabase Auth integration (TODO)
7. ⏳ Magic link activation (TODO)

## Testing

1. Visit `/submit` → Should see access required screen
2. Click "Demander l'Accès" → Fill form → Submit
3. Visit `/admin/access-requests` → See pending request
4. Approve request → User should receive email (when implemented)

