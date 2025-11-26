# 🧪 Complete Testing Guide - All New Features

## 🚀 Quick Start

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access Testing Dashboard
```
http://localhost:3000/test-all
```

---

## 📋 Testing Checklist by Feature

### ✅ Stage 1-3: Voice Submission & Extraction

#### Test: Voice Dictation & Real-time Extraction
**Page:** `/submit-voice`

1. **Start Recording**
   - Click microphone button
   - Grant microphone permission
   - Speak: "2-3 DH/kilo exploitation"
   - Verify: Status shows "Recording"

2. **Stop Recording**
   - Click stop button
   - Verify: Status shows "Transcribing"
   - Wait 3-5 seconds
   - Verify: Status shows "Processing"
   - Verify: Extracted fields appear (title, category, location, problem_statement)

3. **Continue with Solution**
   - Click microphone again
   - Speak: "Tech pour améliorer conditions"
   - Verify: `proposed_solution` field is filled

4. **Submit**
   - Click "Submit" button
   - Verify: Success message appears
   - Verify: Idea is saved to `marrai_conversation_ideas`

**Expected Result:**
- ✅ All fields extracted correctly
- ✅ Confidence score > 0.85 (or clarification triggered)
- ✅ Status = `pending_validation`

---

### ✅ Stage 4: WhatsApp Clarification Loop

#### Test: Low Confidence Triggers Clarification
**Setup:** Create an idea with confidence < 0.85

1. **Submit Low-Confidence Idea**
   - Use `/submit-voice` with unclear/problematic input
   - Verify: `needs_clarification = true`
   - Verify: `validation_question` is set

2. **Check Database**
   ```sql
   SELECT id, speaker_quote, confidence_score, needs_clarification, validation_question, status
   FROM marrai_conversation_ideas
   WHERE needs_clarification = true
   ORDER BY created_at DESC
   LIMIT 1;
   ```

3. **Simulate WhatsApp Reply**
   - **Webhook URL:** `POST /api/webhooks/whatsapp`
   - **Payload:**
     ```json
     {
       "messages": [{
         "from": "+212612345678",
         "text": {
           "body": "نعم، كتعني بتحسين ظروف العمل"
         }
       }]
     }
     ```
   - **Headers:**
     ```
     X-Hub-Signature-256: sha256=...
     X-360dialog-Signature: ...
     ```

4. **Verify Re-extraction**
   - Check `marrai_conversation_ideas` table
   - Verify: `status` updated to `speaker_validated` or `promoted_to_idea`
   - Verify: `confidence_score` increased

**Expected Result:**
- ✅ WhatsApp message sent to user
- ✅ Webhook receives reply
- ✅ Agent 1 re-runs with original + reply
- ✅ Confidence increases or idea is promoted

---

### ✅ Stage 5: Agent 2A-C Analysis

#### Test: Feasibility & Impact Analysis
**API:** `POST /api/analyze-idea`

1. **Get a Promoted Idea ID**
   ```sql
   SELECT id FROM marrai_ideas WHERE status = 'transcribing' LIMIT 1;
   ```

2. **Trigger Analysis**
   ```bash
   curl -X POST http://localhost:3000/api/analyze-idea \
     -H "Content-Type: application/json" \
     -d '{"ideaId": "YOUR_IDEA_ID"}'
   ```

3. **Verify Results**
   ```sql
   SELECT 
     id, 
     title,
     ai_feasibility_score,
     ai_impact_score,
     roi_time_saved_hours,
     roi_cost_saved_eur,
     alignment,
     status
   FROM marrai_ideas
   WHERE id = 'YOUR_IDEA_ID';
   ```

**Expected Result:**
- ✅ `ai_feasibility_score` between 0-1
- ✅ `ai_impact_score` between 0-1
- ✅ `roi_time_saved_hours` > 0
- ✅ `roi_cost_saved_eur` > 0
- ✅ `alignment` JSON contains `sdgTags`, `moroccoPriorities`
- ✅ `status` = `analyzed`

---

### ✅ Stage 6: Admin Mentor Review

#### Test: Review & Approve Mentor Matches
**Page:** `/admin/mentor-matches`

1. **Access Admin Dashboard**
   - Navigate to `/admin/mentor-matches`
   - Verify: Login required (if not logged in)

2. **View Pending Matches**
   - Verify: Matches grouped by idea
   - Verify: Top matches sorted by `match_score`
   - Verify: Idea and mentor details visible

3. **Approve Match**
   - Click "Approve" on a match
   - Verify: Status changes to `active`
   - Verify: Match appears in "Active" filter

4. **Bulk Operations**
   - Select multiple matches
   - Click "Bulk Approve"
   - Verify: All selected matches updated

