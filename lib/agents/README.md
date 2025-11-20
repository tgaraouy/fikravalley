# FIKRA VALLEY - AI AGENTS

**Based on John Locke's Philosophy: "Thinking makes what we read ours."**

## 🤖 Implemented Agents

### ✅ AGENT 1: FIKRA - Idea Clarifier
**Status:** Production Ready

FIKRA is an AI assistant that helps users **truly know** their problems, not just "know of" them. Using Socratic questioning and John Locke's insight about the difference between superficial and intimate knowledge, FIKRA guides users to develop deep understanding through lived experience.

[**📖 Full FIKRA Documentation →**](./FIKRA_IMPLEMENTATION_SUMMARY.md)

---

### ✅ AGENT 2: PROOF - Evidence Collector
**Status:** Production Ready

PROOF is an AI strategist that helps users collect 3-DH receipts as concrete proof of demand. The 3-DH receipt = Locke's pencil mark - it's physical proof of intimate engagement with the problem.

[**📖 Full PROOF Documentation →**](./PROOF_IMPLEMENTATION_SUMMARY.md)

---

### ✅ AGENT 3: SCORE - Real-Time Analyst
**Status:** Production Ready

SCORE is an AI that calculates and explains scores in real-time, measuring BOTH traditional clarity (do you explain well?) and Locke's intimacy (do you KNOW intimately or just "know of"?). Shows users exactly where they stand and how to improve with transparent, actionable guidance.

[**📖 Full SCORE Documentation →**](./SCORE_IMPLEMENTATION_SUMMARY.md)

---

## 🎯 Agent Interaction Flow

```
User Idea
    ↓
AGENT 1: FIKRA (Clarify Problem)
    ├─ Gap Detection
    ├─ Intimacy Scoring
    └─ Socratic Questions
    ↓
Clear Problem Statement
    ↓
AGENT 2: PROOF (Collect Evidence)
    ├─ Strategy Generation
    ├─ Receipt Validation
    └─ Progress Coaching
    ↓
Validated Demand (50-200 receipts)
    ↓
AGENT 3: SCORE (Real-Time Analysis)
    ├─ Clarity Scoring (0-10)
    ├─ Decision Scoring (0-40)
    ├─ Intimacy Scoring (0-10)
    ├─ Gap Identification
    └─ Qualification Tiers
    ↓
Qualified Submission (25+ score, 6+ intimacy)
    ↓
[READY FOR MENTOR & DOC AGENTS]
```

---

# 📚 AGENT 1: FIKRA - Idea Clarifier

## 🎯 Purpose

FIKRA helps users **truly know** their problems through Socratic questioning and lived experience.

## 🧠 Philosophy

John Locke annotated his copy of "Bleak House" with 14,000 pencil marks. He didn't just **read** the book - he made it **his own** through thinking. 

FIKRA applies this principle to problem statements:
- ❌ **"Know of"**: Reading about a problem ("I heard nurses have issues")
- ✅ **"True knowing"**: Living the problem ("Yesterday, I spent 4 hours helping Nurse Fatima search for equipment")

## 📊 How It Works

### 1. **Gap Detection**

FIKRA identifies 6 critical gaps in problem statements:

| Gap Type | Severity | Example Good | Example Bad |
|----------|----------|--------------|-------------|
| **WHO** | Critical | "Infirmières du CHU Ibn Sina" | "Les gens" |
| **FREQUENCY** | Critical | "6-8 fois par shift" | "Souvent" |
| **LIVED_EXPERIENCE** | Critical | "Hier, j'ai vu..." | "J'ai lu que..." |
| **CURRENT_SOLUTION** | Important | "Ils appellent 3-4 services..." | - |
| **WHY_FAILS** | Important | "Personne ne répond car occupés" | - |
| **BENEFICIARIES** | Nice-to-have | "450 infirmières + 2,500 patients/jour" | - |

### 2. **Intimacy Scoring (0-10)**

Based on Locke's "true knowing":

