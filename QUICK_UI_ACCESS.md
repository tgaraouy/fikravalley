# 🚀 Quick UI Access Guide

## ⚡ Fastest Way to Test Agents

### 1. Start Server
```bash
npm run dev
```

### 2. Open Testing Dashboard
```
http://localhost:3000/test-agents
```

**This is your main testing interface!** Test all 7 agents from one page.

---

## 📱 All Available Pages

### 🧪 **Testing Pages** (Start Here!)

| Page | URL | What It Does |
|------|-----|--------------|
| **🎯 Unified Dashboard** | `/test-agents` | **NEW!** Test all 7 agents in one place |
| **Agent 1 Only** | `/test-agent-1` | Dedicated Agent 1 page with debug mode |
| **Claude Test** | `/test-claude` | Test Claude API directly |
| **Supabase Test** | `/test-supabase` | Test database connection |
| **Realtime Test** | `/test-realtime` | Test Supabase realtime |

### 🏠 **Main Application**

| Page | URL | What It Does |
|------|-----|--------------|
| **Home** | `/` | Landing page |
| **Submit Idea** | `/submit` | Submit new idea (web form) |
| **Submit Voice** | `/submit-voice` | Submit idea via voice recording |
| **Browse Ideas** | `/ideas` | View all public ideas |
| **My Ideas** | `/my-fikras` | Your submitted ideas |
| **Dashboard** | `/dashboard` | User dashboard |

### 👨‍💼 **Admin Pages**

| Page | URL | What It Does |
|------|-----|--------------|
| **Admin Dashboard** | `/admin` | Full admin panel (requires login) |
| **Admin Login** | `/admin/login` | Admin authentication |
| **Access Requests** | `/admin/access-requests` | Manage user access |
| **Workshop Codes** | `/admin/workshop-codes` | Manage workshop codes |

### 🤖 **Agent Tools**

| Page | URL | What It Does |
|------|-----|--------------|
| **Agents Overview** | `/agents` | View all agent tools |
| **Workshop** | `/workshop` | Workshop interface |
| **Validate** | `/validate` | Validate ideas |

---

## 🎯 Recommended Testing Workflow

### Option 1: Unified Dashboard (Easiest)

1. **Open**: `http://localhost:3000/test-agents`
2. **Select Agent** from left sidebar
3. **Fill inputs** or use test cases
4. **Click "Test Agent"**
5. **View results** in right panel

### Option 2: Agent 1 Dedicated Page

1. **Open**: `http://localhost:3000/test-agent-1`
2. **Click test case** button (e.g., "High Confidence Darija")
3. **Click "Test Agent 1"** or **"Debug"**
4. **View detailed results**

### Option 3: Admin Dashboard

1. **Login**: `http://localhost:3000/admin/login`
2. **Navigate** to "Ideas" tab
3. **Review** ideas and trigger agents
4. **Use** Agent 7 review queue

---

## 📋 Complete Workflow Example

### End-to-End Test (5 minutes)

1. **Agent 1** (`/test-agents` → Select Agent 1):
   ```
   Input: "فكرة فبالي نخدم تطبيق للتوصيل فالمدارس بالرباط"
   Result: Get ideaId (e.g., "abc-123")
   ```

2. **Agent 2A/2B** (`/test-agents` → Select Agent 2A):
   ```
   Input: ideaId = "abc-123"
   Result: Get scores (feasibility, impact, ROI)
   ```

3. **Agent 5** (`/test-agents` → Select Agent 5):
   ```
   Input: ideaId = "abc-123"
   Result: Get mentor matches
   ```

4. **Agent 7** (`/test-agents` → Select Agent 7):
   ```
   Input: ideaId = "abc-123"
   Action: "process"
   Result: Get featured/priority flags
   ```

5. **Agent 6** (`/test-agents` → Select Agent 6):
   ```
   Input: ideaId = "abc-123"
   Action: "notify"
   Result: Get notification results
   ```

---

## 🎨 UI Screenshots Guide

### Unified Testing Dashboard (`/test-agents`)

```
┌─────────────────────────────────────────────────────────┐
│  🤖 Agent Testing Dashboard                            │
├──────────────┬──────────────┬──────────────────────────┤
│              │              │                          │
│  AGENT LIST  │  INPUT FORM │    RESULTS PANEL         │
│              │              │                          │
│  [Agent 1]   │  [Fields]    │  ✅ Success              │
│  [Agent 2A]  │  [Test]      │  {                       │
│  [Agent 2B]  │  [Cases]     │    "success": true,      │
│  [Agent 5]   │              │    "ideaId": "..."       │
│  [Agent 6]   │              │  }                       │
│  [Agent 7]   │              │                          │
│              │              │                          │
└──────────────┴──────────────┴──────────────────────────┘
│  📋 Complete Workflow Guide                            │
└─────────────────────────────────────────────────────────┘
```

### Agent 1 Page (`/test-agent-1`)

```
┌─────────────────────────────────────────────────────────┐
│  🧪 Agent 1: Conversation Extractor                    │
├─────────────────────────────────────────────────────────┤
│  [High Confidence] [Low Confidence] [French] [Tamazight]│
├─────────────────────────────────────────────────────────┤
│  Input Form:                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Speaker Quote: [textarea]                      │   │
│  │ Phone: [input]  Email: [input]                │   │
│  │ Context: [input]                               │   │
│  │ [🚀 Test Agent 1] [🔍 Debug]                   │   │
│  └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  Results:                                               │
│  ✅ Success: Yes                                        │
│  Conversation Idea ID: abc-123                          │
│  Auto-Promoted Idea ID: xyz-789 ✅                      │
│  [View Full Response (JSON)]                            │
└─────────────────────────────────────────────────────────┘
```

### Admin Dashboard (`/admin`)

```
┌─────────────────────────────────────────────────────────┐
│  Admin Dashboard                                        │
├─────────────────────────────────────────────────────────┤
│  [📊 Overview] [💡 Ideas] [📞 Follow-up] [🧾 Receipts]│
│  [👥 Users] [🤝 Mentors] [📈 Reports] [⚙️ Settings]     │
├─────────────────────────────────────────────────────────┤
│  [Selected Tab Content]                                 │
│                                                         │
│  Ideas Management / Stats / Actions                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Features by Page

### `/test-agents` (Unified Dashboard)
- ✅ Test all 7 agents
- ✅ Pre-loaded test cases
- ✅ Real-time results
- ✅ Workflow guide
- ✅ JSON viewer

### `/test-agent-1` (Agent 1 Only)
- ✅ 4 pre-loaded test cases
- ✅ Debug mode (detailed analysis)
- ✅ Visual result display
- ✅ Database verification

### `/admin` (Admin Dashboard)
- ✅ 9 tabs (Overview, Ideas, Follow-up, etc.)
- ✅ Idea management
- ✅ Mentor matching
- ✅ Reports and analytics
- ✅ Settings

---

## 🚀 Quick Start Commands

```bash
# Start server
npm run dev

# Then open in browser:
# http://localhost:3000/test-agents
```

---

## 📚 Full Documentation

- **Complete Guide**: `docs/UI_PAGES_GUIDE.md`
- **Workflow**: `docs/UI_TESTING_WORKFLOW.md`
- **Agent 1**: `docs/AGENT1_UI_VALIDATION.md`

---

**Ready to test! Open `http://localhost:3000/test-agents` now! 🎉**

