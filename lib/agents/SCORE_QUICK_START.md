# 📊 SCORE AGENT - QUICK START GUIDE

## 🚀 Installation & Setup

The SCORE agent is ready to use! No additional dependencies required.

```typescript
import ScoreAgent from '@/lib/agents/score-agent';

const agent = new ScoreAgent();
```

---

## 💡 5-Minute Integration

### Step 1: Basic Scoring (30 seconds)

```typescript
const score = await agent.calculateLiveScore({
  problem: {
    description: "Your problem description here..."
  }
});

console.log(`Score: ${score.current.total}/50`);
console.log(`Qualification: ${score.qualification.tier}`);
```

### Step 2: Real-Time Updates (2 minutes)

```typescript
import { debounce } from 'lodash';

// Debounce for performance
const updateScore = debounce(async (text) => {
  const score = await agent.calculateLiveScore({
    problem: { description: text }
  });
  
  // Update UI
  setScoreState(score);
}, 500);

// On textarea change
<textarea onChange={(e) => updateScore(e.target.value)} />
```

### Step 3: Show Top Gaps (2 minutes)

```typescript
// Display top 3 actionable gaps
{score.gaps.slice(0, 3).map(gap => (
  <div key={gap.field}>
    <h4>{gap.field}</h4>
    <span className="gain">+{gap.potentialGain.toFixed(1)} pts</span>
    <Badge effort={gap.effort} />
    <p>{gap.action.french}</p>
  </div>
))}
```

---

## 🎯 Common Use Cases

### Use Case 1: Submission Form Validation

```typescript
const validateSubmission = async (idea) => {
  const score = await agent.calculateLiveScore(idea);
  
  if (!score.qualification.intilaqaEligible) {
    alert(`Score: ${score.current.total}/50. Need 25+ for Intilaka eligibility.`);
    return false;
  }
  
  return true;
};
```

### Use Case 2: Progress Dashboard

```typescript
const DashboardWidget = ({ idea }) => {
  const [score, setScore] = useState(null);
  
  useEffect(() => {
    agent.calculateLiveScore(idea).then(setScore);
  }, [idea]);
  
  if (!score) return <Loading />;
  
  return (
    <div>
      <CircularProgress value={score.current.total} max={50} />
      <h3>{score.current.total.toFixed(1)}/50</h3>
      <Badge>{score.qualification.tier}</Badge>
      
      <IntimacyMeter>
        <h4>Intimacy (Locke): {score.current.intimacy.toFixed(1)}/10</h4>
        <p>{score.breakdown.intimacy.verdict}</p>
      </IntimacyMeter>
    </div>
  );
};
```

### Use Case 3: Gap-Driven Improvement

```typescript
const GapsList = ({ score }) => {
  return (
    <div>
      <h3>How to improve ({score.potential.total - score.current.total} points possible)</h3>
      
      {score.gaps.map(gap => (
        <Card key={gap.field} priority={gap.priority}>
          <Badge effort={gap.effort}>{gap.effort} effort</Badge>
          <h4>{gap.field}</h4>
          <div className="gain">+{gap.potentialGain.toFixed(1)} points</div>
          <p>{gap.action.french}</p>
          
          {gap.intimacyImpact && (
            <Alert variant="info">
              💡 Locke: {gap.intimacyImpact}
            </Alert>
          )}
        </Card>
      ))}
    </div>
  );
};
```

---

## 📊 Understanding Scores

### Clarity (0-10 points)
- **Problem Statement**: WHO, frequency, current solution, why fails, beneficiaries
- **As-Is Analysis**: Steps, time, cost, pain points
- **Benefits**: Time saved, cost saved, impact, quantified
- **Operations**: Team, budget, timeline, resources

### Intimacy (0-10 points - Locke's Metric)
- **Lived Experience (0-3)**: "J'ai vécu" vs "J'ai lu"
- **Conversations (0-3)**: Receipts = real conversations
- **Iterations (0-2)**: Revisions + margin notes
- **Specificity (0-2)**: Names, numbers, locations

### Qualification Tiers
| Score | Intimacy | Tier | Intilaka |
|-------|----------|------|----------|
| 0-14 | 0-2 | Unqualified | ❌ |
| 15-19 | 3+ | Developing | ❌ |
| 20-24 | 4+ | Promising | ❌ |
| 25-31 | 6+ | **Qualified** | ✅ |
| 32-50 | 7+ | **Exceptional** | ✅ |

---

## ⚡ Performance Tips

### 1. Debounce Real-Time Updates
```typescript
// Good: Debounce 500ms
const debouncedScore = debounce(calculateScore, 500);

// Bad: Score on every keystroke (too expensive!)
onChange={() => calculateScore()} // ❌
```

### 2. Cache Results
```typescript
const scoreCache = new Map();

const getCachedScore = async (ideaHash) => {
  if (scoreCache.has(ideaHash)) {
    return scoreCache.get(ideaHash);
  }
  
  const score = await agent.calculateLiveScore(idea);
  scoreCache.set(ideaHash, score);
  return score;
};
```

