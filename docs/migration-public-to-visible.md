# Migration: `public` → `visible` Column

## Summary
Replaced the problematic `public` column (PostgreSQL reserved word) with `visible` column throughout the codebase.

## Changes Made

### 1. Database Migration
- **File**: `supabase/migrations/005_add_visible_column.sql`
- Adds `visible BOOLEAN DEFAULT false` column
- Creates index for visible queries

### 2. Seed Data
- **File**: `supabase/seed_example_ideas.sql`
- Changed all `public` references to `visible`
- All example ideas now use `visible = true`

### 3. API Endpoints

#### `app/api/ideas/search/route.ts`
- ✅ Removed `deleted_at` filter
- ✅ Changed filter from `public` to `visible`
- ✅ Updated comments

#### `app/api/ideas/suggestions/route.ts`
- ✅ Removed `public_visibility` filter
- ✅ Added `visible` column to select
- ✅ Filter by `visible !== false` in application layer

### 4. Scripts
- **File**: `supabase/scripts/add_visible_column_and_update.sql`
- Simple script to add column and update existing ideas
- Removed `deleted_at` references

## Removed References

### `deleted_at` Column
- Removed from API search route
- Removed from update scripts
- Note: `deleted_at` may still exist in schema but is not used in ideas filtering

## Usage

### To add the column and update existing ideas:
```sql
ALTER TABLE marrai_ideas 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_marrai_ideas_visible 
  ON marrai_ideas(visible) WHERE visible = true;

UPDATE marrai_ideas 
SET visible = true;
```

### To check visible ideas:
```sql
SELECT id, title, visible 
FROM marrai_ideas 
WHERE visible = true;
```

## Notes
- `Database['public']` references in TypeScript are for the PostgreSQL schema name, not the column - these are correct and should not be changed
- The `visible` column defaults to `false` for new ideas
- Ideas must have `visible = true` to appear in public search

