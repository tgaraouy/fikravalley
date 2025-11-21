# 🚀 DEPLOYMENT CHECKLIST - ALL 7 AI AGENTS

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Code Quality**
- ✅ All TypeScript errors fixed
- ✅ Build passes successfully
- ✅ No linter errors
- ✅ All tests passing
- ✅ Git committed and pushed

### **2. Environment Variables Required**

Add these to **Vercel Dashboard → Project → Settings → Environment Variables:**

```bash
# Anthropic AI (Required for all agents)
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin (Optional but recommended)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password

# WhatsApp (Optional - if using WhatsApp integration)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### **3. Database Tables**

Ensure these tables exist in Supabase:

```sql
✅ marrai_ideas                    (Main ideas table)
✅ marrai_transcripts              (Workshop transcripts)
✅ marrai_conversation_ideas       (Extracted ideas)
✅ marrai_workshop_sessions        (Workshop tracking)
✅ marrai_agent_solutions          (AI agent analysis)
✅ marrai_diaspora_profiles        (Diaspora matching)
✅ marrai_coach_journeys           (Journey tracking - COACH agent)
✅ mentors                         (Mentor matching - MENTOR agent)
✅ marrai_receipts                 (Receipt validation - PROOF agent)
```

### **4. Agent-Specific Setup**

#### **FIKRA Agent** ✅
- No additional setup needed
- Uses ANTHROPIC_API_KEY

#### **SCORE Agent** ✅
- No additional setup needed
- Pure calculation logic

#### **PROOF Agent** ✅
- Requires `marrai_receipts` table
- Uses ANTHROPIC_API_KEY for OCR

#### **MENTOR Agent** ⚠️
- Requires `mentors` table to be populated
- Will return empty results until mentors added

#### **DOC Agent** ✅
- No additional setup needed
- Uses @react-pdf/renderer (included)

#### **NETWORK Agent** ⚠️
- Requires `marrai_ideas` table with data
- Will work better with more ideas in database

#### **COACH Agent** ⚠️
- Requires `marrai_coach_journeys` table
- Auto-creates journey entries

---

## 🚀 DEPLOYMENT STEPS

### **Option 1: Deploy via Vercel CLI (Recommended)**

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### **Option 2: Deploy via GitHub Integration**

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository: `tgaraouy/fikravalley`

2. **Configure Build:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all variables from section 2 above
   - Apply to: **Production, Preview, Development**

4. **Deploy:**
   - Click "Deploy"
   - Wait ~2-3 minutes
   - ✅ Done!

### **Option 3: Deploy from Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Select `tgaraouy/fikravalley`
4. Add environment variables
5. Click Deploy

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### **1. Check Build Logs**
```bash
# Should see:
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages (86/86)
✓ Finalizing page optimization
```

### **2. Test Agent Endpoints**
```bash
# Test all 7 agent health checks
curl https://your-app.vercel.app/api/agents/fikra
curl https://your-app.vercel.app/api/agents/score
curl https://your-app.vercel.app/api/agents/proof
curl https://your-app.vercel.app/api/agents/mentor
curl https://your-app.vercel.app/api/agents/doc
curl https://your-app.vercel.app/api/agents/network
curl https://your-app.vercel.app/api/agents/coach

# Each should return:
{"success":true,"agent":"FIKRA","status":"operational",...}
```

### **3. Test Submit Form**
1. Go to `https://your-app.vercel.app/submit`
2. Type a problem (20+ characters)
3. **Verify FIKRA activates** (blue pulsing card)
4. **Verify SCORE activates** (blue pulsing card)
5. Add more details
6. **Verify agents complete** (green cards with scores)

### **4. Check Browser Console**
- Open DevTools → Console
- Should see: `"FIKRA agent updated:"`, `"SCORE agent updated:"`, etc.
- No red errors

### **5. Performance Check**
- FIKRA response: 2-3 seconds ✅
- SCORE response: 2-4 seconds ✅
- Total page load: < 3 seconds ✅

---

## ⚠️ TROUBLESHOOTING

### **Issue: "Module not found" errors**
**Solution:**
```bash
# Ensure all dependencies installed
npm install
npm run build
```

### **Issue: "ANTHROPIC_API_KEY is not defined"**
**Solution:**
- Go to Vercel Dashboard
- Settings → Environment Variables
- Add `ANTHROPIC_API_KEY=sk-ant-...`
- Redeploy

### **Issue: Agents not activating**
**Solution:**
- Check browser console for errors
- Verify API routes accessible: `/api/agents/*`
- Check Vercel logs for server errors

### **Issue: "Table doesn't exist" in Supabase**
**Solution:**
- Go to Supabase Dashboard
- SQL Editor
- Run migration scripts to create missing tables

### **Issue: Build fails on Vercel**
**Solution:**
```bash
# Test build locally first
npm run build

# If local build passes but Vercel fails:
# - Check Node.js version (should be 18+)
# - Clear Vercel build cache
# - Redeploy
```

---

## 📊 MONITORING

### **After Deployment:**

1. **Monitor Vercel Analytics:**
   - Go to Vercel Dashboard → Analytics
   - Watch real-time traffic
   - Monitor agent API calls

2. **Check Error Logs:**
   - Vercel Dashboard → Logs
   - Filter by "Error"
   - Watch for agent failures

3. **Monitor Supabase:**
   - Supabase Dashboard → Database
   - Check table growth
   - Monitor query performance

4. **Track Agent Usage:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT COUNT(*) FROM marrai_ideas WHERE created_at > NOW() - INTERVAL '1 day';
   SELECT COUNT(*) FROM marrai_coach_journeys;
   SELECT COUNT(*) FROM marrai_receipts;
   ```

---

## 🎯 SUCCESS CRITERIA

### **Deployment Successful When:**

- ✅ All 7 agent routes return `{"success":true}`
- ✅ Submit form loads and agents activate
- ✅ No console errors
- ✅ Ideas can be submitted successfully
- ✅ Real-time scoring works
- ✅ Receipt upload works
- ✅ No 500 errors in Vercel logs

### **Ready for Users When:**

- ✅ All above criteria met
- ✅ Database seeded with 20-30 quality ideas
- ✅ Mentors table populated (at least 10 mentors)
- ✅ Performance < 3s page load
- ✅ Mobile responsive (test on phone)

---

## 🚀 LAUNCH COMMANDS

### **Quick Deploy:**
```bash
# From project root
vercel --prod
```

### **Deploy with Build Logs:**
```bash
vercel --prod --debug
```

### **Deploy Specific Branch:**
```bash
git checkout main
git pull origin main
vercel --prod
```

---

## 📞 SUPPORT

### **If Deployment Fails:**

1. **Check build locally first:**
   ```bash
   npm run build
   npm run start
   # Test at http://localhost:3000
   ```

2. **Review Vercel logs:**
   - Dashboard → Deployments → [Latest] → View Logs

3. **Test agents locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/submit
   # Open DevTools → Console
   ```

4. **Verify environment variables:**
   ```bash
   vercel env ls
   ```

---

## 🎉 POST-LAUNCH

### **After Successful Deployment:**

1. **Announce to users** ✅
2. **Monitor for 24 hours** ✅
3. **Collect feedback** ✅
4. **Fine-tune agent prompts** ✅
5. **Scale as needed** ✅

---

**Ready to deploy? Run:** `vercel --prod` 🚀

**Current Status:**
- ✅ All 7 agents operational
- ✅ Build passing
- ✅ Git committed & pushed
- ✅ Ready for production!

**Estimated Deploy Time:** 2-3 minutes
**Confidence Level:** 🟢 HIGH (all systems go!)

