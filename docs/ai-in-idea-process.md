# AI Involvement in the Idea Process

This document outlines where and how AI (Claude API) is involved in the idea submission and analysis workflow.

## Overview

AI is used at **4 main stages** of the idea process:

1. **Extraction** - Extracting ideas from workshop conversations
2. **Analysis** - Deep analysis of submitted ideas
3. **Scoring** - Two-stage scoring system (with AI-assisted auto-tagging)
4. **Feedback** - Generating clarity feedback for low-scoring ideas

---

## 1. Idea Extraction from Conversations

**File:** `app/api/extract-ideas/route.ts`

**When:** After workshop sessions, when transcripts are processed

**What AI Does:**
- Analyzes conversation transcripts to identify digitization ideas
- Extracts structured data from unstructured conversation text
- Identifies problem statements, solutions, and opportunities
- Assigns confidence scores (≥0.70) to extracted ideas

**AI Prompt Structure:**
```
Analyse cette conversation et extrais toutes les idées de problèmes 
ou d'opportunités de numérisation mentionnés.

Pour chaque idée identifiée, extrais:
- La citation exacte du locuteur
- Le titre de problème
- La description détaillée
- Le processus manuel actuel
- La solution proposée
- L'opportunité de numérisation
- Une catégorie
- Un score de confiance (0.70-1.00)
```

**Output:** Array of `ExtractedIdea` objects stored in `marrai_conversation_ideas` table

**Trigger:** 
- Manual trigger from moderator dashboard (`app/moderator/page.tsx`)
- Automatic trigger after transcript ingestion (`app/api/ingest-transcripts/route.ts`)

---

## 2. Deep Idea Analysis

**File:** `app/api/analyze-idea/route.ts`

**When:** After an idea is submitted or promoted from conversation

**What AI Does:**
- Analyzes feasibility and automation potential
- Designs agent architecture (workflow, data, decision, interface, hybrid)
- Estimates technical complexity, cost, and development time
- Creates digitization roadmap (3 phases: MVP → Automation → Full Agent)
- Calculates ROI (time saved, cost saved, payback period)
- Identifies strengths, challenges, and next steps
- Assesses scalability and market size
- Generates impact score

**AI Prompt Structure:**
```
Analyse cette idée de numérisation et fournis une analyse complète au format JSON.

IDÉE À ANALYSER:
- Titre: [title]
- Problème: [problem_statement]
- Solution proposée: [proposed_solution]
- Processus actuel: [current_manual_process]
- Opportunité: [digitization_opportunity]

Fournis:
- feasibility_score (0-10)
- automation_potential (high/medium/low)
- agent_architecture (name, type, triggers, actions, tools)
- technical_feasibility (complexity, cost, dev_time)
- digitization_roadmap (phase_1_mvp, phase_2_automation, phase_3_full_agent)
- roi_analysis (time_saved, cost_saved, payback_period, automation_percentage, annual_roi)
- strengths, challenges, next_steps
- scalability (replicability, market_size)
- impact_score (0-10)
- summary
```

**Output:** `ClaudeAnalysisResponse` stored in:
- `marrai_ideas.ai_analysis` (JSONB column)
- `marrai_ideas.ai_feasibility_score`
- `marrai_ideas.ai_impact_score`
- `marrai_ideas.automation_potential`
- `marrai_agent_solutions` table

**Trigger:**
- Automatic after idea submission (if configured)
- Manual trigger from admin dashboard
- After promoting conversation idea to main table (`app/api/promote-idea/route.ts`)
- After seeding sample ideas (`app/api/seed-ideas/route.ts`)

**Fallback:** If Claude API fails, uses `generateFallbackAnalysis()` with default values

---

## 3. Two-Stage Scoring System

**File:** `lib/idea-bank/scoring/two-stage-scorer.ts`

**When:** After idea submission, before public visibility

**What AI Does (Indirectly):**
- **Auto-detects Morocco priorities** from text using keyword matching
- **Auto-tags SDGs** using text analysis and keyword detection
- **Detects Darija** (Moroccan Arabic) in text for cultural context

**Scoring Functions (Rule-Based, Not AI):**
- `scoreStage1()` - Clarity scoring (0-40 points)
  - Problem Statement (0-10)
  - As-Is Analysis (0-10)
  - Benefit Statement (0-10)
  - Operational Needs (0-10)
- `scoreStage2()` - Decision scoring (0-20 points)
  - Strategic Fit (1-5)
  - Feasibility (1-5)
  - Differentiation (1-5)
  - Evidence of Demand (1-5)

