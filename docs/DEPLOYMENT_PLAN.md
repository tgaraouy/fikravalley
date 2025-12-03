# 🚀 FIKRA VALLEY - COMPLETE DEPLOYMENT PLAN

**Last Updated:** December 2025

---

## 📋 TABLE OF CONTENTS

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Database Migrations](#database-migrations)
4. [Founder's Note Feature](#founders-note-feature)
5. [Build & Deploy](#build--deploy)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### **1. Code Quality**
- [ ] All TypeScript errors fixed (`npm run lint`)
- [ ] Build passes successfully (`npm run build`)
- [ ] No console errors in browser
- [ ] All tests passing (if applicable)
- [ ] Git committed and pushed to repository

### **2. Feature Completeness**
- [ ] Voice submission working
- [ ] AI agents responding correctly
- [ ] Idea submission flow complete
- [ ] Mentor registration working
- [ ] LinkedIn OAuth configured
- [ ] Mobile money payment links working
- [ ] PWA features tested
- [ ] All pages accessible

### **3. Content & Assets**
- [ ] Logo files in `/public/png/`
- [ ] Founder photo ready (for Founder's Note)
- [ ] All images optimized
- [ ] Favicon and manifest configured
- [ ] Meta tags updated

### **4. Security**
- [ ] Environment variables secured
- [ ] API keys rotated (if needed)
- [ ] RLS policies tested in Supabase
- [ ] Admin credentials secure
- [ ] CORS configured correctly

---

## 🔐 ENVIRONMENT VARIABLES SETUP

### **Required for Vercel Dashboard**

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables for **Production, Preview, and Development**:

```bash
# ============================================
# SUPABASE (Required)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# AI PROVIDERS (Required)
# ============================================
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...

# ============================================
# ADMIN (Optional but Recommended)
# ============================================
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your_secure_password

# ============================================
# LINKEDIN OAUTH (For Mentor Registration)
# ============================================
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_REDIRECT_URI=https://fikravalley.com/api/auth/linkedin/callback

# ============================================
# SITE CONFIGURATION
# ============================================
NEXT_PUBLIC_SITE_URL=https://fikravalley.com
NODE_ENV=production

# ============================================
# OPTIONAL INTEGRATIONS
# ============================================
# WhatsApp (if using)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### **Environment Variable Priority**

Vercel will use variables in this order:
1. **Production** (highest priority)
2. **Preview**
3. **Development**

**⚠️ Important:** Always set variables for all environments unless you want different values per environment.

---

## 🗄️ DATABASE MIGRATIONS

### **1. Run All Migrations**

In Supabase SQL Editor, run migrations in order:

```bash
# Check migration order
supabase/migrations/
├── 001_initial_schema.sql
├── 002_add_mentors_table.sql
├── 003_add_receipts_table.sql
├── 004_add_workshop_sessions.sql
├── 005_add_conversation_ideas.sql
├── 006_add_agent_solutions.sql
├── 007_add_reviews_table.sql
├── 008_add_idea_claims_and_trending.sql
├── 009_add_moroccan_priorities_and_metadata.sql
├── 010_add_validation_payments.sql
├── 011_add_ai_market_analysis.sql
├── 012_create_proofs_table.sql
├── 013_add_vector_embeddings.sql
├── 014_add_preseed_evaluations.sql
└── 015_add_missing_idea_fields.sql
```

### **2. Verify Database Schema**

Run this SQL to verify all tables exist:

```sql
-- Check all required tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'marrai_%'
ORDER BY table_name;
```

### **3. Enable Extensions**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### **4. Set Up Row-Level Security (RLS)**

Verify RLS policies are enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'marrai_%';
```

---

## 👤 FOUNDER'S NOTE FEATURE

### **Step 1: Create Founder Page**

Create: `app/founder/page.tsx`

```typescript
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FounderPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Une Note du Fondateur
          </h1>
          <p className="text-xl text-slate-600">
            Rencontrez la personne derrière Fikra Valley
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          {/* Text Content */}
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-slate-700 leading-relaxed">
                Bonjour ! Je suis <strong>[Votre Nom]</strong>, fondateur de Fikra Valley. 
                J'ai créé cette plateforme parce que j'ai vu trop d'idées brillantes marocaines 
                échouer faute de validation. Je voulais créer un endroit où les entrepreneurs 
                peuvent tester leurs idées rapidement et construire un réseau de mentors et d'investisseurs.
              </p>
              
              <p className="text-lg text-slate-700 leading-relaxed">
                Ma mission est d'autonomiser chaque Marocain avec les outils nécessaires pour 
                transformer sa vision en réalité.
              </p>
              
              <p className="text-lg text-slate-700 leading-relaxed">
                En grandissant à <strong>[Votre Ville]</strong>, j'ai vécu de première main 
                les défis de démarrer une entreprise avec des ressources limitées. C'est pourquoi 
                nous avons construit Fikra Valley – pour vous donner la confiance que votre idée 
                vaut la peine d'être poursuivie.
              </p>
              
              <p className="text-lg text-slate-700 leading-relaxed">
                Notre analyse alimentée par l'IA vous donne un retour instantané, et notre réseau 
                vous connecte avec les bonnes personnes pour grandir.
              </p>
              
              <p className="text-lg text-slate-700 leading-relaxed font-semibold">
                Si vous êtes prêt à passer à l'étape suivante, j'aimerais avoir de vos nouvelles.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/submit-voice">
                <Button size="lg" className="w-full sm:w-auto">
                  💡 Soumettre votre idée
                </Button>
              </Link>
              <Link href="/become-mentor">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  🤝 Devenir Mentor
                </Button>
              </Link>
            </div>
          </div>

          {/* Photo */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/founder-photo.jpg" // Add your photo to /public/
                alt="Fondateur de Fikra Valley"
                width={600}
                height={600}
                className="object-cover"
                priority
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">Mission</h3>
            <p className="text-slate-600">
              Transformer chaque idée marocaine en entreprise validée et finançable
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">Vision</h3>
            <p className="text-slate-600">
              Un Maroc où chaque entrepreneur a accès aux outils de validation
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold mb-2">Valeurs</h3>
            <p className="text-slate-600">
              Transparence, confiance, et soutien communautaire
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4">Restons en Contact</h2>
          <p className="text-slate-700 mb-6">
            Des questions ? Des suggestions ? N'hésitez pas à me contacter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:founder@fikravalley.com">
              <Button variant="outline" size="lg">
                📧 Email
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg">
                💬 Contactez-nous
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### **Step 2: Add to Navigation**

Update `app/layout.tsx` to include Founder link:

```typescript
<nav>
  <Link href="/">Accueil</Link>
  <Link href="/ideas">Idées</Link>
  <Link href="/submit-voice">Soumettre</Link>
  <Link href="/founder">Fondateur</Link> {/* Add this */}
  <Link href="/become-mentor">Mentor</Link>
</nav>
```

### **Step 3: Add Founder Photo**

1. Add your photo to `/public/founder-photo.jpg`
2. Recommended size: 600x600px (square)
3. Format: JPG or PNG
4. Optimize for web (use tools like TinyPNG)

### **Step 4: Optional - Add Video**

If you want to add a short video:

```typescript
<div className="mt-8">
  <video
    controls
    className="w-full rounded-xl shadow-lg"
    poster="/founder-video-poster.jpg"
  >
    <source src="/founder-intro.mp4" type="video/mp4" />
    Votre navigateur ne supporte pas la vidéo.
  </video>
</div>
```

---

## 🚀 BUILD & DEPLOY

### **Option 1: Deploy via Vercel CLI (Recommended)**

```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Link to your project (if not already linked)
vercel link

# 4. Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

### **Option 2: Deploy via GitHub Integration**

1. **Connect Repository:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build:**
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
   - Root Directory: `.` (or leave empty)

3. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add all variables from [Environment Variables Setup](#environment-variables-setup)
   - Apply to: **Production, Preview, Development**

4. **Deploy:**
   - Click "Deploy"
   - Wait ~2-3 minutes
   - ✅ Done!

### **Option 3: Deploy from Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Select your repository
4. Add environment variables
5. Click Deploy

### **Build Verification**

Before deploying, test build locally:

```bash
# Test production build
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### **1. Check Build Logs**

In Vercel Dashboard → Deployments → Latest Deployment:

- ✅ Build completed successfully
- ✅ No TypeScript errors
- ✅ All pages generated
- ✅ No environment variable warnings

### **2. Test Critical Pages**

```bash
# Homepage
https://fikravalley.com

# Idea submission
https://fikravalley.com/submit-voice

# Ideas listing
https://fikravalley.com/ideas

# Founder page (new)
https://fikravalley.com/founder

# Mentor registration
https://fikravalley.com/become-mentor
```

### **3. Test API Endpoints**

```bash
# Health check
curl https://fikravalley.com/api/health

# Ideas search
curl https://fikravalley.com/api/ideas/search

# Agent endpoints
curl https://fikravalley.com/api/agents/conversation-extractor
```

### **4. Test Features**

- [ ] Voice submission works
- [ ] AI extraction works
- [ ] Idea submission completes
- [ ] Tracking code generated
- [ ] LinkedIn OAuth works (mentors)
- [ ] Mobile money links generate
- [ ] PWA install prompt appears
- [ ] Founder page displays correctly
- [ ] All images load
- [ ] Forms submit successfully

### **5. Performance Check**

Use [PageSpeed Insights](https://pagespeed.web.dev/):

- Target: **90+** for Performance
- Target: **95+** for Accessibility
- Target: **90+** for Best Practices
- Target: **100** for SEO

### **6. Mobile Testing**

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)
- [ ] 2G network simulation

---

## 📊 MONITORING & MAINTENANCE

### **1. Set Up Monitoring**

**Vercel Analytics:**
- Enable in Vercel Dashboard → Analytics
- Track page views, performance, errors

**Error Tracking:**
- Consider adding Sentry or similar
- Monitor API errors
- Track user-reported issues

### **2. Database Monitoring**

**Supabase Dashboard:**
- Monitor query performance
- Check connection pool usage
- Review RLS policy effectiveness
- Monitor storage usage

### **3. Regular Maintenance Tasks**

**Weekly:**
- [ ] Check error logs
- [ ] Review user feedback
- [ ] Monitor API usage/quota
- [ ] Check database performance

**Monthly:**
- [ ] Review and update dependencies
- [ ] Check security advisories
- [ ] Review and optimize slow queries
- [ ] Update content (founder page, etc.)

**Quarterly:**
- [ ] Full security audit
- [ ] Performance optimization
- [ ] Feature usage analysis
- [ ] User feedback review

### **4. Backup Strategy**

**Supabase Backups:**
- Automatic daily backups (Supabase Pro)
- Manual backup before major changes
- Test restore procedure quarterly

**Code Backups:**
- Git repository (GitHub/GitLab)
- Regular commits
- Tagged releases

---

## 🎯 DEPLOYMENT CHECKLIST SUMMARY

### **Before Deployment:**
- [ ] Code committed and pushed
- [ ] Build passes locally
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Founder page created
- [ ] Founder photo added
- [ ] Navigation updated

### **During Deployment:**
- [ ] Vercel build succeeds
- [ ] No errors in build logs
- [ ] Environment variables loaded

### **After Deployment:**
- [ ] All pages accessible
- [ ] Forms submit successfully
- [ ] API endpoints respond
- [ ] Founder page displays
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] No console errors

---

## 🆘 TROUBLESHOOTING

### **Build Fails**

**Error: Missing environment variables**
- Solution: Add all required variables in Vercel Dashboard

**Error: TypeScript errors**
- Solution: Fix errors locally, commit, redeploy

**Error: Module not found**
- Solution: Check `package.json` dependencies

### **Runtime Errors**

**Error: Supabase connection failed**
- Solution: Verify `NEXT_PUBLIC_SUPABASE_URL` and keys

**Error: API key invalid**
- Solution: Check API keys in Vercel environment variables

**Error: 404 on pages**
- Solution: Check Next.js routing, verify file structure

### **Database Issues**

**Error: Table does not exist**
- Solution: Run missing migrations in Supabase SQL Editor

**Error: RLS policy blocking**
- Solution: Review and update RLS policies

---

## 📞 SUPPORT & RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Project Issues:** GitHub Issues

---

## ✅ FINAL CHECKLIST

Before going live:

- [ ] All features tested
- [ ] Founder page complete
- [ ] All environment variables set
- [ ] Database migrations complete
- [ ] Build successful
- [ ] Performance acceptable
- [ ] Mobile tested
- [ ] Error monitoring set up
- [ ] Backup strategy in place
- [ ] Team notified

---

**🎉 Ready to Deploy!**

Once all checkboxes are complete, you're ready to go live. Good luck with your launch! 🚀

