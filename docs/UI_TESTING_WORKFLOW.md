# UI Testing Workflow - All Agents

## 🚀 Quick Start

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open testing dashboard**:
   ```
   http://localhost:3000/test-agents
   ```

## 📋 Testing Workflow

### Complete End-to-End Workflow

```
1. Agent 1 (Extract) 
   ↓
2. Agent 2A/2B (Analyze)
   ↓
3. Agent 2C (Alignment - automatic)
   ↓
4. Agent 5 (Match Mentors)
   ↓
5. Agent 7 (Feature Flag)
   ↓
6. Agent 6 (Notify)
```

---

## 🤖 Agent 1: Conversation Extractor

**URL**: `http://localhost:3000/test-agent-1` or `/test-agents` (select Agent 1)

### Test Cases

#### ✅ High Confidence (Auto-Promote)
**Input**:
```
Speaker Quote: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط. المشكل هو الأهل كيعانيو من توصيل ولادهم كل يوم"
Phone: +212612345678
```

**Expected**:
- ✅ `success: true`
- ✅ `ideaId` present (auto-promoted)
- ✅ `needsValidation: false`
- ✅ Check database: Idea in `marrai_ideas` table

#### ⚠️ Low Confidence (Needs Validation)
**Input**:
```
Speaker Quote: "شي حاجة للتعليم"
Phone: +212612345678
```

**Expected**:
- ✅ `success: true`
- ✅ `needsValidation: true`
- ✅ `validationQuestion` in Darija
- ✅ Check database: Idea in `marrai_conversation_ideas`, status = `speaker_contacted`

### What to Check

1. **Database**: 
   ```sql
   SELECT * FROM marrai_conversation_ideas ORDER BY created_at DESC LIMIT 1;
   ```

2. **Auto-Promoted Ideas**:
   ```sql
   SELECT ci.*, i.id as idea_id 
   FROM marrai_conversation_ideas ci
   LEFT JOIN marrai_ideas i ON ci.promoted_to_idea_id = i.id
   WHERE ci.status = 'promoted_to_idea';
   ```

---

## 🤖 Agent 2A/2B: Feasibility & ROI Analysis

**URL**: `/test-agents` (select Agent 2A)

### Prerequisites
- Idea must exist (from Agent 1 or seed data)
- Get idea ID from database or Agent 1 response

### Test Steps

1. **Get an Idea ID**:
   ```sql
   SELECT id, title FROM marrai_ideas ORDER BY created_at DESC LIMIT 1;
   ```

2. **Test in UI**:
   - Select "Agent 2A: Feasibility Scorer"
   - Enter Idea ID
   - Click "Test Agent"

### Expected Results

```json
{
  "success": true,
  "ideaId": "uuid-here",
  "analysis": {
    "feasibility_score": 7.5,
    "impact_score": 8.2,
    "roi_time_saved_hours": 10,
    "roi_cost_saved_eur": 500,
    "qualification_tier": "qualified"
  }
}
```

### What to Check

1. **Database**:
   ```sql
   SELECT 
     id, 
     title,
     ai_feasibility_score,
     ai_impact_score,
     roi_time_saved_hours,
     roi_cost_saved_eur,
     qualification_tier
   FROM marrai_ideas 
   WHERE id = 'your-idea-id';
   ```

2. **AI Analysis JSONB**:
   ```sql
   SELECT ai_analysis FROM marrai_ideas WHERE id = 'your-idea-id';
   ```

---

## 🤖 Agent 5: Mentor Matcher

**URL**: `/test-agents` (select Agent 5)

### Prerequisites
- Idea must be analyzed (Agent 2A/2B completed)
- Idea should have category, problem_statement, proposed_solution

### Test Steps

1. **Use analyzed idea ID** (from Agent 2A/2B)
2. **Test in UI**:
   - Select "Agent 5: Mentor Matcher"
   - Enter Idea ID
   - Click "Test Agent"

### Expected Results

```json
{
  "success": true,
  "matches": [
    {
      "mentor_id": "uuid",
      "match_score": 0.85,
      "status": "pending"
    }
  ]
}
```

### What to Check

1. **Database**:
   ```sql
   SELECT * FROM marrai_mentor_matches 
   WHERE idea_id = 'your-idea-id';
   ```

2. **Idea Status**:
   ```sql
   SELECT status, matching_score, matched_at 
   FROM marrai_ideas 
   WHERE id = 'your-idea-id';
   ```

---

## 🤖 Agent 7: Feature Flag Agent

**URL**: `/test-agents` (select Agent 7)

### Prerequisites
- Idea must be matched (Agent 5 completed)
- Idea should have: qualification_tier, ai_impact_score, matching_score, alignment

### Test Steps

1. **Use matched idea ID** (from Agent 5)
2. **Test in UI**:
   - Select "Agent 7: Feature Flag Agent"
   - Enter Idea ID
   - Select Action: "process" or "analyze"
   - Click "Test Agent"

### Expected Results

**Action: "process"**:
```json
{
  "success": true,
  "ideaId": "uuid-here",
  "updates": {
    "featured": true,
    "priority": "critical"
  },
  "reason": "Exceptional idea: tier=exceptional, impact=8.5..."
}
```

**Action: "analyze"** (preview):
```json
{
  "success": true,
  "analysis": {
    "shouldFeature": true,
    "priority": "critical"
  },
  "current": {
    "featured": null,
    "priority": null
  }
}
```

### What to Check