**AI-Assisted Features:**
- `detectMoroccoPriorities(text)` - Keyword-based detection
- `autoTagSDGs(input)` - Text analysis for SDG alignment
- `detectDarija(text)` - Language detection

**Output:** 
- Scores stored in `marrai_clarity_scores` and `marrai_decision_scores`
- Qualification tier: `exceptional` (≥30), `qualified` (≥25), `developing` (≥15)
- Break-even analysis
- Funding eligibility (Intilaka, EU grants, Climate funds)

**Trigger:** 
- Automatic after idea submission
- Manual re-scoring from admin dashboard

---

## 4. Clarity Feedback Generation

**File:** `lib/idea-bank/feedback/clarity-feedback.ts`

**When:** When idea scores <6/10 on clarity (Stage 1 fails)

**What AI Does:**
- Analyzes each clarity criterion
- Identifies specific gaps and issues
- Provides actionable suggestions
- Generates examples (current vs improved)
- Estimates time to fix each issue
- Prioritizes quick wins

**Output:** `ClarityFeedback` object with:
```typescript
{
  overall: { score, status, message },
  items: [
    {
      criterion: string,
      score: number,
      issues: string[],
      suggestions: string[],
      examples: { current, improved },
      estimatedTimeToFix: number
    }
  ],
  quickWins: string[],
  priorityOrder: string[],
  estimatedTotalTime: number
}
```

**Trigger:**
- Automatic when clarity score <6/10
- Manual from admin dashboard
- API endpoint: `POST /api/ideas/feedback`

---

## AI Configuration

**Claude Model:** `claude-3-5-sonnet-20241022` (or `claude-3-opus-20240229`)

**File:** `lib/anthropic.ts`

**Environment Variables:**
- `ANTHROPIC_API_KEY` - Required for all AI features

**Token Limits:**
- Analysis: `max_tokens: 4000`
- Extraction: `max_tokens: 4000`

---

## Workflow Diagram

```
1. Workshop Conversation
   ↓
2. Transcript Ingestion
   ↓
3. AI Extraction (extract-ideas API)
   → Extracts ideas → marrai_conversation_ideas
   ↓
4. Promote to Main Table (promote-idea API)
   → Creates idea → marrai_ideas
   ↓
5. AI Analysis (analyze-idea API)
   → Deep analysis → marrai_ideas.ai_analysis
   → Agent architecture → marrai_agent_solutions
   ↓
6. Two-Stage Scoring (scoreIdea function)
   → Stage 1: Clarity (0-40)
   → Stage 2: Decision (0-20)
   → Auto-tag SDGs & Morocco priorities
   ↓
7. If Stage 1 < 6/10:
   → Generate Clarity Feedback (generateClarityFeedback)
   → Provide actionable suggestions
   ↓
8. If Stage 1 ≥ 6/10 AND Stage 2 ≥ 25/40:
   → Mark as "qualified" or "exceptional"
   → Auto-generate Intilaka PDF (if implemented)
```

---

## Key Files

### AI Endpoints
- `app/api/extract-ideas/route.ts` - Extract ideas from conversations
- `app/api/analyze-idea/route.ts` - Deep analysis of ideas
- `app/api/ideas/feedback/route.ts` - Generate clarity feedback

### AI Libraries
- `lib/anthropic.ts` - Claude API client
- `lib/idea-bank/scoring/two-stage-scorer.ts` - Scoring with AI-assisted tagging
- `lib/idea-bank/feedback/clarity-feedback.ts` - Feedback generation

### Triggers
- `app/api/promote-idea/route.ts` - Triggers analysis after promotion
- `app/api/ingest-transcripts/route.ts` - Triggers extraction after transcript ingestion
- `app/api/seed-ideas/route.ts` - Triggers analysis for seeded ideas

---

## Error Handling

All AI endpoints have fallback mechanisms:

1. **Extract Ideas:** Returns empty array if Claude fails
2. **Analyze Idea:** Uses `generateFallbackAnalysis()` with default values
3. **Scoring:** Rule-based, no AI dependency (only auto-tagging uses keyword matching)
4. **Feedback:** Rule-based, no AI dependency

---

## Future AI Enhancements

Potential areas for additional AI integration:

1. **Self-Ask Chain** (`lib/idea-bank/self-ask/chain.ts`) - WhatsApp conversation refinement (not yet implemented)
2. **Intilaka PDF Generation** - AI-enhanced grant application (partially implemented)
3. **Mentor Matching** - AI-powered mentor suggestions
4. **Similar Ideas Detection** - Find related ideas using embeddings
5. **Automatic Categorization** - Enhanced category detection
6. **Sentiment Analysis** - Analyze user feedback and validation responses

