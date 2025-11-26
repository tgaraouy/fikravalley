# 🧪 Quick Validation Guide - Agent 1

## 3 Ways to Validate Agent 1

### 1️⃣ **Web UI Test Page** (Easiest)
```
1. Start dev server: npm run dev
2. Navigate to: http://localhost:3000/test-agent-1
3. Use pre-loaded test cases or enter your own
4. Click "Test Agent 1" button
5. View results instantly
```

### 2️⃣ **Command Line Test**
```bash
npm run test:agent1
```

### 3️⃣ **API Test (cURL/Postman)**
```bash
curl -X POST http://localhost:3000/api/agents/conversation-extractor \
  -H "Content-Type: application/json" \
  -d '{
    "speaker_quote": "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط",
    "speaker_phone": "+212612345678"
  }'
```

## ✅ What to Check

### High Confidence Test (Should Auto-Promote)
**Input:**
```
"فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط. المشكل هو الأهل كيعانيو من توصيل ولادهم كل يوم"
```

**Expected:**
- ✅ `success: true`
- ✅ `needsValidation: false`
- ✅ `ideaId` present (auto-promoted)
- ✅ Check `marrai_ideas` table for new record

### Low Confidence Test (Needs Validation)
**Input:**
```
"شي حاجة للتعليم"
```

**Expected:**
- ✅ `success: true`
- ✅ `needsValidation: true`
- ✅ `validationQuestion` in Darija
- ✅ Check `marrai_conversation_ideas` table
- ✅ Status = `speaker_contacted`

## 📊 Database Checks

### Check Extracted Ideas
```sql
SELECT * FROM marrai_conversation_ideas 
ORDER BY created_at DESC LIMIT 5;
```

### Check Auto-Promoted Ideas
```sql
SELECT ci.*, i.id as idea_id, i.title
FROM marrai_conversation_ideas ci
LEFT JOIN marrai_ideas i ON ci.promoted_to_idea_id = i.id
WHERE ci.status = 'promoted_to_idea';
```

## 🎯 Quick Test Cases

| Test | Input | Expected Result |
|------|-------|----------------|
| High Confidence | "فكرة فبالي نخدم تطبيق..." | Auto-promoted ✅ |
| Low Confidence | "شي حاجة للتعليم" | Needs validation ⚠️ |
| French | "Je pense qu'on devrait..." | Extracted, category set |
| Tamazight | "Adggar d uranday?" | Extracted, Latin script |
| No Idea | "مرحبا كيف الحال" | success: false ❌ |

## 📝 Full Documentation

See `docs/AGENT_1_VALIDATION_GUIDE.md` for complete validation guide.