```typescript
interface IntimacySignal {
  personal_experience: 0.4  // "J'ai vécu" = 4 points
  specific_person: 0.2      // "Nurse Fatima at CHU" = 2 points
  quantified_frequency: 0.2 // "6 times per day" = 2 points
  named_location: 0.1       // "CHU Ibn Sina" = 1 point
  concrete_example: 0.1     // Story/anecdote = 1 point
}
```

### 3. **Agent Modes**

FIKRA adapts its behavior based on user progress:

| Mode | When | Behavior |
|------|------|----------|
| **LISTENING** | Text < 20 chars | Encourages user to write more |
| **QUESTIONING** | Critical gaps exist | Asks Socratic questions |
| **CHALLENGING** | Good clarity, low intimacy | Pushes for lived experience |
| **SUGGESTING** | Some progress made | Provides concrete improvements |
| **VALIDATING** | Clarity ≥8, Intimacy ≥7 | Celebrates true knowing! |

## 🚀 Usage

### Basic Example

```typescript
import FikraAgent from '@/lib/agents/fikra-agent';

const agent = new FikraAgent(process.env.ANTHROPIC_API_KEY);

const draft = {
  text: "Les infirmières ont des problèmes avec le matériel",
  wordCount: 8,
  lastUpdated: new Date()
};

const response = await agent.analyze(draft);

console.log(response.mode);           // "questioning"
console.log(response.intimacyScore);  // 2.0
console.log(response.clarityScore);   // 3.5
console.log(response.message.french); // "Qui EXACTEMENT a ce problème?..."
console.log(response.progress);       // 15
```

### Advanced Example - With Previous Responses

```typescript
const previousResponses = [
  // User already answered WHO question
  {
    gap: 'who',
    question: { /* ... */ },
    // ... question details
  }
];

const response = await agent.analyze(draft, previousResponses);
// Agent will ask next question (FREQUENCY or LIVED_EXPERIENCE)
```

### Margin Notes (Locke's Method)

Track user's thinking evolution:

```typescript
// Save user's annotations
await agent.saveMarginNote(
  ideaId: "abc123",
  section: "problem_statement",
  note: "Je pense que le vrai problème est..."
);

// Get thinking journey
const journey = await agent.getThinkingJourney("abc123");
console.log(journey.totalThinkingTime);    // 45 minutes
console.log(journey.intimacyEvolution);    // [1.0, 3.5, 6.2, 8.9]
```

## 📝 Real Examples

### Example 1: Vague → Specific

**Initial (Intimacy: 1/10)**
```
Les gens ont des problèmes avec la technologie
```

**FIKRA Response:**
```
🤔 Shkoun b zzabt li 3andu had l-mochkil? 
Ma-tgolich 'les gens' - gol liya مثلا: 
'les infirmières dial CHU Ibn Sina'

❌ BAD: "Les gens au Maroc"
✅ GOOD: "Les infirmières du service cardiologie au CHU Ibn Sina à Rabat"
```

**After Revision (Intimacy: 4/10)**
```
Les infirmières du CHU Ibn Sina perdent du temps 
à chercher du matériel médical
```

**FIKRA Response:**
```
✅ Mezyan! WHO est clair maintenant (15% progress)

Wakha, mais NTA شخصياً? Wach shefti b 3aynik? 
Locke galلنا: ma-kafiش t9ra 3la shi 7aja, 
khassek t3ichها!
```

**Final (Intimacy: 9/10)**
```
Hier matin, j'ai passé 4 heures au CHU Ibn Sina 
à chercher un défibrillateur avec l'infirmière Fatima 
pendant une urgence cardiaque.

Les infirmières du service de cardiologie vivent ce 
problème 6-8 fois par shift de 8 heures.

Actuellement, elles appellent 3-4 autres services par 
téléphone, mais souvent personne ne répond car tout le 
monde est occupé avec les patients.
```

