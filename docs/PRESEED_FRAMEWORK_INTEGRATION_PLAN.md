# Pre-Seed Framework Integration Plan

## Overview

Integrate Concept Ventures-inspired pre-seed evaluation framework into Fikra Valley to provide structured, narrative-driven assessment of ideas and founders at the earliest stage.

---

## Phase 1: Database Schema Extensions

### New Tables/Columns

#### 1. `marrai_preseed_evaluations` Table
```sql
CREATE TABLE marrai_preseed_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  evaluated_by UUID REFERENCES marrai_mentors(id), -- Mentor/Investor who evaluated
  evaluated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Phase 1: Idea Selection Lens (1-5 scores)
  problem_sharpness_score INTEGER CHECK (problem_sharpness_score BETWEEN 1 AND 5),
  problem_sharpness_notes TEXT,
  
  founder_market_fit_score INTEGER CHECK (founder_market_fit_score BETWEEN 1 AND 5),
  founder_market_fit_notes TEXT,
  unfair_insight TEXT, -- What is their "earned secret"?
  
  asymmetry_wedge_score INTEGER CHECK (asymmetry_wedge_score BETWEEN 1 AND 5),
  asymmetry_wedge_notes TEXT,
  beachhead_customer TEXT, -- Specific customer definition
  wedge_description TEXT, -- Distribution channel, regulatory quirk, workflow insight
  
  evidence_of_pull_score INTEGER CHECK (evidence_of_pull_score BETWEEN 1 AND 5),
  evidence_of_pull_notes TEXT,
  loi_count INTEGER DEFAULT 0,
  pilot_count INTEGER DEFAULT 0,
  discovery_calls_count INTEGER DEFAULT 0,
  
  scale_story_score INTEGER CHECK (scale_story_score BETWEEN 1 AND 5),
  scale_story_notes TEXT,
  path_to_100m TEXT, -- Rough sketch of expansion path
  
  -- Phase 2: Founder Assessment (1-5 scores per trait)
  drive_resilience_score INTEGER CHECK (drive_resilience_score BETWEEN 1 AND 5),
  drive_resilience_notes TEXT,
  
  learning_speed_score INTEGER CHECK (learning_speed_score BETWEEN 1 AND 5),
  learning_speed_notes TEXT,
  
  ownership_candour_score INTEGER CHECK (ownership_candour_score BETWEEN 1 AND 5),
  ownership_candour_notes TEXT,
  
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  focus_notes TEXT,
  
  emotional_stability_score INTEGER CHECK (emotional_stability_score BETWEEN 1 AND 5),
  emotional_stability_notes TEXT,
  
  team_dynamics_score INTEGER CHECK (team_dynamics_score BETWEEN 1 AND 5),
  team_dynamics_notes TEXT,
  
  -- Phase 3: Decision Grid
  overall_founder_score NUMERIC(3,2), -- Average of founder traits (1-5)
  overall_idea_score NUMERIC(3,2), -- Average of idea lens scores (1-5)
  decision_category TEXT CHECK (decision_category IN ('strong_founders_strong_idea', 'strong_founders_weak_idea', 'weak_founders_strong_idea')),
  recommendation TEXT, -- 'invest', 'pivot', 'pass', 'de-risk'
  recommendation_rationale TEXT,
  
  -- Metadata
  evaluation_version TEXT DEFAULT '1.0', -- Framework version
  is_ai_generated BOOLEAN DEFAULT false,
  confidence_score NUMERIC(3,2), -- How confident is the evaluation?
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preseed_evaluations_idea_id ON marrai_preseed_evaluations(idea_id);
CREATE INDEX idx_preseed_evaluations_evaluated_by ON marrai_preseed_evaluations(evaluated_by);
CREATE INDEX idx_preseed_evaluations_decision_category ON marrai_preseed_evaluations(decision_category);
```

#### 2. Extend `marrai_ideas` Table
```sql
-- Add pre-seed specific fields
ALTER TABLE marrai_ideas
ADD COLUMN IF NOT EXISTS beachhead_customer TEXT,
ADD COLUMN IF NOT EXISTS wedge_description TEXT,
ADD COLUMN IF NOT EXISTS unfair_insight TEXT,
ADD COLUMN IF NOT EXISTS loi_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pilot_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS discovery_calls_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS path_to_100m TEXT;
```