**Expected Result:**
- ✅ Pending matches visible
- ✅ Approve/reject works
- ✅ Status filters work
- ✅ Bulk operations work

---

### ✅ Stage 7: Agent 6 Notifications

#### Test: Mentor Notifications
**API:** `POST /api/agents/notification`

1. **Set Idea to Visible**
   ```sql
   UPDATE marrai_ideas
   SET visible = true, featured = true
   WHERE id = 'YOUR_IDEA_ID';
   ```

2. **Trigger Notification**
   ```bash
   curl -X POST http://localhost:3000/api/agents/notification \
     -H "Content-Type: application/json" \
     -d '{
       "ideaId": "YOUR_IDEA_ID",
       "action": "notify"
     }'
   ```

3. **Verify WhatsApp Sent**
   - Check WhatsApp logs
   - Verify: Message sent to mentors with `status = 'active'`
   - Verify: Message includes idea title, problem, solution, link

4. **Check Database**
   ```sql
   SELECT id, status, mentor_responded_at
   FROM marrai_mentor_matches
   WHERE idea_id = 'YOUR_IDEA_ID'
   AND status = 'active';
   ```

**Expected Result:**
- ✅ WhatsApp messages sent to active mentors
- ✅ Match status updated to `active`
- ✅ Rate limiting prevents spam (1 per day per mentor)

---

### ✅ Stage 8: Mentor Portal

#### Test: Mentor Accept/Reject Matches
**Page:** `/mentor/dashboard?email=mentor@example.com`

1. **Access Mentor Dashboard**
   - Navigate to `/mentor/dashboard?email=YOUR_MENTOR_EMAIL`
   - Verify: Matches for this mentor appear

2. **View Match Details**
   - Click "View Full Details"
   - Verify: Idea details page loads (`/idea/[id]/dashboard?email=...`)
   - Verify: Problem, solution, metrics visible

3. **Accept Match**
   - Click "Accept Match"
   - Confirm dialog
   - Verify: Status changes to `accepted`
   - Verify: Idea status updates to `funded` (if first acceptance)

4. **Reject Match**
   - Click "Reject Match"
   - Enter reason (optional)
   - Verify: Status changes to `rejected`

**Expected Result:**
- ✅ Mentor can view their matches
- ✅ Accept/reject works
- ✅ Idea status updates correctly
- ✅ Email/phone identification works

---

### ✅ Stage 9-10: Public Visibility & Sharing

#### Test: Public Idea Page
**Page:** `/idea/[id]`

1. **Set Idea to Visible**
   ```sql
   UPDATE marrai_ideas
   SET visible = true
   WHERE id = 'YOUR_IDEA_ID';
   ```

2. **Access Public Page**
   - Navigate to `/idea/YOUR_IDEA_ID`
   - Verify: Idea details visible
   - Verify: Problem, solution, metrics displayed
   - Verify: SDG alignment tags visible

3. **Test "I Want to Help"**
   - Click "I Want to Help" button
   - Verify: Button changes to "✅ You validated this problem!"
   - Verify: Validation count increases
   - Verify: Cannot validate twice (IP-based)

4. **Test Share Buttons**
   - Click "Share on Twitter"
   - Verify: Twitter opens with pre-filled text
   - Click "Share on WhatsApp"
   - Verify: WhatsApp opens with pre-filled text (Darija)

5. **Test Copy Link**
   - Click "Copy Link"
   - Verify: Link copied to clipboard

**Expected Result:**
- ✅ Public page loads (if `visible = true`)
- ✅ 403 error if `visible = false`
- ✅ Validation works (IP-based deduplication)
- ✅ Share buttons work with Agent 6 text
- ✅ Metrics and SDG alignment displayed

---

## 🔧 API Endpoints Testing

### Agent 1: Conversation Extractor
```bash
# Debug endpoint
curl -X POST http://localhost:3000/api/agents/conversation-extractor/debug \
  -H "Content-Type: application/json" \
  -d '{"speaker_quote": "Test idea for extraction"}'

# Full extraction
curl -X POST http://localhost:3000/api/agents/conversation-extractor \
  -H "Content-Type: application/json" \
  -d '{
    "speaker_quote": "Morocco tourism problem",
    "speaker_context": {"phone": "+212612345678"}
  }'
```

### Agent 2: Analysis
```bash
curl -X POST http://localhost:3000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "YOUR_IDEA_ID"}'
```

### Agent 5: Mentor Matching
```bash
curl -X POST http://localhost:3000/api/agents/mentor \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "YOUR_IDEA_ID", "action": "match"}'
```