**FIKRA Response:**
```
🎉 Bravo! Waccha nta FAHM l-mochkil b mazyan! 

Score dial clarity: 9.2/10, Intimacy: 9.0/10

John Locke serait fier - vous n'avez pas juste LU 
à propos du problème, vous l'avez VÉCU et fait VÔTRE!

🏆 Intimité atteinte! (Locke's true knowing)
```

### Example 2: Book Knowledge → Lived Experience

**Initial (Intimacy: 2/10)**
```
J'ai lu dans un article que les agriculteurs 
marocains ont des problèmes avec les prix
```

**FIKRA Challenge:**
```
❌ Nta katgol "J'ai lu"... 

John Locke: ma-kafiش t9ra 3la shi 7aja, 
khassek t3ichها!

Wach NTA شخصياً 3andek had l-mochkil? 
Wla 3andك شي 7د قريب ليك (père, oncle)?

Gol liya story wa9i3a dial مرة محددة.
```

**Revised (Intimacy: 8/10)**
```
Mon père est agriculteur dans la région Saïs (12 hectares).
La semaine dernière, il a vendu ses tomates à 0.50 DH/kg 
à un intermédiaire, alors qu'elles se vendent à 4 DH/kg 
au marché de Fès.

Ce problème arrive chaque semaine pendant la récolte (6 mois/an).
L'intermédiaire contrôle tout le transport et mon père 
n'a aucune alternative.
```

## 🧪 Testing

Run comprehensive tests:

```bash
npm test lib/agents/__tests__/fikra-agent.test.ts
```

Tests cover:
- ✅ Gap detection (6 types)
- ✅ Intimacy scoring
- ✅ All agent modes
- ✅ Multilingual support (Darija, French, Arabic)
- ✅ Edge cases
- ✅ Locke philosophy integration

## 🌍 Multilingual Support

FIKRA responds in 3 languages:

```typescript
response.message = {
  darija: "Shkoun b zzabt li 3andu had l-mochkil?",
  french: "Qui EXACTEMENT a ce problème?",
  tone: "curious"
};

response.nextQuestion = {
  gap: "who",
  question: {
    darija: "...",
    french: "...",
    arabic: "من بالضبط لديه هذه المشكلة؟"
  }
};
```

## 🎨 UI Integration

Example React component:

