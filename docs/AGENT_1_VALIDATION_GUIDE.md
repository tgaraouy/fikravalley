# Agent 1: Conversation Extractor & Validator - Validation Guide

## Quick Test Methods

### Method 1: API Endpoint Test (Recommended)

**Test via cURL or Postman:**

```bash
curl -X POST http://localhost:3000/api/agents/conversation-extractor \
  -H "Content-Type: application/json" \
  -d '{
    "speaker_quote": "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط",
    "speaker_phone": "+212612345678",
    "speaker_email": "test@example.com",
    "speaker_context": "Workshop participant from Rabat"
  }'
```

**Expected Response (High Confidence - Auto-promoted):**
```json
{
  "success": true,
  "conversationIdeaId": "uuid-here",
  "ideaId": "uuid-here",
  "needsValidation": false,
  "message": "Idea extracted and auto-promoted to main ideas table."
}
```

**Expected Response (Low Confidence - Needs Validation):**
```json
{
  "success": true,
  "conversationIdeaId": "uuid-here",
  "needsValidation": true,
  "validationQuestion": "شنو كتعني ب 'تطبيق'؟ واش هاد 'تطبيق للتوصيل' هو فكرة بغيتي نوليها مشروع؟",
  "message": "Idea extracted. Validation required via WhatsApp."
}
```

### Method 2: Direct Agent Test

Create a test file: `test-agent-1.ts`

```typescript
import { conversationExtractorAgent } from '@/lib/agents/conversation-extractor-agent';

async function testAgent1() {
  // Test Case 1: High confidence Darija
  const result1 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط",
    speaker_phone: "+212612345678",
    speaker_email: "test@example.com"
  });
  
  console.log('Test 1 (High Confidence):', result1);
  
  // Test Case 2: Low confidence (needs clarification)
  const result2 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "شي حاجة للتعليم",
    speaker_phone: "+212612345678"
  });
  
  console.log('Test 2 (Needs Clarification):', result2);
  
  // Test Case 3: French
  const result3 = await conversationExtractorAgent.processExtraction({
    speaker_quote: "Je pense qu'on devrait créer une application pour les étudiants de Casablanca",
    speaker_phone: "+212612345678"
  });
  
  console.log('Test 3 (French):', result3);
}

testAgent1();
```

### Method 3: Database Validation

**Check `marrai_conversation_ideas` table:**

```sql
-- View all extracted ideas
SELECT 
  id,
  speaker_quote,
  problem_title,
  problem_statement,
  category,
  confidence_score,
  needs_clarification,
  validation_question,
  status,
  promoted_to_idea_id
FROM marrai_conversation_ideas
ORDER BY created_at DESC
LIMIT 10;
```

**Check auto-promoted ideas:**

```sql
-- Ideas that were auto-promoted
SELECT 
  ci.id as conversation_id,
  ci.problem_title,
  ci.confidence_score,
  ci.status,
  i.id as idea_id,
  i.title,
  i.status as idea_status
FROM marrai_conversation_ideas ci
LEFT JOIN marrai_ideas i ON ci.promoted_to_idea_id = i.id
WHERE ci.status = 'promoted_to_idea'
ORDER BY ci.created_at DESC;
```

**Check ideas needing validation:**

```sql
-- Ideas waiting for validation
SELECT 
  id,
  speaker_quote,
  problem_title,
  confidence_score,
  needs_clarification,
  validation_question,
  status,
  speaker_context
FROM marrai_conversation_ideas
WHERE status = 'speaker_contacted'
ORDER BY created_at DESC;
```

## Test Cases

### ✅ Test Case 1: High Confidence Auto-Promotion

**Input:**
```json
{
  "speaker_quote": "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط. المشكل هو الأهل كيعانيو من توصيل ولادهم كل يوم",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `confidence_score >= 0.85`
- `needs_clarification = false`
- `status = 'promoted_to_idea'`
- Idea created in `marrai_ideas`
- `promoted_to_idea_id` set

### ✅ Test Case 2: Low Confidence Needs Validation

**Input:**
```json
{
  "speaker_quote": "شي حاجة للتعليم",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `confidence_score < 0.85` OR `needs_clarification = true`
- `status = 'speaker_contacted'`
- `validation_question` in Darija
- WhatsApp message sent to `speaker_phone`
- NOT promoted to `marrai_ideas` yet

### ✅ Test Case 3: Tamazight Support

**Input:**
```json
{
  "speaker_quote": "Adggar d uranday? Ssawal amaynu. Bghiti ad nerr aferyigh bach n3awn iselmaden n Casablanca",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- Language detected as Tamazight
- Fields in Latin script
- Validation question in Tamazight if needed

### ✅ Test Case 4: French Support

**Input:**
```json
{
  "speaker_quote": "Je pense qu'on devrait créer une application pour les infirmières du CHU Ibn Sina à Rabat",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- Language detected as French
- Fields preserved in French
- Category and location extracted correctly

## Validation Checklist

- [ ] API endpoint responds correctly
- [ ] High confidence ideas auto-promote to `marrai_ideas`
- [ ] Low confidence ideas get `status='speaker_contacted'`
- [ ] Validation questions generated in correct language (Darija/Tamazight/French)
- [ ] WhatsApp messages sent when `speaker_phone` provided
- [ ] Phone number stored in `speaker_context`
- [ ] Category validated against schema constraints
- [ ] Location extracted and validated
- [ ] `problem_title` max 5 words enforced
- [ ] `problem_statement` is 1 sentence
- [ ] `confidence_score` between 0.70-1.00
- [ ] `promoted_to_idea_id` set when auto-promoted

## Manual Testing Steps

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test via browser console or Postman:**
   - Navigate to `http://localhost:3000`
   - Open browser console
   - Run:
   ```javascript
   fetch('/api/agents/conversation-extractor', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       speaker_quote: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط",
       speaker_phone: "+212612345678"
     })
   })
   .then(r => r.json())
   .then(console.log);
   ```

3. **Check Supabase dashboard:**
   - Go to `marrai_conversation_ideas` table
   - Verify new record created
   - Check `status`, `confidence_score`, `validation_question`

4. **Test WhatsApp (if configured):**
   - Send test with `speaker_phone`
   - Check WhatsApp Business API logs
   - Verify message received

## Common Issues & Solutions

### Issue: "No valid idea extracted"
- **Cause:** `confidence_score < 0.70` or unclear message
- **Solution:** Use more specific, clear input

### Issue: "WhatsApp not sending"
- **Cause:** WhatsApp API not configured or phone format incorrect
- **Solution:** Check `WHATSAPP_API_KEY` env variable, verify phone format

### Issue: "Category validation error"
- **Cause:** Invalid category value
- **Solution:** Agent should default to 'other', check logs

### Issue: "Auto-promotion not working"
- **Cause:** `confidence_score < 0.85` or `needs_clarification=true`
- **Solution:** Check extracted data, verify confidence calculation

