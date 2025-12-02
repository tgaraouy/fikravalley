# Al-Ma3qool Protocol v2.0 - Detailed Implementation Plan

## Overview

This plan transforms Fikra Valley from a coherent interface (static pages, PDFs) to an **agent-addressable substrate** that generates disposable pixels only when needed.

**Timeline**: 6-8 weeks  
**Success Metric**: 90% of validations completed entirely in WhatsApp

---

## Phase 0: Foundation & Database (Week 1)

### ✅ Already Complete
- [x] Core substrate API (`lib/api/substrate.ts`)
- [x] Permissions system (`lib/api/permissions.ts`)
- [x] Agent orchestrator skeleton (`lib/agents/orchestrator.ts`)
- [x] Disposable pixel runtime (`lib/pixels/runtime.ts`)
- [x] Agent execution endpoint (`app/api/agent/execute/route.ts`)
- [x] Migration SQL (`supabase/migrations/012_create_proofs_table.sql`)

### 🔄 To Complete

#### 0.1 Run Database Migration
**File**: `supabase/migrations/012_create_proofs_table.sql`

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy/paste migration SQL
3. Execute
4. Verify tables created:
   ```sql
   SELECT * FROM marrai_proofs LIMIT 1;
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'marrai_ideas' AND column_name IN ('status', 'egov_meta');
   ```

**Validation**:
- ✅ `marrai_proofs` table exists
- ✅ `marrai_ideas.status` column exists
- ✅ `marrai_ideas.egov_meta` column exists
- ✅ `marrai_secure_users.capacity_profile` exists
- ✅ `marrai_secure_users.trust_circle` exists

#### 0.2 Update TypeScript Types
**File**: `lib/supabase.ts`

**Task**: Add types for new columns:
- `marrai_ideas.status`
- `marrai_ideas.egov_meta`
- `marrai_secure_users.capacity_profile`
- `marrai_secure_users.trust_circle`
- `marrai_proofs` table

**Validation**: `npm run build` succeeds

---

## Phase 1: Niya Protocol (Week 2-3)

### 1.1 WhatsApp Integration Layer

**Files to Create**:
- `lib/integrations/whatsapp.ts` - WhatsApp Business API wrapper
- `lib/integrations/whatsapp-webhook.ts` - Handle incoming messages

**Implementation**:

```typescript
// lib/integrations/whatsapp.ts
export class WhatsAppService {
  async sendMessage(phone: string, message: string): Promise<void>
  async sendVoiceNotePrompt(phone: string, config: VoiceNoteConfig): Promise<void>
  async createGroup(name: string, members: string[]): Promise<string>
  async waitForReplies(groupId: string, expectedCount: number, timeout: number): Promise<Reply[]>
}
```

**Integration Points**:
- Use existing `app/api/whatsapp/webhook/route.ts` as base
- Extend `lib/share/whatsapp-share.ts` for message sending
- Connect to WhatsApp Business API (Twilio or Meta)

**Validation**:
- ✅ Can send text message to test number
- ✅ Can send voice note prompt
- ✅ Webhook receives replies

### 1.2 Voice Note Processing

**Files to Create**:
- `lib/agents/niya.ts` - Niya protocol implementation
- `lib/processing/voice-note.ts` - Voice note transcription/validation

**Implementation**:

```typescript
// lib/agents/niya.ts
export class NiyaAgent {
  async initiateValidation(ideaId: string, userId: string): Promise<AgentResult>
  async waitForWitnesses(ideaId: string, expectedCount: number): Promise<Witness[]>
  async createNiyaProof(ideaId: string, userId: string, witnesses: Witness[]): Promise<string>
}
```

**Flow**:
1. User requests validation → Agent sends WhatsApp voice note prompt
2. User records 60s voice note → Uploaded to storage
3. Agent transcribes voice note (using existing transcription API)
4. Agent extracts commitment statement
5. Agent requests 3 witness confirmations via WhatsApp
6. When 3 witnesses reply → Create immutable proof
7. Send success message

