# GDPR/Morocco Compliant Consent Management System

This document explains the consent management system for GDPR and Morocco data protection compliance.

## Overview

The consent management system provides:
- **Immutable consent records** (never update, only add new)
- **Policy version tracking** (detect when re-consent is needed)
- **Full audit trail** for GDPR Article 7 compliance
- **Consent withdrawal** with automatic data deletion
- **Multiple consent types** for different purposes

## GDPR Article 7 Compliance

The system ensures compliance with GDPR Article 7 requirements:

1. **Demonstrable Consent**: Every consent record includes:
   - Who gave consent (user ID, phone hash)
   - When consent was given (timestamp)
   - What consent was given for (consent type)
   - How consent was given (method: web, whatsapp, email, etc.)
   - Context (IP address, user agent)

2. **Withdrawal**: Users can withdraw consent at any time
3. **Version Tracking**: Tracks which policy version user agreed to
4. **Audit Trail**: All consent actions are logged

## Consent Types

### 1. `submission`
- **Required** for submitting ideas
- Withdrawal triggers deletion of user data
- Default: 90 days retention

### 2. `analysis`
- **Required** for AI analysis of ideas
- Withdrawal triggers deletion of analysis data
- Can be separate from submission consent

### 3. `marketing`
- **Optional** for newsletters and updates
- Withdrawal only stops marketing (no data deletion)
- Can be withdrawn independently

### 4. `data_retention`
- **Optional** for extended data retention
- Allows users to consent to longer retention periods
- Default: 90 days if not specified

## Usage Examples

### Recording Consent

```typescript
import { ConsentManager } from '@/lib/privacy/consent';

const manager = new ConsentManager();

// Record consent when user submits idea
await manager.recordConsent({
  userId: 'user-123',
  phone: '+212612345678',
  consentType: 'submission',
  granted: true,
  ipAddress: request.headers.get('x-forwarded-for'),
  userAgent: request.headers.get('user-agent'),
  consentMethod: 'web',
  metadata: {
    source: 'idea-submission-form',
  },
});
```

### Checking Consent

```typescript
// Check if user has consent before processing
const hasConsent = await manager.hasConsent(userId, 'submission');
if (!hasConsent) {
  return NextResponse.json(
    { error: 'Consent required' },
    { status: 403 }
  );
}
```

### Getting Consent History

```typescript
// Get full consent history for a user
const consents = await manager.getConsents(userId);
console.log('Consent history:', consents);
// Returns chronological list of all consent records
```

### Withdrawing Consent

```typescript
// User withdraws consent
await manager.withdrawConsent(userId, 'marketing');
// Automatically:
// - Creates new consent record (granted=false)
// - Triggers data deletion if needed
// - Logs withdrawal in audit trail
```

### Checking Re-Consent Need

```typescript
// Check if user needs to re-consent due to policy change
const needsReConsent = await manager.needsReConsent(userId, 'submission');
if (needsReConsent) {
  // Show consent form again
}
```

### Getting Consent Status

```typescript
// Get complete consent status for all types
const status = await manager.getConsentStatus(userId);
console.log(status);
// {
//   submission: true,
//   marketing: false,
//   analysis: true,
//   dataRetention: true,
//   needsReConsent: {
//     submission: false,
//     marketing: true,
//     analysis: false,
//     dataRetention: false,
//   }
// }
```

## Policy Version Management

### Setting Policy Version

Set the current policy version in `.env.local`:

```env
CONSENT_VERSION=1.0.0
```

### When Policy Changes

1. **Update version** in `.env.local`:
   ```env
   CONSENT_VERSION=2.0.0
   ```

2. **System automatically detects** version mismatch
3. **Re-request consent** from users with old version
4. **New consents** use new version automatically

### Version Format

Use semantic versioning:
- `1.0.0` - Major policy changes
- `1.1.0` - Minor policy updates
- `1.0.1` - Patch updates

## Consent Methods

Consent can be given via:

- **`web`**: Web form (default)
- **`whatsapp`**: WhatsApp message
- **`email`**: Email confirmation
- **`phone`**: Phone call
- **`in_person`**: In-person consent
- **`other`**: Other methods

## Database Schema

The `consents` table stores:

