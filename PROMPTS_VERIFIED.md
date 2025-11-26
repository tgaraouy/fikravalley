# ✅ Agent Prompts - Verified & Complete

## 🎉 All Prompts Match Your Exact Specifications

### ✅ Verification Status

| Agent | File | Status | Matches Spec |
|-------|------|--------|--------------|
| **Global Rules** | `.cursorrules` | ✅ Complete | ✅ Yes |
| **Agent 1** | `lib/agents/conversation-extractor-agent.ts` | ✅ Complete | ✅ Yes |
| **Agent 2A** | `app/api/analyze-idea/route.ts` | ✅ Complete | ✅ Yes |
| **Agent 2B** | `app/api/analyze-idea/route.ts` | ✅ Complete | ✅ Yes |
| **Agent 2C** | `lib/idea-bank/scoring/two-stage-scorer.ts` | ✅ Complete | ✅ Yes |
| **Agent 5** | `lib/agents/mentor-agent.ts` | ✅ Complete | ✅ Yes |
| **Agent 6** | `lib/agents/notification-agent.ts` | ✅ Complete | ✅ Yes |
| **Agent 7** | `lib/agents/feature-flag-agent.ts` | ✅ Complete | ✅ Yes |

## 📋 What's Included in Each Prompt

### ✅ Agent 1: Conversation Extractor & Validator
- ✅ ROLE definition
- ✅ INPUT fields (speaker_quote, email/phone, session_id)
- ✅ OUTPUT fields (all marrai_conversation_ideas fields)
- ✅ HUMAN-IN-THE-LOOP RULES (confidence < 0.85 validation)
- ✅ VALIDATION QUESTION FORMAT (Darija)
- ✅ EXAMPLE EXTRACTION
- ✅ LANGUAGE handling (Darija/Tamazight/French/English)

### ✅ Agent 2A: Feasibility Scorer
- ✅ ROLE definition (Moroccan tech lead)
- ✅ INPUT fields (problem_statement, data_sources, etc.)
- ✅ OUTPUT fields (ai_feasibility_score, ai_analysis jsonb structure)
- ✅ SCORING CRITERIA (1-10 scale with examples)
- ✅ HUMAN-IN-THE-LOOP RULES
- ✅ MOROCCAN CONTEXT (PDPL, 2G, cost sensitivity)

### ✅ Agent 2B: Impact & ROI Calculator
- ✅ ROLE definition (Moroccan business analyst)
- ✅ INPUT fields (frequency, automation_potential, etc.)
- ✅ OUTPUT fields (roi_time_saved_hours, roi_cost_saved_eur, etc.)
- ✅ CALCULATION LOGIC (frequency + automation combinations)
- ✅ QUALIFICATION TIER rules
- ✅ COST ESTIMATION ranges
- ✅ HUMAN-IN-THE-LOOP rules

### ✅ Agent 2C: SDG & Priority Alignment Mapper
- ✅ ROLE definition (UN development expert)
- ✅ INPUT fields (problem_statement, category, location)
- ✅ OUTPUT structure (alignment jsonb with sdgTags, moroccoPriorities)
- ✅ MAPPING RULES (category combinations → SDGs)
- ✅ MOROCCO PRIORITIES (2024-2030 list)
- ✅ SCORING boost logic

### ✅ Agent 5: Mentor Matcher
- ✅ ROLE definition (Moroccan diaspora connector)
- ✅ INPUT fields (problem_statement, category, ai_capabilities_needed)
- ✅ OUTPUT fields (marrai_mentor_matches creation)
- ✅ MATCHING LOGIC (4-step process with scoring weights)
- ✅ HUMAN-IN-THE-LOOP (admin approval required)
- ✅ LANGUAGE MATCHING rules

### ✅ Agent 6: Notification & Sharing Agent
- ✅ ROLE definition (Moroccan community manager)
- ✅ TRIGGER conditions (visible=true OR featured=true)
- ✅ ACTIONS (WhatsApp/Email/SMS notification)
- ✅ Message format (Darija template)
- ✅ Social share text generation
- ✅ HUMAN-IN-THE-LOOP (admin approval)
- ✅ SAFETY CHECKS (PII protection, rate limiting)

### ✅ Agent 7: Feature Flag & Priority Agent
- ✅ ROLE definition (Moroccan admin's AI assistant)
- ✅ TRIGGER (status='matched')
- ✅ OUTPUT fields (featured, priority, visible, qualification_tier)
- ✅ AUTO-FLAGGING RULES (featured=true conditions)
- ✅ Priority assignment logic
- ✅ HUMAN-IN-THE-LOOP (admin manual approval)
- ✅ ADMIN DASHBOARD QUERY

## 🎯 Key Features Verified

### ✅ Schema Awareness
- All prompts reference exact Supabase field names
- `marrai_ideas` (not `ideas`)
- `marrai_conversation_ideas` (not `conversation_ideas`)
- `marrai_mentor_matches` (not `mentor_matches`)
- All jsonb structures match schema

### ✅ Moroccan Context
- ✅ PDPL (Personal Data Protection Law) mentioned
- ✅ 2G connectivity constraints
- ✅ Diaspora funding context
- ✅ Cost sensitivity (models <1GB)
- ✅ Dirham to EUR conversion (1 EUR ≈ 11 MAD)

### ✅ Human-in-the-Loop
- ✅ Agent 1: Validation for confidence < 0.85
- ✅ Agent 2A: Human review for feasibility < 5
- ✅ Agent 2B: Status change for needs_work tier
- ✅ Agent 5: Admin approval before mentor contact
- ✅ Agent 6: Admin approval before public sharing
- ✅ Agent 7: Admin manual approval for visibility

### ✅ Language Support
- ✅ Darija (Moroccan Arabic)
- ✅ Tamazight (Latin script)
- ✅ French
- ✅ English
- ✅ Original language preservation

## 🧪 How to Use

### In Cursor Chat
```
@agent-1-prompt How should I handle Tamazight input?
@agent-2a-prompt Improve feasibility scoring for 2G connectivity
```

### When Editing Files
Cursor automatically sees the JSDoc prompts at the top of each file and uses them as context.

### Global Rules
The `.cursorrules` file provides base context for all agents.

## ✅ Validation Complete

All prompts are:
- ✅ In the correct files
- ✅ Match your exact specifications
- ✅ Include all required sections
- ✅ Reference correct schema fields
- ✅ Include Moroccan context
- ✅ Enforce human-in-the-loop rules

**Status**: 🎉 **READY TO USE**

---

**Last Verified**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

