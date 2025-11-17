# AI Validation Quick Start

Quick guide to validate all AI features in 5 minutes.

## 🚀 Quick Test (Automated)

### Option 1: Run TypeScript Test Script
```bash
npm run test:ai
```

This will test:
- ✅ Two-stage scoring system
- ✅ Clarity feedback generation
- ✅ Database queries for AI results
- ✅ API endpoint availability

### Option 2: Run Shell Script (Linux/Mac)
```bash
chmod +x scripts/quick-ai-test.sh
./scripts/quick-ai-test.sh
```

---

## 📋 Manual Validation Checklist

### 1. Test Idea Extraction (2 minutes)

**Create test data:**
```sql
-- In Supabase SQL Editor
INSERT INTO marrai_workshop_sessions (id, title, location, date, created_at)
VALUES (gen_random_uuid(), 'Test Session', 'Rabat', NOW(), NOW())
RETURNING id;
-- Save the session_id

INSERT INTO marrai_transcripts (id, session_id, text, text_cleaned, speaker_identified, word_count, processed, created_at)
VALUES (
  gen_random_uuid(),
  '{SESSION_ID}',  -- Replace with session_id from above
  'Le problème c''est qu''on perd beaucoup de temps. On pourrait créer un système numérique.',
  'Le problème c''est qu''on perd beaucoup de temps. On pourrait créer un système numérique.',
  'Test Speaker',
  15,
  false,
  NOW()
);
```

**Test API:**
```bash
curl -X POST http://localhost:3000/api/extract-ideas \
  -H "Content-Type: application/json" \
  -d '{"session_id": "{SESSION_ID}"}'
```

**✅ Success if:**
- Returns `ideasExtracted > 0`
- Ideas appear in `marrai_conversation_ideas` table
- Transcripts marked as `processed = true`

---

### 2. Test Idea Analysis (2 minutes)

**Get an idea ID:**
```sql
SELECT id FROM marrai_ideas WHERE status = 'submitted' LIMIT 1;
```

**Test API:**
```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "{IDEA_ID}"}'
```

**✅ Success if:**
- Returns 200 status
- Idea status changes to `analyzed`
- Check database:
```sql
SELECT ai_feasibility_score, ai_impact_score, automation_potential, ai_analysis
FROM marrai_ideas
WHERE id = '{IDEA_ID}';
```

---

### 3. Test Scoring (1 minute)

**Run test script:**
```bash
npm run test:ai
```

**Or test manually:**
```typescript
import { scoreIdeaComplete } from '@/lib/idea-bank/scoring/two-stage-scorer';

const result = scoreIdeaComplete({
  problemStatement: 'Detailed problem...',
  asIsAnalysis: 'Detailed process...',
  benefitStatement: 'Quantified benefits...',
  operationalNeeds: 'Team and budget...',
  category: 'health',
  location: 'rabat',
  frequency: 'multiple_daily',
  receipts: 100
});

console.log(result);
```

**✅ Success if:**
- Stage 1 score calculated (0-40)
- Stage 2 score calculated if Stage 1 passes (0-20)
- Morocco priorities auto-detected
- SDGs auto-tagged

---

### 4. Test Feedback (1 minute)

**Test API:**
```bash
curl -X POST http://localhost:3000/api/ideas/feedback \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "{IDEA_ID}"}'
```

**✅ Success if:**
- Returns feedback object
- Contains `items` with issues and suggestions
- Provides `quickWins` and `priorityOrder`

---

## 🔍 Verify in Database

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

-- Ideas with scores
SELECT 
  i.id,
  i.title,
  cs.total as clarity_score,
  ds.total as decision_score,
  i.qualification_tier
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
WHERE cs.total IS NOT NULL
ORDER BY cs.total DESC
LIMIT 10;

-- Extracted ideas from conversations
SELECT 
  id,
  problem_title,
  confidence_score,
  status
FROM marrai_conversation_ideas
ORDER BY created_at DESC
LIMIT 10;
```

---

## ⚠️ Troubleshooting

### "ANTHROPIC_API_KEY not found"
```bash
# Check .env.local
cat .env.local | grep ANTHROPIC_API_KEY

# Should show:
# ANTHROPIC_API_KEY=sk-ant-...
```

### "Server not running"
```bash
npm run dev
# Should start on http://localhost:3000
```

### "No ideas extracted"
- Ensure transcripts have >500 words total
- Check transcripts contain idea keywords
- Verify transcripts are not already processed

### "Analysis stuck"
```sql
-- Check for stuck analyses
SELECT id, title, status, analysis_completed_at
FROM marrai_ideas
WHERE status = 'analyzing'
AND analysis_completed_at IS NULL
AND created_at < NOW() - INTERVAL '1 hour';

-- Reset if needed
UPDATE marrai_ideas
SET status = 'submitted'
WHERE status = 'analyzing'
AND analysis_completed_at IS NULL;
```

---

## 📚 Full Documentation

For detailed validation instructions, see:
- **`docs/ai-validation-guide.md`** - Complete validation guide
- **`docs/ai-in-idea-process.md`** - AI feature overview

---

## ✅ Success Criteria

All AI features are validated if:

- [ ] Extraction returns ideas with confidence ≥ 0.70
- [ ] Analysis completes and stores results
- [ ] Scoring calculates Stage 1 and Stage 2
- [ ] Auto-tagging detects priorities and SDGs
- [ ] Feedback provides actionable suggestions
- [ ] All database columns are populated

---

## 🎯 Next Steps

1. **Run automated test:** `npm run test:ai`
2. **Test with real data:** Use actual ideas from your database
3. **Monitor logs:** Watch for Claude API errors
4. **Check database:** Verify all AI results are stored correctly
5. **Review feedback:** Ensure suggestions are actionable

