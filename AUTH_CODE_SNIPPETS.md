# Supabase Auth - Key Code Snippets

## 1. Supabase Dashboard Setup

### Quick Steps:
1. **Authentication → Providers**: Enable Email
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

---

## 2. Client-Side: Get Current User

```typescript
// hooks/useAuth.ts
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isLoading, signOut } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  return <div>Hello {user.email}!</div>;
}
```

---

## 3. Server-Side: Get Current User

```typescript
// In a server component or API route
import { getCurrentUser, requireAuth } from '@/lib/auth-helpers';

// Optional: Returns null if not authenticated
const user = await getCurrentUser();

// Required: Redirects to /login if not authenticated
const user = await requireAuth();
```

---

## 4. Protect API Routes

```typescript
// app/api/my-route/route.ts
import { requireAuth } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  // This redirects to /login if not authenticated
  const user = await requireAuth();
  
  // Now you can use user.id, user.email, etc.
  return NextResponse.json({ userId: user.id });
}
```

---

## 5. Filter Data by User

```typescript
// Get user's ideas only
const { data } = await supabase
  .from('marrai_ideas')
  .select('*')
  .eq('user_id', user.id); // Assuming you add user_id column
```

---

## 6. Login

```typescript
// app/login/page.tsx
const supabase = createClient();
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

if (data.user) {
  router.push('/');
}
```

---

## 7. Signup

```typescript
// app/signup/page.tsx
const supabase = createClient();
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

---

## 8. Logout

```typescript
// Anywhere in client component
const { signOut } = useAuth();
await signOut(); // Handles redirect automatically

// Or manually:
const supabase = createClient();
await supabase.auth.signOut();
router.push('/login');
```

---

## 9. Protect a Page (Server Component)

```typescript
// app/dashboard/page.tsx
import { requireAuth } from '@/lib/auth-helpers';

export default async function DashboardPage() {
  const user = await requireAuth(); // Redirects if not logged in
  
  return <div>Welcome {user.email}!</div>;
}
```

---

## 10. Protect a Page (Client Component)

```typescript
// app/dashboard/page.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  if (isLoading || !user) return <div>Loading...</div>;
  
  return <div>Welcome {user.email}!</div>;
}
```

---

## 11. Add User ID to Database Records

```typescript
// When creating an idea
const { data: { user } } = await supabase.auth.getUser();

await supabase.from('marrai_ideas').insert({
  title: 'My Idea',
  problem_statement: '...',
  user_id: user?.id, // Add this field to your table
});
```

---

## Quick Checklist

- [x] Install `@supabase/ssr`
- [x] Create `lib/supabase-client.ts` (client-side)
- [x] Create `lib/supabase-server.ts` (server-side)
- [x] Create `lib/auth-helpers.ts` (server helpers)
- [x] Create `hooks/useAuth.ts` (client hook)
- [x] Create `/login` page
- [x] Create `/signup` page
- [x] Create `/auth/callback` route
- [x] Add `UserMenu` component
- [x] Test login/signup flow

---

## Next Steps

1. **Add `user_id` column** to `marrai_ideas` table:
   ```sql
   ALTER TABLE marrai_ideas 
   ADD COLUMN user_id UUID REFERENCES auth.users(id);
   ```

2. **Update idea submission** to include `user_id`

3. **Filter ideas by user** in listings

4. **Add RLS policies** (optional, for production)