#### 3. `marrai_founder_assessments` Table (Optional - if tracking founders separately)
```sql
CREATE TABLE marrai_founder_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  submitter_email TEXT, -- Link to idea submitter
  
  -- Founder traits (1-5 scores)
  drive_resilience_score INTEGER CHECK (drive_resilience_score BETWEEN 1 AND 5),
  learning_speed_score INTEGER CHECK (learning_speed_score BETWEEN 1 AND 5),
  ownership_candour_score INTEGER CHECK (ownership_candour_score BETWEEN 1 AND 5),
  focus_score INTEGER CHECK (focus_score BETWEEN 1 AND 5),
  emotional_stability_score INTEGER CHECK (emotional_stability_score BETWEEN 1 AND 5),
  team_dynamics_score INTEGER CHECK (team_dynamics_score BETWEEN 1 AND 5),
  
  -- Evidence/stories
  drive_evidence TEXT, -- Stories of resilience
  learning_evidence TEXT, -- Examples of quick learning
  ownership_evidence TEXT, -- Examples of taking responsibility
  
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  assessed_by UUID REFERENCES marrai_mentors(id)
);
```

---

## Phase 2: AI Agent Implementation

### Agent: `preseed-evaluator-agent.ts`

**Purpose**: Automatically evaluate ideas using the pre-seed framework

**Location**: `lib/agents/preseed-evaluator-agent.ts`

**Key Functions**:

1. **`evaluateIdeaSelectionLens(idea)`**
   - Scores: Problem Sharpness, Founder-Market Fit, Asymmetry/Wedge, Evidence of Pull, Scale Story
   - Returns structured scores + notes

2. **`evaluateFounderTraits(idea, submitterData)`**
   - Scores: Drive, Learning Speed, Ownership, Focus, Emotional Stability, Team Dynamics
   - Requires additional data: founder stories, previous work, team composition

3. **`generateDecisionGrid(founderScore, ideaScore)`**
   - Categorizes: Strong Founders + Strong Idea, Strong Founders + Weak Idea, Weak Founders + Strong Idea
   - Provides recommendation: invest, pivot, pass, de-risk

4. **`suggestWedgeSharpening(idea)`**
   - AI suggests how to sharpen the beachhead customer definition
   - Identifies potential wedges (distribution, regulatory, workflow)

**LLM Prompt Structure**:
- Use Claude/GPT to analyze idea against framework criteria
- Request structured JSON output matching evaluation schema
- Include examples of "good" vs "weak" answers

---

## Phase 3: API Endpoints

### 1. `POST /api/ideas/[id]/preseed-evaluate`
**Purpose**: Generate AI-powered pre-seed evaluation

**Request**:
```json
{
  "includeFounderAssessment": true,
  "evaluatorId": "mentor-uuid" // Optional: if mentor is evaluating
}
```

**Response**:
```json
{
  "evaluation": {
    "ideaSelectionLens": {
      "problem_sharpness_score": 4,
      "problem_sharpness_notes": "...",
      "founder_market_fit_score": 3,
      // ... all Phase 1 scores
    },
    "founderAssessment": {
      "drive_resilience_score": 4,
      // ... all Phase 2 scores
    },
    "decisionGrid": {
      "overall_founder_score": 3.8,
      "overall_idea_score": 3.5,
      "decision_category": "strong_founders_weak_idea",
      "recommendation": "pivot",
      "recommendation_rationale": "..."
    }
  }
}
```

### 2. `GET /api/ideas/[id]/preseed-evaluation`
**Purpose**: Fetch existing evaluation

### 3. `POST /api/ideas/[id]/preseed-evaluation`
**Purpose**: Manual evaluation by mentor/investor

### 4. `GET /api/preseed/evaluations`
**Purpose**: List all evaluations (for mentors/investors)

**Query Params**:
- `decision_category`: Filter by decision type
- `min_founder_score`: Filter by minimum founder score
- `min_idea_score`: Filter by minimum idea score

---

## Phase 4: UI Components

### 1. `PreseedEvaluationSection.tsx`
**Location**: `components/ideas/PreseedEvaluationSection.tsx`

**Features**:
- Display evaluation scores in visual format (1-5 stars/bars)
- Show decision grid visualization
- Display recommendation with rationale
- "Generate Evaluation" button (AI-powered)
- "Edit Evaluation" button (for mentors)

