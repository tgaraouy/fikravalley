# Database Schema Documentation

Complete database schema for MarrAI Idea Bank with scoring, receipts, funding, mentors, and privacy features.

## Overview

The database uses PostgreSQL (via Supabase) with:
- **Privacy-first design**: Encrypted PII, phone number hashing
- **Soft deletes**: `deleted_at` timestamps instead of hard deletes
- **Auto-timestamps**: `created_at` and `updated_at` automatically managed
- **Row-Level Security (RLS)**: Fine-grained access control
- **Full-text search**: PostgreSQL GIN indexes for fast search
- **Audit logging**: Complete audit trail of all actions

## Table Structure

### Core Tables

#### `secure_users`
Privacy-first user storage with encrypted PII.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `phone_hash` | TEXT | bcrypt hash of phone number (one-way) |
| `encrypted_name` | TEXT | AES-256-GCM encrypted name |
| `name_iv` | TEXT | Initialization vector for encryption |
| `name_tag` | TEXT | Authentication tag for encryption |
| `anonymous_email` | TEXT | `{uuid}@anonymous.fikravalley.com` |
| `consent` | BOOLEAN | User consent status |
| `consent_date` | TIMESTAMP | When consent was given |
| `data_retention_expiry` | TIMESTAMP | Auto-deletion date |

**Indexes:**
- `phone_hash` (unique)
- `data_retention_expiry`
- `anonymous_email` (unique)

**RLS:** Service role only

---

#### `marrai_ideas`
Main ideas table with all submission data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `title` | TEXT | Idea title |
| `problem_statement` | TEXT | Problem description |
| `proposed_solution` | TEXT | Proposed solution |
| `current_manual_process` | TEXT | Current "as-is" process |
| `category` | TEXT | health, education, agriculture, tech, etc. |
| `location` | TEXT | casablanca, rabat, marrakech, etc. |
| `frequency` | TEXT | daily, weekly, monthly, etc. |
| `data_sources` | TEXT[] | Array of data sources |
| `integration_points` | TEXT[] | Systems to connect |
| `ai_capabilities_needed` | TEXT[] | NLP, vision, prediction, etc. |
| `roi_time_saved_hours` | NUMERIC | Time savings in hours |
| `roi_cost_saved_eur` | NUMERIC | Cost savings in EUR |
| `estimated_cost` | TEXT | Cost estimate |
| `user_id` | UUID | Foreign key to `secure_users` |
| `status` | TEXT | submitted, analyzing, analyzed, qualified, rejected |
| `qualification_tier` | TEXT | exceptional, qualified, needs_work |
| `public` | BOOLEAN | Publicly searchable |
| `opt_in_public` | BOOLEAN | User opted in to public visibility |
| `submitted_via` | TEXT | web, whatsapp, workshop |
| `intilaka_pdf_generated` | BOOLEAN | PDF generated |
| `intilaka_pdf_url` | TEXT | URL to generated PDF |

**Indexes:**
- `status`
- `category`
- `location`
- `qualification_tier`
- `public` (partial, where public = true)
- `created_at` (descending)
- `user_id`
- Full-text search (GIN index on title + problem + solution)

**RLS:** Public can read public ideas, service role can manage all

---

### Scoring Tables

#### `clarity_scores`
Stage 1 scoring: Clarity (0-10 each, 0-40 total).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` (unique) |
| `problem_statement` | NUMERIC(3,1) | Score 0-10 |
| `as_is_analysis` | NUMERIC(3,1) | Score 0-10 |
| `benefit_statement` | NUMERIC(3,1) | Score 0-10 |
| `operational_needs` | NUMERIC(3,1) | Score 0-10 |
| `total` | NUMERIC(4,1) | Sum (0-40) |
| `average` | NUMERIC(3,1) | Average (0-10) |
| `qualified` | BOOLEAN | ≥6/10 average |
| `qualification_reason` | TEXT | Why qualified/not qualified |

**Indexes:**
- `idea_id` (unique)
- `qualified`
- `total` (descending)

**RLS:** Service role only

---

#### `decision_scores`
Stage 2 scoring: Decision (1-5 each, 4-20 total).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` (unique) |
| `strategic_fit` | NUMERIC(2,1) | Score 1-5 |
| `feasibility` | NUMERIC(2,1) | Score 1-5 |
| `differentiation` | NUMERIC(2,1) | Score 1-5 |
| `evidence_of_demand` | NUMERIC(2,1) | Score 1-5 |
| `total` | NUMERIC(3,1) | Sum (4-20) |
| `break_even_months` | INT | Months to break even |
| `intilaka_eligible` | BOOLEAN | ≤24 months |
| `qualified` | BOOLEAN | ≥25/40 total (Stage 1 + Stage 2) |
| `qualification_tier` | TEXT | exceptional (≥35), qualified (≥25), needs_work (<25) |
| `darija_keywords` | TEXT[] | Detected Darija keywords |
| `darija_score` | NUMERIC(3,2) | Darija detection score (0-1) |

