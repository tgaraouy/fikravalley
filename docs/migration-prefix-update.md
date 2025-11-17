# Migration: Table Prefix Update

## Summary

All database tables have been updated to use the `marrai_` prefix for consistency with the existing `marrai_ideas` table.

## Changes Made

### Table Name Updates

All tables now use the `marrai_` prefix:

| Old Name | New Name |
|----------|----------|
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

### View Updates

| Old Name | New Name |
|----------|----------|
| `idea_scores` | `marrai_idea_scores` |

### Index Updates

All indexes have been updated to use the `marrai_` prefix:
- `idx_secure_users_*` → `idx_marrai_secure_users_*`
- `idx_clarity_scores_*` → `idx_marrai_clarity_scores_*`
- `idx_decision_scores_*` → `idx_marrai_decision_scores_*`
- etc.

### Foreign Key Updates

All foreign key references have been updated:
- `REFERENCES secure_users(id)` → `REFERENCES marrai_secure_users(id)`
- `REFERENCES mentors(id)` → `REFERENCES marrai_mentors(id)`
- etc.

### Trigger Updates

All triggers have been updated:
- `update_secure_users_updated_at` → `update_marrai_secure_users_updated_at`
- `update_ideas_updated_at` → `update_marrai_ideas_updated_at`
- etc.

### RLS Policy Updates

All RLS policies have been updated to reference the new table names.

## Migration Instructions

### Option 1: Fresh Database (Recommended for Development)

If you're starting fresh or can drop existing tables:

1. **Run the migration file** in Supabase SQL Editor:
   ```sql
   -- The migration includes DROP statements for old tables
   -- Run: supabase/migrations/001_complete_idea_bank_schema.sql
   ```

2. **Verify tables created**:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'marrai_%'
   ORDER BY tablename;
   ```

### Option 2: Existing Database with Data

If you have existing data that needs to be preserved:

1. **Backup your data first!**
   ```sql
   -- Export data from existing tables
   -- Use Supabase dashboard or pg_dump
   ```

2. **Rename existing tables** (if they exist):
   ```sql
   -- Rename tables one by one
   ALTER TABLE secure_users RENAME TO marrai_secure_users;
   ALTER TABLE clarity_scores RENAME TO marrai_clarity_scores;
   ALTER TABLE decision_scores RENAME TO marrai_decision_scores;
   -- ... etc for all tables
   ```

3. **Update foreign keys**:
   ```sql
   -- Foreign keys will be automatically updated when tables are renamed
   -- But verify with:
   SELECT 
     tc.table_name, 
     kcu.column_name, 
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
   AND tc.table_schema = 'public';
   ```

4. **Update indexes**:
   ```sql
   -- Indexes will be automatically updated when tables are renamed
   -- But you may need to recreate some indexes
   ```

5. **Update triggers**:
   ```sql
   -- Drop old triggers and recreate with new names
   DROP TRIGGER IF EXISTS update_secure_users_updated_at ON marrai_secure_users;
   CREATE TRIGGER update_marrai_secure_users_updated_at
     BEFORE UPDATE ON marrai_secure_users
     FOR EACH ROW
     EXECUTE FUNCTION update_updated_at_column();
   -- ... etc for all triggers
   ```

6. **Update RLS policies**:
   ```sql
   -- Drop old policies and recreate with new table names
   DROP POLICY IF EXISTS "Service role can manage all" ON secure_users;
   CREATE POLICY "Service role can manage all" ON marrai_secure_users
     FOR ALL USING (auth.role() = 'service_role');
   -- ... etc for all policies
   ```

### Option 3: Clean Slate (Development Only)

If you're in development and can start fresh:

1. **Drop all existing tables**:
   ```sql
   -- The migration file includes DROP statements
   -- Or manually drop:
   DROP TABLE IF EXISTS secure_users CASCADE;
   DROP TABLE IF EXISTS clarity_scores CASCADE;
   -- ... etc
   ```

2. **Run the migration**:
   ```sql
   -- Run: supabase/migrations/001_complete_idea_bank_schema.sql
   ```

## Verification

After migration, verify:

1. **All tables have `marrai_` prefix**:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename NOT LIKE 'marrai_%'
   AND tablename NOT IN ('_prisma_migrations', 'schema_migrations');
   -- Should return empty or only system tables
   ```

2. **All foreign keys reference correct tables**:
   ```sql
   SELECT DISTINCT ccu.table_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
   AND tc.table_schema = 'public'
   AND ccu.table_name NOT LIKE 'marrai_%';
   -- Should return empty
   ```

3. **All indexes are created**:
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE schemaname = 'public' 
   AND tablename LIKE 'marrai_%'
   ORDER BY tablename, indexname;
   ```

## Application Code Updates

After migration, update your application code:

1. **Update table references**:
   - `secure_users` → `marrai_secure_users`
   - `clarity_scores` → `marrai_clarity_scores`
   - etc.

2. **Update view references**:
   - `idea_scores` → `marrai_idea_scores`

3. **Update TypeScript types** (if using):
   - Update `lib/supabase.ts` or your type definitions

4. **Update API routes**:
   - All `.from()` calls need new table names

## Rollback (If Needed)

If you need to rollback:

1. **Rename tables back**:
   ```sql
   ALTER TABLE marrai_secure_users RENAME TO secure_users;
   -- ... etc
   ```

2. **Update foreign keys, indexes, triggers, and policies** (reverse of migration)

## Notes

- **`marrai_ideas`** table already had the prefix, so it's unchanged
- The migration includes `DROP TABLE IF EXISTS` statements for old tables
- All foreign keys, indexes, triggers, and RLS policies have been updated
- The view `marrai_idea_scores` replaces `idea_scores`

## Questions?

If you encounter issues:
1. Check Supabase logs
2. Verify foreign key constraints
3. Check RLS policies
4. Review index creation

