# Agent 7: Feature Flag & Priority Agent - Implementation Complete ✅

## Overview

Agent 7 automatically flags exceptional ideas for featured status and assigns priority levels when ideas reach 'matched' status. All actions respect human-in-the-loop requirements.

## Implementation Files

- **Core Agent**: `lib/agents/feature-flag-agent.ts`
- **API Endpoint**: `app/api/agents/feature-flag/route.ts`

## Features Implemented

### ✅ 1. Auto-Flagging Rules

**Trigger**: When `marrai_ideas.status = 'matched'`

**Featured Flagging** (`featured=true` IF):
- ✅ `qualification_tier='exceptional'` AND
- ✅ `ai_impact_score >= 8` AND
- ✅ `matching_score >= 0.8` AND
- ✅ `alignment['moroccoPriorities'].length >= 2`

**Priority Assignment** (`priority='critical'` IF):
- ✅ `featured=true` OR
- ✅ `ai_impact_score >= 9` OR
- ✅ `roi_cost_saved_eur > 2000`

**Priority Levels**:
- `critical`: Featured OR impact >= 9 OR ROI > 2000 EUR
- `high`: Impact >= 7 OR matching >= 0.7
- `medium`: Impact >= 5 OR matching >= 0.5
- `low`: Default

### ✅ 2. Human-in-the-Loop Safeguards

- ✅ **Admin Approval Required**: `visible=true` only if:
  - `featured=true` AND
  - Admin manually approves (`admin_notes` contains "Approved for public")
- ✅ **Admin Override**: Admin can set `featured=false` to prevent auto-flagging
- ✅ **Qualification Tier**: Agent does NOT change `qualification_tier` (admin sets final value)
- ✅ **Default Privacy**: `visible=false` by default (privacy protection)

### ✅ 3. Admin Dashboard Query

Returns ideas that need review:
```sql
SELECT * FROM marrai_ideas 
WHERE status='matched' AND featured IS NULL 
ORDER BY ai_impact_score DESC;
```

## API Usage

### Process Feature Flagging

```typescript
POST /api/agents/feature-flag
{
  "ideaId": "uuid-here",
  "action": "process"
}

// Response:
{
  "success": true,
  "ideaId": "uuid-here",
  "updates": {
    "featured": true,
    "priority": "critical",
    "visible": false
  },
  "reason": "Exceptional idea: tier=exceptional, impact=8.5, match=0.85, priorities=3",
  "errors": []
}
```

### Get Ideas Needing Review

```typescript
POST /api/agents/feature-flag
{
  "action": "get_review_queue",
  "limit": 50
}

// Response:
{
  "success": true,
  "ideas": [...],
  "count": 15
}
```

### Analyze Idea (Preview)

```typescript
POST /api/agents/feature-flag
{
  "ideaId": "uuid-here",
  "action": "analyze"
}

// Response:
{
  "success": true,
  "analysis": {
    "shouldFeature": true,
    "priority": "critical",
    "featuredReason": "...",
    "priorityReason": "..."
  },
  "current": {
    "featured": null,
    "priority": null,
    "visible": false,
    "qualification_tier": "exceptional"
  }
}
```

## Code Usage

### Direct Function Call

```typescript
import { processFeatureFlag } from '@/lib/agents/feature-flag-agent';

const result = await processFeatureFlag(ideaId);
if (result.success) {
  console.log(`Featured: ${result.updates.featured}, Priority: ${result.updates.priority}`);
}
```

### Using Agent Class

```typescript
import { FeatureFlagAgent } from '@/lib/agents/feature-flag-agent';

const agent = new FeatureFlagAgent();

// Process feature flagging
const result = await agent.processFeatureFlag(ideaId);

// Get ideas needing review
const ideas = await agent.getIdeasNeedingReview(50);

// Analyze without updating
const analysis = agent.analyzeIdea(idea);
```

## Integration Points

### When to Call Agent 7

1. **After Idea Becomes Matched**:
   ```typescript
   // In mentor matching logic, after status='matched'
   await fetch('/api/agents/feature-flag', {
     method: 'POST',
     body: JSON.stringify({ ideaId, action: 'process' })
   });
   ```

2. **Admin Dashboard Review Queue**:
   ```typescript
   // Load ideas that need review
   const response = await fetch('/api/agents/feature-flag', {
     method: 'POST',
     body: JSON.stringify({ action: 'get_review_queue', limit: 50 })
   });
   ```

3. **Preview Before Processing**:
   ```typescript
   // Preview what would happen
   const analysis = await fetch('/api/agents/feature-flag', {
     method: 'POST',
     body: JSON.stringify({ ideaId, action: 'analyze' })
   });
   ```

## Database Schema

### Required Fields

- `marrai_ideas.status` (must be 'matched')
- `marrai_ideas.qualification_tier` ('exceptional'|'qualified'|'needs_work')
- `marrai_ideas.ai_impact_score` (numeric 1-10)
- `marrai_ideas.matching_score` (numeric 0-1)
- `marrai_ideas.alignment` (jsonb with `moroccoPriorities` array)
- `marrai_ideas.roi_cost_saved_eur` (numeric)
- `marrai_ideas.featured` (boolean, nullable)
- `marrai_ideas.visible` (boolean, default false)
- `marrai_ideas.priority` (text: 'critical'|'high'|'medium'|'low')
- `marrai_ideas.admin_notes` (text, for approval check)

### Note on `visible` Column

The codebase uses `visible` column (not `public`) as per migration 005. The agent updates both `visible` and `public` for compatibility.

## Human-in-the-Loop Workflow

1. **Idea Reaches 'matched' Status**
   - Agent 7 automatically processes
   - Sets `featured=true` if conditions met
   - Sets `priority` based on scores
   - Sets `visible=false` (default privacy)

2. **Admin Reviews in Dashboard**
   - Query: `status='matched' AND featured IS NULL`
   - Admin reviews each idea
   - Admin sets `qualification_tier` final value
   - Admin can override `featured=false` if sensitive

3. **Admin Approves for Public**
   - Admin adds `admin_notes="Approved for public"`
   - Agent 7 sets `visible=true` (or admin sets manually)
   - Idea becomes publicly visible

## Testing

### Test Feature Flagging

```bash
curl -X POST http://localhost:3000/api/agents/feature-flag \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "your-idea-id",
    "action": "process"
  }'
```

### Test Review Queue

```bash
curl -X POST http://localhost:3000/api/agents/feature-flag \
  -H "Content-Type: application/json" \
  -d '{
    "action": "get_review_queue",
    "limit": 10
  }'
```

### Test Analysis

```bash
curl -X POST http://localhost:3000/api/agents/feature-flag \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "your-idea-id",
    "action": "analyze"
  }'
```

## Status

✅ **Implementation Complete**

All core features from the prompt are implemented:
- ✅ Auto-flagging rules for featured status
- ✅ Priority assignment logic
- ✅ Human-in-the-loop safeguards
- ✅ Admin dashboard query
- ✅ Privacy protection (visible=false default)
- ✅ Admin override capability

Ready for production use!