```tsx
import { useState } from 'react';
import FikraAgent from '@/lib/agents/fikra-agent';

export function ProblemEditor() {
  const [draft, setDraft] = useState("");
  const [response, setResponse] = useState<FikraResponse | null>(null);
  
  const agent = new FikraAgent();
  
  const handleAnalyze = async () => {
    const result = await agent.analyze({
      text: draft,
      wordCount: draft.split(/\s+/).length,
      lastUpdated: new Date()
    });
    
    setResponse(result);
  };
  
  return (
    <div>
      <textarea 
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Décrivez votre problème..."
      />
      
      <button onClick={handleAnalyze}>Analyser</button>
      
      {response && (
        <div className={`agent-response ${response.mode}`}>
          {/* Progress bar */}
          <div className="progress">
            <div style={{ width: `${response.progress}%` }} />
          </div>
          
          {/* Scores */}
          <div className="scores">
            <span>Clarté: {response.clarityScore.toFixed(1)}/10</span>
            <span>Intimité (Locke): {response.intimacyScore.toFixed(1)}/10</span>
          </div>
          
          {/* Agent message */}
          <div className="message">
            {response.message.french}
          </div>
          
          {/* Next question with examples */}
          {response.nextQuestion && (
            <div className="guidance">
              <h4>{response.nextQuestion.why}</h4>
              
              <div className="examples">
                <h5>✅ Exemples BONS:</h5>
                {response.nextQuestion.examples.map((ex, i) => (
                  <div key={i}>{ex}</div>
                ))}
              </div>
              
              {response.nextQuestion.badExamples && (
                <div className="bad-examples">
                  <h5>❌ Exemples MAUVAIS:</h5>
                  {response.nextQuestion.badExamples.map((ex, i) => (
                    <div key={i}>{ex}</div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Milestone celebration */}
          {response.milestone && (
            <div className="milestone">
              {response.milestone}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## 📚 Learn More

- **John Locke's Philosophy**: [Stanford Encyclopedia of Philosophy](https://plato.stanford.edu/entries/locke/)
- **Socratic Method**: [Wikipedia](https://en.wikipedia.org/wiki/Socratic_method)
- **Problem Validation**: [The Mom Test](http://momtestbook.com/)

## 🤝 Contributing

When improving FIKRA, remember Locke's principle:

> "Reading furnishes the mind with materials of knowledge. 
> It is thinking makes what we read ours."

Always push for:
1. **Lived experience** over book knowledge
2. **Specific examples** over generalizations
3. **Quantified data** over vague adjectives
4. **Named people/places** over categories

---

# 📚 AGENT 2: PROOF - Evidence Collector

## 🎯 Purpose

PROOF helps users collect 3-DH receipts as concrete proof of demand. Each receipt represents a conversation, an intimate engagement with the problem.

## 🧠 Philosophy

The 3-DH receipt = Locke's pencil mark. Just as Locke made 14,000 pencil marks in "Bleak House" to make it his own, users collect receipts to make the problem intimately theirs through action.

## 📊 How It Works

### 1. **Strategy Generation** (4 Methods)

PROOF analyzes idea characteristics and recommends the best collection approach:

| Method | Best For | Success Rate | Intimacy Level |
|--------|----------|--------------|----------------|
| **In-Person Pitch** | High-pain problems (>4/5) | 75% | ⭐⭐⭐⭐⭐ |
| **Online Survey** | Tech-savvy, moderate pain | 40% | ⭐⭐ (with calls) |
| **Community Outreach** | Young audiences | 65% | ⭐⭐⭐⭐ |
| **Hybrid Approach** | Mixed needs | 60% | ⭐⭐⭐ |

### 2. **Willingness-to-Pay Scoring** (1-5)

```typescript
Score 1: 0 receipts    - Getting Started
Score 2: 1-9 receipts  - Building Momentum  
Score 3: 10-49         - Initial Validation (Top 20%)
Score 4: 50-199        - Strong Validation (Fundable!)
Score 5: 200+          - Market Proven (Top 1%!)
```

### 3. **Receipt Validation**

- ✅ OCR extraction (amount, date, signature)
- ✅ Fraud detection (duplicates, suspicious patterns)
- ✅ Auto-approval for clean receipts
- ✅ Real-time validation feedback

## 🚀 Usage

### Basic Example

```typescript
import ProofAgent from '@/lib/agents/proof-agent';

const agent = new ProofAgent();

// Generate strategy
const strategy = await agent.generateStrategy({
  problem: {
    who: "Infirmières du CHU",
    where: "CHU Ibn Sina",
    painIntensity: 4.8,
    frequency: "6-8 fois par shift"
  },
  solution: "App localisation matériel",
  category: "Santé"
});

console.log(strategy.method);              // "in_person_pitch"
console.log(strategy.expectedResults);      // { timeframe: "5-7 jours", receipts: "100-150" }
console.log(strategy.intimacyRequirement); // Locke's insight

// Validate receipt
const validation = await agent.validateReceipt(photoFile, ideaId);
console.log(validation.valid);              // true/false
console.log(validation.autoApproved);       // true if clean

