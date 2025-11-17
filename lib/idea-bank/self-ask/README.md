# Self-Ask Chain for WhatsApp Idea Refinement

Conversational system that asks 8 follow-up questions in Darija via WhatsApp to refine ideas after initial submission.

## Overview

After a user submits an idea, the system automatically starts a conversational refinement process via WhatsApp. The AI asks 8 strategic questions in Darija to extract structured data about the idea.

## The 8 Questions

1. **Target Segment** (Q1): "Shkoun 3andu had l-mochkil bzaf?"
2. **Willingness to Pay** (Q2): "Ch7al ta-ykhlass bach y7al had l-mochkil?"
3. **Revenue Model** (Q3): "Kifash ghadi ndakhlo l-flouss kol shahar?"
4. **Team/Partnerships** (Q4): "Shkoun ghadi ybanilna f'l-awwal?"
5. **Morocco Priorities** (Q5): "Wash fikrtak kat-sada9 m3a shi awlawiya men dawla?" (Does your idea align with any government priorities?)
6. **Cost Structure** (Q6): "Fin ghadi n9addo l-flouss?"
7. **Quick Win** (Q7): "Ash ghadi nbiwo f 3 ashor?"
8. **Regulatory** (Q8): "Shkoun khasso l-government yawafeq?"

## Features

### NLP Processing
- **Entity Extraction**: Prices, names, locations, numbers
- **Sentiment Detection**: Positive, neutral, negative
- **Darija Number Parsing**: "joj"=2, "tlata"=3, "miya"=100, etc.
- **Voice-to-Text Error Handling**: Tolerant parsing
- **Multi-language Support**: Darija, French, Arabic mixed

### Adaptive Questioning
- **Skip Irrelevant Questions**: Based on previous answers
- **Follow-up Questions**: If response unclear (confidence < 0.6)
- **Rephrasing**: If user seems confused
- **Celebration**: Positive feedback for good answers

### Storage
- **Original Response**: Stored in original language (Darija/French/Arabic)
- **Extracted Data**: Structured JSON per question type
- **Confidence Scores**: 0-1 for response quality
- **Timestamps**: Full audit trail

## Usage

### Start Chain

```typescript
import { startSelfAskChain } from '@/lib/idea-bank/self-ask';

await startSelfAskChain(ideaId, userPhone);
```

### Process Response

```typescript
import { processSelfAskResponse } from '@/lib/idea-bank/self-ask';

const result = await processSelfAskResponse(ideaId, userMessage);
// Automatically asks next question if confidence is good
```

### Get Progress

```typescript
import { SelfAskChain } from '@/lib/idea-bank/self-ask';

const chain = new SelfAskChain();
const progress = await chain.getProgress(ideaId);
const structuredData = await chain.generateStructuredData(ideaId);
```

## API Endpoints

### POST /api/whatsapp/self-ask
Process incoming WhatsApp message

```json
{
  "from": "+212612345678",
  "message": "L-fellahin f l-qarya",
  "ideaId": "uuid"
}
```

### GET /api/whatsapp/self-ask?ideaId=xxx
Get progress and structured data

## Database Schema

See `docs/self-ask-chain-schema.sql` for:
- `self_ask_questions` table
- `self_ask_responses` table
- Indexes and RLS policies

## Integration with WhatsApp

The system integrates with the WhatsApp webhook handler. When a message comes in:

1. Check if idea has active self-ask chain
2. If yes, process as response
3. If no, start new chain
4. Send next question automatically

## Example Flow

```
User submits idea → System sends Q1 via WhatsApp
User: "L-fellahin f l-qarya"
System: Processes → Extracts "fellahin", "qarya" → Confidence: 0.8
System: "Mzyan bzaf! 💪" → Sends Q2
User: "50 dh kol shahar"
System: Extracts price: 50, currency: MAD, frequency: monthly
System: Sends Q3
...
```

## Confidence Scoring

Confidence is calculated based on:
- Text length (longer = better)
- Entity presence (prices, names, numbers)
- Sentiment (positive = better)
- Question-specific requirements

If confidence < 0.6, system asks follow-up question.

## Adaptive Skipping

Questions are automatically skipped if:
- **Regulatory (Q8)**: No government involvement mentioned in idea
- **Team (Q4)**: Team already mentioned in previous responses

## Structured Data Output

After all questions answered:

```typescript
{
  targetSegment: "L-fellahin f l-qarya",
  willingnessToPay: {
    amount: 50,
    currency: "MAD",
    frequency: "monthly"
  },
  revenueModel: "Abonnement kol shahar",
  team: {
    members: ["Ahmed", "Fatima"],
    partnerships: []
  },
  localMoat: "Spécifique l-Maroc b Darija",
  costStructure: {
    initial: 5000,
    monthly: 500,
    currency: "EUR"
  },
  quickWin: "MVP f 3 ashor",
  regulatory: {
    approvals: [],
    notes: "Ma kaynach walo"
  },
  confidence: 0.85,
  completeness: 100
}
```

## Natural Conversation

The system:
- Uses natural Darija
- Celebrates good answers
- Asks follow-ups when unclear
- Provides helpful examples
- Maintains friendly tone

