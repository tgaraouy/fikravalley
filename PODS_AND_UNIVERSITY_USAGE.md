# 📚 Pods & University Pages - Usage Guide

## Overview

The **Pods** and **University** pages are part of a phased workflow system designed to help Moroccan entrepreneurs validate and develop their ideas through structured collaboration and education.

---

## 👥 **PODS PAGE** (`/pods-simple`)

### **Purpose:**
**Journey Pods** are small groups (2-5 members) from the same city who work together to validate and build ideas. They provide accountability, peer support, and structured sprints.

### **When to Use:**
- ✅ **After completing Step 1 solo** (must have >50% success rate)
- ✅ **When you want peer accountability** for idea validation
- ✅ **When you need structured sprints** with shared goals
- ✅ **When you want to work with people in your city** (geographic proximity)

### **How It Works:**

#### **1. Create a Pod (Voice-Native):**
```
1. Visit /pods-simple
2. Click giant mic button
3. Say pod name (e.g., "Darija Physics Pod")
4. Pod auto-created with your city
5. Get share link (like WhatsApp groups)
6. Share link with friends → They join
```

#### **2. Pod Features:**
- **Shared "Done" Definition:** Pod signs MVP Canvas together
  - Example: "We agree 'first user' means someone outside our network who uses it twice"
- **Pre-mortem Week 0:** Log risks before starting
  - "What will make us fail?"
  - Identifies blockers early
- **Sprint Tracking:** Tracks completion rate
  - Must maintain >50% completion to unlock next phase
  - Must maintain >3.5/5 task ease score

#### **3. Pod Workflow:**
```
Week 0: Pre-mortem → Sign "Done" Definition
Week 1-4: Sprint 1 → Track completion
Week 5-8: Sprint 2 → Track completion
...
When >50% completion → University unlocks
```

### **Eligibility Gate:**
```typescript
// Must complete Step 1 solo first
function canJoinPod(step1CompletionRate: number): boolean {
  return step1CompletionRate >= 0.5; // 50% success rate
}
```

### **Why Geographic Proximity?**
- **In-person interviews:** Critical for validation in Morocco
- **Trust:** Face-to-face builds trust (low digital literacy)
- **Local context:** Same city = same market understanding

### **Files:**
- `app/pods-simple/page.tsx` - Main page
- `components/workflow/SimplePods.tsx` - Voice-native UI
- `app/api/pods/route.ts` - Create/list pods
- `app/api/pods/[id]/join/route.ts` - Join pod
- `lib/workflow/journey-pods.ts` - Core logic

---

## 🎓 **UNIVERSITY PAGE** (`/university-simple`)

### **Purpose:**
**University Modules** are educational content delivered via WhatsApp (99% open rate vs. 20% email). They teach entrepreneurship concepts in Darija/French with subtitles.

### **When to Use:**
- ✅ **After pods show >50% completion rate**
- ✅ **When you want to learn entrepreneurship concepts**
- ✅ **When you prefer WhatsApp delivery** (no email, no forms)
- ✅ **When you want Darija/French content** with subtitles

### **How It Works:**

#### **1. Browse Modules:**
```
1. Visit /university-simple
2. See 4 modules:
   - MVP فالمدار (How to build MVP)
   - Validation de Problème (Problem validation)
   - Collecte de Preuves (Evidence collection)
   - Préparation Intilaka (Intilaka prep)
```

#### **2. Share via WhatsApp:**
```
1. Click "📤 شارك فالواتساب" button
2. WhatsApp opens with pre-filled message
3. Forward to friends (like normal WhatsApp message)
4. Track engagement via link clicks
5. No forms, no email, no subscription
```

#### **3. Module Format:**
- **Language:** Darija primary, French secondary
- **Subtitles:** All content subtitled (accessibility)
- **Delivery:** WhatsApp-first (99% open rate)
- **Content:** 60-second video scripts with visuals

### **Eligibility Gate:**
```typescript
// Only unlock when pods show >50% completion
function isPodReadyForScaling(pod: Pod): boolean {
  return pod.sprintCompletionRate > 0.5 && pod.taskEaseScore > 3.5;
}
```

### **Why WhatsApp-First?**
- **99% open rate** vs. 20% email
- **Moroccan digital reality:** Everyone uses WhatsApp
- **Zero friction:** No forms, no typing, just forward
- **Trust:** WhatsApp = trusted channel

### **Available Modules:**
1. **MVP فالمدار** - How to build MVP
2. **Validation de Problème** - How to validate problem
3. **Collecte de Preuves** - How to collect evidence
4. **Préparation Intilaka** - How to prepare for Intilaka