1. **Database**:
   ```sql
   SELECT 
     id,
     featured,
     priority,
     visible,
     qualification_tier
   FROM marrai_ideas 
   WHERE id = 'your-idea-id';
   ```

2. **Review Queue**:
   ```sql
   SELECT * FROM marrai_ideas 
   WHERE status='matched' AND featured IS NULL 
   ORDER BY ai_impact_score DESC;
   ```

---

## 🤖 Agent 6: Notification Agent

**URL**: `/test-agents` (select Agent 6)

### Prerequisites
- Idea must be visible or featured (Agent 7 or admin set)
- Idea should have mentor matches (Agent 5)

### Test Steps

1. **Ensure idea is visible/featured**:
   ```sql
   UPDATE marrai_ideas 
   SET visible = true 
   WHERE id = 'your-idea-id';
   ```

2. **Test in UI**:
   - Select "Agent 6: Notification Agent"
   - Enter Idea ID
   - Select Action: "notify" or "generate_share_text"
   - Click "Test Agent"

### Expected Results

**Action: "notify"**:
```json
{
  "success": true,
  "mentorsNotified": 3,
  "errors": [],
  "socialShareText": {
    "twitter": "...",
    "whatsappStatus": "..."
  }
}
```

**Action: "generate_share_text"**:
```json
{
  "success": true,
  "socialShareText": {
    "twitter": "...",
    "whatsappStatus": "..."
  }
}
```

### What to Check

1. **Mentor Matches Status**:
   ```sql
   SELECT * FROM marrai_mentor_matches 
   WHERE idea_id = 'your-idea-id' AND status = 'active';
   ```

2. **Mentor Stats**:
   ```sql
   SELECT ideas_matched, ideas_funded 
   FROM marrai_mentors 
   WHERE id IN (
     SELECT mentor_id FROM marrai_mentor_matches 
     WHERE idea_id = 'your-idea-id'
   );
   ```

---

## 🔄 Complete End-to-End Test

### Step-by-Step Workflow

1. **Start with Agent 1**:
   ```
   Input: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"
   Result: Get conversationIdeaId and ideaId
   ```

2. **Continue with Agent 2A/2B**:
   ```
   Input: ideaId from step 1
   Result: Get ai_feasibility_score, ai_impact_score
   ```

3. **Run Agent 5**:
   ```
   Input: ideaId from step 1
   Result: Get mentor matches
   ```

4. **Run Agent 7**:
   ```
   Input: ideaId from step 1
   Action: "process"
   Result: Get featured, priority flags
   ```

5. **Run Agent 6**:
   ```
   Input: ideaId from step 1
   Action: "notify"
   Result: Get notification results
   ```

### Quick Test Script

```sql
-- Get a complete idea workflow
SELECT 
  i.id,
  i.title,
  i.status,
  i.featured,
  i.priority,
  i.visible,
  i.ai_feasibility_score,
  i.ai_impact_score,
  i.qualification_tier,
  (SELECT COUNT(*) FROM marrai_mentor_matches WHERE idea_id = i.id) as mentor_matches,
  (SELECT COUNT(*) FROM marrai_mentor_matches WHERE idea_id = i.id AND status = 'active') as active_matches
FROM marrai_ideas i
ORDER BY i.created_at DESC
LIMIT 5;
```

---

## 🎯 Testing Checklist

### Agent 1
- [ ] High confidence idea auto-promotes
- [ ] Low confidence idea needs validation
- [ ] Multiple languages work (Darija/French/English/Tamazight)
- [ ] Database records created correctly

### Agent 2A/2B
- [ ] Feasibility score calculated (1-10)
- [ ] Impact score calculated (1-10)
- [ ] ROI calculated (time & cost)
- [ ] Qualification tier assigned

### Agent 5
- [ ] Mentors matched (top 3)
- [ ] Match scores calculated (0-1)
- [ ] Status set to 'pending'
- [ ] Idea status updated to 'matched'

### Agent 7
- [ ] Featured flag set when conditions met
- [ ] Priority assigned correctly
- [ ] Visible remains false (privacy)
- [ ] Review queue query works

### Agent 6
- [ ] Mentors notified (WhatsApp)
- [ ] Match status updated to 'active'
- [ ] Social share text generated
- [ ] Rate limiting works (1 per day)

---

## 🐛 Troubleshooting

### Agent 1 Not Extracting
- Check: ANTHROPIC_API_KEY is set
- Check: SUPABASE_SERVICE_ROLE_KEY is set
- Use Debug button to see Claude response

### Agent 2A/2B Failing
- Check: Idea exists in database
- Check: Idea has problem_statement and proposed_solution
- Check: ANTHROPIC_API_KEY is set

### Agent 5 No Matches
- Check: Mentors exist in marrai_mentors table
- Check: Idea has category and ai_capabilities_needed
- Check: Idea status is 'analyzed' or 'matched'

### Agent 7 Not Flagging
- Check: Idea status is 'matched'
- Check: Idea has qualification_tier, ai_impact_score, matching_score
- Check: alignment.moroccoPriorities exists

### Agent 6 Not Notifying
- Check: Idea visible=true OR featured=true
- Check: Mentor matches exist with status='pending'
- Check: Mentors have phone numbers
- Check: Rate limiting (1 per day per mentor)

---

## 📚 Additional Resources

- **Agent 1 UI**: `http://localhost:3000/test-agent-1`
- **Unified Dashboard**: `http://localhost:3000/test-agents`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **API Documentation**: See individual agent implementation docs

---

**Happy Testing! 🚀**

