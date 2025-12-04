# 🔗 LinkedIn OAuth Setup - Quick Start

## 🎯 What You Need

**One LinkedIn App** = All mentors can use it (like Google Sign-In)

You create ONE app in LinkedIn Developer Portal, and all mentors authenticate through it.

---

## 📋 Step-by-Step Setup (5 minutes)

### Step 1: Create LinkedIn App

1. Go to **[LinkedIn Developer Portal](https://www.linkedin.com/developers/)**
2. Sign in with your LinkedIn account
3. Click **"Create app"**
4. Fill in:
   - **App name:** `Fikra Valley`
   - **LinkedIn Page:** Your organization's LinkedIn page
   - **Privacy policy URL:** `https://fikravalley.com/privacy`
   - **App use case:** Select "Sign In with LinkedIn using OpenID Connect"
5. Click **"Create app"**

### Step 2: Configure Redirect URLs

1. Go to **"Auth"** tab in your LinkedIn app
2. Under **"Redirect URLs"**, add:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   https://fikravalley.com/api/auth/linkedin/callback
   ```
3. Click **"Update"**

### Step 3: Request Products (Permissions)

1. Go to **"Products"** tab
2. Request:
   - ✅ **Sign In with LinkedIn using OpenID Connect** (Required)
   - ✅ **Email Address API** (Required)
   - ✅ **Profile API** (Optional - for richer data)
3. Wait for approval (usually instant)

### Step 4: Get Credentials

1. Go back to **"Auth"** tab
2. Copy **Client ID** and **Client Secret**

---

## 🔐 Environment Variables

### Local Development (`.env.local`)

Create or edit `.env.local` in your project root:

```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important:** Restart your dev server after adding these!

### Production (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project → **Settings** → **Environment Variables**
3. Add:
   ```
   LINKEDIN_CLIENT_ID = your_client_id_here
   LINKEDIN_CLIENT_SECRET = your_client_secret_here
   LINKEDIN_REDIRECT_URI = https://fikravalley.com/api/auth/linkedin/callback
   NEXT_PUBLIC_SITE_URL = https://fikravalley.com
   ```
4. Apply to: **Production, Preview, Development**
5. Click **"Save"**

---

## ✅ Test It

1. Start dev server: `npm run dev`
2. Visit: `http://localhost:3000/become-mentor`
3. Click **"S'inscrire avec LinkedIn"**
4. Should redirect to LinkedIn login
5. After authorizing, should redirect back with profile data

---

## 🐛 Common Issues

### "LINKEDIN_CLIENT_ID environment variable is required"
- ✅ Check `.env.local` exists and has the variable
- ✅ Restart dev server after adding env vars
- ✅ Variable name must be exactly `LINKEDIN_CLIENT_ID` (case-sensitive)

### "Redirect URI mismatch"
- ✅ Redirect URI in LinkedIn app must match exactly
- ✅ No trailing slashes
- ✅ Use `https://` for production (not `http://`)

### "Invalid client_id"
- ✅ Double-check you copied Client ID correctly
- ✅ No extra spaces
- ✅ Verify app is approved in LinkedIn Developer Portal

---

## 📝 Quick Reference

| What | Where | Example |
|------|-------|---------|
| **Client ID** | LinkedIn App → Auth tab | `86abc123def456` |
| **Client Secret** | LinkedIn App → Auth tab | `xYz789AbC123DeF456` |
| **Redirect URI** | Your domain + callback | `https://fikravalley.com/api/auth/linkedin/callback` |
| **Env Var** | `.env.local` or Vercel | `LINKEDIN_CLIENT_ID` |

---

## 💡 Important Notes

1. **One Client ID for ALL mentors** - You don't need different IDs per mentor
2. **Client Secret is secret** - Never commit to Git, never expose in frontend
3. **Redirect URI must match exactly** - LinkedIn is strict about this
4. **Environment variables** - Must be set in both local and production

---

## ✅ Checklist

- [ ] Created LinkedIn app in Developer Portal
- [ ] Added redirect URIs (dev + production)
- [ ] Requested "Sign In with LinkedIn using OpenID Connect"
- [ ] Copied Client ID and Client Secret
- [ ] Added environment variables to `.env.local`
- [ ] Added environment variables to Vercel (production)
- [ ] Restarted dev server
- [ ] Tested locally - LinkedIn button works

---

## 🆘 Need More Help?

- Full guide: `docs/LINKEDIN_OAUTH_SETUP_GUIDE.md`
- LinkedIn Docs: [Sign In with LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- LinkedIn Developer Portal: [https://www.linkedin.com/developers/](https://www.linkedin.com/developers/)

---

**That's it!** Once configured, all mentors can use LinkedIn OAuth with this single Client ID. 🎉

