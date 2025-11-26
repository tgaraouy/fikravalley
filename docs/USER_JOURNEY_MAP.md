# Complete User Journey Map

## Overview
This document maps the complete user journey from idea submission to mentor matching and public visibility, with detailed status transitions and human-in-the-loop points.

---

## STAGE 1: USER DICTATION (0-2 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**User: "2-3 DH/kilo exploitation" (Problem)**

├─ Action: Click 🎤 Problem
├─ Action: Dictate Problem (30-60s)
└─ Status: `marrai_conversation_ideas.status = 'pending_validation'`
└─ Trigger: [Agent 1] Auto-extract fields
   └─ Extracts: `title`, `category`, `location`, `problem_statement`

**User: "Tech pour améliorer conditions" (Solution)**

├─ Action: Click 🎤 Solution
├─ Action: Dictate Solution (30-60s)
└─ Status: `marrai_conversation_ideas.status = 'pending_validation'`
└─ Trigger: [Agent 1] Auto-extract fields
   └─ Extracts: `proposed_solution`, `ai_capabilities_needed`

**Implementation Status**: ✅ **COMPLETE**
- Voice dictation: `components/submission/SimpleVoiceSubmit.tsx`
- Auto-extraction: `lib/agents/conversation-extractor-agent.ts`
- Real-time processing: Enabled with status indicators

---

## STAGE 2: HUMAN REVIEW (2-3 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**User: Review Extracted Data**

├─ Action: See auto-filled fields
├─ Action: Correct if needed (optional)
└─ Decision: Confidence > 0.85?
   ├─ NO → [Human Loop] WhatsApp clarification
   └─ YES → Proceed to submission

**Implementation Status**: ✅ **COMPLETE**
- Extracted fields display: `components/submission/SimpleVoiceSubmit.tsx`
- Confidence indicator: Shows when < 0.85
- Edit capability: User can modify fields

---

## STAGE 3: SUBMISSION (3-5 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**User: Click ✅ Submit**

├─ Action: Create `marrai_conversation_ideas` record
├─ Status: `status = 'pending_validation'`
└─ Trigger: [Agent 1] Validate & Promote
   ├─ Extracts both problem + solution
   ├─ Sets `promoted_to_idea_id`
   └─ Status: `'promoted_to_idea'`

**Implementation Status**: ✅ **COMPLETE**
- Submit handler: `components/submission/SimpleVoiceSubmit.tsx` → `handleSubmit`
- Agent 1 validation: `lib/agents/conversation-extractor-agent.ts`
- Promotion logic: Creates `marrai_ideas` record

---

## STAGE 4: AGENT 1 VALIDATION (5-10 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Agent 1: Conversation Extractor]**

├─ Input: `speaker_quote` (problem | solution)
├─ Output: `problem_title`, `problem_statement`, `proposed_solution`
├─ Decision: `confidence_score > 0.85?`
   ├─ NO: [Human Loop] WhatsApp clarification
   │  ├─ Message: "شنو كتعني ب '{unclear_term}'؟"
   │  ├─ User replies via WhatsApp
   │  └─ Re-run Agent 1
   └─ YES: Auto-promote to `marrai_ideas`
      └─ Status: `marrai_ideas.status = 'transcribing'`

**Implementation Status**: ⚠️ **PARTIAL**
- ✅ Agent 1 extraction: Complete
- ✅ Confidence scoring: Complete
- ✅ Validation question generation: Complete
- ⚠️ WhatsApp clarification: Backend ready, needs webhook
- ⚠️ Re-run on reply: Logic exists, needs trigger

**Missing**:
- WhatsApp webhook endpoint: `app/api/webhooks/whatsapp/route.ts`
- Status tracking UI for clarification loop

---

## STAGE 5: AGENTS 2A-C ANALYSIS (10-15 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Agent 2: Parallel Analysis]**

├─ Status: `marrai_ideas.status = 'analyzing'`

**[Agent 2A: Feasibility Scorer]**