**Indexes:**
- `idea_id` (unique)
- `qualified`
- `total` (descending)
- `intilaka_eligible` (partial, where intilaka_eligible = true)

**RLS:** Service role only

---

#### `idea_scores` (View)
Combined view of clarity and decision scores for convenience.

**Columns:**
- `idea_id`
- `stage1_problem`, `stage1_as_is`, `stage1_benefits`, `stage1_operations`
- `stage1_total`, `stage1_average`
- `stage2_strategic`, `stage2_feasibility`, `stage2_differentiation`, `stage2_evidence`
- `stage2_total`
- `total_score` (0-40)
- `break_even_months`
- `intilaka_eligible`
- `qualification_tier`

---

### Receipts & Validation

#### `idea_receipts`
Proof of demand: 3 DH validation payments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `user_id` | UUID | Foreign key to `secure_users` |
| `type` | TEXT | photo, barid_cash, other |
| `proof_url` | TEXT | URL to receipt image |
| `amount` | NUMERIC(5,2) | Default 3.00 DH |
| `verified` | BOOLEAN | Admin verified |
| `verified_at` | TIMESTAMP | When verified |
| `verified_by` | TEXT | Admin ID |
| `flagged` | BOOLEAN | Fraud detection flag |
| `fraud_score` | NUMERIC(3,2) | Fraud score (0-1) |

**Indexes:**
- `idea_id`
- `verified`
- `flagged` (partial, where flagged = true)

**RLS:** Service role only

---

### Self-Ask Chain

#### `self_ask_questions`
WhatsApp self-ask chain questions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `question_id` | TEXT | q1, q2, etc. |
| `question_order` | INT | Order in sequence |
| `question_text` | TEXT | Darija version |
| `status` | TEXT | asked, answered, skipped |
| `asked_at` | TIMESTAMP | When asked |
| `answered_at` | TIMESTAMP | When answered |

**Indexes:**
- `idea_id`
- `status`
- `idea_id, status` (composite)

**RLS:** Service role only

---

#### `self_ask_responses`
User responses with NLP-extracted data.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `user_id` | UUID | Foreign key to `secure_users` |
| `question_id` | TEXT | q1, q2, etc. |
| `original_text` | TEXT | Original Darija/French/Arabic |
| `extracted_data` | JSONB | Structured data parsed from response |
| `entities` | JSONB | {prices: [], names: [], locations: []} |
| `sentiment` | TEXT | positive, neutral, negative |
| `confidence` | NUMERIC(3,2) | Confidence score (0-1) |
| `language_detected` | TEXT | darija, french, arabic, mixed |

**Indexes:**
- `idea_id`
- `question_id`
- `confidence`
- `idea_id, question_id` (composite)

**RLS:** Service role only

---

### Funding Applications

#### `funding_applications`
Intilaka and other funding application PDFs.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `type` | TEXT | intilaka, other |
| `status` | TEXT | draft, submitted, approved, rejected |
| `pdf_url` | TEXT | URL to generated PDF |
| `pdf_generated_at` | TIMESTAMP | When PDF was generated |
| `application_data` | JSONB | Snapshot of application data |
| `submitted_at` | TIMESTAMP | When submitted |
| `reviewed_at` | TIMESTAMP | When reviewed |
| `funding_amount` | NUMERIC(10,2) | Funding amount if approved |

**Indexes:**
- `idea_id`
- `status`
- `type`

**RLS:** Service role only

---

### Engagement

#### `idea_upvotes`
Community upvotes for ideas.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `user_id` | UUID | Foreign key to `secure_users` (nullable for anonymous) |
| `voter_ip` | TEXT | IP for anonymous upvotes |
| `voter_user_agent` | TEXT | User agent for anonymous upvotes |

**Constraints:**
- Unique on `(idea_id, user_id)` (prevents duplicate upvotes)

**Indexes:**
- `idea_id`
- `created_at` (descending)

**RLS:** Public can read, service role can manage

---

#### `idea_comments`
Comments and discussions on ideas.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `user_id` | UUID | Foreign key to `secure_users` |
| `content` | TEXT | Comment text |
| `comment_type` | TEXT | suggestion, question, concern, support, technical |
| `approved` | BOOLEAN | Moderation status |
| `moderated_by` | TEXT | Admin ID |