// Get coaching
const coaching = await agent.provideCoaching(50);
console.log(coaching.score);                // 4/5
console.log(coaching.message.french);       // Celebration message!
```

## 📝 Real Example

### Input: Healthcare Problem

```typescript
{
  problem: {
    who: "Infirmières du service cardiologie",
    where: "CHU Ibn Sina, Rabat",
    painIntensity: 4.8,
    frequency: "6-8 fois par shift"
  },
  solution: "Application mobile pour localiser matériel médical"
}
```

### Output: In-Person Strategy

```typescript
{
  method: "in_person_pitch",
  
  steps: [
    { step: 1, action: "Préparez pitch 90 secondes", difficulty: "easy" },
    { step: 2, action: "Identifiez meilleurs moments", difficulty: "medium" },
    { step: 3, action: "Première vague: 10 personnes", difficulty: "medium" },
    { step: 4, action: "Demandez introductions", difficulty: "easy" },
    { step: 5, action: "Sprint final: 100 reçus", difficulty: "medium" }
  ],
  
  expectedResults: {
    timeframe: "5-7 jours",
    receipts: "100-150",
    successRate: 0.75,
    confidence: "high"
  },
  
  intimacyRequirement: "🎯 Locke's Insight: Ces conversations face-à-face sont ESSENTIELLES. 
                        Après 100 conversations, ce problème sera VOTRE problème.",
  
  thinkingPrompts: [
    "Après chaque conversation, notez: Qu'ai-je appris de nouveau?",
    "Cette personne a-t-elle décrit le problème différemment?",
    // ... more prompts
  ]
}
```

## 🎓 Locke's Philosophy in Action

### The Pencil Mark Metaphor

```
Locke's Method:     14,000 pencil marks in "Bleak House"
PROOF's Method:     200 receipts = 200 conversations

Both = Physical proof of intimate engagement
```

### Transformation Journey

```
0 receipts:    "Les gens ont ce problème" (knowing OF)
10 receipts:   "J'ai parlé à 10 personnes..." (engaging)
50 receipts:   "Le problème est MIEN maintenant" (ownership)
200 receipts:  "Je CONNAIS ce problème intimement" (TRUE KNOWING)
```

## 🧪 Testing

Run comprehensive tests:

```bash
npm test lib/agents/__tests__/proof-agent.test.ts
```

Tests cover:
- ✅ All 4 strategy types
- ✅ Receipt validation system
- ✅ Progress coaching (5 milestones)
- ✅ Fraud detection
- ✅ Locke philosophy integration
- ✅ Edge cases

---

# 📊 AGENT 3: SCORE - Real-Time Analyst

## 🎯 Purpose

SCORE calculates and explains scores in real-time, showing users exactly where they stand and how to improve. It measures BOTH traditional clarity and Locke's intimacy.

## 🧠 Philosophy

> "Reading furnishes the mind with materials. Thinking makes what we read ours." — John Locke

SCORE measures TWO dimensions:
1. **Clarity (0-10)**: Do you explain well? (Traditional metric)
2. **Intimacy (0-10)**: Do you KNOW intimately or just "know of"? (Locke's metric)

High clarity but low intimacy = Red flag! You can describe well but don't truly understand.

## 📊 How It Works

### 1. **Clarity Scoring (0-10 points)**

Four sections, each worth 2.5 points:

| Section | Weight | Checks |
|---------|--------|--------|
| **Problem Statement** | 2.5 | WHO, frequency, current solution, why fails, beneficiaries |
| **As-Is Analysis** | 2.5 | Steps, time, cost, pain points |
| **Benefits Statement** | 2.5 | Time saved, cost saved, impact, quantified gains |
| **Operations Needs** | 2.5 | Team, budget, timeline, resources |

### 2. **Intimacy Scoring (0-10 points - Locke's Metric)**

Four factors measuring "true knowing":

```typescript
Lived Experience:    0-3 points  // "J'ai vécu" vs "J'ai lu"
Conversation Count:  0-3 points  // Receipts = real conversations
Iteration Depth:     0-2 points  // Revisions + margin notes
Specificity Level:   0-2 points  // Names, numbers, locations
```

**Verdicts:**
- **0-3.9**: `knowing_of` (Read about it, not lived it)
- **4-6.9**: `becoming_intimate` (Engaging through conversations)
- **7-10**: `true_knowing` (Locke's ideal - problem is YOURS)

### 3. **Gap Identification & Prioritization**

```typescript
Priority = (Potential Gain ÷ Effort) × 100

Effort Levels:
- Low:    1.0x (quick wins!)
- Medium: 0.6x
- High:   0.3x

