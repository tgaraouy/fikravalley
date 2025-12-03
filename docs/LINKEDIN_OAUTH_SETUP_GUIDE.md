# 🔗 LinkedIn OAuth Setup Guide

## 📚 Understanding LinkedIn OAuth

**Important:** `LINKEDIN_CLIENT_ID` is **NOT** the mentor's LinkedIn ID. It's your **application's** OAuth client ID from LinkedIn Developer Portal.

### How It Works:
1. **One App = One Client ID**: You create ONE LinkedIn app in LinkedIn Developer Portal
2. **All mentors use the same app**: Every mentor authenticates through YOUR app
3. **Each mentor has their own LinkedIn account**: They log in with their personal LinkedIn credentials
4. **Your app gets their profile**: LinkedIn gives you their profile data after they authorize

**Analogy:** Like Google Sign-In - Google has ONE app ID, but millions of users can sign in with their own Google accounts.

---

## 🚀 Step-by-Step Setup

### Step 1: Create LinkedIn App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click **"Create app"**
4. Fill in the form:
   - **App name:** `Fikra Valley` (or your app name)
   - **LinkedIn Page:** Select or create a LinkedIn page for your organization
   - **Privacy policy URL:** `https://fikravalley.com/privacy` (or your privacy policy URL)
   - **App logo:** Upload your logo (optional but recommended)
   - **App use case:** Select "Sign In with LinkedIn using OpenID Connect"
5. Click **"Create app"**

### Step 2: Configure OAuth Settings

1. In your LinkedIn app dashboard, go to **"Auth"** tab
2. Under **"Redirect URLs"**, add:
   - **Development:** `http://localhost:3000/api/auth/linkedin/callback`
   - **Production:** `https://fikravalley.com/api/auth/linkedin/callback` (or your domain)
3. Click **"Update"**

### Step 3: Request Products (Permissions)

1. In your LinkedIn app dashboard, go to **"Products"** tab
2. Request these products:
   - ✅ **Sign In with LinkedIn using OpenID Connect** (Required)
   - ✅ **Email Address API** (Required - to get mentor's email)
   - ✅ **Profile API** (Optional - for richer profile data)
3. Wait for approval (usually instant for OpenID Connect)

### Step 4: Get Your Credentials

1. Go back to **"Auth"** tab
2. Find **"Client ID"** - Copy this value
3. Find **"Client Secret"** - Copy this value (keep it secret!)

**Example:**
```
Client ID: 86abc123def456
Client Secret: xYz789AbC123DeF456
```

---

## 🔐 Setting Environment Variables

### For Local Development (`.env.local`)

```bash
# LinkedIn OAuth (ONE app for ALL mentors)
LINKEDIN_CLIENT_ID=86abc123def456
LINKEDIN_CLIENT_SECRET=xYz789AbC123DeF456
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### For Production (Vercel Dashboard)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
LINKEDIN_CLIENT_ID = 86abc123def456
LINKEDIN_CLIENT_SECRET = xYz789AbC123DeF456
LINKEDIN_REDIRECT_URI = https://fikravalley.com/api/auth/linkedin/callback
NEXT_PUBLIC_SITE_URL = https://fikravalley.com
```

5. Apply to: **Production, Preview, Development**
6. Click **"Save"**

---

## ✅ Verification

### Test Locally:

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit: `http://localhost:3000/become-mentor`

3. Click **"S'inscrire avec LinkedIn"**

4. You should be redirected to LinkedIn login page

5. After authorizing, you should be redirected back to your app

### Check Environment Variables:

```bash
# In your terminal
echo $LINKEDIN_CLIENT_ID

# Or in Node.js
node -e "console.log(process.env.LINKEDIN_CLIENT_ID)"
```

---

## 🔧 Making LinkedIn Optional

The code now gracefully handles missing LinkedIn configuration:

- **If configured:** LinkedIn button appears
- **If NOT configured:** LinkedIn button is hidden, manual form is shown

The `LinkedInMentorRegistration` component checks if LinkedIn is configured before showing the button.

---

## 📝 Common Issues

### Issue 1: "LINKEDIN_CLIENT_ID environment variable is required"

**Solution:** 
- Make sure `.env.local` exists and has `LINKEDIN_CLIENT_ID`
- Restart your dev server after adding env vars
- Check that the variable name is exactly `LINKEDIN_CLIENT_ID` (case-sensitive)

### Issue 2: "Redirect URI mismatch"

**Solution:**
- Make sure the redirect URI in LinkedIn app matches exactly
- Check for trailing slashes (`/api/auth/linkedin/callback` vs `/api/auth/linkedin/callback/`)
- For production, use `https://` (not `http://`)

### Issue 3: "Invalid client_id"

**Solution:**
- Double-check you copied the Client ID correctly
- Make sure there are no extra spaces
- Verify the app is approved in LinkedIn Developer Portal

### Issue 4: "Product not approved"

**Solution:**
- Go to LinkedIn Developer Portal → Products tab
- Make sure "Sign In with LinkedIn using OpenID Connect" is approved
- Wait a few minutes if you just requested it

---

## 🎯 Quick Reference

| What | Where | Example |
|------|-------|---------|
| **Client ID** | LinkedIn App → Auth tab | `86abc123def456` |
| **Client Secret** | LinkedIn App → Auth tab | `xYz789AbC123DeF456` |
| **Redirect URI** | Your app URL + callback path | `https://fikravalley.com/api/auth/linkedin/callback` |
| **Env Var Name** | `.env.local` or Vercel | `LINKEDIN_CLIENT_ID` |

---

## 💡 Important Notes

1. **One Client ID for ALL mentors**: You don't need a different Client ID per mentor
2. **Client Secret is secret**: Never commit it to Git, never expose it in frontend code
3. **Redirect URI must match exactly**: LinkedIn is strict about this
4. **Environment variables**: Must be set in both local (`.env.local`) and production (Vercel)

---

## 🆘 Need Help?

- [LinkedIn Developer Documentation](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2)
- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- Check your app status in LinkedIn Developer Portal → Your App → Status

---

## ✅ Checklist

- [ ] Created LinkedIn app in Developer Portal
- [ ] Added redirect URIs (dev + production)
- [ ] Requested "Sign In with LinkedIn using OpenID Connect"
- [ ] Copied Client ID and Client Secret
- [ ] Added environment variables to `.env.local`
- [ ] Added environment variables to Vercel (production)
- [ ] Tested locally - LinkedIn button works
- [ ] Tested production - LinkedIn button works

---

**That's it!** Once configured, all mentors can use LinkedIn OAuth with this single Client ID. 🎉

