# Privacy Checklist - Pre-Launch Verification

This document outlines all privacy requirements that must be verified before launching the application.

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Encryption
ENCRYPTION_KEY=your-32-byte-encryption-key-here-keep-secret
ENCRYPTION_ALGORITHM=aes-256-gcm

# Privacy
CONSENT_VERSION=1.0.0
DATA_RETENTION_DAYS=90
PRIVACY_OFFICER_EMAIL=privacy@fikravalley.com

# Audit
AUDIT_LOG_RETENTION=2555  # 7 years in days
ENABLE_SENSITIVE_DATA_LOGGING=false

# Security
SESSION_TIMEOUT_MINUTES=15
REQUIRE_2FA_FOR_PII=true
MAX_LOGIN_ATTEMPTS=3

# WhatsApp
WHATSAPP_API_URL=https://your-provider-api-endpoint.com/v1
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token

# JWT
JWT_SECRET=your_jwt_secret_key_here_min_32_chars

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron
CRON_SECRET=your_cron_secret_key_here
```

## ✅ Legal Requirements

### 1. Privacy Policy
- ✅ **Status**: Implemented
- **Location**: `/app/privacy/page.tsx`
- **Languages**: French & Arabic
- **Compliance**: GDPR & Morocco Law 09-08
- **Action**: Verify content is complete and accurate

### 2. Terms of Service
- ⚠️ **Status**: To be created
- **Action**: Create `/app/terms/page.tsx` with terms of service

### 3. Cookie Policy
- ⚠️ **Status**: To be created (if using cookies)
- **Action**: Create `/app/cookies/page.tsx` if website uses cookies

### 4. Consent Forms
- ✅ **Status**: Implemented
- **Location**: `/components/ConsentDialog.tsx`
- **Features**: Required/optional consents, data retention choices

### 5. Data Retention Policy
- ✅ **Status**: Implemented
- **Default**: 90 days (configurable via `DATA_RETENTION_DAYS`)
- **Location**: `lib/privacy/secure-storage.ts`

### 6. Privacy Officer
- ✅ **Status**: Configurable
- **Environment Variable**: `PRIVACY_OFFICER_EMAIL`
- **Action**: Set email address in environment variables

### 7. Incident Response Plan
- ✅ **Status**: Implemented
- **Location**: `/app/admin/privacy/compliance` (incidents tracking)
- **Features**: 72-hour notification countdown, remediation tracking

## 🔧 Technical Requirements

### 1. Database Encryption at Rest
- ⚠️ **Status**: Infrastructure level
- **Action**: Verify Supabase encryption is enabled

### 2. HTTPS Everywhere
- ⚠️ **Status**: Infrastructure level
- **Action**: Verify SSL certificate is active, HSTS headers enabled

### 3. Phone Number Hashing
- ✅ **Status**: Implemented
- **Location**: `lib/privacy/secure-storage.ts`
- **Method**: bcrypt (salt rounds: 12)
- **Usage**: Lookup only, never stored in plaintext

### 4. Sensitive Field Encryption
- ✅ **Status**: Implemented
- **Location**: `lib/privacy/secure-storage.ts`
- **Method**: AES-256-GCM
- **Fields**: Name, problem description, location

### 5. Audit Logging
- ✅ **Status**: Implemented
- **Location**: `audit_logs` table
- **Features**: All PII access, data exports, deletions logged

### 6. Auto-Deletion Scheduled Jobs
- ✅ **Status**: Implemented
- **Location**: `/app/api/cron/cleanup-expired-data/route.ts`
- **Schedule**: Daily at 2 AM (configurable in `vercel.json`)

### 7. Access Controls
- ✅ **Status**: Implemented
- **Location**: `lib/privacy/admin-auth.ts`
- **Features**: Role-based access, RLS policies

### 8. 2FA for Admin Accounts
- ⚠️ **Status**: To be implemented
- **Action**: Add 2FA for sensitive admin operations

### 9. Rate Limiting
- ✅ **Status**: Implemented
- **Location**: `lib/whatsapp/privacy-handler.ts`
- **Limit**: 10 messages per minute

### 10. Input Validation
- ✅ **Status**: Implemented
- **Location**: `lib/whatsapp/privacy-handler.ts` (sanitizeInput)
- **Features**: HTML/script injection prevention, length limits

## 📋 Process Requirements

### 1. Consent Collection Workflow
- ✅ **Status**: Implemented
- **Location**: `lib/whatsapp/privacy-handler.ts`
- **Features**: Multi-stage consent collection, explicit "OUI" required

### 2. Deletion Process
- ✅ **Status**: Implemented
- **Location**: `/app/api/privacy/delete/route.ts`
- **Features**: 7-day grace period, verification code, cancellation

### 3. Export Process
- ✅ **Status**: Implemented
- **Location**: `/app/api/privacy/export/route.ts`
- **Features**: OTP verification, rate limiting, JSON/PDF export

### 4. Team Training
- ⚠️ **Status**: Manual process
- **Action**: Train team on privacy practices

### 5. Incident Response Drills
- ⚠️ **Status**: Manual process
- **Action**: Conduct incident response drills

### 6. Regular Backups
- ⚠️ **Status**: Infrastructure level
- **Action**: Verify Supabase backups are configured and encrypted

### 7. Backup Restoration
- ⚠️ **Status**: Infrastructure level
- **Action**: Test backup restoration process

## 👤 User Rights Requirements

### 1. Easy Data Deletion
- ✅ **Status**: Implemented
- **Location**: `/app/api/privacy/delete/route.ts`, `/components/PrivacyControls.tsx`
- **Features**: One-click deletion, 7-day grace period

### 2. Easy Data Export
- ✅ **Status**: Implemented
- **Location**: `/app/api/privacy/export/route.ts`, `/components/PrivacyControls.tsx`
- **Features**: JSON/PDF export, OTP verification

### 3. Easy Data Update
- ⚠️ **Status**: To be implemented
- **Action**: Create endpoint for users to update their data

### 4. Easy Consent Withdrawal
- ✅ **Status**: Implemented
- **Location**: `lib/privacy/consent.ts` (withdrawConsent)
- **Features**: Per-consent-type withdrawal

### 5. Response Within 30 Days
- ✅ **Status**: Tracked
- **Location**: `/app/admin/privacy/compliance` (user rights tracking)
- **Features**: Average fulfillment time, overdue alerts

## 🛡️ Security Best Practices

### Encryption

#### At Rest:
- ✅ Database: Full disk encryption (Supabase)
- ✅ Backups: Encrypted before storage
- ✅ Sensitive fields: AES-256-GCM

#### In Transit:
- ⚠️ HTTPS/TLS 1.3: Verify SSL certificate
- ⚠️ No HTTP allowed: Configure redirects
- ⚠️ HSTS headers: Enable in Vercel/Next.js config

#### Phone Numbers:
- ✅ Never store plaintext
- ✅ Hash with bcrypt (salt rounds: 12)
- ✅ Use for lookup only
- ✅ Display last 4 digits only (in admin dashboard)

### Access Control

#### Admin Roles:
- ✅ `super_admin`: Full access
- ✅ `privacy_officer`: Compliance access
- ⚠️ `support`: Limited user data access (to be implemented)
- ⚠️ `analyst`: Anonymized data only (to be implemented)

#### Each Action Requires:
- ✅ Authentication
- ✅ Authorization (role check)
- ✅ Audit logging
- ✅ Rate limiting

### Data Minimization

#### Only Collect:
- ✅ First name (not full name)
- ✅ City (not full address)
- ✅ Problem description
- ✅ Phone (hashed immediately)

#### Don't Collect:
- ✅ Birth date (not collected)
- ✅ ID numbers (not collected)
- ✅ Full address (not collected)
- ✅ Email (generate anonymous)
- ✅ Payment info (not collected)

### Audit Logging

#### Log Every:
- ✅ PII access
- ✅ Data export
- ✅ Data deletion
- ✅ Consent change
- ✅ Privacy policy view
- ✅ Admin action

#### Include:
- ✅ Who (user ID)
- ✅ What (action)
- ✅ When (timestamp)
- ✅ Where (IP address)
- ✅ Why (reason, if applicable)

## 📱 Privacy-First WhatsApp Flow

### Complete Secure Flow:

1. **User messages**: "Hello"

2. **Bot checks consent status**
   → No consent yet

3. **Bot sends**:
   ```
   Bienvenue! 🏔️
   
   Avant de commencer, veuillez lire notre politique de confidentialité:
   👉 fikravalley.com/privacy
   
   Nous collecterons:
   • Prénom
   • Ville
   • Description du problème
   • Numéro WhatsApp (chiffré)
   
   Vos données sont:
   ✅ Chiffrées (AES-256)
   ✅ Supprimées après 90 jours
   ✅ Jamais partagées avec des tiers
   ✅ Supprimables à tout moment
   
   Pour accepter, tapez: OUI
   Pour refuser, tapez: NON
   
   Questions? privacy@fikravalley.com
   ```

4. **User**: "OUI"

5. **Bot records consent**:
   - Consent type: submission
   - Granted: true
   - Timestamp: now
   - Method: whatsapp
   - Policy version: 1.0
   - Stores in encrypted database

6. **Bot asks**: "Parfait! Quel est votre prénom?"

7. **User**: "Ahmed"

8. **Bot encrypts name, stores with**:
   - User ID: {uuid}
   - Name: {encrypted}
   - Phone: {hashed}
   - Created: {timestamp}
   - Expires: {90 days from now}

9. **Continue collection...**

10. **After submission**:
    ```
    ✅ Idée soumise!
    
    Rappel: Vos données seront automatiquement supprimées le {date}.
    
    Pour gérer vos données:
    • Supprimer: Tapez SUPPRIMER
    • Exporter: Tapez EXPORTER
    • Prolonger: fikravalley.com/privacy-controls
    
    Votre lien: {magic_link}
    ```

11. **Magic link includes privacy controls**

12. **After 90 days**:
    - Auto-delete all user data
    - Keep audit log only (anonymized)
    - Send confirmation (if opted in)

## ✅ Verification Checklist

Use the admin dashboard to verify all requirements:

1. Navigate to `/admin/privacy/checklist`
2. Review all items
3. Fix any failures (red badges)
4. Address warnings (yellow badges)
5. Ensure all critical items pass (green badges)
6. Only launch when overall status is "Ready"

## 🚀 Launch Readiness

Before launching, ensure:

- ✅ All critical items (red) are resolved
- ✅ All warnings (yellow) are addressed or documented
- ✅ Privacy policy is reviewed and accurate
- ✅ Environment variables are set correctly
- ✅ Database schemas are deployed
- ✅ Cron jobs are configured
- ✅ Team is trained on privacy practices
- ✅ Incident response plan is documented
- ✅ Backups are configured and tested

## 📞 Support

For privacy questions:
- Email: privacy@fikravalley.com
- Dashboard: `/admin/privacy/compliance`
- Checklist: `/admin/privacy/checklist`

