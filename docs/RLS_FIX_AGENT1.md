# Fixing RLS Error for Agent 1

## Issue
Agent 1 extraction works, but saving fails with:
```
Error: new row violates row-level security policy for table "marrai_conversation_ideas"
Code: 42501
```

## Solution

### Option 1: Set Service Role Key (Recommended)

Add to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get your service role key from:
- Supabase Dashboard → Project Settings → API → `service_role` key (secret)

### Option 2: Update RLS Policies

If you can't use service role, update RLS policies in Supabase:

```sql
-- Allow inserts into marrai_conversation_ideas
CREATE POLICY "Allow API inserts" ON marrai_conversation_ideas
  FOR INSERT
  WITH CHECK (true);
```

### Option 3: Use Existing Client (Temporary)

The agent now falls back to anon key if service role is not set, but RLS will block it.

## Verification

After setting `SUPABASE_SERVICE_ROLE_KEY`, test:
```powershell
.\test-agent1-full.ps1
```

You should see:
- ✅ "Successfully saved conversation idea"
- ✅ No RLS errors
- ✅ `success: true` in response

## Current Status

The agent now:
1. ✅ Tries to use service role key first
2. ⚠️ Falls back to anon key (will hit RLS)
3. ✅ Logs which key type is being used
4. ✅ Provides clear error messages

