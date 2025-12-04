# MVP Cocktail & Minimum Success Criteria Integration Plan

## Overview

This document outlines how to integrate two powerful frameworks into Fikra Valley:
1. **MVP Cocktail Framework** (4-step process for building minimum valuable products)
2. **Minimum Success Criteria Framework** (3-level validation system)

These frameworks will help founders move from idea → validated MVP → traction faster.

---

## Part 1: MVP Cocktail Framework Integration

### Core Concept
**MVP = Minimum Valuable Product** (not just viable, but valuable)
- Focus on **delighters** first, then **performance**, then **must-haves**
- Use **Wizard of Oz MVP** pattern to innovate around basic features

### 4-Step MVP Cocktail Process

#### Step 1: Identify ONE Delighter Feature
**What it is:** The unique value proposition that makes your product categorically different.

**Integration into Fikra Valley:**
- Add a new field to `marrai_ideas`: `delighter_feature` (TEXT)
- Add AI agent prompt: "Extract the ONE delighter feature that makes this idea categorically different from competitors"
- Display prominently in idea detail page as "🌟 Delighter Feature"
- Use in matching algorithm (match mentors who can help validate/build delighters)

**UI Changes:**
- Add "Delighter Feature" section in idea submission flow
- Show delighter badge on idea cards
- Add "Delighter Analysis" button in idea detail page

#### Step 2: Define Minimum Performance Metrics
**What it is:** The minimum standards your product must meet to be taken seriously.

**Integration:**
- Add `minimum_performance_metrics` (JSONB) to `marrai_ideas`
- Structure: `{ "metric_name": "value", "unit": "unit", "reason": "why this matters" }`
- Example: `{ "range": "200", "unit": "miles", "reason": "Minimum range to compete with combustion vehicles" }`
- AI agent analyzes: "What are the minimum performance standards this idea must meet?"

**UI Changes:**
- Add "Minimum Performance Metrics" section in idea detail
- Show as checklist/badges: "✅ Meets minimum performance"
- Use in feasibility scoring

#### Step 3: Layer Additional Axis of "Better"
**What it is:** A second delighter that creates a 2x2 differentiation matrix.

**Integration:**
- Add `secondary_delighter` (TEXT) to `marrai_ideas`
- AI agent suggests: "What's a second axis where this idea can be better?"
- Display as "🎯 Second Axis of Better"
- Use in positioning/messaging generation

**UI Changes:**
- Show both delighters side-by-side
- Generate positioning statement: "The [delighter 1] and [delighter 2] [product category]"

#### Step 4: Innovate Around Basic Features (Wizard of Oz MVP)
**What it is:** Use existing tools/products instead of building basic features from scratch.

**Integration:**
- Add `basic_features_strategy` (JSONB) to `marrai_ideas`
- Structure: `{ "feature": "name", "strategy": "build|integrate|outsource", "tool": "existing tool name" }`
- AI agent suggests: "What basic features can be integrated vs. built?"
- Track integration opportunities (e.g., "Export to CAD", "Plug-in to existing platform")

**UI Changes:**
- Add "Basic Features Strategy" section
- Show integration opportunities as badges
- Link to relevant tools/platforms

---

## Part 2: Minimum Success Criteria Framework Integration

### Core Concept
**You don't need perfect validation. You need minimum sufficient evidence at every stage.**

### Three Levels of Minimum Success Criteria

#### Level 1: Founder-Level (3-Year Goal)
**What it is:** The smallest outcome that would deem your startup a success 3 years from now.

**Integration:**
- Add `founder_success_criteria` (JSONB) to `marrai_ideas`
- Structure:
  ```json
  {
    "three_year_goal": "description",
    "target_metric": "ARR|users|revenue",
    "target_value": 1000000,
    "unit": "USD|users|etc",
    "personal_motivation": "why this matters to founder"
  }
  ```
- Add AI agent: "Founder Success Criteria Analyzer"
- Validate: "Can this idea realistically achieve the founder's 3-year goal?"

**UI Changes:**
- Add "Founder Success Criteria" section in idea submission
- Show progress bar: "On track for 3-year goal?"
- Use in idea prioritization/scoring

#### Level 2: 90-Day Cycle Level
**What it is:** Minimum traction needed in next 90 days to deem project "still alive."

**Integration:**
- Add `ninety_day_goals` (JSONB) to `marrai_ideas`
- Structure:
  ```json
  {
    "current_cycle": 1,
    "traction_goal": {
      "metric": "customers|revenue|users",
      "target": 10,
      "current": 0
    },
    "growth_rate_assumption": "10x|5x|2x",
    "derived_from_three_year": true
  }
  ```
