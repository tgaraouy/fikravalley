# Al-Ma3qool Protocol v2.0 - Agent-First Architecture

## Overview

Fikra Valley has been refactored from a "coherent interface" (static pages, PDFs, dashboards) to an **agent-addressable substrate** that generates disposable pixels only when needed.

This follows the three-layer decoupling pattern:

1. **Layer 1: Durable Substrate** - System of record (ideas, users, proofs)
2. **Layer 2: Intent/Agentic Layer** - AI agents that orchestrate workflows
3. **Layer 3: Disposable Pixels** - UI generated on-demand, discarded after use

---

## Architecture

### Layer 1: Durable Substrate

**File**: `lib/api/substrate.ts`

The ONLY durable entities that agents can mutate:

- **Ideas**: Core idea data with eGov metadata
- **Users**: Entrepreneur profiles with capacity data
- **Proofs**: Immutable validation records (Niya, Tadamoun, Thiqa)

**Key Methods**:
- `createProof()` - Create immutable proof with eGov signature
- `getSubstrate()` - Get raw data (no UI)
- `transitionStatus()` - Change idea status with audit trail

### Layer 2: Intent/Agentic Layer

**File**: `lib/agents/orchestrator.ts`

Agents are **stateless orchestrators** that:
1. Check permissions via intent-based system
2. Execute protocol-specific workflows
3. Return disposable UI specs

**Intents**:
- `validate-idea` - Niya protocol (voice note validation)
- `activate-daret` - Daret protocol (group matching, auto-pooling)
- `submit-intilaka` - Intilaka protocol (auto-submit when 3 proofs exist)

### Layer 3: Disposable Pixels

**File**: `lib/pixels/runtime.ts`

NO React components. NO pages. Just functions that return disposable UI:

- `niyaWitnessRequest()` - Voice note prompt (discarded after recording)
- `daretFundingReceipt()` - Receipt uploader (discarded after upload)
- `thiqaOrderLink()` - Payment link (discarded after payment)
- `progressDashboard()` - Status summary (discarded after read)

---

## Usage

### Execute an Agent Intent

```bash
POST /api/agent/execute

{
  "intent": "validate-idea",
  "context": {
    "userId": "user-uuid",
    "userPhone": "+212612345678",
    "ideaId": "idea-uuid"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": {
    "action": "send-whatsapp",
    "payload": {
      "phone": "+212612345678",
      "message": "Niya protocol initiated..."
    },
    "ui": {
      "type": "whatsapp-interactive",
      "platform": "whatsapp",
      "discardAfter": "completion"
    }
  }
}
```

---

## Protocols

### Niya Protocol (Intent Validation)

**Flow**:
1. User wants to validate an idea
2. Agent generates WhatsApp message asking for 60s voice note
3. Wait for 3 witness replies
4. Create immutable proof
5. Return success message

**Required Proofs**: None (starts the chain)

### Daret Protocol (Solidarity Group)

**Flow**:
1. User has Niya proof
2. AI matches 4 founders by priority + capacity
3. Create temporary WhatsApp group (30 days)
4. Auto-initiate mobile money pooling
5. Return group link

**Required Proofs**: `niya`

### Intilaka Protocol (Government Submission)

**Flow**:
1. User has all 3 proofs (niya, tadamoun, thiqa)
2. Auto-submit to eGov
3. Return application ID

**Required Proofs**: `niya`, `tadamoun`, `thiqa`

---

## Permissions

**File**: `lib/api/permissions.ts`

Permissions are **intent-based**, not role-based:

```typescript
IntentPermissions = {
  'validate-idea': {
    required_proofs: [],
    allowed_actions: ['create-niya-proof', 'send-whatsapp-message'],
    max_cost_dh: 0
  },
  'activate-daret': {
    required_proofs: ['niya'],
    allowed_actions: ['create-daret-group', 'initiate-recurring-payment'],
    max_cost_dh: 100
  },
  'submit-intilaka': {
    required_proofs: ['niya', 'tadamoun', 'thiqa'],
    allowed_actions: ['egov-submit', 'generate-pdf'],
    max_cost_dh: 0
  }
}
```

