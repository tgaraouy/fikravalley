# 📋 Visibility Requirements for Ideas

## Quick Answer

**For an idea to be visible in the public search (`/ideas` page):**

```sql
visible = true
```

That's it! The `visible` column must be set to `true`.

## Current Issue

Your 18 ideas have `visible = false` (the default), so they're filtered out by the search API.

## Immediate Fix

Run this SQL in Supabase Dashboard:

```sql
UPDATE marrai_ideas 
SET visible = true 
WHERE visible IS NULL OR visible = false;
```

Or use the script:
- `supabase/scripts/make_all_ideas_visible.sql`

## How Visibility Works

### 1. Database Column

- **Column**: `visible` (BOOLEAN)
- **Default**: `false` (for privacy)
- **Location**: `marrai_ideas.visible`

### 2. Search API Filter

The search API (`/api/ideas/search`) filters ideas:

```typescript
// From app/api/ideas/search/route.ts line 108
ideasToProcess = ideasToProcess.filter((idea: any) => idea.visible === true);
```

**Only ideas with `visible = true` are returned.**

### 3. Agent 7 (Feature Flag Agent) Logic

According to Agent 7's rules:

```typescript
// visible=true IF:
// - featured=true AND
// - admin manually approves (admin_notes="Approved for public")
```

**However**, for development/testing, you can manually set `visible = true` without going through Agent 7.

## Workflow (Production)

### Automatic (via Agent 7)

1. Idea reaches `status = 'matched'`
2. Agent 7 processes and sets `featured = true` (if conditions met)
3. Agent 7 sets `visible = false` (default privacy)
4. Admin reviews in dashboard
5. Admin sets `admin_notes = "Approved for public"`
6. Agent 7 sets `visible = true` (or admin sets manually)

### Manual Override

For development or immediate visibility:

```sql
UPDATE marrai_ideas 
SET visible = true 
WHERE id = 'your-idea-id';
```

## Verification

Check which ideas are visible:

```sql
SELECT 
  id,
  title,
  visible,
  status,
  featured
FROM marrai_ideas
ORDER BY created_at DESC;
```

Count visible vs hidden:

```sql
SELECT 
  COUNT(*) FILTER (WHERE visible = true) as visible_count,
  COUNT(*) FILTER (WHERE visible = false OR visible IS NULL) as hidden_count,
  COUNT(*) as total_count
FROM marrai_ideas;
```

## Common Issues

### Issue 1: "0 ideas found" but ideas exist

**Cause**: All ideas have `visible = false`

**Fix**: 
```sql
UPDATE marrai_ideas SET visible = true;
```

### Issue 2: Some ideas visible, others not

**Cause**: Mixed `visible` values

**Fix**: Check and update specific ideas:
```sql
SELECT id, title, visible FROM marrai_ideas WHERE visible = false;
UPDATE marrai_ideas SET visible = true WHERE id IN (...);
```

### Issue 3: Ideas disappear after Agent 7 runs

**Cause**: Agent 7 sets `visible = false` by default

**Fix**: Either:
1. Set `admin_notes = "Approved for public"` and re-run Agent 7
2. Manually set `visible = true` after Agent 7 runs

## Best Practices

1. **Development**: Set `visible = true` for all test ideas
2. **Production**: Use Agent 7 workflow with admin approval
3. **Seed Data**: Always include `visible = true` in INSERT statements

## Related Files

- `app/api/ideas/search/route.ts` - Search API filter
- `lib/agents/feature-flag-agent.ts` - Agent 7 visibility logic
- `supabase/migrations/005_add_visible_column.sql` - Column definition
- `supabase/scripts/make_all_ideas_visible.sql` - Quick fix script