**Indexes:**
- `idea_id`
- `approved` (partial, where approved = true)
- `created_at` (descending)

**RLS:** Public can read approved comments, service role can manage

---

#### `problem_validations`
Anonymous "I have this problem too" validations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `validator_ip` | TEXT | IP address |
| `validator_user_agent` | TEXT | User agent |
| `comment` | TEXT | Optional comment |

**Indexes:**
- `idea_id`
- `created_at` (descending)

**RLS:** Public can read, service role can manage

---

### Mentors

#### `mentors`
Mentor profiles for matching.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Mentor name |
| `email` | TEXT | Email (unique) |
| `location` | TEXT | Current location |
| `moroccan_city` | TEXT | Origin city |
| `expertise` | TEXT[] | Array of expertise areas |
| `skills` | TEXT[] | Specific technical skills |
| `years_experience` | INT | Years of experience |
| `willing_to_mentor` | BOOLEAN | Willing to mentor |
| `willing_to_cofund` | BOOLEAN | Willing to co-fund |
| `available_hours_per_month` | INT | Available hours |
| `ideas_matched` | INT | Number of ideas matched |
| `ideas_funded` | INT | Number of ideas funded |

**Indexes:**
- `email` (unique)
- `willing_to_mentor` (partial, where willing_to_mentor = true)
- `expertise` (GIN index for array search)

**RLS:** Service role only

---

#### `mentor_matches`
Mentor-idea matching records.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `idea_id` | UUID | Foreign key to `marrai_ideas` |
| `mentor_id` | UUID | Foreign key to `mentors` |
| `match_score` | NUMERIC(3,2) | Match score (0-1) |
| `match_reason` | TEXT | Why matched |
| `matched_by` | TEXT | admin_id or 'auto' |
| `status` | TEXT | pending, accepted, rejected, active, completed |
| `mentor_response` | TEXT | Mentor's response |
| `started_at` | TIMESTAMP | When mentorship started |
| `success` | BOOLEAN | Led to funding/success |

**Constraints:**
- Unique on `(idea_id, mentor_id)` (one match per idea-mentor pair)

**Indexes:**
- `idea_id`
- `mentor_id`
- `status`

**RLS:** Service role only

---

### Privacy & Consent

#### `consents`
GDPR-compliant consent records (immutable).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `secure_users` |
| `phone_hash` | TEXT | Phone hash for lookup |
| `consent_type` | TEXT | submission, marketing, analysis, data_retention |
| `granted` | BOOLEAN | Consent granted/denied |
| `consent_version` | TEXT | Policy version (e.g., '1.0.0') |
| `consent_method` | TEXT | whatsapp, web, email, phone, in_person, other |
| `ip_address` | TEXT | IP when consent given (GDPR Article 7) |
| `user_agent` | TEXT | User agent when consent given |
| `expires_at` | TIMESTAMP | Optional expiry date |

**Indexes:**
- `user_id`
- `phone_hash`
- `consent_type`
- `user_id, consent_type` (composite)
- `expires_at` (partial, where expires_at IS NOT NULL)

**RLS:** Service role only

**Note:** Never update consents, only insert new records (immutable)

---

#### `deletion_requests`
User data deletion requests with 7-day grace period.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `secure_users` |
| `verification_token` | TEXT | Unique verification token |
| `verified` | BOOLEAN | Verification status |
| `scheduled_deletion_at` | TIMESTAMP | 7 days from request |
| `cancelled` | BOOLEAN | User cancelled |
| `deleted` | BOOLEAN | Actually deleted |
| `deletion_reason` | TEXT | Reason for deletion |

**Indexes:**
- `user_id`
- `verified`
- `scheduled_deletion_at`

**RLS:** Service role only

---

#### `export_requests`
User data export requests (GDPR Article 20).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to `secure_users` |
| `otp_token` | TEXT | Unique OTP token |
| `verified` | BOOLEAN | Verification status |
| `format` | TEXT | json, pdf |
| `download_url` | TEXT | URL to export file |
| `download_token` | TEXT | Single-use download token |
| `expires_at` | TIMESTAMP | 24 hours from request |
| `downloaded` | BOOLEAN | Download completed |

**Indexes:**
- `user_id`
- `verified`
- `expires_at`

**RLS:** Service role only

---

### Admin & Audit

#### `admin_actions`
Audit log of all admin actions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `admin_id` | TEXT | Admin ID |
| `admin_email` | TEXT | Admin email |
| `admin_role` | TEXT | admin, privacy_officer, etc. |
| `action` | TEXT | idea_approved, receipt_verified, user_banned, etc. |
| `entity_type` | TEXT | idea, user, receipt, etc. |
| `entity_id` | UUID | Entity ID |
| `details` | JSONB | Additional details |
| `reason` | TEXT | Required for sensitive actions |
| `ip_address` | TEXT | IP address |
| `two_factor_verified` | BOOLEAN | 2FA verified |

