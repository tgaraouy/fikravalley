# AI Validation Guide

This guide helps you test and validate all AI features in the idea process.

## Prerequisites

1. **Environment Variables**
   ```bash
   # Check if ANTHROPIC_API_KEY is set
   echo $ANTHROPIC_API_KEY
   # Or in .env.local:
   ANTHROPIC_API_KEY=your_key_here
   ```

2. **Database Setup**
   - Ensure all tables exist (run migrations)
   - Have at least one test idea in `marrai_ideas`
   - Have test transcripts in `marrai_transcripts` (for extraction testing)

3. **API Server Running**
   ```bash
   npm run dev
   # Server should be running on http://localhost:3000
   ```

---

## 1. Validate Idea Extraction from Conversations

### Test Endpoint: `POST /api/extract-ideas`

**Step 1: Create a test workshop session**
```sql
-- In Supabase SQL Editor
INSERT INTO marrai_workshop_sessions (
  id,
  title,
  location,
  date,
  created_at
) VALUES (
  gen_random_uuid(),
  'Test Workshop - AI Validation',
  'Rabat',
  NOW(),
  NOW()
) RETURNING id;
-- Save the session_id
```

**Step 2: Create test transcripts**
```sql
-- Replace {SESSION_ID} with the ID from Step 1
INSERT INTO marrai_transcripts (
  id,
  session_id,
  text,
  text_cleaned,
  speaker_identified,
  timestamp_in_session,
  word_count,
  processed,
  created_at
) VALUES 
(
  gen_random_uuid(),
  '{SESSION_ID}',
  'Le problème c''est qu''on perd beaucoup de temps à chercher les dossiers. On pourrait créer un système de recherche numérique.',
  'Le problème c''est qu''on perd beaucoup de temps à chercher les dossiers. On pourrait créer un système de recherche numérique.',
  'Ahmed',
  '00:05:30',
  20,
  false,
  NOW()
),
(
  gen_random_uuid(),
  '{SESSION_ID}',
  'Il faudrait automatiser la gestion des rendez-vous. Actuellement, tout est fait manuellement avec des cahiers.',
  'Il faudrait automatiser la gestion des rendez-vous. Actuellement, tout est fait manuellement avec des cahiers.',
  'Fatima',
  '00:12:45',
  15,
  false,
  NOW()
);
```

**Step 3: Call the extraction API**
```bash
# Replace {SESSION_ID} with your session ID
curl -X POST http://localhost:3000/api/extract-ideas \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "{SESSION_ID}",
    "force_reprocess": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "ideasExtracted": 2,
  "ideas": [
    {
      "problem_title": "...",
      "problem_statement": "...",
      "confidence_score": 0.85,
      ...
    }
  ]
}
```

**Validation Checklist:**
- [ ] API returns 200 status
- [ ] `ideasExtracted` > 0
- [ ] Each idea has `confidence_score >= 0.70`
- [ ] Ideas are stored in `marrai_conversation_ideas` table
- [ ] Transcripts are marked as `processed = true`

**Verify in Database:**
```sql
-- Check extracted ideas
SELECT 
  id,
  problem_title,
  confidence_score,
  status,
  created_at
FROM marrai_conversation_ideas
WHERE session_id = '{SESSION_ID}'
ORDER BY created_at DESC;

-- Check transcripts are processed
SELECT 
  id,
  processed,
  text
FROM marrai_transcripts
WHERE session_id = '{SESSION_ID}';
```

---

## 2. Validate Deep Idea Analysis

### Test Endpoint: `POST /api/analyze-idea`

**Step 1: Get or create a test idea**
```sql
-- Get an existing idea
SELECT id, title, problem_statement, proposed_solution
FROM marrai_ideas
WHERE status = 'submitted'
LIMIT 1;

-- Or create a test idea
INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  digitization_opportunity,
  category,
  location,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  'Système de Gestion des Dossiers Numériques',
  'Les employés perdent 2 heures par jour à chercher des dossiers papier. Le système actuel utilise des classeurs physiques.',
  'Créer une plateforme web pour numériser et indexer tous les dossiers avec recherche par mots-clés.',
  '1. Chercher dans classeur (10 min) 2. Demander à collègues (15 min) 3. Vérifier archives (20 min)',
  'Automatiser la recherche et l''indexation des dossiers',
  'administration',
  'rabat',
  'submitted',
  NOW()
) RETURNING id;
```