**Validation**:
- ✅ Voice note prompt sent
- ✅ Voice note recorded and transcribed
- ✅ Witness requests sent
- ✅ 3 witness replies received
- ✅ Proof created in database

### 1.3 Update Orchestrator

**File**: `lib/agents/orchestrator.ts`

**Task**: Replace placeholder `executeNiyaProtocol()` with real implementation

**Integration**:
- Import `NiyaAgent` from `lib/agents/niya.ts`
- Call `niyaAgent.initiateValidation()`
- Handle async witness waiting
- Return disposable UI

**Validation**:
- ✅ `POST /api/agent/execute` with `intent: "validate-idea"` works
- ✅ Returns WhatsApp message spec
- ✅ Proof created after 3 witnesses

---

## Phase 2: Daret Protocol (Week 3-4)

### 2.1 AI Matching Service

**Files to Create**:
- `lib/matching/daret-matcher.ts` - Match 4 founders by priority + capacity
- `lib/matching/capacity-analyzer.ts` - Analyze user capacity from behavior

**Implementation**:

```typescript
// lib/matching/daret-matcher.ts
export class DaretMatcher {
  async findMatches(userId: string, priority: string): Promise<string[]> {
    // 1. Get user's moroccan_priorities
    // 2. Get user's capacity_profile
    // 3. Find 3 other users with:
    //    - Matching priorities
    //    - Complementary capacity (different risk tolerance, different hours)
    //    - Have niya proof
    // 4. Return 3 user IDs
  }
}
```

**Matching Criteria**:
- Same `moroccan_priorities` (at least 1 overlap)
- Complementary `capacity_profile`:
  - Different `risk_tolerance` (diversify)
  - Different `available_hours_per_week` (balance)
  - Similar `financial_runway_months` (same stage)
- All have `niya` proof

**Validation**:
- ✅ Can find 3 matches for test user
- ✅ Matches have complementary profiles
- ✅ All matches have niya proof

### 2.2 WhatsApp Group Management

**Files to Create**:
- `lib/integrations/whatsapp-groups.ts` - Create/manage temporary groups

**Implementation**:

```typescript
// lib/integrations/whatsapp-groups.ts
export class WhatsAppGroupService {
  async createTemporaryGroup(config: {
    name: string;
    members: string[]; // Phone numbers
    autoDisband: number; // Timestamp
  }): Promise<string> // Returns group ID
  
  async scheduleDisband(groupId: string, timestamp: number): Promise<void>
}
```

**Integration**:
- Use WhatsApp Business API group creation
- Store group ID in `marrai_secure_users.daret_group_id`
- Schedule auto-disband via cron job

**Validation**:
- ✅ Can create WhatsApp group with 4 members
- ✅ Group ID stored in database
- ✅ Auto-disband scheduled

### 2.3 Mobile Money Pooling

**Files to Create**:
- `lib/integrations/mobile-money-pool.ts` - Recurring payment pooling

**Implementation**:

```typescript
// lib/integrations/mobile-money-pool.ts
export class MobileMoneyPoolService {
  async createRecurringPool(config: {
    groupId: string;
    amount: number; // 100 DH
    schedule: 'monthly' | 'weekly';
    members: string[]; // Phone numbers
  }): Promise<string> // Returns pool ID
  
  async checkPoolStatus(poolId: string): Promise<PoolStatus>
}
```

**Integration**:
- Use existing `lib/payments/mobile-money.ts` as base
- Extend for recurring payments
- Connect to mobile money APIs (M-Wallet, Orange Money)

**Flow**:
1. Create pool with 4 members
2. Each member receives payment request (100 DH/month)
3. When first payment received → Create `tadamoun` proof
4. Track pool status