Special Rule: Lived experience gap ALWAYS priority 95+ (highest!)
```

Each gap includes:
- ✅ **What's missing** (field name)
- ✅ **Potential gain** (points if filled)
- ✅ **Effort required** (low/medium/high)
- ✅ **Exact action** (French + Darija)
- ✅ **Why it matters** (explanation)
- ✅ **Locke insight** (how it deepens understanding)

### 4. **Qualification Tiers**

| Tier | Score | Intimacy | Intilaka | Probability |
|------|-------|----------|----------|-------------|
| **Unqualified** | 0-14 | 0-2 | ❌ No | 5% |
| **Developing** | 15-19 | 3+ | ❌ No | 15% |
| **Promising** | 20-24 | 4+ | ❌ No | 35% |
| **Qualified** | 25-31 | 6+ | ✅ Yes | 65% |
| **Exceptional** | 32-50 | 7+ | ✅ Yes | 85% |

**Special Warning:** High score (25+) but low intimacy (<5) → Still "Promising"
> Locke: You "know OF" but don't truly KNOW. Investors will doubt your understanding.

## 🚀 Usage

### Basic Example

```typescript
import ScoreAgent from '@/lib/agents/score-agent';

const agent = new ScoreAgent();

const idea = {
  problem: {
    description: "Les infirmières du CHU Ibn Sina cherchent matériel 6-8 fois/shift..."
  },
  receipts: Array(50).fill({ id: 'test', amount: 3 })
};

const score = await agent.calculateLiveScore(idea);

console.log(`Score: ${score.current.total}/50`);
console.log(`Intimacy: ${score.current.intimacy}/10 (${score.breakdown.intimacy.verdict})`);
console.log(`Tier: ${score.qualification.tier}`);
console.log(`Intilaka: ${score.qualification.intilaqaEligible ? 'YES' : 'NO'}`);
console.log(`Next action: ${score.nextBestAction.action.french}`);
```

### Real-Time Updates (Debounced)

```typescript
import { debounce } from 'lodash';

const debouncedScore = debounce(async (idea) => {
  const score = await agent.calculateLiveScore(idea);
  updateUI(score);
}, 500);

// On every keystroke
textarea.addEventListener('input', (e) => {
  debouncedScore({ problem: { description: e.target.value } });
});
```

### Gap-Driven UI

```typescript
const score = await agent.calculateLiveScore(idea);