**Step 2: Call the analysis API**
```bash
# Replace {IDEA_ID} with your idea ID
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "{IDEA_ID}"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "feasibility_score": 7.5,
    "automation_potential": "high",
    "agent_architecture": {
      "agent_name": "...",
      "agent_type": "workflow",
      "triggers": [...],
      "actions": [...]
    },
    "technical_feasibility": {
      "complexity": "moderate",
      "estimated_cost": "5K-10K",
      "estimated_dev_time": "6-8 weeks"
    },
    "roi_analysis": {
      "time_saved_per_month": 40,
      "cost_saved_per_month": 1200,
      "payback_period": "4-6 months"
    },
    ...
  }
}
```

**Validation Checklist:**
- [ ] API returns 200 status
- [ ] Idea status changes to `analyzed`
- [ ] `ai_feasibility_score` is set (0-10)
- [ ] `ai_impact_score` is set (0-10)
- [ ] `automation_potential` is set (high/medium/low)
- [ ] `ai_analysis` JSONB column contains full analysis
- [ ] Entry created in `marrai_agent_solutions` table

**Verify in Database:**
```sql
-- Check idea analysis
SELECT 
  id,
  title,
  status,
  ai_feasibility_score,
  ai_impact_score,
  automation_potential,
  ai_analysis,
  analysis_completed_at
FROM marrai_ideas
WHERE id = '{IDEA_ID}';

-- Check agent solution
SELECT 
  id,
  idea_id,
  agent_name,
  agent_type,
  triggers,
  actions
FROM marrai_agent_solutions
WHERE idea_id = '{IDEA_ID}';
```

**Test Fallback Behavior:**
```bash
# Temporarily set invalid API key to test fallback
# In .env.local, change ANTHROPIC_API_KEY to "invalid"
# Then call the API again - should use fallback analysis
```

---

## 3. Validate Two-Stage Scoring

### Test Function: `scoreIdea()` from `lib/idea-bank/scoring/two-stage-scorer.ts`

**Step 1: Create a test script**
Create file: `scripts/test-scoring.ts`

```typescript
import { scoreIdea, scoreIdeaComplete } from '@/lib/idea-bank/scoring/two-stage-scorer';

// Test idea with good clarity
const testIdea = {
  problemStatement: 'Les infirmières perdent 4 heures par jour à chercher du matériel médical. Le système actuel utilise un cahier papier où seulement 50% des mouvements sont enregistrés.',
  asIsAnalysis: '1. Besoin d''équipement (2 min) 2. Consultation du cahier (5 min) - 60% du temps l''information est incorrecte 3. Appels téléphoniques (10 min) 4. Recherche physique (30 min) 5. Résolution ou abandon (15 min). Temps total: 62 minutes par recherche.',
  benefitStatement: 'Temps économisé: 60 minutes par recherche (97% réduction). 180 heures/jour récupérées. Coût économisé: 26,700 DH/jour = 6,675,000 DH/an. ROI: Système payé en 2.3 jours.',
  operationalNeeds: 'Équipe: 1 développeur (3 mois), 1 designer (1 mois). Technologie: Tags RFID, lecteurs, app mobile, serveur. Budget: 117,180 DH.',
  category: 'health',
  location: 'rabat',
  frequency: 'multiple_daily',
  receipts: 243,
  alignment: {
    moroccoPriorities: [],
    sdgTags: [],
    sdgAutoTagged: false,
    sdgConfidence: {}
  }
};

// Test scoring
const result = scoreIdeaComplete(testIdea);

console.log('=== SCORING RESULTS ===');
console.log('Stage 1 (Clarity):', result.stage1);
console.log('Stage 2 (Decision):', result.stage2);
console.log('Break-even:', result.breakEven);
console.log('Funding:', result.funding);
console.log('Alignment:', result.alignment);
console.log('Overall:', result.overall);
```

**Step 2: Run the test**
```bash
# Using tsx
npx tsx scripts/test-scoring.ts

# Or using ts-node
npx ts-node scripts/test-scoring.ts
```

