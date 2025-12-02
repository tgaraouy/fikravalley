# Pre-Seed Framework - Quick Start Guide

## Overview

This guide helps you quickly integrate the Concept Ventures-inspired pre-seed evaluation framework into Fikra Valley.

---

## Step 1: Run Database Migration (5 minutes)

```sql
-- Run in Supabase SQL Editor:
-- supabase/migrations/014_add_preseed_evaluations.sql
```

This creates:
- `marrai_preseed_evaluations` table
- Extends `marrai_ideas` with pre-seed fields

---

## Step 2: Create AI Evaluator Agent (30 minutes)

**File**: `lib/agents/preseed-evaluator-agent.ts`

**Key Function**:
```typescript
async function evaluateIdea(idea: IdeaRow): Promise<PreseedEvaluation> {
  // Use LLM to score each criterion (1-5)
  // Return structured evaluation
}
```

**Prompt Template**:
- Analyze idea against 5 Phase 1 criteria
- Score each 1-5 with rationale
- Calculate averages
- Categorize decision grid

---

## Step 3: Create API Endpoint (15 minutes)

**File**: `app/api/ideas/[id]/preseed-evaluate/route.ts`

**Endpoint**: `POST /api/ideas/[id]/preseed-evaluate`

**Response**: Returns evaluation JSON

---

## Step 4: Create UI Component (1 hour)

**File**: `components/ideas/PreseedEvaluationSection.tsx`

**Features**:
- Display scores visually (1-5 bars)
- Show decision grid
- "Generate Evaluation" button
- "Edit Evaluation" (for mentors)

---

## Step 5: Integrate into Idea Detail Page (15 minutes)

Add to `app/ideas/[id]/page.tsx`:
```tsx
<PreseedEvaluationSection ideaId={idea.id} />
```

---

## Testing Checklist

- [ ] Run migration successfully
- [ ] Generate evaluation for test idea
- [ ] Verify scores are stored correctly
- [ ] Display evaluation in UI
- [ ] Test mentor edit functionality
- [ ] Verify decision grid categorization

---

## Next Steps After Basic Integration

1. **Founder Assessment**: Collect founder trait evidence
2. **Wedge Sharpening**: AI tool to refine beachhead customer
3. **Workflow**: Auto-evaluate on submission
4. **Analytics**: Dashboard for evaluation metrics

---

## Example Evaluation Output

```json
{
  "ideaSelectionLens": {
    "problem_sharpness_score": 4,
    "founder_market_fit_score": 3,
    "asymmetry_wedge_score": 4,
    "evidence_of_pull_score": 2,
    "scale_story_score": 3
  },
  "founderAssessment": {
    "drive_resilience_score": 4,
    "learning_speed_score": 3,
    "ownership_candour_score": 4,
    "focus_score": 3,
    "emotional_stability_score": 4,
    "team_dynamics_score": 3
  },
  "decisionGrid": {
    "overall_founder_score": 3.5,
    "overall_idea_score": 3.2,
    "decision_category": "strong_founders_weak_idea",
    "recommendation": "pivot",
    "recommendation_rationale": "Strong founder traits but idea needs sharper wedge. Focus on beachhead customer definition."
  }
}
```

