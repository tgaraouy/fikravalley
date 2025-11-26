# 🎨 UI Pages Guide - All Available Pages

## 🚀 Quick Access

### Testing & Development Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Unified Agent Testing** | `http://localhost:3000/test-agents` | Test all 7 agents from one dashboard |
| **Agent 1 Testing** | `http://localhost:3000/test-agent-1` | Dedicated Agent 1 test page with debug |
| **Claude API Test** | `http://localhost:3000/test-claude` | Test Claude API directly |
| **Supabase Test** | `http://localhost:3000/test-supabase` | Test Supabase connection |
| **Realtime Test** | `http://localhost:3000/test-realtime` | Test Supabase realtime |

### Main Application Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | `http://localhost:3000/` | Landing page |
| **Submit Idea** | `http://localhost:3000/submit` | Submit new idea |
| **Submit Voice** | `http://localhost:3000/submit-voice` | Submit idea via voice |
| **Ideas Browse** | `http://localhost:3000/ideas` | Browse all ideas |
| **My Ideas** | `http://localhost:3000/my-fikras` | User's submitted ideas |
| **Dashboard** | `http://localhost:3000/dashboard` | User dashboard |

### Admin Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Admin Dashboard** | `http://localhost:3000/admin` | Main admin panel |
| **Admin Login** | `http://localhost:3000/admin/login` | Admin authentication |
| **Access Requests** | `http://localhost:3000/admin/access-requests` | Manage access requests |
| **Workshop Codes** | `http://localhost:3000/admin/workshop-codes` | Manage workshop codes |

### Special Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Agents Overview** | `http://localhost:3000/agents` | View all agents |
| **Workshop** | `http://localhost:3000/workshop` | Workshop interface |
| **Validate** | `http://localhost:3000/validate` | Validate ideas |
| **Find Mentor** | `http://localhost:3000/find-mentor` | Find mentors |
| **Become Mentor** | `http://localhost:3000/become-mentor` | Mentor registration |

---

## 📋 Detailed Page Descriptions

### 1. Unified Agent Testing Dashboard

**URL**: `http://localhost:3000/test-agents`

**Features**:
- ✅ Test all 7 agents from one interface
- ✅ Pre-loaded test cases
- ✅ Real-time results
- ✅ Complete workflow guide
- ✅ Input forms for each agent
- ✅ JSON result viewer

**How to Use**:
1. Start dev server: `npm run dev`
2. Navigate to `/test-agents`
3. Select agent from left sidebar
4. Fill in input fields
5. Click "Test Agent"
6. View results in right panel

**Screenshot Locations**:
- Agent selection on left
- Input form in center
- Results display on right
- Workflow guide at bottom

---

### 2. Agent 1 Testing Page

**URL**: `http://localhost:3000/test-agent-1`

**Features**:
- ✅ Dedicated Agent 1 interface
- ✅ Pre-loaded test cases (4 scenarios)
- ✅ Debug mode with detailed analysis
- ✅ Real-time extraction results
- ✅ Database verification links

**Test Cases Available**:
1. **High Confidence Darija** - Auto-promotes
2. **Low Confidence** - Needs validation
3. **French Input** - Language support
4. **Tamazight Input** - Latin script support

**Debug Mode**:
- Shows Claude's raw response
- Displays validation checks
- Shows extraction steps
- Helps diagnose issues

---

### 3. Admin Dashboard

**URL**: `http://localhost:3000/admin`

**Features**:
- ✅ Overview stats
- ✅ Idea management
- ✅ Follow-up dashboard
- ✅ Receipt verification
- ✅ User management
- ✅ Mentor matching
- ✅ Reports
- ✅ Settings
- ✅ Audit logs

**Tabs Available**:
- 📊 Overview
- 💡 Ideas
- 📞 Follow-up
- 🧾 Receipts
- 👥 Users
- 🤝 Mentors
- 📈 Reports
- ⚙️ Settings
- 📋 Audit

---

### 4. Agents Overview Page

**URL**: `http://localhost:3000/agents`

**Features**:
- ✅ View all 7 agents
- ✅ Agent status and capabilities
- ✅ Integration examples
- ✅ Documentation links

---

## 🔄 Complete Testing Workflow

### Step 1: Start Development Server

```bash
npm run dev
```

### Step 2: Open Testing Dashboard

```
http://localhost:3000/test-agents
```

### Step 3: Test Each Agent

#### Agent 1: Conversation Extractor
1. Select "Agent 1" from sidebar
2. Use test case: "High Confidence Darija"
3. Click "Test Agent"
4. Check for `ideaId` in results (auto-promoted)