**Validation Checklist:**
- [ ] Stage 1 scores are calculated (0-40)
- [ ] Stage 2 scores are calculated if Stage 1 passes (0-20)
- [ ] Morocco priorities are auto-detected
- [ ] SDGs are auto-tagged
- [ ] Darija is detected if present
- [ ] Break-even analysis is calculated
- [ ] Qualification tier is assigned (exceptional/qualified/developing)
- [ ] Funding eligibility is determined

**Test Edge Cases:**
```typescript
// Test with low clarity
const lowClarityIdea = {
  problemStatement: 'Problème',
  asIsAnalysis: 'Processus',
  benefitStatement: 'Bénéfices',
  operationalNeeds: 'Équipe',
  // ... minimal data
};

// Test with Darija text
const darijaIdea = {
  problemStatement: 'L-mochkil howa bach...',
  // ...
};

// Test with no alignment data (should auto-detect)
const noAlignmentIdea = {
  // ... other fields
  alignment: undefined
};
```

---

## 4. Validate Clarity Feedback Generation

### Test Endpoint: `POST /api/ideas/feedback`

**Step 1: Create a low-scoring idea**
```sql
-- Create idea with minimal information (will score low)
INSERT INTO marrai_ideas (
  id,
  title,
  problem_statement,
  proposed_solution,
  current_manual_process,
  digitization_opportunity,
  category,
  location,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  'Test Idea',
  'Problème',
  'Solution',
  'Processus',
  'Opportunité',
  'health',
  'rabat',
  'submitted',
  NOW()
) RETURNING id;
```

**Step 2: Call the feedback API**
```bash
# Replace {IDEA_ID} with your idea ID
curl -X POST http://localhost:3000/api/ideas/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "ideaId": "{IDEA_ID}"
  }'
```

**Expected Response:**
```json
{
  "overall": {
    "score": 4.2,
    "status": "needs_revision",
    "message": "L'idée nécessite des améliorations pour passer le seuil de clarté..."
  },
  "items": [
    {
      "criterion": "Problem Statement",
      "score": 3,
      "issues": [
        "Manque de détails sur qui est affecté",
        "Pas de quantification du problème"
      ],
      "suggestions": [
        "Ajoutez le nombre de personnes affectées",
        "Quantifiez le temps perdu ou le coût"
      ],
      "examples": {
        "current": "...",
        "improved": "..."
      },
      "estimatedTimeToFix": 15
    }
  ],
  "quickWins": [...],
  "priorityOrder": [...],
  "estimatedTotalTime": 60
}
```

**Validation Checklist:**
- [ ] API returns 200 status
- [ ] Overall score is calculated
- [ ] Each criterion has issues and suggestions
- [ ] Examples are provided (current vs improved)
- [ ] Quick wins are identified
- [ ] Priority order is logical
- [ ] Estimated time is reasonable

---

## 5. Validate Auto-Tagging Features

### Test SDG Auto-Tagging

```typescript
import { autoTagSDGs } from '@/lib/idea-bank/scoring/two-stage-scorer';

const testInput = {
  problemStatement: 'Améliorer l''accès aux soins de santé dans les zones rurales',
  category: 'health',
  // ...
};

const sdgData = autoTagSDGs(testInput);
console.log('SDG Tags:', sdgData.sdgTags);
console.log('Confidence:', sdgData.sdgConfidence);
// Should detect SDG 3 (Good Health and Well-being)
```

### Test Morocco Priorities Detection

```typescript
import { detectMoroccoPriorities } from '@/lib/idea-bank/scoring/two-stage-scorer';

const text = 'Numérisation du système de santé, aligné avec Digital Morocco 2030';
const priorities = detectMoroccoPriorities(text);
console.log('Morocco Priorities:', priorities);
// Should detect 'digital_morocco' and 'health_system'
```

### Test Darija Detection

```typescript
import { detectDarija } from '@/lib/idea-bank/scoring/two-stage-scorer';

const darijaText = 'L-mochkil howa bach kayn bzaf dyal l-w9t dyal l-7sab';
const detection = detectDarija(darijaText);
console.log('Darija Detected:', detection.detected);
console.log('Confidence:', detection.confidence);
```

---

## 6. End-to-End Validation Workflow

### Complete Test Scenario

