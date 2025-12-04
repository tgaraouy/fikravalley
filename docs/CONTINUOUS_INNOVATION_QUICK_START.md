# Continuous Innovation Framework - Quick Start

## 🎯 What This Does

Integrates **Ash Maurya's Continuous Innovation Framework** into Fikra Valley:
- **Lean Canvas** (9 blocks) for business model design
- **7-Dimension Scoring** (clarity, desirability, viability, feasibility, timing, defensibility, mission alignment)
- **90-Day Cycles** with 12 weekly sprints
- **AI Assistant** that guides founders through validation

---

## 🚀 Quick Implementation (Phase 1 MVP)

### Step 1: Run Migration

```bash
# Run the migration in Supabase
supabase migration up 017_add_continuous_innovation_framework
```

### Step 2: Auto-Generate Canvas from Idea Submission

```typescript
// In app/api/ideas/route.ts (existing idea submission)
async function onSubmitIdea(ideaData: IdeaSubmission) {
  // 1. Create idea (existing)
  const idea = await createIdea(ideaData);
  
  // 2. Generate Lean Canvas from idea (NEW)
  const canvas = await generateCanvasFromIdea(idea.id, {
    problem: ideaData.problem_statement,
    solution: ideaData.proposed_solution,
    customer_segments: ideaData.target_customers || ideaData.location,
    // Map other fields to canvas blocks
  });
  
  // 3. Score canvas (NEW)
  const scores = await scoreCanvas(canvas.id);
  
  // 4. Update idea
  await updateIdea(idea.id, {
    current_canvas_id: canvas.id,
    canvas_score: scores.overall_score
  });
  
  return idea;
}
```

### Step 3: Display Canvas in Idea Detail Page

```tsx
// In app/ideas/[id]/page.tsx
import { LeanCanvasViewer } from '@/components/canvas/LeanCanvasViewer';
import { CanvasScores } from '@/components/canvas/CanvasScores';

export default function IdeaDetailPage({ params }: { params: { id: string } }) {
  const idea = useIdea(params.id);
  const canvas = useCanvas(idea.current_canvas_id);
  const scores = useCanvasScores(canvas?.id);
  
  return (
    <div>
      {/* Existing idea content */}
      
      {/* NEW: Canvas Section */}
      <section className="mt-8">
        <h2>Lean Canvas</h2>
        {canvas && (
          <>
            <LeanCanvasViewer canvas={canvas} />
            <CanvasScores scores={scores} />
          </>
        )}
      </section>
    </div>
  );
}
```

---

## 📊 Canvas Structure

### 9 Blocks (JSONB format):

```json
{
  "problem": "List top 3 problems",
  "solution": "List top 3 features",
  "key_metrics": "Key activities to measure",
  "uvp": "Single, clear, compelling message",
  "unfair_advantage": "Can't be easily copied",
  "channels": "Path to customers",
  "customer_segments": "Target customers",
  "cost_structure": "Customer acquisition costs, distribution costs, hosting, people, etc.",
  "revenue_streams": "Revenue model, lifetime value, revenue, gross margin"
}
```

---

## 🎯 7-Dimension Scoring

### Scoring Rubric (0-10 each):

1. **Clarity:** How clear is the problem-solution fit?
2. **Desirability:** How much do customers want this?
3. **Viability:** Can this be a sustainable business?
4. **Feasibility:** Can this be built and delivered?
5. **Timing:** Is now the right time?
6. **Defensibility:** What's the unfair advantage?
7. **Mission Alignment:** Does this align with founder's mission?

**Moroccan Context:** Consider 2G, mobile money, multilingual, PDPL, diaspora, local trust.

---

## 🔄 90-Day Cycle Workflow

### Cycle Initialization:

```typescript
// When founder starts validation cycle
async function startCycle(ideaId: string) {
  const canvas = await getLatestCanvas(ideaId);
  
  const cycle = await createCycle({
    idea_id: ideaId,
    start_date: new Date(),
    current_week: 1,
    canvas_id: canvas.id
  });
  
  // Schedule 12 weekly reminders
  await scheduleWeeklyReminders(cycle.id);
  
  return cycle;
}
```

### Weekly Sprint Review:

```typescript
// Every week, prompt founder for review
async function conductSprintReview(cycleId: string, weekNumber: number) {
  // 1. Summarize progress
  const summary = await summarizeProgress(cycleId, weekNumber);
  
  // 2. Prompt for decision
  const decision = await promptDecision({
    options: ['persevere', 'pivot', 'pause']
  });
  
  // 3. Record review
  await recordReview({
    cycle_id: cycleId,
    week_number: weekNumber,
    decision,
    learnings: summary
  });
}
```

---

## 🤖 AI Assistant (Phase 2)

### Basic Chat Interface:

```tsx
// components/ai/InnovationAssistant.tsx
export function InnovationAssistant({ ideaId }: { ideaId: string }) {
  return (
    <ChatInterface
      systemPrompt={`
        You are an AI co-founder helping Moroccan entrepreneurs through 
        Continuous Innovation Framework. Guide them through Lean Canvas, 
        scoring, experiments, and weekly decisions.
      `}
      functions={[
        'get_current_canvas',
        'update_canvas_block',
        'score_canvas',
        'create_experiment',
        'record_sprint_review'
      ]}
    />
  );
}
```

---

## 📈 Success Metrics

### Track:
- **Canvas Quality:** Average score improvement
- **Cycle Completion:** % of cycles completed
- **Pivot Speed:** Time to first pivot
- **Validation Speed:** Experiments per cycle

---

## 🎯 Next Steps

1. **Run migration** (database schema)
2. **Auto-generate canvas** from idea submission
3. **Display canvas** in idea detail page
4. **Add scoring** (AI-based)
5. **Test** with real Moroccan ideas

---

**🇲🇦 Ready to help Moroccan founders build better businesses systematically!**