├─ Input: `problem_statement`, `proposed_solution`, `category`
├─ Output: `ai_feasibility_score`, `ai_analysis`
└─ Status: `marrai_ideas.status = 'analyzing'`

**[Agent 2B: Impact Calculator]**

├─ Input: `frequency`, `manual_process`, `automation_potential`
├─ Output: `roi_time_saved_hours`, `roi_cost_saved_eur`
├─ Output: `qualification_tier`, `ai_impact_score`
└─ Status: `marrai_ideas.status = 'analyzing'`

**[Agent 2C: Alignment Mapper]**

├─ Input: `problem_statement`, `category`, `location`
├─ Output: `alignment` (sdgTags, sdgConfidence, moroccoPriorities)
└─ Status: `marrai_ideas.status = 'analyzed'`

**Implementation Status**: ✅ **COMPLETE**
- Agent 2A/2B: `app/api/analyze-idea/route.ts`
- Agent 2C: `lib/idea-bank/scoring/two-stage-scorer.ts`
- Parallel processing: Implemented
- Status updates: Working

---

## STAGE 6: AGENT 5 MENTOR MATCHING (15-20 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Agent 5: Mentor Matcher]**

├─ Status: `marrai_ideas.status = 'matching'`
├─ Input: problem + solution embeddings
├─ Action: Vector search `marrai_mentors` table
├─ Output: `marrai_mentor_matches` (status='pending')
├─ Output: `marrai_ideas.matched_diaspora` (uuid[])
└─ Status: `marrai_ideas.status = 'matched'`

**[Human Loop: Admin Review]**

├─ Dashboard: Review top 3 matches
├─ Action: Approve 1-2 matches → status='active'
└─ Status: `marrai_mentor_matches.status = 'active'`

**Implementation Status**: ⚠️ **PARTIAL**
- ✅ Agent 5 matching: `lib/agents/mentor-agent.ts`
- ✅ Match creation: Creates `marrai_mentor_matches`
- ⚠️ Admin dashboard: **MISSING**
- ⚠️ Approval workflow: **MISSING**

**Missing**:
- Admin dashboard: `app/admin/mentor-matches/page.tsx`
- Approval/reject actions
- Bulk operations

---

## STAGE 7: AGENT 6 NOTIFICATION (20-30 minutes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**[Agent 6: Notification Agent]**

├─ Status: `marrai_ideas.status = 'matched'`
├─ Trigger: `marrai_mentor_matches.status = 'active'`
├─ Output: WhatsApp/email to mentors
└─ Message: "مرحبا {mentor.name}, فكرة جديدة ت-match مع خبرتك..."

**Implementation Status**: ✅ **COMPLETE**
- Agent 6: `lib/agents/notification-agent.ts`
- WhatsApp sending: `lib/whatsapp.ts`
- Message generation: Complete
- Human-in-the-loop: Admin approval required

---

## STAGE 8: MENTOR ACCEPTANCE (30min-24h)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Mentor: Receives WhatsApp notification**

├─ Action: Clicks link → `/idea/128/dashboard`
├─ Action: Reviews problem/solution + transcripts
└─ Decision: Accept match?
   ├─ YES → `marrai_mentor_matches.status = 'accepted'`
   ├─ Trigger: [Agent 6] Notify user & admin
   └─ Status: `marrai_ideas.status = 'funded'`

**[Human Loop: Speaker Validation]**

├─ If `needs_clarification=true`
├─ User receives WhatsApp: "كيتعجبك الحل؟"
├─ User replies "✅" or "❌"
└─ Status: `speaker_validated` or `speaker_rejected`

**Implementation Status**: ⚠️ **PARTIAL**
- ✅ WhatsApp notification: Complete
- ⚠️ Mentor portal: **MISSING**
- ⚠️ Accept/reject UI: **MISSING**
- ⚠️ Status updates: Logic exists, needs UI