- Auto-calculate from founder-level goal using growth rate assumptions
- Track progress: `current_traction` vs `target_traction`

**UI Changes:**
- Add "90-Day Traction Dashboard" for each idea
- Show progress: "5/10 customers (50% of goal)"
- Alert when behind: "⚠️ Behind schedule - consider pivot"

#### Level 3: Experiment Level (2 Weeks Max)
**What it is:** Minimum success criteria for individual experiments/campaigns.

**Integration:**
- Create new table: `marrai_idea_experiments`
- Structure:
  ```sql
  CREATE TABLE marrai_idea_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID REFERENCES marrai_ideas(id),
    experiment_name TEXT NOT NULL,
    duration_days INTEGER DEFAULT 14,
    success_criteria JSONB NOT NULL, -- { "metric": "attention|trust|revenue", "target": 10 }
    results JSONB, -- { "metric": "attention", "achieved": 8, "success": false }
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'failed'))
  );
  ```
- Link experiments to traction funnel: Attention → Trust → Revenue → Referrals

**UI Changes:**
- Add "Experiments" tab in idea detail page
- Show experiment timeline
- Track conversion funnel: Attention → Trust → Revenue

---

## Part 3: Traction Funnel Integration

### Core Concept
**Traction = Attention → Trust → Revenue → Referrals**

### Integration:
- Add `traction_funnel` (JSONB) to `marrai_ideas`
- Structure:
  ```json
  {
    "attention": { "metric": "views|signups", "current": 100, "target": 1000 },
    "trust": { "metric": "demos|trials", "current": 10, "target": 100 },
    "revenue": { "metric": "paying_customers", "current": 2, "target": 10 },
    "referrals": { "metric": "referrals", "current": 0, "target": 5 }
  }
  ```
- Auto-calculate conversion rates: Attention → Trust, Trust → Revenue, etc.
- Use in experiment success criteria

**UI Changes:**
- Add "Traction Funnel" visualization in idea dashboard
- Show conversion rates between stages
- Highlight bottlenecks: "Low Trust → Revenue conversion (2%)"

---

## Part 4: AI Agent Enhancements

### New Agents to Create:

1. **MVP Cocktail Analyzer**
   - Analyzes idea for delighter features
   - Suggests minimum performance metrics
   - Identifies integration opportunities
   - Generates positioning statement

2. **Success Criteria Validator**
   - Validates founder-level goals are realistic
   - Calculates 90-day goals from 3-year goal
   - Suggests experiment-level success criteria
   - Tracks progress against goals

3. **Traction Funnel Analyzer**
   - Identifies bottlenecks in conversion funnel
   - Suggests experiments to improve conversion
   - Tracks progress across funnel stages

### Enhanced Existing Agents:

1. **Feasibility Scorer** → Include MVP Cocktail analysis
2. **Impact Scorer** → Include delighter potential
3. **Mentor Matcher** → Match mentors who can help with specific MVP steps

---

## Part 5: Database Schema Changes

### New Fields for `marrai_ideas`:

```sql
-- MVP Cocktail Fields
ALTER TABLE marrai_ideas ADD COLUMN delighter_feature TEXT;
ALTER TABLE marrai_ideas ADD COLUMN minimum_performance_metrics JSONB;
ALTER TABLE marrai_ideas ADD COLUMN secondary_delighter TEXT;
ALTER TABLE marrai_ideas ADD COLUMN basic_features_strategy JSONB;

-- Success Criteria Fields
ALTER TABLE marrai_ideas ADD COLUMN founder_success_criteria JSONB;
ALTER TABLE marrai_ideas ADD COLUMN ninety_day_goals JSONB;
ALTER TABLE marrai_ideas ADD COLUMN traction_funnel JSONB;
```

### New Table: `marrai_idea_experiments`

```sql
CREATE TABLE marrai_idea_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  experiment_name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER DEFAULT 14,
  success_criteria JSONB NOT NULL,
  results JSONB,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_idea_experiments_idea_id ON marrai_idea_experiments(idea_id);
CREATE INDEX idx_idea_experiments_status ON marrai_idea_experiments(status);
```

---

## Part 6: UI/UX Changes

### Idea Submission Flow:
1. **Step 1:** Basic idea (existing)
2. **Step 2:** MVP Cocktail Analysis
   - "What's your ONE delighter feature?"
   - "What are minimum performance metrics?"
   - "What's a second axis of better?"
   - "How will you handle basic features?"
3. **Step 3:** Success Criteria
   - "What's your 3-year goal?"
   - Auto-calculate 90-day goals
   - "What's your first experiment?"