**Step 1: Create test data**
```sql
-- 1. Create workshop session
-- 2. Create transcripts with ideas
-- 3. Create a test idea
```

**Step 2: Run extraction**
```bash
curl -X POST http://localhost:3000/api/extract-ideas \
  -H "Content-Type: application/json" \
  -d '{"session_id": "{SESSION_ID}"}'
```

**Step 3: Promote extracted idea**
```bash
curl -X POST http://localhost:3000/api/promote-idea \
  -H "Content-Type: application/json" \
  -d '{"conversation_idea_id": "{CONVERSATION_IDEA_ID}"}'
```

**Step 4: Analyze promoted idea**
```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "{IDEA_ID}"}'
```

**Step 5: Check scoring**
```sql
SELECT 
  i.id,
  i.title,
  cs.total as clarity_score,
  ds.total as decision_score,
  i.qualification_tier
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
WHERE i.id = '{IDEA_ID}';
```

**Step 6: Get feedback (if needed)**
```bash
curl -X POST http://localhost:3000/api/ideas/feedback \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "{IDEA_ID}"}'
```

---

## 7. Automated Test Script

Create file: `scripts/validate-ai.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function validateAI() {
  console.log('🧪 Starting AI Validation Tests...\n');

  // Test 1: Extraction
  console.log('1️⃣ Testing Idea Extraction...');
  // ... extraction test code

  // Test 2: Analysis
  console.log('2️⃣ Testing Idea Analysis...');
  // ... analysis test code

  // Test 3: Scoring
  console.log('3️⃣ Testing Scoring System...');
  // ... scoring test code

  // Test 4: Feedback
  console.log('4️⃣ Testing Feedback Generation...');
  // ... feedback test code

  console.log('\n✅ All AI validation tests completed!');
}

validateAI().catch(console.error);
```

Run with:
```bash
npx tsx scripts/validate-ai.ts
```

---

## 8. Monitoring & Debugging

### Check API Logs
```bash
# Watch Next.js logs
npm run dev | grep -i "claude\|ai\|analysis"
```

### Check Database for AI Results
```sql
-- Ideas with AI analysis
SELECT 
  id,
  title,
  ai_feasibility_score,
  ai_impact_score,
  automation_potential,
  analysis_completed_at
FROM marrai_ideas
WHERE ai_analysis IS NOT NULL
ORDER BY analysis_completed_at DESC
LIMIT 10;

-- Check for failed analyses
SELECT 
  id,
  title,
  status,
  analysis_completed_at
FROM marrai_ideas
WHERE status = 'analyzing'
AND analysis_completed_at IS NULL
AND created_at < NOW() - INTERVAL '1 hour';
-- These might be stuck
```

### Test Claude API Directly
```typescript
import { anthropic } from '@/lib/anthropic';

const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 100,
  messages: [{
    role: 'user',
    content: 'Say "AI is working" if you can read this.'
  }]
});

console.log(response.content[0]);
```

---

## Troubleshooting

### Issue: "ANTHROPIC_API_KEY not found"
**Solution:** Check `.env.local` file has `ANTHROPIC_API_KEY=sk-ant-...`

### Issue: "Claude API error"
**Solution:** 
- Check API key is valid
- Check rate limits
- Verify network connection
- Check Anthropic dashboard for errors

### Issue: "No ideas extracted"
**Solution:**
- Ensure transcripts have >500 words total
- Check transcripts are not already processed
- Verify transcripts contain idea-related keywords

### Issue: "Analysis stuck in 'analyzing' status"
**Solution:**
- Check API logs for errors
- Verify Claude API is responding
- Manually update status if needed:
  ```sql
  UPDATE marrai_ideas
  SET status = 'submitted'
  WHERE status = 'analyzing'
  AND analysis_completed_at IS NULL;
  ```

---

## Success Criteria

✅ **All AI features validated if:**
- [ ] Extraction returns ideas with confidence ≥ 0.70
- [ ] Analysis completes and stores results in database
- [ ] Scoring calculates Stage 1 and Stage 2 correctly
- [ ] Auto-tagging detects Morocco priorities and SDGs
- [ ] Feedback provides actionable suggestions
- [ ] Fallback mechanisms work when API fails
- [ ] All database columns are populated correctly