**Missing**:
- Mentor dashboard: `app/mentor/dashboard/page.tsx`
- Idea detail page: `app/idea/[id]/dashboard/page.tsx`
- Accept/reject actions

---

## STAGE 9: PUBLIC VISIBILITY (24h-7 days)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Admin: Sets `marrai_ideas.visible = true`**

├─ Status: `marrai_ideas.status = 'funded'`
├─ Trigger: [Agent 6] Generate share text
└─ Output: Twitter/WhatsApp post

**Public Dashboard: `/idea/128`**

├─ Title, problem, solution (anonymized)
├─ Impact score, SDG tags, mentor count
├─ "I Want to Help" button
└─ Triggers: `marrai_problem_validations` record

**Implementation Status**: ⚠️ **PARTIAL**
- ✅ Share text generation: `lib/agents/notification-agent.ts`
- ⚠️ Public dashboard: Needs verification
- ⚠️ "I Want to Help" button: **MISSING**
- ⚠️ Validation tracking: **MISSING**

**Missing**:
- Public idea page: `app/idea/[id]/page.tsx`
- Help button functionality
- Validation tracking

---

## STAGE 10: VIRAL SHARE (7 days+)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**User/Admin: Shares on Twitter/WhatsApp**

├─ Message: "فكرة #128: {title} | مشكل: {problem} | حل: {solution} | درت شي حد مزال؟"
├─ Tags: `#فكرة_فالوادي #MRE #{category}`
└─ Action: Clicks link → Public dashboard
   └─ Tracks: analytics via `utm_source`

**Implementation Status**: ⚠️ **PARTIAL**
- ✅ Share text generation: Complete
- ⚠️ Share buttons: **MISSING**
- ⚠️ Analytics tracking: **MISSING**

---

## 📊 Summary: Status Transitions

| Stage | Table | Status Change | Agent/Trigger |
|-------|-------|---------------|---------------|
| 1 | `conversation_ideas` | `null → pending_validation` | User submits |
| 2 | `conversation_ideas` | `pending_validation → speaker_contacted` | [Agent 1] if confidence < 0.85 |
| 3 | `ideas` | `null → transcribing` | [Agent 1] promotes |
| 4 | `ideas` | `transcribing → analyzing` | [Agent 2] starts |
| 5 | `ideas` | `analyzing → analyzed` | [Agent 2] finishes |
| 6 | `ideas` | `analyzed → matching` | [Agent 5] starts |
| 6 | `mentor_matches` | `null → pending` | [Agent 5] creates |
| 7 | `mentor_matches` | `pending → active` | [Admin] approves |
| 8 | `mentor_matches` | `active → accepted` | [Mentor] accepts |
| 8 | `ideas` | `matching → funded` | [Agent 6] confirms |
| 9 | `ideas` | `funded → public` | [Admin] sets `visible=true` |
| 10 | `ideas` | `public → viral` | User shares |

---

## 📱 WhatsApp Message Templates

### Clarification (Stage 4)

```
✋ وقفة! عطينا شي معلومة زيادة:

كيتعجبك الحل المقترح؟

1. ✅ واخا - كملو
2. ❌ بدّل شي حاجة

شنغولو بدّل؟
```

### Mentor Notification (Stage 7)

```
مرحبا {mentor.name},

فكرة جديدة ت-match مع خبرتك: "{idea.title}"

مشكل: {idea.problem_statement}
حل: {idea.proposed_solution}

Score: {idea.matching_score}/10
Impact: {idea.roi_cost_saved_eur}€/mois

شوف التفاصيل: https://fikravalley.com/idea/{idea.id}

كيفاش نقدر نساعد؟
```

### Public Share (Stage 10)

```
فكرة #{idea.id}: {idea.title}

مشكل: {idea.problem_statement}
حل: {idea.proposed_solution}

كيفاش نقدر نساعد؟ {idea.mentor_count} ديال الخبراء جاهزين

#فكرة_فالوادي #MRE #{idea.category}
```

---