**Validation**:
- ✅ Can create recurring pool
- ✅ Members receive payment requests
- ✅ Payment triggers proof creation

### 2.4 Daret Agent Implementation

**Files to Create**:
- `lib/agents/daret.ts` - Daret protocol implementation

**Implementation**:

```typescript
// lib/agents/daret.ts
export class DaretAgent {
  async activateDaret(userId: string, priority: string): Promise<AgentResult> {
    // 1. Check user has niya proof
    // 2. Find 3 matches via DaretMatcher
    // 3. Create WhatsApp group
    // 4. Create mobile money pool
    // 5. Return group link
  }
}
```

**Update Orchestrator**:
- Replace placeholder `executeDaretProtocol()` with `DaretAgent.activateDaret()`

**Validation**:
- ✅ `POST /api/agent/execute` with `intent: "activate-daret"` works
- ✅ Returns group link
- ✅ Group created with 4 members
- ✅ Pool initiated

---

## Phase 3: Tadamoun Protocol (Week 4-5)

### 3.1 Receipt Upload & Verification

**Files to Create**:
- `lib/agents/tadamoun.ts` - Tadamoun protocol (solidarity proof)
- `lib/processing/receipt-verifier.ts` - Verify expense receipts

**Implementation**:

```typescript
// lib/agents/tadamoun.ts
export class TadamounAgent {
  async requestReceiptUpload(userId: string, expenseId: string): Promise<DisposableUI>
  async verifyReceipt(receiptUrl: string, expenseId: string): Promise<boolean>
  async createTadamounProof(userId: string, ideaId: string, expenseId: string): Promise<string>
}
```

**Flow**:
1. User spends 100 DH from Daret pool
2. Agent sends WhatsApp message: "Upload receipt for 100 DH expense"
3. User uploads receipt image
4. Agent verifies receipt (OCR + validation)
5. Create `tadamoun` proof

**Integration**:
- Use existing receipt upload infrastructure
- Extend `app/api/ideas/[id]/reviews/route.ts` pattern
- OCR service for receipt parsing

**Validation**:
- ✅ Receipt upload request sent
- ✅ Receipt uploaded and verified
- ✅ Tadamoun proof created

---

## Phase 4: Thiqa Protocol (Week 5-6)

### 4.1 Customer Payment Flow

**Files to Create**:
- `lib/agents/thiqa.ts` - Thiqa protocol (trust proof via customer payment)

**Implementation**:

```typescript
// lib/agents/thiqa.ts
export class ThiqaAgent {
  async generateCustomerPaymentLink(
    ideaId: string,
    customerPhone: string,
    amount: number // 30 DH
  ): Promise<DisposableUI>
  
  async waitForPayment(paymentId: string, timeout: number): Promise<PaymentStatus>
  async createThiqaProof(userId: string, ideaId: string, paymentId: string): Promise<string>
}
```

**Flow**:
1. Customer expresses interest (via WhatsApp or web)
2. Agent generates payment link (30 DH)
3. Customer pays via mobile money
4. Payment confirmed → Create `thiqa` proof

**Integration**:
- Use existing `lib/payments/mobile-money.ts`
- Extend `app/api/payments/validation/route.ts`
- Connect payment webhook to proof creation

**Validation**:
- ✅ Payment link generated
- ✅ Customer pays 30 DH
- ✅ Payment confirmed
- ✅ Thiqa proof created

---

## Phase 5: Intilaka Protocol (Week 6-7)

### 5.1 eGov Integration

**Files to Create**:
- `lib/integrations/egov.ts` - eGov API integration
- `lib/agents/intilaka.ts` - Intilaka submission agent

**Implementation**:

```typescript
// lib/integrations/egov.ts
export class EGovService {
  async submitIntilakaApplication(data: {
    proofs: Proof[];
    moroccanPriorities: string[];
    ideaData: Idea;
  }): Promise<string> // Returns application ID
  
  async checkApplicationStatus(applicationId: string): Promise<ApplicationStatus>
  async getCertificate(certificateId: string): Promise<Certificate>
}
```

