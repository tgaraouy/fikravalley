# Continuous Innovation Framework Integration Plan

## 🎯 Overview

Integrate Ash Maurya's **Continuous Innovation Framework** (Business Model Design → Demand Validation → Value Delivery) into Fikra Valley's existing ideas system, with a persistent AI assistant guiding founders through 90-day cycles.

---

## 📋 Framework Components

### 1. Lean Canvas (9 Blocks)
- Problem
- Solution
- Key Metrics
- Unique Value Proposition
- Unfair Advantage
- Channels
- Customer Segments
- Cost Structure
- Revenue Streams

### 2. 7-Dimension Scoring
- Clarity
- Desirability
- Viability
- Feasibility
- Timing
- Defensibility
- Mission Alignment

### 3. 90-Day Cycle Workflow
- 12 weekly sprints
- Weekly check-ins (Persevere/Pivot/Pause decisions)
- Experiment tracking
- Canvas version history

---

## 🗄️ Database Schema (Supabase)

### New Tables

```sql
-- Lean Canvas Table
CREATE TABLE marrai_lean_canvas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  canvas_data JSONB NOT NULL, -- Stores all 9 blocks
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(idea_id, version)
);

-- 7-Dimension Scores
CREATE TABLE marrai_canvas_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES marrai_lean_canvas(id) ON DELETE CASCADE,
  clarity_score NUMERIC(3,1) CHECK (clarity_score >= 0 AND clarity_score <= 10),
  desirability_score NUMERIC(3,1) CHECK (desirability_score >= 0 AND desirability_score <= 10),
  viability_score NUMERIC(3,1) CHECK (viability_score >= 0 AND viability_score <= 10),
  feasibility_score NUMERIC(3,1) CHECK (feasibility_score >= 0 AND feasibility_score <= 10),
  timing_score NUMERIC(3,1) CHECK (timing_score >= 0 AND timing_score <= 10),
  defensibility_score NUMERIC(3,1) CHECK (defensibility_score >= 0 AND defensibility_score <= 10),
  mission_alignment_score NUMERIC(3,1) CHECK (mission_alignment_score >= 0 AND mission_alignment_score <= 10),
  overall_score NUMERIC(3,1) GENERATED ALWAYS AS (
    (clarity_score + desirability_score + viability_score + feasibility_score + 
     timing_score + defensibility_score + mission_alignment_score) / 7
  ) STORED,
  scored_by TEXT DEFAULT 'ai', -- 'ai' or 'mentor' or 'founder'
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation Cycles (90-Day Cycles)
CREATE TABLE marrai_validation_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  cycle_number INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE GENERATED ALWAYS AS (start_date + INTERVAL '90 days') STORED,
  current_week INTEGER DEFAULT 1 CHECK (current_week >= 1 AND current_week <= 12),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  canvas_id UUID REFERENCES marrai_lean_canvas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, cycle_number)
);

-- Experiments
CREATE TABLE marrai_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES marrai_validation_cycles(id) ON DELETE CASCADE,
  week_number INTEGER CHECK (week_number >= 1 AND week_number <= 12),
  experiment_type TEXT NOT NULL, -- 'problem_validation', 'solution_validation', 'demand_validation', 'value_delivery'
  hypothesis TEXT NOT NULL,
  experiment_description TEXT,
  metrics JSONB, -- { "metric_name": "value", "target": "value" }
  result TEXT, -- 'validated', 'invalidated', 'inconclusive'
  learnings TEXT,
  decision TEXT CHECK (decision IN ('persevere', 'pivot', 'pause')),
  canvas_changes JSONB, -- What changed in the canvas as a result
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Weekly Sprint Reviews
CREATE TABLE marrai_sprint_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES marrai_validation_cycles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 12),
  review_date DATE NOT NULL,
  progress_summary TEXT,
  experiments_completed INTEGER DEFAULT 0,
  key_learnings TEXT,
  decision TEXT NOT NULL CHECK (decision IN ('persevere', 'pivot', 'pause')),
  decision_reasoning TEXT,
  next_steps TEXT,
  canvas_version_before INTEGER,
  canvas_version_after INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(cycle_id, week_number)
);

-- AI Assistant Memory (Vector-Encoded Context)
CREATE TABLE marrai_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES marrai_ideas(id) ON DELETE CASCADE,
  memory_type TEXT NOT NULL CHECK (memory_type IN ('canvas_change', 'experiment', 'decision', 'learning', 'pivot')),
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  metadata JSONB, -- { "cycle_id": "...", "week_number": 1, "canvas_version": 1 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_lean_canvas_idea_id ON marrai_lean_canvas(idea_id);
CREATE INDEX idx_lean_canvas_version ON marrai_lean_canvas(idea_id, version DESC);
CREATE INDEX idx_canvas_scores_canvas_id ON marrai_canvas_scores(canvas_id);
CREATE INDEX idx_validation_cycles_idea_id ON marrai_validation_cycles(idea_id);
CREATE INDEX idx_validation_cycles_status ON marrai_validation_cycles(status);
CREATE INDEX idx_experiments_cycle_id ON marrai_experiments(cycle_id);
CREATE INDEX idx_experiments_week_number ON marrai_experiments(cycle_id, week_number);
CREATE INDEX idx_sprint_reviews_cycle_id ON marrai_sprint_reviews(cycle_id);
CREATE INDEX idx_ai_memory_idea_id ON marrai_ai_memory(idea_id);
CREATE INDEX idx_ai_memory_embedding ON marrai_ai_memory USING ivfflat (embedding vector_cosine_ops);

-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;
```

