# Next Steps After Schema Creation

## ✅ What's Done

- All `marrai_` prefixed tables created
- Indexes created
- Foreign keys established
- RLS policies enabled
- View `marrai_idea_scores` created

## 📋 Next Steps

### 1. Verify Schema (5 minutes)

Run the verification script:
```sql
-- Run: supabase/scripts/verify_schema.sql
```

This will check:
- All tables exist
- Key columns are present
- Foreign keys are correct
- Indexes are created
- RLS is enabled
- View works

### 2. Update Application Code

Update all table references in your codebase:

#### Files to Update:

**API Routes:**
- `app/api/ideas/**/*.ts` - Update table names
- `app/api/admin/**/*.ts` - Update table names
- `app/api/privacy/**/*.ts` - Update table names

**Library Files:**
- `lib/idea-bank/scoring/**/*.ts` - Update table names
- `lib/idea-bank/self-ask/**/*.ts` - Update table names
- `lib/idea-bank/intilaka/**/*.ts` - Update table names
- `lib/privacy/**/*.ts` - Update table names

**Components:**
- Any component that queries the database directly

#### Table Name Changes:

| Old Reference | New Reference |
|---------------|---------------|
| `secure_users` | `marrai_secure_users` |
| `clarity_scores` | `marrai_clarity_scores` |
| `decision_scores` | `marrai_decision_scores` |
| `idea_receipts` | `marrai_idea_receipts` |
| `self_ask_questions` | `marrai_self_ask_questions` |
| `self_ask_responses` | `marrai_self_ask_responses` |
| `funding_applications` | `marrai_funding_applications` |
| `idea_upvotes` | `marrai_idea_upvotes` |
| `idea_comments` | `marrai_idea_comments` |
| `problem_validations` | `marrai_problem_validations` |
| `mentors` | `marrai_mentors` |
| `mentor_matches` | `marrai_mentor_matches` |
| `consents` | `marrai_consents` |
| `deletion_requests` | `marrai_deletion_requests` |
| `export_requests` | `marrai_export_requests` |
| `admin_actions` | `marrai_admin_actions` |
| `audit_logs` | `marrai_audit_logs` |
| `idea_scores` (view) | `marrai_idea_scores` (view) |

#### Example Update:

```typescript
// OLD
const { data } = await supabase
  .from('clarity_scores')
  .select('*')
  .eq('idea_id', ideaId);

// NEW
const { data } = await supabase
  .from('marrai_clarity_scores')
  .select('*')
  .eq('idea_id', ideaId);
```

### 3. Update TypeScript Types

If you have TypeScript types defined:

**File:** `lib/supabase.ts` or similar

Update the Database interface to use new table names:

```typescript
export interface Database {
  public: {
    Tables: {
      marrai_ideas: { ... },
      marrai_clarity_scores: { ... },
      marrai_decision_scores: { ... },
      // ... etc
    }
  }
}
```

### 4. Test Database Queries

Test key operations:

```typescript
// Test scoring
const { data: scores } = await supabase
  .from('marrai_clarity_scores')
  .select('*')
  .eq('idea_id', ideaId)
  .single();

// Test receipts
const { data: receipts } = await supabase
  .from('marrai_idea_receipts')
  .select('*')
  .eq('idea_id', ideaId);

// Test view
const { data: ideaScores } = await supabase
  .from('marrai_idea_scores')
  .select('*')
  .eq('idea_id', ideaId)
  .single();
```

### 5. Update Seed Data (Optional)

If you have seed data, update table names:

**File:** `supabase/seed.sql`

Update all `INSERT INTO` statements to use new table names.

### 6. Check for Old Table References

Search your codebase for old table names:

```bash
# Search for old table references
grep -r "from('clarity_scores" .
grep -r "from('decision_scores" .
grep -r "from('secure_users" .
# etc.
```

### 7. Update Documentation

Update any documentation that references table names:
- API documentation
- Database schema docs
- README files

### 8. Test Application

1. **Test idea submission** - Should create records in new tables
2. **Test scoring** - Should work with new table names
3. **Test receipts** - Should save to `marrai_idea_receipts`
4. **Test admin dashboard** - Should query new tables
5. **Test privacy features** - Should use new consent/deletion tables

### 9. Migration Checklist

- [ ] All tables created and verified
- [ ] All indexes created
- [ ] Foreign keys working
- [ ] RLS policies enabled
- [ ] View `marrai_idea_scores` working
- [ ] Application code updated
- [ ] TypeScript types updated
- [ ] Tests passing
- [ ] Documentation updated

## 🔍 Quick Verification Commands

### Check table exists:
```sql
SELECT tablename FROM pg_tables 
WHERE tablename = 'marrai_decision_scores';
```

### Check column exists:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'marrai_decision_scores' 
AND column_name = 'qualification_tier';
```

### Test view:
```sql
SELECT * FROM marrai_idea_scores LIMIT 1;
```

### Check foreign keys:
```sql
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'marrai_decision_scores';
```

## 🚨 Common Issues

### Issue: "relation does not exist"
**Solution:** Table name typo or table not created. Check with verification script.

### Issue: "column does not exist"
**Solution:** Column missing. Check if migration ran completely.

### Issue: "permission denied"
**Solution:** RLS policy issue. Check policies are created correctly.

### Issue: View returns error
**Solution:** Check all referenced tables and columns exist.

## 📞 Need Help?

1. Run `supabase/scripts/verify_schema.sql` to diagnose
2. Check Supabase logs for errors
3. Verify table names match exactly (case-sensitive)
4. Check foreign key constraints

## ✅ Success Criteria

You're ready when:
- ✅ Verification script passes
- ✅ All application queries work
- ✅ No "relation does not exist" errors
- ✅ View `marrai_idea_scores` works
- ✅ Tests pass

Good luck! 🚀

