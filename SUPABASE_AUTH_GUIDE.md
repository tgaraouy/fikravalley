# Supabase Auth Setup Guide

## 1. Supabase Dashboard Configuration

### Step 1: Enable Email Auth
1. Go to your Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional for demo)

### Step 2: Set Site URL
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (for development)
3. Add **Redirect URLs**: 
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/**` (for production, use your domain)

### Step 3: Enable RLS (Row Level Security) - Optional
For production, you'll want to add RLS policies to protect user data:
```sql
-- Example: Allow users to read their own ideas
CREATE POLICY "Users can view own ideas"
ON marrai_ideas FOR SELECT
USING (auth.uid() = user_id);
```

---

## 2. Code Setup

### Update Supabase Client (`lib/supabase.ts`)

The client needs to handle auth state. We'll create separate clients for:
- **Client-side**: Needs auth state management
- **Server-side**: Uses service role (for API routes)

---

## 3. Login/Signup Pages

### Features:
- Email/Password authentication
- Sign up with email confirmation (optional)
- Password reset (optional)
- French labels

---

## 4. Protecting API Routes

### Method: Check auth token in API routes
```typescript
// Get user from request headers
const authHeader = request.headers.get('authorization');
// Verify with Supabase
```

---

## 5. User-Specific Data

### Get current user:
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Filter data by user:
```typescript
.eq('user_id', user.id)
```

---

## 6. Logout

### Simple logout:
```typescript
await supabase.auth.signOut();
```

---

## Quick Start Checklist

- [ ] Enable Email auth in Supabase Dashboard
- [ ] Set Site URL and Redirect URLs
- [ ] Update Supabase client for auth
- [ ] Create login page (`/login`)
- [ ] Create signup page (`/signup`)
- [ ] Add auth check to protected API routes
- [ ] Add user context/hook for client-side
- [ ] Add logout button
- [ ] Test login/signup flow