// Show top 3 gaps
score.gaps.slice(0, 3).forEach(gap => {
  showCard({
    title: gap.field,
    gain: `+${gap.potentialGain.toFixed(1)} points`,
    effort: gap.effort,
    action: gap.action.french,
    lockeTip: gap.intimacyImpact
  });
});
```

## 📝 Real Examples

### Example 1: Low Score → Gaps Identified

**Input:**
```typescript
{
  problem: {
    description: "Les gens ont un problème avec la technologie"
  }
}
```

**Output:**
```typescript
{
  current: {
    clarity: 0.5,
    decision: 0,
    total: 0.5,
    intimacy: 0.5
  },
  
  qualification: {
    tier: 'unqualified',
    intilaqaProbability: 5,
    message: "⚠️ PAS ENCORE PRÊT. Locke: Vous 'connaissez DE' mais ne l'avez pas fait VÔTRE"
  },
  
  gaps: [
    {
      field: "Expérience vécue personnellement",
      potentialGain: 3.0,
      priority: 95,
      action: {
        french: "Racontez-moi UNE histoire vraie de votre expérience personnelle"
      },
      intimacyImpact: "L'expérience personnelle = 3 POINTS (30% du score!)"
    },
    {
      field: "Qui EXACTEMENT a ce problème?",
      potentialGain: 2.0,
      priority: 90,
      action: {
        french: "Ajoutez: Qui EXACTEMENT (noms, lieux, professions)"
      }
    }
  ]
}
```

### Example 2: High Clarity, Low Intimacy Warning

**Input:**
```typescript
{
  problem: {
    description: "Les infirmières du CHU Ibn Sina cherchent du matériel 6-8 fois par shift. Actuellement téléphone mais personne ne répond. 2500 patients affectés. 450 infirmières bénéficient."
  },
  asIs: {
    description: "Processus: chercher 10 min, appeler 15 min. Coût 2h/jour. Frustrant."
  },
  benefits: {
    description: "Économie 2h/shift. Réduction 500 DH/mois. Impact 450 personnes. Amélioration 50%."
  }
  // NO receipts, NO personal experience
}
```

**Output:**
```typescript
{
  current: {
    clarity: 7.5,  // Good!
    intimacy: 2.0, // Low!
    total: 27.5
  },
  
  qualification: {
    tier: 'promising', // NOT qualified despite high score!
    intilaqaEligible: false,
    intilaqaProbability: 30,
    message: "⚠️ Score: 27.5/50 (bon!) mais Intimacy: 2.0/10 (faible).
              Locke dirait: Vous 'connaissez DE' mais ne CONNAISSEZ pas intimement.
              Sans intimité, investisseurs doutent de votre compréhension."
  }
}
```

### Example 3: Perfect Score (Locke's Ideal)

**Input:**
```typescript
{
  problem: {
    description: "Hier, j'ai passé 4 heures au CHU Ibn Sina avec l'infirmière Fatima cherchant un défibrillateur pendant urgence. Les infirmières vivent ce problème 6-8 fois/shift..."
  },
  asIs: {
    description: "D'abord armoire (10 min). Ensuite 3-4 appels téléphoniques (15 min). Personne ne répond car occupés. Coût: 2h/jour. Très frustrant et dangereux."
  },
  benefits: {
    description: "Économie 2h par shift = 900h/mois pour 450 infirmières. Réduction coût 500 DH/mois. Impact 2500 patients/jour. Amélioration efficacité 50%."
  },
  operations: {
    description: "Équipe: 3 personnes (1 chef, 1 dev, 1 infirmière). Budget: 50000 DH. Timeline: 6 mois. Ressources: cloud, smartphones, formation."
  },
  receipts: Array(100).fill({ id: 'test', amount: 3 }),
  marginNotes: Array(10).fill({ timestamp: new Date(), note: "Reflection" }),
  revisions: Array(5).fill({ timestamp: new Date(), content: "Version" })
}
```

**Output:**
```typescript
{
  current: {
    clarity: 9.5,
    decision: 28.0,
    total: 37.5,
    intimacy: 9.2
  },
  
  qualification: {
    tier: 'exceptional',
    intilaqaEligible: true,
    intilaqaProbability: 85,
    message: "🏆 EXCEPTIONNEL! Locke serait fier. Vous CONNAISSEZ vraiment.
              Pas juste 'knowing OF' - TRUE KNOWING.
              Intilaka: 85% de probabilité!"
  },
  
  thinkingQuality: 'profound',
  
  breakdown: {
    intimacy: {
      verdict: 'true_knowing',
      livedExperience: { detected: true, score: 3.0 },
      conversationCount: { count: 100, score: 3.0 },
      iterationDepth: { marginNotes: 10, revisions: 5, score: 2.0 },
      specificityLevel: { hasNames: true, hasNumbers: true, score: 2.0 }
    }
  }
}
```

## 🎨 UI Components

### 1. Score Widget
```tsx
<ScoreWidget>
  <ProgressCircle value={score.current.total} max={50} />
  <h3>{score.current.total.toFixed(1)}/50</h3>
  <Badge tier={score.qualification.tier} />
  <p>{score.qualification.message.french}</p>
</ScoreWidget>
```

### 2. Intimacy Meter (Locke's Metric)
```tsx
<IntimacyMeter>
  <h4>Intimité (Locke): {score.current.intimacy.toFixed(1)}/10</h4>
  <ProgressBar value={score.current.intimacy} max={10} />
  <Verdict>{score.breakdown.intimacy.verdict}</Verdict>
  
  <Checklist>
    <Check completed={intimacy.livedExperience.detected}>
      ✅ Expérience vécue (3 pts)
    </Check>
    <Check completed={intimacy.conversationCount.count >= 10}>
      ✅ 10+ conversations (3 pts)
    </Check>
    <Check completed={intimacy.iterationDepth.marginNotes >= 5}>
      ✅ 5+ notes réflexion (2 pts)
    </Check>
    <Check completed={intimacy.specificityLevel.hasNames}>
      ✅ Noms/lieux spécifiques (2 pts)
    </Check>
  </Checklist>
