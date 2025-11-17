# Two-Stage Idea Scoring System

Based on ITONICS methodology, adapted for Morocco context.

## Overview

The scoring system filters ideas through two gates:

1. **Stage 1: Clarity** (must score ≥6/10 = ≥24/40)
   - Problem Statement (0-10)
   - As-Is Analysis (0-10)
   - Benefit Statement (0-10)
   - Operational Needs (0-10)

2. **Stage 2: Decision** (must score ≥25/40)
   - Strategic Fit (1-5, weighted to 10 points)
   - Feasibility (1-5, weighted to 10 points)
   - Differentiation (1-5, weighted to 10 points)
   - Evidence of Demand (1-5, weighted to 10 points)

## Usage

```typescript
import { scoreIdea, type IdeaScoringInput } from '@/lib/idea-bank/scoring';

const input: IdeaScoringInput = {
  problemStatement: 'Les hôpitaux perdent 2 heures par jour...',
  asIsAnalysis: 'Actuellement, le processus est...',
  benefitStatement: 'Avec un système digital, nous économiserons...',
  operationalNeeds: 'Sources de données: Excel, Forms...',
  estimatedCost: '3K-5K',
  roiTimeSavedHours: 40,
  roiCostSavedEur: 500,
  location: 'Casablanca',
  category: 'health',
  frequency: 'daily',
  urgency: 'high',
  dataSources: ['Excel', 'Forms'],
  integrationPoints: ['Hospital ERP'],
  aiCapabilitiesNeeded: ['NLP'],
};

const result = scoreIdea(input);

console.log('Stage 1 Passed:', result.stage1.passed);
console.log('Stage 2 Passed:', result.stage2?.passed);
console.log('Recommendation:', result.overall.recommendation);
console.log('Break-even:', result.breakEven);
```

## Scoring Details

### Stage 1: Clarity

#### Problem Statement (0-10)
- Content length (0-2)
- Specificity: numbers, metrics, quantifiers (0-3)
- Problem clarity: keywords, impact (0-2)
- Morocco context: location, keywords (0-2)
- Urgency/frequency context (0-1)

#### As-Is Analysis (0-10)
- Content length (0-2)
- Process description: keywords, sequence, current state (0-3)
- Pain points: difficulty, time issues (0-2)
- Stakeholders: users, organizations (0-2)
- Data sources mentioned (0-1)

#### Benefit Statement (0-10)
- Content length (0-2)
- Benefit keywords: improvement, impact (0-2)
- Quantified benefits: numbers, ROI, metrics (0-3)
- Stakeholder benefits: users, experience (0-2)
- Solution clarity (0-1)

#### Operational Needs (0-10)
- Content length (0-2)
- Data sources identified (0-2)
- Integration points (0-2)
- Technical requirements: APIs, AI (0-2)
- Resource needs: team, budget, infrastructure (0-2)

### Stage 2: Decision

#### Strategic Fit (1-5)
- Alignment with Morocco priorities: digital, health, education, agriculture, infrastructure, inclusion (0-2)
- Government alignment (0-1)
- Economic impact (0-0.5)
- Social impact (0-0.5)

#### Feasibility (1-5)
- Cost feasibility: <1K=1, <5K=0.7, <10K=0.4, 10K+=0.2 (0-1)
- Technical complexity: simple integrations, basic AI (0-1)
- Data availability: common sources (0-1)
- Human in loop (0-1)
- ROI indicators: time/cost savings (0-1)

#### Differentiation (1-5)
- Innovation keywords (0-1)
- Morocco-specific context (0-1)
- AI/Technology advantage (0-0.5)
- Problem/solution specificity (0-1)
- Category uniqueness (0-0.5)

#### Evidence of Demand (1-5)
- Frequency: multiple_daily/daily=1, weekly=0.7, monthly=0.4 (0-1)
- Urgency: critical=1, high=0.7, medium=0.4 (0-1)
- Stakeholder impact: number of stakeholders mentioned (0-1)
- ROI evidence: time/cost savings (0-1)
- Problem severity keywords (0-1)

## Break-Even Analysis

Calculates months to break-even based on:
- Estimated cost
- Monthly savings (annual ROI / 12)

Feasible if break-even ≤ 24 months.

## Darija Detection

Detects Moroccan Arabic (Darija) keywords in text to identify local context.

## Recommendations

Use `getScoringRecommendations()` to get actionable feedback for improving scores.

## Test Suite

Run tests with:

```typescript
import { runScoringTests } from '@/lib/idea-bank/scoring/two-stage-scorer.test';

runScoringTests();
```

Test cases include:
- Strong healthcare idea
- Weak education idea (needs improvement)
- Agriculture idea with Darija
- Government service idea