**Flow**:
1. User has all 3 proofs (niya, tadamoun, thiqa)
2. Agent auto-submits to eGov API
3. eGov returns application ID
4. Store in `marrai_ideas.egov_meta.intilaka_application_id`
5. Send confirmation WhatsApp message

**Note**: eGov API integration may require:
- Government API credentials
- Sandbox environment for testing
- Production approval process

**Validation**:
- ✅ Can submit application to eGov (sandbox)
- ✅ Application ID stored
- ✅ Status can be checked

### 5.2 Auto-Submission Logic

**File**: `lib/agents/intilaka.ts`

**Implementation**:

```typescript
// lib/agents/intilaka.ts
export class IntilakaAgent {
  async checkReadiness(userId: string, ideaId: string): Promise<boolean>
  async autoSubmit(userId: string, ideaId: string): Promise<AgentResult>
}
```

**Update Orchestrator**:
- Replace placeholder `executeIntilakaProtocol()` with `IntilakaAgent.autoSubmit()`

**Validation**:
- ✅ `POST /api/agent/execute` with `intent: "submit-intilaka"` works
- ✅ Auto-submits when all proofs exist
- ✅ Returns application ID

---

## Phase 6: UI Cleanup & Migration (Week 7-8)

### 6.1 Delete Coherent Interface Artifacts

**Files to Delete**:
- ❌ `app/ideas/[id]/page.tsx` - Replace with agent endpoint
- ❌ `app/admin/ideas-dashboard/page.tsx` - Replace with agent query
- ❌ `app/adopt/kit.pdf` - No longer needed
- ❌ `app/mentor/dashboard/page.tsx` - Replace with mentor digest
- ❌ `components/ideas/IdeaCard.tsx` - Static cards not needed
- ❌ `components/ideas/FilterSidebar.tsx` - Filters not needed

**Replacement Strategy**:
- Idea detail → Agent query: `GET /api/agent/query?type=idea&id=xxx`
- Admin dashboard → Agent query: `GET /api/agent/query?type=admin-stats`
- Mentor dashboard → Mentor digest email (already implemented)

### 6.2 Create Agent Query Endpoint

**File**: `app/api/agent/query/route.ts`

**Purpose**: Allow agents to query substrate without executing intents

**Implementation**:

```typescript
// app/api/agent/query/route.ts
export async function GET(request: NextRequest) {
  const { type, id, filters } = request.nextUrl.searchParams;
  
  switch (type) {
    case 'idea':
      return substrateAPI.getIdea(id);
    case 'user':
      return substrateAPI.getUser(id);
    case 'proofs':
      return substrateAPI.getProofsForUser(id);
    case 'admin-stats':
      return substrateAPI.getAdminStats();
  }
}
```

### 6.3 Keep Essential Pages

**Pages to Keep** (for backward compatibility):
- ✅ `/ideas` - Public idea listing (read-only, no actions)
- ✅ `/submit` - Idea submission (still needed)
- ✅ `/become-mentor` - Mentor registration (still needed)

**Pages to Convert to Agent Endpoints**:
- `/ideas/[id]` → Agent query endpoint
- `/admin/*` → Agent query endpoints
- `/mentor/dashboard` → Mentor digest email

---

## Phase 7: Testing & Validation (Week 8)

### 7.1 End-to-End Test Flows

**Test 1: Complete Niya Protocol**
1. User sends WhatsApp: "I want to validate idea X"
2. Agent sends voice note prompt
3. User records voice note
4. Agent requests 3 witnesses
5. 3 witnesses reply
6. Proof created
7. Success message sent

**Test 2: Complete Daret Protocol**
1. User has niya proof
2. User requests: "Activate Daret for green_morocco"
3. Agent finds 3 matches
4. WhatsApp group created
5. Mobile money pool initiated
6. Group link returned