### **Files:**
- `app/university-simple/page.tsx` - Main page
- `app/api/whatsapp/send-module/route.ts` - Send module API
- `app/api/university/track/route.ts` - Track engagement

---

## 🔄 **PHASED WORKFLOW SEQUENCE**

### **Phase 1: Solo (Think-Time UX)**
```
User submits idea → Think-Time tracking → Micro-validation
Must achieve: >50% Step 1 completion
```

### **Phase 2: Pods (Month 2)**
```
✅ Step 1 >50% → Pods unlock
User creates/joins pod → Shared "Done" Definition → Pre-mortem → Sprints
Must achieve: >50% sprint completion + >3.5/5 task ease
```

### **Phase 3: University (Month 3)**
```
✅ Pods >50% completion → University unlocks
User accesses modules → Shares via WhatsApp → Tracks engagement
```

### **Phase 4: Power User (Month 4+)**
```
✅ 2 pods completed + >60% completion + >3.5/5 ease → Customization unlocks
User customizes workflow → Template system
```

---

## 📊 **KEY METRICS**

### **Pods Metrics:**
- Pod formation rate
- Sprint completion rate (must be >50%)
- Task ease score (must be >3.5/5)
- Geographic distribution
- Pre-mortem accuracy

### **University Metrics:**
- Module share rate
- WhatsApp open rate (target: 99%)
- Link click rate
- Engagement per module

---

## 🎯 **WHEN TO USE EACH PAGE**

### **Use Pods When:**
- ✅ You've completed Step 1 solo (>50%)
- ✅ You want peer accountability
- ✅ You need structured sprints
- ✅ You want to work with people in your city

### **Use University When:**
- ✅ Your pod shows >50% completion
- ✅ You want to learn entrepreneurship concepts
- ✅ You prefer WhatsApp delivery
- ✅ You want Darija/French content

---

## 💡 **DESIGN PHILOSOPHY**

### **Pods:**
- **Voice-native:** No forms, just speak
- **Geographic proximity:** Same city = in-person validation
- **Shared constraints:** MVP Canvas = enforced discipline
- **Pre-mortem:** Identify blockers early

### **University:**
- **WhatsApp-first:** 99% open rate
- **Zero friction:** No forms, just forward
- **Darija/French:** Culturally relevant
- **Subtitled:** Accessible to all

---

## 🚀 **CURRENT STATUS**

### **Pods:**
- ✅ **Operational** - Voice-native pod creation
- ✅ **API endpoints** - Create, join, list pods
- ✅ **Database** - `marrai_pods` table
- ✅ **UI** - Simple, WhatsApp-native interface

### **University:**
- ✅ **Operational** - WhatsApp-forwarding modules
- ✅ **4 modules** - MVP, Validation, Evidence, Intilaka
- ✅ **Tracking** - Link click tracking
- ✅ **Zero friction** - No forms, just share

---

## 📝 **EXAMPLE USER JOURNEY**

### **Solo → Pods → University:**

```
Week 1-2: User submits idea → Completes Step 1 solo (60% success)
Week 3: Pods unlock → User creates "Darija Physics Pod"
Week 4: Pod signs "Done" Definition → Logs pre-mortem
Week 5-8: Pod Sprint 1 → 55% completion ✅
Week 9: University unlocks → User shares MVP module via WhatsApp
Week 10+: Pod Sprint 2 → 60% completion → Power User unlocks
```

---

## 🔗 **RELATED FILES**

- `COMPLETE_SYSTEM_SUMMARY.md` - Full system overview
- `PHASED_WORKFLOW_IMPLEMENTATION.md` - Implementation details
- `lib/workflow/journey-pods.ts` - Pod system core
- `lib/workflow/phased-workflow.ts` - Phase sequencing

---

## ❓ **FAQ**

**Q: Can I join a pod without completing Step 1?**
A: No. You must complete Step 1 solo with >50% success rate first.

**Q: Can I access university modules without pods?**
A: No. Pods must show >50% completion rate first.

**Q: Why same city for pods?**
A: In-person validation is critical in Morocco. Same city = same market understanding.

**Q: Why WhatsApp for university?**
A: 99% open rate vs. 20% email. Zero friction, trusted channel.

**Q: Can I customize my workflow?**
A: Only after completing 2 pods with >60% completion and >3.5/5 task ease.

---

**Bottom Line:** Pods = peer accountability. University = education via WhatsApp. Both unlock only when previous phase shows >50% completion. This prevents premature scaling and ensures proven follow-through.