### Idea Detail Page:
1. **New Tab: "MVP Cocktail"**
   - Delighter features
   - Performance metrics
   - Basic features strategy
   - Positioning statement

2. **New Tab: "Success Criteria"**
   - 3-year goal progress
   - 90-day traction dashboard
   - Experiment timeline
   - Traction funnel visualization

3. **Enhanced "Analysis" Section**
   - Include MVP Cocktail score
   - Include success criteria validation

### Dashboard:
- Add "MVP Cocktail Score" to idea cards
- Add "Traction Progress" indicator
- Show "Behind Schedule" alerts

---

## Part 7: Implementation Phases

### Phase 1: MVP Cocktail Framework (Week 1-2)
- [ ] Add database fields for MVP Cocktail
- [ ] Create MVP Cocktail Analyzer agent
- [ ] Update idea submission flow
- [ ] Add MVP Cocktail tab to idea detail page
- [ ] Update AI analysis to include MVP Cocktail

### Phase 2: Success Criteria Framework (Week 3-4)
- [ ] Add database fields for success criteria
- [ ] Create Success Criteria Validator agent
- [ ] Add success criteria section to submission flow
- [ ] Create 90-day traction dashboard
- [ ] Add progress tracking

### Phase 3: Experiments & Traction Funnel (Week 5-6)
- [ ] Create `marrai_idea_experiments` table
- [ ] Build experiment tracking UI
- [ ] Add traction funnel visualization
- [ ] Create experiment success criteria calculator
- [ ] Add conversion rate tracking

### Phase 4: Integration & Polish (Week 7-8)
- [ ] Integrate all frameworks into existing agents
- [ ] Update mentor matching to include MVP expertise
- [ ] Add alerts/notifications for behind-schedule ideas
- [ ] Create comprehensive dashboard
- [ ] Write documentation

---

## Part 8: Validation Traps to Avoid

### Trap 1: Confusing Learning with Traction
**Solution:** Track actual conversions, not just interviews/feedback.

**Integration:**
- Add "Learning vs. Traction" metric to experiments
- Show: "10 interviews, 0 conversions = insufficient traction"
- Require minimum conversion rate for experiment success

### Trap 2: Waiting for Statistical Significance
**Solution:** Use qualitative feedback + small quantitative signals.

**Integration:**
- For early experiments, accept qualitative signals: "5/5 customers said they'd pay"
- For later experiments, require quantitative: "10 paying customers"
- Show both qualitative and quantitative progress

### Trap 3: Over-Planning
**Solution:** Focus on experiments, not perfect plans.

**Integration:**
- Limit experiment planning to 2 weeks max
- Require "start experiment" action, not just planning
- Track "planning time" vs "experiment time"

---

## Part 9: Example Integration Flow

### For a New Idea Submission:

1. **Founder submits idea:** "VR platform for architects"

2. **MVP Cocktail Analysis:**
   - Delighter: "Turn 2D sketch → 3D VR in 30 seconds"
   - Performance: "Must work on mobile phone (not require training)"
   - Secondary: "Reusable catalog of furniture/components"
   - Basic Features: "Export to CAD (integrate with existing tools)"

3. **Success Criteria:**
   - 3-Year Goal: "$1M ARR from 833 customers at $100/month"
   - 90-Day Goal: "10 paying customers"
   - First Experiment: "5 architect demos, 2 conversions"

4. **Traction Funnel:**
   - Attention: "100 views" → Trust: "10 demos" → Revenue: "2 customers" → Referrals: "0"

5. **Progress Tracking:**
   - Show: "On track" or "Behind schedule"
   - Suggest: "Need 8 more customers to hit 90-day goal"

---

## Part 10: Success Metrics

### For Founders:
- **Time to MVP:** Reduced from 6 months → 2 months
- **Validation Speed:** Experiments completed in 2 weeks (not 2 months)
- **Pivot Speed:** Identify failures in 90 days (not 1 year)

### For Fikra Valley:
- **Idea Quality:** Higher delighter scores = better ideas
- **Engagement:** More experiments = more active founders
- **Mentor Matching:** Better matches based on MVP expertise

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize phases** based on user needs
3. **Create detailed technical specs** for each phase
4. **Start with Phase 1** (MVP Cocktail Framework)
5. **Iterate based on user feedback**

---

## References

- MVP Cocktail Framework: 4-step process for building minimum valuable products
- Minimum Success Criteria: 3-level validation system (Founder → 90-Day → Experiment)
- Kano Model: 5 feature types (Must-haves, Performance, Delighters, Indifference, Reverse)
- Traction Funnel: Attention → Trust → Revenue → Referrals