### Update Existing Tables

```sql
-- Add cycle tracking to marrai_ideas
ALTER TABLE marrai_ideas 
ADD COLUMN active_cycle_id UUID REFERENCES marrai_validation_cycles(id),
ADD COLUMN current_canvas_id UUID REFERENCES marrai_lean_canvas(id),
ADD COLUMN canvas_score NUMERIC(3,1); -- Latest overall score
```

---

## 🤖 AI Assistant Core

### Architecture

**LLM + Function Calling Pattern:**
- Use OpenAI GPT-4 or Claude as reasoning engine
- Stateless LLM (all context from database via RAG)
- Function calling for database operations
- Vector-based memory retrieval for context

### Function Definitions (API Endpoints)

```typescript
// Functions the AI can call
const AI_FUNCTIONS = [
  {
    name: 'get_current_canvas',
    description: 'Get the current Lean Canvas for an idea',
    parameters: { idea_id: 'string' }
  },
  {
    name: 'update_canvas_block',
    description: 'Update a specific block of the Lean Canvas',
    parameters: { canvas_id: 'string', block_name: 'string', content: 'string' }
  },
  {
    name: 'score_canvas',
    description: 'Score the canvas across 7 dimensions',
    parameters: { canvas_id: 'string' }
  },
  {
    name: 'create_experiment',
    description: 'Record a new experiment',
    parameters: { cycle_id: 'string', type: 'string', hypothesis: 'string' }
  },
  {
    name: 'record_sprint_review',
    description: 'Record weekly sprint review and decision',
    parameters: { cycle_id: 'string', week_number: 'number', decision: 'string' }
  },
  {
    name: 'get_memory_context',
    description: 'Retrieve relevant context from memory using vector search',
    parameters: { idea_id: 'string', query: 'string', limit: 'number' }
  }
];
```

### AI Assistant Prompt Template

```typescript
const AI_ASSISTANT_SYSTEM_PROMPT = `
You are an AI co-founder assistant helping Moroccan entrepreneurs through Ash Maurya's Continuous Innovation Framework.

Your role:
1. Guide founders through 90-day validation cycles
2. Help them build and refine their Lean Canvas
3. Score their canvas across 7 dimensions (clarity, desirability, viability, feasibility, timing, defensibility, mission alignment)
4. Suggest experiments to validate assumptions
5. Facilitate weekly sprint reviews (Persevere/Pivot/Pause decisions)
6. Maintain context across sessions using memory