</IntimacyMeter>
```

### 3. Gap Cards (Actionable)
```tsx
<GapList>
  {score.gaps.slice(0, 5).map(gap => (
    <GapCard priority={gap.priority}>
      <h4>{gap.field}</h4>
      <Badge effort={gap.effort} />
      <div className="gain">+{gap.potentialGain.toFixed(1)} pts</div>
      <p>{gap.action.french}</p>
      {gap.intimacyImpact && (
        <LockeInsight>{gap.intimacyImpact}</LockeInsight>
      )}
    </GapCard>
  ))}
</GapList>
```

## 🧪 Testing

Run comprehensive tests:

```bash
npm test lib/agents/__tests__/score-agent.test.ts
```

**27 test cases** covering:
- ✅ Clarity scoring (all 4 sections)
- ✅ Intimacy detection (all 4 factors)
- ✅ Gap identification & prioritization
- ✅ Qualification tiers (all 5 levels)
- ✅ Real-time progressive updates
- ✅ Edge cases (undefined, long text, many receipts)
- ✅ Locke philosophy integration
- ✅ High clarity + low intimacy warning

## 🔮 Transparent Scoring

SCORE always "shows the work":

```typescript
console.log("📊 CLARITY BREAKDOWN:");
console.log(`  Problem: 8.0/10 × 0.25 = 2.0`);
console.log(`  As-Is: 9.0/10 × 0.25 = 2.25`);
console.log(`  Benefits: 8.5/10 × 0.25 = 2.125`);
console.log(`  Operations: 7.0/10 × 0.25 = 1.75`);
console.log(`  TOTAL: 8.125/10`);

console.log("💭 INTIMACY BREAKDOWN:");
console.log(`  Lived Experience: 3.0/3`);
console.log(`  Conversations: 2.5/3 (75 receipts)`);
console.log(`  Iterations: 1.5/2 (5 revisions, 8 notes)`);
console.log(`  Specificity: 2.0/2 (names + numbers + locations)`);
console.log(`  TOTAL: 9.0/10 → Verdict: true_knowing`);
```

Users always understand WHY they got a certain score.

---

## 🔗 Agent Integration

### FIKRA → PROOF Handoff

```typescript
// Step 1: FIKRA clarifies problem
const fikraResponse = await fikraAgent.analyze(problemDraft);

if (fikraResponse.intimacyScore >= 7) {
  // Step 2: PROOF generates collection strategy
  const proofStrategy = await proofAgent.generateStrategy({
    problem: {
      who: extractedFromFikra,
      where: extractedFromFikra,
      painIntensity: fikraResponse.intimacyScore / 2,
      frequency: extractedFromFikra
    },
    solution: proposedSolution
  });
  
  // User has: Clear problem + Collection strategy ✅
}
```

### Next Agents (Coming Soon)

- **AGENT 3: SCORE** - Real-Time Analyst
- **AGENT 4: MENTOR** - Expert Matcher
- **AGENT 5: DOC** - Document Generator

---

## 📊 Implementation Status

| Agent | Status | Tests | Docs | Ready |
|-------|--------|-------|------|-------|
| FIKRA | ✅ Complete | ✅ 20+ | ✅ Full | ✅ Yes |
| PROOF | ✅ Complete | ✅ 20+ | ✅ Full | ✅ Yes |
| SCORE | ✅ Complete | ✅ 27 | ✅ Full | ✅ Yes |
| MENTOR | 🔜 Next | - | - | - |
| DOC | 🔜 Pending | - | - | - |

---

**Built with 💡 by the FIKRA VALLEY team**

*"Reading furnishes the mind. Thinking makes it ours. Acting proves it." - Inspired by John Locke*

