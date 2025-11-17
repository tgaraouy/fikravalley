# Table Name Updates Summary

All table references have been updated from old names to `marrai_` prefixed names.

## Files Updated

### API Routes
- ✅ `app/api/ideas/search/route.ts` - Updated to use `marrai_idea_scores`
- ✅ `app/api/ideas/[id]/route.ts` - Updated all table references
- ✅ `app/api/ideas/[id]/upvote/route.ts` - Updated to `marrai_idea_upvotes`
- ✅ `app/api/ideas/[id]/validate-problem/route.ts` - Updated to `marrai_problem_validations`
- ✅ `app/api/admin/ideas/route.ts` - Updated to `marrai_idea_scores`
- ✅ `app/api/admin/stats/route.ts` - Updated all table references
- ✅ `app/api/admin/receipts/route.ts` - Updated to `marrai_idea_receipts`
- ✅ `app/api/admin/receipts/[id]/verify/route.ts` - Updated to `marrai_idea_receipts`
- ✅ `app/api/admin/receipts/bulk-verify/route.ts` - Updated to `marrai_idea_receipts`
- ✅ `app/api/admin/mentors/match/route.ts` - Updated to `marrai_mentor_matches`
- ✅ `app/api/admin/compliance/export/route.ts` - Updated all privacy tables
- ✅ `app/api/admin/compliance/user-rights/route.ts` - Updated all privacy tables
- ✅ `app/api/admin/compliance/metrics/route.ts` - Updated all privacy tables
- ✅ `app/api/admin/compliance/alerts/route.ts` - Updated all privacy tables
- ✅ `app/api/privacy/delete/route.ts` - Updated all privacy tables
- ✅ `app/api/privacy/export/route.ts` - Updated all privacy tables
- ✅ `app/api/whatsapp/self-ask/route.ts` - Updated to `marrai_self_ask_questions`

### Library Files
- ✅ `lib/idea-bank/intilaka/pdf-generator.ts` - Updated all table references
- ✅ `lib/idea-bank/self-ask/chain.ts` - Updated all self-ask table references
- ✅ `lib/privacy/secure-storage.ts` - Updated to `marrai_secure_users`, `marrai_audit_logs`
- ✅ `lib/privacy/consent.ts` - Updated to `marrai_consents`, `marrai_audit_logs`, `marrai_secure_users`
- ✅ `lib/whatsapp/privacy-handler.ts` - Updated all privacy tables

## Table Name Mappings

| Old Name | New Name |
|----------|----------|
| `idea_scores` (view) | `marrai_idea_scores` (view) |
| `idea_receipts` | `marrai_idea_receipts` |
| `idea_upvotes` | `marrai_idea_upvotes` |
| `problem_validations` | `marrai_problem_validations` |
| `secure_users` | `marrai_secure_users` |
| `consents` | `marrai_consents` |
| `deletion_requests` | `marrai_deletion_requests` |
| `export_requests` | `marrai_export_requests` |
| `audit_logs` | `marrai_audit_logs` |
| `self_ask_questions` | `marrai_self_ask_questions` |
| `self_ask_responses` | `marrai_self_ask_responses` |
| `mentor_matches` | `marrai_mentor_matches` |
| `clarity_scores` | `marrai_clarity_scores` |
| `decision_scores` | `marrai_decision_scores` |

## Column Name Updates

Some column names were also updated to match the schema:
- `ip_address` → `voter_ip` (in `marrai_idea_upvotes`)
- `ip_address` → `validator_ip` (in `marrai_problem_validations`)

## Next Steps

1. ✅ Run `supabase/scripts/fix_remaining_issues.sql` to enable RLS on `marrai_secure_users`
2. ✅ Test all API endpoints
3. ✅ Verify all queries work correctly
4. ✅ Check for any remaining old table references

## Testing Checklist

- [ ] Test idea search API
- [ ] Test idea detail API
- [ ] Test upvote functionality
- [ ] Test problem validation
- [ ] Test admin dashboard
- [ ] Test receipt verification
- [ ] Test privacy endpoints (delete, export)
- [ ] Test compliance dashboard
- [ ] Test self-ask chain
- [ ] Test PDF generation