### Agent 6: Notifications
```bash
# Generate share text
curl "http://localhost:3000/api/agents/notification?action=generateShareText&ideaId=YOUR_IDEA_ID"

# Full notification
curl -X POST http://localhost:3000/api/agents/notification \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "YOUR_IDEA_ID", "action": "notify"}'
```

### Agent 7: Feature Flag
```bash
curl -X POST http://localhost:3000/api/agents/feature-flag \
  -H "Content-Type: application/json" \
  -d '{"ideaId": "YOUR_IDEA_ID", "action": "process"}'
```

### Mentor API
```bash
# Get matches
curl "http://localhost:3000/api/mentor/matches?email=mentor@example.com&status=active"

# Accept match
curl -X POST http://localhost:3000/api/mentor/matches \
  -H "Content-Type: application/json" \
  -d '{
    "action": "accept",
    "match_id": "MATCH_ID",
    "mentor_email": "mentor@example.com"
  }'
```

### Admin API
```bash
# Get mentor matches
curl "http://localhost:3000/api/admin/mentor-matches?status=pending"

# Approve match
curl -X POST http://localhost:3000/api/admin/mentor-matches \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve",
    "match_ids": ["MATCH_ID_1", "MATCH_ID_2"]
  }'
```

---

## 🗄️ Database Verification Queries

### Check Conversation Ideas
```sql
SELECT 
  id,
  speaker_quote,
  problem_title,
  confidence_score,
  needs_clarification,
  status,
  promoted_to_idea_id,
  created_at
FROM marrai_conversation_ideas
ORDER BY created_at DESC
LIMIT 10;
```

### Check Promoted Ideas
```sql
SELECT 
  id,
  title,
  problem_statement,
  ai_feasibility_score,
  ai_impact_score,
  status,
  visible,
  featured,
  created_at
FROM marrai_ideas
ORDER BY created_at DESC
LIMIT 10;
```

### Check Mentor Matches
```sql
SELECT 
  mm.id,
  mm.idea_id,
  mm.mentor_id,
  mm.match_score,
  mm.status,
  i.title,
  m.name as mentor_name,
  m.email as mentor_email
FROM marrai_mentor_matches mm
JOIN marrai_ideas i ON mm.idea_id = i.id
JOIN marrai_mentors m ON mm.mentor_id = m.id
ORDER BY mm.created_at DESC
LIMIT 10;
```

### Check Problem Validations
```sql
SELECT 
  id,
  idea_id,
  validator_ip,
  created_at
FROM marrai_problem_validations
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 Common Issues & Solutions

### Issue: "Idea not found" on public page
**Solution:** Check `visible = true` in database
```sql
UPDATE marrai_ideas SET visible = true WHERE id = 'YOUR_ID';
```

### Issue: WhatsApp webhook not receiving messages
**Solution:** 
1. Check webhook URL is configured in 360dialog
2. Verify `WHATSAPP_WEBHOOK_VERIFY_TOKEN` matches
3. Check server logs for incoming requests

### Issue: Mentor matches not appearing
**Solution:**
1. Verify Agent 5 has run: `status = 'matched'`
2. Check matches exist: `SELECT * FROM marrai_mentor_matches WHERE idea_id = '...'`
3. Verify mentor email/phone matches

### Issue: Share text not generating
**Solution:**
1. Check idea exists and is visible
2. Verify Agent 6 API endpoint is accessible
3. Check browser console for errors

---

## 📊 Testing Workflow Summary

1. **Submit Idea** → `/submit-voice`
2. **Check Extraction** → Database: `marrai_conversation_ideas`
3. **Trigger Analysis** → API: `/api/analyze-idea`
4. **Match Mentors** → API: `/api/agents/mentor`
5. **Admin Review** → `/admin/mentor-matches`
6. **Mentor Accept** → `/mentor/dashboard`
7. **Make Public** → Database: `UPDATE marrai_ideas SET visible = true`
8. **Test Sharing** → `/idea/[id]`

---

## ✅ Success Criteria

- ✅ Voice dictation works (Whisper transcription)
- ✅ Real-time extraction works (Agent 1)
- ✅ Low confidence triggers WhatsApp clarification
- ✅ Analysis completes (Agent 2A-C)
- ✅ Mentor matching works (Agent 5)
- ✅ Admin can approve matches
- ✅ Mentors can accept/reject
- ✅ Public page shows ideas (if visible)
- ✅ Share buttons work
- ✅ "I Want to Help" creates validations

---

## 🎯 Next Steps

After testing, consider:
1. Add status tracking UI (show user progress)
2. Add email notifications (SendGrid integration)
3. Add analytics tracking
4. Add error monitoring (Sentry)
5. Add performance monitoring

