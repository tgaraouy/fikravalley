-- Quick verification script to check if ideas are public and visible
-- Run this in Supabase SQL Editor to verify your seed data

-- Check all ideas and their public status
-- Note: "public" is a reserved word in PostgreSQL, so we use quotes
SELECT 
  id,
  title,
  status,
  qualification_tier,
  "public",
  opt_in_public,
  deleted_at,
  created_at
FROM marrai_ideas
ORDER BY created_at DESC;

-- Count public vs non-public ideas
SELECT 
  COUNT(*) FILTER (WHERE "public" = true) as public_count,
  COUNT(*) FILTER (WHERE "public" = false OR "public" IS NULL) as private_count,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted_count,
  COUNT(*) as total_count
FROM marrai_ideas;

-- Check if ideas have scores (required for display)
SELECT 
  i.id,
  i.title,
  i."public",
  cs.total as clarity_total,
  ds.total as decision_total,
  (COALESCE(cs.total, 0) + COALESCE(ds.total, 0)) as total_score
FROM marrai_ideas i
LEFT JOIN marrai_clarity_scores cs ON cs.idea_id = i.id
LEFT JOIN marrai_decision_scores ds ON ds.idea_id = i.id
WHERE i."public" = true
ORDER BY i.created_at DESC;

-- Quick fix: Make all example ideas public (if needed)
-- UPDATE marrai_ideas 
-- SET "public" = true, opt_in_public = true 
-- WHERE id IN (
--   '11111111-1111-1111-1111-111111111111',
--   '22222222-2222-2222-2222-222222222222',
--   '33333333-3333-3333-3333-333333333333'
-- );

