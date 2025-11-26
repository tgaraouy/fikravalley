# Agent 1: Complete Validation Guide

## Quick Validation Methods

### 1. PowerShell Test Script (Fastest)
```powershell
.\test-agent1-full.ps1
```

**Expected Output:**
```json
{
  "success": true,
  "conversationIdeaId": "uuid-here",
  "ideaId": "uuid-here",
  "needsValidation": false,
  "message": "Idea extracted and auto-promoted to main ideas table."
}
```

### 2. Web UI Test Page (Easiest)
Navigate to: `http://localhost:3000/test-agent-1`

- Use pre-loaded test cases
- Click "🔍 Debug" for detailed analysis
- See real-time results

### 3. API Test (cURL/Postman)
```bash
POST http://localhost:3000/api/agents/conversation-extractor
Content-Type: application/json

{
  "speaker_quote": "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط",
  "speaker_phone": "+212612345678"
}
```

## Validation Checklist

### ✅ Extraction Works
- [ ] Idea extracted from input
- [ ] `problem_title` generated (max 5 words)
- [ ] `problem_statement` generated (1 sentence)
- [ ] `category` assigned (valid category)
- [ ] `confidence_score` calculated (0.70-1.00)

### ✅ Language Support
- [ ] Darija (Arabic script) works
- [ ] French works
- [ ] English works
- [ ] Tamazight (Latin script) works

### ✅ Auto-Promotion (High Confidence)
- [ ] If `confidence_score >= 0.85` AND `needs_clarification = false`:
  - [ ] Status set to `promoted_to_idea`
  - [ ] Idea created in `marrai_ideas` table
  - [ ] `promoted_to_idea_id` set
  - [ ] Response shows `ideaId` and `needsValidation: false`

### ✅ Validation Required (Low Confidence)
- [ ] If `confidence_score < 0.85` OR `needs_clarification = true`:
  - [ ] Status set to `speaker_contacted`
  - [ ] `validation_question` generated (in correct language)
  - [ ] WhatsApp message sent (if `speaker_phone` provided)
  - [ ] Response shows `needsValidation: true`
  - [ ] Idea NOT auto-promoted

### ✅ Database Operations
- [ ] Idea saved to `marrai_conversation_ideas`
- [ ] Service role key used (check logs: "✅ Using service role key")
- [ ] No RLS errors
- [ ] Phone number stored in `speaker_context`

## Test Cases

### Test Case 1: High Confidence Auto-Promotion ✅
**Input:**
```json
{
  "speaker_quote": "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط. المشكل هو الأهل كيعانيو من توصيل ولادهم كل يوم",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `success: true`
- `confidence_score >= 0.85`
- `needsValidation: false`
- `ideaId` present (auto-promoted)
- Check `marrai_ideas` table for new record

### Test Case 2: Low Confidence Needs Validation ⚠️
**Input:**
```json
{
  "speaker_quote": "شي حاجة للتعليم",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `success: true`
- `confidence_score < 0.85` OR `needs_clarification: true`
- `needsValidation: true`
- `validationQuestion` in Darija
- `ideaId` NOT present (not auto-promoted)
- Check `marrai_conversation_ideas` table, status = `speaker_contacted`

### Test Case 3: English Input ✅
**Input:**
```json
{
  "speaker_quote": "Morocco receive 20m visitors but they don't return after their first visits",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `success: true`
- Language detected as English
- Fields preserved in English
- Category and location extracted if mentioned

### Test Case 4: No Valid Idea ❌
**Input:**
```json
{
  "speaker_quote": "مرحبا كيف الحال",
  "speaker_phone": "+212612345678"
}
```

**Expected:**
- `success: false`
- `message: "No valid idea extracted"`
- No database records created

## Database Validation

### Check Extracted Ideas
```sql
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

### Check Auto-Promoted Ideas
```sql
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

### Check Ideas Needing Validation
```sql
SELECT 
  id,
  speaker_quote,
  problem_title,
  confidence_score,
  needs_clarification,
  validation_question,
  status
FROM marrai_conversation_ideas
WHERE status = 'speaker_contacted'
ORDER BY created_at DESC;
```

## Server Logs Validation

### ✅ Good Logs (Service Role Key Working)
```
✅ Using service role key - RLS bypassed
Attempting to insert conversation idea: { usingServiceRole: true }
Successfully saved conversation idea: uuid-here
```

### ⚠️ Warning Logs (Anon Key - May Work)
```
⚠️ WARNING: Using anon key - RLS will block inserts!
   Set SUPABASE_SERVICE_ROLE_KEY in .env.local
```

### ❌ Error Logs (RLS Blocking)
```
Error saving extracted idea: {
  code: '42501',
  message: 'new row violates row-level security policy'
}
```

## Automated Validation Script

Run comprehensive tests:
```powershell
.\test-agent1-direct.ps1
```

This tests:
- Debug endpoint
- Main extraction endpoint
- Compares results
- Shows detailed diagnostics

## What Success Looks Like

### Complete Success Flow:
1. ✅ Input received
2. ✅ Claude API called
3. ✅ JSON parsed successfully
4. ✅ Validation passed
5. ✅ Saved to `marrai_conversation_ideas`
6. ✅ Service role key used (logs show "✅ Using service role key")
7. ✅ Auto-promoted (if confidence ≥ 0.85)
8. ✅ Created in `marrai_ideas` (if auto-promoted)
9. ✅ Response returned with success

## Common Issues & Solutions

### Issue: "No valid idea extracted"
**Causes:**
- Input too vague
- Not a digitization idea
- Confidence < 0.70

**Solution:** Use more specific input with clear problem/solution

### Issue: RLS Error (42501)
**Causes:**
- Service role key not set
- Server not restarted after adding key

**Solution:** 
1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. Restart dev server
3. Check logs for "✅ Using service role key"

### Issue: Extraction works but save fails
**Causes:**
- RLS policy blocking
- Missing required fields

**Solution:** Check server logs for specific error

## Quick Health Check

Run this to verify everything:
```powershell
# Test 1: High confidence
$body1 = @{ speaker_quote = "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط" } | ConvertTo-Json
$r1 = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor" -Method POST -ContentType "application/json" -Body $body1
Write-Host "Test 1: $($r1.success)" -ForegroundColor $(if ($r1.success) { "Green" } else { "Red" })

# Test 2: Low confidence
$body2 = @{ speaker_quote = "شي حاجة" } | ConvertTo-Json
$r2 = Invoke-RestMethod -Uri "http://localhost:3000/api/agents/conversation-extractor" -Method POST -ContentType "application/json" -Body $body2
Write-Host "Test 2: $($r2.success)" -ForegroundColor $(if ($r2.success) { "Green" } else { "Red" })
```

## Success Criteria

Agent 1 is working correctly if:
- ✅ All test cases pass
- ✅ Database records created
- ✅ Service role key used (no RLS errors)
- ✅ Auto-promotion works for high confidence
- ✅ Validation questions generated for low confidence
- ✅ Multiple languages supported
- ✅ WhatsApp integration ready (when phone provided)