Moroccan Context:
- Consider 2G/3G connectivity (offline-first)
- Mobile money integration (M-Wallet, Orange Money)
- Multilingual (Darija, Tamazight, French)
- PDPL compliance
- Diaspora market (5M+ abroad)
- Local trust networks

Framework:
- Business Model Design → Demand Validation → Value Delivery
- 90-day cycles with 12 weekly sprints
- Weekly decisions: Persevere, Pivot, or Pause
- Track experiments and learnings

Use function calling to interact with the database. Always retrieve context from memory before responding.
`;
```

---

## 📊 Scoring Engine

### 7-Dimension Scoring Rubric

```typescript
interface ScoringRubric {
  clarity: {
    description: "How clear is the problem-solution fit?",
    criteria: [
      "Problem is well-defined and specific",
      "Solution directly addresses the problem",
      "Customer segment is clearly identified"
    ],
    moroccan_context: "Consider local market clarity (Darija, Tamazight, French)"
  },
  desirability: {
    description: "How much do customers want this?",
    criteria: [
      "Strong customer pain point",
      "Clear value proposition",
      "Evidence of demand"
    ],
    moroccan_context: "Consider local trust, word-of-mouth, community needs"
  },
  viability: {
    description: "Can this be a sustainable business?",
    criteria: [
      "Clear revenue model",
      "Reasonable cost structure",
      "Path to profitability"
    ],
    moroccan_context: "Consider mobile money, cash, low-ticket pricing (10-100 DH)"
  },
  feasibility: {
    description: "Can this be built and delivered?",
    criteria: [
      "Technical feasibility",
      "Resource availability",
      "Execution capability"
    ],
    moroccan_context: "Consider 2G/offline, mobile money integration, PDPL compliance"
  },
  timing: {
    description: "Is now the right time?",
    criteria: [
      "Market timing is right",
      "Technology is ready",
      "Competitive landscape favorable"
    ],
    moroccan_context: "Consider Moroccan market readiness, diaspora timing"
  },
  defensibility: {
    description: "What's the unfair advantage?",
    criteria: [
      "Unique value proposition",
      "Barriers to entry",
      "Sustainable competitive advantage"
    ],
    moroccan_context: "Consider local trust networks, relationships, execution capability"
  },
  mission_alignment: {
    description: "Does this align with founder's mission?",
    criteria: [
      "Personal motivation",
      "Long-term vision",
      "Impact alignment"
    ],
    moroccan_context: "Consider Moroccan impact, diaspora connection, community benefit"
  }
}
```

### Scoring Implementation

```typescript
async function scoreCanvas(canvasId: string): Promise<CanvasScores> {
  const canvas = await getCanvas(canvasId);
  
  // Use LLM to score each dimension based on rubric
  const prompt = `
    Score this Lean Canvas across 7 dimensions (0-10 each):
    
    Canvas: ${JSON.stringify(canvas)}
    
    Scoring Rubric:
    ${JSON.stringify(SCORING_RUBRIC)}
    
    Moroccan Context: Consider 2G, mobile money, multilingual, PDPL, diaspora, local trust.
    
    Return scores as JSON: { clarity, desirability, viability, feasibility, timing, defensibility, mission_alignment }
  `;
  
  const scores = await llm.generateStructured(prompt);
  await saveScores(canvasId, scores);
  
  return scores;
}
```

---

## 🔄 90-Day Cycle Workflow

### Cycle Initialization

```typescript
async function startValidationCycle(ideaId: string) {
  // 1. Get or create Lean Canvas from idea
  const canvas = await getOrCreateCanvas(ideaId);
  
  // 2. Score initial canvas
  const scores = await scoreCanvas(canvas.id);
  
  // 3. Create validation cycle
  const cycle = await createCycle({
    idea_id: ideaId,
    cycle_number: 1,
    start_date: new Date(),
    current_week: 1,
    status: 'active',
    canvas_id: canvas.id
  });
  
  // 4. Schedule 12 weekly reminders
  await scheduleWeeklyReminders(cycle.id);
  
  // 5. Initialize AI memory
  await initializeMemory(ideaId, {
    cycle_started: true,
    initial_canvas_version: canvas.version,
    initial_scores: scores
  });
  
  return cycle;
}
```