**Sections**:
- **Phase 1: Idea Selection Lens** (5 criteria with scores)
- **Phase 2: Founder Assessment** (6 traits with scores)
- **Phase 3: Decision Grid** (visual matrix)
- **Recommendations** (action items)

### 2. `WedgeSharpeningModal.tsx`
**Purpose**: Help founders sharpen their beachhead customer definition

**Features**:
- AI-suggested wedge improvements
- Interactive form to refine beachhead customer
- Examples of good wedges

### 3. `FounderAssessmentForm.tsx`
**Purpose**: Collect founder trait evidence

**Features**:
- Forms for each trait (Drive, Learning, Ownership, etc.)
- Upload evidence (stories, examples)
- Self-assessment + mentor assessment

### 4. Admin Dashboard: `app/admin/preseed-evaluations/page.tsx`
**Purpose**: View all evaluations, filter by decision category

---

## Phase 5: Integration Points

### 1. Idea Detail Page (`app/ideas/[id]/page.tsx`)
- Add "Pre-Seed Evaluation" tab/section
- Show evaluation scores prominently
- Link to wedge sharpening tool

### 2. Mentor Dashboard (`app/mentor/dashboard`)
- Show evaluations assigned to mentor
- Quick evaluation form
- Filter ideas by evaluation status

### 3. Idea Submission Flow (`app/submit/page.tsx`)
- Optional: Collect pre-seed framework data during submission
- Ask for: beachhead customer, wedge description, unfair insight
- Collect founder stories/evidence

### 4. Mentor Matching (`lib/agents/mentor-agent.ts`)
- Consider pre-seed evaluation scores in matching
- Match mentors with expertise in specific evaluation areas

---

## Phase 6: Workflow Integration

### Workflow: "Pre-Seed Evaluation Journey"

1. **Idea Submitted** → Auto-generate initial evaluation (AI)
2. **Mentor Assigned** → Mentor reviews AI evaluation, adds manual assessment
3. **Founder Feedback** → Founder sees evaluation, can respond/clarify
4. **Iteration** → If "pivot" recommended, founder can refine idea
5. **Re-evaluation** → After pivot, re-run evaluation
6. **Decision** → Final recommendation stored

### Notifications
- Notify founder when evaluation is complete
- Notify mentor when new idea needs evaluation
- Notify admin when "strong_founders_strong_idea" is identified

---

## Phase 7: Reporting & Analytics

### Metrics Dashboard
- Distribution of decision categories
- Average founder scores vs idea scores
- Most common weaknesses (low scores)
- Success rate by decision category (track outcomes)

### Export
- Export evaluations to CSV/Excel
- Generate evaluation reports (PDF)
- Share evaluation summaries with founders

---

## Implementation Priority

### Week 1: Foundation
1. ✅ Create database migration
2. ✅ Create `preseed-evaluator-agent.ts`
3. ✅ Create API endpoints (POST/GET evaluation)

### Week 2: UI Components
4. ✅ Create `PreseedEvaluationSection.tsx`
5. ✅ Integrate into idea detail page
6. ✅ Create `WedgeSharpeningModal.tsx`

### Week 3: Workflow
7. ✅ Auto-evaluate on idea submission
8. ✅ Mentor evaluation interface
9. ✅ Founder feedback mechanism

### Week 4: Polish
10. ✅ Admin dashboard
11. ✅ Reporting & analytics
12. ✅ Documentation & training

---

## Technical Considerations

### AI Evaluation Accuracy
- Use structured prompts with examples
- Request confidence scores
- Allow manual override by mentors

### Data Collection
- Founder assessment requires additional data
- May need to extend idea submission form
- Consider optional vs required fields

### Performance
- Cache evaluations (don't re-run unnecessarily)
- Batch evaluation for multiple ideas
- Async processing for AI evaluations

### Privacy
- Founder assessments are sensitive
- Only visible to assigned mentors + founder
- Admin can view aggregated (anonymized) data

---

## Success Metrics

1. **Adoption**: % of ideas with evaluations
2. **Accuracy**: Mentor agreement with AI scores (correlation)
3. **Action**: % of "pivot" recommendations that lead to improved scores
4. **Outcomes**: Track which decision categories lead to successful launches

---

## Next Steps

1. Review and approve this plan
2. Create database migration
3. Implement AI evaluator agent
4. Build UI components
5. Test with sample ideas
6. Deploy and iterate