**Indexes:**
- `admin_id`
- `action`
- `entity_type, entity_id` (composite)
- `created_at` (descending)

**RLS:** Service role only

---

#### `audit_logs`
Permanent audit trail of data access.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | User being accessed |
| `action` | TEXT | Action performed |
| `actor` | TEXT | Who performed the action |
| `timestamp` | TIMESTAMP | When action occurred |
| `metadata` | JSONB | Additional metadata |

**Indexes:**
- `user_id`
- `action`
- `timestamp`

**RLS:** Service role only

**Note:** Never delete audit logs (permanent record)

---

## Relationships

```
secure_users
  ├── marrai_ideas (user_id)
  ├── idea_receipts (user_id)
  ├── idea_upvotes (user_id)
  ├── idea_comments (user_id)
  ├── self_ask_responses (user_id)
  ├── consents (user_id)
  ├── deletion_requests (user_id)
  └── export_requests (user_id)

marrai_ideas
  ├── clarity_scores (idea_id)
  ├── decision_scores (idea_id)
  ├── idea_receipts (idea_id)
  ├── self_ask_questions (idea_id)
  ├── self_ask_responses (idea_id)
  ├── funding_applications (idea_id)
  ├── idea_upvotes (idea_id)
  ├── idea_comments (idea_id)
  ├── problem_validations (idea_id)
  └── mentor_matches (idea_id)

mentors
  └── mentor_matches (mentor_id)
```

---

## Indexes Summary

### Performance Indexes
- Foreign keys (all relationships)
- Status/category filters (ideas, receipts, etc.)
- Timestamps (created_at, updated_at)
- Unique constraints (phone_hash, email, etc.)

### Full-Text Search
- GIN index on `marrai_ideas` (title + problem + solution)

### Array Indexes
- GIN indexes on `expertise` arrays (mentors)

### Partial Indexes
- `public` ideas (where public = true)
- `verified` receipts (where verified = true)
- `flagged` receipts (where flagged = true)
- `approved` comments (where approved = true)

---

## Row-Level Security (RLS)

### Public Access
- Read public ideas (`public = true`)
- Read upvotes
- Read approved comments
- Read problem validations

### Service Role Only
- All user data (secure_users, consents, etc.)
- All scoring data
- All receipts
- All admin actions
- All audit logs

### Custom Policies
Adjust RLS policies based on your authentication setup. For production:
1. Implement user-based policies
2. Add admin role checks
3. Restrict public access as needed

---

## Triggers

### Auto-update `updated_at`
All tables with `updated_at` have triggers to automatically update the timestamp on row updates.

**Tables:**
- `secure_users`
- `marrai_ideas`
- `idea_receipts`
- `funding_applications`
- `idea_comments`
- `mentors`
- `mentor_matches`

---

## Views

### `idea_scores`
Combined view of clarity and decision scores for convenience.

**Usage:**
```sql
SELECT * FROM idea_scores WHERE idea_id = '...';
```

---

## Migration & Setup

### 1. Run Migrations
```bash
# In Supabase SQL Editor
-- Run: supabase/migrations/001_complete_idea_bank_schema.sql
```

### 2. Seed Data (Optional)
```bash
# In Supabase SQL Editor
-- Run: supabase/seed.sql
```

### 3. Verify
```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## Best Practices

### 1. Encryption
- Never store plain PII (use `encrypted_name`, `phone_hash`)
- Use AES-256-GCM for encryption
- Use bcrypt for phone number hashing (one-way)

### 2. Soft Deletes
- Always check `deleted_at IS NULL` in queries
- Never hard delete user data (use soft delete)

### 3. Audit Logging
- Log all sensitive actions
- Never delete audit logs
- Include IP address and user agent

### 4. Consent Management
- Never update consents (only insert new records)
- Track policy version
- Store provable consent (IP, user agent)

### 5. Performance
- Use indexes for all foreign keys
- Use partial indexes for filtered queries
- Use GIN indexes for full-text search and arrays

---

## Next Steps

1. **Run migrations** in Supabase SQL Editor
2. **Verify tables** created correctly
3. **Adjust RLS policies** for your authentication setup
4. **Seed test data** (optional)
5. **Update application code** to use new schema

---

## Support

For questions or issues:
- Check Supabase logs
- Review RLS policies
- Verify indexes are created
- Check foreign key constraints

