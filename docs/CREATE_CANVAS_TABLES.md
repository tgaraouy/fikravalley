# How to Create Canvas Tables

## Quick Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click on **SQL Editor** in the left sidebar

2. **Run the Migration**
   - Open the file: `supabase/migrations/017_add_continuous_innovation_framework.sql`
   - Copy **ALL** the contents
   - Paste into the SQL Editor
   - Click **Run** (or press Ctrl+Enter)

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see these new tables:
     - `marrai_lean_canvas`
     - `marrai_canvas_scores`
     - `marrai_validation_cycles`
     - `marrai_experiments`
     - `marrai_sprint_reviews`
     - `marrai_ai_memory`

### Option 2: Supabase CLI

```bash
# Make sure you're in the project directory
cd marrai-idea-bank

# Run the migration
supabase migration up 017_add_continuous_innovation_framework
```

## What Gets Created

### Tables:
1. **marrai_lean_canvas** - Stores Lean Canvas versions (9 blocks)
2. **marrai_canvas_scores** - Scores across 7 dimensions
3. **marrai_validation_cycles** - 90-day validation cycles
4. **marrai_experiments** - Experiment tracking
5. **marrai_sprint_reviews** - Weekly sprint reviews
6. **marrai_ai_memory** - Vector-encoded AI memory

### Columns Added to marrai_ideas:
- `active_cycle_id` - Reference to active validation cycle
- `current_canvas_id` - Reference to current canvas
- `canvas_score` - Latest overall score

### Functions:
- `get_latest_canvas(idea_id)` - Get latest canvas for an idea
- `get_latest_scores(canvas_id)` - Get latest scores for a canvas
- `search_ai_memory(idea_id, query_embedding, limit)` - Search AI memory

### Indexes:
- Performance indexes on all tables
- Vector similarity index for AI memory

## After Running Migration

Once tables are created, you can:
1. Generate Lean Canvas for any idea
2. View canvas scores
3. Start validation cycles
4. Track experiments

## Troubleshooting

**Error: "relation already exists"**
- Tables already exist, that's OK
- Migration uses `CREATE TABLE IF NOT EXISTS`

**Error: "extension vector does not exist"**
- Enable pgvector extension first:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

**Error: "column already exists"**
- Columns already added to `marrai_ideas`, that's OK
- Migration uses `ADD COLUMN IF NOT EXISTS`