---

## Database Schema

### Proofs Table

```sql
CREATE TABLE marrai_proofs (
  id UUID PRIMARY KEY,
  idea_id UUID REFERENCES marrai_ideas(id),
  user_id UUID REFERENCES marrai_secure_users(id),
  proof_type TEXT CHECK (proof_type IN ('niya', 'tadamoun', 'thiqa')),
  payload JSONB, -- Encoded verification data
  eGov_signature TEXT, -- Cryptographic seal
  created_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  UNIQUE(idea_id, user_id, proof_type)
);
```

### Idea Status

Ideas now have a `status` field:
- `draft` - Initial state
- `validating` - In Niya/Tadamoun/Thiqa process
- `funded` - Has all proofs, submitted to Intilaka
- `sunset` - Archived

### eGov Metadata

Ideas have `egov_meta` JSONB field:
```json
{
  "intilaka_application_id": "string",
  "digital_receipt_ids": ["string"],
  "niya_certificate_id": "string"
}
```

---

## Migration from v1.0

### Deleted (Coherent Interface Artifacts)

- ❌ `/ideas/[id]/page.tsx` - Static idea detail page
- ❌ `/admin/ideas-dashboard` - Mentor browse UI
- ❌ `/adopt/kit.pdf` - PDF generation
- ❌ `/mentor/dashboard` - Persistent mentor UI
- ❌ `components/IdeaCard.tsx` - Static card component
- ❌ `components/IdeasFilterSidebar.tsx` - Persistent filters

### Kept (Durable Substrate)

- ✅ `lib/api/substrate.ts` - Core data models
- ✅ `lib/api/permissions.ts` - Intent validation
- ✅ Database schema - Ideas, users, proofs

### Created (Agentic + Disposable)

- ✅ `lib/agents/orchestrator.ts` - Intent execution
- ✅ `lib/agents/niya.ts` - Niya protocol agent (to be implemented)
- ✅ `lib/agents/daret.ts` - Daret protocol agent (to be implemented)
- ✅ `lib/agents/intilaka.ts` - Intilaka submission agent (to be implemented)
- ✅ `lib/pixels/runtime.ts` - UI generation
- ✅ `app/api/agent/execute/route.ts` - Agent execution endpoint

---

## Example: "Validate Idea" Flow

### OLD (Coherent UI):
1. Navigate to `/ideas/[id]`
2. Click "Adopt"
3. Fill form (budget, skills, location)
4. Download PDF
5. Read instructions
6. Manually message 3 friends
7. Track replies in notes

### NEW (Agentic + Disposable):

```typescript
// User stays in WhatsApp
const agent = new AlMa3qoolAgent('validate-idea', {
  userId: 'user-uuid',
  userPhone: '+212612345678',
  ideaId: 'idea-uuid'
});

// Agent does everything, generates UI only when blocked
const result = await agent.execute();

// Result is a disposable WhatsApp message:
// "✅ Niya validée! 3 personnes vous soutiennent."
```

**UI rendered**: Zero times unless user asks "where am I?"

---

## Why This Is Revolutionary for Morocco

The user will be able to choose their interface.

For Moroccan youth, their interface is **WhatsApp**. Not our website. Not our PDFs.

By building agent-addressable substrate, we let them stay in WhatsApp while accessing:

- eGov infrastructure
- Mobile money
- Daret solidarity
- Intilaka funding

**No new apps. No learning curves. No cognitive load. Just Ma3qool.**

---

## Next Steps

1. **Run Migration**: Execute `012_create_proofs_table.sql` in Supabase
2. **Implement Niya Protocol**: Complete voice note validation flow
3. **Implement Daret Protocol**: Complete group matching and auto-pooling
4. **Implement Intilaka Protocol**: Complete eGov submission
5. **Delete Old UI**: Remove static pages and components
6. **Test**: Validate idea entirely in WhatsApp

**Success Metric**: % of validations completed entirely in WhatsApp (target: 90%)

---

## References

- Al-Ma3qool Protocol v2.0 Specification
- "Assembly Over Addition" Framework
- Agent-First Architecture Principles

