# 💰 Mobile Money Integration - Assembly Over Addition

## Overview

**Assembly**: Use existing mobile money services (M-Wallet, Orange Money) that Moroccan youth already use daily.

**Not Addition**: Don't create a new payment system. Work with what exists.

---

## Implementation

### 1. **Payment Link Generation** ✅

**File**: `lib/payments/mobile-money.ts`

**Providers Supported**:
- M-Wallet (default)
- Orange Money
- CIH Bank
- Attijariwafa

**Function**: `generateValidationPaymentLink()`
- Generates deep links or USSD codes
- Creates unique payment reference
- Returns QR code data for scanning

**Example**:
```typescript
const payment = generateValidationPaymentLink(
  idea_id,
  idea_title,
  customer_name,
  3 // 3 DH
);

// Returns:
{
  provider: 'm-wallet',
  link: 'https://m-wallet.ma/pay?amount=3&ref=FV-12345678-ABC123',
  instructions: 'Pour payer 3 DH via M-Wallet:...',
  qr_code_data: 'm-wallet:3:FV-12345678-ABC123:idea_title'
}
```

### 2. **API Integration** ✅

**API**: `/api/payments/validation`

**POST** - Create payment link:
```json
{
  "idea_id": "uuid",
  "customer_name": "Ahmed",
  "amount": 3
}
```

**Response**:
```json
{
  "success": true,
  "paymentLink": "https://m-wallet.ma/pay?...",
  "paymentInstructions": "Pour payer 3 DH via M-Wallet:...",
  "qrCodeData": "m-wallet:3:REF:title",
  "provider": "m-wallet",
  "amount": 3,
  "payment_id": "uuid"
}
```

**GET** - Check payment status:
```
GET /api/payments/validation?payment_id=uuid
GET /api/payments/validation?idea_id=uuid
```

### 3. **WhatsApp Message Integration** ✅

**Updated**: `lib/ai/whatsapp-message-generator.ts`

- Auto-generates payment link if `idea_id` provided
- Includes payment link in message
- Returns payment instructions separately

**Updated**: `components/ideas/GenerateMessageButton.tsx`

- Shows payment instructions in modal
- Displays payment link
- Default amount: 3 DH (not 10 DH)

---

## Database Schema

### Table: `marrai_idea_validation_payments`

**Created**: Migration `010_add_validation_payments.sql`

**Columns**:
- `id` (UUID)
- `idea_id` (UUID) - Foreign key
- `amount` (NUMERIC) - Default 3.00 DH
- `payment_provider` (TEXT) - m-wallet, orange-money, etc.
- `payment_reference` (TEXT) - Unique reference
- `payment_link` (TEXT) - Deep link/URL
- `customer_name` (TEXT) - Optional
- `status` (TEXT) - pending, completed, failed, cancelled
- `receipt_id` (UUID) - Links to `marrai_idea_receipts` if proof uploaded

---

## User Flow

### For Adopters (GenZ)

1. **Browse idea** → Click "Générer message WhatsApp"
2. **Get message** → Pre-drafted in Darija with payment link
3. **Send to 3 customers** → Copy-paste to WhatsApp
4. **Customer pays 3 DH** → Via M-Wallet/Orange Money
5. **Validation done** → "3 conversations, 1 payment"

### Payment Flow

```
Customer receives WhatsApp message
  ↓
Clicks payment link or scans QR code
  ↓
Opens M-Wallet/Orange Money app
  ↓
Pays 3 DH
  ↓
Payment reference tracked
  ↓
Adopter can upload receipt proof (optional)
```

---

## Assembly Principles Applied

### ✅ Work with Existing Behavior
- M-Wallet: Already installed on most phones
- Orange Money: USSD codes (*144#) - no app needed
- Mobile money: Used daily for small payments

### ✅ Remove Friction
- No business registration needed
- No procurement delays
- No bank account required
- Just mobile money (already have it)

### ✅ Create Headspace
- Auto-generate payment links
- Pre-draft instructions
- QR codes for easy scanning
- One-click payment

---

## Next Steps (Future Enhancements)

### 1. **Webhook Integration**
- Connect to actual mobile money APIs
- Auto-update payment status when completed
- Send confirmation to adopter

### 2. **Payment Verification**
- Auto-verify payments via API
- Link to receipt upload
- Update idea validation status

### 3. **Multi-Provider Support**
- Let user choose provider
- Show all available options
- Fallback if one fails

### 4. **Payment Analytics**
- Track conversion rates
- See which provider is most used
- Monitor payment completion rates

---

## Testing

### Manual Test Flow:

1. **Generate Payment Link**:
   ```bash
   curl -X POST http://localhost:3000/api/payments/validation \
     -H "Content-Type: application/json" \
     -d '{"idea_id": "uuid", "amount": 3}'
   ```

2. **Check Payment Status**:
   ```bash
   curl http://localhost:3000/api/payments/validation?idea_id=uuid
   ```

3. **Test in UI**:
   - Go to idea detail page
   - Click "Générer message WhatsApp"
   - Verify payment link is included
   - Check payment instructions display

---

## Notes

- **Default Amount**: 3 DH (as per assembly framework)
- **Payment Reference**: Unique per payment (for tracking)
- **Status**: Starts as 'pending', updated when payment completes
- **Receipt Link**: Optional - if customer uploads proof, link to `marrai_idea_receipts`

---

**Status**: ✅ Mobile money integration complete. Ready for testing and webhook integration.