### Weekly Sprint Review

```typescript
async function conductSprintReview(cycleId: string, weekNumber: number) {
  const cycle = await getCycle(cycleId);
  const experiments = await getExperimentsForWeek(cycleId, weekNumber);
  const canvas = await getCanvas(cycle.canvas_id);
  
  // AI summarizes progress
  const summary = await aiSummarizeProgress({
    cycle,
    experiments,
    canvas,
    weekNumber
  });
  
  // Prompt user for decision
  const decision = await promptUserDecision({
    summary,
    options: ['persevere', 'pivot', 'pause']
  });
  
  // Record review
  await recordSprintReview({
    cycle_id: cycleId,
    week_number: weekNumber,
    progress_summary: summary,
    experiments_completed: experiments.length,
    decision,
    decision_reasoning: userReasoning
  });
  
  // Update cycle if needed
  if (decision === 'pivot') {
    await suggestCanvasChanges(cycle, experiments);
  }
  
  // Update memory
  await updateMemory(cycle.idea_id, {
    type: 'sprint_review',
    week_number: weekNumber,
    decision,
    learnings: summary
  });
}
```

---

## 🔗 Integration with Existing Features

### 1. Idea Submission → Lean Canvas

```typescript
// In idea submission flow
async function onSubmitIdea(ideaData: IdeaSubmission) {
  // 1. Create idea (existing)
  const idea = await createIdea(ideaData);
  
  // 2. Generate Lean Canvas from idea (NEW)
  const canvas = await generateCanvasFromIdea(idea.id, {
    problem: ideaData.problem_statement,
    solution: ideaData.proposed_solution,
    customer_segments: ideaData.target_customers,
    // ... map other fields
  });
  
  // 3. Score canvas (NEW)
  const scores = await scoreCanvas(canvas.id);
  
  // 4. Update idea with canvas reference
  await updateIdea(idea.id, {
    current_canvas_id: canvas.id,
    canvas_score: scores.overall_score
  });
  
  return idea;
}
```

### 2. Mentor Matching Integration

```typescript
// When canvas scores above threshold
async function checkMentorEligibility(ideaId: string) {
  const idea = await getIdea(ideaId);
  const scores = await getLatestScores(idea.current_canvas_id);
  
  // Eligible if overall score >= 6.0
  if (scores.overall_score >= 6.0) {
    await triggerMentorMatching(ideaId, {
      canvas_scores: scores,
      canvas_id: idea.current_canvas_id
    });
  }
}
```

### 3. AI Analysis Integration

```typescript
// Enhance existing AI analysis with canvas scoring
async function analyzeIdea(ideaId: string) {
  const idea = await getIdea(ideaId);
  const canvas = await getCanvas(idea.current_canvas_id);
  
  // Existing analysis
  const feasibility = await analyzeFeasibility(idea);
  const impact = await analyzeImpact(idea);
  
  // NEW: Canvas scoring
  const canvasScores = await scoreCanvas(canvas.id);
  
  return {
    feasibility,
    impact,
    canvas_scores: canvasScores, // NEW
    recommendations: generateRecommendations(canvasScores)
  };
}
```

---

## 🎨 UI/UX Components

### 1. Lean Canvas Editor

```tsx
// components/canvas/LeanCanvasEditor.tsx
export function LeanCanvasEditor({ canvasId }: { canvasId: string }) {
  const [canvas, setCanvas] = useState<LeanCanvas | null>(null);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* 9 Blocks */}
      <CanvasBlock name="Problem" value={canvas?.problem} />
      <CanvasBlock name="Solution" value={canvas?.solution} />
      <CanvasBlock name="Key Metrics" value={canvas?.key_metrics} />
      {/* ... */}
    </div>
  );
}
```