- `id`: UUID (primary key)
- `user_id`: UUID (references user)
- `phone_hash`: bcrypt hash (for lookup)
- `consent_type`: submission | marketing | analysis | data_retention
- `granted`: boolean (true = granted, false = denied/withdrawn)
- `consent_version`: Policy version (e.g., "1.0.0")
- `consent_method`: How consent was given
- `ip_address`: IP when consent given (for GDPR proof)
- `user_agent`: User agent when consent given
- `expires_at`: Optional expiry date
- `created_at`: Timestamp
- `metadata`: Additional JSON data

## Immutability

**Important**: Consent records are **never updated**, only new records are added.

This ensures:
- Complete audit trail
- Historical accuracy
- GDPR compliance (can prove consent history)

Example timeline:
1. User grants consent → Record 1: `granted=true`
2. User withdraws consent → Record 2: `granted=false`
3. User re-grants consent → Record 3: `granted=true`

All three records are kept permanently.

## Consent Withdrawal Flow

When user withdraws consent:

1. **New consent record created** (`granted=false`)
2. **Audit log entry** created
3. **Data deletion triggered** (if required by consent type):
   - `submission` → Delete all user data
   - `analysis` → Delete analysis data
   - `marketing` → Stop marketing (no deletion)
4. **Confirmation sent** (TODO: implement email/SMS)

## Integration with Secure Storage

The consent system integrates with `SecureUserStorage`:

- Uses same phone hashing (bcrypt)
- Shares audit log table
- Triggers data deletion on withdrawal
- Respects data retention policies

## API Integration Example

```typescript
// app/api/submit-idea/route.ts
import { ConsentManager } from '@/lib/privacy/consent';

export async function POST(request: NextRequest) {
  const { userId, ideaData } = await request.json();
  
  const manager = new ConsentManager();
  
  // Check consent before processing
  const hasConsent = await manager.hasConsent(userId, 'submission');
  if (!hasConsent) {
    return NextResponse.json(
      { error: 'Consent required to submit ideas' },
      { status: 403 }
    );
  }
  
  // Check if re-consent needed
  const needsReConsent = await manager.needsReConsent(userId, 'submission');
  if (needsReConsent) {
    return NextResponse.json(
      { error: 'Please review and accept updated privacy policy' },
      { status: 403 }
    );
  }
  
  // Process idea submission...
  
  // Record consent if not already recorded
  const ipAddress = request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent');
  
  await manager.recordConsent({
    userId,
    phone: userPhone, // Get from secure storage
    consentType: 'submission',
    granted: true,
    ipAddress,
    userAgent,
    consentMethod: 'web',
  });
}
```

## Environment Variables

Required:

```env
# Consent policy version
CONSENT_VERSION=1.0.0

# Encryption key (for secure storage integration)
ENCRYPTION_KEY=<your_encryption_key>
```

## Database Setup

Run the SQL schema in Supabase:

```bash
# Execute docs/privacy-storage-schema.sql
# This creates the consents table with all indexes
```

## Testing

### Test Consent Recording

```typescript
const manager = new ConsentManager();

await manager.recordConsent({
  userId: 'test-user-123',
  phone: '+212612345678',
  consentType: 'submission',
  granted: true,
  consentMethod: 'web',
});
```

### Test Consent Check

```typescript
const hasConsent = await manager.hasConsent('test-user-123', 'submission');
console.log('Has consent:', hasConsent);
```

### Test Withdrawal

```typescript
await manager.withdrawConsent('test-user-123', 'marketing');
```

## Best Practices

1. **Always check consent** before processing user data
2. **Record consent immediately** when user grants it
3. **Never update** existing consent records
4. **Track policy versions** and re-request when changed
5. **Log all consent actions** in audit trail
6. **Respect withdrawals** immediately
7. **Delete data** when required by withdrawal

## Compliance Checklist

- ✅ Immutable consent records
- ✅ Policy version tracking
- ✅ Full audit trail (who, when, what, how)
- ✅ Consent withdrawal support
- ✅ Automatic data deletion on withdrawal
- ✅ IP address and user agent logging
- ✅ Consent method tracking
- ✅ Expiry date support
- ✅ GDPR Article 7 compliant

## Resources

- [GDPR Article 7](https://gdpr-info.eu/art-7-gdpr/)
- [Morocco Data Protection Law](https://www.cndp.ma/)
- [Consent Management Best Practices](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/lawful-basis-for-processing/consent/)