### 3. Progressive Loading
```typescript
// Show basic score first
const basicScore = {
  clarity: calculateClarityOnly(idea),
  loading: true
};
setScore(basicScore);

// Then full score with intimacy
const fullScore = await agent.calculateLiveScore(idea);
setScore(fullScore);
```

---

## 🎨 UI Components

### Minimal Score Display
```tsx
<div className="score-widget">
  <span className="score">{score.current.total.toFixed(1)}/50</span>
  <Badge variant={score.qualification.tier}>
    {score.qualification.tier}
  </Badge>
</div>
```

### Full Score Dashboard
```tsx
<ScoreDashboard>
  {/* Main Score Circle */}
  <CircularProgress value={score.current.total} max={50}>
    <h2>{score.current.total.toFixed(1)}/50</h2>
    <p>{score.qualification.tier}</p>
  </CircularProgress>
  
  {/* Breakdown */}
  <ScoreBreakdown>
    <ScoreItem label="Clarity" value={score.current.clarity} max={10} />
    <ScoreItem label="Decision" value={score.current.decision} max={40} />
    <ScoreItem label="Intimacy (Locke)" value={score.current.intimacy} max={10} />
  </ScoreBreakdown>
  
  {/* Intilaka Eligibility */}
  {score.qualification.intilaqaEligible ? (
    <Alert variant="success">
      ✅ Eligible for Intilaka ({score.qualification.intilaqaProbability}% probability)
    </Alert>
  ) : (
    <Alert variant="warning">
      Need {score.qualification.nextTier.gap} more points for {score.qualification.nextTier.name}
    </Alert>
  )}
  
  {/* Top 3 Gaps */}
  <GapsList gaps={score.gaps.slice(0, 3)} />
</ScoreDashboard>
```

---

## 🐛 Troubleshooting

### Problem: Score is 0 for everything
**Solution:** Make sure you're passing at least a `problem.description`:
```typescript
// Bad
const score = await agent.calculateLiveScore({});

// Good
const score = await agent.calculateLiveScore({
  problem: { description: "Your text here" }
});
```

### Problem: Intimacy score is always low
**Solution:** Intimacy requires:
1. Personal experience markers ("j'ai vu", "hier")
2. Receipts (conversations)
3. Margin notes and revisions
4. Specific names, numbers, locations

```typescript
// Low intimacy (2/10)
{
  problem: { description: "Les infirmières ont un problème" }
}

// High intimacy (8/10)
{
  problem: { 
    description: "Hier, j'ai vu au CHU Ibn Sina l'infirmière Fatima chercher 6-8 fois..."
  },
  receipts: Array(50).fill({ id: 'test', amount: 3 }),
  marginNotes: Array(5).fill({ timestamp: new Date(), note: "Note" })
}
```

### Problem: Qualification tier doesn't match expectations
**Solution:** Check BOTH score AND intimacy:
```typescript
// High score (27/50) but low intimacy (3/10) → "Promising" (not Qualified!)
// Need: score ≥25 AND intimacy ≥6 for "Qualified"

if (score.current.total >= 25 && score.current.intimacy >= 6) {
  // Qualified ✅
} else {
  // Not yet qualified
  console.log(score.qualification.message.french); // Explanation
}
```

---

## 📚 Learn More

- **Full Documentation**: [SCORE_IMPLEMENTATION_SUMMARY.md](./SCORE_IMPLEMENTATION_SUMMARY.md)
- **Examples**: [examples/score-usage.ts](./examples/score-usage.ts)
- **Tests**: [__tests__/score-agent.test.ts](./__tests__/score-agent.test.ts)
- **Main README**: [README.md](./README.md)

---

## 🎓 Locke's Philosophy

The SCORE agent measures TWO dimensions:

1. **Clarity** (traditional): Can you explain it well?
2. **Intimacy** (Locke): Do you KNOW it intimately?

> "Reading furnishes the mind with materials. Thinking makes what we read ours."  
> — John Locke

**Applied to SCORE:**
- **Reading** = Hearing about a problem (knowing OF)
- **Thinking** = Reflecting through iterations (margin notes)
- **Making it ours** = Lived experience + conversations (TRUE KNOWING)

High clarity + low intimacy = ⚠️ Red flag!  
You can describe well but don't truly understand. Investors will notice.

---

## ✅ Checklist: Am I Using SCORE Correctly?

- [ ] Real-time updates with debounce (500ms)
- [ ] Showing both clarity AND intimacy scores
- [ ] Displaying top 3 actionable gaps
- [ ] Explaining qualification tier to user
- [ ] Tracking margin notes for intimacy
- [ ] Celebrating milestones (qualified, exceptional)
- [ ] Warning when high score but low intimacy
- [ ] Transparent about how scores are calculated

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Last Updated:** 2025-11-20