**Test 3: Complete Intilaka Protocol**
1. User has all 3 proofs
2. User requests: "Submit to Intilaka"
3. Agent auto-submits to eGov
4. Application ID returned
5. Confirmation message sent

### 7.2 Success Metrics

**Primary Metric**: % of validations completed entirely in WhatsApp
- **Target**: 90%
- **Measurement**: Track proof creation source (WhatsApp vs Web)

**Secondary Metrics**:
- Average time to complete Niya protocol
- Daret group formation success rate
- Intilaka submission success rate
- User satisfaction (WhatsApp message feedback)

---

## Integration Points

### Existing Infrastructure to Leverage

1. **WhatsApp**:
   - `app/api/whatsapp/webhook/route.ts` - Extend for agent messages
   - `lib/share/whatsapp-share.ts` - Use for message sending
   - `lib/ai/whatsapp-message-generator.ts` - Extend for protocol messages

2. **Mobile Money**:
   - `lib/payments/mobile-money.ts` - Extend for recurring pools
   - `app/api/payments/validation/route.ts` - Extend for proof creation

3. **Voice Processing**:
   - `app/api/transcribe/route.ts` - Use for voice note transcription
   - `app/api/ideas/extract-from-voice/route.ts` - Use for voice analysis

4. **Matching**:
   - `lib/agents/mentor-agent.ts` - Use matching logic for Daret
   - `app/api/agents/mentor/route.ts` - Extend for founder matching

---

## Environment Variables Needed

```bash
# WhatsApp Business API
WHATSAPP_API_URL=https://api.twilio.com/2010-04-01
WHATSAPP_API_KEY=your_twilio_auth_token
WHATSAPP_PHONE_NUMBER=whatsapp:+14155238886

# Mobile Money APIs (when available)
M_WALLET_API_KEY=...
ORANGE_MONEY_API_KEY=...

# eGov API (when available)
EGOV_API_URL=https://api.egov.ma
EGOV_API_KEY=...
EGOV_SANDBOX=true

# Voice Processing
ANTHROPIC_API_KEY=... # For transcription
```

---

## Risk Mitigation

### Risk 1: WhatsApp API Rate Limits
**Mitigation**: Implement queuing system, batch messages, use webhooks efficiently

### Risk 2: Mobile Money API Unavailability
**Mitigation**: Fallback to manual payment links, support multiple providers

### Risk 3: eGov API Delays
**Mitigation**: Implement async submission, status polling, manual fallback

### Risk 4: User Adoption
**Mitigation**: Gradual migration, keep web interface as fallback initially

---

## Rollout Strategy

### Phase A: Soft Launch (Week 8)
- Deploy to 10% of users
- Monitor WhatsApp completion rate
- Gather feedback

### Phase B: Gradual Migration (Week 9-10)
- Increase to 50% of users
- A/B test: WhatsApp vs Web
- Optimize based on metrics

### Phase C: Full Migration (Week 11+)
- 100% WhatsApp-first
- Web interface as read-only fallback
- Remove static pages

---

## Documentation Updates

1. **User Guide**: How to validate ideas via WhatsApp
2. **Developer Guide**: How to extend agents
3. **API Documentation**: Agent endpoints
4. **Protocol Specifications**: Niya, Daret, Tadamoun, Thiqa, Intilaka

---

## Next Immediate Steps (This Week)

1. ✅ **Run Migration**: Execute `012_create_proofs_table.sql`
2. ✅ **Update Types**: Add new columns to TypeScript types
3. 🔄 **Test Agent Endpoint**: `POST /api/agent/execute` with test data
4. 🔄 **Implement Niya Agent**: Start with voice note prompt
5. 🔄 **WhatsApp Integration**: Connect to WhatsApp Business API

---

**Status**: Foundation complete. Ready for Phase 1 (Niya Protocol) implementation.