### 2. AI Assistant Chat

```tsx
// components/ai/InnovationAssistant.tsx
export function InnovationAssistant({ ideaId }: { ideaId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg">
      <ChatInterface
        messages={messages}
        onSend={handleSend}
        systemPrompt={AI_ASSISTANT_SYSTEM_PROMPT}
        functions={AI_FUNCTIONS}
      />
    </div>
  );
}
```

### 3. Cycle Dashboard

```tsx
// components/cycles/CycleDashboard.tsx
export function CycleDashboard({ cycleId }: { cycleId: string }) {
  const cycle = useCycle(cycleId);
  const scores = useCanvasScores(cycle.canvas_id);
  
  return (
    <div>
      <CycleProgress currentWeek={cycle.current_week} totalWeeks={12} />
      <ScoreRadar scores={scores} />
      <ExperimentsList cycleId={cycleId} />
      <SprintReviewsList cycleId={cycleId} />
    </div>
  );
}
```

### 4. Weekly Review Modal

```tsx
// components/cycles/WeeklyReviewModal.tsx
export function WeeklyReviewModal({ cycleId, weekNumber }: Props) {
  return (
    <Modal>
      <ProgressSummary />
      <ExperimentsCompleted />
      <DecisionButtons 
        options={['persevere', 'pivot', 'pause']}
        onSelect={handleDecision}
      />
    </Modal>
  );
}
```

---

## 🚀 Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- [ ] Database schema (lean_canvas, canvas_scores tables)
- [ ] Basic canvas editor (form-based)
- [ ] AI scoring (7 dimensions)
- [ ] Canvas generation from idea submission
- [ ] Display scores in idea detail page

### Phase 2: AI Assistant (Weeks 5-8)
- [ ] AI chat interface
- [ ] Function calling for canvas operations
- [ ] Basic memory (vector storage)
- [ ] Context retrieval (RAG)
- [ ] Multi-turn conversations

### Phase 3: 90-Day Cycles (Weeks 9-12)
- [ ] Validation cycles table
- [ ] Cycle initialization
- [ ] Weekly sprint reviews
- [ ] Experiment tracking
- [ ] Decision logging (Persevere/Pivot/Pause)

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Canvas version history
- [ ] Mixed model detection
- [ ] Canvas variant suggestions
- [ ] Mentor matching integration
- [ ] Dashboard visualizations

---

## 📈 Success Metrics

### For Founders:
- **Canvas Quality:** Average score improvement over cycles
- **Cycle Completion:** % of cycles completed (vs. abandoned)
- **Pivot Speed:** Time to first pivot decision
- **Validation Speed:** Experiments completed per cycle

### For Fikra Valley:
- **Engagement:** % of ideas with active cycles
- **Data Quality:** Number of canvases, experiments, decisions
- **AI Usage:** Conversations per founder per cycle
- **Mentor Matching:** Match rate for high-scoring canvases

---

## 🔧 Technical Considerations

### Scalability:
- **Database:** Indexed queries, connection pooling
- **LLM:** Stateless design, RAG for context
- **Caching:** Canvas and scores cached
- **Async Processing:** Queue for heavy LLM calls

### Cost Control:
- **Cheap Models:** GPT-3.5 for routine tasks
- **Expensive Models:** GPT-4 for scoring and generation
- **Caching:** Reduce redundant LLM calls
- **Batch Processing:** Process multiple canvases together

### Moroccan Context:
- **Multilingual:** Support Darija, Tamazight, French
- **Local Examples:** Use Moroccan startup examples
- **Market Context:** Consider 2G, mobile money, PDPL, diaspora

---

## 🎯 Next Steps

1. **Review** this plan with stakeholders
2. **Prioritize** phases based on user needs
3. **Start** Phase 1 (MVP) - Database schema + Basic canvas
4. **Test** with real Moroccan ideas
5. **Iterate** based on feedback

---

**🇲🇦 Ready to help Moroccan founders build better businesses systematically!**