#### Agent 2A/2B: Feasibility & ROI
1. Get `ideaId` from Agent 1 result
2. Select "Agent 2A"
3. Enter `ideaId`
4. Click "Test Agent"
5. Check scores and ROI

#### Agent 5: Mentor Matcher
1. Use `ideaId` from previous steps
2. Select "Agent 5"
3. Enter `ideaId`
4. Click "Test Agent"
5. Check mentor matches

#### Agent 7: Feature Flag
1. Use `ideaId` from previous steps
2. Select "Agent 7"
3. Enter `ideaId`
4. Select action: "process"
5. Click "Test Agent"
6. Check featured/priority flags

#### Agent 6: Notification
1. Ensure idea is visible/featured
2. Select "Agent 6"
3. Enter `ideaId`
4. Select action: "notify"
5. Click "Test Agent"
6. Check notification results

---

## 🎯 Quick Testing Scenarios

### Scenario 1: Complete Workflow Test

1. **Agent 1**: Extract idea
   - Input: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس"
   - Result: Get `ideaId`

2. **Agent 2A/2B**: Analyze
   - Input: `ideaId` from step 1
   - Result: Get scores

3. **Agent 5**: Match mentors
   - Input: `ideaId` from step 1
   - Result: Get matches

4. **Agent 7**: Feature flag
   - Input: `ideaId` from step 1
   - Result: Get featured/priority

5. **Agent 6**: Notify
   - Input: `ideaId` from step 1
   - Result: Get notifications

### Scenario 2: Debug Agent 1

1. Go to `/test-agent-1`
2. Enter test input
3. Click "🔍 Debug" button
4. Review detailed extraction process
5. Check Claude response
6. Verify validation checks

### Scenario 3: Admin Review

1. Go to `/admin`
2. Navigate to "Ideas" tab
3. Review ideas needing attention
4. Use Agent 7 "get_review_queue" action
5. Review featured candidates
6. Approve/reject ideas

---

## 📱 Mobile Testing

All pages are responsive and work on mobile:
- Test on phone: `http://[your-ip]:3000/test-agents`
- Use browser DevTools mobile emulation
- Test touch interactions

---

## 🔍 Page Structure

### Unified Testing Dashboard (`/test-agents`)

```
┌─────────────────────────────────────────────────┐
│  🤖 Agent Testing Dashboard                    │
├──────────┬──────────────┬──────────────────────┤
│          │              │                      │
│  Agent   │   Input      │    Results           │
│  List    │   Form       │    Display           │
│          │              │                      │
│  [1]     │  [Fields]    │  [JSON Output]       │
│  [2A]    │  [Test]      │  [Success/Error]     │
│  [2B]    │  [Cases]     │                      │
│  [5]     │              │                      │
│  [6]     │              │                      │
│  [7]     │              │                      │
└──────────┴──────────────┴──────────────────────┘
│  📋 Complete Workflow Guide                    │
└─────────────────────────────────────────────────┘
```

### Agent 1 Page (`/test-agent-1`)

```
┌─────────────────────────────────────────────────┐
│  Agent 1: Conversation Extractor               │
├─────────────────────────────────────────────────┤
│  [Test Case Buttons]                           │
├─────────────────────────────────────────────────┤
│  Input Form:                                   │
│  - Speaker Quote                               │
│  - Phone/Email/Context                         │
│  [🚀 Test Agent 1] [🔍 Debug]                  │
├─────────────────────────────────────────────────┤
│  Results:                                      │
│  - Success/Error                               │
│  - conversationIdeaId                          │
│  - ideaId (if auto-promoted)                   │
│  - validationQuestion (if needed)              │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### Page Not Loading?

1. Check dev server is running: `npm run dev`
2. Check URL is correct
3. Check browser console for errors
4. Verify port 3000 is available

### API Errors?

1. Check environment variables:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`

2. Check network tab in DevTools
3. Check server logs in terminal

### No Results?

1. Verify API endpoints are accessible
2. Check database connection
3. Verify idea IDs exist
4. Check agent prerequisites

---

## 📚 Additional Resources

- **Complete Workflow**: `docs/UI_TESTING_WORKFLOW.md`
- **Agent 1 Guide**: `docs/AGENT1_UI_VALIDATION.md`
- **Agent Implementation**: `docs/AGENT_*_IMPLEMENTATION.md`

---

**Ready to test! Open `http://localhost:3000/test-agents` to get started! 🚀**