## 🎯 Key Human-in-the-Loop Points

1. **Stage 2**: User reviews extracted fields (optional correction)
2. **Stage 4**: User replies to WhatsApp clarification (if needed)
3. **Stage 6**: Admin approves mentor matches (mandatory)
4. **Stage 8**: Mentor accepts match (human decision)
5. **Stage 9**: Admin sets `visible=true` (mandatory)

---

## 🚀 Implementation Checklist

### ✅ Completed

- [x] Stage 1: Voice dictation with Whisper
- [x] Stage 1: Auto-extraction of fields
- [x] Stage 2: Extracted fields display
- [x] Stage 3: Submit handler
- [x] Stage 4: Agent 1 validation
- [x] Stage 5: Agent 2A/2B/2C analysis
- [x] Stage 6: Agent 5 mentor matching
- [x] Stage 7: Agent 6 notification

### ⚠️ High Priority (Next Sprint)

- [ ] **Task 1**: WhatsApp webhook for clarification loop
  - File: `app/api/webhooks/whatsapp/route.ts`
  - Purpose: Receive user replies, trigger re-extraction
  - Dependencies: WhatsApp API integration

- [ ] **Task 2**: Admin dashboard for mentor match review
  - File: `app/admin/mentor-matches/page.tsx`
  - Purpose: Review, approve/reject matches
  - Features: List pending matches, bulk actions

- [ ] **Task 3**: Mentor portal for accept/reject
  - File: `app/mentor/dashboard/page.tsx`
  - File: `app/idea/[id]/dashboard/page.tsx`
  - Purpose: Mentors view and accept matches

### ⚠️ Medium Priority

- [ ] **Task 4**: Public idea page
  - File: `app/idea/[id]/page.tsx`
  - Purpose: Public view of ideas
  - Features: "I Want to Help" button, share buttons

- [ ] **Task 5**: Status tracking UI
  - Purpose: Show users current status
  - Features: Progress indicators, real-time updates

- [ ] **Task 6**: Share buttons and analytics
  - Purpose: Viral sharing functionality
  - Features: Pre-filled social media text, UTM tracking

### ⚠️ Low Priority

- [ ] **Task 7**: Follow-up planning workflow
- [ ] **Task 8**: Enhanced analytics dashboard

---

## 📋 API Endpoints Reference

- `POST /api/transcribe` - Voice transcription (Whisper) ✅
- `POST /api/agents/conversation-extractor` - Agent 1: Extract & Validate ✅
- `POST /api/analyze-idea` - Agent 2: Feasibility/Impact/ROI ✅
- `POST /api/agents/mentor` - Agent 5: Match Mentors ✅
- `POST /api/agents/notification` - Agent 6: Notify & Share ✅
- `POST /api/agents/feature-flag` - Agent 7: Feature Flag & Priority ✅
- `POST /api/webhooks/whatsapp` - ⚠️ **MISSING** - WhatsApp replies

---

## 🗄️ Database Tables

- `marrai_conversation_ideas` - Initial submissions (Agent 1)
- `marrai_ideas` - Promoted ideas (after validation)
- `marrai_mentor_matches` - Mentor matching results
- `marrai_workshop_sessions` - Workshop tracking
- `marrai_mentors` - Mentor profiles
- `marrai_problem_validations` - Public validation tracking

---

## 🔄 Status Flow Diagrams

### Conversation Ideas Status Flow

```
pending_validation → speaker_contacted → speaker_validated → promoted_to_idea
                                    ↓
                            speaker_rejected
```

### Ideas Status Flow

```
transcribing → analyzing → analyzed → matching → matched → funded → public
```

### Mentor Matches Status Flow

```
pending → active → accepted → active → completed
         ↓
      rejected
```

---

## 🎯 Priority: Start with Stage 1-3

**Current Focus**: Stages 1-3 are complete and working.

**Next Focus**: Implement Stage 4 clarification loop (WhatsApp webhook) and Stage 6 admin dashboard.
